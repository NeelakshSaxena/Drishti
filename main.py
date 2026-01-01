import os
import json
import sys
import time
import re
from datetime import datetime, timezone, timedelta
from flask import Flask, render_template, request, jsonify
import uuid

# Ensure the 'jules' module can be found
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from geopy.geocoders import Nominatim
import requests

# --- Constants & Configuration ---
app = Flask(__name__, template_folder='templates')
TRIP_INFO_PATH = "logs/trip_info.json"
TRIP_LOG_PATH = "logs/trip_log.json"
AVIATION_STACK_KEY = "ecc682a743872531b0ed8b8bd691b07a"

# Ensure logs directory exists
os.makedirs("logs", exist_ok=True)

# --- Helpers ---
def get_coords(airport_iata):
    """Get coordinates for an airport IATA code using Nominatim."""
    try:
        geolocator = Nominatim(user_agent="jules_tracker")
        location = geolocator.geocode(f"{airport_iata} Airport")
        if location:
            return [location.latitude, location.longitude]
    except Exception as e:
        print(f"Geocoding error for {airport_iata}: {e}")
    return None

# --- Trip Management Endpoints ---

@app.route('/')
def index():
    """Serves the main tracking web page."""
    return render_template('index.html')

@app.route('/verify_flight', methods=['POST'])
def verify_flight():
    data = request.get_json()
    airline_iata = data.get('airline_iata')
    flight_number = data.get('flight_number')

    if not airline_iata or not flight_number:
        return jsonify({"error": "Missing flight details"}), 400

    url = "http://api.aviationstack.com/v1/flights"
    params = {
        "access_key": AVIATION_STACK_KEY,
        "airline_iata": airline_iata,
        "flight_number": flight_number,
        "limit": 1
    }

    try:
        # Note: AviationStack free tier might handle dates differently.
        # For now, we fetch the most recent/scheduled one.
        r = requests.get(url, params=params)
        res_data = r.json()

        if "data" in res_data and res_data["data"]:
            flight = res_data["data"][0]

            # Resolve coordinates
            dep_iata = flight['departure']['iata']
            arr_iata = flight['arrival']['iata']

            dep_coords = get_coords(dep_iata)
            arr_coords = get_coords(arr_iata)

            return jsonify({
                "status": "success",
                "flight_data": flight,
                "coords": {
                    "departure": dep_coords,
                    "arrival": arr_coords
                }
            })
        else:
             return jsonify({"error": "Flight not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/start_trip', methods=['POST'])
def start_trip():
    """Starts or restores a trip."""
    data = request.get_json()

    # Check if restoring a trip
    if not data:
        # Fallback for legacy calls if any
        data = {}

    trip_id = data.get("trip_id") or str(uuid.uuid4())

    # Construct trip info
    trip_info = {
        "trip_id": trip_id,
        "user_name": data.get("user_name", "Traveler"),
        "flight_number": data.get("flight_number", "Unknown"),
        "trip_start_time": data.get("trip_start_time", datetime.now(timezone.utc).isoformat()),
        "trip_status": "active",
        "flight_info": data.get("flight_info", {
             "status": "scheduled",
             "scheduled_departure": datetime.now(timezone.utc).isoformat(),
             "scheduled_arrival": (datetime.now(timezone.utc) + timedelta(hours=2)).isoformat()
        })
    }

    # Save to file
    with open(TRIP_INFO_PATH, "w") as f:
        json.dump(trip_info, f, indent=2)

    # Initialize log if not exists (or reset if new trip)
    # Ideally, if restoring, we might want to keep old logs?
    # But user requirement says "loads the data", usually metadata.
    # If the file is gone (server restart), we start fresh log but keep metadata.
    if not os.path.exists(TRIP_LOG_PATH):
        with open(TRIP_LOG_PATH, "w") as f:
            json.dump({"events": []}, f, indent=2)

    print(f"Trip started/restored for {trip_info['user_name']}.")
    return jsonify(trip_info)

@app.route('/log', methods=['POST'])
def log_location():
    data = request.get_json()
    with open(TRIP_INFO_PATH, "r+") as f_info:
        trip_info = json.load(f_info)
        log_entry = { "lat": data['lat'], "lon": data['lon'], "timestamp": datetime.now(timezone.utc).isoformat(), "source": "web" }
        with open(TRIP_LOG_PATH, "r+") as f_log:
            log_data = json.load(f_log)
            log_data["events"].append(log_entry)
            f_log.seek(0); json.dump(log_data, f_log, indent=2)
    return jsonify({"status": "success"})

@app.route('/end_trip', methods=['POST'])
def end_trip():
    with open(TRIP_INFO_PATH, "r+") as f:
        trip_info = json.load(f)
        trip_info["trip_status"] = "ended"
        trip_info["trip_end_time"] = datetime.now(timezone.utc).isoformat()
        f.seek(0); f.truncate(); json.dump(trip_info, f, indent=2)
    return jsonify(trip_info)

@app.route('/status')
def get_status():
    if not os.path.exists(TRIP_INFO_PATH):
        return jsonify({"trip_status": "none"})
    with open(TRIP_INFO_PATH, "r") as f:
        trip_info = json.load(f)
    return jsonify({
        "trip_status": trip_info.get("trip_status"),
        "flight_status": trip_info.get("flight_info", {}).get("status")
    })

@app.route('/trip_info')
def get_trip_info():
    if os.path.exists(TRIP_INFO_PATH):
        with open(TRIP_INFO_PATH, "r") as f:
            try:
                return jsonify(json.load(f))
            except json.JSONDecodeError:
                pass
    return jsonify({})

@app.route('/trip_log')
def get_trip_log():
    if os.path.exists(TRIP_LOG_PATH):
        with open(TRIP_LOG_PATH, "r") as f:
            try:
                return jsonify(json.load(f))
            except json.JSONDecodeError:
                pass
    return jsonify({})

@app.route('/reset_trip', methods=['POST'])
def reset_trip():
    if os.path.exists(TRIP_INFO_PATH):
        os.remove(TRIP_INFO_PATH)
    if os.path.exists(TRIP_LOG_PATH):
        os.remove(TRIP_LOG_PATH)
    print("Trip data has been reset.")
    return jsonify({"status": "success"})

# --- Time-Based Status Updater ---
def time_based_status_thread():
    print("⏰ Time-based status updater thread started.")
    while True:
        time.sleep(60) # Check every minute
        if not os.path.exists(TRIP_INFO_PATH):
            continue

        with open(TRIP_INFO_PATH, "r+") as f:
            trip_info = json.load(f)
            if trip_info.get("trip_status") != "active":
                continue

            flight_info = trip_info.get("flight_info", {})
            now = datetime.now(timezone.utc)

            dep_time = datetime.fromisoformat(flight_info['scheduled_departure'])
            arr_time = datetime.fromisoformat(flight_info['scheduled_arrival'])
            boarding_time = dep_time - timedelta(minutes=45)

            new_status = flight_info['status']
            if boarding_time <= now < dep_time:
                new_status = 'boarding'
            elif dep_time <= now < arr_time:
                new_status = 'in_flight'
            elif now >= arr_time:
                new_status = 'landed'

            if new_status != flight_info['status']:
                flight_info['status'] = new_status
                trip_info['flight_info'] = flight_info
                f.seek(0); f.truncate(); json.dump(trip_info, f, indent=2)
                print(f"Status updated to: {new_status}")
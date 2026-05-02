import json
import os
import time
import uuid
from datetime import datetime, timedelta, timezone
from math import atan2, cos, radians, sin, sqrt

import geocoder
import requests
from geopy.geocoders import Nominatim

try:
    import folium
except ImportError:
    folium = None

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sync_playwright = None


PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
LOGS_DIR = os.path.join(PROJECT_ROOT, "logs")
DATA_DIR = os.path.join(PROJECT_ROOT, "jules")
ASSETS_DIR = os.path.join(PROJECT_ROOT, "dashboard", "assets")

TRIP_INFO_PATH = os.path.join(LOGS_DIR, "trip_info.json")
TRIP_LOG_PATH = os.path.join(LOGS_DIR, "trip_log.json")
SESSION_LOG_PATH = os.path.join(LOGS_DIR, "session_log.json")
AIRPORTS_FILE = os.path.join(DATA_DIR, "airports.json")
MAP_HTML_PATH = os.path.join(LOGS_DIR, "temp_trip_map.html")
MAP_IMAGE_PATH = os.path.join(LOGS_DIR, "final_trip_map.png")

AVIATION_STACK_KEY = os.getenv("AVIATION_STACK_KEY", "ecc682a743872531b0ed8b8bd691b07a")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")


def read_json_file(path, default=None):
    if default is None:
        default = {}

    if not os.path.exists(path):
        return default

    try:
        with open(path, "r") as f:
            return json.load(f)
    except json.JSONDecodeError:
        return default


def write_json_file(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, indent=2)


def load_json_from_backend(endpoint, backend_url=BACKEND_URL):
    try:
        resp = requests.get(f"{backend_url}/{endpoint}")
        if resp.ok:
            return resp.json()
    except requests.exceptions.RequestException:
        pass
    return {}


def to_ist(utc_dt_str):
    try:
        utc_dt = datetime.fromisoformat(utc_dt_str.replace("Z", "+00:00"))
        ist_dt = utc_dt.astimezone(timezone(timedelta(hours=5, minutes=30)))
        return ist_dt.strftime("%Y-%m-%d %H:%M:%S IST")
    except (ValueError, TypeError):
        return "N/A"


def extract_event_coords(events):
    return [(e["lat"], e["lon"]) for e in events if "lat" in e and "lon" in e]


def get_dashboard_display_status(trip_info):
    status_map = {
        "active": ("Tracking Active", os.path.join(ASSETS_DIR, "online.gif")),
        "ended": ("Trip Ended", os.path.join(ASSETS_DIR, "offline.gif")),
        "boarding": ("Boarding", None),
        "in_flight": ("In Flight", os.path.join(ASSETS_DIR, "airplane.gif")),
        "landed": ("Landed", os.path.join(ASSETS_DIR, "online.gif")),
        "home": ("Home", os.path.join(ASSETS_DIR, "home.gif")),
        "scheduled": ("Flight Scheduled", None),
    }

    trip_status = trip_info.get("trip_status", "ended")
    flight_status = trip_info.get("flight_info", {}).get("status")

    display_status = trip_status
    if flight_status == "in_flight":
        display_status = "in_flight"
    elif trip_info.get("current_tracking_status") == "idle" and trip_status == "active":
        display_status = "ended"

    return status_map.get(display_status, ("Unknown", None))


def get_segment_icon(segment_type):
    return "flight" if segment_type == "flight" else ("train" if segment_type == "train" else "car")


def get_segment_status_label(status):
    return "active" if status == "active" else ("completed" if status == "completed" else "pending")


def get_segment_details(segment):
    if segment["type"] == "flight" and segment.get("verifiedData"):
        flight = segment["verifiedData"]["flight_data"]
        return f"{flight['departure']['iata']} -> {flight['arrival']['iata']}"

    details = segment.get("details", {})
    return f"{details.get('from', '?')} -> {details.get('to', '?')}"


def build_itinerary_items(segments):
    items = []
    for index, segment in enumerate(segments):
        items.append(
            {
                "index": index,
                "type": segment["type"],
                "icon": get_segment_icon(segment["type"]),
                "status": get_segment_status_label(segment["status"]),
                "details": get_segment_details(segment),
                "show_connector": index < len(segments) - 1,
            }
        )
    return items


def get_coords(airport_iata):
    try:
        geolocator = Nominatim(user_agent="jules_tracker")
        location = geolocator.geocode(f"{airport_iata} Airport")
        if location:
            return [location.latitude, location.longitude]
    except Exception as e:
        print(f"Geocoding error for {airport_iata}: {e}")
    return None


def verify_flight_data(data, aviation_stack_key=AVIATION_STACK_KEY):
    airline_iata = data.get("airline_iata")
    flight_number = data.get("flight_number")
    flight_date = data.get("flight_date")

    if not airline_iata or not flight_number:
        return {"error": "Missing flight details"}, 400

    url = "http://api.aviationstack.com/v1/flights"
    params = {
        "access_key": aviation_stack_key,
        "airline_iata": airline_iata,
        "flight_number": flight_number,
        "limit": 1,
    }

    if flight_date:
        params["flight_date"] = flight_date

    try:
        response = requests.get(url, params=params)
        res_data = response.json()

        if "data" in res_data and res_data["data"]:
            flight = res_data["data"][0]
            dep_iata = flight["departure"]["iata"]
            arr_iata = flight["arrival"]["iata"]

            return {
                "status": "success",
                "flight_data": flight,
                "coords": {
                    "departure": get_coords(dep_iata),
                    "arrival": get_coords(arr_iata),
                },
            }, 200

        return {"error": "Flight not found"}, 404

    except Exception as e:
        return {"error": str(e)}, 500


def build_trip_info(data):
    if not data:
        data = {}

    trip_id = data.get("trip_id") or str(uuid.uuid4())
    segments = data.get("segments", [])

    if not segments and data.get("flight_info"):
        segments.append(
            {
                "type": "flight",
                "status": "active",
                "details": {
                    "flight_number": data.get("flight_number"),
                    "info": data.get("flight_info"),
                },
            }
        )

    return {
        "trip_id": trip_id,
        "user_name": data.get("user_name", "Traveler"),
        "trip_mode": data.get("trip_mode", "on_trip"),
        "trip_start_time": data.get("trip_start_time", datetime.now(timezone.utc).isoformat()),
        "trip_status": "active",
        "segments": segments,
        "flight_info": data.get("flight_info", {}),
    }


def start_trip(data, trip_info_path=TRIP_INFO_PATH, trip_log_path=TRIP_LOG_PATH):
    trip_info = build_trip_info(data)
    write_json_file(trip_info_path, trip_info)

    if not os.path.exists(trip_log_path):
        write_json_file(trip_log_path, {"events": []})

    print(f"Trip started/restored for {trip_info['user_name']}.")
    return trip_info


def update_segment_status(data, trip_info_path=TRIP_INFO_PATH):
    segment_index = data.get("segment_index")
    new_status = data.get("status")

    if segment_index is None or not new_status:
        return {"error": "Missing parameters"}, 400

    if not os.path.exists(trip_info_path):
        return {"error": "No active trip"}, 404

    trip_info = read_json_file(trip_info_path, {})
    segments = trip_info.get("segments", [])

    if 0 <= segment_index < len(segments):
        segments[segment_index]["status"] = new_status

        if new_status == "active":
            for i, segment in enumerate(segments):
                if i != segment_index and segment["status"] == "active":
                    segment["status"] = "completed"

        trip_info["segments"] = segments
        write_json_file(trip_info_path, trip_info)
        return {"status": "success", "segments": segments}, 200

    return {"error": "Invalid segment index"}, 400


def log_location(data, trip_info_path=TRIP_INFO_PATH, trip_log_path=TRIP_LOG_PATH):
    read_json_file(trip_info_path, {})
    log_entry = {
        "lat": data["lat"],
        "lon": data["lon"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source": "web",
    }

    log_data = read_json_file(trip_log_path, {"events": []})
    log_data["events"].append(log_entry)
    write_json_file(trip_log_path, log_data)
    return {"status": "success"}


def end_trip(trip_info_path=TRIP_INFO_PATH):
    trip_info = read_json_file(trip_info_path, {})
    trip_info["trip_status"] = "ended"
    trip_info["trip_end_time"] = datetime.now(timezone.utc).isoformat()
    write_json_file(trip_info_path, trip_info)
    return trip_info


def get_status(trip_info_path=TRIP_INFO_PATH):
    if not os.path.exists(trip_info_path):
        return {"trip_status": "none"}

    trip_info = read_json_file(trip_info_path, {})
    return {
        "trip_status": trip_info.get("trip_status"),
        "flight_status": trip_info.get("flight_info", {}).get("status"),
    }


def get_trip_info(trip_info_path=TRIP_INFO_PATH):
    return read_json_file(trip_info_path, {})


def get_trip_log(trip_log_path=TRIP_LOG_PATH):
    return read_json_file(trip_log_path, {})


def reset_trip(trip_info_path=TRIP_INFO_PATH, trip_log_path=TRIP_LOG_PATH):
    if os.path.exists(trip_info_path):
        os.remove(trip_info_path)
    if os.path.exists(trip_log_path):
        os.remove(trip_log_path)
    print("Trip data has been reset.")
    return {"status": "success"}


def calculate_flight_status(flight_info, now=None):
    if now is None:
        now = datetime.now(timezone.utc)

    dep_time = datetime.fromisoformat(flight_info["scheduled_departure"])
    arr_time = datetime.fromisoformat(flight_info["scheduled_arrival"])
    boarding_time = dep_time - timedelta(minutes=45)

    new_status = flight_info["status"]
    if boarding_time <= now < dep_time:
        new_status = "boarding"
    elif dep_time <= now < arr_time:
        new_status = "in_flight"
    elif now >= arr_time:
        new_status = "landed"

    return new_status


def update_time_based_status_once(trip_info_path=TRIP_INFO_PATH):
    if not os.path.exists(trip_info_path):
        return None

    trip_info = read_json_file(trip_info_path, {})
    if trip_info.get("trip_status") != "active":
        return None

    flight_info = trip_info.get("flight_info", {})
    new_status = calculate_flight_status(flight_info)

    if new_status != flight_info["status"]:
        flight_info["status"] = new_status
        trip_info["flight_info"] = flight_info
        write_json_file(trip_info_path, trip_info)
        print(f"Status updated to: {new_status}")

    return trip_info


def time_based_status_loop(interval=60, trip_info_path=TRIP_INFO_PATH):
    print("Time-based status updater thread started.")
    while True:
        time.sleep(interval)
        update_time_based_status_once(trip_info_path)


def haversine_distance(lat1, lon1, lat2, lon2):
    radius_km = 6371

    lat1_rad, lon1_rad = radians(lat1), radians(lon1)
    lat2_rad, lon2_rad = radians(lat2), radians(lon2)

    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad

    a = sin(dlat / 2) ** 2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return radius_km * c


def load_airports(airports_file=AIRPORTS_FILE):
    if not os.path.exists(airports_file):
        return []

    with open(airports_file, "r") as f:
        return json.load(f)


def check_airport_proximity(user_lat, user_lon, airports_file=AIRPORTS_FILE):
    for airport in load_airports(airports_file):
        distance = haversine_distance(user_lat, user_lon, airport["lat"], airport["lon"])
        if distance <= airport["radius_km"]:
            return airport

    return None


def get_airport_coords(iata_code, airports_file=AIRPORTS_FILE):
    for airport in load_airports(airports_file):
        if airport["iata"] == iata_code:
            return (airport["lat"], airport["lon"])

    return None


def get_location():
    location = geocoder.ip("me")
    return {"lat": location.latlng[0], "lon": location.latlng[1]}


def load_session_data(log_file_path=SESSION_LOG_PATH):
    if os.path.exists(log_file_path) and os.path.getsize(log_file_path) > 0:
        try:
            with open(log_file_path, "r") as f:
                return json.load(f)
        except json.JSONDecodeError:
            return {"events": []}

    return {"events": []}


def log_location_snapshot(session_data, log_file_path=SESSION_LOG_PATH):
    location = get_location()
    if location and location.get("lat") is not None:
        location["timestamp"] = datetime.utcnow().isoformat() + "Z"
        session_data["events"].append(location)
        write_json_file(log_file_path, session_data)
        print(f"Logged: {location}")
        return location

    print("Failed to fetch location.")
    return None


def start_tracking(interval=300, log_file_path=SESSION_LOG_PATH):
    os.makedirs(os.path.dirname(log_file_path), exist_ok=True)
    session_data = load_session_data(log_file_path)

    while True:
        try:
            log_location_snapshot(session_data, log_file_path)
        except Exception as e:
            print(f"An error occurred: {e}")

        time.sleep(interval)


def generate_trip_map(events, map_html_path=MAP_HTML_PATH):
    if folium is None:
        raise ImportError("folium is required to generate trip maps")

    if not events:
        return None

    ground_coords = [(e["lat"], e["lon"]) for e in events if e.get("source") == "web"]
    flight_coords = [(e["lat"], e["lon"]) for e in events if e.get("source") == "flight"]

    trip_map = folium.Map(location=(events[-1]["lat"], events[-1]["lon"]), zoom_start=6)

    if ground_coords:
        folium.PolyLine(
            ground_coords,
            color="#3498db",
            weight=5,
            opacity=0.8,
            popup="Ground Path",
        ).add_to(trip_map)

    if flight_coords:
        folium.PolyLine(
            flight_coords,
            color="#f39c12",
            weight=4,
            opacity=0.9,
            dash_array="10, 5",
            popup="Flight Path",
        ).add_to(trip_map)

    folium.Marker(
        location=(events[0]["lat"], events[0]["lon"]),
        popup="Trip Start",
        icon=folium.Icon(color="green", icon="play"),
    ).add_to(trip_map)
    folium.Marker(
        location=(events[-1]["lat"], events[-1]["lon"]),
        popup="Trip End",
        icon=folium.Icon(color="red", icon="stop"),
    ).add_to(trip_map)

    bounds = trip_map.get_bounds()
    trip_map.fit_bounds(bounds, padding=(50, 50))

    trip_map.save(map_html_path)
    return map_html_path


def capture_map_screenshot(html_path, map_image_path=MAP_IMAGE_PATH):
    if sync_playwright is None:
        raise ImportError("playwright is required to capture map screenshots")

    if not html_path or not os.path.exists(html_path):
        return None

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f"file://{os.path.abspath(html_path)}")
        page.wait_for_timeout(5000)
        page.screenshot(path=map_image_path, full_page=True)
        browser.close()

    os.remove(html_path)

    print(f"Map image saved to {map_image_path}")
    return map_image_path

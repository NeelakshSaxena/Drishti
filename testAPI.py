import requests
import json
import os

def get_flight_data():
    url = "https://api.aviationstack.com/v1/flightsFuture"
    params = {
        "access_key": "ADD YOUR KEY HERE",
        "airline_iata": "6E",
        "flight_number": "325",
        "flight_date": "2026-01-05"
    }

    fallback_file = "fallback_flight.json"

    try:
        r = requests.get(url, params=params)
        data = r.json()
        if "error" in data:
            print("⚠️ Using fallback data:", data["error"]["message"])
            if os.path.exists(fallback_file):
                return json.load(open(fallback_file))
            else:
                print("⚠️ No fallback file found.")
                return None
        return data

    except Exception as e:
        print("⚠️ Request failed, using fallback:", e)
        if os.path.exists(fallback_file):
            return json.load(open(fallback_file))
        else:
            print("⚠️ No fallback file found.")
            return None


flight = get_flight_data()
if flight:
    print("✅ Flight data loaded successfully.")
    print(json.dumps(flight, indent=4))
else:
    print("❌ Could not retrieve flight data.")

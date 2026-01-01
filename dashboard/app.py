import streamlit as st
from streamlit_autorefresh import st_autorefresh
import json
import folium
from streamlit_folium import st_folium
import os
import requests
from datetime import datetime, timezone, timedelta
import qrcode
from io import BytesIO

# --- Page Configuration ---
st.set_page_config(
    page_title="Jules Tracker | Project Sanjaya",
    page_icon="🛰️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- Constants ---
# Use public URL or fallback to localhost for local dev
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")

# Assets folder
ASSETS_PATH = os.path.join(os.path.dirname(__file__), 'assets')

# --- Helper Functions ---
def load_json_from_backend(endpoint):
    """Fetch JSON data from Flask backend"""
    try:
        resp = requests.get(f"{BACKEND_URL}/{endpoint}")
        if resp.ok:
            return resp.json()
    except requests.exceptions.RequestException:
        pass
    return {}

def to_ist(utc_dt_str):
    """Convert UTC isoformat string to IST"""
    try:
        utc_dt = datetime.fromisoformat(utc_dt_str.replace("Z", "+00:00"))
        ist_dt = utc_dt.astimezone(timezone(timedelta(hours=5, minutes=30)))
        return ist_dt.strftime('%Y-%m-%d %H:%M:%S IST')
    except (ValueError, TypeError):
        return "N/A"

# --- Main Dashboard ---
st.title("🛰️ Jules Tracker — Project Sanjaya")
st.markdown("Live trip tracking with automated flight detection and multi-segment journey support.")

# --- Auto-refresh for active monitoring ---
trip_info = load_json_from_backend("trip_info")
if not trip_info or trip_info.get("trip_status") == "active":
    st_autorefresh(interval=20 * 1000, key="dashboard_refresh")

trip_log = load_json_from_backend("trip_log")
events = trip_log.get("events", [])
coords = [(e["lat"], e["lon"]) for e in events if "lat" in e and "lon" in e]

# --- Sidebar ---
st.sidebar.title("Trip Details")

if not trip_info:
    st.sidebar.warning("No active trip. Start a new trip from the web link below.")
else:
    status_map = {
        "active": ("Tracking Active", os.path.join(ASSETS_PATH, 'online.gif')),
        "ended": ("Trip Ended", os.path.join(ASSETS_PATH, 'offline.gif')),
        "boarding": ("Boarding", None),
        "in_flight": ("In Flight", os.path.join(ASSETS_PATH, 'airplane.gif')),
        "landed": ("Landed", os.path.join(ASSETS_PATH, 'online.gif')),
        "home": ("Home", os.path.join(ASSETS_PATH, 'home.gif')),
        "scheduled": ("Flight Scheduled", None)
    }

    trip_status = trip_info.get("trip_status", "ended")
    flight_status = trip_info.get("flight_info", {}).get("status")

    display_status = trip_status
    if flight_status == 'in_flight':
        display_status = 'in_flight'
    elif trip_info.get('current_tracking_status') == 'idle' and trip_status == 'active':
        display_status = 'ended'

    status_text, status_gif_path = status_map.get(display_status, ("Unknown", None))

    st.sidebar.metric("Status", status_text)
    if status_gif_path and os.path.exists(status_gif_path):
        st.sidebar.image(status_gif_path)

    st.sidebar.subheader(f"👋 {trip_info.get('user_name', 'Guest')}")
    st.sidebar.write(f"**Trip Mode:** {trip_info.get('trip_mode', 'on_trip').replace('_', ' ').title()}")
    st.sidebar.write(f"**Trip Started:** {to_ist(trip_info.get('trip_start_time'))}")

    # --- Itinerary Timeline ---
    st.sidebar.subheader("📍 Itinerary")
    segments = trip_info.get("segments", [])

    for i, seg in enumerate(segments):
        icon = "✈️" if seg['type'] == 'flight' else ("🚆" if seg['type'] == 'train' else "🚖")
        status_icon = "🟢" if seg['status'] == 'active' else ("✅" if seg['status'] == 'completed' else "⚪")

        details = ""
        if seg['type'] == 'flight' and seg.get('verifiedData'):
             f = seg['verifiedData']['flight_data']
             details = f"{f['departure']['iata']} ➝ {f['arrival']['iata']}"
        else:
             details = f"{seg.get('details', {}).get('from', '?')} ➝ {seg.get('details', {}).get('to', '?')}"

        st.sidebar.markdown(f"{status_icon} **{icon} {seg['type'].title()}**")
        st.sidebar.caption(details)
        if i < len(segments) - 1:
            st.sidebar.markdown("⬇️")

# --- Map Visualization ---
st.header("Live Journey Map")

if not coords:
    st.info("No location data yet for this trip.")
    m = folium.Map(location=[20.5937, 78.9629], zoom_start=5)
else:
    m = folium.Map(location=coords[-1], zoom_start=13, tiles="CartoDB positron")

    # Draw user path (blue line)
    folium.PolyLine(coords, color="#3498db", weight=5, popup="Tracked Path").add_to(m)

    # Draw Scheduled Segments (if coords available)
    segments = trip_info.get("segments", [])
    for seg in segments:
        if seg['type'] == 'flight' and seg.get('verifiedData'):
            origin = seg['verifiedData']['coords']['departure']
            dest = seg['verifiedData']['coords']['arrival']

            if origin and dest:
                color = "#f39c12" if seg['status'] == 'active' else ("#2ecc71" if seg['status'] == 'completed' else "#95a5a6")
                folium.PolyLine([origin, dest], color=color, weight=3, dash_array='10, 5', popup=f"Flight: {seg['type']}").add_to(m)
                folium.Marker(location=origin, popup="Origin", icon=folium.Icon(color='blue', icon='plane', prefix='fa')).add_to(m)
                folium.Marker(location=dest, popup="Dest", icon=folium.Icon(color='blue', icon='flag', prefix='fa')).add_to(m)

    folium.Marker(location=coords[0], popup="Trip Start", icon=folium.Icon(color='green', icon='play')).add_to(m)
    folium.Marker(location=coords[-1], popup=f"Last Location\n{to_ist(events[-1]['timestamp'])}", icon=folium.Icon(color='red', icon='user')).add_to(m)
    m.fit_bounds(m.get_bounds(), padding=(50, 50))

st_folium(m, width="100%", height=500)

# --- Summary & Data ---
MAP_IMAGE_FILE = os.path.join(ASSETS_PATH, "final_trip_map.png")
if trip_info.get('trip_status') == 'ended':
    st.header("Trip Summary")
    if os.path.exists(MAP_IMAGE_FILE):
        st.image(MAP_IMAGE_FILE, caption="Final Trip Map")
    else:
        st.warning("Final map image not generated yet.")

with st.expander("Show Raw Log Data"):
    st.json(trip_log)
with st.expander("Show Trip Info"):
    st.json(trip_info)

# --- Sidebar Bottom ---
st.sidebar.markdown("---")
PUBLIC_TRACKING_URL = os.getenv("PUBLIC_TRACKING_URL", BACKEND_URL)
st.sidebar.subheader("📲 Your Public Tracking Link")
st.sidebar.code(PUBLIC_TRACKING_URL)
qr_img = qrcode.make(PUBLIC_TRACKING_URL)
buf = BytesIO()
qr_img.save(buf, format="PNG")
st.sidebar.image(buf, width=200, caption="Scan to open tracking page")
st.sidebar.markdown("---")

# --- Admin Actions ---
is_admin = st.query_params.get("a") == "neelaksh"

if is_admin:
    st.sidebar.subheader("Admin Actions")
    if st.sidebar.button("🗑️ Reset Trip Data"):
        try:
            response = requests.post(f"{BACKEND_URL}/reset_trip")
            if response.ok:
                st.sidebar.success("Trip data has been reset!")
                st.experimental_rerun()
            else:
                st.sidebar.error("Failed to reset trip.")
        except requests.exceptions.ConnectionError:
            st.sidebar.error("Could not connect to the backend.")
else:
    st.sidebar.info("Add `?a=neelaksh` to the URL for admin actions like resetting a trip.")

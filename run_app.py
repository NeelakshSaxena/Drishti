import subprocess
import sys
import time
import atexit
import os
import threading
from pyngrok import ngrok, conf

# Import background thread functions
from main import time_based_status_thread

# --- Configuration ---
FLASK_PORT = 5000
STREAMLIT_PORT = 8501
WAITRESS_THREADS = 8
FLASK_APP_MODULE = "main:app"
STREAMLIT_APP_FILE = "dashboard/app.py"
NGROK_CONFIG_FILE = "ngrok.yml"

# --- Global Process Management ---
processes = []
ngrok_tunnel = None


def cleanup():
    """Ensure all child processes and ngrok tunnels are terminated on exit."""
    print("Shutting down all services...")
    for p in processes:
        if p.poll() is None:
            p.terminate()
            p.wait()
    if ngrok_tunnel:
        ngrok.disconnect(ngrok_tunnel.public_url)
    print("All services stopped.")


atexit.register(cleanup)


def run():
    env = os.getenv("ENV", "local").lower()
    print(f"🚀 Launching Project Sanjaya ({env.title()} Mode)...")

    # --- Start Waitress Server ---
    try:
        waitress_process = subprocess.Popen([
            "waitress-serve", f"--threads={WAITRESS_THREADS}",
            "--host=0.0.0.0", f"--port={FLASK_PORT}", FLASK_APP_MODULE
        ])
        processes.append(waitress_process)
        print(f"✅ Waitress server started with PID: {waitress_process.pid}")
    except Exception as e:
        print(f"❌ Failed to start Waitress: {e}")
        sys.exit(1)

    # --- Start Background Thread ---
    status_updater = threading.Thread(target=time_based_status_thread, daemon=True)
    status_updater.start()
    print("✅ Time-based status updater thread started.")

    # --- LOCAL MODE ---
    if env == "local":
        try:
            conf.get_default().config_path = os.path.join(
                os.path.dirname(os.path.abspath(__file__)),
                NGROK_CONFIG_FILE
            )
            print("Starting ngrok tunnel for tracking link...")
            global ngrok_tunnel
            ngrok_tunnel = ngrok.connect(FLASK_PORT, "http")
            public_url = ngrok_tunnel.public_url

            print("=" * 60)
            print(f"📲 YOUR PUBLIC TRACKING URL: {public_url}")
            print(f"🖥️  YOUR LOCAL DASHBOARD URL: http://localhost:{STREAMLIT_PORT}")
            print("=" * 60)
        except Exception as e:
            print(f"❌ Failed to start ngrok tunnel: {e}")
            public_url = f"http://localhost:{FLASK_PORT}"

        # Start Streamlit
        try:
            print("Starting Streamlit dashboard...")
            streamlit_process = subprocess.Popen(
                [sys.executable, "-m", "streamlit", "run", STREAMLIT_APP_FILE,
                 "--server.port", str(STREAMLIT_PORT), "--", public_url]
            )
            processes.append(streamlit_process)
            print(f"✅ Streamlit dashboard started with PID: {streamlit_process.pid}")
        except Exception as e:
            print(f"❌ Failed to start Streamlit dashboard: {e}")

    # --- RENDER MODE ---
    elif env == "render":
        # On Render, no ngrok or Streamlit.
        # Render provides its own public URL and handles the frontend separately.
        print("=" * 60)
        print(f"🌐 Render public URL is auto-managed by Render.")
        print(f"🖥️  Streamlit dashboard not started in this mode.")
        print("=" * 60)

    print("\n🎉 Project Sanjaya is running!")
    print("Press Ctrl+C in this window to stop all services.")

    try:
        waitress_process.wait()
    except KeyboardInterrupt:
        print("\n🛑 Ctrl+C received.")
        sys.exit(0)


if __name__ == "__main__":
    run()

import subprocess
import sys
import time
import atexit
import os
import threading
from pyngrok import ngrok, conf
from main import time_based_status_thread

# --- Configuration ---
FLASK_PORT = 5000
STREAMLIT_PORT = 8501
WAITRESS_THREADS = 8
FLASK_APP_MODULE = "main:app"
STREAMLIT_APP_FILE = "dashboard/app.py"
NGROK_CONFIG_FILE = "ngrok.yml"

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
        try:
            ngrok.disconnect(ngrok_tunnel.public_url)
        except Exception:
            pass
    print("All services stopped.")


atexit.register(cleanup)


def run():
    env = os.getenv("ENV", "local").lower()
    print(f"🚀 Launching Project Sanjaya ({env.title()} Mode)...")

    # --- Start Flask (Waitress) server ---
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

    # --- Start background thread ---
    status_updater = threading.Thread(target=time_based_status_thread, daemon=True)
    status_updater.start()
    print("✅ Time-based status updater thread started.")

    # --- LOCAL MODE ---
    if env == "local":
        try:
            # Start Streamlit first (for ngrok to connect to it)
            print("Starting Streamlit dashboard...")
            streamlit_process = subprocess.Popen(
                [sys.executable, "-m", "streamlit", "run", STREAMLIT_APP_FILE,
                 "--server.port", str(STREAMLIT_PORT)]
            )
            processes.append(streamlit_process)
            print(f"✅ Streamlit dashboard started with PID: {streamlit_process.pid}")

            # Wait a moment for Streamlit to spin up
            time.sleep(5)

            # Configure and start ngrok for Streamlit (not Flask)
            conf.get_default().config_path = os.path.join(
                os.path.dirname(os.path.abspath(__file__)),
                NGROK_CONFIG_FILE
            )
            print("Starting ngrok tunnel for Streamlit dashboard...")
            global ngrok_tunnel
            ngrok_tunnel = ngrok.connect(STREAMLIT_PORT, "http")
            public_url = ngrok_tunnel.public_url

            print("=" * 60)
            print(f"📲 YOUR PUBLIC TRACKING URL (Streamlit): {public_url}")
            print(f"🖥️  YOUR LOCAL BACKEND URL: http://localhost:{FLASK_PORT}")
            print("=" * 60)
        except Exception as e:
            print(f"❌ Failed to start ngrok tunnel: {e}")
            public_url = f"http://localhost:{STREAMLIT_PORT}"

    # --- RENDER MODE ---
    elif env == "render":
        # No ngrok — Render manages the external URL automatically.
        try:
            print("Starting Streamlit dashboard (Render mode)...")
            streamlit_process = subprocess.Popen(
                [sys.executable, "-m", "streamlit", "run", STREAMLIT_APP_FILE,
                 "--server.port", str(STREAMLIT_PORT)]
            )
            processes.append(streamlit_process)
            print(f"✅ Streamlit dashboard started with PID: {streamlit_process.pid}")
        except Exception as e:
            print(f"❌ Failed to start Streamlit on Render: {e}")

        print("=" * 60)
        print(f"🌐 Render public URL is auto-managed by Render.")
        print(f"📲 Streamlit dashboard running internally on port {STREAMLIT_PORT}.")
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

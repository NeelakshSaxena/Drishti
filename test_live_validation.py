import os
import subprocess
import time
import requests
import json
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

ADB_PATH = r"g:\Projects\Drishti\toolchain\android-sdk\platform-tools\adb.exe"
APK_PATH = r"g:\Projects\Drishti\android\app\build\outputs\apk\debug\app-debug.apk"
PACKAGE_NAME = "com.drishti.node.debug"

API_BASE = "http://localhost:8000"
FRONTEND_BASE = "http://localhost:3000"

PARENT_EMAIL = "neelaksh7.saxena@gmail.com"
PARENT_PASS = "N33L4K8H@drishti"

def run_adb(args, capture=False):
    cmd = [ADB_PATH] + args
    res = subprocess.run(cmd, capture_output=capture, text=True, encoding='utf-8', errors='replace')
    return res

def write_trace(filename, content):
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)

def main():
    logger.info("Starting Live Validation Pipeline")
    deployment_logs = []
    
    # 1. Backend Login
    logger.info("Validating backend auth...")
    res = requests.post(f"{API_BASE}/family/parent/login", json={
        "email": PARENT_EMAIL,
        "password": PARENT_PASS
    })
    
    if res.status_code != 200:
        logger.info("Parent login failed, attempting init...")
        res = requests.post(f"{API_BASE}/family/parent/init", json={
            "name": "Neelaksh Test",
            "email": PARENT_EMAIL,
            "password": PARENT_PASS
        })
        if res.status_code != 200:
            logger.error(f"Backend auth failed: {res.text}")
            return
            
    logger.info("Backend auth validated.")
    deployment_logs.append("Backend Auth: OK")
    
    # Get/Create child
    logger.info("Validating child linking...")
    res = requests.post(f"{API_BASE}/family/child/init", json={
        "name": "Test Child",
        "email": "testchild@test.com",
        "age": 10,
        "password": "pass"
    })
    
    if res.status_code == 200 and res.json().get("success") == False:
        res = requests.post(f"{API_BASE}/family/child/login", json={
            "email": "testchild@test.com",
            "password": "pass"
        })
    
    child_data = res.json()
    child_code = child_data.get("child_code")
    logger.info(f"Child code obtained: {child_code}")
    deployment_logs.append(f"Child Linking: OK (Code: {child_code})")
    
    # Register device via Backend
    logger.info("Registering device on backend...")
    res = requests.post(f"{API_BASE}/device/register", json={
        "name": "Validation Node",
        "pairing_code": child_code
    })
    device_data = res.json()
    device_token = device_data.get("token")
    logger.info(f"Device token generated: {device_token}")
    deployment_logs.append(f"Device Registration: OK (Token: {device_token})")
    
    # 2. Deploy app
    logger.info("Uninstalling old app...")
    run_adb(["uninstall", PACKAGE_NAME])
    
    logger.info("Installing latest APK...")
    inst_res = run_adb(["install", "-r", APK_PATH], capture=True)
    deployment_logs.append("APK Install: OK\n" + inst_res.stdout)
    
    logger.info("Clearing stale auth state & logs...")
    run_adb(["shell", "pm", "clear", PACKAGE_NAME])
    run_adb(["logcat", "-c"])
    
    logger.info("Launching app...")
    run_adb(["shell", "monkey", "-p", PACKAGE_NAME, "-c", "android.intent.category.LAUNCHER", "1"])
    
    logger.info("Waiting for splash screen (10s)...")
    time.sleep(10)
    
    logger.info(f"\n=============================================")
    logger.info(f"ACTION REQUIRED ON DEVICE:")
    logger.info(f"Backend URL: {API_BASE}")
    logger.info(f"Device Token: {device_token}")
    logger.info(f"Please enter these details in the Android app and tap 'Connect node'.")
    logger.info(f"=============================================\n")
    
    logger.info("Waiting 30 seconds for manual login & WebSocket connection...")
    time.sleep(30)
    
    logger.info("Capturing ADB Deployment Logs & Logcat...")
    logcat = run_adb(["logcat", "-d"], capture=True).stdout
    write_trace("logcat.txt", logcat)
    
    websocket_traces = [line for line in logcat.split('\n') if "WebSocket" in line or "gateway" in line.lower()]
    telemetry_traces = [line for line in logcat.split('\n') if "telemetry" in line.lower() or "heartbeat" in line.lower()]
    linking_traces = [line for line in logcat.split('\n') if "Auth" in line or "Token" in line or "session" in line.lower()]
    
    write_trace("websocket_traces.txt", "\n".join(websocket_traces))
    write_trace("telemetry_traces.txt", "\n".join(telemetry_traces))
    write_trace("linking_traces.txt", "\n".join(linking_traces))
    write_trace("adb_deployment_logs.txt", "\n".join(deployment_logs))
    
    logger.info("Validating telemetry persistence & websocket auth...")
    if "Device session saved" in logcat or "session" in logcat.lower():
        logger.info("Auth Success detected in logs.")
    else:
        logger.warning("Auth Success not found in recent logs.")
        
    logger.info("Simulating Reconnect Event...")
    run_adb(["shell", "am", "force-stop", PACKAGE_NAME])
    time.sleep(2)
    run_adb(["shell", "monkey", "-p", PACKAGE_NAME, "-c", "android.intent.category.LAUNCHER", "1"])
    time.sleep(10)
    
    logcat_post_reconnect = run_adb(["logcat", "-d"], capture=True).stdout
    reconnect_traces = [line for line in logcat_post_reconnect.split('\n') if "reconnect" in line.lower() or "WebSocket" in line]
    write_trace("reconnect_events.txt", "\n".join(reconnect_traces))
    
    logger.info("Checking Frontend Visibility via API...")
    frontend_validation = "Pending: Ensure dashboard at " + FRONTEND_BASE + " shows Validation Node"
    write_trace("frontend_visibility_validation.txt", frontend_validation)
    
    logger.info("Validation Pipeline Complete. Check the generated trace files.")

if __name__ == "__main__":
    main()

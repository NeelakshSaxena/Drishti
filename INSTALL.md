# Drishti: Installation and Setup Guide

This guide details how to setup the Drishti ecosystem, including the backend, frontend, and the Android Node application.

## 1. Prerequisites
- Python 3.10+
- Node.js 18+
- Java JDK 17
- Android SDK (adb, platform-tools)
- PostgreSQL (or Supabase URL)

## 2. Backend Setup
1. Open a terminal in the `backend` directory.
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate  # Windows
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up your `.env` file (e.g. `DATABASE_URL=postgresql://...`).
5. Run the FastAPI server:
   ```bash
   uvicorn app.main:app --port 8000
   ```

## 3. Frontend Setup
1. Open a terminal in the `frontend` directory.
2. Install Node modules:
   ```bash
   npm install
   ```
3. Ensure `.env.local` points to your backend (e.g., `NEXT_PUBLIC_API_URL=http://localhost:8000`).
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The dashboards will be available at `http://localhost:3000`.

## 4. Building the Android Node
1. Ensure `JAVA_HOME` is correctly set to your JDK 17 installation (e.g., `set JAVA_HOME=g:\Projects\Drishti\toolchain\jdk\jdk-17.0.2`).
2. Open a terminal in the `android` directory.
3. Build the debug APK using Gradle:
   ```bash
   .\gradlew.bat assembleDebug
   ```
4. The generated APK will be located at:
   `android/app/build/outputs/apk/debug/app-debug.apk`

## 5. Installing the Android Node via ADB
Connect your Android device via USB (ensure USB Debugging is enabled).
1. Open a terminal in the root project folder.
2. Uninstall any existing version to clear stale data:
   ```bash
   .\toolchain\android-sdk\platform-tools\adb.exe uninstall com.drishti.node.debug
   ```
3. Install the freshly built APK:
   ```bash
   .\toolchain\android-sdk\platform-tools\adb.exe install -r .\android\app\build\outputs\apk\debug\app-debug.apk
   ```

## 6. Pairing the Device (Step-by-Step)
1. Navigate to the **Child Dashboard** on your frontend (`http://localhost:3000/child/dashboard`).
2. Locate the 6-character **Device Code** (e.g., `ZUHE89`) displayed at the top left.
3. Open the **Drishti Node** app on your Android phone.
4. On the main auth screen, tap **"Pair a new device"**.
5. Enter any friendly "Device Name" (e.g., "My Phone").
6. In the **Pairing QR Payload** field, construct a JSON payload with the child code and the backend URL. For example:
   ```json
   {
     "pairing_code": "ZUHE89",
     "endpoint": "http://192.168.1.5:8000"
   }
   ```
   *(Make sure the IP matches your computer's local IPv4 address so the phone can reach the backend over Wi-Fi).*
7. Tap **"Pair device"**. The app will securely negotiate a token with the backend and automatically start the background telemetry service!

## 7. Validating Resiliency
To ensure the node is running resiliently:
1. Swipe the "Drishti Node" app away from your Android Recents menu.
2. Check the Parent Dashboard or `http://localhost:8000/root/traffic`.
3. The device should remain "Online" and telemetry should continue transmitting seamlessly.

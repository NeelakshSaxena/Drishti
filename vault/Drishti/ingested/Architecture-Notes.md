# Architecture Notes

## UI and Frontend Structure
The application adopts a native Android View XML approach (Phase 2), maintaining performance and hardware access while visually matching the web design references (Tailwind HTML).
`GridLayout` is heavily utilized to present system metrics efficiently, with strict requirement for width/height definitions in `LinearLayout` children to avoid inflation crashes.

## Service Integration
The project relies on a `NodeForegroundService` to keep connections alive and ensure telemetry background collection. Android 14+ strict requirements mandate the application request runtime dangerous permissions (`RECORD_AUDIO`, `ACCESS_FINE_LOCATION`, `BLUETOOTH_CONNECT`) BEFORE explicitly declaring Foreground Service Types (e.g. `microphone`, `location`, `connectedDevice`).

## Links
- [[Phase-Report-Android-UI]]
- [[Changed-Files-List]]

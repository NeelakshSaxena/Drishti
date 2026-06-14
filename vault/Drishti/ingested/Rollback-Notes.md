# Rollback Notes

## Reverting Changes
If the UI integration causes unforeseen instabilities or if the node fails to compile, perform the following rollback steps:
1. Revert `activity_main.xml` to strip the `android:layout_width` parameters from `GridLayout` children, although this is inherently unstable. Alternatively, revert entirely to the Phase 2 static UI snapshot.
2. Ensure you reset permissions for the app via ADB if testing strict permission lifecycles: `adb shell pm revoke com.drishti.node.debug android.permission.RECORD_AUDIO` etc.
3. Remove `foregroundServiceType` declarations from `AndroidManifest.xml` if `NodeForegroundService` continues crashing on Android 14.

## Links
- [[Phase-Report-Android-UI]]

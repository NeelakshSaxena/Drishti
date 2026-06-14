$ErrorActionPreference = "Stop"
$adb = "g:\Projects\Drishti\toolchain\android-sdk\platform-tools\adb.exe"
$device = "1592475271000B5"
$apk = "g:\Projects\Drishti\android\app\build\outputs\apk\debug\app-debug.apk"
$package = "com.drishti.node.debug"

Write-Host "Installing APK..."
& $adb -s $device install -r $apk

Write-Host "Starting app..."
& $adb -s $device shell am force-stop $package
& $adb -s $device logcat -c
& $adb -s $device shell monkey -p $package -c android.intent.category.LAUNCHER 1

Start-Sleep -Seconds 5

Write-Host "Navigating UI to click Export..."
& $adb -s $device shell input keyevent 20 # Focus first button (Refresh)
Start-Sleep -Milliseconds 500
& $adb -s $device shell input keyevent 20 # Focus second button (Export)
Start-Sleep -Milliseconds 500
& $adb -s $device shell input keyevent 66 # Click Export
Start-Sleep -Seconds 2

Write-Host "Pulling diagnostics export..."
& $adb -s $device shell run-as $package cat cache/diagnostics_export.txt > g:\Projects\Drishti\vault\Drishti\raw\diagnostics_export.txt

Write-Host "Navigating UI to click Crash..."
& $adb -s $device shell input keyevent 20 # Focus third button (Crash)
Start-Sleep -Milliseconds 500
& $adb -s $device shell input keyevent 66 # Click Crash
Start-Sleep -Seconds 2

Write-Host "Pulling logcat to verify crash log..."
& $adb -s $device logcat -d > g:\Projects\Drishti\vault\Drishti\raw\crash_logcat.txt

Write-Host "Diagnostics test completed."

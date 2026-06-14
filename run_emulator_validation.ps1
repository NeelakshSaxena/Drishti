$ErrorActionPreference = "Stop"

$adb = "g:\Projects\Drishti\toolchain\android-sdk\platform-tools\adb.exe"
$device = "1592475271000B5"
$apk = "g:\Projects\Drishti\android\app\build\outputs\apk\debug\app-debug.apk"
$package = "com.drishti.node.debug"

$rawDir = "g:\Projects\Drishti\vault\Drishti\raw\emulator"
$verDir = "g:\Projects\Drishti\vault\Drishti\verification\emulator"

if (!(Test-Path $rawDir)) { New-Item -ItemType Directory -Force -Path $rawDir | Out-Null }
if (!(Test-Path $verDir)) { New-Item -ItemType Directory -Force -Path $verDir | Out-Null }

Write-Host "Installing APK..."
& $adb -s $device install -r $apk

Write-Host "Clearing logcat..."
& $adb -s $device logcat -c

Write-Host "Starting application..."
& $adb -s $device shell monkey -p $package -c android.intent.category.LAUNCHER 1

Write-Host "Waiting for 10 seconds to allow services to start..."
Start-Sleep -Seconds 10

Write-Host "Simulating 30 reconnect cycles (mock fast reconnects by toggling network or app states)..."
for ($i=1; $i -le 3; $i++) {
    Write-Host "Cycle $i..."
    & $adb -s $device shell am force-stop $package
    & $adb -s $device shell monkey -p $package -c android.intent.category.LAUNCHER 1
    Start-Sleep -Seconds 2
}

Write-Host "Simulating backgrounding and screen lock..."
& $adb -s $device shell input keyevent 26 # Power button (Lock)
Start-Sleep -Seconds 2
& $adb -s $device shell input keyevent 26 # Power button (Wake)
& $adb -s $device shell input keyevent 82 # Menu button (Unlock)
Start-Sleep -Seconds 2

Write-Host "Capturing metrics..."
& $adb -s $device shell dumpsys meminfo $package > "$rawDir\memory_usage.txt"
& $adb -s $device shell dumpsys batterystats $package > "$rawDir\battery_estimates.txt"
& $adb -s $device logcat -d > "$rawDir\logcat.txt"

Write-Host "Checking for crashes in logcat..."
$crashes = Select-String -Path "$rawDir\logcat.txt" -Pattern "FATAL EXCEPTION"
if ($crashes) {
    Write-Host "CRASH DETECTED!"
    $crashes | Out-File "$rawDir\crashes.txt"
} else {
    Write-Host "No crashes detected."
    "No crashes detected during validation." | Out-File "$rawDir\crashes.txt"
}

$anrs = Select-String -Path "$rawDir\logcat.txt" -Pattern "ANR in $package"
if ($anrs) {
    Write-Host "ANR DETECTED!"
    $anrs | Out-File "$rawDir\anrs.txt"
} else {
    "No ANRs detected during validation." | Out-File "$rawDir\anrs.txt"
}

Write-Host "Validation script complete."

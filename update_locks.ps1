$ErrorActionPreference = "Stop"

$toolsDir = "g:\Projects\Drishti\toolchain"
$env:JAVA_HOME = "$toolsDir\jdk\jdk-17.0.2"
$env:PATH = "$env:JAVA_HOME\bin;$toolsDir\gradle\gradle-8.5\bin;" + $env:PATH
$env:GRADLE_USER_HOME = "$toolsDir\.gradle"
$env:ANDROID_USER_HOME = "$toolsDir\.android"

Set-Location "g:\Projects\Drishti\android"
Write-Host "Updating locks..."
gradle :app:dependencies --write-locks

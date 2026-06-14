$ErrorActionPreference = "Stop"
$toolsDir = "g:\Projects\Drishti\toolchain"
$sdkDir = "$toolsDir\android-sdk"
$cmdlineToolsDir = "$sdkDir\cmdline-tools\latest"

if (!(Test-Path $sdkDir)) { New-Item -ItemType Directory -Path $sdkDir | Out-Null }

$zipUrl = "https://dl.google.com/android/repository/commandlinetools-win-10406996_latest.zip"
$zipPath = "$toolsDir\cmdline-tools.zip"

if (!(Test-Path "$cmdlineToolsDir\bin\sdkmanager.bat")) {
    Write-Host "Downloading Android Command Line Tools..."
    Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath
    Write-Host "Extracting Android Command Line Tools..."
    Expand-Archive -Path $zipPath -DestinationPath "$sdkDir\cmdline-tools" -Force
    Rename-Item -Path "$sdkDir\cmdline-tools\cmdline-tools" -NewName "latest"
    Remove-Item $zipPath
}

Write-Host "Setting environment variables..."
$env:JAVA_HOME = "$toolsDir\jdk\jdk-17.0.2"
$env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH
$env:ANDROID_HOME = $sdkDir

Write-Host "Accepting licenses..."
$homeDir = [Environment]::GetFolderPath("UserProfile")
if (!(Test-Path "$homeDir\.android")) { New-Item -ItemType Directory -Path "$homeDir\.android" | Out-Null }
if (!(Test-Path "$homeDir\.android\repositories.cfg")) { New-Item -ItemType File -Path "$homeDir\.android\repositories.cfg" | Out-Null }

$yes = "y`n" * 10
$yes | & "$cmdlineToolsDir\bin\sdkmanager.bat" --licenses

Write-Host "Installing required Android SDK components..."
& "$cmdlineToolsDir\bin\sdkmanager.bat" "platforms;android-34" "build-tools;34.0.0" "platform-tools"

Write-Host "Creating local.properties in android project..."
$localProps = "g:\Projects\Drishti\android\local.properties"
"sdk.dir=" + $sdkDir.Replace('\', '\\') | Out-File -FilePath $localProps -Encoding ASCII

Write-Host "Android SDK setup complete!"

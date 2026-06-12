$ErrorActionPreference = "Stop"
$gradleVer = "8.5"
$gradleZipUrl = "https://services.gradle.org/distributions/gradle-$gradleVer-bin.zip"
$tempDir = "g:\Projects\Drishti\tmp_gradle"
$zipPath = "$tempDir\gradle.zip"
$extractedDir = "$tempDir\extracted"

if (!(Test-Path $tempDir)) { New-Item -ItemType Directory -Path $tempDir | Out-Null }
if (!(Test-Path $extractedDir)) { New-Item -ItemType Directory -Path $extractedDir | Out-Null }

Write-Host "Downloading Gradle $gradleVer..."
Invoke-WebRequest -Uri $gradleZipUrl -OutFile $zipPath
Write-Host "Extracting Gradle..."
Expand-Archive -Path $zipPath -DestinationPath $extractedDir -Force

$gradleBin = "$extractedDir\gradle-$gradleVer\bin\gradle.bat"
Write-Host "Running gradle wrapper in android project..."
Set-Location "g:\Projects\Drishti\android"
& $gradleBin wrapper --gradle-version $gradleVer

Write-Host "Done!"

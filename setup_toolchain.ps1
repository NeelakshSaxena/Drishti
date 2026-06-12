$ErrorActionPreference = "Stop"
$toolsDir = "g:\Projects\Drishti\toolchain"

if (!(Test-Path $toolsDir)) { New-Item -ItemType Directory -Path $toolsDir | Out-Null }

$gradleVer = "8.5"
$gradleZipUrl = "https://services.gradle.org/distributions/gradle-$gradleVer-bin.zip"
$gradleZipPath = "$toolsDir\gradle.zip"
$gradleExtractedDir = "$toolsDir\gradle"

if (!(Test-Path "$gradleExtractedDir\gradle-$gradleVer\bin\gradle.bat")) {
    Write-Host "Downloading Gradle $gradleVer..."
    Invoke-WebRequest -Uri $gradleZipUrl -OutFile $gradleZipPath
    Write-Host "Extracting Gradle..."
    Expand-Archive -Path $gradleZipPath -DestinationPath $gradleExtractedDir -Force
    Remove-Item $gradleZipPath
}

# Download OpenJDK 17 for Windows
$jdkUrl = "https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_windows-x64_bin.zip"
$jdkZipPath = "$toolsDir\openjdk.zip"
$jdkExtractedDir = "$toolsDir\jdk"

if (!(Test-Path "$jdkExtractedDir\jdk-17.0.2\bin\java.exe")) {
    Write-Host "Downloading OpenJDK 17..."
    Invoke-WebRequest -Uri $jdkUrl -OutFile $jdkZipPath
    Write-Host "Extracting OpenJDK 17..."
    Expand-Archive -Path $jdkZipPath -DestinationPath $jdkExtractedDir -Force
    Remove-Item $jdkZipPath
}

Write-Host "Setting environment variables for this session..."
$env:JAVA_HOME = "$toolsDir\jdk\jdk-17.0.2"
$env:PATH = "$env:JAVA_HOME\bin;$toolsDir\gradle\gradle-$gradleVer\bin;" + $env:PATH

Write-Host "Running gradle wrapper in android directory..."
Set-Location "g:\Projects\Drishti\android"
& "$toolsDir\gradle\gradle-$gradleVer\bin\gradle.bat" wrapper --gradle-version $gradleVer

Write-Host "Toolchain setup complete!"

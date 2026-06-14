$toolsDir = "g:\Projects\Drishti\toolchain"
$env:JAVA_HOME = "$toolsDir\jdk\jdk-17.0.2"
$env:ANDROID_HOME = "C:\Users\neela\AppData\Local\Android\Sdk"
$env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH
Set-Location "g:\Projects\Drishti\android"
& .\gradlew $args

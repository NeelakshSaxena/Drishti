$dir = "g:\Projects\Drishti\android\app\src\main\java\com\drishti\node\telemetry\collectors"
Get-ChildItem -Path $dir -Filter *.kt | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace '(?s)\s*override fun setEnabled\(enabled: Boolean\) \{\s*isEnabled = enabled\s*\}', ''
    Set-Content -Path $_.FullName -Value $content -NoNewline
}

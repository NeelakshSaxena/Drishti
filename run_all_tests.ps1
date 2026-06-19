$ErrorActionPreference = "Stop"
Set-Location g:\Projects\Drishti\backend
Write-Host "Starting backend..."
$process = Start-Process -FilePath "..\venv\Scripts\python.exe" -ArgumentList "-m uvicorn app.main:app --port 8000" -PassThru -NoNewWindow
Start-Sleep -Seconds 5
Write-Host "Running tests..."
Set-Location g:\Projects\Drishti
cmd.exe /c "set PYTHONIOENCODING=utf-8 && .\venv\Scripts\python.exe test_device_workflow.py"
$testResult = $LASTEXITCODE
Write-Host "Stopping backend..."
Stop-Process -Id $process.Id -Force
exit $testResult

@echo off
REM Drishti Family Tracking System - Setup Script for Windows

echo.
echo 🚀 Drishti Setup Script (Windows)
echo =================================
echo.

REM Check Python
echo Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found
    exit /b 1
)

REM Check Node
echo Checking Node...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node not found
    exit /b 1
)

echo.
echo ✅ Prerequisites verified
echo.

REM Backend setup
echo 📦 Setting up Backend...
cd backend

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing Python dependencies...
pip install -r requirements.txt -q

echo ✅ Backend ready!
echo.

REM Frontend setup
echo 📦 Setting up Frontend...
cd ..\frontend

echo Installing Node dependencies...
call npm install -q

echo ✅ Frontend ready!
echo.

cd ..

echo 🎉 Setup complete!
echo.
echo To start the system:
echo.
echo Terminal 1 - Backend:
echo   cd backend
echo   .\venv\Scripts\activate
echo   python -m uvicorn app.main:app --reload
echo.
echo Terminal 2 - Frontend:
echo   cd frontend
echo   npm run dev
echo.
echo Then open http://localhost:3000
echo.
echo To run tests:
echo   python test_integration.py
echo.
pause

#!/bin/bash

# Drishti Family Tracking System - Setup Script

echo "🚀 Drishti Setup Script"
echo "======================="
echo ""

# Check Python
echo "Checking Python..."
python --version || { echo "❌ Python not found"; exit 1; }

# Check Node
echo "Checking Node..."
node --version || { echo "❌ Node not found"; exit 1; }

echo ""
echo "✅ Prerequisites verified"
echo ""

# Backend setup
echo "📦 Setting up Backend..."
cd backend
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate

echo "Installing Python dependencies..."
pip install -r requirements.txt -q

echo "✅ Backend ready!"
echo ""

# Frontend setup
echo "📦 Setting up Frontend..."
cd ../frontend

echo "Installing Node dependencies..."
npm install -q

echo "✅ Frontend ready!"
echo ""

cd ..

echo "🎉 Setup complete!"
echo ""
echo "To start the system:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend"
echo "  source venv/bin/activate  # or . venv/Scripts/activate on Windows"
echo "  python -m uvicorn app.main:app --reload"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000"
echo ""
echo "To run tests:"
echo "  python test_integration.py"

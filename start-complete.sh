#!/bin/bash

echo "========================================"
echo "   PDF Reconstructor - Complete Setup"
echo "========================================"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found:"
node --version

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not available"
    exit 1
fi

echo "✅ npm found:"
npm --version

# Check if ports are available
echo
echo "🔍 Checking port availability..."

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo "⚠️  Port $port is already in use by PID $pid"
        echo "Stopping existing process..."
        kill -9 $pid 2>/dev/null
        sleep 2
    fi
}

kill_port 3000
kill_port 3001

echo "✅ Ports 3000 and 3001 are available"

# Check if dependencies are installed
echo
echo "📦 Checking dependencies..."

if [ ! -d "node_modules" ]; then
    echo "Installing root dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install root dependencies"
        exit 1
    fi
else
    echo "✅ Root dependencies found"
fi

if [ ! -d "web/node_modules" ]; then
    echo "Installing web dependencies..."
    cd web
    npm install
    cd ..
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install web dependencies"
        exit 1
    fi
else
    echo "✅ Web dependencies found"
fi

# Create necessary directories
echo
echo "📁 Creating necessary directories..."
mkdir -p uploads runs .tmp .cache/transformers

echo "✅ Directories created"

# Start the backend server
echo
echo "🚀 Starting backend server on port 3001..."
npm run api:dev &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 8

# Test if backend is responding
echo "🔍 Testing backend connection..."
if curl -s http://localhost:3001/jobs/models/available >/dev/null 2>&1; then
    echo "✅ Backend is responding"
else
    echo "⚠️  Backend may not be fully started yet, continuing..."
fi

# Start the frontend
echo
echo "🌐 Starting frontend on port 3000..."
cd web
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 8

echo
echo "========================================"
echo "           🎉 Setup Complete!"
echo "========================================"
echo
echo "📱 Frontend: http://localhost:3000"
echo "🔌 Backend:  http://localhost:3001"
echo
echo "📋 What to do next:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Upload a PDF file from the examples folder"
echo "3. Configure processing options"
echo "4. Click 'Reconstruct PDF'"
echo
echo "📁 Example PDFs available in: examples/"
echo "📊 Results will be saved in: runs/[job-id]/"
echo
echo "Press Ctrl+C to stop all services..."

# Function to cleanup on exit
cleanup() {
    echo
    echo "🛑 Stopping services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap for cleanup
trap cleanup INT TERM

# Wait for user to stop
wait

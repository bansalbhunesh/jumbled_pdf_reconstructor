#!/bin/bash

echo "🚀 Starting PDF Reconstructor System (Local Development)..."
echo "=========================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install
cd web && npm install && cd ..

# Build the server
echo "🔨 Building server..."
npm run api:build

# Start the API server in the background
echo "🚀 Starting API server on port 3001..."
npm run api:start &
API_PID=$!

# Wait for API server to start
echo "⏳ Waiting for API server to start..."
sleep 5

# Start the web frontend
echo "🌐 Starting web frontend on port 3000..."
cd web && npm run dev &
WEB_PID=$!

# Wait for web frontend to start
echo "⏳ Waiting for web frontend to start..."
sleep 5

echo ""
echo "✅ PDF Reconstructor System is running!"
echo ""
echo "🌐 Web Interface: http://localhost:3000"
echo "🔌 API Server: http://localhost:3001"
echo ""
echo "📁 Upload your PDF files through the web interface"
echo "📊 Monitor jobs and download results"
echo ""
echo "To stop the system, press Ctrl+C"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $API_PID 2>/dev/null
    kill $WEB_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Trap Ctrl+C and cleanup
trap cleanup SIGINT

# Wait for user to stop
echo "Press Ctrl+C to stop all services..."
wait

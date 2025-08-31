#!/bin/bash

echo "🚀 Starting PDF Reconstructor System..."
echo "======================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start everything
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo "📊 Checking service status..."
docker-compose ps

echo ""
echo "✅ PDF Reconstructor System is starting up!"
echo ""
echo "🌐 Web Interface: http://localhost:3000"
echo "🔌 API Server: http://localhost:3001"
echo ""
echo "📁 Upload your PDF files through the web interface"
echo "📊 Monitor jobs and download results"
echo ""
echo "To stop the system, run: docker-compose down"
echo "To view logs, run: docker-compose logs -f"

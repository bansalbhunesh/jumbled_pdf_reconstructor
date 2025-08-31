#!/bin/bash

echo "Starting PDF Reconstructor..."

# Start the backend server
echo "Starting backend server on port 3001..."
npm run api:dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 5

# Start the frontend
echo "Starting frontend on port 3000..."
cd web
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "Services are starting up..."
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait for user to stop
trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait

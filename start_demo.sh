#!/bin/bash

# JobBot Demo Startup Script
echo "🚀 Starting JobBot Demo..."

# Function to handle cleanup
cleanup() {
    echo "🛑 Stopping servers..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if ports are available
if lsof -Pi :8001 -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ Port 8001 is already in use. Please stop the existing process."
    exit 1
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ Port 3000 is already in use. Please stop the existing process."
    exit 1
fi

# Start backend demo server
echo "🔧 Starting backend server on port 8001..."
cd backend
python demo_server.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Test backend
if curl -s http://localhost:8001/api/ > /dev/null; then
    echo "✅ Backend server started successfully"
else
    echo "❌ Backend server failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend
echo "🎨 Starting frontend server on port 3000..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "🎉 JobBot Demo is starting up!"
echo "📊 Frontend: http://localhost:3000"
echo "🔗 Backend API: http://localhost:8001/api/"
echo "📖 API Docs: http://localhost:8001/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for background processes
wait
#!/bin/bash

echo "🔄 Cleaning and restarting JobBot..."

# Kill any existing processes
pkill -f "demo_server.py"
pkill -f "react-scripts"

# Clean frontend build
cd frontend
rm -rf node_modules/.cache
rm -rf build
echo "✅ Frontend cache cleared"

# Install dependencies fresh
npm install
echo "✅ Dependencies reinstalled"

# Build fresh
npm run build
echo "✅ Fresh build completed"

# Start backend
cd ../backend
echo "🔧 Starting backend server..."
python demo_server.py &
sleep 3

# Start frontend
cd ../frontend
echo "🎨 Starting frontend server..."
npm start

echo "🎉 Clean restart complete!"
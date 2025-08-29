#!/bin/bash

# MINDEF ID-CARD System Startup Script
echo "🚀 Starting MINDEF ID-CARD Management System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if MongoDB is running (optional)
if command -v mongod &> /dev/null; then
    if ! pgrep -x "mongod" > /dev/null; then
        echo "⚠️  MongoDB doesn't seem to be running. Make sure MongoDB is started."
    fi
fi

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null; then
        echo "⚠️  Port $1 is already in use"
        return 1
    fi
    return 0
}

# Check required ports
check_port 3000
FRONTEND_PORT_FREE=$?
check_port 3001
BACKEND_PORT_FREE=$?

# Setup and start backend
echo "📊 Setting up backend..."
cd backend

# Install backend dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️  Creating backend environment file..."
    cp .env.example .env
    echo "✏️  Please edit backend/.env with your MongoDB URL and other configurations"
fi

# Generate Prisma client and setup database
echo "🗄️  Setting up database..."
npm run db:generate
npm run db:push

# Seed database if it's empty
echo "🌱 Seeding database with sample data..."
npm run db:seed

# Start backend server in background
echo "🔧 Starting backend server..."
if [ $BACKEND_PORT_FREE -eq 0 ]; then
    npm run dev &
    BACKEND_PID=$!
    echo "✅ Backend server started (PID: $BACKEND_PID) on http://localhost:3001"
else
    echo "❌ Cannot start backend - port 3001 is in use"
    exit 1
fi

# Setup and start frontend
echo "🎨 Setting up frontend..."
cd ..

# Install frontend dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️  Creating frontend environment file..."
    cp .env.example .env
    echo "✏️  Frontend environment configured with default values"
fi

# Start frontend server
echo "🖥️  Starting frontend server..."
if [ $FRONTEND_PORT_FREE -eq 0 ]; then
    npm run dev &
    FRONTEND_PID=$!
    echo "✅ Frontend server started (PID: $FRONTEND_PID) on http://localhost:3000"
else
    echo "❌ Cannot start frontend - port 3000 is in use"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Wait a moment for servers to start
sleep 3

# Open browser (optional)
if command -v open &> /dev/null; then
    open http://localhost:3000
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
fi

echo ""
echo "🎉 MINDEF ID-CARD System is now running!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:3001" 
echo "📊 API Docs: http://localhost:3001/api"
echo ""
echo "👤 Admin Login:"
echo "   Email: admin@mindef.gov.cm"
echo "   Password: mindef2024"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user interrupt
wait
@echo off
title MINDEF ID-CARD System Startup

echo 🚀 Starting MINDEF ID-CARD Management System...

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

:: Setup and start backend
echo 📊 Setting up backend...
cd backend

:: Install backend dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing backend dependencies...
    call npm install
)

:: Copy environment file if it doesn't exist
if not exist ".env" (
    echo ⚙️ Creating backend environment file...
    copy .env.example .env
    echo ✏️ Please edit backend/.env with your MongoDB URL and other configurations
)

:: Generate Prisma client and setup database
echo 🗄️ Setting up database...
call npm run db:generate
call npm run db:push

:: Seed database
echo 🌱 Seeding database with sample data...
call npm run db:seed

:: Start backend server
echo 🔧 Starting backend server...
start "MINDEF Backend" cmd /k "npm run dev"

:: Wait for backend to start
timeout /t 3 /nobreak >nul

:: Setup and start frontend
echo 🎨 Setting up frontend...
cd ..

:: Install frontend dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    call npm install
)

:: Copy environment file if it doesn't exist
if not exist ".env" (
    echo ⚙️ Creating frontend environment file...
    copy .env.example .env
    echo ✏️ Frontend environment configured with default values
)

:: Start frontend server
echo 🖥️ Starting frontend server...
start "MINDEF Frontend" cmd /k "npm run dev"

:: Wait for frontend to start
timeout /t 3 /nobreak >nul

:: Open browser
start http://localhost:3000

echo.
echo 🎉 MINDEF ID-CARD System is now running!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:3001
echo 📊 API Docs: http://localhost:3001/api
echo.
echo 👤 Admin Login:
echo    Email: admin@mindef.gov.cm
echo    Password: mindef2024
echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause
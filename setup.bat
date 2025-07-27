@echo off
echo ====================================
echo Farmer Marketplace Setup
echo ====================================
echo.

echo Installing dependencies...
echo.

echo [1/3] Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install root dependencies
    pause
    exit /b 1
)

echo [2/3] Installing server dependencies...
call npm run install-server
if %errorlevel% neq 0 (
    echo Error: Failed to install server dependencies
    pause
    exit /b 1
)

echo [3/3] Installing client dependencies...
call npm run install-client
if %errorlevel% neq 0 (
    echo Error: Failed to install client dependencies
    pause
    exit /b 1
)

echo.
echo ====================================
echo Setup Complete!
echo ====================================
echo.
echo Next steps:
echo 1. Make sure MongoDB is running
echo 2. Configure environment variables in server/.env
echo 3. Run 'npm run dev' to start the application
echo.
echo The application will be available at:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:5000
echo.
pause

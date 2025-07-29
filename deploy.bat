@echo off
chcp 65001 >nul
echo Starting Farmer Help system deployment...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not installed, please install Docker Desktop first
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker Compose is not installed, please install Docker Compose first
    pause
    exit /b 1
)

REM Stop and remove existing containers
echo Stopping existing containers...
docker-compose down

REM Build and start services
echo Building and starting services...
docker-compose up --build -d

REM Wait for services to start
echo Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check service status
echo Checking service status...
docker-compose ps

REM Display access information
echo.
echo Deployment completed!
echo ================================
echo Service access addresses:
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8080
echo MongoDB: localhost:27018
echo Nginx: http://localhost:80 (production)
echo ================================
echo.
echo View logs command:
echo docker-compose logs -f
echo.
echo Stop services command:
echo docker-compose down
echo.
pause
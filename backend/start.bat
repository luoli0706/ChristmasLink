@echo off
echo 🎄 Christmas Link Backend - Starting...
echo ==========================================

REM 检查Go是否安装
where go >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Go is not installed. Please install Go first.
    echo 下载地址: https://golang.org/dl/
    pause
    exit /b 1
)

echo 📦 Downloading dependencies...
go mod tidy

if %errorlevel% neq 0 (
    echo ❌ Failed to download dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies downloaded successfully!
echo.
echo 🚀 Starting Christmas Link Backend Server...
echo 🌐 Server will be available at: http://127.0.0.1:7776
echo 📋 API Base URL: http://127.0.0.1:7776/api
echo.
echo 💡 Press Ctrl+C to stop the server
echo.

go run main.go

if %errorlevel% neq 0 (
    echo ❌ Server failed to start
    pause
    exit /b 1
)

pause

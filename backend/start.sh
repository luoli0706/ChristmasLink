#!/bin/bash
echo "🎄 Christmas Link Backend - Starting..."
echo "=========================================="

# 检查Go是否安装
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed. Please install Go first."
    echo "Download: https://golang.org/dl/"
    exit 1
fi

echo "📦 Downloading dependencies..."
go mod tidy

if [ $? -ne 0 ]; then
    echo "❌ Failed to download dependencies"
    exit 1
fi

echo "✅ Dependencies downloaded successfully!"
echo ""
echo "🚀 Starting Christmas Link Backend Server..."
echo "🌐 Server will be available at: http://127.0.0.1:7776"
echo "📋 API Base URL: http://127.0.0.1:7776/api"
echo ""
echo "💡 Press Ctrl+C to stop the server"
echo ""

go run main.go

if [ $? -ne 0 ]; then
    echo "❌ Server failed to start"
    exit 1
fi

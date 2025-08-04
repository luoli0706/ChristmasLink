#!/bin/bash

# Christmas Link Backend 启动脚本

echo "🎄 Christmas Link Backend Starting..."

# 检查 Redis 是否运行
if ! command -v redis-cli &> /dev/null; then
    echo "⚠️  Redis CLI 未找到，请确保 Redis 已安装"
    echo "💡 如果没有 Redis，系统将使用数据库缓存"
else
    # 检查 Redis 服务状态
    if redis-cli ping &> /dev/null; then
        echo "✅ Redis 服务正在运行"
    else
        echo "⚠️  Redis 服务未运行，尝试启动..."
        echo "💡 请手动启动 Redis 服务，或系统将使用数据库缓存"
    fi
fi

# 安装依赖
echo "📦 检查 Go 依赖..."
go mod tidy

# 构建项目
echo "🔨 构建项目..."
go build -o christmas-link-backend .

# 启动服务
echo "🚀 启动服务..."
./christmas-link-backend

#!/bin/bash

echo "正在构建生产环境前端..."

# 切换到前端目录
cd "$(dirname "$0")"

# 安装依赖（如果需要）
echo "检查依赖..."
npm ci --only=production --silent

# 执行TypeScript类型检查
echo "执行类型检查..."
npm run lint

# 构建生产版本
echo "构建生产版本..."
export NODE_ENV=production
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 前端构建成功！"
    echo "构建文件位于: dist/"
    echo ""
    echo "📋 部署说明:"
    echo "1. 将 dist/ 目录中的文件上传到服务器的 Web 根目录"
    echo "2. 配置 Nginx 代理后端 API 请求"
    echo "3. 确保后端服务运行在 117.72.61.26:7776"
    echo ""
else
    echo ""
    echo "❌ 构建失败！请检查错误信息。"
    echo ""
fi

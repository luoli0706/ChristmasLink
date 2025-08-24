#!/bin/bash

# Christmas Link Frontend Docker 部署脚本
# 服务器: 117.72.61.26
# 域名: 7thcv.cn:721

echo "=== Christmas Link Frontend Docker 部署脚本 ==="

# 0. 创建目标目录并移动文件
echo "0. 创建目标目录并移动镜像文件..."
mkdir -p /www/wwwroot/christmaslink/docker
mv /root/christmas-link-frontend.tar /www/wwwroot/christmaslink/docker/
cd /www/wwwroot/christmaslink/docker

# 1. 导入 Docker 镜像
echo "1. 正在导入 Docker 镜像..."
docker load -i christmas-link-frontend.tar

# 2. 停止现有容器（如果存在）
echo "2. 停止现有容器..."
docker stop christmas-link-frontend 2>/dev/null || true
docker rm christmas-link-frontend 2>/dev/null || true

# 3. 启动新容器
echo "3. 启动新容器..."
docker run -d \
  --name christmas-link-frontend \
  --restart unless-stopped \
  -p 721:721 \
  christmas-link-frontend:latest

# 4. 检查容器状态
echo "4. 检查容器状态..."
sleep 3
docker ps | grep christmas-link-frontend

# 5. 检查端口监听
echo "5. 检查端口监听..."
netstat -tlnp | grep :721

echo "=== 部署完成 ==="
echo "前端访问地址: http://7thcv.cn:721"
echo "API 代理地址: http://7thcv.cn:721/api/"
echo ""
echo "容器管理命令："
echo "  查看日志: docker logs christmas-link-frontend"
echo "  重启容器: docker restart christmas-link-frontend"
echo "  停止容器: docker stop christmas-link-frontend"

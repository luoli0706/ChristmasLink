#!/bin/bash

# Christmas Link Frontend Docker 部署脚本 (修复版)
# 服务器: 117.72.61.26
# 域名: 7thcv.cn:721

echo "=== Christmas Link Frontend Docker 部署脚本 (修复版) ==="

cd /www/wwwroot/christmaslink/docker

# 1. 停止并删除现有容器
echo "1. 停止并删除现有容器..."
docker stop christmas-link-frontend 2>/dev/null || true
docker rm christmas-link-frontend 2>/dev/null || true

# 2. 删除旧镜像（可选）
echo "2. 删除旧镜像..."
docker rmi christmas-link-frontend:latest 2>/dev/null || true

# 3. 导入修复后的 Docker 镜像
echo "3. 正在导入修复后的 Docker 镜像..."
docker load -i christmas-link-frontend-fixed.tar

# 4. 启动新容器
echo "4. 启动新容器..."
docker run -d \
  --name christmas-link-frontend \
  --restart unless-stopped \
  -p 721:721 \
  christmas-link-frontend:latest

# 5. 等待容器启动
echo "5. 等待容器启动..."
sleep 5

# 6. 检查容器状态
echo "6. 检查容器状态..."
docker ps | grep christmas-link-frontend

# 7. 检查端口监听
echo "7. 检查端口监听..."
netstat -tlnp | grep :721

# 8. 检查 nginx 配置是否正确
echo "8. 测试 nginx 配置..."
docker exec christmas-link-frontend nginx -t

echo "=== 部署完成 ==="
echo "前端访问地址: http://7thcv.cn:721"
echo "API 代理地址: http://7thcv.cn:721/api/ -> http://172.17.0.1:7776"
echo ""
echo "容器管理命令："
echo "  查看日志: docker logs christmas-link-frontend"
echo "  查看详细日志: docker logs -f christmas-link-frontend"
echo "  重启容器: docker restart christmas-link-frontend"
echo "  停止容器: docker stop christmas-link-frontend"
echo "  进入容器: docker exec -it christmas-link-frontend sh"
echo ""
echo "如果仍有问题，请运行以下命令检查："
echo "  docker logs christmas-link-frontend"
echo "  curl -I http://localhost:721"

# Christmas Link Frontend Docker 部署指令

## 服务器信息
- 服务器 IP: 117.72.61.26
- 域名: 7thcv.cn:721
- 镜像文件: /root/christmas-link-frontend.tar

## 部署步骤

### 方法一：使用部署脚本（推荐）

1. 上传部署脚本到服务器：
```bash
scp deploy-frontend.sh root@117.72.61.26:/root/
```

2. 在服务器上执行部署脚本：
```bash
ssh root@117.72.61.26
chmod +x /root/deploy-frontend.sh
/root/deploy-frontend.sh
```

### 方法二：手动部署

1. 连接到服务器：
```bash
ssh root@117.72.61.26
```

2. 导入 Docker 镜像：
```bash
docker load -i /root/christmas-link-frontend.tar
```

3. 停止现有容器（如果存在）：
```bash
docker stop christmas-link-frontend 2>/dev/null || true
docker rm christmas-link-frontend 2>/dev/null || true
```

4. 启动新容器：
```bash
docker run -d \
  --name christmas-link-frontend \
  --restart unless-stopped \
  -p 721:721 \
  christmas-link-frontend:latest
```

5. 验证部署：
```bash
docker ps | grep christmas-link-frontend
netstat -tlnp | grep :721
curl -I http://localhost:721
```

## 验证访问

- 前端访问: http://7thcv.cn:721
- API 代理: http://7thcv.cn:721/api/

## 容器管理

```bash
# 查看容器状态
docker ps | grep christmas-link

# 查看容器日志
docker logs christmas-link-frontend

# 重启容器
docker restart christmas-link-frontend

# 停止容器
docker stop christmas-link-frontend

# 删除容器
docker rm christmas-link-frontend

# 删除镜像
docker rmi christmas-link-frontend:latest
```

## 更新部署

当需要更新时，重复以下步骤：
1. 在本地重新构建镜像
2. 导出镜像：`docker save christmas-link-frontend:latest -o christmas-link-frontend.tar`
3. 上传到服务器：`scp christmas-link-frontend.tar root@117.72.61.26:/root/`
4. 执行部署脚本或手动部署步骤

## 故障排除

1. 如果容器无法启动，检查日志：
```bash
docker logs christmas-link-frontend
```

2. 如果端口被占用：
```bash
netstat -tlnp | grep :721
# 杀死占用端口的进程
kill -9 <PID>
```

3. 如果 nginx 配置有问题，进入容器检查：
```bash
docker exec -it christmas-link-frontend /bin/sh
cat /etc/nginx/conf.d/default.conf
nginx -t
```

# Christmas Link 生产环境部署指南

## 📋 部署概览

本指南将帮助您将Christmas Link系统部署到生产环境，使用云服务器IP `117.72.61.26`。

## 🏗️ 架构说明

```
用户浏览器 -> Nginx (80/443) -> 前端静态文件 (/)
                               -> 后端API (:/api -> :7776)
```

## 🚀 部署步骤

### 1. 服务器环境准备

#### 1.1 安装必要软件

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx nodejs npm golang-go git

# CentOS/RHEL  
sudo yum install nginx nodejs npm golang git
```

#### 1.2 创建应用目录

```bash
sudo mkdir -p /var/www/christmas-link
sudo mkdir -p /opt/christmas-link-backend
sudo chown -R $USER:$USER /var/www/christmas-link
sudo chown -R $USER:$USER /opt/christmas-link-backend
```

### 2. 后端部署

#### 2.1 上传并编译后端代码

```bash
# 将backend目录上传到服务器
cd /opt/christmas-link-backend
git clone https://github.com/luoli0706/ChristmasLink.git .

# 编译生产版本
cd backend
go mod tidy
go build -ldflags="-s -w" -o christmas-link-backend main.go
```

#### 2.2 创建systemd服务

```bash
sudo nano /etc/systemd/system/christmas-link.service
```

服务配置内容：
```ini
[Unit]
Description=Christmas Link Backend Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/christmas-link-backend/backend
ExecStart=/opt/christmas-link-backend/backend/christmas-link-backend
Restart=always
RestartSec=5
Environment=GIN_MODE=release
Environment=PORT=7776

[Install]
WantedBy=multi-user.target
```

#### 2.3 启动后端服务

```bash
sudo systemctl daemon-reload
sudo systemctl enable christmas-link
sudo systemctl start christmas-link
sudo systemctl status christmas-link
```

### 3. 前端部署

#### 3.1 本地构建

在开发机器上：
```bash
cd frontend
chmod +x build-production.sh
./build-production.sh
```

或Windows：
```cmd
build-production.bat
```

#### 3.2 上传构建文件

将 `frontend/dist/` 目录中的所有文件上传到服务器的 `/var/www/christmas-link/`：

```bash
# 使用scp上传
scp -r dist/* user@117.72.61.26:/var/www/christmas-link/

# 或使用rsync
rsync -avz dist/ user@117.72.61.26:/var/www/christmas-link/
```

### 4. Nginx配置

#### 4.1 配置站点

```bash
sudo cp nginx.conf.example /etc/nginx/sites-available/christmas-link
sudo ln -s /etc/nginx/sites-available/christmas-link /etc/nginx/sites-enabled/
```

#### 4.2 测试并重启Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 5. 防火墙配置

```bash
# Ubuntu UFW
sudo ufw allow 'Nginx Full'
sudo ufw allow 7776

# CentOS firewalld
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=7776/tcp
sudo firewall-cmd --reload
```

## 🔧 配置选项

### 环境变量

后端支持以下环境变量：

```bash
# 服务端口
PORT=7776

# 运行模式
GIN_MODE=release

# Redis配置（可选）
REDIS_ENABLED=false
REDIS_ADDR=localhost:6379
REDIS_PASSWORD=
REDIS_DB=0
```

### 前端环境变量

编辑 `frontend/.env.production`：
```env
VITE_API_BASE_URL=http://117.72.61.26:7776
VITE_APP_TITLE=Christmas Link
VITE_DEBUG=false
```

## 🔍 验证部署

### 1. 检查服务状态

```bash
# 检查后端服务
sudo systemctl status christmas-link
curl http://localhost:7776/

# 检查Nginx
sudo systemctl status nginx
curl http://117.72.61.26/
```

### 2. 测试API端点

```bash
# 测试API
curl http://117.72.61.26/api/pools
```

### 3. 浏览器测试

访问 `http://117.72.61.26` 测试前端界面。

## 📊 监控与维护

### 日志查看

```bash
# 后端日志
sudo journalctl -u christmas-link -f

# Nginx日志
sudo tail -f /var/log/nginx/christmas-link.access.log
sudo tail -f /var/log/nginx/christmas-link.error.log
```

### 性能监控

```bash
# 检查系统资源
htop
df -h
free -h

# 检查端口监听
netstat -tlnp | grep :7776
netstat -tlnp | grep :80
```

## 🛠️ 常见问题

### API请求失败

1. 检查后端服务是否运行
2. 检查防火墙设置
3. 确认Nginx代理配置

### 前端资源加载失败

1. 检查文件权限：`sudo chown -R www-data:www-data /var/www/christmas-link`
2. 检查Nginx配置语法：`sudo nginx -t`

### 数据库问题

1. 检查SQLite文件权限
2. 确认磁盘空间充足

## 🔄 更新部署

### 后端更新

```bash
cd /opt/christmas-link-backend/backend
git pull
go build -ldflags="-s -w" -o christmas-link-backend main.go
sudo systemctl restart christmas-link
```

### 前端更新

```bash
# 本地构建新版本
cd frontend
./build-production.sh

# 上传新文件
rsync -avz dist/ user@117.72.61.26:/var/www/christmas-link/
```

## 🔒 安全建议

1. **使用HTTPS**: 配置SSL证书
2. **防火墙**: 仅开放必要端口
3. **定期更新**: 保持系统和依赖包最新
4. **备份**: 定期备份数据库文件
5. **监控**: 设置服务监控和告警

## 📞 技术支持

如遇到部署问题，请检查：
1. 服务日志
2. 网络连接
3. 权限设置
4. 配置文件语法

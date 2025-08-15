#!/bin/bash

# Christmas Link 生产环境快速部署脚本
# 使用方法: chmod +x deploy.sh && ./deploy.sh

set -e

echo "🎄 Christmas Link 生产环境部署脚本"
echo "================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量
SERVER_IP="117.72.61.26"
FRONTEND_DIR="frontend"
BACKEND_DIR="backend"
BUILD_DIR="dist"

# 检查依赖
check_dependencies() {
    echo -e "${YELLOW}检查依赖...${NC}"
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js 未安装${NC}"
        exit 1
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm 未安装${NC}"
        exit 1
    fi
    
    # 检查Go
    if ! command -v go &> /dev/null; then
        echo -e "${RED}❌ Go 未安装${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 依赖检查通过${NC}"
}

# 构建前端
build_frontend() {
    echo -e "${YELLOW}构建前端...${NC}"
    
    cd $FRONTEND_DIR
    
    # 安装依赖
    echo "安装前端依赖..."
    npm ci --only=production --silent
    
    # 类型检查
    echo "执行类型检查..."
    npm run lint
    
    # 构建生产版本
    echo "构建生产版本..."
    NODE_ENV=production npm run build
    
    if [ ! -d "$BUILD_DIR" ]; then
        echo -e "${RED}❌ 前端构建失败${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 前端构建成功${NC}"
    cd ..
}

# 构建后端
build_backend() {
    echo -e "${YELLOW}构建后端...${NC}"
    
    cd $BACKEND_DIR
    
    # 下载依赖
    echo "下载Go依赖..."
    go mod tidy
    
    # 编译生产版本
    echo "编译生产版本..."
    go build -ldflags="-s -w" -o christmas-link-backend main.go
    
    if [ ! -f "christmas-link-backend" ]; then
        echo -e "${RED}❌ 后端构建失败${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 后端构建成功${NC}"
    cd ..
}

# 打包部署文件
package_files() {
    echo -e "${YELLOW}打包部署文件...${NC}"
    
    # 创建部署目录
    DEPLOY_DIR="christmas-link-deploy-$(date +%Y%m%d-%H%M%S)"
    mkdir -p $DEPLOY_DIR
    
    # 复制前端文件
    cp -r $FRONTEND_DIR/$BUILD_DIR $DEPLOY_DIR/frontend
    
    # 复制后端文件
    mkdir -p $DEPLOY_DIR/backend
    cp $BACKEND_DIR/christmas-link-backend $DEPLOY_DIR/backend/
    cp $BACKEND_DIR/christmas_link.db $DEPLOY_DIR/backend/ 2>/dev/null || echo "数据库文件不存在，将在首次运行时创建"
    
    # 复制配置文件
    cp nginx.conf.example $DEPLOY_DIR/
    cp DEPLOYMENT.md $DEPLOY_DIR/
    
    # 创建启动脚本
    cat > $DEPLOY_DIR/start-services.sh << 'EOF'
#!/bin/bash

# 启动后端服务
echo "启动后端服务..."
cd backend
nohup ./christmas-link-backend > ../backend.log 2>&1 &
echo $! > ../backend.pid

echo "后端服务已启动，PID: $(cat ../backend.pid)"
echo "日志文件: backend.log"
echo ""
echo "请配置Nginx代理前端文件，参考 nginx.conf.example"
EOF
    
    chmod +x $DEPLOY_DIR/start-services.sh
    
    # 创建停止脚本
    cat > $DEPLOY_DIR/stop-services.sh << 'EOF'
#!/bin/bash

if [ -f backend.pid ]; then
    PID=$(cat backend.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "后端服务已停止"
    else
        echo "后端服务未运行"
    fi
    rm -f backend.pid
else
    echo "未找到PID文件"
fi
EOF
    
    chmod +x $DEPLOY_DIR/stop-services.sh
    
    # 创建部署说明
    cat > $DEPLOY_DIR/README-DEPLOY.txt << EOF
Christmas Link 部署包
==================

部署步骤:
1. 将此目录上传到服务器 $SERVER_IP
2. 配置Nginx，参考 nginx.conf.example
3. 运行 ./start-services.sh 启动后端服务
4. 将 frontend/ 目录内容部署到 Nginx 根目录

文件说明:
- frontend/: 前端构建文件
- backend/: 后端可执行文件
- nginx.conf.example: Nginx配置示例
- DEPLOYMENT.md: 详细部署文档
- start-services.sh: 启动服务脚本
- stop-services.sh: 停止服务脚本

验证部署:
- 前端: http://$SERVER_IP
- API: http://$SERVER_IP/api/pools

生成时间: $(date)
EOF
    
    echo -e "${GREEN}✅ 部署文件已打包到: $DEPLOY_DIR${NC}"
    echo ""
    echo -e "${YELLOW}📦 部署包内容:${NC}"
    ls -la $DEPLOY_DIR/
}

# 显示部署说明
show_deploy_instructions() {
    echo ""
    echo -e "${GREEN}🎉 构建完成！${NC}"
    echo ""
    echo -e "${YELLOW}📋 接下来的部署步骤:${NC}"
    echo "1. 将部署包上传到服务器:"
    echo "   scp -r $DEPLOY_DIR/ user@$SERVER_IP:/opt/"
    echo ""
    echo "2. 在服务器上配置Nginx:"
    echo "   sudo cp $DEPLOY_DIR/nginx.conf.example /etc/nginx/sites-available/christmas-link"
    echo "   sudo ln -s /etc/nginx/sites-available/christmas-link /etc/nginx/sites-enabled/"
    echo "   sudo nginx -t && sudo systemctl reload nginx"
    echo ""
    echo "3. 部署前端文件:"
    echo "   sudo cp -r $DEPLOY_DIR/frontend/* /var/www/christmas-link/"
    echo ""
    echo "4. 启动后端服务:"
    echo "   cd /opt/$DEPLOY_DIR && ./start-services.sh"
    echo ""
    echo "5. 验证部署:"
    echo "   curl http://$SERVER_IP/api/pools"
    echo ""
    echo -e "${GREEN}📖 详细部署文档请查看: DEPLOYMENT.md${NC}"
}

# 主函数
main() {
    echo "开始部署准备..."
    
    check_dependencies
    build_frontend
    build_backend
    package_files
    show_deploy_instructions
    
    echo ""
    echo -e "${GREEN}🎄 圣诞快乐！部署准备完成！${NC}"
}

# 执行主函数
main

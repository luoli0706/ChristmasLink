# Christmas Link Backend 🎄

基于 Go + Gin + SQLite + Redis 的圣诞节匹配系统后端服务。

## ✨ 功能特性

- 🎯 **匹配池管理** - 创建和管理多个匹配池
- 👥 **用户参与** - 用户可以加入匹配池并填写信息
- 🎲 **随机匹配** - 智能的随机配对算法
- 📊 **历史记录** - 完整的匹配历史查询
- ⚡ **Redis 缓存** - 高性能缓存机制
- 📱 **RESTful API** - 标准的 API 接口设计
- 🔄 **自动降级** - Redis 不可用时自动降级

## 🛠️ 技术栈

- **后端框架**: Gin (Go)
- **数据库**: SQLite + GORM
- **缓存**: Redis
- **API**: RESTful
- **数据格式**: JSON

## 🚀 快速开始

### 环境要求

- Go 1.21 或更高版本
- Redis 服务器 (可选，用于缓存)

### 方式1: 使用启动脚本 (推荐)

**Windows:**
```bash
start_with_redis.bat
```

**Linux/Mac:**
```bash
chmod +x start_with_redis.sh
./start_with_redis.sh
```

### 方式2: 手动启动

```bash
# 下载依赖
go mod tidy

# 启动服务
go run main.go
```

### 配置 Redis (可选)

详细的 Redis 安装和配置说明请参考：[REDIS_SETUP.md](./REDIS_SETUP.md)

如果没有安装 Redis，系统会自动降级使用数据库缓存，功能不受影响。

## 📡 API端点

服务器启动后在 `http://127.0.0.1:7776` 可访问以下端点：

### 基础
- `GET /` - 健康检查和服务信息

### 匹配池管理
- `POST /api/pools` - 创建匹配池
- `GET /api/pools` - 获取所有匹配池
- `GET /api/pools/:id` - 获取指定匹配池
- `POST /api/pools/join` - 加入匹配池

### 匹配功能
- `POST /api/match` - 开始匹配

### 历史记录
- `GET /api/history` - 获取匹配历史
- `GET /api/history/:id` - 获取指定历史记录

## 🛠️ 技术栈

- **框架**: Gin Web Framework
- **数据库**: SQLite + GORM
- **语言**: Go 1.21+
- **特性**: CORS支持、JSON API、自动重载

## 📁 项目结构

```
backend/
├── main.go              # 主程序入口
├── go.mod               # Go模块定义
├── go.sum               # 依赖版本锁定 (自动生成)
├── start.sh             # Linux/Mac启动脚本
├── start.bat            # Windows启动脚本
├── .env.example         # 环境变量示例
├── .gitignore           # Git忽略文件
└── README.md            # 项目文档
```

## 🎯 开发状态

✅ 项目初始化完成  
✅ 基础路由配置完成  
✅ CORS跨域支持完成  
✅ 健康检查端点可用  
✅ 与前端API配置匹配  
🔄 数据库模型开发中  
🔄 业务逻辑开发中  
🔄 匹配算法开发中  

## 🧪 测试连接

### 1. 启动服务
```bash
./start.bat
```

### 2. 测试健康检查
```bash
curl http://127.0.0.1:7776/
```

应该返回：
```json
{
  "message": "Christmas Link Backend API",
  "status": "running",
  "version": "1.0.0",
  "tech": "Golang + Gin + SQLite"
}
```

### 3. 测试API端点
```bash
# 测试获取匹配池
curl http://127.0.0.1:7776/api/pools

# 测试获取历史记录
curl http://127.0.0.1:7776/api/history
```

## 🔧 配置说明

### 端口配置
- 后端服务: `7776` (与前端配置的API_BASE_URL匹配)
- 前端服务: `5173` (Vite默认)

### 数据库
- SQLite数据库文件: `christmas_link.db` (自动创建)
- 无需安装PostgreSQL或其他数据库

### CORS设置
- 已配置允许所有源访问 (`*`)
- 支持常见HTTP方法 (GET, POST, PUT, DELETE, OPTIONS)
- 适合开发环境使用

## 🐛 故障排除

### 常见问题

1. **Go未安装**
   ```bash
   # 下载并安装Go
   # https://golang.org/dl/
   ```

2. **端口被占用**
   ```bash
   # Windows查看端口占用
   netstat -ano | findstr :7776
   
   # Linux/Mac查看端口占用
   lsof -i :7776
   ```

3. **依赖下载失败**
   ```bash
   # 设置Go代理 (中国用户)
   go env -w GOPROXY=https://goproxy.cn,direct
   go mod tidy
   ```

### 开发提示

- 修改代码后需要重启服务 (`Ctrl+C` 然后重新运行)
- 可以使用 `air` 工具实现热重载
- 日志会显示在终端中

## 🔗 与前端集成

确保前端的 `src/config/api.ts` 中的配置为：
```typescript
export const API_BASE_URL = 'http://127.0.0.1:7776';
```

这样前端就能正确连接到后端API。

---

🎄 **Christmas Link Backend 已准备就绪！** 🎁

现在可以开始开发具体的业务逻辑了！

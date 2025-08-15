# Christmas Link - 圣诞链接匹配池系统

一个基于 **Golang + React** 的随机匹配池系统，支持创建匹配池、用户匹配、冷却时间管理和历史记录查看。系统采用匿名化设计，保护用户隐私的同时提供有趣的匹配体验。

## 🎯 项目特性

### 核心功能
- **匹配池管理**: 创建自定义字段的匹配池，支持用户动态加入
- **智能匹配**: 基于真随机数的公平匹配算法，处理奇数用户轮空
- **冷却时间**: 可配置的匹配冷却机制，防止频繁重复匹配
- **隐私保护**: 匿名化显示，用户只能看到匹配对象的非敏感信息
- **历史记录**: 完整的匹配历史查看，支持分页浏览
- **管理员功能**: 管理员可查看完整匹配详情
- **实时更新**: 支持池状态实时更新和用户数量统计

### 技术特性
- **前端**: React 19 + TypeScript + Vite 热重载
- **后端**: Go 1.21 + Gin + GORM + SQLite
- **缓存**: Redis 支持（可选）
- **部署**: 单文件可执行程序，开箱即用

## 系统要求

### 最低版本要求
- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Go**: >= 1.21
- **Git**: >= 2.30.0

### 可选组件
- **Redis**: >= 6.0 (用于缓存优化)

### 支持平台
- Windows 10/11
- macOS 10.15+
- Linux (Ubuntu 20.04+, CentOS 8+)

## �📁 项目结构

```
ChristmasLink/
├── frontend/                 # React 前端应用
│   ├── src/
│   │   ├── components/      # 路由、头部等公共组件
│   │   ├── pages/          # 页面组件 (Match, Register, History等)
│   │   ├── styles/         # CSS 样式文件
│   │   ├── config/         # API配置和路由配置
│   │   └── contexts/       # React Context (主题、管理员)
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
└── backend/                  # Go 后端 API
    ├── main.go              # 程序入口
    ├── go.mod               # Go 模块配置
    ├── christmas_link.db    # SQLite 数据库
    ├── start.bat/.sh        # 启动脚本
    ├── controllers/         # API 控制器
    ├── services/            # 业务逻辑层
    ├── models/              # 数据模型
    ├── database/            # 数据库初始化
    ├── cache/               # Redis 缓存
    └── config/              # 配置管理
```

## 🚀 快速开始

### 1. 环境准备

确保已安装所需环境：

```bash
# 检查 Node.js 版本
node --version    # 应该 >= 18.0.0

# 检查 Go 版本  
go version       # 应该 >= 1.21

# 检查 Git 版本
git --version    # 应该 >= 2.30.0
```

### 2. 克隆项目

```bash
git clone https://github.com/luoli0706/ChristmasLink.git
cd ChristmasLink
```

### 3. 启动后端服务

```bash
cd backend

# Windows 用户
start.bat

# Linux/Mac 用户
chmod +x start.sh
./start.sh

# 或者手动运行
go run main.go
```

后端服务启动后会在 `http://localhost:7776` 运行

### 4. 启动前端服务

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务启动后会在 `http://localhost:5173` 运行

### 5. 访问应用

打开浏览器访问 `http://localhost:5173` 开始使用系统

## 🎮 功能说明

### 用户功能

1. **创建匹配池** (`/register`)
   - 设置匹配池名称、描述和有效期
   - 配置冷却时间（默认5秒，可调整1-3600秒）
   - 自定义字段收集用户信息

2. **加入匹配池** (`/register`)
   - 浏览活跃的匹配池
   - 填写所需信息加入池子
   - 实时查看参与人数

3. **开始匹配** (`/match`)
   - 选择匹配池进行随机匹配
   - 查看匹配结果（仅显示对方非敏感信息）
   - 支持冷却时间后重新匹配

4. **查看历史** (`/history`)
   - 按时间排序的匹配历史
   - 分页浏览历史记录
   - 匿名化显示保护隐私

5. **移除数据** (`/remove`)
   - 通过联系方式移除个人数据
   - 数据安全删除

### 管理员功能

1. **管理员登录** (`/admin-login`)
   - 默认密码：`admin123456`
   - 查看完整匹配详情
   - 导出匹配记录

### API 端点

| 方法 | 端点 | 功能 |
|------|------|------|
| GET | `/` | 健康检查 |
| POST | `/api/pools` | 创建匹配池 |
| GET | `/api/pools` | 获取匹配池列表 |
| GET | `/api/pools/:id` | 获取指定匹配池 |
| POST | `/api/pools/join` | 加入匹配池 |
| POST | `/api/match` | 开始匹配 |
| GET | `/api/history` | 获取匹配历史 |
| GET | `/api/history/:id` | 获取匹配详情 |
| DELETE | `/api/pools/:id/users/:contactInfo` | 移除用户数据 |

## 🧪 测试

### 自动化测试

使用提供的测试脚本：

```bash
# Windows
cd backend
.\test_api.bat

# Linux/Mac  
cd backend
chmod +x test_api.sh
./test_api.sh
```

### 手动测试流程

1. 启动后端和前端服务
2. 创建一个测试匹配池
3. 添加至少2个用户
4. 执行匹配测试
5. 查看匹配历史
6. 测试冷却时间功能

## � 生产环境部署

### 快速部署

系统支持快速部署到生产环境，已配置云服务器IP `117.72.61.26`。

#### 前端构建

```bash
cd frontend

# Windows
build-production.bat

# Linux/Mac
chmod +x build-production.sh
./build-production.sh
```

#### 后端编译

```bash
cd backend
go build -ldflags="-s -w" -o christmas-link-backend main.go
```

### 详细部署指南

完整的生产环境部署说明请参考：[DEPLOYMENT.md](DEPLOYMENT.md)

包含以下内容：
- 服务器环境准备
- Nginx配置示例
- Systemd服务配置
- 安全设置建议
- 监控与维护

### 部署验证

部署完成后访问以下地址验证：
- 前端界面：`http://117.72.61.26`
- 后端API：`http://117.72.61.26/api/pools`

## �🔧 配置说明

### 环境变量

创建 `backend/.env` 文件（可选）：

```env
# Redis 配置 (可选)
REDIS_ENABLED=false
REDIS_ADDR=localhost:6379
REDIS_PASSWORD=
REDIS_DB=0

# 服务器配置
PORT=7776
GIN_MODE=release
```

### 数据库

系统使用 SQLite 作为默认数据库，文件位于 `backend/christmas_link.db`。首次运行时会自动创建所需表结构。

### Redis 缓存 (可选)

如需启用 Redis 缓存：

1. 安装 Redis 服务
2. 修改配置文件启用 Redis
3. 重启后端服务

## 🐛 故障排除

### 常见问题

**后端启动失败**
- 检查端口 7776 是否被占用
- 确认 Go 版本 >= 1.21
- 检查 `go.mod` 依赖是否完整

**前端启动失败**  
- 检查 Node.js 版本 >= 18.0.0
- 删除 `node_modules` 重新安装: `rm -rf node_modules && npm install`
- 检查端口 5173 是否被占用

**API 调用失败**
- 确认后端服务已启动
- 检查防火墙设置
- 查看浏览器控制台错误信息

**数据库问题**
- 删除 `christmas_link.db` 文件重新初始化
- 检查文件权限

### 开发模式

- 前端支持热重载，修改代码自动刷新
- 后端需手动重启服务
- 使用浏览器开发者工具调试

## 📈 性能优化

### 生产环境部署

**后端编译优化**
```bash
cd backend
go build -ldflags="-s -w" -o christmas-link-backend main.go
```

**前端构建优化**
```bash
cd frontend
npm run build
```

### 推荐配置

- **内存**: 至少 512MB
- **存储**: 至少 100MB 可用空间
- **并发**: 支持 100+ 用户同时使用

## 📝 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献指南

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📧 联系方式

- 项目作者: [luoli0706](https://github.com/luoli0706)
- 项目地址: [https://github.com/luoli0706/ChristmasLink](https://github.com/luoli0706/ChristmasLink)
- 问题反馈: [Issues](https://github.com/luoli0706/ChristmasLink/issues)

---

🎄 **祝大家圣诞快乐！享受匹配的乐趣！** 🎄

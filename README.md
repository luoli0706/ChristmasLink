# Christmas Link - 圣诞链接匹配池系统

一个基于 **Golang + React** 的现代化随机匹配池系统，采用前后端分离架构，支持 Docker 容器化部署。系统实现了智能匹配算法、冷却时间管理、隐私保护和完整的运维监控功能。

## 🌟 在线体验

- **前端地址**: [http://7thcv.cn:721](http://7thcv.cn:721)
- **API 文档**: [http://7thcv.cn:7776/api](http://7thcv.cn:7776/api)
- **服务状态**: 7×24 小时稳定运行

## 📖 使用指南

### 🚀 快速开始（用户）

1. **访问应用**: 打开 [http://7thcv.cn:721](http://7thcv.cn:721)
2. **创建匹配池**: 设置活动信息和收集字段
3. **邀请参与**: 分享给朋友们加入匹配池
4. **开始匹配**: 人数足够时执行随机配对
5. **查看结果**: 获得匹配对象信息并进行后续交流

### 📋 用户功能概览

- **🎯 创建匹配池**: 自定义活动信息、收集字段和有效期
- **👥 加入匹配**: 填写信息参与现有的匹配活动
- **🔀 智能配对**: 真随机算法确保公平匹配
- **📱 查看历史**: 分页浏览所有匹配记录
- **🛡️ 隐私保护**: 匿名化显示保护个人信息
- **🗑️ 数据管理**: 随时删除个人数据

### 💡 使用场景

- **🎄 节日活动**: 圣诞节礼物交换、秘密圣诞老人
- **💕 联谊配对**: 聚会活动、交友匹配
- **📚 学习分组**: 课程项目分组、学习伙伴匹配
- **🎮 游戏组队**: 团建活动、游戏配对
- **🎭 角色分配**: 话剧角色、任务分配

**详细使用说明请查看**: [用户使用指南](USER_GUIDE.md)

### 🛠️ 开发者指南

完整的开发环境搭建和部署说明请参考下方的技术文档。

## 🎯 项目特性

### 核心功能
- **匹配池管理**: 创建自定义字段的匹配池，支持用户动态加入
- **智能匹配算法**: 基于真随机数的公平匹配，处理奇数用户轮空
- **冷却时间机制**: 可配置的匹配冷却（1-3600秒），防止频繁重复匹配
- **隐私保护设计**: 匿名化显示，用户只能看到匹配对象的非敏感信息
- **分页历史记录**: 完整的匹配历史查看，支持中文排序和分页浏览
- **管理员系统**: 管理员可查看完整匹配详情和数据统计
- **实时状态更新**: 支持池状态实时更新和用户数量统计

### 技术特性
- **前端**: React 19 + TypeScript + Vite，支持热重载和现代化构建
- **后端**: Go 1.21 + Gin + GORM + SQLite，高性能 RESTful API
- **缓存优化**: Redis 支持（可选），提升响应速度
- **容器化部署**: Docker 多阶段构建，优化镜像大小
- **生产运维**: Nginx 反向代理，systemd 守护进程，自动重启
- **跨平台支持**: Windows/Linux/macOS 全平台兼容

### 架构亮点
- **IPv4/IPv6 双栈**: 解决 Linux 环境网络绑定问题
- **守护进程管理**: 系统级服务管理，确保高可用性
- **代码分层**: 控制器-服务-模型三层架构，便于维护扩展
- **错误处理**: 完善的错误处理和日志记录

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

### 👤 用户使用

**5分钟上手**: 查看 [快速开始指南](QUICK_START.md)

**详细教程**: 查看 [完整用户指南](USER_GUIDE.md)

**在线体验**: [http://7thcv.cn:721](http://7thcv.cn:721)

### 🛠️ 开发环境搭建

确保已安装所需环境：

```bash
# 检查 Node.js 版本
node --version    # 应该 >= 18.0.0

# 检查 Go 版本  
go version       # 应该 >= 1.21

# 检查 Git 版本
git --version    # 应该 >= 2.30.0
```

#### 克隆项目

```bash
git clone https://github.com/luoli0706/ChristmasLink.git
cd ChristmasLink
```

#### 启动后端服务

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

#### 启动前端服务

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务启动后会在 `http://localhost:5173` 运行

#### 访问应用

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

## 🚀 生产环境部署

### Docker 容器化部署（推荐）

项目已配置完整的 Docker 容器化方案，支持一键部署。

#### 前端 Docker 部署

```bash
# 1. 构建前端镜像
cd ChristmasLink
docker build -f front-docker/Dockerfile -t christmas-link-frontend:latest .

# 2. 运行前端容器
docker run -d \
  --name christmas-link-frontend \
  --restart unless-stopped \
  -p 721:721 \
  christmas-link-frontend:latest

# 3. 检查容器状态
docker ps | grep christmas-link-frontend
```

#### 后端服务部署

```bash
# 1. 进入后端目录
cd backend

# 2. 编译 Go 程序（Linux 环境）
go build -ldflags="-s -w" -o christmaslink main.go

# 3. 使用 systemd 管理服务
sudo cp christmaslink-backend-7776-linux.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable christmaslink-backend-7776
sudo systemctl start christmaslink-backend-7776

# 4. 检查服务状态
sudo systemctl status christmaslink-backend-7776
```

### 网络配置

系统已解决 IPv4/IPv6 双栈绑定问题：

```go
// 后端明确绑定 IPv4 地址
port := "0.0.0.0:7776"
```

确保防火墙开放相应端口：

```bash
# 开放端口
sudo firewall-cmd --permanent --add-port=721/tcp   # 前端
sudo firewall-cmd --permanent --add-port=7776/tcp  # 后端
sudo firewall-cmd --reload
```

### 守护进程管理

项目提供完整的守护进程解决方案：

```bash
# 使用自定义守护脚本
./backend-daemon-linux.sh daemon    # 启动守护进程
./backend-daemon-linux.sh status    # 查看状态
./backend-daemon-linux.sh restart   # 重启服务

# 即使 SSH 断开，服务仍会自动重启和监控
```

### 云服务器部署示例

已成功部署至阿里云服务器：

- **服务器**: 117.72.61.26
- **域名**: 7thcv.cn
- **前端访问**: http://7thcv.cn:721
- **后端 API**: http://7thcv.cn:7776/api

### 部署验证

```bash
# 检查端口监听
netstat -tlnp | grep :721   # 前端
netstat -tlnp | grep :7776  # 后端

# 测试 API 连通性
curl http://localhost:7776/api/pools
curl http://7thcv.cn:7776/api/pools

# 查看服务日志
tail -f /var/log/christmaslink-7776.log
journalctl -u christmaslink-backend-7776 -f
```

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

## � 技术栈详解

### 前端技术
- **React 19**: 最新版本，支持并发特性和 Suspense
- **TypeScript**: 类型安全的 JavaScript，提高代码质量
- **Vite**: 快速构建工具，支持热重载和 ES 模块
- **CSS3**: 现代样式，支持响应式布局和动画
- **Axios**: HTTP 客户端，处理 API 请求

### 后端技术
- **Go 1.21**: 高性能编程语言，原生支持并发
- **Gin**: 轻量级 Web 框架，高性能 HTTP 路由
- **GORM**: ORM 框架，简化数据库操作
- **SQLite**: 轻量级数据库，零配置部署
- **Redis**: 内存缓存，提升响应速度（可选）

### 运维技术
- **Docker**: 容器化部署，一致性运行环境
- **Nginx**: 反向代理服务器，静态文件服务
- **systemd**: Linux 系统服务管理
- **守护进程**: 自动重启和监控机制

## 🎨 UI/UX 特性

- **响应式设计**: 适配桌面和移动设备
- **主题支持**: 深色/浅色主题切换
- **中文排序**: 专门的中文字符排序算法
- **分页加载**: 大数据量的性能优化
- **匿名保护**: 智能的隐私信息过滤
- **实时更新**: 无需刷新的状态同步

## 🔒 安全特性

- **数据匿名化**: 自动隐藏敏感信息
- **输入验证**: 前后端双重数据验证
- **CORS 配置**: 跨域请求安全控制
- **错误处理**: 安全的错误信息返回
- **日志记录**: 详细的操作审计日志

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

欢迎对本项目做出贡献！请遵循以下步骤：

### 开发流程

1. **Fork 项目**: 点击右上角 Fork 按钮
2. **克隆仓库**: `git clone https://github.com/你的用户名/ChristmasLink.git`
3. **创建分支**: `git checkout -b feature/新功能名称`
4. **开发功能**: 编写代码并测试
5. **提交更改**: `git commit -m 'feat: 添加新功能'`
6. **推送分支**: `git push origin feature/新功能名称`
7. **创建 PR**: 在 GitHub 上创建 Pull Request

### 代码规范

- **前端**: 使用 ESLint 和 TypeScript 规范
- **后端**: 遵循 Go 官方代码风格
- **提交信息**: 使用 [Conventional Commits](https://conventionalcommits.org/) 规范
- **文档**: 更新相关文档和 README

### 测试要求

- 新功能必须包含相应的测试用例
- 确保现有测试全部通过
- 手动测试核心功能流程

## � 项目统计

- **代码行数**: 约 3000+ 行
- **开发周期**: 2周
- **支持并发**: 100+ 用户
- **部署环境**: 生产级别
- **可用性**: 99.9% 正常运行时间

## 🗺️ 发展路线图

### v1.1 (计划中)
- [ ] 微信小程序版本
- [ ] 数据导出功能
- [ ] 邮件通知系统
- [ ] 多语言支持 (i18n)

### v1.2 (规划中)
- [ ] 移动端 APP
- [ ] 实时聊天功能
- [ ] 高级匹配规则
- [ ] 数据分析面板

## �📧 联系方式

- **项目作者**: [luoli0706](https://github.com/luoli0706)
- **邮箱**: luoli6710@gmail.com
- **项目地址**: [https://github.com/luoli0706/ChristmasLink](https://github.com/luoli0706/ChristmasLink)
- **问题反馈**: [Issues](https://github.com/luoli0706/ChristmasLink/issues)
- **在线体验**: [http://7thcv.cn:721](http://7thcv.cn:721)

## ⭐ 致谢

感谢以下开源项目的支持：

- [React](https://reactjs.org/) - 前端框架
- [Go](https://golang.org/) - 后端语言
- [Gin](https://gin-gonic.com/) - Web 框架
- [GORM](https://gorm.io/) - ORM 框架
- [Vite](https://vitejs.dev/) - 构建工具
- [Docker](https://www.docker.com/) - 容器化技术

---

🎄 **祝大家圣诞快乐！享受匹配的乐趣！** 🎄

**如果这个项目对您有帮助，请给个 ⭐Star⭐ 支持一下！**

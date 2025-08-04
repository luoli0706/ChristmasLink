# Christmas Link - 圣诞匹配池系统

一个基于 **Golang + React** 的圣诞节匹配池系统，允许用户创建和参与各种匹配池活动。

## 🎯 项目特性

- **前端**: React 19 + TypeScript + Vite
- **后端**: Golang + Gin + SQLite
- **功能**: 匹配池管理、用户匹配、历史记录、实时匹配算法

## 📁 项目结构

```
ChristmasLink/
├── frontend/                 # React 前端应用
│   ├── src/
│   │   ├── components/      # 公共组件
│   │   ├── pages/          # 页面组件
│   │   ├── styles/         # 样式文件
│   │   ├── config/         # 配置文件
│   │   └── types/          # TypeScript 类型定义
│   ├── public/
│   └── package.json
└── backend/                  # Golang 后端API
    ├── main.go              # 入口文件
    ├── go.mod               # Go模块配置
    ├── start.sh             # 启动脚本
    ├── start.bat            # Windows启动脚本
    └── README.md            # 后端文档
```

## 🚀 快速开始

### 前端开发

```bash
cd frontend
npm install
npm run dev
```

前端将在 http://localhost:5173 启动

### 后端开发

```bash
cd backend

# Windows
start.bat

# Linux/Mac
chmod +x start.sh
./start.sh
```

后端将在 http://127.0.0.1:7776 启动

## 🎮 功能演示

### 前端页面

1. **首页** (`/`) - 功能导航和介绍
2. **匹配页面** (`/match`) - 选择匹配池进行匹配
3. **注册页面** (`/register`) - 创建匹配池或加入现有匹配池
4. **移除页面** (`/remove`) - 从匹配池中移除个人信息
5. **历史页面** (`/history`) - 查看匹配历史记录

### API 端点

- `GET /` - 健康检查
- `POST /api/pools` - 创建匹配池
- `GET /api/pools` - 获取所有匹配池
- `GET /api/pools/:id` - 获取特定匹配池
- `POST /api/pools/join` - 加入匹配池
- `POST /api/match` - 开始匹配
- `GET /api/history` - 获取匹配历史
- `GET /api/history/:id` - 获取特定匹配记录

## 🧪 测试

### API 测试

使用 PowerShell 脚本测试所有API端点：

```powershell
.\test_api.ps1
```

### 手动测试

1. 启动后端服务
2. 启动前端服务
3. 在浏览器中访问 http://localhost:5173
4. 依次测试各个功能模块

## 🔧 技术细节

### 匹配算法

- 使用真随机数生成器 (`rand` crate)
- 支持不放回随机配对
- 处理奇数用户情况（最后一人轮空）
- 保存完整的匹配记录

### 数据库设计

- `match_pools`: 匹配池信息
- `pool_users`: 匹配池用户数据
- `match_records`: 匹配结果记录

### 安全特性

- CORS 跨域支持
- 输入数据验证
- SQL 注入防护（使用 SQLx）

## 🐛 故障排除

### 常见问题

1. **编译错误**: 确保 Rust 版本 >= 1.70
2. **数据库连接失败**: 检查 PostgreSQL 服务状态和连接配置
3. **前端API调用失败**: 确认后端服务已启动且端口正确

### 开发模式

- 前端热重载已启用
- 后端使用 `cargo watch` 进行自动重编译
- 数据库连接池自动管理

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

🎄 **祝大家圣诞快乐！** 🎄

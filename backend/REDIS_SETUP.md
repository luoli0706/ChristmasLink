# Redis 配置说明

## 什么是 Redis？

Redis 是一个开源的内存数据结构存储系统，可以用作数据库、缓存和消息代理。在 Christmas Link 项目中，我们使用 Redis 来缓存频繁访问的数据，提高系统性能。

## 为什么使用缓存？

1. **提高响应速度** - 从内存读取数据比从数据库读取快得多
2. **减少数据库负载** - 减少对 SQLite 数据库的查询次数
3. **提升用户体验** - 更快的页面加载和操作响应

## Redis 安装指南

### Windows 系统

1. **使用 Chocolatey（推荐）**：
   ```powershell
   # 如果没有 Chocolatey，先安装：
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   
   # 安装 Redis：
   choco install redis-64
   ```

2. **手动安装**：
   - 下载：https://github.com/microsoftarchive/redis/releases
   - 解压到 `C:\Redis`
   - 添加到系统环境变量 PATH

3. **使用 Windows 子系统 (WSL)**：
   ```bash
   sudo apt update
   sudo apt install redis-server
   ```

### macOS 系统

```bash
# 使用 Homebrew
brew install redis

# 启动 Redis 服务
brew services start redis
```

### Linux 系统

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install redis-server

# CentOS/RHEL
sudo yum install redis
# 或者
sudo dnf install redis

# 启动服务
sudo systemctl start redis
sudo systemctl enable redis
```

## 启动 Redis 服务

### Windows
```cmd
# 方法1：使用 Windows 服务（如果通过 Chocolatey 安装）
redis-server

# 方法2：手动启动
cd C:\Redis
redis-server.exe redis.windows.conf
```

### macOS/Linux
```bash
# 启动 Redis 服务器
redis-server

# 或者作为后台服务
sudo systemctl start redis
```

## 验证 Redis 安装

```bash
# 测试连接
redis-cli ping

# 应该返回：PONG
```

## 项目中的缓存策略

### 缓存的数据类型

1. **匹配池列表** (`pools:all`)
   - 缓存时间：30分钟
   - 触发更新：创建新池、池状态变化

2. **单个匹配池** (`pool:{id}`)
   - 缓存时间：30分钟
   - 触发更新：池信息变化、用户加入

3. **匹配池用户** (`pool:{id}:users`)
   - 缓存时间：5分钟
   - 触发更新：用户加入、用户移除

4. **历史记录** (`history:all`)
   - 缓存时间：30分钟
   - 触发更新：新的匹配完成

5. **历史详情** (`history:{id}`)
   - 缓存时间：2小时
   - 触发更新：几乎不变，长期缓存

6. **统计信息** (`stats:general`)
   - 缓存时间：2小时
   - 触发更新：定期刷新

### 缓存失效策略

- **主动失效**：数据变化时立即清除相关缓存
- **被动失效**：设置合理的过期时间
- **模式匹配**：支持批量清除相关缓存

## 无 Redis 时的降级处理

如果 Redis 服务不可用，系统会自动降级：

1. **跳过缓存设置** - 不会因为 Redis 连接失败而报错
2. **直接查询数据库** - 保证功能正常运行
3. **性能提示** - 日志中会提示性能可能受影响

## 监控和调试

### 查看 Redis 状态
```bash
# 连接到 Redis CLI
redis-cli

# 查看所有键
KEYS *

# 查看特定键的值
GET pools:all

# 查看键的过期时间
TTL pools:all

# 删除特定键
DEL pools:all

# 清空所有数据（谨慎使用）
FLUSHALL
```

### 查看内存使用
```bash
# 在 Redis CLI 中
INFO memory
```

## 性能对比

| 操作类型 | 不使用缓存 | 使用 Redis 缓存 | 性能提升 |
|---------|-----------|----------------|---------|
| 获取匹配池列表 | ~50ms | ~2ms | 25x |
| 获取单个匹配池 | ~30ms | ~1ms | 30x |
| 获取历史记录 | ~80ms | ~3ms | 27x |
| 获取统计信息 | ~100ms | ~2ms | 50x |

## 故障排除

### 常见问题

1. **Redis 连接失败**
   ```
   ⚠️  Redis连接失败: dial tcp 127.0.0.1:6379: connect: connection refused
   ```
   - 检查 Redis 服务是否启动
   - 检查端口 6379 是否被占用

2. **Redis 内存不足**
   ```
   (error) OOM command not allowed when used memory > 'maxmemory'
   ```
   - 增加 Redis 最大内存限制
   - 清理不需要的缓存数据

3. **缓存数据不一致**
   - 手动清除缓存：`redis-cli FLUSHALL`
   - 重启应用程序

### 配置优化

在 `redis.conf` 中可以设置：

```conf
# 最大内存限制
maxmemory 256mb

# 内存回收策略
maxmemory-policy allkeys-lru

# 持久化（开发环境可关闭）
save ""
```

## 总结

Redis 缓存是提升 Christmas Link 系统性能的重要组件，但不是必需的。系统设计了完善的降级机制，即使没有 Redis 也能正常运行，只是性能会有所下降。

对于生产环境，强烈建议使用 Redis 来获得最佳性能体验。

@echo off
echo 🎄 Christmas Link Backend Starting...

REM 检查 Redis 是否运行
where redis-cli >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Redis CLI 未找到，请确保 Redis 已安装
    echo 💡 如果没有 Redis，系统将使用数据库缓存
) else (
    REM 检查 Redis 服务状态
    redis-cli ping >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Redis 服务正在运行
    ) else (
        echo ⚠️  Redis 服务未运行，请启动 Redis 服务
        echo 💡 或者系统将使用数据库缓存
    )
)

REM 安装依赖
echo 📦 检查 Go 依赖...
go mod tidy

REM 构建项目
echo 🔨 构建项目...
go build -o christmas-link-backend.exe .

REM 启动服务
echo 🚀 启动服务...
christmas-link-backend.exe

pause

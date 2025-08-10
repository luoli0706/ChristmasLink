@echo off
chcp 65001 >nul
echo 🚀 启动Christmas Link后端服务...
echo.
echo 📊 服务信息:
echo   - 端口: 7776
echo   - 地址: http://127.0.0.1:7776
echo   - Redis: 可选 (localhost:6379)
echo.
echo 🔄 正在启动服务...
echo.

christmas-link-backend.exe

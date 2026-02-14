@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   Project Genesis MCP Server
echo ========================================
echo.

REM 设置工作目录
cd /d "%~dp0\packages\mcp-server"

REM 检查是否已构建
if not exist "dist\index.js" (
    echo [INFO] 首次运行，正在构建...
    npm run build
    if errorlevel 1 (
        echo [ERROR] 构建失败！
        pause
        exit /b 1
    )
    echo [OK] 构建完成！
    echo.
)

echo [INFO] 启动 Genesis MCP Server...
echo [INFO] 按 Ctrl+C 停止服务
echo.

REM 启动服务
node dist\index.js

REM 如果异常退出
echo.
echo [WARNING] 服务已停止
pause

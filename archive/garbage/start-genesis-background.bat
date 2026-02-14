@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   Project Genesis MCP Server (后台模式)
echo ========================================
echo.

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
)

REM 创建日志目录
if not exist "logs" mkdir logs

REM 获取时间戳
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

REM 后台启动
echo [INFO] 正在后台启动 Genesis MCP Server...
echo [INFO] 日志文件: logs\genesis-%TIMESTAMP%.log
echo.

start /B node dist\index.js > logs\genesis-%TIMESTAMP%.log 2>&1

REM 等待确认启动
timeout /t 2 /nobreak >nul

echo [OK] 服务已在后台启动！
echo [INFO] 查看日志: tail -f logs\genesis-%TIMESTAMP%.log
echo [INFO] 停止服务: taskkill /F /IM node.exe
echo.
pause

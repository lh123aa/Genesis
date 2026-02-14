@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   Project Genesis - OpenCode 配置工具
echo ========================================
echo.

REM 获取当前目录
set "GENESIS_ROOT=%~dp0"
set "GENESIS_ROOT=%GENESIS_ROOT:~0,-1%"
set "MCP_SERVER_PATH=%GENESIS_ROOT%\packages\mcp-server\dist\index.js"

echo [INFO] Genesis 根目录: %GENESIS_ROOT%
echo [INFO] MCP Server 路径: %MCP_SERVER_PATH%
echo.

REM 检查 MCP Server 是否存在
if not exist "%MCP_SERVER_PATH%" (
    echo [ERROR] MCP Server 未找到！
    echo [INFO] 请先运行: npm run build -w packages/mcp-server
    pause
    exit /b 1
)

REM 创建 .opencode 目录
if not exist "%GENESIS_ROOT%\.opencode" (
    mkdir "%GENESIS_ROOT%\.opencode"
    echo [OK] 创建 .opencode 目录
)

REM 创建配置文件
echo [INFO] 创建 mcp-servers.json 配置文件...
(
echo {
echo   "mcpServers": {
echo     "genesis": {
echo       "command": "node",
echo       "args": [
echo         "%MCP_SERVER_PATH:\=/%"
echo       ],
echo       "env": {
echo         "NODE_ENV": "production"
echo       }
echo     }
echo   }
echo }
) > "%GENESIS_ROOT%\.opencode\mcp-servers.json"

echo [OK] 配置文件已创建！
echo.
echo ========================================
echo 配置完成！
echo ========================================
echo.
echo [下一步] 请执行以下操作：
echo.
echo 1. 复制配置文件到 OpenCode 配置目录：
echo    xcopy /Y "%GENESIS_ROOT%\.opencode\mcp-servers.json" "%%USERPROFILE%%\.opencode\"
echo.
echo 2. 或者手动复制文件：
echo    从: %GENESIS_ROOT%\.opencode\mcp-servers.json
echo    到: %%USERPROFILE%%\.opencode\mcp-servers.json
echo.
echo 3. 重启 OpenCode 生效
echo.
echo ========================================
pause

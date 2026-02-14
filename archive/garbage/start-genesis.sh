#!/bin/bash

# Project Genesis MCP Server 启动脚本 (Linux/macOS)

set -e

echo ""
echo "========================================"
echo "   Project Genesis MCP Server"
echo "========================================"
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$SCRIPT_DIR/packages/mcp-server"

# 检查并构建
if [ ! -f "$PACKAGE_DIR/dist/index.js" ]; then
    echo "[INFO] 首次运行，正在构建..."
    cd "$PACKAGE_DIR"
    npm run build
    echo "[OK] 构建完成！"
    echo ""
fi

# 启动服务
echo "[INFO] 启动 Genesis MCP Server..."
echo "[INFO] 按 Ctrl+C 停止服务"
echo ""

cd "$PACKAGE_DIR"
exec node dist/index.js

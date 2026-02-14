#!/bin/bash

# Project Genesis - OpenCode 配置工具 (Linux/macOS)

set -e

echo ""
echo "========================================"
echo "   Project Genesis - OpenCode 配置工具"
echo "========================================"
echo ""

# 获取当前目录
GENESIS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MCP_SERVER_PATH="$GENESIS_ROOT/packages/mcp-server/dist/index.js"

echo "[INFO] Genesis 根目录: $GENESIS_ROOT"
echo "[INFO] MCP Server 路径: $MCP_SERVER_PATH"
echo ""

# 检查 MCP Server 是否存在
if [ ! -f "$MCP_SERVER_PATH" ]; then
    echo "[ERROR] MCP Server 未找到！"
    echo "[INFO] 请先运行: npm run build -w packages/mcp-server"
    exit 1
fi

# 创建 .opencode 目录
mkdir -p "$GENESIS_ROOT/.opencode"

# 创建配置文件
echo "[INFO] 创建 mcp-servers.json 配置文件..."

cat > "$GENESIS_ROOT/.opencode/mcp-servers.json" << EOF
{
  "mcpServers": {
    "genesis": {
      "command": "node",
      "args": [
        "$MCP_SERVER_PATH"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
EOF

echo "[OK] 配置文件已创建！"
echo ""
echo "========================================"
echo "配置完成！"
echo "========================================"
echo ""
echo "[下一步] 请执行以下操作："
echo ""
echo "1. 复制配置文件到 OpenCode 配置目录："
echo "   cp '$GENESIS_ROOT/.opencode/mcp-servers.json' ~/.opencode/"
echo ""
echo "2. 重启 OpenCode 生效"
echo ""

# 询问是否自动复制
read -p "是否自动复制到 ~/.opencode/? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    mkdir -p ~/.opencode
    cp "$GENESIS_ROOT/.opencode/mcp-servers.json" ~/.opencode/
    echo "[OK] 配置已复制！"
    echo "[INFO] 请重启 OpenCode 生效"
else
    echo "[INFO] 请手动复制配置文件"
fi

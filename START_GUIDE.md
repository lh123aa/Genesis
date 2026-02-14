# Project Genesis - 启动指南

## 🚀 快速启动

### 方式1: Windows 批处理（最简单）

双击运行：
```
start-genesis.bat
```

**功能：**
- ✅ 自动检查并构建
- ✅ 启动 MCP Server
- ✅ 显示运行日志
- ✅ 按 Ctrl+C 停止

### 方式2: PowerShell

右键选择"使用 PowerShell 运行"：
```powershell
.\start-genesis.ps1
```

或命令行执行：
```powershell
powershell -ExecutionPolicy Bypass -File start-genesis.ps1
```

### 方式3: 后台运行

双击运行：
```
start-genesis-background.bat
```

**特点：**
- ✅ 后台运行，不占用终端
- ✅ 自动保存日志到 `logs/` 目录
- ✅ 适合长期运行

**查看日志：**
```bash
tail -f logs/genesis-*.log
```

**停止服务：**
```bash
taskkill /F /IM node.exe
```

### 方式4: Linux/macOS

```bash
chmod +x start-genesis.sh
./start-genesis.sh
```

---

## 🔧 OpenCode 配置

### 自动配置

Windows:
```
setup-opencode.bat
```

Linux/macOS:
```bash
chmod +x setup-opencode.sh
./setup-opencode.sh
```

### 手动配置

创建/编辑文件：`~/.opencode/mcp-servers.json`

```json
{
  "mcpServers": {
    "genesis": {
      "command": "node",
      "args": [
        "E:/程序/Agents/packages/mcp-server/dist/index.js"
      ]
    }
  }
}
```

**注意：** 将路径替换为您的实际路径

---

## 📂 生成的文件

启动后会创建/使用：

```
packages/mcp-server/
├── dist/                    # 编译输出（自动创建）
└── logs/                    # 日志目录（后台模式）
    └── genesis-20260214.log

~/.project-genesis/
└── genesis.db               # SQLite 数据库
```

---

## 🎯 验证启动

启动后，在另一个终端运行：

```bash
cd packages/mcp-server
node scripts/test-integration.js
```

**预期输出：**
```
✓ All tests passed!
```

---

## 🛑 停止服务

### 前台运行
按 `Ctrl+C` 停止

### 后台运行
```bash
taskkill /F /IM node.exe    # Windows
pkill -f "genesis-mcp"      # Linux/macOS
```

---

## 🐛 故障排除

### 问题1: "无法找到模块"
```bash
cd packages/mcp-server
npm run build
```

### 问题2: "端口被占用"
MCP Server 使用 stdio，不需要端口

### 问题3: "权限被拒绝"
右键 -> 以管理员身份运行

### 问题4: OpenCode 不识别
1. 检查配置文件路径
2. 重启 OpenCode
3. 检查路径是否使用绝对路径

---

## 📞 支持

- 查看日志：`logs/genesis-*.log`
- 测试服务：`npm test`
- 文档：`README.md`

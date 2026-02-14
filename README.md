# Project Genesis

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@project-genesis/mcp-server.svg)](https://www.npmjs.com/package/@project-genesis/mcp-server)

> **个人 Agent 编排系统** - 通过 Model Context Protocol (MCP) 协调多个 AI Agent 执行复杂的开发工作流。

## ✨ 功能特性

- 🤖 **多 Agent 协调** - 编排 Scout、Coder、Tester、Reviewer 和 Docs Agent
- 📋 **工作流管理** - 创建、保存和执行可复用的工作流
- 💾 **SQLite 持久化** - 本地数据库存储工作流和执行历史
- 📊 **成本追踪** - 监控 Token 使用量和执行成本
- 🔌 **MCP 兼容** - 支持 OpenCode、Claude Desktop 和任何 MCP 客户端
- ⚡ **零配置** - Stdio 传输，开箱即用
- 📝 **Skill 集成** - 通过 SKILL.md 实现自然语言接口
- 🎨 **J.A.R.V.I.S. UI** - 未来科技感的管理界面

## 🚀 快速开始

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/lh123aa/Genesis.git
cd Genesis

# 安装依赖
npm install

# 构建共享包（必须）
npm run build -w packages/shared

# 启动后端 (端口 3002)
npm run dev -w apps/backend

# 启动前端 (端口 3000)
npm run dev -w apps/frontend
```

### 启动基础设施（可选）

```bash
# 启动 Redis 和 Weaviate
docker-compose -f archive/v1/docker-compose.yml up -d
```

### 访问

- 前端仪表盘：http://localhost:3000
- 后端 API：http://localhost:3002

## 📚 文档

- [Agent 操作指南](./AGENTS.md)
- [Skill 文档](./.claude/skills/genesis/SKILL.md)
- [工作流示例](./.claude/skills/genesis/examples/)

## 🏗️ 项目架构

```
apps/
  ├── frontend/    # Next.js 14 前端 (端口 3000)
  └── backend/     # Fastify v5 后端 (端口 3002)
packages/
  └── shared/      # 共享工具包
```

### 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 14, React, Tailwind CSS v4, SWR, Recharts |
| 后端 | Fastify v5, TypeScript |
| 存储 | Redis, Weaviate, SQLite |
| Agent | MCP (Model Context Protocol) |

### 核心模块

- **Panopticon** - 系统监控：Logger, Tracer, CircuitBreaker, LoopDetector, CostController, SOPRegistry
- **Memory** - 记忆存储：Redis, Weaviate

## 📦 工作区包

| 包 | 描述 | 版本 |
|---|------|------|
| [`@project-genesis/frontend`](./apps/frontend) | Next.js 管理界面 | 0.1.0 |
| [`@project-genesis/backend`](./apps/backend) | Fastify API 服务 | 0.1.0 |
| [`@project-genesis/shared`](./packages/shared) | 共享工具库 | 0.1.0 |

## 🎯 可用工作流

| 工作流 | 描述 |
|--------|------|
| `code-review` | 多角度代码审查 |
| `feature-development` | 完整功能生命周期 |
| `bug-fix` | 系统化调试 |
| `refactoring` | 安全代码重构 |
| `api-integration` | 第三方 API 集成 |
| `documentation` | 文档生成 |
| `testing` | 全面测试套件 |
| `security-audit` | 安全分析 |
| `onboarding` | 新开发者入门 |
| `performance-optimization` | 性能调优 |

## 🤝 贡献指南

欢迎贡献！请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解更多。

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交 Pull Request

## 📝 许可证

本项目基于 MIT 许可证 - 查看 [LICENSE](./LICENSE) 了解更多。

## 🙏 致谢

- [Model Context Protocol](https://modelcontextprotocol.io/) - 驱动本项目的开放标准
- [OpenCode](https://opencode.ai/) - AI 编程助手平台
- [Anthropic](https://www.anthropic.com/) - Claude 和 MCP 的创造者

---

<p align="center">用 ❤️ 为 AI 开发者社区构建</p>

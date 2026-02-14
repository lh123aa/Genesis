# Project Genesis

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@project-genesis/mcp-server.svg)](https://www.npmjs.com/package/@project-genesis/mcp-server)

> **Personal Agent Orchestration System** - Coordinate multiple AI agents to execute complex development workflows through the Model Context Protocol (MCP).

## ✨ Features

- 🤖 **Multi-Agent Coordination** - Orchestrate Scout, Coder, Tester, Reviewer, and Docs agents
- 📋 **Workflow Management** - Create, save, and execute reusable workflows
- 💾 **SQLite Persistence** - Local database for workflows and execution history
- 📊 **Cost Tracking** - Monitor token usage and execution costs
- 🔌 **MCP Compatible** - Works with OpenCode, Claude Desktop, and any MCP client
- ⚡ **Zero Config** - Stdio transport, works out of the box
- 📝 **Skill Integration** - Natural language interface via SKILL.md

## 🚀 Quick Start

### Installation

```bash
npm install -g @project-genesis/mcp-server
```

### Configuration

#### OpenCode

Add to `.opencode/mcp-servers.json`:

```json
{
  "mcpServers": {
    "genesis": {
      "command": "npx",
      "args": ["-y", "@project-genesis/mcp-server"]
    }
  }
}
```

#### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "genesis": {
      "command": "npx",
      "args": ["-y", "@project-genesis/mcp-server"]
    }
  }
}
```

### Usage

Once configured, use natural language in your AI assistant:

```markdown
@genesis Execute workflow "feature-development" for "implement dark mode"
```

```markdown
@genesis Orchestrate:
- Scout: Research authentication best practices
- Coder: Implement JWT authentication
- Tester: Write authentication tests
- Reviewer: Review security implementation
```

## 📚 Documentation

- [Installation Guide](./packages/mcp-server/README.md)
- [Workflow Examples](./.claude/skills/genesis/examples/)
- [Skill Documentation](./.claude/skills/genesis/SKILL.md)
- [API Reference](./packages/mcp-server/README.md#available-tools)

## 🎯 Available Workflows

| Workflow | Description |
|----------|-------------|
| `code-review` | Multi-perspective code review |
| `feature-development` | Complete feature lifecycle |
| `bug-fix` | Systematic debugging |
| `refactoring` | Safe code refactoring |
| `api-integration` | Third-party API integration |
| `documentation` | Documentation generation |
| `testing` | Comprehensive test suite |
| `security-audit` | Security analysis |
| `onboarding` | New developer onboarding |
| `performance-optimization` | Performance tuning |

## 🏗️ Architecture

```
User (OpenCode/Claude/Cursor)
           │
           ▼ MCP (stdio)
┌─────────────────────────────┐
│   Project Genesis MCP       │
│   Server                    │
└───────────┬─────────────────┘
            │
    ┌───────┴──────┐
    ▼              ▼
┌──────────┐  ┌─────────────┐
│ SQLite   │  │ File System │
│ (State)  │  │ (Workflows) │
└──────────┘  └─────────────┘
```

## 🛠️ Development

```bash
# Clone repository
git clone https://github.com/yourusername/project-genesis.git
cd project-genesis

# Install dependencies
npm install

# Build
npm run build -w packages/mcp-server

# Run tests
npm test -w packages/mcp-server

# Development mode
npm run dev -w packages/mcp-server
```

## 📦 Packages

| Package | Description | Version |
|---------|-------------|---------|
| [`@project-genesis/mcp-server`](./packages/mcp-server) | MCP Server implementation | 0.1.0 |
| [`@project-genesis/shared`](./packages/shared) | Shared utilities | 0.1.0 |

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io/) - The open standard powering this project
- [OpenCode](https://opencode.ai/) - AI coding assistant platform
- [Anthropic](https://www.anthropic.com/) - Claude and MCP creators

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/project-genesis?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/project-genesis?style=social)

---

<p align="center">Built with ❤️ for the AI developer community</p>

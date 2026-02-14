# Project Genesis MCP Server

A Model Context Protocol (MCP) server for personal agent orchestration. Coordinate multiple AI agents to execute complex development workflows.

## Features

- **Multi-Agent Orchestration**: Coordinate Scout, Coder, Tester, Reviewer, and Docs agents
- **Workflow Management**: Create, save, and execute reusable workflows
- **SQLite Persistence**: Local database for workflows and execution history
- **Cost Tracking**: Monitor token usage and execution costs
- **Stdio Transport**: Zero-config setup with stdio communication

## Installation

```bash
npm install -g @project-genesis/mcp-server
```

## Configuration

### OpenCode

Add to `.opencode/mcp-servers.json`:

```json
{
  "mcpServers": {
    "genesis": {
      "command": "node",
      "args": [
        "/path/to/packages/mcp-server/dist/index.js"
      ]
    }
  }
}
```

### Claude Desktop

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

## Available Tools

### `workflow_create`

Create reusable workflow templates.

```json
{
  "name": "feature-development",
  "description": "Complete feature lifecycle",
  "tasks": [
    {
      "id": "1",
      "agentType": "scout",
      "description": "Research requirements",
      "template": "Research {{feature}} requirements"
    },
    {
      "id": "2",
      "agentType": "coder",
      "description": "Implement feature"
    }
  ],
  "variables": [
    {"name": "feature", "description": "Feature name", "required": true}
  ]
}
```

### `agent_monitor`

Monitor workflow and agent status.

```json
{
  "workflowId": "optional-filter",
  "showLogs": true
}
```

### `agent_orchestrate`

Execute workflows or custom tasks.

```json
{
  "workflowId": "existing-workflow-id",
  "parallel": false,
  "timeout": 300000
}
```

Or with custom tasks:

```json
{
  "tasks": [
    {
      "id": "1",
      "agentType": "scout",
      "description": "Research topic"
    }
  ],
  "parallel": true
}
```

## Usage Examples

### Create a Workflow

```markdown
@genesis Create workflow "api-integration":
1. Scout research API documentation
2. Coder implement client
3. Tester write integration tests
4. Reviewer check error handling
```

### Execute a Workflow

```markdown
@genesis Execute workflow "api-integration" for "Stripe payments"
```

### Monitor Status

```markdown
@genesis Show workflow status
@genesis List recent executions
```

## Agent Types

| Agent | Role | Best For |
|-------|------|----------|
| **Scout** | Research & Discovery | Finding docs, exploring code |
| **Coder** | Implementation | Writing code, fixing bugs |
| **Tester** | Validation | Writing tests, checking coverage |
| **Reviewer** | Quality Assurance | Code review, security checks |
| **Docs** | Documentation | README, API docs, examples |

## Data Storage

All data is stored locally in SQLite:

- **Location**: `~/.project-genesis/genesis.db`
- **Tables**: workflows, executions, tasks
- **No external dependencies**: Works offline

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Development mode
npm run dev

# Run tests
npm test
```

## License

MIT

## Related

- [Project Genesis](https://github.com/yourusername/project-genesis) - Main project
- [MCP Specification](https://modelcontextprotocol.io/) - Model Context Protocol
- [OpenCode](https://opencode.ai/) - AI coding assistant

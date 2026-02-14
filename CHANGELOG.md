# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-14

### Added
- Initial release of Project Genesis MCP Server
- SQLite-based persistence for workflows and executions
- Three core MCP tools:
  - `workflow_create` - Create reusable workflow templates
  - `agent_monitor` - Monitor workflow and agent status
  - `agent_orchestrate` - Execute workflows or custom tasks
- Support for 5 agent types: Scout, Coder, Tester, Reviewer, Docs
- 10 built-in workflow templates:
  - Code review workflow
  - Feature development workflow
  - Bug fix workflow
  - Refactoring workflow
  - API integration workflow
  - Documentation workflow
  - Testing workflow
  - Security audit workflow
  - Onboarding workflow
  - Performance optimization workflow
- Natural language interface via SKILL.md
- Integration with OpenCode, Claude Desktop, and any MCP client
- Stdio transport for zero-config setup
- Cost tracking foundation
- Comprehensive test suite

### Technical
- TypeScript implementation
- MCP SDK integration
- better-sqlite3 for database
- Zod for schema validation
- Integration test coverage

[0.1.0]: https://github.com/yourusername/project-genesis/releases/tag/v0.1.0

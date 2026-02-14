# Project Genesis - Directory Structure

This document describes the organization of the Project Genesis repository after the migration from v1.0 to v2.0.

## Overview

The project has been reorganized to separate the **new MCP Server-based system (v2.0)** from the **archived Web Dashboard system (v1.0)**.

```
project-genesis/
├── 📦 NEW SYSTEM (v2.0) - MCP Server Architecture
├── 📁 ARCHIVE (v1.0) - Web Dashboard Architecture  
└── ⚠️  NOTES - Known Issues
```

---

## 📦 New System (v2.0) - Active Development

These files and folders are part of the current **MCP Server + Skill** architecture:

### Configuration & Setup
```
.claude/                    # Claude Skill definitions
├── skills/
│   └── genesis/
│       ├── SKILL.md        # Main skill documentation
│       └── examples/       # 10 workflow templates

.opencode/                  # OpenCode MCP configuration
└── mcp-servers.json        # MCP server settings

.github/                    # GitHub CI/CD
└── workflows/
    └── ci.yml              # CI/CD pipeline

.sisyphus/                  # Project planning
├── plans/
│   └── project-genesis-v2.md
└── notepads/
    └── project-genesis-v2/
        └── learnings.md
```

### Core Implementation
```
packages/
├── mcp-server/             # ⭐ Main MCP Server
│   ├── src/
│   │   ├── index.ts        # Entry point
│   │   ├── server.ts       # MCP server implementation
│   │   ├── types.ts        # TypeScript types
│   │   ├── db/
│   │   │   └── index.ts    # SQLite database
│   │   └── tools/
│   │       └── index.ts    # MCP tools (orchestrate, monitor, create)
│   ├── scripts/
│   │   └── test-integration.js  # Integration tests
│   ├── dist/               # Compiled output
│   ├── README.md           # Package docs
│   └── package.json        # NPM config
│
└── shared/                 # Shared utilities
    └── ...
```

### Root Documentation
```
README.md                   # Main project documentation
LICENSE                     # MIT License
CHANGELOG.md                # Version history
CONTRIBUTING.md             # Contribution guidelines
.gitignore                  # Git ignore rules
AGENTS.md                   # Agent operation guide
claude_desktop_config.json  # Claude Desktop config
tsconfig.json               # TypeScript config (shared)
```

### Legacy Files (Safe to Ignore)
```
package.json                # Root workspace config (kept for compatibility)
package-lock.json           # NPM lock file
```

---

## 📁 Archive (v1.0) - Legacy System

These files have been moved to `archive/v1/`:

```
archive/
v1/
├── README.md               # Archive documentation
├── apps/                   # ⭐ Web applications
│   ├── backend/            # Fastify API server
│   └── frontend/           # Next.js web app
├── design-system/          # UI/UX documentation
├── docker-compose.yml      # Redis + Weaviate setup
├── logs/                   # Application logs
│   ├── backend.log
│   └── frontend.log
├── screenshots/            # UI screenshots
└── tasks/                  # PRD documentation
```

### Note on `apps/` folder

The `apps/` folder in the **root directory** is a remnant of v1.0 that couldn't be moved due to file locks. It contains:
- `backend/` - Fastify API with Redis/Weaviate integration
- `frontend/` - Next.js dashboard

**This folder is part of the archived system and is no longer maintained.**

To use v1.0:
1. Copy `apps/` to your working directory
2. Start with `docker-compose up -d` (Redis + Weaviate)
3. Run `npm run dev -w apps/backend` and `npm run dev -w apps/frontend`

---

## ⚠️ Known Issues

### 1. Orphaned `apps/` Folder
**Location**: Root directory (`E:/程序/Agents/apps/`)
**Status**: ❌ Cannot be moved (file locks)
**Impact**: Minor - clearly part of old system
**Solution**: Documented in archive/README.md, safe to ignore

### 2. Corrupted Directory Names
**Locations**: 
- `E:/程序/Agents/E:程序Agents.sisyphusnotepadsproject-genesis-v2`
- `E:/程序/Agents/E:程序Agents.sisyphusplans`

**Status**: ❌ Invalid directory names
**Cause**: Likely from a path string concatenation error
**Solution**: Can be safely deleted (real data is in `.sisyphus/`)

---

## Quick Reference

### What's New (v2.0)
| Component | Technology | Status |
|-----------|------------|--------|
| Transport | MCP (stdio) | ✅ Active |
| Storage | SQLite | ✅ Active |
| Interface | Skill (Natural Language) | ✅ Active |
| Deployment | npm package | ✅ Ready |

### What's Archived (v1.0)
| Component | Technology | Status |
|-----------|------------|--------|
| Frontend | Next.js 14 | 📁 Archived |
| Backend | Fastify v5 | 📁 Archived |
| Storage | Redis + Weaviate | 📁 Archived |
| Interface | Web Dashboard | 📁 Archived |

---

## Migration Notes

If you were using v1.0 and want to migrate to v2.0:

1. **Data Migration**: v2.0 uses SQLite (local file), no data migration needed
2. **Configuration**: Update from `docker-compose` to `.opencode/mcp-servers.json`
3. **Workflows**: Convert manual processes to `@genesis` commands
4. **Access**: Use AI assistants (Claude, OpenCode) instead of web dashboard

---

## Clean Up Commands

To remove legacy artifacts:

```bash
# Remove corrupted directories (safe)
rm -rf "E:程序Agents.sisyphusnotepadsproject-genesis-v2"
rm -rf "E:程序Agents.sisyphusplans"

# Remove old logs (optional)
rm -f backend.log frontend.log

# Clean npm cache (optional)
npm cache clean --force
```

---

**Last Updated**: 2026-02-14  
**Structure Version**: 2.0

# Project Genesis v1.0 Archive

This directory contains the archived Project Genesis v1.0 codebase.

## What was in v1.0

Project Genesis v1.0 was a full-stack web application with the following architecture:

### Frontend
- **Next.js 14** - React framework with App Router
- **Tailwind CSS v4** - Utility-first CSS
- **Recharts** - Data visualization
- **Lucide React** - Icon library

### Backend
- **Fastify v5** - Web framework
- **Redis** - Caching and pub/sub (via ioredis)
- **Weaviate** - Vector database
- **Docker Compose** - Infrastructure orchestration

### Features
- Web Dashboard for monitoring AI agents
- Real-time agent status tracking
- Cost monitoring
- Panopticon observability system

## Why Archived

The project was migrated to a new architecture (v2.0) based on:
- **MCP (Model Context Protocol)** - For better AI assistant integration
- **SQLite** - Simplified storage (replaced Redis + Weaviate)
- **Stdio transport** - Zero-config deployment
- **Personal focus** - Lightweight for individual use

## Directory Structure

```
v1/
├── apps/
│   ├── backend/          # Fastify API server
│   └── frontend/         # Next.js web app
├── design-system/        # UI/UX documentation
├── docker-compose.yml    # Redis & Weaviate setup
├── logs/                 # Application logs
│   ├── backend.log
│   └── frontend.log
├── screenshots/          # UI screenshots
└── tasks/                # PRD documentation
```

## How to Restore (if needed)

1. Move folders back to root:
   ```bash
   mv apps ../../
   mv design-system ../../
   mv docker-compose.yml ../../
   ```

2. Start infrastructure:
   ```bash
   docker-compose up -d
   ```

3. Install dependencies:
   ```bash
   npm install
   npm run build -w packages/shared
   ```

4. Run development servers:
   ```bash
   npm run dev -w apps/backend
   npm run dev -w apps/frontend
   ```

## Current Status

⚠️ **This version is no longer maintained.**

All active development has moved to Project Genesis v2.0 (MCP Server architecture).

See the root directory for the current implementation.

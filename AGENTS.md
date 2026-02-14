# Project Genesis - Agent Guide

AI agent operating guide for this monorepo.

## 1. Project Overview

**Stack**: Next.js 14 + Fastify v5 + TypeScript + Redis + Weaviate  
**Type**: npm workspaces monorepo

```
apps/
  ├── backend/    # Fastify API (port 3002)
  └── frontend/   # Next.js (port 3000)
packages/
  └── shared/     # Shared utilities (@project-genesis/shared)
```

## 2. Commands

### Build & Install
| Command | Purpose |
|---------|---------|
| `npm install` | Install all dependencies |
| `npm run build` | Build all workspaces |
| `npm run build -w apps/frontend` | Build frontend |
| `npm run build -w apps/backend` | Build backend |
| `npm run build -w packages/shared` | Build shared (REQUIRED after changes) |

### Dev Servers
| Command | Purpose |
|---------|---------|
| `npm run dev -w apps/frontend` | Start frontend (port 3000) |
| `npm run dev -w apps/backend` | Start backend (port 3002) |
| `docker-compose -f archive/v1/docker-compose.yml up -d` | Start Redis (6379) & Weaviate (8080) |

### Testing & Type Checking
**No global test runner.** Run individual test files with `npx tsx`:
```bash
npx tsx packages/shared/test/memory.test.ts
npx tsx packages/shared/test/panopticon.test.ts
npx tsx apps/backend/scripts/verify_fix.ts
```

TypeScript check per workspace: `npx tsc --noEmit -w apps/frontend`

### Verification Protocol
1. Create test/verification script
2. Run with `npx tsx`
3. Assert output matches expectation
4. Delete temporary scripts before completion
5. Always run build for modified workspace

## 3. Code Style Guide

### TypeScript
- **Strict mode** - no implicit `any`
- **Explicit types** for API responses and shared structures
- Use `interface` for object shapes, `type` for unions

### Imports
```typescript
// Internal packages
import { Logger } from '@project-genesis/shared';

// Relative imports
import { helper } from '../lib/utils';

// External packages
import { FastifyInstance } from 'fastify';
```

### Naming Conventions
| Category | Convention | Example |
|----------|------------|---------|
| React files | PascalCase.tsx | `AgentCard.tsx` |
| Utilities | camelCase.ts | `useAuth.ts` |
| Classes | PascalCase | `class MemoryManager` |
| Functions | camelCase | `getUserById` |
| Constants | UPPER_CASE | `MAX_RETRY_COUNT` |
| Enums | PascalCase | `enum LogLevel` |

### Formatting
- No ESLint/Prettier - follow existing code patterns
- 2-space indentation
- Semicolons required
- Single quotes for strings

### Error Handling
- **Backend**: Log all errors, never swallow exceptions
- **Frontend**: Use Error Boundaries, show user-friendly messages
- Include trace IDs in error logs

## 4. Design System: "J.A.R.V.I.S."

- **Theme**: Minimalist futuristic, deep space
- **Colors**: Background `#0a0b0f`, Primary `#00d4ff`, Status: `#10b981` (online), `#f59e0b` (busy), `#ef4444` (offline)
- **Typography**: Body `Inter`, Code `JetBrains Mono`
- **UI**: Thin cyan borders, glass panels (8px radius), subtle glow

### Tailwind CSS v4
Uses `@tailwindcss/postcss` with CSS-first config (no tailwind.config.js):
```css
@theme {
  --color-primary: #00d4ff;
  --color-background: #0a0b0f;
}
.glass-panel {
  background: rgba(10, 11, 15, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
}
```

## 5. API Endpoints

Backend on port 3002:
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/status` | GET | System health and agent status |
| `/api/panopticon/logs` | GET | Recent system logs |
| `/api/panopticon/sop-health` | GET | SOP registry statistics |
| `/api/panopticon/costs` | GET | Cost tracking data |

### Frontend Integration
- Use `swr` for data fetching
- API base: `http://localhost:3002`
- Handle errors with toast messages

## 6. Agent Directives

1. **Monorepo Awareness**: After modifying `packages/shared`, run `npm run build -w packages/shared` before testing apps.
2. **No Magic**: Use `npm run` or `npx`, not global tools
3. **Error Handling**: Backend logs all errors. Frontend uses Error Boundaries.
4. **Clean Up**: Remove temporary verification scripts before completion
5. **Shared Changes**: Rebuild shared package after modifications

## 7. Common Issues & Fixes

- **Module not found (shared)**: Run `npm run build -w packages/shared`, restart dev server
- **Backend port conflict**: Default port 3002 - check for conflicts
- **Redis/Weaviate errors**: Run `docker-compose -f archive/v1/docker-compose.yml ps` to check status
- **Frontend build fails**: Ensure Tailwind v4 installed: `npm install -w apps/frontend`

## 8. Dependencies

**Frontend**: `next`, `react`, `tailwindcss` v4, `@tailwindcss/postcss`, `lucide-react`, `recharts`, `swr`  
**Backend**: `fastify` v5, `@fastify/cors`, `tsx`  
**Shared**: `ioredis`, `weaviate-ts-client`

## 9. File Organization

- Components: `src/components/`
- Next.js pages: `src/app/`
- Utilities: `src/lib/`
- Types: `src/types/`

### State Management
- Frontend: SWR for server state
- Backend: In-memory stores (Redis for persistence)
- Shared modules: `Logger`, `SOPRegistry`, `CostController`, `MemoryManager`, `Tracer`, `CircuitBreaker`, `LoopDetector`

## 10. Development Workflow

1. Start infrastructure: `docker-compose up -d`
2. Build shared: `npm run build -w packages/shared`
3. Start backend: `npm run dev -w apps/backend`
4. Start frontend: `npm run dev -w apps/frontend`
5. Access dashboard: `http://localhost:3000`
6. Backend API: `http://localhost:3002`

---

**Last Updated**: 2026-02-15

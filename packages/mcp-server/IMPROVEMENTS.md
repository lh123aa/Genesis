# System Improvements Roadmap

This file tracks system improvements and feature enhancements.

---

## Completed Improvements

### 1. Date Parser Module
**Date**: 2026-02-15
**File**: `packages/mcp-server/src/utils/date-parser.ts`

- Parses common event date formats
- Handles ranges and single dates
- Returns structured ParsedDate objects

### 2. Chinese Language Support
**Date**: 2026-02-15

- Added Chinese keywords for domain detection
- development → 开发/实现/创建/写
- debugging → 修复/调试/解决/bug
- web_scraping → 爬虫/抓取/采集
- research → 研究/调研/分析

### 3. Dangerous Operation Detection
**Date**: 2026-02-15
**File**: `packages/mcp-server/src/agents/enhanced-planner.ts`

- Detects delete/destructive operations
- Warns about security-sensitive operations
- Alerts for large-scale operations
- Production environment warnings

---

## Pending Improvements

### High Priority

#### 1. Playwright MCP Integration
**Description**: Integrate Playwright MCP to enable actual browser automation execution

**Required For**:
- Real web scraping
- Form filling
- Screenshot capture

**Status**: NOT_STARTED

**Implementation Notes**:
```typescript
// Need to integrate with chrome-devtools MCP
// Current limitation: Agent plans but doesn't execute
```

---

#### 2. Enhanced Date Parser
**Description**: Handle month-spanning date ranges

**Current Issue**:
- "17 Feb - 18 Mar" fails to parse
- "16 Apr - 30 Jun" fails to parse

**Status**: PARTIAL

**Fix Needed**:
```typescript
// In date-parser.ts, add:
// - Cross-month range detection
// - Handle "Mon DD - Mon DD" format
```

---

### Medium Priority

#### 3. Multi-page Navigation for Scraping
**Description**: Handle pagination in web scraping

**Current Issue**: Only first page of results extracted

**Needed For**: visitqatar.com has 5 pages

**Status**: NOT_STARTED

---

#### 4. Event Detail Extraction
**Description**: Click each event to get full details

**Current Issue**: Only basic info extracted

**Status**: NOT_STARTED

---

#### 5. Export Functionality
**Description**: Export scraped data to JSON/Markdown

**Status**: NOT_STARTED

---

### Low Priority

#### 6. Time Extraction
**Description**: Extract specific event times

**Current Issue**: Most events don't show time on list

**Status**: NOT_STARTED

---

#### 7. Location Parsing
**Description**: Parse and normalize venue names

**Current Issue**: Locations are free text

**Status**: NOT_STARTED

---

## Known System Issues

### 1. Agent Cannot Execute Tools
**Symptom**: Agent generates plan but doesn't execute
**Cause**: No actual MCP tool execution integration
**Workaround**: Manual execution via chrome-devtools

### 2. Tool Detection Shows Missing Tools
**Symptom**: "Missing: Web Browser MCP, Fetch MCP, etc."
**Cause**: Tools not actually installed
**Impact**: Low - system still plans correctly

### 3. Date Precision Varies
**Symptom**: Some dates show month only, others show specific days
**Cause**: Website data format inconsistency
**Impact**: Medium - affects time-based filtering

---

## Feature Requests

### 1. Auto-Execute Mode
- Automatically run tasks after planning
- Currently requires manual tool execution

### 2. Learning from Execution
- Track what works/doesn't work
- Improve success prediction over time

### 3. Task Templates
- Save common task patterns
- Quick reuse for similar tasks

---

*Last Updated: 2026-02-15*

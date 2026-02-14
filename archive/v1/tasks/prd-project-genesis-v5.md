# PRD: Project Genesis v5 - The Panopticon (Automated Observability & Circuit Breaker Module)

## Introduction

Project Genesis v5 introduces "The Panopticon," a comprehensive observability and safety engine designed to transform the system from merely "high-performance" to "robust, observable high-performance." This module addresses critical risks identified in previous iterations: dead loops in agent reasoning, SOP overfitting, and difficulty in debugging complex agent interactions. The Panopticon ensures system stability by enforcing strict operational boundaries and providing deep visibility into every decision.

## Goals

- **Ensure System Stability:** Prevent runaway processes and infinite loops through automated circuit breakers.
- **Control Costs:** Enforce strict token budgets per task to prevent unexpected API usage spikes.
- **Deep Observability:** Provide granular tracing of every agent thought, tool call, and SOP execution step.
- **Automated Quality Control:** Automatically flag and disable underperforming Standard Operating Procedures (SOPs).
- **Visual Debugging:** Enable developers to visualize the entire decision tree for rapid root cause analysis.

## User Stories

### US-001: Deep Tracing Implementation
**Description:** As a developer, I need every system action to be tagged with a unique `trace_id` so that I can reconstruct the entire execution flow across multiple agents and tools.

**Acceptance Criteria:**
- [ ] Every agent thought, tool call, SOP step, and Academy lookup includes a unique `trace_id`.
- [ ] Child processes inherit the parent `trace_id` for full lineage tracking.
- [ ] Logs are structured and queryable by `trace_id`.
- [ ] npm run typecheck passes.

### US-002: Loop Detection Circuit Breaker
**Description:** As a system operator, I want the system to automatically stop an agent if it repeats the same action or error multiple times to prevent "dead loops."

**Acceptance Criteria:**
- [ ] Monitor agent actions for identical consecutive outputs or errors.
- [ ] Trip circuit breaker (Force Fail) if an action/error repeats 3 times.
- [ ] Log a specific "Loop Detected" error event to the Panopticon.
- [ ] npm run typecheck passes.

### US-003: Cost Control Circuit Breaker
**Description:** As a budget manager, I want to limit the token usage per task to prevent cost overruns.

**Acceptance Criteria:**
- [ ] Track cumulative token usage for each task in real-time.
- [ ] Define a configurable token budget limit ($X or token count).
- [ ] Trip circuit breaker (Force Fail) if the limit is exceeded.
- [ ] npm run typecheck passes.

### US-004: SOP Health Monitoring
**Description:** As an SOP maintainer, I want the system to identify and disable unreliable SOPs automatically.

**Acceptance Criteria:**
- [ ] Track success/failure rates for each SOP execution.
- [ ] Flag an SOP as "Stale" if it fails > 20% of the time over a rolling window (e.g., last 50 executions).
- [ ] Automatically fallback to the Planner agent when a Stale SOP is requested.
- [ ] npm run typecheck passes.

### US-005: Visual Debugger Dashboard
**Description:** As a developer, I want a dashboard to visualize the execution tree so I can understand agent decision-making.

**Acceptance Criteria:**
- [ ] Create a CLI or Web-based dashboard interface.
- [ ] Visualize the hierarchy of agents, tasks, and subtasks using the `trace_id`.
- [ ] Display the status (Success, Failed, Circuit Tripped) of each node.
- [ ] Verify in browser using dev-browser skill (if Web-based) or terminal output (if CLI).

## Functional Requirements

### 1. The Panopticon (Safety & Monitoring Engine)
- **FR-1.1 Input Stream:** The Panopticon must ingest a real-time event stream from all system components.
- **FR-1.2 Anomaly Detection:** The system must analyze the stream for patterns indicating loops, stalls, or abnormal resource consumption.
- **FR-1.3 Circuit Breaking:** The system must be able to interrupt and terminate any active agent process immediately upon detecting a fault condition.
- **FR-1.4 Alerting:** The system must generate structured alerts for all circuit breaker trips and SOP health changes.

### 2. Workflow Integration
- **FR-2.1 Try/Catch Wrapping:** Every agent step and tool execution must be wrapped in a `try/catch` block that reports success/failure to the Panopticon.
- **FR-2.2 Academy Integration:** The Academy (SOP repository) must check the "Stale" status of an SOP before serving it. If Stale, it must deny the request or serve a warning.

### 3. Metrics & Reporting
- **FR-3.1 System Health:** The Panopticon must output a real-time system health status (Healthy, Degraded, Critical).
- **FR-3.2 Debug Logs:** The system must produce comprehensive debug logs containing the full state context for every failure.

## Non-Goals

- **Automatic SOP Repair:** The system will flag Stale SOPs but will not attempt to rewrite them automatically in this version.
- **Predictive Cost Modeling:** Cost controls are reactive (stop at limit), not predictive.
- **User-Facing Analytics:** The dashboard is for developers and operators, not end-users.

## Design Considerations

- **Dashboard:** A lightweight web dashboard (e.g., Next.js or simple HTML/JS) is preferred for visualizing complex trees, as CLI trees can become unreadable.
- **Event Bus:** Use a lightweight internal event emitter or message queue to decouple the Panopticon from the core execution logic.

## Technical Considerations

- **Trace Context:** Use `AsyncLocalStorage` (Node.js) or similar context propagation mechanisms to ensure `trace_id` availability throughout the call stack.
- **Performance:** The monitoring overhead must be negligible (< 5% latency impact).
- **Persistence:** Logs and trace data should be stored in a structured format (e.g., JSON lines, SQLite) for post-mortem analysis.

## Success Metrics

- **Mean Time to Detect (MTTD):** Reduce the time to identify a stuck agent to < 10 seconds.
- **SOP Stale Rate:** Percentage of SOPs flagged as stale (Target: < 5%).
- **Cost per Success:** Average token cost per successfully completed task (Target: Stable or decreasing).
- **Circuit Trip Rate:** Number of circuit breaker trips per 100 tasks (Target: < 1%).

## Open Questions

- Should the "Stale" threshold for SOPs be configurable per SOP complexity?
- Do we need a "manual override" to force the use of a Stale SOP during debugging?
- How long should detailed trace data be retained?

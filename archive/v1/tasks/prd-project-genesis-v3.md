# PRD: Project Genesis v3 - Adaptive High-Performance Agent System

## Introduction

Project Genesis v3 evolves the high-performance agent system from a static execution engine to an adaptive, self-improving platform. By integrating a new module called "**The Academy**," the system can automatically detect when an agent lacks the necessary skills (context or tools) to complete a task. Instead of failing, the system triggers a "Learning Loop" to acquire these skills dynamically, ensuring high success rates even for novel or evolving tasks.

## Goals

- **Detect Skill Gaps**: Automatically identify when a task requires tools or knowledge the agent currently lacks.
- **Dynamic Remediation**: Implement a tiered strategy to fix gaps via Context Injection (L1), Tool Retrieval (L2), or Human Guidance (L3).
- **Minimize Failure**: Reduce task failures caused by "missing tools" or "unknown context" to near zero.
- **Optimize Learning**: Track and minimize the "Time to Learn" (TTL) so adaptation doesn't kill performance.

## User Stories

### US-001: Skill Gap Detection
**Description:** As a Minion (Worker Agent), I want to analyze task requirements against my current capabilities before starting work, so that I can identify missing skills immediately.

**Acceptance Criteria:**
- [ ] Minion parses the incoming task prompt.
- [ ] Minion compares task needs (e.g., "scrape Rust docs") against available tools (e.g., "python_scraper") and system prompt context.
- [ ] If a match is found, proceed to execution.
- [ ] If a mismatch is found (e.g., "I don't know Rust" or "I don't have a Rust tool"), trigger the "Learning Loop" and pause execution.
- [ ] npm run typecheck passes

### US-002: Level 1 Remediation (Context Update)
**Description:** As The Academy, I want to fetch relevant documentation from the Vector DB when a knowledge gap is detected, so that the agent understands *how* to perform the task.

**Acceptance Criteria:**
- [ ] Receive "knowledge gap" signal with keywords (e.g., "Rust scraping patterns").
- [ ] Query the Vector DB for the top 3 most relevant documents/examples.
- [ ] Inject this new content into the Minion's system prompt or context window.
- [ ] Resume the Minion's task with the updated context.
- [ ] Verify in browser using dev-browser skill (if applicable for dashboard visualization)

### US-003: Level 2 Remediation (Tool Retrieval)
**Description:** As The Academy, I want to find and register a new MCP tool when a capability gap is detected, so that the agent has the *means* to perform the task.

**Acceptance Criteria:**
- [ ] Receive "tool gap" signal (e.g., "need rust_analyzer").
- [ ] Search the trusted MCP Tool Registry for a matching tool.
- [ ] If found, dynamically register the tool for the Minion.
- [ ] Verify the tool is callable by the Minion.
- [ ] If not found, escalate to Level 3.
- [ ] npm run typecheck passes

### US-004: Level 3 Remediation (Human Escalation)
**Description:** As The Academy, I want to ask a human admin for help when automated methods fail, so that the system can learn from the solution.

**Acceptance Criteria:**
- [ ] Detect failure of L1 (Context) and L2 (Tool) strategies.
- [ ] Generate a specific alert/request (e.g., "Cannot find tool for X, please provide instruction").
- [ ] Pause task and wait for human input.
- [ ] Ingest human response (text or new tool config) into the system for future use.
- [ ] npm run typecheck passes

## Functional Requirements

1.  **FR-1: The Academy Module**
    -   **Gap Analyzer**: A logic block that runs before task execution to compare `Task.requirements` vs `Agent.capabilities`.
    -   **Remediation Engine**: A state machine that executes L1 -> L2 -> L3 strategies sequentially or based on gap type.

2.  **FR-2: Workflow Integration**
    -   **Standard Loop**: Task -> Execution -> Result.
    -   **Learning Loop**: Task -> Gap Detected -> Pause -> The Academy (Remediate) -> Resume -> Execution -> Result.

3.  **FR-3: Dynamic Configuration**
    -   The system must support hot-swapping or updating the System Prompt of a live agent.
    -   The system must support dynamic registration of MCP tools without restarting the entire platform.

4.  **FR-4: Metrics & Logging**
    -   Log every "Gap Detected" event with timestamp and gap type.
    -   Log the outcome of every remediation attempt (Success/Fail).
    -   Calculate "Time to Learn" (TTL) = Time(Resume) - Time(Pause).

## Non-Goals

-   **Internal Competition**: We are NOT building a "horse race" where multiple agents compete. We improve the *single* assigned agent.
-   **General AI**: The system is not trying to learn "everything." It only learns what is strictly necessary for the current task.
-   **Unsupervised Tool Installation**: The system will NOT install arbitrary code from the internet. L2 is restricted to a *trusted* MCP registry.

## Design Considerations

-   **Architecture**: "The Academy" should be a standalone service or a specialized "Librarian" agent that other agents can call.
-   **Vector DB**: Use a high-performance vector store (e.g., Pinecone, Weaviate) to store documentation and past successful task patterns.
-   **MCP Integration**: Leverage the Model Context Protocol (MCP) to standardize how tools are defined, searched, and loaded.

## Technical Considerations

-   **Latency**: The "Learning Loop" adds time. We must ensure L1/L2 remediation takes seconds, not minutes, to maintain "High-Performance" status.
-   **Security**: Dynamically loading tools introduces risk. Ensure strict allowlisting and sandboxing for L2.
-   **State Persistence**: When a task is paused for learning, the agent's current thought process and partial work must be saved.

## Success Metrics

-   **Time to Learn (TTL)**: Average time spent in the "Learning Loop". Target: < 30 seconds for L1, < 2 minutes for L2.
-   **Adaptability Score**: Percentage of tasks that triggered a gap but were successfully completed. Target: > 90%.
-   **Reduction in Failure Rate**: Decrease in "Capability Missing" errors compared to v2.

## Open Questions

-   **Tool Registry**: Do we have a pre-built MCP registry, or do we need to build one?
-   **Human Interface**: How does the human admin receive and respond to L3 escalations? (Slack, Web Dashboard, CLI?)
-   **Cost Control**: How do we prevent the system from burning tokens on endless L1 context fetching loops?

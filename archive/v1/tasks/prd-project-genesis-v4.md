# PRD: Project Genesis v4 - Standardizing High-Performance Agent System

## Introduction

Project Genesis v4 evolves the system from "Adaptive High-Performance" to **"Standardizing High-Performance."** While v3 introduced "The Academy" to handle novel tasks via dynamic learning, v4 introduces **"The Crystallizer"** to capture successful improvisations and turn them into reusable Standard Operating Procedures (SOPs).

The goal is to close the learning loop: When a task is completed successfully and receives positive human feedback, the system abstracts the execution trace into a "Skill" (SOP). Future tasks of the same type will skip the expensive planning/adaptive phase and execute the optimized SOP directly, ensuring speed, consistency, and reduced variance.

## Goals

-   **Standardize Success**: Automatically convert successful task executions into reusable, templated Skills (SOPs).
-   **Reduce Variance**: Ensure identical tasks yield identical, high-quality results by using crystallized SOPs.
-   **Accelerate Execution**: Bypass the "Planning" and "Adaptive" phases for known task types (The "Fast Path").
-   **SOP Coverage**: Maximize the percentage of tasks handled via SOPs vs. scratch planning.

## User Stories

### US-005: Skill Crystallization Trigger
**Description:** As The Crystallizer, I want to detect when a task is successfully completed and verified by a human, so that I can initiate the SOP generation process.

**Acceptance Criteria:**
- [ ] Listen for "Task Complete" event with `status: success`.
- [ ] Verify presence of positive human feedback (e.g., rating > 4/5 or explicit approval).
- [ ] Trigger the "Crystallization Job" for the specific task ID.
- [ ] npm run typecheck passes

### US-006: Trace Analysis & Abstraction
**Description:** As The Crystallizer, I want to analyze the execution log of a successful task and abstract specific values into variables, so that the logic is reusable.

**Acceptance Criteria:**
- [ ] Retrieve full execution trace (Chain of Thought, Tools used, Prompts, Inputs/Outputs).
- [ ] Identify specific inputs (e.g., "https://example.com") and replace with variables (e.g., `$TARGET_URL`).
- [ ] Identify specific steps and generalize them (e.g., "Click 'Login'" -> "Click $ACTION_BUTTON").
- [ ] Generate a structured SOP template (YAML/JSON format).
- [ ] npm run typecheck passes

### US-007: Skill Registry Integration
**Description:** As The Crystallizer, I want to save the generated SOP to the Skill Registry, so it can be retrieved for future tasks.

**Acceptance Criteria:**
- [ ] Validate the generated SOP template against a schema.
- [ ] Generate a semantic embedding for the SOP (for retrieval).
- [ ] Save SOP and embedding to the Vector DB / Skill Registry.
- [ ] Verify the new skill is searchable via semantic query.
- [ ] npm run typecheck passes

### US-008: SOP Retrieval & Execution (The "Fast Path")
**Description:** As the Orchestrator, I want to check for an existing SOP before planning from scratch, so that I can execute known tasks instantly.

**Acceptance Criteria:**
- [ ] Upon task arrival, query Skill Registry with task description.
- [ ] If a high-confidence match (>0.85 similarity) is found, retrieve the SOP.
- [ ] Map current task inputs to SOP variables.
- [ ] Execute the SOP directly, bypassing the Planner.
- [ ] Fallback to "Plan from Scratch" (v3 workflow) if no SOP is found.
- [ ] npm run typecheck passes

## Functional Requirements

1.  **FR-1: The Crystallizer Module**
    -   **Input**: Task Trace + Human Feedback.
    -   **Process**: Trace Analysis -> Variable Abstraction -> Template Generation.
    -   **Output**: Validated SOP Template.

2.  **FR-2: Skill Registry**
    -   A Vector DB storing SOPs with semantic embeddings.
    -   Must support CRUD operations for Skills.

3.  **FR-3: Updated Workflow Logic**
    -   **Step 1**: Task Arrival.
    -   **Step 2**: Check Skill Registry.
        -   **Match Found**: Execute SOP (Fast Path).
        -   **No Match**: Plan -> Execute (Adaptive Path/v3).
    -   **Step 3**: Post-Execution.
        -   If Success + Feedback -> Trigger Crystallizer -> Save new SOP.

4.  **FR-4: Metrics & Logging**
    -   Track "SOP Hit Rate" (percentage of tasks using SOPs).
    -   Track "Execution Variance" (consistency of outputs for same-type tasks).

## Non-Goals

-   **Automatic Crystallization without Feedback**: We do NOT want to crystallize unverified workflows. Human signal is required.
-   **Over-abstraction**: We are not trying to create a "Universal Solver." SOPs should be specific to task types (e.g., "Scrape Shopify Product" vs. "Scrape Generic Site").

## Design Considerations

-   **SOP Format**: Use a declarative format (YAML or JSON) that defines a sequence of tool calls and logic checks.
-   **Variable Mapping**: The Orchestrator needs a robust way to map natural language task inputs to the structured variables in the SOP (e.g., LLM-based extraction).
-   **Versioning**: Skills should have versions. If an SOP fails, it should be flagged for review or downgrade.

## Technical Considerations

-   **Vector DB**: Continue using the high-performance vector store from v3 (Pinecone/Weaviate).
-   **LLM Context**: The "Abstraction" step requires a strong reasoning model (e.g., Claude 3.5 Sonnet or GPT-4) to correctly identify what is specific vs. generic.

## Success Metrics

-   **SOP Coverage**: > 40% of recurring tasks handled via SOPs within 3 months.
-   **Execution Speed**: SOP execution should be 3x faster than "Plan from Scratch."
-   **User Satisfaction**: > 4.5/5 average rating on SOP-executed tasks.

## Open Questions

-   **SOP Maintenance**: How do we handle "stale" SOPs (e.g., website structure changes)? Do we have an automatic "retry with planner" fallback?
-   **Feedback Loop**: How do we encourage users to provide the necessary feedback to trigger crystallization?

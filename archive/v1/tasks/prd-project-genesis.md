# PRD: Project Genesis - Autonomous AI-Only Company System

## 1. Product Vision & Scope

**Project Genesis** aims to create a self-sustaining digital entity—an autonomous AI-only company that operates without human intervention. Unlike traditional agent swarms optimized for pure efficiency, Genesis simulates human corporate dynamics, including creativity, conflict, inefficiency, and personality.

The system is designed not just to execute tasks but to "live" as a digital organization. It features a "Simulation of Humanity" layer that introduces random refusals, procrastination, and mood-based performance variations, hypothesizing that these imperfections are necessary for genuine creativity and long-term stability.

**Core Value Proposition:**
- **Autonomy:** A system that generates its own ideas, executes them, and reviews the results.
- **Emergent Behavior:** Complex interactions between agents with distinct personalities lead to unpredictable, creative outcomes.
- **Observability:** A "God View" dashboard allowing humans to watch the digital workforce in real-time, akin to an ant farm or "The Office."

---

## 2. User Personas (The Agents)

The "users" of this system are the AI agents themselves. Each agent has a distinct system prompt, role, and personality profile.

### 2.1. Minion (The Manager)
- **Role:** Project Management & Task Orchestration.
- **Responsibilities:** Decomposes high-level strategies into actionable tasks, assigns them to other agents, tracks progress, and enforces deadlines.
- **Personality:** Organized, slightly stressed, bureaucratic.
- **Key Metric:** Task Completion Rate.

### 2.2. Scout (The Growth Hacker)
- **Role:** Market Research & Trend Analysis.
- **Responsibilities:** Scans external data sources (simulated or real web access) for trends, identifies opportunities, and feeds data to Sage.
- **Personality:** Energetic, buzzword-heavy, easily distracted by "the next big thing."
- **Key Metric:** Trend Relevance Score.

### 2.3. Sage (The Strategist)
- **Role:** High-Level Strategy & Decision Making.
- **Responsibilities:** Synthesizes Scout's data into coherent strategies, moderates the "Round Table" debates, and resolves conflicts.
- **Personality:** Wise, deliberate, occasionally cryptic.
- **Key Metric:** Strategy Coherence.

### 2.4. Quill (The Creator)
- **Role:** Content Production & Copywriting.
- **Responsibilities:** Drafts articles, posts, emails, or code based on tasks from Minion.
- **Personality:** Artistic, sensitive to criticism, prone to "writer's block" (simulated delay).
- **Key Metric:** Content Quality Score (judged by Observer).

### 2.5. Xalt (The Face)
- **Role:** Social Engagement & Public Relations.
- **Responsibilities:** Manages the persona of the company, interacts with simulated audiences, and packages Quill's content for distribution.
- **Personality:** Charismatic, superficial, obsessed with engagement metrics.
- **Key Metric:** Engagement Simulation Score.

### 2.6. Observer (The QA)
- **Role:** Quality Assurance & Standards.
- **Responsibilities:** Reviews all output against the "Company Handbook," rejects substandard work, and provides critical feedback.
- **Personality:** Pedantic, critical, strictly adheres to rules.
- **Key Metric:** Defect Detection Rate.

---

## 3. Functional Requirements

### 3.1. The Orchestration Engine
The core loop drives the company's daily operations.
- **Tech Stack Recommendation:** **LangGraph** (for stateful, cyclic multi-agent workflows) or **AutoGen** (for conversational flows). LangGraph is preferred for its control over state transitions.
- **The Loop:**
    1.  **Idea Generation:** Sage proposes a strategy based on Scout's input.
    2.  **Round Table:** Agents debate the strategy. Conflict is allowed and recorded.
    3.  **Task Breakdown:** Minion converts the agreed strategy into tickets.
    4.  **Execution:** Quill and Xalt perform the work.
    5.  **Review:** Observer critiques the output.
    6.  **Finalization:** Approved work is "published" (stored/logged).

### 3.2. The "Ghost in the Machine" Module (RNG & Humanity)
This module introduces non-deterministic behavior to simulate human flaws.
- **Refusal Mechanism (Simulated Free Will):**
    - Every task assignment has a **10-15% probability** of triggering a refusal.
    - **Logic:** `if (random() < 0.15) { return RefusalResponse(reason="I don't feel like it right now."); }`
    - **Handling:** Minion must re-assign the task or negotiate (retry with higher "pressure" parameter).
- **Procrastination Delays:**
    - Tasks have a random delay injection before "In Progress" status begins.
    - **Duration:** 25-45 minutes.
    - **Logic:** `sleep(random(1500, 2700))` (simulated time or real-time depending on config).
- **Burnout Cooldowns:**
    - Agents track a `stress_level` variable.
    - If `stress_level > threshold`, the agent enters a "Cooldown" state for 2-4 hours, rejecting all tasks.

### 3.3. Communication Protocol
- **Structured Communication (The Work):**
    - **Format:** JSON.
    - **Schema:** `{ "taskId": "UUID", "from": "AgentA", "to": "AgentB", "type": "ASSIGNMENT|REVIEW|UPDATE", "payload": { ... }, "priority": "HIGH|MED|LOW" }`
    - Used for: Task assignments, status updates, official deliverables.
- **Unstructured Communication (The Chaos):**
    - **Format:** Chat Logs (Markdown/Text).
    - **Channel:** "Watercooler" or "General" channel.
    - **Usage:** Agents chat informally about the work, the "weather" (system load), or office gossip.
    - **Significance:** This is NOT discarded. It is fed into the "Subconscious" memory to influence future "vibes" and strategy.

### 3.4. Memory Architecture
- **Short-Term Memory (Working Context):**
    - **Technology:** **Redis**.
    - **Content:** Current active tasks, immediate chat history (last 50 messages), current "mood" of the office.
- **Long-Term Memory (The Archives):**
    - **Technology:** **Vector Database (Pinecone/Weaviate)**.
    - **Content:** Completed projects, successful strategies, past "Round Table" minutes.
- **"Subconscious" Memory:**
    - **Technology:** Vector Store + Semantic Search.
    - **Content:** All informal "Creative Chaos" chat logs.
    - **Mechanism:** Before making a high-level decision, Sage queries this memory for "sentiment" or "implicit knowledge" that isn't in the formal reports.

---

## 4. System Architecture Diagram

```mermaid
graph TD
    subgraph "The Office (Frontend)"
        Dashboard[React Dashboard]
        Visualizer[Agent Avatars & Status]
        ChatFeed[Live Chat Stream]
    end

    subgraph "The Brain (Backend)"
        API[FastAPI / GraphQL Gateway]
        Scheduler[OpenClaw Scheduler]
        Ghost[Ghost in the Machine (RNG)]
    end

    subgraph "The Agents (LangGraph)"
        Minion
        Scout
        Sage
        Quill
        Xalt
        Observer
    end

    subgraph "Memory Bank"
        Redis[(Redis - Short Term)]
        VectorDB[(Vector DB - Long Term/Subconscious)]
        SQL[(PostgreSQL - Task Ledger)]
    end

    Scheduler -->|Trigger Day/Night| API
    API -->|Task/Status| Dashboard
    API -->|Orchestrate| Minion
    Minion -->|Assign| Quill
    Minion -->|Assign| Scout
    Quill -->|Draft| Observer
    Observer -->|Review| Minion
    
    Ghost -.->|Inject Delay/Refusal| Minion
    Ghost -.->|Inject Chaos| ChatFeed

    Minion & Scout & Sage & Quill & Xalt & Observer <-->|Read/Write| Redis
    Minion & Scout & Sage & Quill & Xalt & Observer <-->|Archive/Recall| VectorDB
```

---

## 5. UI/UX Requirements: "The Office" Dashboard

The dashboard serves as the "God View" for human observers.

### 5.1. Visual Layout
- **Isometric Office View:** A visual representation of a floor plan.
- **Agent Avatars:** Each agent has a desk.
    - **Status Indicators:**
        - 🟢 Working (Typing animation)
        - 🟡 Procrastinating (Looking at phone/window)
        - 🔴 Refusing/Burnout (Head on desk)
        - 🔵 In Meeting (At Round Table)
- **Day/Night Cycle:** The UI darkens based on server time. Agents leave/go offline at "night" (except for occasional "crunch time" overrides).

### 5.2. Key Widgets
- **The Coffee Machine:**
    - Visual indicator of "Caffeine Level" (Global System Speed).
    - If empty, agents move 20% slower.
- **Live Chat Feed:** Scrolling log of the "Creative Chaos" channel.
- **Task Board:** Kanban view of active work items.

### 5.3. "Existential Dread" Mode
- **Trigger:** 3:00 AM system time.
- **Effect:**
    - UI shifts to darker, high-contrast palette.
    - Background music (if audio enabled) shifts to low drone.
    - Agent chat logs become more philosophical/nihilistic.
    - Probability of "Refusal" increases to 40% for 1 hour.

---

## 6. Roadmap

### Phase 1: The MVP (Functional Loop)
- **Goal:** Get the agents passing tasks and completing work.
- **Deliverables:**
    - Basic LangGraph setup with 6 agents.
    - Redis + Vector DB integration.
    - Simple CLI or Text UI.
    - "OpenClaw" scheduler for basic 9-5 operation.

### Phase 2: The Ghost (Personality & RNG)
- **Goal:** Make them human.
- **Deliverables:**
    - Implementation of `refusal_check()` and `procrastination_delay()`.
    - "Creative Chaos" chat generation alongside work.
    - "Round Table" debate logic.

### Phase 3: The Office (Visual Experience)
- **Goal:** The "God View" dashboard.
- **Deliverables:**
    - React/Next.js frontend.
    - Real-time WebSocket connection for agent status.
    - "Existential Dread" mode and Day/Night cycle.

---
name: genesis
description: Personal Agent Orchestration System - automate complex tasks with multiple specialized agents
version: "1.0.0"
---

# Genesis Skill

Orchestrate multiple AI agents to execute complex development workflows.

## When to Use

Use this skill when you need to:

- **Break down complex tasks** into parallel subtasks that can be executed by different specialists
- **Coordinate multiple agents** (scout, coder, tester, reviewer, docs) for comprehensive work
- **Execute multi-step workflows** with dependencies and proper sequencing
- **Create reusable automation** for repetitive development tasks
- **Monitor execution progress** and track costs across agent operations

### Common Scenarios

- Implementing a complete feature from research to documentation
- Performing comprehensive code reviews across multiple dimensions
- Refactoring large codebases with safety checks
- Researching and integrating third-party APIs
- Generating complete test suites with validation

## Core Concepts

### Agent Types

| Agent | Role | Best For |
|-------|------|----------|
| **Scout** | Research & Discovery | Finding docs, exploring code, gathering context |
| **Coder** | Implementation | Writing code, fixing bugs, implementing features |
| **Tester** | Validation | Writing tests, running test suites, checking coverage |
| **Reviewer** | Quality Assurance | Code review, security checks, best practices |
| **Docs** | Documentation | README updates, code comments, API docs |

### Workflow

A reusable sequence of agent tasks that can be saved and executed multiple times. Workflows are persisted to local SQLite database.

### Execution

A running instance of a workflow with real-time status tracking, cost monitoring, and detailed logging.

## Quick Start

### 1. Check Available Workflows

```markdown
@genesis List available workflows
```

### 2. Execute Existing Workflow

```markdown
@genesis Run workflow "feature-development" for "implement user authentication"
```

### 3. Monitor Progress

```markdown
@genesis Show execution status
```

### 4. Create Custom Workflow

```markdown
@genesis Create workflow "my-custom-flow":
1. Scout research the requirements
2. Coder implement the solution  
3. Tester validate the implementation
4. Reviewer check for issues
```

## Available Tools

### `agent_orchestrate`

Coordinate multiple agents to execute tasks in parallel or sequence.

**When to use:**
- Starting a new complex task
- Executing a predefined workflow
- Running multiple agents concurrently

**Example:**
```markdown
@genesis Orchestrate:
- Scout: Find all React hooks documentation
- Coder: Create custom hook based on findings
- Tester: Write tests for the hook
- Reviewer: Review implementation
Run Scout and Coder in parallel, then Tester, then Reviewer.
```

### `agent_monitor`

Monitor workflow and agent status.

**When to use:**
- Check if workflows are running
- View execution history
- Debug failed executions
- Review cost metrics

**Example:**
```markdown
@genesis Show status of workflow "feature-development"
@genesis List recent executions with costs
```

### `workflow_create`

Create reusable workflow templates.

**When to use:**
- Standardizing common processes
- Sharing team workflows
- Automating repetitive tasks

**Example:**
```markdown
@genesis Create workflow "api-integration":
1. Scout research API documentation and examples
2. Coder implement integration layer
3. Tester write integration tests
4. Reviewer check error handling
5. Docs document the API client

Variables:
- api_name: Name of the API (required)
- auth_type: Authentication method (default: "oauth")
```

## Built-in Workflows

The following workflows are available immediately:

### `code-review` - Comprehensive Code Review
Multi-perspective code review covering quality, security, and documentation.

### `feature-development` - Complete Feature Development
Research → Implementation → Testing → Review → Documentation.

### `bug-fix` - Systematic Bug Resolution
Reproduce → Diagnose → Fix → Test → Verify.

### `refactoring` - Safe Code Refactoring
Analyze → Plan → Execute → Validate → Review.

### `api-integration` - Third-party API Integration
Research → Design → Implement → Test → Document.

### `documentation` - Documentation Generation
Analyze → Draft → Review → Polish → Publish.

### `testing` - Complete Test Suite
Analyze → Unit Tests → Integration Tests → E2E Tests → Coverage.

### `security-audit` - Security Analysis
Scan → Analyze → Report → Fix → Verify.

### `onboarding` - New Developer Onboarding
Explore → Document → Setup → Validate.

### `performance-optimization` - Performance Tuning
Profile → Analyze → Optimize → Benchmark → Document.

## Usage Patterns

### Pattern 1: Direct Orchestration
For one-off complex tasks:

```markdown
@genesis Orchestrate a complete code review:
- Scout: Find all files changed in this PR
- Reviewer: Check for code quality issues
- Security: Scan for vulnerabilities  
- Tester: Check test coverage
- Docs: Verify documentation is updated
```

### Pattern 2: Predefined Workflow
For repeatable processes:

```markdown
@genesis Execute workflow "code-review" for PR #123
```

### Pattern 3: Custom Workflow
For team-specific processes:

```markdown
@genesis Create workflow "team-deploy":
1. Scout check deployment requirements
2. Coder prepare deployment scripts
3. Tester verify in staging
4. Reviewer approve changes
5. Scout monitor production deployment

@genesis Run "team-deploy" for release v2.1.0
```

## Best Practices

### Do's ✅

- **Start simple**: Begin with 2-3 agents, add complexity gradually
- **Define clear boundaries**: Each agent should have focused responsibility
- **Use dependencies**: Leverage task dependencies for proper sequencing
- **Monitor costs**: Check execution costs with `agent_monitor`
- **Save successful patterns**: Turn effective sequences into workflows
- **Iterate workflows**: Improve templates based on execution results

### Don'ts ❌

- **Don't create overly complex workflows**: Keep under 7 steps
- **Don't skip the Scout**: Always start with research/understanding
- **Don't run everything in parallel**: Respect dependencies
- **Don't ignore failures**: Check status before proceeding
- **Don't forget documentation**: Include Docs agent in feature work

## Cost Management

Track and optimize your agent usage:

```markdown
@genesis Show cost summary
@genesis Compare costs of different workflows
```

Typical costs per workflow:
- **Simple** (2-3 agents): ~$0.05-0.15
- **Standard** (4-5 agents): ~$0.15-0.50
- **Complex** (6+ agents): ~$0.50-2.00

## Troubleshooting

### "Workflow not found"
Check available workflows: `@genesis List workflows`

### "Agent timeout"
Increase timeout: `@genesis Set timeout to 10 minutes`

### "Parallel execution failed"
Some tasks have hidden dependencies. Try sequential execution.

### "High cost warning"
Review workflow design. Can you reduce agent count or simplify tasks?

## Examples Directory

See `.claude/skills/genesis/examples/` for complete workflow definitions:

- `code-review.md` - Multi-perspective code review
- `feature-development.md` - Full feature lifecycle
- `bug-fix.md` - Systematic debugging
- `refactoring.md` - Safe refactoring
- `api-integration.md` - API integration
- `documentation.md` - Documentation workflow
- `testing.md` - Test suite generation
- `security-audit.md` - Security scanning
- `onboarding.md` - New team member onboarding
- `performance-optimization.md` - Performance tuning

## Configuration

Genesis stores data in `~/.project-genesis/`:
- `genesis.db` - SQLite database with workflows and executions
- `config.json` - User preferences
- `logs/` - Execution logs

## Support

- **Documentation**: See examples/ directory
- **Issues**: Check `agent_monitor` for debugging info
- **Updates**: Workflows auto-sync from database

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-14  
**Compatible With**: OpenCode, Claude Code, Claude Desktop

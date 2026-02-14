---
name: feature-development
description: Complete feature lifecycle from research to documentation
---

# Feature Development Workflow

End-to-end feature development with proper research, implementation, testing, and documentation.

## When to Use

- Building new features from scratch
- Major enhancements to existing functionality
- Integration with third-party services
- Complex UI/UX implementations

## Workflow Steps

### 1. Research & Discovery
**Agent**: `scout`  
**Duration**: 10-15 minutes

```
Tasks:
- Research requirements and acceptance criteria
- Explore existing codebase for similar features
- Find relevant documentation and examples
- Identify dependencies and integration points
- Check for existing libraries or patterns to reuse

Deliverable:
- Research summary document
- Recommended implementation approach
- Identified risks and considerations
```

### 2. Architecture & Planning
**Agent**: `scout` + `reviewer`  
**Duration**: 10-15 minutes

```
Tasks:
- Design component/module structure
- Define interfaces and APIs
- Plan data flow and state management
- Identify test strategies
- Review plan for best practices

Deliverable:
- Architecture diagram or description
- Implementation plan with milestones
- API design document
```

### 3. Implementation
**Agent**: `coder`  
**Duration**: 30-60 minutes

```
Tasks:
- Implement core functionality following plan
- Write clean, maintainable code
- Add error handling and edge cases
- Follow existing code patterns
- Add inline comments for complex logic

Deliverable:
- Working implementation
- Unit tests for new code
```

### 4. Testing
**Agent**: `tester`  
**Duration**: 20-30 minutes

```
Tasks:
- Write comprehensive unit tests
- Create integration tests
- Test edge cases and error scenarios
- Verify acceptance criteria
- Check test coverage

Deliverable:
- Test suite with >80% coverage
- Test execution report
```

### 5. Code Review
**Agent**: `reviewer`  
**Duration**: 15-20 minutes

```
Tasks:
- Review implementation quality
- Check security best practices
- Verify performance considerations
- Ensure maintainability
- Validate against architecture plan

Deliverable:
- Code review report with suggestions
- List of required changes (if any)
```

### 6. Documentation
**Agent**: `docs`  
**Duration**: 15-20 minutes

```
Tasks:
- Update README with new feature
- Document API endpoints or interfaces
- Add code comments for public APIs
- Create usage examples
- Update changelog

Deliverable:
- Updated documentation
- Usage examples
- Migration guide if breaking changes
```

## Usage

```markdown
@genesis Execute workflow "feature-development" for "implement dark mode"
```

Or orchestrate directly:

```markdown
@genesis Orchestrate feature development:
- Scout: Research dark mode implementation approaches
- Scout: Review existing theming system
- Coder: Implement dark mode toggle and theme variables
- Tester: Write tests for theme switching
- Reviewer: Review implementation for performance
- Docs: Document theming API and usage
```

## Expected Timeline

- **Simple Feature** (2-3 agents): 1-2 hours
- **Standard Feature** (4-5 agents): 3-4 hours
- **Complex Feature** (all 6): 5-8 hours

## Success Criteria

✅ Feature implemented according to requirements  
✅ All tests passing with good coverage  
✅ Code reviewed and approved  
✅ Documentation complete  
✅ No security vulnerabilities  
✅ Performance acceptable

## Example: Dark Mode Feature

**Scout** researches: CSS variables, localStorage persistence, prefers-color-scheme  
**Plan**: Define color tokens, create ThemeProvider, add toggle component  
**Coder** implements: Theme context, CSS variable system, toggle UI  
**Tester** validates: Unit tests for theme logic, visual regression tests  
**Reviewer** approves: Clean implementation, follows React best practices  
**Docs** documents: Theming guide, component usage examples

**Result**: Complete dark mode feature ready for production

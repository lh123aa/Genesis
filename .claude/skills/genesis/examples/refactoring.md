---
name: refactoring
description: Safe code refactoring with analysis, planning, and validation
---

# Refactoring Workflow

Systematic refactoring to improve code quality while maintaining functionality.

## When to Use

- Technical debt cleanup
- Code modernization
- Performance optimization
- Improving testability
- Simplifying complex code
- Preparing for new features

## Workflow Steps

### 1. Code Analysis
**Agent**: `scout` + `reviewer`  
**Goal**: Understand current state and identify issues

```
Tasks:
- Analyze current code structure
- Identify code smells and anti-patterns
- Measure complexity metrics
- Check test coverage
- Document dependencies and risks

Deliverable:
- Analysis report
- Refactoring opportunities
- Risk assessment
```

### 2. Refactoring Plan
**Agent**: `reviewer`  
**Goal**: Create safe refactoring strategy

```
Tasks:
- Prioritize refactoring targets
- Plan incremental changes
- Identify safe refactoring patterns
- Plan rollback strategy
- Estimate effort and risks

Deliverable:
- Refactoring roadmap
- Step-by-step plan
- Success criteria
```

### 3. Test Preparation
**Agent**: `tester`  
**Goal**: Ensure safety net before changes

```
Tasks:
- Review existing tests
- Add missing tests for current behavior
- Create integration tests
- Set up baseline metrics
- Prepare test data

Deliverable:
- Comprehensive test suite
- Baseline coverage report
```

### 4. Execute Refactoring
**Agent**: `coder`  
**Goal**: Apply refactoring changes

```
Tasks:
- Follow refactoring plan
- Make incremental changes
- Run tests after each step
- Keep commits small and focused
- Document significant changes

Deliverable:
- Refactored code
- Commit history
- Change log
```

### 5. Validation
**Agent**: `tester` + `reviewer`  
**Goal**: Verify refactoring success

```
Tasks:
- Run full test suite
- Check no behavioral changes
- Verify performance improvements
- Review code quality metrics
- Compare before/after

Deliverable:
- Validation report
- Metrics comparison
- Approval for merge
```

## Refactoring Patterns

### Safe Patterns (Low Risk)
- Rename variables/functions
- Extract methods/functions
- Remove dead code
- Simplify conditionals
- Format code

### Medium Risk
- Extract classes/modules
- Move methods between classes
- Change data structures
- Refactor conditionals to polymorphism

### High Risk (Requires Extra Testing)
- Change public APIs
- Modify database schemas
- Refactor core algorithms
- Architectural changes

## Usage

```markdown
@genesis Execute workflow "refactoring" for "payment module"
```

Or detailed:

```markdown
@genesis Refactor the authentication module:
- Scout: Analyze current auth code complexity
- Reviewer: Plan extraction of auth logic into service
- Tester: Ensure 100% test coverage before changes
- Coder: Extract AuthService class incrementally
- Reviewer: Validate no breaking changes
```

## Success Metrics

### Before/After Comparison
- **Cyclomatic Complexity**: Reduced by >20%
- **Code Coverage**: Maintained or improved
- **Lines of Code**: Reduced or same
- **Test Pass Rate**: 100%
- **Performance**: Same or better

## Example: Extract Service

**Before**: Authentication logic scattered across controllers

**Analysis**: Scout finds duplication, reviewer identifies service boundary  
**Plan**: Extract AuthService with clear interface  
**Tests**: Tester ensures all auth paths are tested  
**Refactor**: Coder extracts service, updates controllers  
**Validation**: All tests pass, complexity reduced 30%

**After**: Clean AuthService, reusable, testable

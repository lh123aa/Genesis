---
name: testing
description: Generate comprehensive test suites for features and components
---

# Testing Workflow

Analyze code and generate comprehensive test coverage including unit, integration, and edge case tests.

## When to Use

- New feature testing
- Increasing test coverage
- Regression testing
- Test suite refactoring
- Adding integration tests
- Performance testing

## Workflow Steps

### 1. Code Analysis
**Agent**: `scout` + `tester`  
**Goal**: Understand what to test

```
Tasks:
- Review code structure
- Identify public interfaces
- Find business logic
- Check existing tests
- Identify test gaps
- Understand dependencies

Deliverable:
- Test coverage analysis
- Testing strategy
- Priority areas
```

### 2. Unit Tests
**Agent**: `tester`  
**Goal**: Test individual functions/components

```
Tasks:
- Write tests for public methods
- Test happy paths
- Test error conditions
- Test edge cases
- Mock dependencies
- Aim for >80% coverage

Deliverable:
- Comprehensive unit test suite
- Coverage report
```

### 3. Integration Tests
**Agent**: `tester`  
**Goal**: Test component interactions

```
Tasks:
- Test component integration
- Test API endpoints
- Test database interactions
- Test external service calls
- Verify data flow
- Test state management

Deliverable:
- Integration test suite
- Test environment setup
```

### 4. Edge Cases & Boundaries
**Agent**: `tester` + `reviewer`  
**Goal**: Ensure robustness

```
Tasks:
- Test boundary conditions
- Test invalid inputs
- Test null/undefined handling
- Test large data sets
- Test concurrent access
- Test resource limits

Deliverable:
- Edge case test suite
- Robustness validation
```

## Test Types

### Unit Tests
- Individual functions/classes
- Fast execution
- Isolated dependencies (mocked)
- High coverage

### Integration Tests
- Component interactions
- Database connections
- API endpoints
- External services

### E2E Tests
- User workflows
- Full application path
- Browser automation
- Critical paths only

### Property-Based Tests
- Randomized inputs
- Invariant checking
- Fuzzing
- Edge case discovery

## Test Quality Criteria

### Good Tests ✅
- Fast (<100ms per test)
- Independent (no shared state)
- Repeatable (deterministic)
- Readable (clear intent)
- Maintainable (easy to update)

### Anti-patterns ❌
- Testing implementation details
- Brittle tests (break on refactoring)
- Slow tests (>1s)
- Tests with external dependencies
- Tests that don't fail when they should

## Usage

```markdown
@genesis Execute workflow "testing" for "user service"
```

Or detailed:

```markdown
@genesis Create comprehensive tests:
- Scout: Analyze user service code structure
- Tester: Write unit tests for all public methods
- Tester: Create integration tests for database operations
- Reviewer: Review tests for edge cases and quality
```

## Test Structure

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', () => {});
    it('should reject duplicate email', () => {});
    it('should validate required fields', () => {});
    it('should handle database errors', () => {});
  });
  
  describe('getUser', () => {
    it('should return user by id', () => {});
    it('should return null for non-existent user', () => {});
    it('should cache frequently accessed users', () => {});
  });
});
```

## Example Test Suite

**Analysis**: Tester identifies 5 public methods, 40% coverage  
**Unit Tests**: Tests for all methods, happy paths and errors  
**Integration**: Database and API integration tests  
**Edge Cases**: Boundary conditions, null handling, concurrency

**Result**: 95% coverage, comprehensive test suite

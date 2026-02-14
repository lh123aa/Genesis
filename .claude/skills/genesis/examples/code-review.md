---
name: code-review
description: Comprehensive multi-perspective code review covering quality, security, and documentation
---

# Code Review Workflow

Complete code review from multiple expert perspectives.

## When to Use

- Before merging pull requests
- When requesting feedback on implementation
- For security-critical code changes
- When onboarding new code to the codebase

## Workflow Steps

### 1. Scout - Discovery
**Agent**: `scout`  
**Task**: Find and analyze all relevant files

```
Search for:
- All files modified in this change
- Related test files
- Documentation files
- Configuration files

Identify:
- Scope of changes
- Dependencies affected
- Integration points
```

### 2. Quality Review  
**Agent**: `reviewer`  
**Task**: Review code quality and best practices

```
Check for:
- Code readability and clarity
- Consistency with existing patterns
- Proper error handling
- Edge cases coverage
- Performance implications
```

### 3. Security Scan
**Agent**: `reviewer` (security focus)  
**Task**: Security analysis

```
Scan for:
- Input validation issues
- Injection vulnerabilities
- Authentication/authorization gaps
- Data exposure risks
- Dependency vulnerabilities
```

### 4. Test Coverage
**Agent**: `tester`  
**Task**: Validate test coverage

```
Verify:
- Unit tests exist and pass
- Integration tests cover new functionality
- Edge cases are tested
- Test quality is adequate
- Coverage meets thresholds
```

### 5. Documentation
**Agent**: `docs`  
**Task**: Check documentation

```
Ensure:
- Code comments explain complex logic
- README is updated if needed
- API documentation reflects changes
- Changelog is updated
- Migration guide if breaking changes
```

## Usage

```markdown
@genesis Execute workflow "code-review" for PR #456
```

Or with custom parameters:

```markdown
@genesis Orchestrate code review:
- Scout: Find all files in PR #456
- Reviewer: Check code quality and patterns
- Reviewer: Security scan for vulnerabilities
- Tester: Verify test coverage
- Docs: Check documentation completeness
Focus on: authentication module
```

## Expected Output

1. **Discovery Report**: Files changed and impact analysis
2. **Quality Report**: Code quality assessment with suggestions
3. **Security Report**: Security scan results and recommendations
4. **Test Report**: Coverage analysis and test recommendations
5. **Documentation Report**: Documentation completeness check

## Configuration

Variables:
- `focus_area`: Specific area to focus review on (optional)
- `strict_mode`: Enforce stricter quality standards (default: false)

## Example Review

**Input**: Adding payment processing feature

**Scout** identifies: 5 files changed, affects checkout flow
**Quality**: Good structure, needs better error handling in edge cases
**Security**: ⚠️ Missing input validation on amount field
**Tests**: Coverage 85%, needs tests for error scenarios
**Docs**: API docs need updating for new endpoints

**Result**: 3 suggestions, 1 security fix required

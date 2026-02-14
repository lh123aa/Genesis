---
name: bug-fix
description: Systematic bug resolution from reproduction to verification
---

# Bug Fix Workflow

Systematic approach to debugging and fixing issues.

## When to Use

- Production bugs reported
- Test failures in CI/CD
- User-reported issues
- Regression bugs
- Performance issues

## Workflow Steps

### 1. Reproduction
**Agent**: `scout`  
**Goal**: Understand and reproduce the bug

```
Tasks:
- Gather bug report details
- Identify affected versions
- Find reproduction steps
- Check for related issues
- Review recent changes that might have caused it

Deliverable:
- Confirmed reproduction steps
- Minimal test case
- Scope of impact
```

### 2. Root Cause Analysis
**Agent**: `scout` + `reviewer`  
**Goal**: Find the source of the bug

```
Tasks:
- Trace code execution path
- Analyze error logs and stack traces
- Check relevant configuration
- Identify the exact line(s) causing the issue
- Determine why the bug occurred

Deliverable:
- Root cause explanation
- Affected code locations
- Contributing factors
```

### 3. Fix Implementation
**Agent**: `coder`  
**Goal**: Fix the bug with minimal changes

```
Tasks:
- Implement minimal fix
- Ensure fix addresses root cause
- Avoid introducing new issues
- Follow existing code patterns
- Add comments explaining the fix

Deliverable:
- Bug fix code
- Explanation of changes
```

### 4. Regression Testing
**Agent**: `tester`  
**Goal**: Verify fix works and doesn't break anything

```
Tasks:
- Test the fix resolves the issue
- Run existing test suite
- Test edge cases
- Verify no regressions
- Add regression test to prevent recurrence

Deliverable:
- Test results
- New regression test
- Coverage report
```

### 5. Verification
**Agent**: `reviewer`  
**Goal**: Ensure fix is correct and safe

```
Tasks:
- Review fix for correctness
- Check for side effects
- Verify edge cases are handled
- Approve for deployment

Deliverable:
- Review approval
- Deployment recommendation
```

## Usage

```markdown
@genesis Execute workflow "bug-fix" for "login button not working on mobile"
```

Or detailed orchestration:

```markdown
@genesis Fix bug reported in #234:
- Scout: Reproduce the login issue on mobile
- Scout: Analyze error logs and find root cause
- Coder: Implement fix for mobile touch events
- Tester: Verify fix works on iOS and Android
- Reviewer: Review fix for security implications
```

## Bug Severity Levels

### 🔴 Critical (P0)
- System down or unusable
- Data loss or corruption
- Security vulnerability
- **Workflow**: All 5 steps, expedited

### 🟠 High (P1)
- Major feature broken
- Significant user impact
- Workaround exists
- **Workflow**: All 5 steps

### 🟡 Medium (P2)
- Minor feature issue
- Limited user impact
- Clear workaround
- **Workflow**: Skip some Scout analysis

### 🟢 Low (P3)
- Cosmetic issues
- Enhancement requests
- Nice-to-have fixes
- **Workflow**: Coder + Tester only

## Example Bug Fix

**Bug**: Users can't upload files larger than 2MB

**Reproduction**: Scout confirms issue, finds error in file size validation  
**Analysis**: Root cause: hardcoded limit in upload middleware  
**Fix**: Coder increases limit and adds configuration option  
**Testing**: Tester verifies uploads work for various file sizes  
**Review**: Reviewer approves fix, suggests documentation update

**Resolution**: Bug fixed, regression test added, deployed

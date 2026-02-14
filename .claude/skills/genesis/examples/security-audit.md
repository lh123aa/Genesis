---
name: security-audit
description: Comprehensive security analysis and vulnerability assessment
---

# Security Audit Workflow

Scan, analyze, report, and fix security vulnerabilities in code and configuration.

## When to Use

- Before production deployment
- Regular security reviews
- After major changes
- Compliance requirements
- Incident response
- Third-party integrations

## Workflow Steps

### 1. Automated Scanning
**Agent**: `tester` (security tools)  
**Goal**: Find known vulnerabilities

```
Tasks:
- Run dependency vulnerability scan
- Check for outdated packages
- Scan for secrets/credentials
- Run static analysis security testing (SAST)
- Check configuration files
- Verify security headers

Deliverable:
- Automated scan report
- List of vulnerabilities found
- Severity ratings
```

### 2. Code Review
**Agent**: `reviewer` (security focus)  
**Goal**: Manual security analysis

```
Tasks:
- Review authentication logic
- Check authorization patterns
- Analyze input validation
- Review data handling
- Check for injection vulnerabilities
- Review crypto implementations

Focus Areas:
- SQL injection
- XSS vulnerabilities
- CSRF protection
- Authentication bypasses
- Session management
- Data exposure
```

### 3. Architecture Review
**Agent**: `reviewer`  
**Goal**: Review security architecture

```
Tasks:
- Review threat model
- Check security controls
- Verify defense in depth
- Review data flow security
- Check API security
- Review logging/monitoring

Deliverable:
- Architecture security assessment
- Design recommendations
```

### 4. Remediation
**Agent**: `coder`  
**Goal**: Fix identified vulnerabilities

```
Tasks:
- Update vulnerable dependencies
- Fix code vulnerabilities
- Implement missing controls
- Add input validation
- Improve error handling
- Add security logging

Priority Order:
1. Critical (exploitable remotely)
2. High (data exposure risk)
3. Medium (limited impact)
4. Low (defense in depth)
```

### 5. Verification
**Agent**: `tester` + `reviewer`  
**Goal**: Confirm fixes are effective

```
Tasks:
- Re-run automated scans
- Verify fixes work correctly
- Test for regression
- Validate security controls
- Document remaining risks
- Update security runbooks

Deliverable:
- Verification report
- Risk acceptance (if any)
```

## Security Checklist

### Input Validation
- [ ] All user inputs validated
- [ ] Type checking enforced
- [ ] Length limits applied
- [ ] Special characters escaped
- [ ] File uploads restricted

### Authentication
- [ ] Strong password policy
- [ ] Multi-factor authentication
- [ ] Session management secure
- [ ] Brute force protection
- [ ] Secure password storage

### Authorization
- [ ] Role-based access control
- [ ] Principle of least privilege
- [ ] Resource-level permissions
- [ ] API endpoint protection

### Data Protection
- [ ] Sensitive data encrypted
- [ ] TLS for all connections
- [ ] Secure key management
- [ ] Data retention policies

### Infrastructure
- [ ] Security headers set
- [ ] Error messages don't leak info
- [ ] Logging enabled
- [ ] Rate limiting configured

## Common Vulnerabilities

### OWASP Top 10
1. Broken Access Control
2. Cryptographic Failures
3. Injection (SQL, NoSQL, OS)
4. Insecure Design
5. Security Misconfiguration
6. Vulnerable Components
7. Authentication Failures
8. Data Integrity Failures
9. Logging Failures
10. SSRF

## Usage

```markdown
@genesis Execute workflow "security-audit" for "payment module"
```

Or detailed:

```markdown
@genesis Security audit for user authentication:
- Tester: Run automated vulnerability scans
- Reviewer: Manual code review of auth logic
- Reviewer: Architecture security assessment
- Coder: Fix identified vulnerabilities
- Tester: Verify all fixes with re-scan
```

## Severity Levels

### Critical 🔴
- Remote code execution
- SQL injection
- Authentication bypass
- Data breach risk

### High 🟠
- XSS vulnerabilities
- Privilege escalation
- Sensitive data exposure
- CSRF vulnerabilities

### Medium 🟡
- Information disclosure
- Weak cryptography
- Missing security headers
- Verbose errors

### Low 🟢
- Defense in depth
- Best practice violations
- Minor misconfigurations

## Post-Audit Actions

1. **Immediate**: Fix critical and high severity
2. **Short-term**: Address medium severity (1-2 weeks)
3. **Long-term**: Plan low severity fixes
4. **Ongoing**: Regular re-audits (quarterly)

## Example Audit

**Scan**: Tester finds 2 vulnerable dependencies, 1 potential XSS  
**Review**: Reviewer finds missing input validation on 3 endpoints  
**Architecture**: CORS misconfiguration identified  
**Fix**: Coder updates deps, adds validation, fixes CORS  
**Verify**: Re-scan confirms all issues resolved

**Result**: Secure deployment approved

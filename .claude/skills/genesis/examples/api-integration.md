---
name: api-integration
description: Complete third-party API integration workflow
---

# API Integration Workflow

Research, design, implement, and document third-party API integrations.

## When to Use

- Adding new third-party services
- Migrating between API providers
- Implementing OAuth or API authentication
- Creating API client libraries
- Building webhook handlers

## Workflow Steps

### 1. API Research
**Agent**: `scout`  
**Goal**: Understand API capabilities and requirements

```
Tasks:
- Read API documentation thoroughly
- Find SDKs and client libraries
- Review authentication methods
- Identify rate limits and quotas
- Check for sandbox/test environment
- Look for community examples

Deliverable:
- API research summary
- Integration approach recommendation
- Risk and limitation assessment
```

### 2. Design Integration Layer
**Agent**: `scout` + `reviewer`  
**Goal**: Design clean integration architecture

```
Tasks:
- Design API client interface
- Plan error handling strategy
- Design retry and circuit breaker logic
- Plan for rate limiting
- Consider caching strategy
- Design webhook handlers if needed

Deliverable:
- API client design document
- Interface definitions
- Error handling strategy
```

### 3. Implement Client
**Agent**: `coder`  
**Goal**: Build robust API client

```
Tasks:
- Implement API client class
- Add authentication handling
- Implement core API methods
- Add error handling and retries
- Add logging and monitoring
- Follow best practices for HTTP clients

Deliverable:
- Working API client
- Type definitions
- Basic documentation
```

### 4. Integration Testing
**Agent**: `tester`  
**Goal**: Ensure reliable integration

```
Tasks:
- Write unit tests with mocked API
- Create integration tests with sandbox
- Test error scenarios
- Test rate limiting handling
- Test authentication flows
- Verify retry logic

Deliverable:
- Comprehensive test suite
- Integration test results
```

### 5. Documentation
**Agent**: `docs`  
**Goal**: Document usage and configuration

```
Tasks:
- Document API client usage
- Provide configuration examples
- Document error handling
- Add setup instructions
- Include troubleshooting guide
- Document rate limits

Deliverable:
- API client documentation
- Usage examples
- Configuration guide
```

## Common API Patterns

### REST API
- HTTP methods (GET, POST, PUT, DELETE)
- JSON request/response
- Status code handling
- Pagination strategies

### GraphQL
- Query and mutation design
- Variable handling
- Error format differences
- Batching considerations

### Webhooks
- Event verification
- Signature validation
- Idempotency handling
- Endpoint security

## Authentication Methods

### API Key
```typescript
headers: { 'Authorization': 'Bearer ' + apiKey }
```

### OAuth 2.0
- Authorization code flow
- Client credentials flow
- Token refresh handling
- Scope management

### JWT
- Token validation
- Expiration handling
- Claims extraction

## Usage

```markdown
@genesis Execute workflow "api-integration" for "Stripe payment API"
```

Or detailed:

```markdown
@genesis Integrate SendGrid email API:
- Scout: Research SendGrid API and authentication
- Scout: Review existing email service interface
- Coder: Implement SendGridEmailProvider class
- Tester: Write tests for email sending
- Docs: Document configuration and usage
```

## Integration Checklist

### Before Implementation
- [ ] API documentation reviewed
- [ ] Authentication method confirmed
- [ ] Rate limits understood
- [ ] Test environment available
- [ ] Error scenarios identified

### During Implementation
- [ ] Client handles all HTTP status codes
- [ ] Retry logic implemented
- [ ] Timeout configured
- [ ] Logging added
- [ ] Types defined

### After Implementation
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Error scenarios tested
- [ ] Documentation complete
- [ ] Security review done

## Example: Stripe Integration

**Research**: Scout reviews Stripe docs, finds official SDK  
**Design**: Plan StripePaymentProvider implementing PaymentProvider interface  
**Implement**: Coder creates provider with charge, refund, webhook methods  
**Test**: Tester mocks Stripe API, tests all payment flows  
**Document**: Usage examples, webhook setup, error handling

**Result**: Clean abstraction over Stripe, easily swappable

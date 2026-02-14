---
name: documentation
description: Generate comprehensive documentation from code and requirements
---

# Documentation Workflow

Analyze, draft, review, and publish documentation for features, APIs, and processes.

## When to Use

- New feature documentation
- API documentation updates
- README improvements
- Code documentation
- User guides and tutorials
- Architecture decision records (ADRs)

## Workflow Steps

### 1. Analysis
**Agent**: `scout`  
**Goal**: Understand what needs documentation

```
Tasks:
- Review existing documentation
- Analyze code changes
- Identify documentation gaps
- Check for outdated content
- Review similar documentation examples
- Understand target audience

Deliverable:
- Documentation needs assessment
- Gap analysis report
- Audience and style guidelines
```

### 2. Drafting
**Agent**: `docs`  
**Goal**: Create initial documentation draft

```
Tasks:
- Write first draft based on analysis
- Include code examples
- Add diagrams if needed
- Follow documentation style guide
- Cover all key points
- Structure for readability

Deliverable:
- Documentation draft
- Code examples
- Initial structure
```

### 3. Technical Review
**Agent**: `reviewer`  
**Goal**: Ensure technical accuracy

```
Tasks:
- Verify technical correctness
- Check code examples work
- Validate API signatures
- Review for completeness
- Check for accuracy

Deliverable:
- Technical review comments
- Corrections needed
- Approval or revision request
```

### 4. Polish & Format
**Agent**: `docs`  
**Goal**: Finalize documentation quality

```
Tasks:
- Apply review feedback
- Improve clarity and flow
- Format consistently
- Add cross-references
- Check spelling and grammar
- Ensure examples are runnable

Deliverable:
- Polished documentation
- Final draft
```

## Documentation Types

### README
- Project overview
- Quick start guide
- Installation instructions
- Basic usage examples
- Contribution guidelines

### API Documentation
- Endpoint descriptions
- Request/response formats
- Authentication details
- Error codes
- Code examples

### Code Comments
- Function/method purpose
- Parameter descriptions
- Return value details
- Usage examples
- Edge cases

### User Guides
- Step-by-step instructions
- Screenshots/diagrams
- Troubleshooting
- FAQs
- Best practices

### Architecture Docs
- System overview
- Component diagrams
- Data flow
- Design decisions
- Trade-offs

## Usage

```markdown
@genesis Execute workflow "documentation" for "authentication API"
```

Or detailed:

```markdown
@genesis Document the new payment feature:
- Scout: Analyze payment code and existing docs
- Docs: Draft API documentation with examples
- Reviewer: Verify technical accuracy
- Docs: Polish and finalize documentation
```

## Documentation Standards

### Structure
1. **Overview** - What and why
2. **Prerequisites** - What's needed
3. **Quick Start** - Get started fast
4. **Detailed Guide** - Full explanation
5. **Examples** - Real-world usage
6. **Troubleshooting** - Common issues

### Style Guidelines
- Clear, concise language
- Active voice
- Present tense
- Code blocks for technical content
- Consistent terminology
- Accessible language (avoid jargon)

### Code Examples
- Runnable and tested
- Progressive complexity
- Real-world scenarios
- Comments explaining key points
- Error handling included

## Example: API Documentation

**Analysis**: Scout reviews REST endpoints, identifies missing docs  
**Draft**: Docs writes endpoint descriptions with examples  
**Review**: Reviewer tests all examples, suggests improvements  
**Polish**: Docs finalizes with error handling and edge cases

**Result**: Complete API documentation ready for developers

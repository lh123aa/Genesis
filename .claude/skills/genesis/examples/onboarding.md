---
name: onboarding
description: New team member or developer onboarding workflow
---

# Onboarding Workflow

Help new developers get up to speed with the codebase, processes, and tools.

## When to Use

- New team member joining
- Developer rotating to new project
- Contractor starting work
- Intern beginning assignment
- Cross-team collaboration

## Workflow Steps

### 1. Environment Exploration
**Agent**: `scout`  
**Goal**: Understand project structure

```
Tasks:
- Explore repository structure
- Identify key directories
- Find documentation
- Check build/development setup
- Review architecture overview
- Identify main entry points

Deliverable:
- Project structure map
- Key files and directories
- Setup requirements
```

### 2. Documentation Review
**Agent**: `docs`  
**Goal**: Learn project context

```
Tasks:
- Read README and getting started
- Review architecture documents
- Check coding standards
- Review contribution guidelines
- Understand deployment process
- Learn testing procedures

Deliverable:
- Documentation summary
- Key concepts explained
- Common commands reference
```

### 3. Code Walkthrough
**Agent**: `scout` + `reviewer`  
**Goal**: Understand codebase patterns

```
Tasks:
- Walk through main code paths
- Explain design patterns used
- Show example implementations
- Review test structure
- Identify common utilities
- Explain data flow

Focus Areas:
- Main application entry
- Key business logic
- Data layer
- API endpoints
- Authentication/authorization
```

### 4. Hands-on Exercise
**Agent**: `coder` + `tester`  
**Goal**: Practical learning

```
Tasks:
- Complete a small task
- Set up development environment
- Make a minor change
- Run tests locally
- Create a pull request
- Go through review process

Exercise Ideas:
- Fix a small bug
- Add a simple feature
- Write a test
- Update documentation
```

## Onboarding Checklist

### Day 1: Setup
- [ ] Access to repositories granted
- [ ] Development environment set up
- [ ] Build working locally
- [ ] Tests passing locally
- [ ] IDE configured
- [ ] Access to necessary tools

### Week 1: Understanding
- [ ] Project overview understood
- [ ] Architecture documented
- [ ] Key components identified
- [ ] First commit merged
- [ ] Team introductions complete

### Month 1: Integration
- [ ] Can work independently on small tasks
- [ ] Understands deployment process
- [ ] Knows who to ask for help
- [ ] Comfortable with codebase
- [ ] Contributing effectively

## Documentation for Newcomers

### Essential Reads
1. README.md - Project overview
2. CONTRIBUTING.md - How to contribute
3. Architecture docs - System design
4. API documentation - If applicable
5. Deployment guide - How to release

### Code Patterns
- Project structure conventions
- Naming conventions
- Testing patterns
- Error handling approach
- State management

### Tools & Processes
- Version control workflow
- Code review process
- CI/CD pipeline
- Testing requirements
- Communication channels

## Usage

```markdown
@genesis Execute workflow "onboarding" for new team member
```

Or detailed:

```markdown
@genesis Onboard Sarah to the API team:
- Scout: Explore codebase structure and key files
- Docs: Review all documentation and summarize
- Reviewer: Walk through main code paths and patterns
- Coder: Guide through first bug fix with PR process
```

## Mentorship Tips

### For Mentors
- Assign a buddy/mentor
- Set clear expectations
- Regular check-ins
- Safe environment for questions
- Gradual complexity increase

### For Newcomers
- Ask questions early
- Take notes
- Shadow experienced devs
- Start with small wins
- Give feedback on onboarding process

## Common Challenges

### Technical
- Environment setup issues
- Dependencies conflicts
- Build/test failures
- IDE configuration

### Domain
- Business logic complexity
- Legacy code understanding
- Terminology learning
- Architecture grasp

### Process
- Git workflow unfamiliar
- Code review expectations
- Testing requirements
- Deployment process

## Success Metrics

- Time to first commit: < 3 days
- Time to independent task: < 2 weeks
- Time to full productivity: < 1 month
- Documentation completeness: 100%
- New hire satisfaction: > 4/5

## Example Onboarding

**Week 1**: Environment setup, docs review, small bug fix  
**Week 2**: Feature implementation with guidance  
**Week 3**: Independent work on medium tasks  
**Week 4**: Full team integration

**Result**: New developer productive and integrated

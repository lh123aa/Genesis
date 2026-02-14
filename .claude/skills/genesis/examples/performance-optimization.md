---
name: performance-optimization
description: Performance profiling, analysis, and optimization workflow
---

# Performance Optimization Workflow

Profile, analyze, optimize, and benchmark application performance.

## When to Use

- Slow response times reported
- High resource usage
- Scaling issues
- User complaints about speed
- Before major releases
- Regular performance maintenance

## Workflow Steps

### 1. Profiling
**Agent**: `scout`  
**Goal**: Identify performance bottlenecks

```
Tasks:
- Run performance benchmarks
- Profile CPU usage
- Analyze memory usage
- Check database query performance
- Measure API response times
- Identify slow operations

Tools:
- Chrome DevTools
- Node.js profiler
- Database query analyzer
- Load testing tools
- APM tools

Deliverable:
- Performance baseline
- Bottleneck identification
- Hot path analysis
```

### 2. Analysis
**Agent**: `scout` + `reviewer`  
**Goal**: Understand root causes

```
Tasks:
- Analyze slow queries
- Review algorithmic complexity
- Check for N+1 queries
- Identify memory leaks
- Analyze bundle size
- Review caching strategy

Common Issues:
- Missing database indexes
- Inefficient algorithms
- Synchronous blocking
- Memory leaks
- Over-fetching data
- Missing caching
```

### 3. Optimization Planning
**Agent**: `reviewer`  
**Goal**: Plan improvements

```
Tasks:
- Prioritize optimizations
- Estimate impact
- Plan implementation order
- Identify risks
- Set success criteria
- Plan A/B testing

Optimization Priority:
1. Database queries (usually biggest impact)
2. Algorithm efficiency
3. Caching strategy
4. Async operations
5. Resource loading
```

### 4. Implementation
**Agent**: `coder`  
**Goal**: Apply optimizations

```
Tasks:
- Optimize database queries
- Add/improve caching
- Refactor slow algorithms
- Implement lazy loading
- Optimize bundle size
- Add connection pooling

Common Optimizations:
- Add database indexes
- Implement Redis caching
- Optimize React renders
- Lazy load components
- Compress assets
- Enable gzip
```

### 5. Validation
**Agent**: `tester`  
**Goal**: Verify improvements

```
Tasks:
- Re-run benchmarks
- Compare before/after
- Test under load
- Verify no regressions
- Check resource usage
- Measure user metrics

Deliverable:
- Performance comparison
- Improvement metrics
- Load test results
```

## Performance Metrics

### Response Time
- P50 (median)
- P95 (95th percentile)
- P99 (99th percentile)
- Maximum response time

### Throughput
- Requests per second
- Concurrent users
- Transactions per minute

### Resource Usage
- CPU utilization
- Memory usage
- Database connections
- Network I/O

### Frontend Metrics
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Cumulative Layout Shift (CLS)

## Optimization Techniques

### Database
- Add indexes
- Query optimization
- Connection pooling
- Read replicas
- Caching layer

### Application
- Async processing
- Caching (Redis/Memcached)
- Batch operations
- Pagination
- Background jobs

### Frontend
- Code splitting
- Lazy loading
- Image optimization
- Bundle size reduction
- Service workers

### Infrastructure
- CDN usage
- Load balancing
- Auto-scaling
- Edge caching
- Compression

## Usage

```markdown
@genesis Execute workflow "performance-optimization" for "API endpoints"
```

Or detailed:

```markdown
@genesis Optimize dashboard performance:
- Scout: Profile current load time and bottlenecks
- Scout: Analyze database queries and API calls
- Reviewer: Plan caching and optimization strategy
- Coder: Implement Redis caching and query optimization
- Tester: Benchmark improvements and verify no regressions
```

## Performance Budgets

Set limits for:
- Page load time: < 3 seconds
- API response: < 200ms (P95)
- Bundle size: < 200KB (initial)
- Memory usage: < 100MB
- Database query: < 100ms

## Before/After Example

**Problem**: Dashboard loads in 8 seconds

**Profiling**: Scout finds 50+ API calls, slow queries, large bundle  
**Analysis**: N+1 queries, missing indexes, no caching  
**Plan**: Add indexes, implement caching, optimize bundle  
**Optimize**: Coder implements Redis, adds DB indexes, lazy loading  
**Validate**: Load time reduced to 1.2 seconds (85% improvement)

**Result**: Performance budget met, user satisfaction improved

## Monitoring

### Continuous
- APM tools (New Relic, DataDog)
- Real User Monitoring (RUM)
- Error tracking
- Performance dashboards

### Alerts
- Response time > threshold
- Error rate increase
- Resource usage spikes
- Throughput drops

## Success Criteria

- Response time improved by >30%
- Resource usage reduced by >20%
- No functional regressions
- Tests still passing
- User satisfaction improved

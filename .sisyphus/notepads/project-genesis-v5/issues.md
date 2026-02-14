# Issues

Record problems, blockers, and gotchas encountered here.

## Environment Constraints
- `docker` and `docker-compose` binaries were not available in the execution environment.
- **Mitigation**: Manual syntax verification of `docker-compose.yml` was performed instead of automated `docker-compose config`.
## Memory Client Testing
- Tests for Redis and Weaviate connections fail if services are not running.
-  throws  and retries up to 20 times by default.
-  uses  which fails if the host is unreachable.
## Memory Client Testing
- Tests for Redis and Weaviate connections fail if services are not running.
- ioredis throws ECONNREFUSED and retries up to 20 times by default.
- weaviate-ts-client uses fetch which fails if the host is unreachable.

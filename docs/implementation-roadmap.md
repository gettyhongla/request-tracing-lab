# Implementation Roadmap

This roadmap protects the work already completed. The current Flask request-tracing lab remains the foundation and every new capability extends it.

## Guiding rules

1. Do not replace the current application with an unrelated demo.
2. Add one production dependency at a time.
3. Establish healthy behavior before injecting failure.
4. Every failure must produce observable evidence.
5. Prefer read-only investigation before changing state.
6. Do not claim a root cause until the proposed fix is validated.
7. Keep personal interview reflections and learning journals private by default.

## Milestone 0 — Preserve the foundation

Status: **in progress**

- Keep `app.py`, existing endpoints, request hooks, request IDs, labs, operations exercises, architecture exercises, and answer sets.
- Document the staged learning path.
- Ignore private progress and interview-reflection files.
- Avoid moving current files until the public navigation is stable.

Exit criteria:

- Existing installation instructions still work.
- Existing labs can still be completed without new infrastructure.
- The repository clearly explains how current work connects to later phases.

## Milestone 1 — Strengthen single-service telemetry

Add to every request log where practical:

```text
request_id
method
path
status_code
duration_ms
client_ip
user_agent
service_name
environment
app_version
hostname
```

Implementation tasks:

- convert request logs to structured JSON or add an optional JSON logging mode
- return or log application version and hostname
- separate `/health/live` and `/health/ready`
- preserve the existing `/health` route for backward compatibility
- add tests for request ID creation and propagation

Failure labs:

- client-supplied request ID
- malformed or missing authentication
- controlled 500 response
- slow request
- readiness failure while liveness remains healthy

## Milestone 2 — Add PostgreSQL

Implementation tasks:

- add a database configuration module
- move lab users into PostgreSQL
- add a small operational table such as `request_events` or `report_jobs`
- add migrations
- add Docker Compose for Flask and PostgreSQL
- keep a simple local mode where appropriate

Healthy-path labs:

- confirm the application connected to the intended database
- query a user row
- correlate an API response with a database record

Failure labs:

- wrong database hostname
- invalid credentials
- database unavailable
- slow query
- missing index
- lock contention
- exhausted connection pool

Required evidence:

- application logs
- connection error
- query timing
- PostgreSQL activity or lock query
- request ID and relevant database row

## Milestone 3 — Add NGINX

Implementation tasks:

- place NGINX in front of Flask
- forward `X-Request-ID` or create it when absent
- forward client and protocol headers safely
- expose NGINX access logs
- add upstream timing fields

Failure labs:

- incorrect upstream port
- upstream timeout
- request-body limit
- 502 versus 504
- missing forwarded headers

Required evidence:

- client response
- NGINX access and error logs
- Flask logs
- upstream response and timing fields

## Milestone 4 — Add Redis

Use Redis first for one clear responsibility: sessions, caching, or queueing. Add other uses only after the first path is understood.

Implementation tasks:

- add Redis to Docker Compose
- expose cache or session behavior in logs and metrics
- record cache hit or miss
- define TTL behavior

Failure labs:

- Redis unavailable
- expired key
- stale cache
- cache stampede
- memory pressure or eviction
- application fallback behavior

## Milestone 5 — Add containers and Kubernetes

Implementation tasks:

- harden the existing container image
- run as a non-root user
- add health checks
- create Kubernetes Deployment, Service, ConfigMap, and Secret examples
- add liveness, readiness, and startup probes
- include app version and pod name in logs or responses

Failure labs:

- `CrashLoopBackOff`
- `ImagePullBackOff`
- incorrect Secret or ConfigMap
- failed readiness probe
- `OOMKilled`
- Service selector mismatch
- cluster DNS failure
- blocked dependency connection
- partial or incorrect deployment version

## Milestone 6 — Add metrics, dashboards, and traces

Implementation tasks:

- Prometheus application metrics
- Grafana dashboard
- OpenTelemetry instrumentation
- trace propagation through NGINX and Flask
- dependency spans for PostgreSQL and Redis

Core signals:

- request rate
- error rate
- duration percentiles
- in-progress requests
- pod CPU and memory
- database connection use
- cache hit ratio

Failure labs:

- latency isolated to one dependency
- error spike after deployment
- one unhealthy replica
- missing trace propagation
- alert that is noisy or unactionable

## Milestone 7 — Add Redis/RQ workers

Implementation tasks:

- add a report-generation or notification job
- return a job ID from the API
- propagate request and trace context into the job
- add job-status inspection
- record retries and failures

Failure labs:

- worker stopped
- growing queue depth
- failed job
- poison message
- duplicate execution
- long-running job
- retry storm

## Milestone 8 — Add production incident packs

Each incident pack should contain:

```text
customer-report.md
architecture.md
evidence/
investigation-workbook.md
customer-update-template.md
engineering-escalation-template.md
runbook.md
postmortem-template.md
```

Initial incidents:

1. Login latency after a deployment
2. Intermittent 502 responses
3. Kubernetes pods healthy but service unavailable
4. Database connection saturation
5. Redis failure causing authentication problems
6. Queue backlog delaying report completion
7. TLS or certificate failure
8. DNS-versus-routing failure
9. WebSocket idle timeout
10. One replica running the wrong version

## Milestone 9 — Distributed architecture and scale exercises

Only after the earlier milestones are functional:

- split one responsibility into a separate service
- add explicit timeout and retry policies
- introduce circuit breaking or graceful degradation
- run load tests and document capacity limits
- test rolling deployment and rollback behavior
- model availability and regional failure tradeoffs

## Immediate next implementation slice

The next code-focused pull request should be intentionally small:

1. Enhance request logs with `duration_ms`, `service_name`, `app_version`, and `hostname`.
2. Add `/health/live` and `/health/ready` while preserving `/health`.
3. Add automated tests for health routes and request ID behavior.
4. Add a first runbook for investigating an unhealthy application instance.

This gives the project a stronger operational foundation without introducing a database, Redis, Kubernetes, or observability stack prematurely.

# Production Systems Learning Path

The project grows by extending the same request-tracing application rather than replacing it. Each phase preserves the earlier work and adds one new production layer.

## Phase 1 — Single-Service Request Tracing

**Current foundation**

```text
Browser or curl
      |
      v
Flask application
      |
      v
Application logs
```

Practice:

- HTTP methods, headers, bodies, and status codes
- cookies and Flask sessions
- JWT authentication
- `X-Request-ID` correlation
- latency and application errors
- DevTools, `curl`, and server logs
- controlled failure injection
- local HTTPS and TLS inspection

Completion standard:

> Trace one request from the client to Flask and back, identify the evidence at each step, and explain where a failed request stopped.

## Phase 2 — Three-Tier Application

Extend the existing Flask app with:

```text
Browser
   |
   v
NGINX reverse proxy
   |
   v
Flask API
   |
   v
PostgreSQL
```

Add Redis after the database path is understood:

```text
Flask API
   |-- PostgreSQL
   `-- Redis
```

Practice:

- reverse-proxy behavior and forwarded headers
- database-backed users and operational SQL queries
- connection failures and connection-pool exhaustion
- Redis-backed sessions or caching
- cache hit, miss, expiry, and stale-data behavior
- separating proxy, application, cache, and database faults

## Phase 3 — Containers and Kubernetes

Deploy the same application rather than introducing a new demo workload.

```text
Ingress
   |
   v
Service
   |
   v
Flask Deployment
   |
   v
Multiple Pods
```

Practice:

- container image integrity
- environment variables and secrets
- Services, Deployments, ReplicaSets, and Pods
- liveness, readiness, and startup probes
- `CrashLoopBackOff`, `ImagePullBackOff`, and `OOMKilled`
- DNS and connectivity inside the cluster
- identifying which pod and version handled a request

## Phase 4 — Observability

Evolve the existing request logging into correlated telemetry.

```text
request_id
   |-- structured logs
   |-- Prometheus metrics
   |-- OpenTelemetry traces
   |-- Grafana dashboards
   `-- alerts
```

Practice:

- JSON logs
- service, pod, environment, and version fields
- request rate, error rate, and duration metrics
- trace and span IDs
- RED and USE methods
- dashboards, alert thresholds, and evidence-backed escalation

## Phase 5 — Queues and Workers

Add an asynchronous workflow using Redis/RQ or a comparable queue.

```text
POST /reports
      |
      v
API creates job
      |
      v
Queue
      |
      v
Worker
      |
      v
PostgreSQL result
```

Practice:

- queue depth and backlog
- failed and stuck jobs
- retry behavior
- duplicate execution and idempotency
- request ID, job ID, and trace correlation
- eventual consistency
- backpressure

## Phase 6 — Distributed Services

Split services only after the monolith and its dependencies are understood.

```text
Gateway
  |-- Auth service
  |-- User service
  |-- Report service
  `-- Worker service
```

Practice:

- request propagation across services
- timeouts, retries, and circuit breakers
- partial failure
- service-to-service authentication
- fault isolation
- identifying the failed hop using logs, metrics, traces, queue state, and database rows

## Phase 7 — Production Incident Operations

Every technical layer becomes a customer-facing incident scenario.

Use the same investigation loop:

```text
Establish impact
      |
Reproduce safely
      |
Collect evidence
      |
Form candidate hypotheses
      |
Run the cheapest disconfirming check
      |
Identify the failed layer
      |
Mitigate
      |
Prove the root cause
      |
Prevent recurrence
```

Required outputs:

- investigation notes
- customer status update
- engineering escalation
- runbook
- post-incident review

## Phase 8 — Scale and Reliability Design

Use the running system to explore larger-company design principles without pretending the lab itself requires global scale.

Practice:

- horizontal scaling
- statelessness
- graceful degradation
- load and capacity testing
- caching and backpressure
- high availability
- regional failure
- safe deployments and rollbacks
- SLOs, error budgets, and availability tradeoffs

## Phase 9 — Interview Mode

Investigate scenarios without being told which component is broken.

Each scenario should test four abilities:

1. Ask precise scoping questions.
2. Build and rank hypotheses.
3. Use evidence to eliminate causes.
4. Explain findings clearly to customers and engineers.

The objective is not to memorize a perfect answer. It is to make structured, evidence-first reasoning automatic.

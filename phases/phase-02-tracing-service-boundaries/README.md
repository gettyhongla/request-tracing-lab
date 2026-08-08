# Phase 2: Tracing Service Boundaries

Phase 2 teaches architecture comprehension and request tracing across service boundaries.

The application is the lab environment. The goal is not to build a feature-rich product; the goal is to understand how a request moves through a proxy, application, Redis, PostgreSQL, and optional async/outbound boundaries, then prove where behavior changed when something fails.

The goal is to build the mental model deeply enough to answer operational questions like:

```text
How does the request reach the app?
Why is NGINX placed in front?
Where does durable data live?
How does one support ticket become database records?
What is the difference between authentication and authorization?
What is the difference between an API, webhook, queue, worker, and WebSocket?
What is the difference between health and readiness?
Where does Redis fit, and what should not be stored there?
How do request IDs, logs, metrics, and latency measurements help an RCA?
How can CPU, memory, and replica needs be justified from evidence?
What evidence would prove the database is or is not the bottleneck?
What is the difference between cache, queue, worker, async, and real-time?
```

Use this phase loop repeatedly:

```text
Understand -> Visualize -> Predict -> Observe -> Trace -> Diagnose -> Fix -> Validate -> Improve
```

## Target Architecture

Start with the core request path from Labs 01-04:

```text
Browser or curl
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

Then extend the path only where it teaches a boundary:

```text
Browser
  |
  v
NGINX
  |
  v
Flask support-ticket API
  |-- PostgreSQL
  |     |-- users
  |     |-- tickets
  |     |-- ticket messages
  |     `-- audit events
  |
  |-- Redis
  |     |-- sessions
  |     |-- cache
  |     `-- queue
  |
  |-- Background worker
  |     `-- notification or diagnostic jobs
  |
  |-- Webhook delivery
  |     `-- external event consumers
  |
  `-- WebSocket/SSE/polling path
        `-- real-time ticket updates
```

These mechanisms solve different problems:

```text
PostgreSQL is the durable source of truth.
Redis stores temporary state and queue data.
Workers process asynchronous jobs.
Webhooks and WebSockets are light architecture comparisons in this phase. They are useful boundaries, but they should not dominate the curriculum.
```

![Three-tier architecture request flow](assets/three-tier-request-flow.png)

For the current implemented Phase 2 architecture through Lab 06, use the editable Mermaid view and database concept notes:

[Labs 01-06 current architecture](assets/lab-06-current-architecture.md)

Architecture-first references:

- [Core service-boundary diagrams](architecture/service-boundaries.md)
- [Microservice request-path reading exercise](architecture/microservice-request-path.md)
- [Troubleshooting worksheet](worksheets/evidence-first-troubleshooting.md)
- [Challenge scenarios](challenges/README.md)

## Lab Order

| Lab | Focus | Outcome |
| --- | --- | --- |
| [01](LABS.md#lab-01-three-tier-architecture) | Three-tier architecture | Draw the system, name each layer, and define the request path before coding |
| [02](LABS.md#lab-02-nginx-reverse-proxy) | NGINX reverse proxy | Put NGINX in front of Flask and prove how traffic is routed |
| [03](LABS.md#lab-03-postgresql-persistence) | PostgreSQL as a durable boundary | Add durable data and prove basic reads/writes, connection behavior, and failure symptoms |
| [04](LABS.md#lab-04-redis-cache-and-session-support) | Redis as a temporary-state boundary | Add Redis for one temporary responsibility and prove hit, miss, expiry, fallback, and connection failure behavior |
| [05](LABS.md#lab-05-support-ticket-data-model) | Support ticket data model | Evolve notes into users, tickets, messages, admin actions, authorization, indexes, and request-traced database evidence |
| [06](LABS.md#lab-06-database-operations-performance-and-resilience) | Database dependency troubleshooting | Investigate connection, query latency, transaction, and backup evidence without turning Phase 2 into a database course |
| [07](LABS.md#lab-07-api-design-and-authentication) | API design and authentication | Explain REST resources, status codes, validation, sessions, JWT comparison, authorization, and idempotency |
| [08](LABS.md#lab-08-webhooks-and-asynchronous-delivery) | Webhooks as an optional outbound boundary | Map a durable ticket event to an outbound callback and reason about timeout, retry, duplicate delivery, and idempotency |
| [09](LABS.md#lab-09-workers-and-queues) | Workers and queues | Trace request accepted -> work queued -> worker processed later, including backlog and failed-job evidence |
| [10](LABS.md#lab-10-websockets-and-real-time-updates) | Real-time communication comparison | Compare polling, SSE, WebSockets, and webhooks conceptually without making real-time implementation the center of Phase 2 |
| [11](LABS.md#lab-11-health-and-readiness) | Health and readiness | Decide which dependencies are critical, degraded, or optional for safe traffic |
| [12](LABS.md#lab-12-logs-metrics-traces-and-request-ids) | Observability and request correlation | Correlate logs, metrics, traces, request IDs, DB, Redis, worker, webhook, and WebSocket evidence |
| [13](LABS.md#lab-13-container-foundation) | Container foundation | Manually containerize the Flask API and prepare for Phase 3 without building the full orchestration platform |
| [14](LABS.md#lab-14-production-readiness-review) | Service-boundary readiness review | Review request paths, failure boundaries, observability, focused load checks, escalation quality, and improvement opportunities |

## How To Use These Labs

Do not race through the files. For each lab:

```text
1. Build one small thing.
2. Send one request.
3. Capture evidence.
4. Break one related thing.
5. Explain the symptom.
6. Explain the failed layer.
7. Write the retained takeaway.
```

Each completed lab belongs in:

```text
AnswersByGetty/phase-02.md
```

## Evidence Standard

Use this worksheet unless the lab gives a more specific one:

```text
Goal:
Architecture or request path:
Commands run:
Expected healthy behavior:
Observed behavior:
Client evidence:
NGINX evidence:
Flask evidence:
PostgreSQL evidence:
Redis evidence:
Worker or queue evidence:
Webhook evidence:
WebSocket evidence:
Request ID:
Trace ID:
Logs, metrics, traces, or latency evidence:
Failure tested:
What was ruled out:
Mitigation:
RCA:
Conclusion:
Overall summary:
Retained takeaway:
```

## Finish Line

Phase 2 is complete when you can explain:

```text
30-second version:
Browser traffic enters through NGINX, Flask owns support-ticket behavior, PostgreSQL owns durable data, Redis supports temporary cache/session/queue behavior, workers process async jobs, webhooks notify external systems, and WebSockets support live client updates.

2-minute version:
Trace one successful ticket request end to end, name the evidence from each layer, and explain how request IDs connect client, proxy, app, database, Redis, worker, webhook, and real-time behavior.

Deep-dive version:
Compare NGINX routing failure, Flask exception, bad database credentials, database latency, Redis cache/session/queue failure, worker backlog, webhook failure, WebSocket disconnect, failed readiness, high request latency, CPU or memory pressure, and replica sizing tradeoffs.
```

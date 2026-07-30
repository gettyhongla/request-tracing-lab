# Phase 2: Building a Production Service

Phase 2 turns the Phase 1 Flask app into a real production-service practice project.

This phase is intentionally hands-on. You should manually build the pieces, break them, collect evidence, and explain what each layer does. Start with the core three-tier request path, then add Redis as a supporting cache/session layer after PostgreSQL is working.

The goal is to build the mental model deeply enough to answer interview questions like:

```text
How does the request reach the app?
Why do we put NGINX in front?
Where does durable data live?
What is the difference between health and readiness?
Where does Redis fit, and what should not be stored there?
How do request IDs, logs, metrics, and latency measurements help an RCA?
How do I know CPU, memory, and replicas are enough?
What evidence would prove the database is or is not the bottleneck?
What is the difference between cache, queue, worker, async, and real-time?
```

## Target Architecture

Build this first:

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

Then add Redis as a supporting cache/session dependency:

```text
Flask API
   |-- PostgreSQL  # durable source of truth
   `-- Redis       # temporary cache/session support
```

Then add evidence around the full path:

```text
Request IDs
Structured logs
Latency measurements
Health endpoint
Readiness endpoint
Basic metrics
k6 load tests
Failure injection notes
```

![Three-tier architecture request flow](assets/three-tier-request-flow.png)

## Lab Order

| Lab | Focus | Outcome |
| --- | --- | --- |
| [01](labs/01-three-tier-architecture.md) | Three-tier architecture | Draw the system, name each layer, and define the request path before coding |
| [02](labs/02-nginx-reverse-proxy.md) | NGINX reverse proxy | Put NGINX in front of Flask and prove how traffic is routed |
| [03](labs/03-postgresql-persistence.md) | PostgreSQL persistence | Add durable data and prove reads/writes with SQL and app evidence |
| [04](labs/04-redis-cache-and-session-support.md) | Redis cache and session support | Add Redis for one temporary responsibility and prove hit, miss, expiry, and fallback behavior |
| [05](labs/05-database-and-cache-evidence.md) | Database and cache evidence | Investigate credentials, connectivity, query timing, cache behavior, dependency failures, and cache vs queue boundaries |
| [06](labs/06-health-and-readiness-endpoints.md) | Health and readiness | Add endpoints and explain why liveness and readiness are different |
| [07](labs/07-request-ids-logs-latency.md) | Request IDs, logs, and latency | Make requests traceable and measurable across NGINX and Flask |
| [08](labs/08-basic-observability.md) | Basic observability | Define useful logs, metrics, and evidence collection habits |
| [09](labs/09-k6-load-testing.md) | k6 load testing | Run code-friendly load tests and interpret latency, errors, CPU, memory, DB, and Redis signals |
| [10](labs/10-production-readiness-review.md) | Failure injection and readiness review | Break each layer, write short RCA notes, and decide what still blocks launch |

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
AnswersByGetty/phase-02-building-a-production-service/labs/
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
Logs, metrics, or latency evidence:
Failure tested:
What was ruled out:
Conclusion:
Interview explanation:
Retained takeaway:
```

## Finish Line

Phase 2 is complete when you can explain:

```text
30-second version:
Browser traffic enters through NGINX, Flask owns application behavior, PostgreSQL owns durable data, Redis supports temporary cache or session behavior, and health/readiness plus logs/metrics prove whether the service is safe to receive traffic.

2-minute version:
Trace one successful request end to end, name the evidence from each layer, and explain how request IDs connect client, proxy, app, and database behavior.

Deep-dive version:
Compare NGINX routing failure, Flask exception, bad database credentials, database latency, Redis cache/session failure, failed readiness, high request latency, CPU or memory pressure, and replica sizing tradeoffs.
```

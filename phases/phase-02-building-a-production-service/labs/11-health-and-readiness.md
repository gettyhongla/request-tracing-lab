# Lab 11: Health And Readiness

Design health and readiness checks for the support-ticket application.

## Why This Lab Exists

Health checks help operators and platforms decide whether an application process is alive and whether it is safe to receive traffic. A support-ticket app can be partially available: Redis or a worker may fail while read-only ticket history still works, but PostgreSQL failure may make ticket creation unsafe.

## Architecture Before

```text
Client -> NGINX -> Flask support-ticket API -> PostgreSQL / Redis / worker
```

## Architecture After

```text
/health
  `-- process-level check

/ready
  |-- required dependency checks
  |-- degraded optional dependency checks
  `-- clear JSON response
```

## Key Terms

Health answers:

```text
Is the process alive?
```

Readiness answers:

```text
Can this instance safely receive customer traffic right now?
```

| Term | Meaning |
| --- | --- |
| Liveness | Process is alive |
| Readiness | Instance can safely receive traffic |
| Startup health | App has finished initial startup |
| Dependency health | Required dependencies are reachable |
| Critical dependency | Outage makes core operation unsafe |
| Noncritical dependency | Outage degrades behavior but may not block all traffic |
| Degraded operation | Service works with reduced capability |

## Must Implement Or Inspect

1. Add a lightweight `/health` endpoint.
2. Add a `/ready` endpoint.
3. Make `/ready` check PostgreSQL.
4. Decide whether Redis is required for readiness or allowed to fall back.
5. Return clear status codes and JSON bodies.

Example behavior:

```text
/health -> 200 when Flask is running
/ready  -> 200 when Flask can reach required dependencies
/ready  -> 503 when PostgreSQL is unavailable
```

## Healthy-Path Verification

Capture:

```text
Healthy /health response:
Healthy /ready response:
Flask log:
Database check evidence:
Redis check or fallback decision:
```

## Controlled Failures

Stop PostgreSQL and call both endpoints. Then stop Redis and repeat.

Answer:

```text
Should /health still pass?
Should /ready fail?
Should Redis failure make /ready fail, or should the app stay ready with degraded cache behavior?
Why?
```

## Evidence To Capture

```text
/health healthy response:
/ready healthy response:
/ready failed response:
Dependency checked:
Redis readiness decision:
Status codes:
Interview explanation:
Retained takeaway:
```

## Troubleshooting Questions

```text
Is the process alive?
Can the application safely accept traffic?
Which dependencies are required for ticket creation?
Which dependencies are optional or degradable?
Should Redis outage make the whole ticket API unavailable?
Should worker outage block ticket creation?
```

## Interview Explanation

```text
/health should be cheap and prove the process is alive. /ready should prove whether this instance can safely accept traffic for core operations. PostgreSQL is critical for ticket creation because it owns durable data. Redis, webhook delivery, or workers may cause degraded behavior without requiring the whole API to go offline.
```

## Completion Standard

```text
The learner can explain liveness versus readiness and decide which dependencies should block customer traffic.
```

## Retained Takeaway

```text
Health checks are operational contracts. They protect customers only when they reflect what the service can safely do right now.
```

# Lab 06: Health And Readiness Endpoints

Add health and readiness endpoints and learn why they are different.

Health answers:

```text
Is the process alive?
```

Readiness answers:

```text
Can this instance safely receive customer traffic right now?
```

## Build

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

## Prove

Capture:

```text
Healthy /health response:
Healthy /ready response:
Flask log:
Database check evidence:
Redis check or fallback decision:
```

## Break

Stop PostgreSQL and call both endpoints. Then stop Redis and repeat.

Answer:

```text
Should /health still pass?
Should /ready fail?
Should Redis failure make /ready fail, or should the app stay ready with degraded cache behavior?
Why?
```

## Done When

You can explain why load balancers and orchestrators should not send traffic to an instance that is alive but not ready.

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

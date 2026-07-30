# Lab 04: Redis Cache And Session Support

Add Redis as a supporting cache or session layer.

Redis is not the durable source of truth. In this project, PostgreSQL owns durable data. Redis should own one temporary responsibility that makes the service faster or easier to operate.

Redis can also be used as a queue backend in some architectures, but that is a different job. In this lab, Redis supports the synchronous request path as cache or session state. Workers and queues come later when the system starts doing asynchronous work outside the request/response path.

Good options:

```text
Cache one read-heavy response.
Store temporary session-like state.
Track simple rate-limit counters.
```

Pick one. Do not try to use Redis for everything.

## Mental Model

Use this comparison:

| Pattern | What it means | Example | Belongs here? |
| --- | --- | --- | --- |
| Cache | Store temporary data so future reads are faster | Cache a profile or project list | Yes |
| Session state | Store temporary user/session data | Login/session lookup | Yes |
| Queue | Store work to be processed later | Generate report, send email, process video | Later |
| Worker | Process queued work outside the web request | Background job pod | Later |
| Real-time | Push updates with very low delay | WebSocket progress updates | Later |

Async does not automatically mean real-time. Async usually means the user request can return before the work is finished. Real-time means the user receives live or near-live updates.

## Build

1. Start Redis locally.
2. Connect Flask to Redis through runtime configuration.
3. Choose one Redis responsibility.
4. Add a code path that reads from Redis.
5. Add a fallback path when Redis is empty or unavailable.

## Prove

Capture:

```text
Redis connection evidence:
Cache miss:
Cache hit:
TTL or expiry:
Fallback behavior:
PostgreSQL remains source of truth:
Why this is cache/session, not queue/worker:
```

## Break

Stop Redis or point Flask at the wrong Redis port.

Answer:

```text
What did the user see?
Did the app fail closed, fail open, or fall back?
Did PostgreSQL still work?
What evidence proves Redis was the failed dependency?
Would this failure block the whole request, degrade performance, or only disable cache/session behavior?
```

## Done When

You can explain:

```text
Redis is fast temporary state.
PostgreSQL is durable state.
The app should know what behavior is safe when Redis is unavailable.
Cache/session Redis belongs beside the app/data path.
Queue/worker Redis belongs to the async production architecture path.
```

## Evidence To Capture

```text
Redis responsibility:
Connection configuration:
Cache miss evidence:
Cache hit evidence:
Expiry evidence:
Fallback behavior:
Failure symptom:
Cache vs queue explanation:
Interview explanation:
Retained takeaway:
```

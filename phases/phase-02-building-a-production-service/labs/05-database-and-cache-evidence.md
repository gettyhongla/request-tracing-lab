# Lab 05: Database And Cache Evidence

Learn how PostgreSQL and Redis problems appear before, during, and after a request.

This lab exists because interviewers often ask about latency and bottlenecks. You need to separate database connection failure, slow query behavior, cache miss behavior, Redis outage, and application errors.

You also need to separate synchronous and asynchronous thinking:

```text
Synchronous request:
The user waits for the response.

Asynchronous work:
The user request creates or triggers work, but another process finishes it later.

Real-time update:
The user receives live progress or state updates, often through polling, WebSockets, or server-sent events.
```

Async is not the same thing as real-time. A background job can be async but not real-time. A chat message or live progress bar can be real-time, but it still may use async processing behind the scenes.

## Build

1. Add clear database connection logging in Flask.
2. Record how long a simple query takes.
3. Add clear Redis connection or cache logging.
4. Record cache hit and miss behavior.
5. Add one intentionally slow query or slow endpoint.
6. Document the database and Redis settings the app uses.
7. Write one example of work that should stay synchronous and one example that should move to a queue/worker later.

## Prove

Capture:

```text
Successful connection evidence:
Successful query evidence:
Query duration:
Cache hit/miss evidence:
App log with request ID:
Database-side or Redis-side evidence, if available:
Synchronous vs asynchronous example:
```

## Break

Test at least two:

```text
Wrong host:
Wrong port:
Wrong username or password:
Stopped database:
Slow query:
Stopped Redis:
Expired cache key:
Background-style work attempted inside request:
```

## Done When

You can answer:

```text
Was latency caused before the query, during the query, by cache behavior, or after the query?
What evidence proves that?
Should this work happen during the user request or move to a worker later?
```

## Evidence To Capture

```text
Connection settings:
Healthy connection evidence:
Query timing:
Redis evidence:
Sync vs async conclusion:
Failure tested:
User symptom:
Flask error:
Database or cache evidence:
What was ruled out:
Interview explanation:
Retained takeaway:
```

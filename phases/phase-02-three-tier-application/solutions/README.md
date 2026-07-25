# Phase 2 Solution Guide

Use this after attempting the labs. This is not Getty's completed work. It is a short guide for what strong reasoning should include.

Put actual observations, diagrams, commands, request IDs, and reflections in `AnswersByGetty/phase-02-three-tier-application/`.

## Solution 1: Healthy Request Path

Strong answer:

```text
The browser sends the request to NGINX.
NGINX receives the request, records an access log, and forwards it to Flask.
Flask receives the request, records the request ID, validates application logic, and queries PostgreSQL.
PostgreSQL returns the user data.
Flask builds the response.
NGINX returns the response to the browser.
```

Evidence:

```text
Browser:
Status code, response headers, timing, request ID.

NGINX:
Access log with method, path, status, request time, upstream time, and request ID.

Flask:
Application log with request_id, method, path, status, and duration.

PostgreSQL:
Query success, query timing, and matching user row.
```

## Solution 2: NGINX Cannot Reach Flask

Likely root cause:

```text
NGINX accepted the client request but could not connect to the Flask upstream.
```

Evidence pattern:

```text
Client sees 502.
NGINX access log records the request.
NGINX error log shows upstream connection failure.
Flask has no matching request log.
```

Conclusion:

```text
The failure is between NGINX and Flask, not between the browser and NGINX, and not inside Flask application logic.
```

## Solution 3: PostgreSQL Authentication Failure

Likely root cause:

```text
Flask reached the database endpoint, but PostgreSQL rejected authentication or the configured database identity was wrong.
```

Evidence pattern:

```text
Browser receives an application error or controlled auth/service response.
Flask logs include the request ID and database connection/authentication error.
PostgreSQL logs show failed authentication or refused database access.
NGINX and Flask both saw the request, so the proxy path is not the primary failure.
```

Sharp takeaway:

```text
Do not log database passwords. Log which configuration field failed at a safe level: host, database, user alias, or connection class.
```

## Solution 4: Slow Database Query

Likely root cause:

```text
The request path is healthy, but latency is concentrated in PostgreSQL query execution or waiting on database resources.
```

Evidence pattern:

```text
Client duration is high.
NGINX upstream time is high.
Flask duration is high.
Database query timing or lock evidence explains most of the delay.
```

Possible mitigations:

```text
Reduce query scope.
Add or fix an index.
Kill or resolve blocking transaction if safe.
Increase connection-pool capacity only if the database can support it.
Temporarily disable the slow feature if customer impact is severe.
```

## Solution 5: Redis Cache Behavior

Strong answer:

```text
First define whether Redis owns cache, sessions, or queue state. The failure analysis depends on that responsibility.
```

Evidence pattern:

```text
Cache hit:
Fast response, Redis lookup succeeds, backend dependency may be skipped.

Cache miss:
Redis lookup returns empty or expired value, Flask calls the source of truth, response is slower.

Redis unavailable:
Flask logs Redis connection failure. The client either receives degraded behavior or an error depending on whether Redis is optional or required.
```

Sharp takeaway:

```text
Redis is not automatically the source of truth. If Redis is a cache, PostgreSQL remains authoritative. If Redis stores sessions, Redis availability may directly affect authentication state.
```

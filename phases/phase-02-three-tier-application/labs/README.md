# Phase 2 Labs

These labs are designed for three-tier architecture reasoning. Implementation can come later. First, prove that you understand the request path, failure points, and evidence required at each layer.

## Lab 1: Draw The Healthy Request Path

Scenario:

```text
A customer opens the app and signs in successfully.
```

Tasks:

1. Draw the path from browser to NGINX to Flask to PostgreSQL.
2. Mark where TLS terminates.
3. Mark where the request ID is created or forwarded.
4. Identify which logs should contain the request.
5. Identify which data store confirms the user exists.

Record:

```text
Browser evidence:

NGINX evidence:

Flask evidence:

PostgreSQL evidence:

Request ID:

Expected status:
```

## Lab 2: NGINX Cannot Reach Flask

Scenario:

```text
Customers receive 502 responses after a proxy configuration change.
```

Tasks:

1. Reproduce the request with `curl -v`.
2. Check whether NGINX logged the request.
3. Check whether Flask logged the request.
4. Decide whether the failure happened before or after Flask.
5. Identify the upstream host and port NGINX tried to reach.

Record:

```text
Client symptom:

NGINX access log:

NGINX error log:

Flask log:

Failed layer:

Evidence:
```

## Lab 3: PostgreSQL Authentication Failure

Scenario:

```text
The login endpoint reaches Flask, but the app cannot validate users from PostgreSQL.
```

Tasks:

1. Confirm the request reached Flask.
2. Inspect the database connection error.
3. Identify whether the hostname, username, password, database name, or network path failed.
4. Decide what the client should see.
5. Decide what should be logged without leaking secrets.

Record:

```text
Request ID:

Flask error:

Database error:

Client status:

Secret exposure risk:

Root cause hypothesis:
```

## Lab 4: Slow Database Query

Scenario:

```text
Login works, but customers report that it is slow.
```

Tasks:

1. Measure request duration from the client.
2. Compare NGINX upstream timing with Flask timing.
3. Inspect database query timing.
4. Identify whether the slowness is network, application, or database related.
5. Propose a mitigation and permanent fix.

Record:

```text
Client duration:

NGINX upstream time:

Flask duration:

Database query time:

Slowest layer:

Evidence:

Mitigation:

Permanent fix:
```

## Lab 5: Redis Cache Behavior

Scenario:

```text
The app uses Redis for cache or session behavior. Customers see inconsistent performance or stale data.
```

Tasks:

1. Define what Redis is responsible for.
2. Record cache hit, miss, and expiry behavior.
3. Identify the fallback path when Redis is unavailable.
4. Decide whether Redis failure should break the request or degrade gracefully.
5. Identify metrics that would reveal cache pressure.

Record:

```text
Redis responsibility:

Cache hit evidence:

Cache miss evidence:

TTL behavior:

Fallback behavior:

Customer impact:

Metric to alert on:
```

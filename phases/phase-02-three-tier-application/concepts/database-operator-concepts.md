# Database Operator Concepts

Use this as the database mental model for Phase 2.

The goal is not to become a DBA overnight. The goal is to reason clearly when a production symptom might involve the database.

Use [postgresql-investigation-queries.md](postgresql-investigation-queries.md) when you need concrete SQL evidence.

## Database Responsibilities

PostgreSQL should own durable, authoritative data:

```text
Users
Profiles
Account state
Request or audit events
Report/job results
Transactional records
```

Redis should own fast temporary data only when that responsibility is explicit:

```text
Cache entries
Session state
Rate-limit counters
Queue metadata, if using Redis-backed queues
```

## Request Path With Database

```text
Browser
  |
  v
NGINX
  |
  v
Flask API
  |
  v
Database connection pool
  |
  v
PostgreSQL
```

## Evidence By Layer

| Layer | What it proves |
| --- | --- |
| Browser | Customer status, timing, response body, request ID |
| NGINX | Proxy received request and upstream timing |
| Flask | Route, auth decision, query attempt, duration, exception |
| Connection pool | Whether requests waited for a DB connection |
| PostgreSQL | Query execution, locks, active sessions, errors |

## Common Failure Patterns

```text
Bad credentials:
Flask reaches PostgreSQL, but authentication fails.

Wrong host or port:
Flask cannot reach PostgreSQL at the configured network address.

Connection pool exhausted:
Requests wait for available DB connections; latency rises before queries even run.

Slow query:
The query runs, but execution time is high due to missing indexes, too many rows, bad plan, or resource pressure.

Lock contention:
One transaction blocks another. Requests may hang or timeout.

Deadlock:
Two transactions wait on each other. PostgreSQL aborts one transaction.

Migration failure:
Application code expects a schema that is not safely deployed yet.

Replication lag:
Reads from a replica return stale data after writes.

Backup/restore gap:
The team cannot prove data can be recovered within the required RPO/RTO.
```

## Operational Questions

```text
How would you know the database is the bottleneck?
How would you distinguish slow query from connection pool exhaustion?
What metrics would you check first?
What SQL would help inspect active queries or locks?
How would you deploy a schema migration safely?
How would you roll back a bad migration?
What is the difference between backup, replication, and failover?
What data can be cached safely, and what must come from PostgreSQL?
```

## Production Database Readiness

Before saying an application is ready for production, you should be able to explain the database decisions behind the system:

```text
Data ownership:
Which service owns each table or record?
What data is authoritative?
What data can be derived, cached, or rebuilt?

Schema:
What migrations are required?
Are migrations backward-compatible with the currently deployed app?
How would you roll forward or roll back safely?

Connections:
How many app instances can connect?
What is the pool size per instance?
What happens when the pool is exhausted?
What timeout protects the app from waiting forever?

Queries:
Which endpoints run the most expensive queries?
Which queries need indexes?
What query or route is most likely to become slow as data grows?

Transactions:
What operations must be atomic?
What could cause lock contention?
What happens if a write partially fails?

Recovery:
What is the required RPO?
What is the required RTO?
When was restore tested?
Who can perform restore or failover?

Read scale:
Are replicas used?
Which reads can tolerate stale data?
Which reads must go to the primary database?
```

Strong production framing:

```text
I would treat the database as a production dependency with its own readiness checks, not as a detail hidden behind the API. I would want proof of safe migrations, connection limits, query performance, backup restore, and clear ownership of source-of-truth data before calling the deployment safe.
```

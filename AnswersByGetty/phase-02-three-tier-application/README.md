# Phase 2 Answers: Three-Tier Application

Use this directory for completed Phase 2 evidence and reflections.

The most important Phase 2 skill is proving which layer failed:

```text
Browser
NGINX
Flask
Connection pool
PostgreSQL
Redis
```

## Suggested Answer Structure

```text
Scenario:

Architecture:

Request path:

Database object involved:

Evidence collected:

Hypotheses ruled out:

Root cause:

Mitigation:

Permanent fix:

Key takeaway:
```

## Database Takeaways To Capture

For database-heavy labs, always record:

```text
Connection evidence:

Query evidence:

Timing evidence:

Lock or blocking evidence:

Migration or schema evidence:

Backup/replication/recovery evidence, if relevant:
```

## Production Database Readiness Answer

Use this for production readiness reviews like:

```text
Management wants this app in production next week. What do you want to see before saying it is safe?
```

Draft answer:

```text
I would want to understand the database as a production dependency, not just confirm that the API can connect locally.

I would ask what data is durable and authoritative, what schema changes are required, how migrations are deployed, how many backend instances connect to the database, what the pool size is per instance, what the database connection limit is, which queries are on the critical path, which indexes support those queries, what timeout protects the app, and how backup and restore have been tested.

I would also clarify Redis's responsibility. If Redis is a cache, PostgreSQL is still the source of truth. If Redis stores sessions or queue state, Redis failure can become customer-facing and needs its own readiness checks.
```

Evidence I would want:

```text
Architecture diagram:

Schema or ERD:

Migration plan:

Connection pool settings:

Critical queries and indexes:

Backup and restore evidence:

RPO/RTO:

Replica lag plan:

Redis responsibility:

Monitoring and alerts:
```

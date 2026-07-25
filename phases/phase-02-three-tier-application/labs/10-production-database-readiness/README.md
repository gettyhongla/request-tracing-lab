# Lab 10: Production Database Readiness

## Scenario

Management wants the application in production next week.

The app has:

```text
React frontend
Node or Python backend
PostgreSQL database
Redis for cache, sessions, queues, or rate limits
```

Your job is to decide what database evidence you need before saying the deployment is safe.

## Goal

Explain database readiness as part of production readiness.

This is not only "does the app connect to the database?" It is:

```text
Can the data layer handle traffic?
Can it fail safely?
Can it recover?
Can we diagnose it?
Can schema changes deploy without breaking the app?
```

## Investigation Checklist

Answer these before approving production:

```text
What data is durable and authoritative?
What tables or collections exist?
What writes must be transactional?
What migrations are needed before launch?
Are migrations backward-compatible?
How many backend instances will connect to the database?
What is the connection pool size per instance?
What is the maximum database connection limit?
What happens when the pool is exhausted?
Which routes run the most important queries?
Which queries need indexes?
What timeout protects the app from slow database behavior?
What metrics expose query latency, pool wait, lock waits, and errors?
What backup schedule exists?
When was restore tested?
What are the RPO and RTO?
Will reads use replicas?
Which reads can tolerate replication lag?
What does Redis own, and what remains in PostgreSQL?
```

## Evidence To Collect

```text
Architecture diagram:

Database schema or ERD:

Migration plan:

Connection pool settings:

Critical query list:

Indexes:

Transaction boundaries:

Timeouts:

Backup and restore proof:

Replication or failover plan:

Redis responsibility:

Monitoring and alerting:
```

## Failure Questions

For each database failure, write the customer symptom and the evidence you would expect:

| Failure | Customer symptom | Evidence |
| --- | --- | --- |
| Bad DB credentials | | |
| DB unavailable | | |
| Pool exhausted | | |
| Slow query | | |
| Missing index | | |
| Lock contention | | |
| Bad migration | | |
| Replica lag | | |
| Backup restore gap | | |
| Redis unavailable | | |

## Production Readiness Prompt

Say this out loud:

```text
Before I say this system is safe for production, I want to see the architecture, data model, migration plan, database connection strategy, query performance evidence, backup and restore proof, Redis responsibility, and the metrics or logs that would let us diagnose production issues quickly.
```

Then make it specific:

```text
For the database, I would check whether the app can connect reliably, whether connection pools are sized correctly for the number of backend instances, whether critical queries are indexed, whether schema migrations are safe, whether backups have been restored successfully, and whether replicas or caches can return stale data.
```

## Completion Standard

You are done when you can explain:

```text
What database evidence you need before launch.
What database failure modes could affect customers.
How you would separate database failure from app, proxy, cache, or network failure.
What you would ask a DevOps engineer or database owner before approving production.
```

# Phase 2: Three-Tier Application

Phase 2 turns the single Flask app into a production-style three-tier architecture.

The goal is to build and operate a three-tier system where failures can be isolated with evidence. Each request should be traceable across NGINX, Flask, PostgreSQL, and Redis so latency, errors, stale data, connection issues, and dependency failures can be explained without guessing.

![Three-tier architecture request flow](assets/three-tier-request-flow.png)

## Target Architecture

Start with:

```text
Browser
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

Then add Redis after the database path is understood:

```text
Flask API
   |-- PostgreSQL
   `-- Redis
```

## What This Phase Teaches

This phase introduces production boundaries:

* The browser no longer talks directly to Flask.
* NGINX becomes the public entry point.
* Flask becomes the API layer.
* PostgreSQL owns durable application data.
* Redis can own one fast, temporary responsibility such as sessions or caching.

## Phase 2 Contents

```text
README.md
concepts/database-operator-concepts.md
concepts/postgresql-investigation-queries.md
labs/
assets/
```

The database work is not optional background. Phase 2 should build enough database judgment to answer production questions about schema design, connection failures, pool exhaustion, slow queries, indexes, locks, migrations, backups, replication, and recovery.

## Core Questions

For every request, answer:

```text
Did the browser reach NGINX?
Did NGINX reach Flask?
Did Flask reach PostgreSQL?
Did Flask reach Redis?
Which component generated the final status code?
Where did request timing increase?
Which logs prove the request path?
Which database query or connection was involved?
Was latency caused by app code, waiting for a connection, query execution, or lock contention?
Could this data be cached safely, or must it come from PostgreSQL?
Which metrics would expose the failure faster next time?
```

## Labs

Use:

```text
labs/
```

The labs define what to build, trace, break, and investigate. Completed evidence, diagrams, commands, SQL output, RCA notes, and retained takeaways belong in `AnswersByGetty/phase-02-three-tier-application/`.

## How To Work Through Phase 2

Phase 2 should be worked as one connected build, not as disconnected notes.

The end state is a three-tier version of the same application where the browser reaches NGINX first, NGINX forwards to Flask, Flask reads and writes durable data in PostgreSQL, and Redis is added only after the database path is understood.

### Start Here

Begin with the architecture and request path before adding failure scenarios.

1. Draw the target architecture.
2. Label each responsibility: browser, NGINX, Flask, PostgreSQL, Redis.
3. Decide where request IDs should appear.
4. Decide what healthy evidence should exist at every layer.
5. Read `concepts/database-operator-concepts.md`.
6. Keep `concepts/postgresql-investigation-queries.md` nearby for database evidence.

### Build Order

Work in this order:

| Step | Work | Labs | Deliverable |
| --- | --- | --- | --- |
| 1 | Trace the healthy three-tier request | [01](labs/01-healthy-three-tier-request/) | Architecture diagram and request trace |
| 2 | Put NGINX in front of Flask | [02](labs/02-proxy-to-app-routing/) | Proxy evidence, forwarded headers, failed-hop explanation |
| 3 | Add PostgreSQL as source of truth | [03](labs/03-database-data-model/) | Data model, table purpose, query evidence |
| 4 | Prove database connectivity behavior | [04](labs/04-database-connections-pooling/) | Connection, credentials, timeout, and pool evidence |
| 5 | Investigate query performance | [05](labs/05-query-performance-indexes/) | Slow-query evidence, index reasoning, query-plan notes |
| 6 | Explain write safety | [06](labs/06-transactions-locks/) | Transaction, lock, blocking, and mitigation notes |
| 7 | Treat schema changes as production events | [07](labs/07-migrations-rollbacks/) | Migration plan, rollback/roll-forward plan, validation query |
| 8 | Explain data recovery and availability | [08](labs/08-backups-replication-recovery/) | RPO/RTO, restore evidence, replication/failover notes |
| 9 | Add Redis for one clear purpose | [09](labs/09-redis-cache-sessions/) | Cache/session responsibility, hit/miss/expiry behavior |
| 10 | Review production readiness | [10](labs/10-production-database-readiness/) | Data-layer readiness review and launch blockers |

Do not add Redis before PostgreSQL behavior is clear. Redis should be introduced as a specific production dependency, not as a generic speed layer.

### Evidence To Capture

For each lab, record evidence in:

```text
AnswersByGetty/phase-02-three-tier-application/
```

Use one file per completed lab. Each file should include:

```text
Architecture:
Request path:
Commands run:
Client evidence:
NGINX evidence:
Flask evidence:
PostgreSQL evidence:
Redis evidence, if used:
Failure or latency symptom:
Root cause or design conclusion:
What was ruled out:
Retained takeaway:
```

Successful paths should read like trace reports. Broken paths should read like RCA reports. Design-heavy labs should read like short architecture reviews.

### Talk-Through Checkpoints

After each major step, explain the system out loud without memorizing one fixed script.

Use this pattern:

```text
What is the user trying to do?
Which component receives the request first?
What does that component add, check, or forward?
Which dependency is required next?
What evidence proves the request reached that dependency?
Where could this fail?
What symptom would the user see?
What is the cheapest evidence check?
What would I mitigate first?
What permanent fix or design change would prevent recurrence?
```

By the end of Phase 2, you should be able to explain the same system three ways:

```text
30-second version:
Browser traffic enters through NGINX, Flask owns application logic, PostgreSQL owns durable data, and Redis owns one temporary responsibility such as cache or sessions.

2-minute version:
Trace one successful request end to end, then explain how logs, headers, query evidence, and timing prove which layer handled the request.

Deep-dive version:
Compare proxy failure, app failure, database connection failure, pool exhaustion, slow query, lock contention, migration failure, stale reads, and Redis cache/session failure.
```

### Phase 2 Finish Line

Phase 2 is complete when the project contains:

```text
Working three-tier architecture:
Browser -> NGINX -> Flask -> PostgreSQL

Redis added for one clear responsibility:
Cache, sessions, rate limits, or queue-related state.

Evidence in AnswersByGetty:
Healthy request trace.
Proxy routing trace.
Database data model.
Connection and pooling investigation.
Query performance investigation.
Transaction/lock investigation.
Migration and rollback plan.
Backup/replication/recovery notes.
Redis cache/session evidence.
Production database readiness review.
```

The goal is not to memorize this architecture. The goal is to look at any three-tier system and reason from request path, dependency ownership, failure symptom, and evidence.

## Failure Classes

This phase should make these failures easy to separate:

| Layer | Example failure | Likely symptom | Evidence |
| --- | --- | --- | --- |
| Browser to NGINX | Wrong host or TLS problem | Browser cannot connect | DevTools, `curl -v`, NGINX access logs |
| NGINX to Flask | Wrong upstream port | `502 Bad Gateway` | NGINX error log, missing Flask request log |
| Flask application | App exception | `500 Internal Server Error` | Flask error log with request ID |
| Flask to PostgreSQL | Bad DB credentials | Login or profile failure | Flask DB error, PostgreSQL logs |
| PostgreSQL | Slow query or lock | High latency or timeout | Query timing, `pg_stat_activity`, lock evidence |
| PostgreSQL | Pool exhaustion | Latency spike or timeout before query runs | Pool metrics, DB connection count |
| PostgreSQL | Bad migration | App errors after deploy | Migration logs, schema diff, app error logs |
| PostgreSQL | Replication lag | Stale reads | Replica lag metric, read/write path evidence |
| Flask to Redis | Cache unavailable | Slow fallback or auth/session issue | Flask Redis error, cache hit/miss logs |

## Completion Standard

You are ready for Phase 3 when you can explain a request like this:

```text
The browser sent the request to NGINX.
NGINX accepted it, added or forwarded the request ID, and proxied it to Flask.
Flask handled application logic and queried PostgreSQL.
Redis was used for cache or session behavior.
The response returned through Flask and NGINX to the browser.
The evidence from each layer proves where the request succeeded or failed.
```

You should also be able to answer:

```text
What table or query was involved?
Was the database the source of truth?
Was the issue connection, credentials, pool, query, lock, migration, replication, or backup/recovery?
What evidence proves that conclusion?
```

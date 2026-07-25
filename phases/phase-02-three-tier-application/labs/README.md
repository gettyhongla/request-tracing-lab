# Phase 2 Labs

These labs build three-tier architecture and database troubleshooting skill.

Phase 2 is where the app stops being only Flask. You should learn how browser traffic moves through a proxy, how the app uses durable data, and how database behavior affects customer symptoms.

## Lab Order

| Lab | Focus | Outcome |
| --- | --- | --- |
| [01](01-healthy-three-tier-request/) | Healthy three-tier request | Trace browser to NGINX to Flask to PostgreSQL |
| [02](02-proxy-to-app-routing/) | Proxy to app routing | Separate NGINX failures from Flask failures |
| [03](03-database-data-model/) | Database data model | Decide what data belongs in PostgreSQL and why |
| [04](04-database-connections-pooling/) | Connections and pooling | Explain DB connectivity, credentials, timeouts, and pool exhaustion |
| [05](05-query-performance-indexes/) | Query performance and indexes | Diagnose slow queries with evidence |
| [06](06-transactions-locks/) | Transactions and locks | Explain blocking, deadlocks, and safe mitigation |
| [07](07-migrations-rollbacks/) | Migrations and rollbacks | Plan schema changes without breaking production |
| [08](08-backups-replication-recovery/) | Backups and recovery | Explain RPO, RTO, restores, replication, and failover |
| [09](09-redis-cache-sessions/) | Redis cache or sessions | Separate cache/session behavior from database source of truth |
| [10](10-production-database-readiness/) | Production database readiness | Decide what must be true before saying the data layer is safe for production |

## Answer Location

Put completed evidence, diagrams, commands, SQL output, and reflections in:

```text
AnswersByGetty/phase-02-three-tier-application/
```

The phase folder teaches the lab. `AnswersByGetty` proves your work.

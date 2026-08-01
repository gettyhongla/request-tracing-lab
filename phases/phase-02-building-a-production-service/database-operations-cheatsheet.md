# Database Operations And Resilience Cheat Sheet

This guide supports Phase 2 Labs 05 and 06. It focuses on the database knowledge needed to explain, operate, troubleshoot, and safely evolve the support-ticket application.

## Mental Model

```text
Client request
  -> NGINX
  -> Flask
  -> PostgreSQL
  -> Flask
  -> NGINX
  -> Client response
```

PostgreSQL is the durable source of truth. If the application restarts, cache expires, or Redis is unavailable, PostgreSQL should still contain the real users, tickets, messages, and audit events.

Redis is temporary support infrastructure. In this phase, Redis can help with cache or session behavior. Later, Redis or another queue system can support async worker jobs, but that is a different responsibility from durable relational data.

Request IDs connect the request path to the database evidence. In this project, `ticket_events.request_id` helps prove which client request caused an important database change.

## Core Concepts

| Concept | Plain Meaning | Project Example |
| --- | --- | --- |
| Schema | The blueprint for database structure | `users`, `tickets`, `ticket_messages`, and `ticket_events` |
| Primary key | A unique ID for one row | `users.id`, `tickets.id` |
| Foreign key | A relationship to another table's primary key | `tickets.created_by -> users.id` |
| Constraint | A database rule that protects valid data | Email must be unique, title cannot be null |
| Index | A lookup structure that helps PostgreSQL find rows faster | Find tickets by `created_by`, `status`, or `created_at` |
| Transaction | An all-or-nothing unit of database work | Create ticket, first message, and audit event together |
| Rollback | Undo uncommitted work when a transaction fails | No partial ticket if message insert fails |
| Backup | A saved copy used for recovery | Restore after data loss or corruption |
| RPO | How much data loss is acceptable | "At most 5 minutes of data" |
| RTO | How long recovery may take | "Service restored within 30 minutes" |

## Helpful Analogies

| Topic | Analogy | Why It Helps |
| --- | --- | --- |
| Primary key | Passport number | The ID stays stable even if a name changes |
| Foreign key | Referencing the passport number | Related records point to the stable ID instead of copying biography details everywhere |
| Constraint | Boarding rule | The database refuses invalid data before it enters the system |
| Index | Textbook index | PostgreSQL can jump to likely rows instead of reading the whole table |
| Transaction | Sealed checkout receipt | Either all related changes are accepted or none are |
| Connection pool | Limited service counters | Too many requests can wait even when the database CPU looks fine |
| Lock | Reserved editing slot | One transaction can make another wait for the same row or table |
| Backup | Recovery copy | It protects against accidental deletion, corruption, or failed releases |
| Read replica | Extra reading room | Reads can be served elsewhere, but writes still go to the primary |

An index is not the same as cache. A cache stores a temporary copy of data for speed. An index is a maintained database lookup structure that still points to the real table data.

## Lab 05: Data Model

The support-ticket schema should answer four questions:

```text
Who is using the system?
What ticket did they create?
What messages belong to the ticket?
What important events happened, and which request caused them?
```

In this project:

```text
users
  id: primary key
  email: unique identity
  role: customer or admin

tickets
  id: primary key
  ticket_number: human-friendly unique ticket ID
  created_by: foreign key to users.id
  status: constrained lifecycle value

ticket_messages
  id: primary key
  ticket_id: foreign key to tickets.id
  author_id: foreign key to users.id
  is_internal: protects admin-only notes

ticket_events
  id: primary key
  ticket_id: foreign key to tickets.id
  actor_id: foreign key to users.id
  request_id: evidence that connects the DB change to request tracing
```

The important design idea is ownership. A customer should see their own tickets. An admin can see all tickets and internal notes. The database stores the records, but the application enforces who is allowed to read or write each record.

## Lab 06: Operations And Resilience

Lab 06 moves from "does the feature work?" to "can this database survive production behavior?"

The core operating questions are:

```text
Can the application connect?
Can the database safely commit related changes?
Can queries stay fast as data grows?
Can failures be detected from evidence?
Can data be restored after a mistake?
Can the app recover when the primary database fails?
```

## Finding A Database Bottleneck

Use evidence from each layer before blaming the database.

| Layer | Evidence | What It Proves |
| --- | --- | --- |
| Client | Slow response or timeout | User impact exists |
| NGINX | `request_time`, `upstream_response_time`, status code | Delay is before, inside, or after Flask |
| Flask | Route timing, error logs, request ID | Which handler was slow or failed |
| PostgreSQL | Query timing, `EXPLAIN`, locks, connection count | Whether the database was slow, blocked, or unavailable |
| Data state | Rows inserted or missing | Whether the transaction actually committed |

Good troubleshooting sequence:

```text
1. Confirm the user-facing symptom.
2. Use request ID to find NGINX and Flask logs.
3. Compare total request time with upstream/app time.
4. Identify the route and SQL query involved.
5. Run EXPLAIN or EXPLAIN ANALYZE on the query.
6. Check indexes, table scans, locks, and active connections.
7. Confirm whether data was committed, rolled back, or never attempted.
```

## Database Latency Causes When Hardware Looks Healthy

| Issue | What It Means | Evidence To Check | First Response |
| --- | --- | --- | --- |
| Slow query | The SQL itself takes too long | Query timing, `EXPLAIN ANALYZE` | Identify the slow part before changing schema |
| Missing index | PostgreSQL scans too many rows | `Seq Scan` on a large table | Add an index only for common lookup patterns |
| Inefficient join | Tables are combined in an expensive way | Query plan shows expensive join strategy | Check join keys, filters, indexes, and row counts |
| N+1 query | App runs many small queries instead of one better query | Logs show repeated similar queries | Batch, join, or prefetch data |
| Table scan | Database reads the table broadly | `Seq Scan` with many rows examined | Add/select proper filters or indexes |
| Lock contention | One transaction waits on another | Lock views, long waits, blocked queries | Find the blocking transaction |
| Long transaction | A transaction stays open too long | Old active transaction in DB activity | Commit faster, reduce work inside transaction |
| Too many connections | Requests wait for a DB slot | Connection count near max, pool errors | Add pooling and tune app concurrency |
| Pool exhaustion | App pool is full even if DB is alive | Timeout waiting for connection | Right-size pool and release connections correctly |
| Replication lag | Replica is behind primary | Replica lag metric | Route fresh reads to primary or tolerate stale reads |
| Disk I/O pressure | Storage is slow or saturated | IOPS, disk latency, checkpoint pressure | Tune query load or storage capacity |
| Bad growth pattern | Query was fine at 100 rows but poor at 1 million | Latency rises with table size | Revisit indexes, pagination, query shape |

## Security And Production Placement

A production database should usually live in a private subnet because it should not receive direct internet traffic. Public users talk to the application. The application talks to the database over private networking.

Before go-live, expect:

```text
Private network placement
Firewall or security group rules that allow only approved app traffic
Least-privilege database user
Credentials stored in a secrets manager, not source code
TLS where required
Backups and restore testing
Monitoring and alerts
Migration and rollback plan
Connection pooling plan
High availability or failover plan
```

The risk of exposing a database publicly is not only password guessing. It also increases the blast radius for misconfiguration, credential leaks, denial-of-service attempts, and accidental access from untrusted networks.

## Availability Model

```text
Production PostgreSQL
  -> Primary
  -> Replica
  -> Automatic failover
  -> Backups
  -> Monitoring
  -> Connection pooling
  -> Recovery plan
```

Key questions:

| Question | Practical Answer |
| --- | --- |
| Can writes continue? | Writes normally require the current primary. During failover, writes may pause until a replica is promoted. |
| Can reads continue? | Reads may continue from replicas if the application can tolerate stale data. Strongly consistent reads should use the primary. |
| How fast is failover? | It depends on the platform, health checks, promotion time, DNS, and application reconnect behavior. |
| Will applications reconnect? | They should use retry logic, connection timeouts, and pools that can discard broken connections. |
| Is DNS updated? | Managed databases often move the endpoint to the new primary, but clients still need to reconnect cleanly. |
| Are backups enough? | Backups recover data after loss or corruption. Replicas help availability, but they may also replicate bad writes. |

Backups and replicas solve different problems. A replica helps keep service available if the primary fails. A backup helps recover from deletion, corruption, or a bad migration.

## Migration Safety

Safe migrations are designed so the application and database can temporarily support both old and new behavior.

```text
1. Add new columns or tables without breaking old code.
2. Deploy application code that can write/read the new shape.
3. Backfill existing data in small batches if needed.
4. Verify data and performance.
5. Remove old columns or behavior later.
```

Avoid migrations that lock large tables for too long, rewrite huge tables during peak traffic, or require application and database changes to happen at exactly the same second.

## Interview Answer Shapes

| Question | Strong Answer Shape |
| --- | --- |
| How do you determine whether the database is the bottleneck? | Correlate request latency across NGINX, Flask, and PostgreSQL using request IDs and timings. Then inspect the slow route, query timing, query plan, locks, and connections. |
| What DB issues cause high latency when compute looks healthy? | Slow queries, missing indexes, table scans, inefficient joins, N+1 queries, locks, long transactions, pool exhaustion, replication lag, and disk I/O pressure. |
| How would you design the DB layer for a globally available app? | Keep writes on a primary or regional primary model, add replicas for reads, define failover, backup, recovery, monitoring, and consistency expectations. |
| Should the database be in a private subnet? | Yes. Public traffic should terminate at edge/app layers. The DB should only accept trusted application traffic over private networking. |
| When would you use read replicas? | Use replicas when read traffic is heavy, reads can tolerate some lag, or reporting traffic should be separated from the primary. |
| Vertical vs horizontal DB scaling? | Vertical means bigger instance resources. Horizontal usually means replicas, partitioning, or sharding, which adds operational complexity. |
| Risks of a public-facing database? | Larger attack surface, credential exposure impact, network abuse, misconfiguration risk, and direct denial-of-service against the data layer. |
| What makes a database production safe? | Security, backups, restore tests, monitoring, alerts, migration process, failover plan, connection pooling, and clear ownership of data. |
| Backups, restore testing, and disaster recovery? | Define RPO and RTO, automate backups, test restores regularly, document recovery steps, and know what data loss window is acceptable. |
| Redis plus relational DB ownership? | PostgreSQL owns durable truth. Redis owns temporary speed, session, cache, queue, or coordination data depending on the design. |
| Queries that create performance issues? | Unbounded queries, missing filters, missing indexes, large joins, N+1 patterns, sorting large results, and returning too much data. |
| N+1 query problem? | The app runs one query to get a list, then one extra query per row. It works with small data and falls apart as rows grow. |
| Debug connection exhaustion? | Check app pool size, DB max connections, active connections, idle connections, timeouts, and whether code returns connections to the pool. |
| Decide DB instance size before launch? | Estimate data size, read/write rate, connection count, query patterns, latency target, backup needs, and run load tests with realistic data. |
| Monitoring before go-live? | CPU, memory, connections, slow queries, query latency, locks, disk I/O, storage, replication lag, errors, backups, and restore status. |
| Safe migrations in production? | Use backwards-compatible changes, small batches, tested rollback, maintenance windows for risky changes, and observe lock/query impact. |
| CPU low but queries slow? | Missing indexes, locks, disk I/O, connection waits, inefficient joins, cold cache, or waiting on external storage can be the cause. |
| Explain indexing simply? | An index is like a textbook index. It helps the database jump to likely rows instead of reading every page. |
| Login slow only for authenticated users? | Check session lookup, user query, permissions query, password/session verification, Redis latency, DB indexes, and downstream dependencies. |
| Separate app bug from DB performance problem? | Use logs and timings to show whether the app reached the DB, which query ran, how long it took, and whether the DB committed data. |

## Study Next

Read and practice these topics after Labs 05 and 06:

```text
PostgreSQL EXPLAIN basics
Primary keys, foreign keys, constraints, and indexes
Transactions and rollback
Locks and long-running transactions
Connection pooling with PgBouncer or RDS Proxy
Backups, point-in-time recovery, RPO, and RTO
Read replicas and replication lag
Safe database migrations
Slow-query logs and database observability
Private subnet and least-privilege database access
```

The goal is not to become a database administrator in one phase. The goal is to explain where data lives, how to prove it was saved, why requests slow down, and what production controls protect the database when the system grows.

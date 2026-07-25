# PostgreSQL Investigation Queries

Use these queries as evidence prompts during Phase 2 database labs.

Do not run destructive SQL while investigating. Start with read-only checks.

## Active Connections

What this answers:

```text
Is the database busy?
Are sessions waiting?
Which application or user is connected?
```

```sql
SELECT
  pid,
  usename,
  application_name,
  client_addr,
  state,
  wait_event_type,
  wait_event,
  now() - query_start AS query_age,
  left(query, 120) AS query_sample
FROM pg_stat_activity
WHERE datname = current_database()
ORDER BY query_age DESC NULLS LAST;
```

## Connection Count

What this answers:

```text
Are app instances exhausting database connections?
```

```sql
SELECT
  state,
  count(*) AS connections
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY state
ORDER BY connections DESC;
```

## Blocking And Locks

What this answers:

```text
Is one transaction blocking another request?
```

```sql
SELECT
  blocked.pid AS blocked_pid,
  blocked.query AS blocked_query,
  blocking.pid AS blocking_pid,
  blocking.query AS blocking_query
FROM pg_stat_activity blocked
JOIN pg_locks blocked_locks
  ON blocked_locks.pid = blocked.pid
JOIN pg_locks blocking_locks
  ON blocking_locks.locktype = blocked_locks.locktype
 AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
 AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
 AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
 AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
 AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
 AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
 AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
 AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
 AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
 AND blocking_locks.pid != blocked_locks.pid
JOIN pg_stat_activity blocking
  ON blocking.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted
  AND blocking_locks.granted;
```

## Table Sizes

What this answers:

```text
Which tables are growing and may affect query or index strategy?
```

```sql
SELECT
  schemaname,
  relname AS table_name,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
  pg_size_pretty(pg_relation_size(relid)) AS table_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

## Index Usage

What this answers:

```text
Are indexes being used for important tables?
```

```sql
SELECT
  relname AS table_name,
  indexrelname AS index_name,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC, indexrelname;
```

## Query Plan

What this answers:

```text
Is PostgreSQL scanning too much data for a critical query?
```

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM users
WHERE email = 'example@example.com';
```

Replace the sample query with the real query from the route being investigated.

## Migration History

What this answers:

```text
Which schema version is deployed?
Did the migration expected by the app actually run?
```

```sql
SELECT *
FROM alembic_version;
```

If the project uses a different migration tool, replace this with that tool's migration history table.

## Evidence Notes

Record the result as evidence, not as a guess:

```text
Request ID:
Route:
Symptom:
Database check:
Observed result:
What this proves:
What it does not prove:
Next cheapest check:
```

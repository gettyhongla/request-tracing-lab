# Lab 06: Database Operations And Resilience

Learn how PostgreSQL behaves when the support-ticket app depends on it.

## Why This Lab Exists

Support engineers and DevOps engineers do not need to become full-time DBAs for this project, but they do need to reason about database symptoms. Slow tickets, failed logins, duplicate submissions, and partial writes often come from database behavior.

## Architecture Before

```text
Flask support-ticket API -> PostgreSQL tables
```

The app can create users, tickets, messages, and events.

## Architecture After

```text
Flask support-ticket API
  |-- connection string and credentials
  |-- transactions for multi-table writes
  |-- query timing evidence
  |-- indexes for common lookups
  `-- safe database error handling
        |
        v
PostgreSQL
```

## Key Terms

| Term | Meaning |
| --- | --- |
| Connection string | Runtime setting that tells Flask how to reach PostgreSQL |
| Connection lifecycle | Open, use, commit or rollback, then close |
| Connection pool | Reusable set of database connections |
| Connection exhaustion | Too many clients trying to use the database at once |
| Timeout | Limit on how long the app waits before failing |
| Retry | A controlled second attempt after a transient failure |
| Transaction | Work that commits fully or rolls back fully |
| `EXPLAIN` | PostgreSQL command that shows how a query may run |
| RPO | How much data loss the business can tolerate |
| RTO | How long recovery can take |

## Must Implement Or Inspect

1. Document the app's `DATABASE_URL`.
2. Trace one support-ticket create request through a transaction.
3. Time one read query and one write query.
4. Compare a lookup that uses an index with one that cannot.
5. Run `EXPLAIN` for a beginner-friendly ticket query.
6. Demonstrate rollback with a controlled failed transaction.
7. Simulate connection exhaustion conceptually or with a small local limit.
8. Document backup and restore expectations.
9. Explain how a database failover would affect the app.

## Conceptual Only

Do not build a PostgreSQL HA cluster or shard the database in this lab.

You should understand:

```text
Primary database:
Replica:
Read replica:
Synchronous replication:
Asynchronous replication:
Replication lag:
Multi-AZ design:
Automatic failover:
Application reconnection:
DNS or endpoint changes during failover:
Sharding:
Shard key:
Hot shard:
Cross-shard query:
```

## Healthy-Path Verification

Capture:

```text
Successful connection:
Successful ticket write:
Successful ticket read:
Query duration:
Transaction committed:
Index used or likely useful:
```

## Controlled Failures

Test:

```text
Wrong credentials:
Wrong hostname or port:
Database stopped:
Slow query:
Missing index comparison:
Transaction rollback:
Simulated connection exhaustion:
Failover explanation:
```

## Evidence To Capture

```text
Connection string shape:
Credential source:
Healthy connection evidence:
Write transaction evidence:
Read query evidence:
Query timing:
EXPLAIN output:
Rollback evidence:
Backup approach:
RPO:
RTO:
Failure symptom:
What was ruled out:
Interview explanation:
Retained takeaway:
```

## Troubleshooting Questions

```text
Did the request fail before connecting, while querying, or while committing?
Did the app save all related ticket rows or none of them?
Could a retry create duplicate data?
Which query is slow?
Which index should support this lookup?
Would a replica help reads, writes, or neither?
What happens to active connections during failover?
```

## Interview Explanation

```text
PostgreSQL is the durable source of truth for support tickets. Flask should connect with explicit runtime configuration, use transactions for multi-table writes, avoid unlimited retries, and return safe errors when PostgreSQL is unavailable. Indexes help common reads, backups protect against data loss, and restore testing proves the recovery plan instead of assuming it works.
```

## Completion Standard

```text
The learner can explain why a ticket write must commit atomically, how to collect query and connection evidence, and what recovery targets mean for customer-impacting data.
```

## Retained Takeaway

```text
Database operations are about protecting customer records and proving what happened when reads, writes, credentials, latency, or recovery fail.
```

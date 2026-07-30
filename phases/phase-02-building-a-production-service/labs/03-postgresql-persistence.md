# Lab 03: PostgreSQL Persistence

Add PostgreSQL as the durable data layer.

The goal is to understand what the database owns and how application behavior changes when data is no longer only in memory.

## Build

1. Start PostgreSQL locally.
2. Create a database for the app.
3. Create one simple table that supports the app.
4. Add Flask configuration for the database connection.
5. Add one read path and one write path through the app.

Keep the data model simple. This lab is about the request path and evidence, not fancy schema design.

## Prove

Capture:

```text
Database created:
Table created:
App writes data:
App reads data:
SQL query proves the stored row:
Flask log shows the request:
```

## Break

Use the wrong database password or stop PostgreSQL.

Answer:

```text
What did the user see?
What did Flask log?
Did NGINX cause the failure?
What proves PostgreSQL was the failed dependency?
```

## Done When

You can explain why PostgreSQL is the source of truth and why application logs alone are not enough to prove data was saved.

## Evidence To Capture

```text
Schema:
Connection configuration:
Write request:
Read request:
SQL evidence:
Application log:
Database failure symptom:
Interview explanation:
Retained takeaway:
```

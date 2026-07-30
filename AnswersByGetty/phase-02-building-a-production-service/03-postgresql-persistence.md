# Lab 03: PostgreSQL Persistence

## Build

The goal of this lab is to add PostgreSQL as the durable data layer.

Up to this point, the app could respond to requests, but the important learning question is: what changes when data is stored outside the running Flask process?

The request path now starts moving toward:

```text
Browser or curl -> NGINX -> Flask -> PostgreSQL
```

In Lab 01, I designed the three-tier architecture. In Lab 02, I put NGINX in front of Flask. In this lab, I am adding the data tier so the app can write and read data from a database instead of only relying on memory or hardcoded responses.

## What PostgreSQL Is

PostgreSQL is a relational database management system. That means it stores data in structured tables with rows and columns, and I query that data with SQL.

PostgreSQL is commonly used for production applications because it supports:

- **Durable storage:** data survives app restarts.
- **SQL queries:** I can read, filter, join, insert, update, and delete data.
- **Transactions:** related changes can succeed or fail together.
- **Constraints:** the database can enforce rules like required fields and unique values.
- **Indexes:** the database can speed up common lookups.
- **Operational visibility:** I can inspect data directly instead of only trusting application logs.

For this stage of the lab, I do not need to become a database expert. I need to understand what PostgreSQL owns, how the app connects to it, how to prove data was saved, and what failure looks like when the database is unavailable.

## Why PostgreSQL For This Lab

I am using PostgreSQL because it is a common production relational database and it fits the mental model I need for interviews and daily operations:

```text
Application logic lives in Flask.
Durable data lives in PostgreSQL.
NGINX routes traffic to Flask.
Flask reads from and writes to PostgreSQL.
```

Compared with keeping data in memory, PostgreSQL gives the app a source of truth. If Flask restarts, in-memory data disappears. If data is written to PostgreSQL, the data can still be queried after the app process restarts.

Compared with a cache like Redis, PostgreSQL is usually the durable system of record. Redis can be useful later for speed, sessions, or caching, but PostgreSQL is where I expect important application data to be persisted.

## Commands I Ran

### 1. Install and start PostgreSQL

```bash
brew search postgresql
brew install postgresql
brew services start postgresql
brew services list
```

**What this proves:** PostgreSQL is installed locally and running as a service.

### 2. Connect to PostgreSQL

```bash
psql postgres
```

Inside `psql`:

```sql
SELECT version();
\l
\q
```

**What these commands mean:**

**`SELECT version();`** confirms the PostgreSQL server is responding and shows the version.

**`\l`** lists databases on the PostgreSQL server.

**`\q`** exits the `psql` shell.

### 3. Create the app database

```bash
createdb request_tracing_lab
psql request_tracing_lab
```

**What this means:** `request_tracing_lab` is the database for this project. Instead of mixing app data into the default `postgres` database, I created a separate database for the lab.

### 4. Create a simple table

Inside `psql request_tracing_lab`:

```sql
CREATE TABLE request_notes (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**What the table means:**

**`request_notes`:** a simple table for storing notes created during the lab.

**`id SERIAL PRIMARY KEY`:** creates an auto-incrementing unique ID for each row.

**`message TEXT NOT NULL`:** stores the note text and requires that every row has a message.

**`created_at TIMESTAMPTZ DEFAULT NOW()`:** stores when the row was created, including timezone awareness.

This table is intentionally simple. The point is not advanced schema design yet. The point is to prove that the app has a durable place to write and read data.

### 5. Insert and read data

```sql
INSERT INTO request_notes (message)
VALUES ('first postgres lab row');

SELECT * FROM request_notes;
```

**What this proves:** PostgreSQL accepted a write and returned the stored row on read.

## Essential SQL For This Stage

These are the commands I need at this stage of the lab:

```sql
\l
\dt
\d request_notes
SELECT * FROM request_notes;
SELECT id, message, created_at FROM request_notes ORDER BY id DESC;
```

**`\l`:** list databases.

**`\dt`:** list tables in the current database.

**`\d request_notes`:** describe the table schema.

**`SELECT * FROM request_notes;`:** prove rows exist.

**`ORDER BY id DESC`:** show the newest rows first.

For interview and operations readiness, I do not need every PostgreSQL command yet. I need to be able to connect, inspect the database, describe the schema, prove a row exists, and explain what happens if the database is unavailable.

## Prove

**Database created:**

```text
request_tracing_lab
```

**Table created:**

```text
request_notes
```

**Schema:**

```sql
CREATE TABLE request_notes (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Write request:**

```sql
INSERT INTO request_notes (message)
VALUES ('first postgres lab row');
```

**Read request:**

```sql
SELECT * FROM request_notes;
```

**SQL evidence:**

```text
The SELECT query should return the row with message: first postgres lab row
```

At this point, the database evidence matters more than the app evidence because Flask has not been wired to PostgreSQL yet. The manual SQL proves the database exists, the table exists, and the database can persist a row.

## Break

I have not completed the Flask-to-PostgreSQL failure test yet.

The future break test will be:

1. Wire Flask to PostgreSQL.
2. Confirm Flask can write and read a row.
3. Stop PostgreSQL or use a bad password.
4. Send the same request through NGINX to Flask.
5. Compare the client response, Flask log, NGINX log, and PostgreSQL state.

Expected learning:

```text
NGINX can route the request successfully.
Flask receives the request.
Flask fails when it tries to use PostgreSQL.
PostgreSQL is the failed dependency.
```

That distinction matters because not every `5xx` means NGINX failed. Sometimes NGINX routes correctly, Flask receives the request, and the dependency behind Flask fails.

## Key Takeaways

**PostgreSQL is the durable source of truth:** Data written to PostgreSQL survives outside the Flask process.

**The database owns stored application data:** Flask can create business logic, but PostgreSQL owns whether the row actually exists.

**Application logs are not enough:** A Flask log can say a request ran, but a SQL query proves whether the data was actually saved.

**Relational databases store structured data:** PostgreSQL stores data in tables, rows, and columns, and SQL is how I inspect and change that data.

**The data tier changes troubleshooting:** If a request fails after Flask receives it, I need to check whether the failure came from application code, database connectivity, credentials, schema, or the database service itself.

**At this stage, I only need operational fluency:** I should know how to start PostgreSQL, connect with `psql`, create a database, create a simple table, insert a row, read it back, and explain why that proves persistence.

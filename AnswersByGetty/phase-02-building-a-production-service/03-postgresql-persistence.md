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

**Connection configuration:**

```text
DATABASE_URL=dbname=request_tracing_lab
```

Flask uses `DATABASE_URL` if it is set. If it is not set, the app defaults to the local `request_tracing_lab` database.

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

Manual SQL write:

```sql
INSERT INTO request_notes (message)
VALUES ('first postgres lab row');
```

Application write through NGINX and Flask:

```bash
curl -i --max-time 5 http://127.0.0.1:8080/notes \
  -H 'Content-Type: application/json' \
  -d '{"message":"postgres row through flask and nginx"}'
```

Response:

```text
HTTP/1.1 201 CREATED
Server: nginx/1.31.3
X-Request-ID: dd3548eaa98e3e8d7a83ab846f82b31a
```

**Read request:**

Manual SQL read:

```sql
SELECT * FROM request_notes;
```

Application read through NGINX and Flask:

```bash
curl -i --max-time 5 http://127.0.0.1:8080/notes
```

Response:

```text
HTTP/1.1 200 OK
Server: nginx/1.31.3
X-Request-ID: cb4bd4d4906acf44db7db1a24b5d3972
```

**SQL evidence:**

```text
id | message                              | created_at
---+--------------------------------------+-------------------------------
3  | first postgres lab row from flask    | 2026-07-30 17:51:35.63169-04
2  | postgres row through flask and nginx | 2026-07-30 17:51:24.177706-04
1  | first postgres lab row               | 2026-07-30 17:33:42.778478-04
```

**Application log:**

```text
request_started request_id=dd3548eaa98e3e8d7a83ab846f82b31a method=POST path=/notes
database_write request_id=dd3548eaa98e3e8d7a83ab846f82b31a table=request_notes row_id=2
request_finished request_id=dd3548eaa98e3e8d7a83ab846f82b31a status=201

request_started request_id=cb4bd4d4906acf44db7db1a24b5d3972 method=GET path=/notes
database_read request_id=cb4bd4d4906acf44db7db1a24b5d3972 table=request_notes rows=2
request_finished request_id=cb4bd4d4906acf44db7db1a24b5d3972 status=200
```

The full proof chain is:

```text
curl through NGINX -> NGINX access log -> Flask log -> SQL SELECT from PostgreSQL
```

The SQL query is the strongest proof that the data was stored because it checks the database directly.

## Break

I completed the break test by stopping PostgreSQL while leaving NGINX and Flask running.

```bash
brew services stop postgresql@18
```

Then I sent the same write request through NGINX:

```bash
curl -i --max-time 5 http://127.0.0.1:8080/notes \
  -H 'Content-Type: application/json' \
  -d '{"message":"this should fail because postgres is stopped"}'
```

**What the user saw:**

```text
HTTP/1.1 503 SERVICE UNAVAILABLE
Server: nginx/1.31.3
X-Request-ID: fc36c1be66f5f018f435a45cb897dba5

{
  "error": "database unavailable",
  "request_id": "fc36c1be66f5f018f435a45cb897dba5"
}
```

**What Flask logged:**

```text
request_started request_id=fc36c1be66f5f018f435a45cb897dba5 method=POST path=/notes
database_error request_id=fc36c1be66f5f018f435a45cb897dba5 operation=create_note
psycopg.OperationalError: connection to server on socket "/tmp/.s.PGSQL.5432" failed: Connection refused
request_finished request_id=fc36c1be66f5f018f435a45cb897dba5 status=503
```

**NGINX access log:**

```text
127.0.0.1 - - [30/Jul/2026:17:52:55 -0400] "POST /notes HTTP/1.1" 503 90 "-" "curl/8.7.1"
```

**PostgreSQL state during failure:**

```text
postgresql@18 none
```

**SQL evidence after recovery:**

```sql
SELECT id, message, created_at
FROM request_notes
WHERE message = 'this should fail because postgres is stopped';
```

Result:

```text
0 rows
```

This proves the failed write was not saved.

**Did NGINX cause the failure?**

No. NGINX routed the request to Flask successfully. The proof is that the client got a JSON response from Flask with `database unavailable`, and the Flask log shows `request_started`, `database_error`, and `request_finished status=503`.

**What proves PostgreSQL was the failed dependency?**

The Flask log shows `psycopg.OperationalError` and `Connection refused` while connecting to the PostgreSQL socket. The PostgreSQL service status also showed `postgresql@18 none`, meaning PostgreSQL was stopped.

After the test, I restarted PostgreSQL:

```bash
brew services start postgresql@18
```

Then `GET /notes` through NGINX returned `200 OK` again.

## Key Takeaways

**PostgreSQL is the durable source of truth:** Data written to PostgreSQL survives outside the Flask process.

**The database owns stored application data:** Flask can create business logic, but PostgreSQL owns whether the row actually exists.

**Application logs are not enough:** A Flask log can say a request ran, but a SQL query proves whether the data was actually saved.

**A successful write needs database proof:** The app response and Flask log show that the request was handled, but `SELECT` proves PostgreSQL actually stored the row.

**Relational databases store structured data:** PostgreSQL stores data in tables, rows, and columns, and SQL is how I inspect and change that data.

**The data tier changes troubleshooting:** If a request fails after Flask receives it, I need to check whether the failure came from application code, database connectivity, credentials, schema, or the database service itself.

**A database failure is different from an NGINX failure:** In this lab, NGINX worked and Flask received the request. The failure happened when Flask tried to connect to PostgreSQL.

**At this stage, I only need operational fluency:** I should know how to start PostgreSQL, connect with `psql`, create a database, create a simple table, insert a row, read it back, and explain why that proves persistence.

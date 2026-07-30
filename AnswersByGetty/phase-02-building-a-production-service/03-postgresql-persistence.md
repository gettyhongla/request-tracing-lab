# Lab 03: PostgreSQL Persistence

## Build

The goal of this lab is to add PostgreSQL as the durable data layer.

```text
Browser or curl -> NGINX -> Flask -> PostgreSQL
```

This builds on Lab 01 and Lab 02: NGINX routes the request to Flask, and Flask now writes to and reads from PostgreSQL instead of only returning hardcoded or in-memory data.

## What PostgreSQL Is

PostgreSQL is a relational database management system. It stores structured data in tables, rows, and columns, and SQL is the language used to inspect and change that data.

Why it matters here:

- **Durability:** data survives app restarts.
- **Source of truth:** PostgreSQL owns whether the row actually exists.
- **SQL evidence:** I can query the database directly instead of only trusting app logs.
- **Production fit:** PostgreSQL supports transactions, constraints, indexes, and operational inspection.

For this lab, I do not need to become a database expert. I need to know how to start PostgreSQL, connect to it, create a simple schema, prove data was saved, and recognize what failure looks like when the app cannot reach the database.

## Why PostgreSQL

PostgreSQL fits the three-tier model:

```text
NGINX routes traffic.
Flask owns application logic.
PostgreSQL owns durable data.
```

Compared with memory, PostgreSQL keeps data after Flask restarts. Compared with Redis, PostgreSQL is the durable system of record; Redis can come later for caching or sessions.

## Commands I Ran

```bash
brew search postgresql
brew install postgresql
brew services start postgresql
brew services list
psql postgres
```

Inside `psql`:

```sql
SELECT version();
\l
\q
```

Create the app database:

```bash
createdb request_tracing_lab
psql request_tracing_lab
```

Create the table:

```sql
CREATE TABLE request_notes (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Insert and read a row manually:

```sql
INSERT INTO request_notes (message)
VALUES ('first postgres lab row');

SELECT * FROM request_notes;
```

## Table Meaning

**`request_notes`:** the simple table created for this lab.

**`id SERIAL PRIMARY KEY`:** gives each row a unique auto-incrementing ID.

**`message TEXT NOT NULL`:** stores the note text and requires a value.

**`created_at TIMESTAMPTZ DEFAULT NOW()`:** records when the row was created with timezone awareness.

The `/notes` route in Flask maps to this table. It is intentionally simple: it proves persistence, but it is not a full user-account notes feature yet.

## Essential SQL

```sql
\l
\dt
\d request_notes
SELECT * FROM request_notes;
SELECT id, message, created_at FROM request_notes ORDER BY id DESC;
```

**`\l`:** list databases.

**`\dt`:** list tables.

**`\d request_notes`:** describe the table schema.

**`SELECT`:** prove what rows actually exist in PostgreSQL.

## Prove

**Connection configuration:**

```text
DATABASE_URL=dbname=request_tracing_lab
```

Flask uses `DATABASE_URL` if it is set. Otherwise, it defaults to the local `request_tracing_lab` database.

**Schema:**

```sql
CREATE TABLE request_notes (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Write through NGINX and Flask:**

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

**Read through NGINX and Flask:**

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
```

The proof chain is:

```text
curl through NGINX -> NGINX access log -> Flask log -> SQL SELECT from PostgreSQL
```

The SQL query is the strongest proof because it checks the database directly.

## Break

I stopped PostgreSQL while leaving NGINX and Flask running:

```bash
brew services stop postgresql@18
```

Then I sent the same write request:

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

## Failure Conclusion

**What did the user see?** `503 SERVICE UNAVAILABLE` with `database unavailable`.

**What did Flask log?** Flask logged `database_error` and `psycopg.OperationalError: Connection refused`.

**Did NGINX cause the failure?** No. NGINX routed the request to Flask. The failure happened after Flask tried to connect to PostgreSQL.

**What proves PostgreSQL failed?** PostgreSQL was stopped, Flask logged a PostgreSQL connection error, and the failed row did not appear in SQL after recovery.

## Key Takeaways

**PostgreSQL is the durable source of truth:** Data written to PostgreSQL survives outside the Flask process.

**Application logs are not enough:** A Flask log can prove a request ran, but SQL proves whether the row was actually saved.

**A database failure is different from an NGINX failure:** NGINX can route successfully while Flask fails because PostgreSQL is unavailable.

**The `/notes` route is a persistence test:** It is a simple write/read API for proving Flask can use PostgreSQL. A real authenticated notes feature can come later if the project needs it.

**At this stage, I only need operational fluency:** I should know how to start PostgreSQL, connect with `psql`, create a table, insert a row, read it back, break the database dependency, and explain the evidence.

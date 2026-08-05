# Phase 2 Answers

This document records completed Phase 2 evidence, commands, conclusions, and retained takeaways.

## Completed Labs

| Lab | Topic |
| --- | --- |
| [Lab 01](#lab-01-three-tier-architecture) | Three-tier architecture |
| [Lab 02](#lab-02-nginx-reverse-proxy) | NGINX reverse proxy |
| [Lab 03](#lab-03-postgresql-persistence) | PostgreSQL persistence |
| [Lab 04](#lab-04-redis-cache-and-session-support) | Redis cache and session support |
| [Lab 05](#lab-05-support-ticket-data-model) | Support-ticket data model |
| [Lab 06](#lab-06-database-operations-performance-and-resilience) | Database operations, performance, and resilience |
| [Lab 07](#lab-07-api-design-and-authentication) | API design and authentication |
| [Lab 08](#lab-08-webhooks-and-asynchronous-delivery) | Webhooks and asynchronous delivery |
| [Lab 09](#lab-09-workers-and-queues) | Workers and queues |
| [Lab 10](#lab-10-websockets-and-real-time-updates) | WebSockets and real-time updates |

## Lab 01: Three-Tier Architecture

### Build

#### 1. Component View

This view shows the major components built in this phase.

```mermaid
flowchart TD
    Browser["Browser / curl"]
    NGINX["NGINX Reverse Proxy"]
    Flask["Flask API"]
    Postgres["PostgreSQL"]

    Browser -->|"GET /api/profile"| NGINX
    NGINX --> Flask
    Flask -->|"SQL Query"| Postgres
    Postgres -->|"Query Results"| Flask
    Flask -->|"JSON Response"| NGINX
    NGINX -->|"HTTP Response"| Browser
```

#### 2. Request-Tracing View

```mermaid
flowchart TD
    A["Client<br/>GET /api/profile<br/>Request-ID: abc123"]
    B["NGINX<br/>Reverse Proxy"]
    C["Flask API<br/>Business Logic"]
    D["PostgreSQL<br/>SQL Query"]
    E["JSON Response"]

    A --> B
    B --> C
    C --> D
    D --> C
    C --> E
    E --> B
    B --> A
```

#### 3. Request Path

For a successful `GET /api/profile` request:

1. The client sends an HTTP request to the application.
2. NGINX accepts the request as the public entry point.
3. NGINX forwards the request to the Flask API.
4. Flask validates the request and runs the application logic.
5. Flask queries PostgreSQL for the required data.
6. PostgreSQL returns the query result to Flask.
7. Flask formats the result as JSON.
8. NGINX returns the HTTP response to the client.

### Explain Each Layer

**Browser or curl:** acts as the client. It sends an HTTP request, such as `GET /api/profile`, to the application and displays the HTTP response, including the status code, headers, timing, and any JSON returned by the API.

**NGINX:** acts as a reverse proxy. It accepts incoming client requests, forwards them to the Flask API, and returns the backend response to the client. NGINX also generates access logs, can forward request IDs, and provides a single public entry point to the application.

**Flask API:** contains the application's business logic. It receives requests from NGINX, validates authentication and authorization, processes the request, queries PostgreSQL for the required data, and returns a JSON response to the client.

**PostgreSQL:** is the application's durable data store. It stores user and application data, executes SQL queries from the Flask API, and returns the requested records. PostgreSQL is a backend service and is not directly accessible to clients.

### Break: Predicted Failure Symptoms

**If NGINX cannot reach Flask:**

The user may receive a `502 Bad Gateway` response.

**What that means:**

This means NGINX accepted the client's request but could not obtain a valid response from its upstream Flask application. Possible causes include the Flask application being unavailable, listening on the wrong port, an incorrect upstream configuration, or a network connectivity issue.

**If Flask cannot reach PostgreSQL:**

The user will usually receive a `500 Internal Server Error` because Flask cannot complete the request after failing to communicate with the database.

**Possible alternate symptom:**

Depending on the application's error handling, some applications may instead return a `503 Service Unavailable` response.

**If PostgreSQL is slow:**

The user experiences slow page loads, delayed API responses, request timeouts, or possibly a `5xx` response if the application exceeds its configured timeout while waiting for the database.

**What that means:**

A `5xx` status code indicates that the server was unable to successfully complete the request.

**If request IDs are missing:**

Troubleshooting becomes significantly more difficult because it is no longer possible to correlate a single client request across NGINX logs, Flask application logs, and database-related logs.

**Why request IDs matter:**

Request IDs allow us to trace one request throughout the entire system.

## Lab 02: NGINX Reverse Proxy

### Build

The goal of this lab was to put NGINX in front of the Flask app so the request path becomes:

```text
Browser or curl -> NGINX on port 8080 -> Flask on port 5000 -> response
```

This builds on Phase 1 by tracing one request with an added proxy layer before the application. It also turns the Lab 01 architecture from a diagram into a working request path: `Browser/curl -> NGINX -> Flask`.

#### Commands Used

```bash
brew install nginx
brew info nginx
vim /opt/homebrew/etc/nginx/nginx.conf
/opt/homebrew/opt/nginx/bin/nginx -t
brew services start nginx
brew services list
curl http://127.0.0.1:5000
curl -i --max-time 3 http://127.0.0.1:8080
lsof -nP -iTCP:8080 -sTCP:LISTEN
tail -f /opt/homebrew/var/log/nginx/access.log
tail -f /opt/homebrew/var/log/nginx/error.log
```

#### Important NGINX paths

**macOS Homebrew:**

```text
Main config: /opt/homebrew/etc/nginx/nginx.conf
Logs:        /opt/homebrew/var/log/nginx/
Access log:  /opt/homebrew/var/log/nginx/access.log
Error log:   /opt/homebrew/var/log/nginx/error.log
Web root:    /opt/homebrew/var/www/
Binary:      /opt/homebrew/opt/nginx/bin/nginx
```

**Ubuntu:**

```text
Main config:  /etc/nginx/nginx.conf
Site configs: /etc/nginx/sites-available/
Enabled site: /etc/nginx/sites-enabled/
```

**RHEL / CentOS / Fedora:**

```text
Main config: /etc/nginx/nginx.conf
App configs: /etc/nginx/conf.d/
```

The exact file locations change by operating system, but the purpose is the same: NGINX reads a config, listens on a port, receives client traffic, and forwards matching requests to an upstream service.

#### NGINX config

The Homebrew NGINX config was updated:

```bash
vim /opt/homebrew/etc/nginx/nginx.conf
```

The important server block is:

```nginx
server {
    listen 8080;
    server_name localhost;

    location / {
        proxy_pass http://127.0.0.1:5000;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Request-ID $request_id;
    }
}
```

#### What the config means

**`listen 8080`:** NGINX listens for browser or curl traffic on port `8080`.

**`server_name localhost`:** This server block handles local requests to `localhost`.

**`location /`:** This matches the app routes for this lab.

**`proxy_pass http://127.0.0.1:5000`:** NGINX forwards the request to Flask on port `5000`.

**`proxy_set_header Host $host`:** Preserves the original host header.

**`proxy_set_header X-Real-IP $remote_addr`:** Sends Flask the client IP address NGINX saw.

**`proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for`:** Keeps the chain of client/proxy IP addresses.

**`proxy_set_header X-Forwarded-Proto $scheme`:** Tells Flask whether the original request used `http` or `https`.

**`proxy_set_header X-Request-ID $request_id`:** Sends a request ID downstream so one request can be correlated across NGINX, Flask, and the client response.

These headers are customizable. The essence is that NGINX can forward the request and preserve useful context about the original client request.

#### NGINX functionality

NGINX is often used for more than one job:

- **Reverse proxy:** receives client traffic and forwards it to an upstream app.
- **SSL termination:** handles HTTPS/TLS at the edge before forwarding to the app.
- **Static web server:** serves files like HTML, CSS, JavaScript, and images.
- **Load balancer:** distributes traffic across multiple upstream app instances.
- **Ingress in Kubernetes:** routes external traffic into services inside a Kubernetes cluster.

In this lab, NGINX is used as a reverse proxy first. The other roles explain why NGINX commonly appears at the front of production systems.

### Proof

**Flask direct test:**

```bash
curl http://127.0.0.1:5000
```

This proved Flask was reachable directly on port `5000`.

**NGINX proxy test:**

```bash
curl -i --max-time 3 http://127.0.0.1:8080
curl -i --max-time 5 http://127.0.0.1:8080/health
```

Important response evidence:

```text
HTTP/1.1 200 OK
Server: nginx/1.31.3
Content-Type: application/json
X-Request-ID: 6e8c60f9fd7dc6e0903910c024ea0428
```

This proved the request reached NGINX first, then NGINX routed it to Flask.

**Response headers captured:**

```text
Server: nginx/1.31.3
Content-Type: application/json
Content-Length: 77
Connection: keep-alive
X-Request-ID: b407c79ce1620eefce609310ca7a5070
```

The `Server: nginx/1.31.3` header proves the client received the response through NGINX. The `X-Request-ID` header proves NGINX added a request identifier that can be used to correlate the client response with proxy and application logs.

**Service check:**

```bash
brew services list
```

Result:

```text
nginx started
```

**Port check:**

```bash
lsof -nP -iTCP:8080 -sTCP:LISTEN
```

Result:

```text
nginx TCP *:8080 (LISTEN)
```

**NGINX access log:**

```bash
tail -f /opt/homebrew/var/log/nginx/access.log
```

Example evidence:

```text
127.0.0.1 - - [30/Jul/2026:16:52:46 -0400] "GET / HTTP/1.1" 200 4141 "-" "curl/8.7.1"
```

This proves NGINX saw the request and returned a `200` response.

**NGINX error log:**

```bash
tail -f /opt/homebrew/var/log/nginx/error.log
```

This is where to check for config errors, startup problems, permission issues, or upstream failures when NGINX cannot reach Flask.

### Break

The broken-upstream test was completed by temporarily changing the upstream port in the NGINX config.

This line was changed:

```nginx
proxy_pass http://127.0.0.1:5000;
```

to this:

```nginx
proxy_pass http://127.0.0.1:5999;
```

The change belongs inside `proxy_pass` because that directive controls where NGINX forwards matching traffic after it receives the request. NGINX still listened on `8080`, but it tried to forward the request to port `5999` instead of the Flask app on `5000`.

Then reload NGINX:

```bash
/opt/homebrew/opt/nginx/bin/nginx -t
/opt/homebrew/opt/nginx/bin/nginx -s reload
```

Send the request through NGINX:

```bash
curl -i --max-time 5 http://127.0.0.1:8080/health
```

Client response:

```text
HTTP/1.1 502 Bad Gateway
Server: nginx/1.31.3
Content-Type: text/html
```

NGINX access log:

```text
127.0.0.1 - - [30/Jul/2026:17:19:25 -0400] "GET /health HTTP/1.1" 502 497 "-" "curl/8.7.1"
```

NGINX error log:

```text
connect() failed (61: Connection refused) while connecting to upstream, upstream: "http://127.0.0.1:5999/health"
```

Direct Flask test still worked:

```bash
curl -i --max-time 5 http://127.0.0.1:5000/health
```

Direct Flask response:

```text
HTTP/1.1 200 OK
Server: Werkzeug/3.1.8 Python/3.9.6
X-Request-ID: 0fd2efdc-7942-496f-a2bc-213a735a2942
```

This proved Flask itself was healthy. The failure happened because NGINX was pointed at the wrong upstream port.

After the test, restore the NGINX config back to:

```nginx
proxy_pass http://127.0.0.1:5000;
```

Then reload NGINX and confirm `http://127.0.0.1:8080/health` returned `200 OK` again.

### Key Takeaways

**NGINX became the front door:** Requests no longer need to go directly to Flask. They can go to NGINX on `8080`, and NGINX routes them to Flask on `5000`.

**The request path is now visible at the proxy layer:** The NGINX access log proves the request reached the proxy before Flask.

**Headers carry context:** `Host`, `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`, and `X-Request-ID` help Flask understand the original client request after it passes through NGINX.

**`proxy_set_header` controls what NGINX forwards downstream:** These lines add or preserve headers before NGINX sends the request to Flask. Keep `proxy_set_header X-Request-ID $request_id;` because it allows NGINX to generate a request ID. Remove the duplicate `proxy_set_header X-Request-ID $http_x_request_id;` because it only forwards a client-provided request ID and can be blank if the client did not send one.

**A reverse proxy gives production systems a control point:** NGINX can route traffic, serve static files, terminate SSL, load balance, and act as an ingress layer in Kubernetes.

**502 Bad Gateway means the proxy could not get a valid upstream response:** In this lab, the bad port made NGINX fail to connect to `127.0.0.1:5999`, so NGINX returned `502` even though Flask was still healthy on `5000`.

**An upstream is the backend service NGINX forwards traffic to:** In this lab, Flask on `127.0.0.1:5000` is the upstream. When `proxy_pass` changed to `127.0.0.1:5999`, NGINX could not connect to the upstream, so the request stopped at NGINX and headers were never forwarded to Flask.

**Request ID forwarding depends on reaching the upstream:** If the client sends `X-Request-ID`, `$http_x_request_id` can forward that client-provided value. If the client does not send one, it can be blank. In a broken-upstream failure, Flask receives neither value because NGINX cannot connect to Flask at all.

**Reverse proxy vs forward proxy:** A reverse proxy sits in front of servers and represents the server side to clients. A forward proxy sits in front of clients and represents the client side to servers.

## Lab 03: PostgreSQL Persistence


### Build

The goal of this lab is to add PostgreSQL as the durable data layer.

```text
Browser or curl -> NGINX -> Flask -> PostgreSQL
```

This builds on Lab 01 and Lab 02: NGINX routes the request to Flask, and Flask now writes to and reads from PostgreSQL instead of only returning hardcoded or in-memory data.

### What Is PostgreSQL

PostgreSQL is a relational database management system. It stores structured data in tables, rows, and columns, and SQL is the language used to inspect and change that data.

Why it matters here:

- **Durability:** data survives app restarts.
- **Source of truth:** PostgreSQL owns whether the row actually exists.
- **SQL evidence:** Query the database directly instead of only trusting app logs.
- **Production fit:** PostgreSQL supports transactions, constraints, indexes, and operational inspection.

This lab does not require deep DBA knowledge. The practical goal is to start PostgreSQL, connect with `psql`, create a simple schema, prove data was saved, and recognize what failure looks like when the app cannot reach the database.

### Why PostgreSQL

PostgreSQL fits the three-tier model:

```text
NGINX routes traffic.
Flask owns application logic.
PostgreSQL owns durable data.
```

Compared with memory, PostgreSQL keeps data after Flask restarts. Compared with Redis, PostgreSQL is the durable system of record; Redis can come later for caching or sessions.

### Commands Used

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

### Table Meaning

**`request_notes`:** the simple table created for this lab.

**`id SERIAL PRIMARY KEY`:** gives each row a unique auto-incrementing ID.

**`message TEXT NOT NULL`:** stores the note text and requires a value.

**`created_at TIMESTAMPTZ DEFAULT NOW()`:** records when the row was created with timezone awareness.

The `/notes` route in Flask maps to this table. It is intentionally simple: it proves persistence, but it is not a full user-account notes feature yet.

### Essential SQL

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

### Proof

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

### Break

PostgreSQL was stopped while NGINX and Flask kept running:

```bash
brew services stop postgresql@18
```

Then send the same write request:

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

### Failure Conclusion

**What did the user see?** `503 SERVICE UNAVAILABLE` with `database unavailable`.

**What did Flask log?** Flask logged `database_error` and `psycopg.OperationalError: Connection refused`.

**Did NGINX cause the failure?** No. NGINX routed the request to Flask. The failure happened after Flask tried to connect to PostgreSQL.

**What proves PostgreSQL failed?** PostgreSQL was stopped, Flask logged a PostgreSQL connection error, and the failed row did not appear in SQL after recovery.

### Key Takeaways

**PostgreSQL is the durable source of truth:** Data written to PostgreSQL survives outside the Flask process.

**Application logs are not enough:** A Flask log can prove a request ran, but SQL proves whether the row was actually saved.

**A database failure is different from an NGINX failure:** NGINX can route successfully while Flask fails because PostgreSQL is unavailable.

**The `/notes` route is a persistence test:** It is a simple write/read API for proving Flask can use PostgreSQL. A real authenticated notes feature can come later if the project needs it.

**At this stage, operational fluency is enough:** Know how to start PostgreSQL, connect with `psql`, create a table, insert a row, read it back, break the database dependency, and explain the evidence.

## Lab 04: Redis Cache And Session Support


### Build

The goal of this lab is to add Redis as temporary support state.

```text
Browser or curl -> NGINX -> Flask -> Redis cache
                              |
                              -> PostgreSQL on cache miss
```

This lab uses one Redis responsibility:

```text
Cache the GET /notes response.
```

PostgreSQL remains the durable source of truth. Redis stores a temporary copy of the latest notes response so repeated reads can be served faster.

### What Is Redis

Redis is an in-memory key/value store. It is commonly used for fast temporary data such as cache entries, sessions, counters, locks, and queue-related state.

For this lab, Redis is a cache. It is not the system of record. If Redis loses the cached value, Flask can still read from PostgreSQL and rebuild the cache.

### Redis Core vs Redis Stack Modules

For Lab 04, you only need Redis core:

```text
SET
GET
EXPIRE
TTL
DEL
```

Redis Stack modules are optional extensions for specialized features such as search, JSON documents, bloom filters, and time-series data. They are not needed for this cache lab.

### Commands Used

Start and verify Redis:

```bash
brew search redis
brew install redis
brew services start redis
brew services list
redis-cli ping
```

Connection evidence:

```text
PONG
```

Manual Redis basics:

```redis
SET lab:test "hello redis"
GET lab:test
TTL lab:test
EXPIRE lab:test 30
TTL lab:test
DEL lab:test
GET lab:test
```

Evidence:

```text
SET lab:test "hello redis" -> OK
GET lab:test -> "hello redis"
TTL lab:test -> -1
EXPIRE lab:test 30 -> 1
TTL lab:test -> 30
DEL lab:test -> 1
GET lab:test -> nil
```

`TTL -1` means the key exists but has no expiration. After `EXPIRE`, Redis shows a countdown. `nil` means the key no longer exists.

### Runtime Configuration

Flask connects to Redis through runtime configuration:

```text
REDIS_URL=redis://127.0.0.1:6379/0
NOTES_CACHE_KEY=notes:latest
NOTES_CACHE_TTL_SECONDS=30
```

Local Redis runs on `127.0.0.1:6379`. In AWS, the same idea would point to an ElastiCache endpoint. In containers later, it may point to a service name such as `redis:6379`.

### Cache Behavior

The `GET /notes` path now works like this:

```text
1. Check Redis for notes:latest.
2. If the key exists, return cache: hit.
3. If the key is missing, read PostgreSQL, store the result in Redis, return cache: miss.
4. If Redis is unavailable, read PostgreSQL anyway, return cache: unavailable.
```

The `POST /notes` path writes to PostgreSQL and deletes `notes:latest` from Redis so the next read refreshes the cache.

### Proof

**Redis connection evidence:**

```bash
redis-cli ping
```

Captured result:

```text
PONG
```

This proves the Redis server accepted a client connection on `127.0.0.1:6379`.

**Connection configuration:**

```text
REDIS_URL=redis://127.0.0.1:6379/0
NOTES_CACHE_KEY=notes:latest
NOTES_CACHE_TTL_SECONDS=30
```

This tells Flask where Redis is, which key stores the cached notes response, and how long the cache entry should live.

**Cache miss evidence:**

```bash
redis-cli DEL notes:latest
curl -s -i --max-time 5 http://127.0.0.1:8080/notes
```

Captured response evidence:

```text
HTTP/1.1 200 OK
X-Request-ID: 757a81ebffa29d9f58e636f6ab37f377
"cache": "miss"
"request_id": "757a81ebffa29d9f58e636f6ab37f377"
```

This proves Redis was empty for `notes:latest`, so Flask read from PostgreSQL and returned the notes through NGINX.

**Cache hit evidence:**

```bash
curl -s -i --max-time 5 http://127.0.0.1:8080/notes
```

Captured response evidence:

```text
HTTP/1.1 200 OK
X-Request-ID: b12b5df54c43b8b9f41efe6874c20141
"cache": "hit"
"request_id": "b12b5df54c43b8b9f41efe6874c20141"
```

This proves the follow-up read came from Redis instead of rebuilding the response from PostgreSQL again.

**Cached value evidence:**

```bash
redis-cli GET notes:latest
```

Captured result:

```text
[{"id": 3, "message": "first postgres lab row from flask", ...},
 {"id": 2, "message": "postgres row through flask and nginx", ...},
 {"id": 1, "message": "first postgres lab row", ...}]
```

This proves Redis stored a serialized copy of the latest notes response.

**TTL or expiry evidence:**

```bash
redis-cli TTL notes:latest
```

Captured result:

```text
28
```

This proves Redis stored `notes:latest` with an expiration countdown. The cache is temporary by design.

**PostgreSQL remains source of truth:**

```bash
psql request_tracing_lab -c "SELECT id, message, created_at FROM request_notes ORDER BY id DESC;"
```

Captured SQL evidence:

```text
 id |               message                |          created_at
----+--------------------------------------+-------------------------------
  3 | first postgres lab row from flask    | 2026-07-30 17:51:35.63169-04
  2 | postgres row through flask and nginx | 2026-07-30 17:51:24.177706-04
  1 | first postgres lab row               | 2026-07-30 17:33:42.778478-04
(3 rows)
```

Redis can speed up reads, but PostgreSQL is the durable proof that the notes actually exist. If the Redis key is deleted or expires, Flask can rebuild the cache from PostgreSQL.

### Break

Redis-unavailable behavior was tested by starting a temporary Flask process on port `5002` with Redis pointed at the wrong port:

```bash
REDIS_URL=redis://127.0.0.1:6390/0 \
FLASK_RUN_HOST=127.0.0.1 \
FLASK_RUN_PORT=5002 \
FLASK_DEBUG=false \
venv/bin/python app.py
```

Then send the request directly to that temporary Flask process:

```bash
curl -s -i --max-time 5 http://127.0.0.1:5002/notes
```

Captured response evidence:

```text
HTTP/1.1 200 OK
X-Request-ID: 097509d9-d8af-4728-a36e-e20604cccc46
"cache":"unavailable"
"request_id":"097509d9-d8af-4728-a36e-e20604cccc46"
```

Captured Flask log evidence for the same request ID:

```text
request_started request_id=097509d9-d8af-4728-a36e-e20604cccc46 method=GET path=/notes
cache_error request_id=097509d9-d8af-4728-a36e-e20604cccc46 key=notes:latest
redis.exceptions.ConnectionError: Error 61 connecting to 127.0.0.1:6390. Connection refused.
database_read request_id=097509d9-d8af-4728-a36e-e20604cccc46 table=request_notes rows=3
request_finished request_id=097509d9-d8af-4728-a36e-e20604cccc46 status=200
```

### Failure Conclusion

**What did the user see?** The user still received `200 OK` with notes and `"cache":"unavailable"`.

**Did the app fail closed, fail open, or fall back?** The app fell back to PostgreSQL. This is a graceful fallback, not a full request failure.

**Did PostgreSQL still work?** Yes. The same failed-Redis request logged `database_read` with `rows=3`.

**What evidence proves Redis was the failed dependency?** The Flask log shows `cache_error` and `redis.exceptions.ConnectionError` for `127.0.0.1:6390`, while the same request ID also shows a successful PostgreSQL `database_read` and `request_finished status=200`.

**Would this block the whole request, degrade performance, or only disable cache/session behavior?** For `GET /notes`, Redis failure only disables cache behavior and may make reads slower because Flask must query PostgreSQL. It does not block the whole request as long as PostgreSQL is healthy.

### Evidence Checklist

**Redis responsibility:** Cache the `GET /notes` response using the `notes:latest` key.

**Connection configuration:** `REDIS_URL=redis://127.0.0.1:6379/0`, `NOTES_CACHE_KEY=notes:latest`, and `NOTES_CACHE_TTL_SECONDS=30`.

**Cache miss evidence:** After `redis-cli DEL notes:latest`, `GET /notes` returned `"cache": "miss"` with request ID `757a81ebffa29d9f58e636f6ab37f377`.

**Cache hit evidence:** The following `GET /notes` returned `"cache": "hit"` with request ID `b12b5df54c43b8b9f41efe6874c20141`.

**Expiry evidence:** `redis-cli TTL notes:latest` returned `28`, proving the cache key had an expiration countdown.

**Fallback behavior:** When Redis was pointed to bad port `6390`, `GET /notes` returned `"cache":"unavailable"` and still returned the notes from PostgreSQL.

**Failure symptom:** Flask logged `cache_error` and `redis.exceptions.ConnectionError`, but the client still received notes if PostgreSQL was healthy.

**PostgreSQL source-of-truth proof:** A direct SQL query against `request_notes` returned the same three rows, independent of Redis.

**Cache vs queue explanation:** In this lab, Redis is a cache inside the synchronous request path. It stores a temporary copy of data that PostgreSQL already owns. A queue is different: it stores work for a worker to process later outside the request/response path.

**Interview explanation:** Redis is fast temporary state. It can improve repeated reads and support sessions, but it should not be treated as durable storage for this lab. PostgreSQL remains the source of truth. If Redis is empty, Flask rebuilds the cache from PostgreSQL. If Redis is unavailable, the endpoint should degrade gracefully when PostgreSQL can still serve the data.

**Retained takeaway:** Cache failure should degrade the experience instead of destroying the request when the durable database can still answer.

### Cache vs Queue

This lab uses Redis as cache, not as a queue.

```text
Cache: helps a synchronous request read faster.
Queue: stores work for a worker to process later.
Worker: runs outside the request/response path.
```

Async does not automatically mean real-time. Async means work can happen after the user request returns. Real-time means users receive live or near-live updates.

### Cloud Connection

**AWS:** Redis maps to Amazon ElastiCache for Redis or Valkey. PostgreSQL maps to Amazon RDS PostgreSQL.

**Cloudflare:** Cloudflare can cache at the edge, terminate TLS, and proxy traffic before it reaches the app. Redis is different because it is an application-side cache that Flask controls directly.

### Key Takeaways

**Redis is fast temporary state:** It is useful for cache/session behavior, but it is not the durable source of truth.

**PostgreSQL remains source of truth:** SQL still proves what data actually exists.

**Cache miss reads PostgreSQL:** Redis being empty should not break the request.

**Cache hit reads Redis:** Repeated reads can avoid hitting PostgreSQL for a short time.

**Redis failure should degrade gracefully:** For this endpoint, Redis unavailable means slower reads, not a failed user request.

**Cache/session Redis belongs in Phase 2:** Queue/worker Redis is only a boundary preview here. It was not built yet; it belongs later when the architecture adds asynchronous processing in Lab 09.

## Lab 05: Support-Ticket Data Model

### Build

The goal of this lab is to turn the request-tracing app into a durable support-ticket workflow.

```text
Browser or curl -> NGINX -> Flask support-ticket API -> PostgreSQL
```

PostgreSQL owns the durable records:

```text
users
tickets
ticket_messages
ticket_events
```

Redis can support temporary cache, sessions, or queues later, but support tickets belong in PostgreSQL because they are business records that must survive app restarts and cache expiration.

### Schema

The migration file is:

```text
phases/phase-02-building-a-production-service/sql/001_support_tickets.sql
```

It creates:

**`users`:** identities that can log in. Customers create tickets; admins support tickets.

**`tickets`:** durable support issues created by users.

**`ticket_messages`:** customer replies, support replies, internal notes, and system messages connected to a ticket.

**`ticket_events`:** audit trail records with `request_id` so database changes can be traced back to one request.

Important relationship rules:

```text
tickets.created_by -> users.id
tickets.assigned_to -> users.id
ticket_messages.ticket_id -> tickets.id
ticket_messages.author_id -> users.id
ticket_events.ticket_id -> tickets.id
ticket_events.actor_id -> users.id
```

Important constraints:

```text
users_role_check
tickets_category_check
tickets_priority_check
tickets_status_check
ticket_messages_type_check
```

Important indexes:

```text
idx_users_username_lower
idx_users_email_lower
idx_tickets_created_by_created_at
idx_tickets_status_priority
idx_ticket_messages_ticket_id_created_at
idx_ticket_events_ticket_id_created_at
```

Indexes are not cache. An index is a database lookup structure that helps PostgreSQL find or order rows efficiently. A cache stores reusable data or query results.

### Proof

**Schema applied:**

```bash
psql request_tracing_lab -f phases/phase-02-building-a-production-service/sql/001_support_tickets.sql
```

**Tables verified:**

```text
request_notes
ticket_events
ticket_messages
tickets
users
```

`request_notes` came from Lab 03. The support-ticket tables are `users`, `tickets`, `ticket_messages`, and `ticket_events`.

**Customer registration:**

```bash
curl -i -c /tmp/rtl-customer.cookie \
  -H "Content-Type: application/json" \
  -d '{"username":"customer1","email":"customer1@example.com","password":"customerpass"}' \
  http://127.0.0.1:8080/api/auth/register
```

Captured evidence:

```text
HTTP/1.1 201 CREATED
X-Request-ID: 0b84cac18d2655b76148b32d77862fd9
Set-Cookie: session=...
user.id: 1
user.username: customer1
user.role: customer
```

**Customer login:**

```bash
curl -i -c /tmp/rtl-customer.cookie \
  -H "Content-Type: application/json" \
  -d '{"username":"customer1","password":"customerpass"}' \
  http://127.0.0.1:8080/api/auth/login
```

Captured evidence:

```text
HTTP/1.1 200 OK
X-Request-ID: b0f1399932f4fef4512222b40ca6aa4b
Set-Cookie: session=...
user.id: 1
user.role: customer
```

**Admin login:**

```bash
curl -i -c /tmp/rtl-admin.cookie \
  -H "Content-Type: application/json" \
  -d '{"username":"getty","password":"cloudpass"}' \
  http://127.0.0.1:8080/api/auth/login
```

Captured evidence:

```text
HTTP/1.1 200 OK
X-Request-ID: 14b60a523e4db3066cf453e984235991
Set-Cookie: session=...
user.id: 3
user.role: admin
```

`/tmp/rtl-customer.cookie` and `/tmp/rtl-admin.cookie` are temporary curl cookie files. Browser login cookies and curl login cookies are separate.

**Customer reply added to ticket `1`:**

```bash
curl -i -b /tmp/rtl-customer.cookie \
  -H "Content-Type: application/json" \
  -d '{"body":"Adding more evidence from the request log for Lab 05."}' \
  http://127.0.0.1:8080/api/tickets/1/messages
```

Captured evidence:

```text
HTTP/1.1 201 CREATED
X-Request-ID: 603b5f0c73c0cea5f9e153fb5a73f125
message.id: 7
message.ticket_id: 1
message.author_id: 1
message.message_type: customer_reply
```

**Admin internal note added to ticket `1`:**

```bash
curl -i -b /tmp/rtl-admin.cookie \
  -H "Content-Type: application/json" \
  -d '{"body":"Internal note: reviewed support evidence for Lab 05."}' \
  http://127.0.0.1:8080/api/admin/tickets/1/internal-notes
```

Captured evidence:

```text
HTTP/1.1 201 CREATED
X-Request-ID: 82923023031cc3fd7a0a7007414a5b04
message.id: 8
message.ticket_id: 1
message.author_id: 3
message.message_type: internal_note
```

**Customer view of ticket `1`:**

```text
HTTP/1.1 200 OK
X-Request-ID: c1b34bde49a70983a1fd7473e1669bbf
Visible message types: customer_reply
Hidden message types: internal_note
```

**Admin view of ticket `1`:**

```text
HTTP/1.1 200 OK
X-Request-ID: 71c7dcea9f8a9a623ecde600bbd89dfe
Visible message types: customer_reply, internal_note
```

This proves the app hides internal notes from regular customers and exposes them to admins.

### SQL Evidence

**Users:**

```text
 id | username  |   role
----+-----------+----------
  1 | customer1 | customer
  2 | getty2    | customer
  3 | getty     | admin
```

**Tickets:**

```text
 id | ticket_number | created_by | status | priority
----+---------------+------------+--------+----------
  1 | TCK-96645C93  |          1 | open   | medium
  2 | TCK-DE75C223  |          1 | open   | medium
  3 | TCK-C1151726  |          2 | open   | medium
```

**Ticket messages:**

```text
 id | ticket_id | author_id |  message_type  | body
----+-----------+-----------+----------------+-------------------------------------------------------
  7 |         1 |         1 | customer_reply | Adding more evidence from the request log for Lab 05.
  8 |         1 |         3 | internal_note  | Internal note: reviewed support evidence for Lab 05.
```

**Ticket events:**

```text
 id | ticket_id | actor_id |    action     |   new_value    |              request_id
----+-----------+----------+---------------+----------------+----------------------------------
  7 |         1 |        1 | message_added | customer_reply | 603b5f0c73c0cea5f9e153fb5a73f125
  8 |         1 |        3 | message_added | internal_note  | 82923023031cc3fd7a0a7007414a5b04
```

The `ticket_events.request_id` values match the API responses for the customer reply and admin internal note.

### Controlled Failures

**Duplicate username:**

```bash
curl -i -H "Content-Type: application/json" \
  -d '{"username":"customer1","email":"customer1-again@example.com","password":"customerpass"}' \
  http://127.0.0.1:8080/api/auth/register
```

Captured evidence:

```text
HTTP/1.1 409 CONFLICT
X-Request-ID: d0f364454a13b4a80c2de81de47d52ec
category: duplicate_account
error: username or email already exists
```

This proves the database uniqueness rule prevents duplicate account identity.

**Unauthenticated ticket creation:**

```bash
curl -i -H "Content-Type: application/json" \
  -d '{"title":"Unauth test","description":"No cookie sent.","category":"technical_question","priority":"medium"}' \
  http://127.0.0.1:8080/api/tickets
```

Captured evidence:

```text
HTTP/1.1 401 UNAUTHORIZED
X-Request-ID: f48a55b59384fe87f76f236ad6f8fad5
category: unauthenticated
error: authentication required
```

This proves ticket creation requires a logged-in Flask session.

**Customer tries admin endpoint:**

```bash
curl -i -b /tmp/rtl-customer.cookie \
  http://127.0.0.1:8080/api/admin/tickets
```

Captured evidence:

```text
HTTP/1.1 403 FORBIDDEN
X-Request-ID: c9827e82904a16c311e269cd7059b02b
category: unauthorized
error: administrator access required
```

This proves a logged-in customer is authenticated but not authorized for admin actions.

**Customer tries another customer's ticket:**

```bash
curl -i -b /tmp/rtl-customer.cookie \
  http://127.0.0.1:8080/api/tickets/3
```

Captured evidence:

```text
HTTP/1.1 403 FORBIDDEN
X-Request-ID: 4fd4085caa17e190dc0eb0e2e4e3b664
category: unauthorized
error: ticket access denied
```

This proves customers can only access tickets they own.

### Troubleshooting Questions

**Which table owns each kind of data?** `users` owns identities, `tickets` owns support issues, `ticket_messages` owns conversation history, and `ticket_events` owns audit evidence.

**Which foreign keys describe ownership and relationships?** `tickets.created_by -> users.id`, `ticket_messages.ticket_id -> tickets.id`, `ticket_messages.author_id -> users.id`, `ticket_events.ticket_id -> tickets.id`, and `ticket_events.actor_id -> users.id`.

**Which constraint prevented bad data?** Unique indexes prevented duplicate usernames and emails. Check constraints prevent invalid roles, categories, priorities, statuses, and message types.

**Which index supports listing one customer's tickets?** `idx_tickets_created_by_created_at` supports finding one customer's tickets in newest-first order.

**Why can customers only see their own tickets?** Flask loads the session user and checks `tickets.created_by`. If the user is not an admin and did not create the ticket, the app returns `403`.

**Why can admins see all tickets and internal notes?** Admin users have `role=admin`, so they can use admin endpoints and bypass the customer-only ownership filter.

**Why do ticket records belong in PostgreSQL instead of Redis?** Tickets are durable business records. They must survive app restarts, Redis loss, and cache expiration.

**Which SQL query proves the ticket exists?** `SELECT id, ticket_number, created_by, status, priority FROM tickets ORDER BY id;`

**Which logs prove the request path?** NGINX access logs prove the request entered through the proxy. Flask logs prove the application handled the request. `ticket_events.request_id` proves the database change is tied to a specific request.

### Overall Summary

This lab shows how one support-ticket action becomes durable database evidence. When a customer creates or updates a ticket, Flask authenticates the user from the session cookie, validates the request body, writes records to PostgreSQL, and records an audit event with the request ID. The `tickets` table owns the support issue, `ticket_messages` owns the conversation, and `ticket_events` owns traceable audit history. PostgreSQL is the source of truth because support history must survive restarts and cache loss. Redis can support temporary cache, sessions, or queues, but it should not be the durable store for customer support history.

### Retained Takeaway

The database is not just storage. It enforces relationships, protects ownership rules with constraints and foreign keys, speeds common lookups with indexes, and gives durable evidence that the application saved the customer's support request.

## Lab 06: Database Operations, Performance, And Resilience

### Build

The goal of this lab is to understand PostgreSQL as an operational dependency, not just a place where rows are stored.

```text
Browser or curl -> NGINX -> Flask support-ticket API -> PostgreSQL
```

Lab 06 keeps the same support-ticket request path from Lab 05, but asks database operations questions:

```text
Can Flask connect?
Did the transaction commit fully?
Which query is slow?
Which index supports the lookup?
What happens when PostgreSQL is unavailable?
How would backup, restore, failover, and recovery targets affect support-ticket data?
```

This answer section preserves the completed local evidence. It aligns to the revised Lab 06 structure by treating local commands as hands-on proof and production topics such as pooling, replica lag, failover, RPO, and RTO as operational concepts unless they were directly tested locally.

### Connection Configuration

Flask reads the database connection string from runtime configuration:

```python
DATABASE_URL = os.environ.get("DATABASE_URL", "dbname=request_tracing_lab")
```

The connection helper is:

```python
def get_db_connection():
    return psycopg.connect(DATABASE_URL, row_factory=dict_row)
```

The current app opens PostgreSQL connections with `psycopg.connect(...)` when a route needs the database. It does not currently use a real application-side connection pool, so pool exhaustion is discussed as an operational concept and inspected locally through active connection counts.

Local evidence:

```bash
psql request_tracing_lab -c "SELECT current_database(), current_user, inet_server_addr(), inet_server_port();"
```

Captured result:

```text
 current_database   | current_user  | inet_server_addr | inet_server_port
--------------------+---------------+------------------+-----------------
 request_tracing_lab | heavenlygetty |                  |
```

The blank server address and port are expected for this local Homebrew/PostgreSQL connection because `psql request_tracing_lab` used a local Unix socket instead of an explicit TCP host and port.

### Transaction Path

Creating a support ticket is a multi-table write. The app inserts:

```text
1. tickets row
2. ticket_messages row
3. ticket_events row
```

The important code path is:

```text
with get_db_connection() as conn:
    with conn.cursor() as cur:
        INSERT INTO tickets ...
        INSERT INTO ticket_messages ...
        INSERT INTO ticket_events ...
```

This matters because a support-ticket create request should not save only part of the data. The ticket, first message, and audit event should commit together or roll back together.

### Healthy Read Timing

Customer ticket lookup:

```bash
psql request_tracing_lab \
  -c "\timing on" \
  -c "SELECT id, ticket_number, created_by, status, priority
      FROM tickets
      WHERE created_by = 1
      ORDER BY created_at DESC;"
```

Captured result:

```text
 id | ticket_number | created_by | status | priority
----+---------------+------------+--------+----------
  2 | TCK-DE75C223  |          1 | open   | medium
  1 | TCK-96645C93  |          1 | open   | medium

Time: 2.678 ms
```

This proves PostgreSQL can read one customer's tickets and gives a basic latency measurement.

### EXPLAIN And Index Evidence

Customer ticket lookup plan:

```bash
psql request_tracing_lab -c "EXPLAIN
SELECT id, ticket_number, created_by, status, priority
FROM tickets
WHERE created_by = 1
ORDER BY created_at DESC;"
```

Captured result:

```text
Index Scan using idx_tickets_created_by_created_at on tickets
  Index Cond: (created_by = 1)
```

This proves PostgreSQL used the index designed for listing one customer's tickets newest first.

With `EXPLAIN ANALYZE`, PostgreSQL also ran the query and measured it:

```text
Index Scan using idx_tickets_created_by_created_at on tickets
  actual time=0.059..0.063 rows=2 loops=1
Execution Time: 0.170 ms
```

Admin triage query:

```bash
psql request_tracing_lab -c "EXPLAIN
SELECT id, ticket_number, status, priority
FROM tickets
WHERE status = 'open' AND priority = 'medium'
ORDER BY id;"
```

Captured result:

```text
Index Scan using idx_tickets_status_priority on tickets
  Index Cond: ((status = 'open') AND (priority = 'medium'))
```

This proves the `status, priority` index supports admin triage.

### Missing Index Comparison

Title search:

```bash
psql request_tracing_lab -c "EXPLAIN
SELECT id, ticket_number, title
FROM tickets
WHERE title ILIKE '%trace%';"
```

Captured result:

```text
Seq Scan on tickets
  Filter: (title ~~* '%trace%'::text)
```

This is a sequential scan because there is no matching index for this pattern. On a tiny local table this is fine. On a large production table, repeated wildcard searches can become expensive and may need a different search strategy.

### Slow Query Evidence

Safe latency demonstration:

```bash
psql request_tracing_lab -c "\timing on" -c "SELECT pg_sleep(1);"
```

Captured result:

```text
Time: 1004.019 ms (00:01.004)
```

This proves database-side waiting shows up as query latency. In a real incident, the next step would be to identify whether the time came from slow SQL, locks, connection waits, disk I/O, CPU, replication lag, or network/database availability.

### Rollback Evidence

Safe rollback test:

```sql
BEGIN;

INSERT INTO tickets (
  ticket_number,
  created_by,
  title,
  description,
  category,
  priority
)
VALUES (
  'TCK-ROLLBACK-LAB',
  1,
  'Rollback lab ticket',
  'This row should not remain after rollback.',
  'technical_question',
  'low'
);

SELECT id, ticket_number, title
FROM tickets
WHERE ticket_number = 'TCK-ROLLBACK-LAB';

ROLLBACK;

SELECT id, ticket_number, title
FROM tickets
WHERE ticket_number = 'TCK-ROLLBACK-LAB';
```

Captured result:

```text
BEGIN
INSERT 0 1
 id |  ticket_number   |        title
----+------------------+---------------------
  4 | TCK-ROLLBACK-LAB | Rollback lab ticket

ROLLBACK
 id | ticket_number | title
----+---------------+-------
(0 rows)
```

This proves rollback removes uncommitted work and prevents partial records from remaining.

### Constraint Failure Evidence

Controlled bad insert:

```sql
BEGIN;

INSERT INTO tickets (
  ticket_number,
  created_by,
  title,
  description,
  category,
  priority
)
VALUES (
  'TCK-BAD-CATEGORY-LAB',
  1,
  'Bad category lab ticket',
  'This insert should fail because category is invalid.',
  'not_a_category',
  'low'
);

COMMIT;
```

Captured result:

```text
ERROR: new row for relation "tickets" violates check constraint "tickets_category_check"
DETAIL: Failing row contains (..., not_a_category, low, open, ...).
```

This proves PostgreSQL enforces valid ticket categories even if an application bug or bad client sends invalid data.

### Bad Connection Evidence

Wrong PostgreSQL port:

```bash
DATABASE_URL='host=127.0.0.1 port=5999 dbname=request_tracing_lab' \
venv/bin/python - <<'PY'
import os
import psycopg

try:
    psycopg.connect(os.environ["DATABASE_URL"])
except Exception as exc:
    print(type(exc).__name__)
    print(str(exc).split("\n")[0])
PY
```

Captured result:

```text
OperationalError
connection failed: connection to server at "127.0.0.1", port 5999 failed: Connection refused
```

This proves the failure happened before querying or committing. Flask would not reach the SQL statements if it could not connect to PostgreSQL.

### Connection Count Evidence

Connection activity check:

```bash
psql request_tracing_lab -c "SELECT count(*) AS active_connections
FROM pg_stat_activity
WHERE datname = 'request_tracing_lab';"
```

Captured result:

```text
 active_connections
--------------------
                  2
```

This is a small local count. In production, a high count may point to too many clients, missing connection pooling, slow queries holding connections open, or connection pool exhaustion.

### Backup And Recovery Evidence

Backup tool availability:

```bash
pg_dump --version
```

Captured result:

```text
pg_dump (PostgreSQL) 18.4 (Homebrew)
```

Schema-only backup command:

```bash
pg_dump --schema-only request_tracing_lab \
  -f /private/tmp/request_tracing_lab_schema_lab06.sql
```

Captured file evidence:

```text
/private/tmp/request_tracing_lab_schema_lab06.sql
size: 15051 bytes
```

The first lines of the dump showed:

```text
-- PostgreSQL database dump
-- Dumped from database version 18.4 (Homebrew)
-- Dumped by pg_dump version 18.4 (Homebrew)
```

For this lab, the backup approach is:

```text
Local: pg_dump for logical backups.
Production: managed PostgreSQL backups, point-in-time recovery if available, restore testing, and documented retention.
```

### RPO And RTO

**RPO:** how much data loss is acceptable.

For support tickets, a reasonable target is low data loss because tickets are customer records. A production system should aim for point-in-time recovery or frequent backups so newly submitted tickets are not lost.

**RTO:** how long recovery can take.

For this project, a reasonable learning target is to define how quickly the service should recover enough for users to create and view tickets again.

### Failover Explanation

Failover means the app stops using one database instance and starts using another healthy one.

In production, a managed database may fail over to a standby. During failover:

```text
active connections may drop
in-flight requests may fail
the app may need to reconnect
DNS or the managed endpoint may point to a new primary
read replicas may lag behind the primary
```

Failover can improve availability, but it does not remove the need for database reconnect handling, safe error handling, and restore testing.

### Private Subnet And Security

In a cloud design, PostgreSQL should not be publicly exposed. The app should reach it over private networking.

Important controls:

```text
private subnet or private database endpoint
security group or firewall rules allowing only app-to-database traffic
credentials stored as secrets, not in source code
TLS where required
least-privilege database user
backups encrypted and access-controlled
```

This local lab does not build a VPC, but the design expectation is that the database is private and only reachable by trusted application components.

### Database Latency Causes

If hardware looks healthy but database latency is still correlated with request latency, likely causes include:

```text
slow queries
missing indexes
queries that scan too many rows
join-heavy queries as data grows
lock contention
long transactions
too many active connections
connection pool exhaustion
replication lag on read replicas
bad query patterns introduced by a migration
large sorts or temporary files
vacuum/analyze/statistics issues
```

The first evidence to collect:

```text
query timing
EXPLAIN or EXPLAIN ANALYZE
active connection count
locks or long-running transactions
recent schema/index changes
application logs with request_id
database logs or slow query logs
```

### Troubleshooting Questions

**Did the request fail before connecting, while querying, or while committing?** The bad port failed before connecting. A constraint error failed while executing the insert. A rollback test proved uncommitted data can be removed before commit.

**Did the app save all related ticket rows or none of them?** The ticket-create path should save the ticket, first message, and ticket event together. If the transaction fails before commit, the related rows should not remain partially saved.

**Could retrying after a database failure create duplicate data?** Yes, if the original transaction committed but the client or app did not receive the response. Unique ticket numbers reduce one class of duplicates, but duplicate-prevention design belongs to the later API-focused lab.

**Which query is slow?** The lab used `pg_sleep(1)` as a controlled slow database operation. In production, identify the actual SQL with timing, slow query logs, and request IDs.

**Which index should support this lookup?** `idx_tickets_created_by_created_at` supports listing one customer's tickets newest first. `idx_tickets_status_priority` supports admin triage by status and priority.

**Would a replica help reads, writes, or neither?** A read replica can help read-heavy workloads if the app can tolerate replication lag. It does not help writes because writes go to the primary database.

**What happens to active connections during failover?** Existing connections may drop. The app must reconnect and safely handle failed in-flight requests.

### Overall Summary

PostgreSQL is the durable source of truth for the support-ticket system. Flask connects through `DATABASE_URL`, writes related ticket records in transactions, and returns safe errors when database access fails. Indexes help common reads, `EXPLAIN` shows how PostgreSQL plans a query, and rollback prevents partial writes from becoming durable. For production design, the database should be private, observable, backed up, restorable, and protected by a clear RPO/RTO and failover plan.

### Retained Takeaway

Database operations are about protecting customer records and proving what happened when reads, writes, credentials, latency, transactions, or recovery fail.

## Lab 07: API Design And Authentication

### Build

This lab documents the support-ticket API boundary used by the Flask app.

```text
Browser or curl
  -> NGINX
  -> Flask REST API
  -> session authentication
  -> authorization / ownership check
  -> PostgreSQL
```

The implemented API uses session cookies for the support-ticket workflow. A successful register or login stores user identity in the Flask session, and later ticket routes use that session to decide who the user is.

### API Resources

| Resource | Method | Route | Purpose | Auth Needed |
| --- | --- | --- | --- | --- |
| Auth | `POST` | `/api/auth/register` | Create user and log in | No |
| Auth | `POST` | `/api/auth/login` | Log in existing user | No |
| Auth | `POST` | `/api/auth/logout` | Clear session | No, but uses current session if present |
| Auth | `GET` | `/api/auth/me` | Show current logged-in user | Yes |
| Tickets | `POST` | `/api/tickets` | Create a support ticket | Yes |
| Tickets | `GET` | `/api/tickets` | List current customer's tickets | Yes |
| Tickets | `GET` | `/api/tickets/<ticket_id>` | Read one allowed ticket and its messages | Yes |
| Messages | `POST` | `/api/tickets/<ticket_id>/messages` | Add customer reply or support reply | Yes |
| Admin tickets | `GET` | `/api/admin/tickets` | Admin can list all tickets | Admin |
| Admin tickets | `PATCH` | `/api/admin/tickets/<ticket_id>` | Admin can update status, priority, or assignment | Admin |
| Admin messages | `POST` | `/api/admin/tickets/<ticket_id>/messages` | Admin support reply | Admin |
| Admin notes | `POST` | `/api/admin/tickets/<ticket_id>/internal-notes` | Admin-only internal note | Admin |

### Authentication And Authorization

Authentication answers:

```text
Who is this user?
```

Authorization answers:

```text
Is this user allowed to access this ticket or route?
```

In this app:

```text
Session cookie proves login state.
Customer routes require a logged-in user.
Customer ticket reads are limited to tickets created by that user.
Admin routes require role = admin.
Internal notes are visible to admins, not regular customers.
```

The important lesson is that login alone is not enough. A logged-in customer still should not read another customer's ticket or call admin routes.

### Healthy-Path Evidence

Register request:

```bash
curl -i -c /tmp/rtl-customer.cookie \
  -H "Content-Type: application/json" \
  -d '{"username":"customer1","email":"customer1@example.com","password":"customerpass"}' \
  http://127.0.0.1:8080/api/auth/register
```

Expected evidence:

```text
HTTP 201
Set-Cookie: session=...
JSON response includes user id, username, email, role, and request_id
PostgreSQL users row exists
```

Create ticket request:

```bash
curl -i -b /tmp/rtl-customer.cookie \
  -H "Content-Type: application/json" \
  -d '{"title":"Login issue","description":"Customer cannot log in","category":"access","priority":"medium"}' \
  http://127.0.0.1:8080/api/tickets
```

Expected evidence:

```text
HTTP 201
Response includes ticket and request_id
PostgreSQL tickets row exists
PostgreSQL ticket_messages row exists
PostgreSQL ticket_events row exists with request_id evidence
```

Admin route evidence:

```bash
curl -i -b /tmp/rtl-admin.cookie \
  http://127.0.0.1:8080/api/admin/tickets
```

Expected evidence:

```text
Admin session -> HTTP 200
Customer session -> HTTP 403
No session -> HTTP 401
```

### Controlled Failures

| Failure | Expected Result | What It Proves |
| --- | --- | --- |
| Missing JSON body | `400 invalid_input` | API validates required body fields before writing |
| Wrong password | `401 invalid_credentials` | Authentication failed |
| No session on protected route | `401 unauthenticated` | Login is required |
| Customer calls admin route | `403 unauthorized` | Authorization is separate from authentication |
| Customer reads another customer's ticket | `403 unauthorized` or `404 missing_ticket` depending path | Ownership is enforced |
| Duplicate account registration | `409 duplicate_account` | Unique database rules protect identity |
| Bad category or priority | `400 invalid_input` | API validates allowed values |

### Pagination, Filtering, Sorting, And Versioning

The current ticket list returns all rows for the user ordered by newest first:

```sql
SELECT *
FROM tickets
WHERE created_by = %s
ORDER BY created_at DESC;
```

For production, the API should eventually add:

```text
pagination: limit and cursor/page
filtering: status, priority, category
sorting: created_at, updated_at, priority
versioning: /api/v1/... when the contract needs long-term compatibility
```

This is not urgent for the local lab, but it is useful for support and DevOps because large unpaginated reads can become a latency problem.

### Idempotency Concept

Ticket creation needs an idempotency rule because a client timeout followed by a retry could create a second valid ticket.

The idempotency answer for this lab is:

```text
Idempotency-Key: unique-client-generated-key
```

The server stores the key with the original result and returns the same result for safe retries.

### Overall Summary

The support-ticket API uses clear resource routes, session authentication, role-based admin checks, ownership checks, request IDs, and status codes that make support triage easier.

### Retained Takeaway

A clear API makes support easier because each request has an expected method, request body, status code, owner, and evidence trail.

## Lab 08: Webhooks And Asynchronous Delivery

### Build

This lab uses the durable ticket event as the source for outbound webhook delivery.

Webhook mental model:

```text
API request:
Client asks the app for something.

Webhook:
The app tells another system that something happened.
```

The event used for this lab is:

```text
ticket.created
```

because the app already records `ticket_created` in `ticket_events`.

### Event Payload

```json
{
  "event_id": "evt_20260803_001",
  "event_type": "ticket.created",
  "created_at": "2026-08-03T12:00:00Z",
  "request_id": "request-id-from-flask",
  "ticket": {
    "id": 1,
    "ticket_number": "TCK-20260803-ABC123",
    "title": "Login issue",
    "priority": "medium",
    "status": "open"
  }
}
```

Important fields:

```text
event_id: lets receiver detect duplicates
event_type: tells receiver what happened
created_at: supports replay protection and timeline
request_id: connects webhook delivery to the original customer request
ticket id/number: identifies the business object
```

### Signature Concept

A webhook should include a signature header so the receiver can verify the event came from this app.

```text
X-Webhook-Signature: hmac-sha256(payload, shared_secret)
X-Webhook-Timestamp: event timestamp
```

The receiver should reject:

```text
missing signature
wrong signature
old timestamp
duplicate event_id already processed
```

### Delivery Rule

The ticket should be saved before webhook delivery matters.

Correct order:

```text
1. Customer creates ticket.
2. Flask writes ticket, first message, and ticket event to PostgreSQL.
3. Transaction commits.
4. Webhook delivery is attempted or queued.
5. Customer should not lose the ticket because the webhook receiver is down.
```

### Healthy-Path Evidence

Capture:

```text
Ticket action: POST /api/tickets
Event type: ticket.created
Event ID: unique event id
Payload: JSON body
Signature header: X-Webhook-Signature
Receiver log: request received
Receiver response: 2xx
Delivery status: delivered
Request ID: same request_id as ticket event or linked event id
```

### Controlled Failures

| Failure | Expected Behavior | Operational Meaning |
| --- | --- | --- |
| Receiver returns 500 | Delivery fails and should be retried later | External system failed |
| Receiver times out | Delivery attempt records timeout | Network or receiver latency |
| Wrong shared secret | Receiver rejects request | Security protection worked |
| Duplicate delivery | Receiver ignores already-seen `event_id` | At-least-once delivery is safe |
| Old timestamp replay | Receiver rejects old event | Replay protection worked |
| Network refused | Delivery fails but ticket remains saved | Webhook is not source of truth |

### Troubleshooting Questions

**Was the ticket saved before webhook delivery failed?** It should be. PostgreSQL owns the ticket, and webhook delivery should not erase the committed ticket.

**Did the receiver receive the request?** Check receiver logs, HTTP status, timestamp, and event ID.

**Was the signature valid?** Compare the signature header against the payload and shared secret.

**Was this a new event or duplicate delivery?** Check `event_id`.

**Should the customer request fail because the webhook failed?** Usually no. The customer action should commit durable ticket data first. Webhook failure should create delivery evidence and retry work.

**Where is failed delivery recorded?** Store it in a delivery table, failed-event table, queue, or logs with event ID and request ID.

### Overall Summary

Webhooks are outbound event delivery. They are useful for notifying other systems, but they introduce signatures, retries, duplicates, replay protection, and delivery evidence.

### Retained Takeaway

An API is client-to-app. A webhook is app-to-system after something happens. Webhook failure should be visible, retryable, and separate from the durable ticket write.

## Lab 09: Workers And Queues

### Build

This lab moves slow follow-up work out of the customer ticket request by using a queue and worker path.

Queue mental model:

```text
Producer:
Flask code that puts work onto a queue.

Queue:
Temporary place where jobs wait.

Worker:
Separate process that reads jobs and performs the work.
```

The workflow used for this lab is:

```text
After ticket creation, enqueue a notification or diagnostic-summary job.
```

### Request Path With Queue

```text
Client submits ticket
  -> Flask validates request
  -> Flask writes ticket/message/event to PostgreSQL
  -> PostgreSQL transaction commits
  -> Flask enqueues background job
  -> Flask returns 201 to customer
  -> Worker processes job later
```

The customer should not wait for the worker to finish.

### Job Payload

```json
{
  "job_id": "job_20260803_001",
  "job_type": "ticket.notification",
  "ticket_id": 1,
  "ticket_number": "TCK-20260803-ABC123",
  "request_id": "request-id-from-flask",
  "attempt": 1
}
```

Important fields:

```text
job_id: identifies the background work
job_type: tells worker what to do
ticket_id: lets worker load durable data from PostgreSQL
request_id: links job back to the customer request
attempt: supports retry tracking
```

### Healthy-Path Evidence

Capture:

```text
Ticket created: HTTP 201 and PostgreSQL ticket row
Job enqueued: queue contains job payload
Worker started: worker process log
Job completed: worker log or job status
Queue depth before: number of waiting jobs before worker
Queue depth after: number of waiting jobs after worker
Processing duration: worker start-to-finish time
Request ID or event ID: links async work to original request
```

### Controlled Failures

| Failure | Expected Behavior | What It Proves |
| --- | --- | --- |
| Worker stopped | Ticket still saves, queue depth grows | Async path is separate from customer request |
| Queue backlog | Jobs wait longer before processing | Need queue depth and worker capacity metrics |
| Job failure | Job records failure and retry attempt | Worker failure is visible |
| Retry | Same job may run again | Side effects must be duplicate-safe |
| Failed job | Job moves to failed/dead-letter state after limit | Operators have evidence to inspect |
| Poison message | Same bad job fails repeatedly | Need retry limit and dead-letter behavior |

### Troubleshooting Questions

**Was the ticket saved even if the worker failed?** It should be. PostgreSQL ticket data should commit before async work.

**Is the queue growing?** Check queue depth and age of oldest job.

**Are workers processing jobs?** Check worker logs, job completion count, error count, and processing duration.

**Which job failed?** Use `job_id`, `job_type`, ticket ID, and request ID.

**Can the same job produce duplicate side effects?** Yes, because async systems often use at-least-once delivery. The worker must avoid duplicate email or duplicate notification by checking job ID, event ID, or a sent-record table.

### Queue Metrics

```text
queue depth
oldest job age
job processing duration
worker count
success count
failure count
retry count
dead-letter count
```

### Overall Summary

Queues move slow follow-up work out of the customer request. They improve responsiveness, but they add a second operational path with its own backlog, retries, failed jobs, and duplicate-processing risk.

### Retained Takeaway

Async means the customer request can finish before all work is complete. It is useful only if the async path has evidence: queue depth, worker logs, retries, and failed-job visibility.

## Lab 10: WebSockets And Real-Time Updates

### Build

This lab adds a real-time update path for ticket activity so the browser can receive updates without manual refresh.

WebSocket mental model:

```text
HTTP:
Client asks, server responds, connection can close.

WebSocket:
Client opens a persistent connection, then the server can push updates.
```

The real-time event used for this lab is:

```text
ticket.message_added
```

because customers and admins care when a new support reply appears.

### Real-Time Request Path

```text
Browser opens ticket page
  -> Browser authenticates with session cookie
  -> Browser opens WebSocket connection
  -> Server verifies user can access ticket
  -> Browser joins ticket room/channel
  -> Admin adds support reply
  -> Flask saves message to PostgreSQL
  -> Server emits ticket.message_added to that ticket room
  -> Browser receives update without manual refresh
```

### Polling, SSE, WebSockets, And Webhooks

| Pattern | Best For | Tradeoff |
| --- | --- | --- |
| Polling | Simple periodic checks | Extra requests and delay |
| Server-sent events | One-way server-to-browser updates | Simpler than WebSockets, less flexible |
| WebSockets | Interactive live browser updates | Persistent connections and scaling concerns |
| Webhooks | Server-to-server event delivery | Not for browser live UI updates |

### Healthy-Path Evidence

Capture:

```text
Connection opened: browser WebSocket connected
Authenticated user: session user is known
Authorized ticket: user can access ticket room
Update event: ticket.message_added or ticket.status_changed
Client received update: browser log/UI changed
Server log: emit recorded
Request ID or event ID: links update to saved ticket event
```

### Controlled Failures

| Failure | Expected Behavior | What It Proves |
| --- | --- | --- |
| Unauthenticated connection | Connection rejected | Login required |
| Unauthorized ticket room | Connection or room join rejected | Ownership still matters |
| Client disconnect | Server notices disconnect or stops sending | Connection state is operational evidence |
| Server restart | Client loses connection and must reconnect | Real-time path needs reconnect behavior |
| Proxy timeout | Connection closes unexpectedly | NGINX/load balancer timeouts matter |
| Multiple clients on different tickets | Only authorized room receives update | Room/channel isolation works |

### Scaling Note

One Flask process can emit to clients connected to that same process.

At multiple replicas:

```text
Client A may be connected to replica 1.
Admin update may hit replica 2.
Replica 2 must publish the update through shared pub/sub.
Replica 1 must receive it and emit to Client A.
```

That is why production WebSockets often need Redis pub/sub, a message broker, sticky sessions, or a managed real-time service.

### Troubleshooting Questions

**Is the user connected?** Check active WebSocket connections and server connection logs.

**Is the user authorized for this ticket?** Check session identity and ticket ownership before joining the room.

**Did the server emit an update?** Check server log or event ID.

**Did the proxy close the connection?** Check NGINX/load balancer timeout and close logs.

**Would another app replica know about this update?** Only if shared pub/sub or sticky routing is designed.

**Should this feature use polling, SSE, or WebSockets?** Use WebSockets only when live bidirectional updates justify connection-state complexity. For simple updates, polling or SSE may be enough.

### Overall Summary

WebSockets are for live browser updates, not server-to-server notifications. They require authentication, authorization, persistent connection handling, reconnect behavior, proxy timeout awareness, and a scaling plan across replicas.

### Retained Takeaway

Real-time means live client updates. It adds connection state, room authorization, disconnect/reconnect behavior, proxy timeouts, and replica coordination that normal HTTP requests do not have.

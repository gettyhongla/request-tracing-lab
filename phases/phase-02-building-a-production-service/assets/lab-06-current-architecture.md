# Phase 2 Labs 01-06 Request Path

This diagram shows the current synchronous request path through Labs 01-06.

The request starts when a browser or `curl` sends an HTTP request to NGINX. The request stops when NGINX returns the HTTP response to the client. Lab 06 does not add a new runtime component; it adds the database-operations questions used to troubleshoot the PostgreSQL part of the same request.

```mermaid
flowchart LR
    Start(("Start<br/>Browser or curl"))
    NGINX["NGINX reverse proxy<br/>Port 8080<br/>Adds/forwards X-Request-ID"]
    Flask["Flask support-ticket API<br/>Request tracing middleware<br/>Session auth + authorization"]
    Routes{"Which endpoint?"}

    Notes["GET /notes<br/>Read cached notes"]
    Tickets["Support-ticket action<br/>register, login, create ticket,<br/>reply, admin note, list ticket"]
    Errors["Safe app response<br/>401, 403, 409, 503<br/>with request_id"]

    Redis{"Redis cache<br/>notes:latest"}
    Postgres["PostgreSQL<br/>durable source of truth"]

    Tables["Tables<br/>users<br/>tickets<br/>ticket_messages<br/>ticket_events<br/>request_notes"]
    Events["ticket_events.request_id<br/>audit evidence"]

    DbQuestions["Lab 06 database checks<br/>DATABASE_URL<br/>transaction commit/rollback<br/>query timing<br/>EXPLAIN + indexes<br/>backup/RPO/RTO<br/>failover concepts"]

    Response(("Stop<br/>HTTP response<br/>status + body + X-Request-ID"))

    Start -->|"HTTP request"| NGINX
    NGINX -->|"proxy_pass"| Flask
    Flask --> Routes

    Routes -->|"notes read"| Notes
    Routes -->|"support-ticket workflow"| Tickets
    Routes -->|"auth/validation/database failure"| Errors

    Notes -->|"synchronous cache lookup"| Redis
    Redis -->|"cache hit"| Notes
    Redis -->|"cache miss or unavailable"| Postgres
    Notes -->|"read/write request_notes"| Postgres

    Tickets -->|"synchronous SQL transaction"| Postgres
    Postgres --> Tables
    Tables --> Events

    Postgres -.->|"inspected by Lab 06"| DbQuestions

    Notes -->|"JSON result"| Flask
    Tickets -->|"JSON result"| Flask
    Errors --> Flask
    Flask -->|"HTTP response"| NGINX
    NGINX --> Response
```

## How To Read It

Follow the solid arrows for one synchronous request.

```text
Start:
Browser or curl sends an HTTP request.

Main path:
Client -> NGINX -> Flask -> Redis and/or PostgreSQL -> Flask -> NGINX

Stop:
The client receives an HTTP response with status, body, and X-Request-ID.
```

The request is synchronous because the client waits for Flask to finish the work before receiving the response.

## What Is Synchronous Here

These actions are in the current request/response path:

```text
NGINX routing the request to Flask
Flask assigning or forwarding X-Request-ID
Flask checking the session cookie
Flask enforcing customer/admin authorization
Flask reading Redis for /notes cache
Flask falling back to PostgreSQL when Redis misses or fails
Flask writing users, tickets, messages, and ticket_events to PostgreSQL
Flask returning JSON to the client
```

If PostgreSQL is slow during ticket creation, the client waits. That is why Lab 06 focuses on database latency, transactions, indexes, rollback, and failure evidence.

## What Lab 06 Adds

Lab 06 is not a new service. It is the operational lens on PostgreSQL:

```text
Can Flask connect to PostgreSQL?
Did a multi-table write commit fully?
Could a rollback prevent partial records?
Which query is slow?
Which index should support the lookup?
What does EXPLAIN show?
What happens when PostgreSQL is unavailable?
What backup, RPO, RTO, and failover expectations protect ticket data?
```

## What Is Not In This Request Yet

These are not part of the current Lab 06 request path:

```text
Async worker:
Work accepted now and processed later by a separate worker.

Queue:
Temporary job backlog for async work.

Webhook:
Server-to-server notification sent after an event.

Real-time update:
Browser receives live progress through WebSocket, SSE, or polling.

Kubernetes:
Container orchestration and production deployment platform.
```

Short version:

```text
Synchronous = user waits for the response.
Asynchronous = work can continue after the response.
Real-time = user receives live or near-live updates.
```

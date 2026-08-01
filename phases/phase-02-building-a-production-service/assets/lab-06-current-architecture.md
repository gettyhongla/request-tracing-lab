# Phase 2 Labs 01-06 Architecture

This diagram shows the current Phase 2 system after Labs 01-05 and the database-operations lens introduced in Lab 06.

```mermaid
flowchart TB
    Client["Browser or curl<br/>Customer/Admin user"]

    subgraph Proxy["Lab 02: Proxy Layer"]
        NGINX["NGINX reverse proxy<br/>Port 8080<br/>Access/error logs<br/>X-Request-ID"]
    end

    subgraph App["Flask Support-Ticket API"]
        RequestMiddleware["Request tracing middleware<br/>request_started/request_finished<br/>X-Request-ID"]
        Auth["Session auth + authorization<br/>customer vs admin"]
        Notes["/notes API<br/>Lab 03 persistence<br/>Lab 04 cache behavior"]
        Tickets["Support-ticket routes<br/>register/login<br/>create/list/reply/admin note"]
        ErrorHandling["Safe error responses<br/>401/403/409/503<br/>request_id in response"]
    end

    subgraph RedisLayer["Lab 04: Redis Temporary State"]
        Redis["Redis<br/>notes:latest cache<br/>TTL/expiry<br/>fallback when unavailable"]
    end

    subgraph PostgresLayer["Labs 03, 05, 06: PostgreSQL Durable State"]
        Pg["PostgreSQL<br/>DATABASE_URL runtime config"]
        NotesTable["request_notes<br/>Lab 03"]
        UsersTable["users<br/>identity + role"]
        TicketsTable["tickets<br/>support issue"]
        MessagesTable["ticket_messages<br/>customer replies + internal notes"]
        EventsTable["ticket_events<br/>audit trail + request_id"]
        DbOps["Lab 06 operations lens<br/>transactions<br/>query timing<br/>EXPLAIN + indexes<br/>rollback<br/>backup/RPO/RTO<br/>HA/failover concepts"]
    end

    subgraph Evidence["Evidence To Correlate"]
        ClientEvidence["Client response<br/>status, body, X-Request-ID"]
        ProxyLogs["NGINX logs<br/>request reached proxy"]
        AppLogs["Flask logs<br/>request path + errors"]
        SqlEvidence["SQL evidence<br/>rows, constraints, events"]
    end

    Client -->|"HTTP request"| NGINX
    NGINX -->|"proxy_pass to Flask"| RequestMiddleware
    RequestMiddleware --> Auth
    Auth --> Notes
    Auth --> Tickets
    Notes -->|"GET cache lookup"| Redis
    Redis -->|"hit"| Notes
    Redis -.->|"miss/unavailable fallback"| Pg
    Notes -->|"read/write durable notes"| NotesTable
    Tickets -->|"multi-table write transaction"| Pg
    Pg --> UsersTable
    Pg --> TicketsTable
    Pg --> MessagesTable
    Pg --> EventsTable
    Pg --> DbOps
    Tickets --> ErrorHandling
    Notes --> ErrorHandling
    ErrorHandling --> NGINX
    NGINX -->|"HTTP response"| Client

    Client --> ClientEvidence
    NGINX --> ProxyLogs
    RequestMiddleware --> AppLogs
    EventsTable --> SqlEvidence
    DbOps --> SqlEvidence

    classDef implemented fill:#e8f5e9,stroke:#2e7d32,color:#123524;
    classDef lab6 fill:#fff8e1,stroke:#f9a825,color:#3a2a00;
    classDef evidence fill:#e3f2fd,stroke:#1565c0,color:#0d2f52;
    classDef deferred fill:#f5f5f5,stroke:#9e9e9e,color:#424242;

    class Client,NGINX,RequestMiddleware,Auth,Notes,Tickets,Redis,Pg,NotesTable,UsersTable,TicketsTable,MessagesTable,EventsTable,ErrorHandling implemented;
    class DbOps lab6;
    class ClientEvidence,ProxyLogs,AppLogs,SqlEvidence evidence;
```

## How To Read It

Green areas are already implemented or exercised in Labs 01-05.

Yellow is the Lab 06 focus: not a new app feature, but the database operations lens for the same support-ticket request path.

Blue is the evidence layer. The goal is to connect a client symptom to proxy logs, Flask logs, SQL rows, and `ticket_events.request_id`.

## What Lab 06 Adds

Lab 06 does not replace the architecture from Labs 01-05. It asks better database questions about it:

```text
Can Flask connect to PostgreSQL?
Did a multi-table ticket write commit fully?
Can a rollback prevent partial records?
Which query is slow?
Which index supports the lookup?
What does EXPLAIN show?
What happens when PostgreSQL is unavailable?
What backup, RPO, RTO, and failover expectations protect ticket data?
```

## Not Yet In Scope

The following concepts are intentionally not shown as implemented runtime components yet:

```text
Background workers
Redis queue processing
Webhook delivery
WebSockets/SSE
Kubernetes deployment
Managed cloud database HA
```

Those belong to later Phase 2 labs or Phase 3 operations work.

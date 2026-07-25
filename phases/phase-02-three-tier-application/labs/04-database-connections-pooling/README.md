# 04: Database Connections And Pooling

Goal:

```text
Diagnose database connectivity, credential, timeout, and connection-pool failures.
```

Evidence Tasks:

* Identify database host, port, database name, user, and secret source.
* Explain what happens when credentials are wrong.
* Explain what happens when the database is unreachable.
* Explain what happens when the pool is exhausted.
* Decide what the client should see during each failure.

Evidence to collect:

```text
Flask request log:
Flask DB error:
Connection pool metrics:
PostgreSQL connection count:
PostgreSQL authentication or network error:
Client status:
```

Completion standard:

```text
You can distinguish network failure, authentication failure, database unavailable, and pool exhaustion.
```

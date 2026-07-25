# 01: Healthy Three-Tier Request

Goal:

```text
Trace a successful request through browser, NGINX, Flask, and PostgreSQL.
```

Evidence Tasks:

* Draw the request path.
* Mark where TLS terminates.
* Mark where request IDs are created or forwarded.
* Identify which logs should contain the request.
* Identify which PostgreSQL row proves the user or record exists.

Completion standard:

```text
You can prove the request reached every layer and returned successfully.
```

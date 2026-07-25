# 02: Proxy To App Routing

Goal:

```text
Separate NGINX/proxy failures from Flask application failures.
```

Evidence Tasks:

* Trigger or reason through a wrong upstream host or port.
* Compare NGINX access logs, NGINX error logs, and Flask logs.
* Explain `502`, `503`, and `504`.
* Prove whether Flask received the request.

Completion standard:

```text
You can explain whether the failure happened before Flask, inside Flask, or after Flask reached a dependency.
```

# 01: Runtime Configuration

Goal:

```text
Prove the app can run with production-style configuration before it is packaged or deployed.
```

Evidence Tasks:

* Run the Flask app with `FLASK_RUN_HOST=0.0.0.0`.
* Set the port from `FLASK_RUN_PORT`.
* Provide `FLASK_SECRET_KEY` and `JWT_SECRET` through environment variables.
* Confirm `/health` works on the configured port.
* Confirm request IDs still appear in responses and logs.

Production question:

```text
Which behavior belongs in code, and which behavior belongs in runtime configuration?
```

Completion standard:

```text
You can explain why a containerized app must not depend on laptop-only defaults.
```

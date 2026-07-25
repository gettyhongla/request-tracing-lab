# 08: Troubleshooting And Readiness

Goal:

```text
Diagnose failed deployments and decide whether the service is production-ready.
```

Troubleshooting order:

```text
Client symptom
Ingress
Service
Endpoints
Deployment
ReplicaSet
Pod
Container
Application logs
Dependency evidence
```

Failure scenarios:

* Bad image tag
* Missing or wrong secret
* Failed readiness probe
* Service selector mismatch
* Wrong target port
* Resource pressure
* Application exception after a successful deployment
* One replica running the wrong version

Production-readiness checklist:

* Health and readiness checks exist.
* Secrets are not baked into images.
* Logs go to stdout/stderr.
* Request IDs appear in logs.
* Resource requests and limits exist.
* Rollback path is known.
* Common failure runbook exists.
* Customer impact can be explained clearly.

Completion standard:

```text
You can distinguish platform failure from application failure and describe the safest mitigation.
```

# 05: Kubernetes Deployment

Goal:

```text
Deploy the same containerized Flask app with Kubernetes manifests.
```

Use:

```text
labs/05-kubernetes-deployment/manifests/
```

Evidence Tasks:

* Create a namespace.
* Inject secrets at runtime.
* Run multiple replicas with a Deployment.
* Route traffic through a Service and Ingress.
* Use readiness and liveness probes.
* Define basic resource requests and limits.
* Inspect which pod handled a request.

Completion standard:

```text
You can trace a request from client to Ingress to Service to Endpoint to Pod to Flask logs.
```

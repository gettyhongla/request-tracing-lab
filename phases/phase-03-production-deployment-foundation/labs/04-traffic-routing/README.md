# 04: Traffic Routing

Goal:

```text
Explain how customer traffic reaches the running Flask process.
```

Request path:

```text
Client
  |
  v
DNS
  |
  v
Load balancer or ingress controller
  |
  v
Ingress rule
  |
  v
Service
  |
  v
EndpointSlice / Endpoints
  |
  v
Pod IP
  |
  v
Container port
  |
  v
Flask process
```

Practice:

* Identify where TLS terminates.
* Identify which layer creates or forwards the request ID.
* Identify where `502`, `503`, and `504` can be generated.
* Prove which pod and version handled a request.
* Prove the last successful routing layer before a failure.

Completion standard:

```text
You can trace traffic from the edge to the container and explain exactly where it stopped.
```

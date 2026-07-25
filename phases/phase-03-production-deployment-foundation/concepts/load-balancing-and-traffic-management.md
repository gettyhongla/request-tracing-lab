# Load Balancing And Traffic Management

Use this concept guide when tracing traffic into a deployed service.

## Core Idea

Load balancing decides which healthy target receives a request.

It is responsible for:

```text
Accepting client traffic
Terminating or passing through TLS
Checking target health
Routing to healthy targets
Removing unhealthy targets
Distributing load
Preserving or avoiding session affinity
Retrying only when safe
Producing logs and metrics that prove routing behavior
```

## Request Path

```text
Client
  |
  v
DNS
  |
  v
Load balancer
  |
  v
Target group / backend pool
  |
  v
Service or container platform
  |
  v
App instance
```

## What To Prove

For a healthy request:

```text
Which load balancer received the request?
Which target group or backend pool was selected?
Which app instance handled it?
Was the target healthy before the request?
How long did the load balancer wait for the target?
What status code did the target return?
Did the load balancer generate the response or only forward it?
```

For a failed request:

```text
Did DNS resolve?
Did the load balancer receive the request?
Were there healthy targets?
Did the selected target accept the connection?
Did the target return an error?
Did the load balancer time out?
Was the request retried?
Could retrying duplicate a write?
```

## Common Failure Patterns

| Failure | Symptom | Evidence |
| --- | --- | --- |
| No healthy targets | `503` from load balancer | Target health status, failed health checks |
| Wrong target port | `502` or connection failure | Load balancer target error, app has no request log |
| Slow target | High latency or `504` | Target response time, timeout logs |
| Bad health check path | Healthy app marked unhealthy | Health check logs, path/status mismatch |
| Stateful app without shared session storage | Login appears inconsistent | Requests hit different targets with different local state |
| Unsafe retry | Duplicate write or repeated action | Request logs show repeated method/body/request ID |

## AWS Mapping

```text
CloudFront:
Use for global edge caching, static assets, and lower-latency public reads.

Route 53:
Use for DNS, failover, latency routing, weighted routing, and health-check-based routing.

Application Load Balancer:
Use for HTTP/HTTPS apps, TLS termination, host/path routing, target groups, and health checks.

Network Load Balancer:
Use for Layer 4 traffic, static IP requirements, or very high-throughput TCP/UDP workloads.

API Gateway:
Use when API management, auth integration, throttling, request validation, and usage plans matter.
```

## Production Takeaway

```text
I would not only ask whether there is a load balancer. I would ask how health checks work, how targets are registered, where TLS terminates, whether the app is stateless, whether retries are safe, and what logs or metrics prove which target handled a customer request.
```

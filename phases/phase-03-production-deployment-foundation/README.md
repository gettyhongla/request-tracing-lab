# Phase 3: Production Deployment Foundation

Phase 3 turns the app into something that can be deployed and operated in a production-like environment.

The focus is not Kubernetes trivia. The focus is the deployment skillset: package the app, configure it safely, expose it through the platform, verify that it is healthy, and recover when a release fails.

Focus:

* Repeatable builds
* Container image integrity
* Container hardening
* Runtime configuration
* Environment variables and secrets
* Health, readiness, and startup checks
* Traffic flow into containers
* Load balancing and traffic distribution
* Test gates before release
* Smoke testing and load testing
* Release versioning
* Deployment verification
* Rollback and roll-forward decisions
* Services, Deployments, ReplicaSets, and Pods
* `CrashLoopBackOff`, `ImagePullBackOff`, and `OOMKilled`
* Cluster DNS and dependency connectivity
* Identifying which pod and version handled a request

## Phase 3 Contents

```text
README.md
labs/
concepts/kubernetes-operator-concepts.md
concepts/load-balancing-and-traffic-management.md
```

The Kubernetes deployment assets live in:

```text
labs/05-kubernetes-deployment/manifests/
```

That directory contains the working Kubernetes deployment artifacts for this Flask app:

```text
namespace.yaml
secret.example.yaml
deployment.yaml
service.yaml
ingress.yaml
hpa.yaml
networkpolicy.yaml
```

Getty's completed Phase 3 answers live in:

```text
AnswersByGetty/phase-03-production-deployment-foundation/
```

## How To Use This Phase

Work through the deployment path in this order:

1. Confirm the Flask app runs with container-style environment variables.
2. Build and run the container image locally.
3. Review container security and promotion blockers.
4. Trace traffic from the edge to the container.
5. Deploy the same image with Kubernetes manifests.
6. Document release-management and rollback decisions.
7. Define tests and load-test evidence.
8. Troubleshoot failures and evaluate production readiness.
9. Explain load balancing behavior, health checks, sticky sessions, and failover.

## Deployment Path

```text
Source code
   |
   v
Build image
   |
   v
Configure runtime
   |
   v
Deploy release
   |
   v
Run health checks
   |
   v
Route traffic
   |
   v
Observe logs, metrics, and traces
   |
   v
Rollback or promote
```

## Production Questions

For every deployment, answer:

```text
What version is running?
Which configuration did it receive?
Where are secrets coming from?
What user does the container run as?
What is inside the image that should not be there?
Which health check proves the app is alive?
Which readiness check proves it can serve customer traffic?
How does traffic reach the container?
What is the path from load balancer to ingress to service to pod to container port?
How does the load balancer decide which target receives traffic?
What happens when one target is unhealthy?
Does this service require sticky sessions, or is it stateless?
Can a request be retried safely by the load balancer?
What tests passed before deployment?
What smoke test proves the release works after deployment?
What load test proves the service can handle expected traffic?
Which logs prove the new version handled a request?
Which metrics prove the release is healthy?
What is the rollback command or rollback plan?
What customer symptom would appear if this deploy failed?
```

## Container Security Checklist

Use this checklist before calling an image production-ready:

* Use a small trusted base image.
* Pin dependency versions where practical.
* Do not copy `.env`, `venv/`, Git history, cookies, keys, or local certificates into the image.
* Run as a non-root user.
* Keep secrets out of the image and inject them at runtime.
* Write logs to stdout/stderr.
* Expose only the application port.
* Add health/readiness behavior outside the image build itself.
* Scan the image for known vulnerabilities.
* Rebuild images from source through a repeatable pipeline.

## Traffic Into The Container

Traffic should be explainable layer by layer:

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

If traffic fails, prove the last layer that saw the request.

## Load Balancing

Load balancing should be explained as a production behavior, not just as an icon on the diagram.

For every load-balanced service, answer:

```text
What layer is balancing traffic?
What targets can receive traffic?
How are health checks configured?
What marks a target unhealthy?
What happens to in-flight requests when a target fails?
Are sessions stored outside the container?
Are retries safe for this endpoint?
How do logs prove which target handled the request?
```

In AWS design conversations, map this thinking to the service choice:

```text
CloudFront:
Global edge caching and public content delivery.

Route 53:
DNS routing, latency routing, weighted routing, and failover records.

Application Load Balancer:
HTTP/HTTPS routing, path-based routing, host-based routing, TLS termination, health checks.

Network Load Balancer:
Layer 4 TCP/UDP traffic where very high performance or static IP behavior matters.

API Gateway:
Managed API edge, auth integration, throttling, request validation, and usage controls.
```

## Test Gates

Before deployment:

* Unit tests pass.
* Integration tests cover auth, health, and core API paths.
* Image builds reproducibly.
* Dependency and image vulnerability scans are reviewed.
* Configuration is validated for the target environment.
* Secrets are present without being committed to Git.

After deployment:

* Smoke test `/health`.
* Smoke test login or the critical user path.
* Confirm request IDs appear in logs.
* Confirm the expected app version handled traffic.
* Check error rate and latency.
* Confirm rollback remains available.

## Load Testing

Load testing should answer a specific production question:

```text
How many requests per second can this deployment handle?
At what latency?
At what error rate?
Which resource saturates first?
Does scaling improve the bottleneck?
What happens when a dependency slows down?
```

Record:

```text
Test shape:
Expected traffic:
Peak traffic:
Duration:
Success rate:
p50 latency:
p95 latency:
p99 latency:
Error rate:
CPU:
Memory:
Database connections:
Redis behavior:
Queue depth, if applicable:
Bottleneck:
Production recommendation:
```

## Deployment Failure Classes

| Failure | Customer symptom | Evidence |
| --- | --- | --- |
| Bad image | App never starts | Image pull events, container status |
| Bad command or env var | Crash loop | Container logs, exit code |
| Bad secret | Auth or dependency failure | App logs, secret reference, dependency logs |
| Failed readiness | No traffic or partial traffic | Readiness events, endpoint state |
| Wrong service selector | 503 or no backend | Service endpoints, labels |
| Bad rollout | Some users hit old or broken version | Version field in logs/responses |
| Resource pressure | Slow or restarting app | CPU, memory, OOM events |

Completion standard:

```text
Given a failed deployment or failed request after deployment, explain whether the failure is build, image, configuration, secret, health check, service routing, DNS, resource pressure, rollout version, or application behavior.
```

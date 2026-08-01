# Phase 3: Operating a Containerized Production Service

Phase 3 packages, deploys, operates, observes, updates, and recovers the support-ticket application built in Phase 2.

This phase is not a separate demo application. It continues the same request path from Phases 1 and 2:

```text
Phase 1:
Trace one request through the Flask application and prove what happened.

Phase 2:
Build the production service path with NGINX, Flask support-ticket API, PostgreSQL, Redis, workers, webhooks, and real-time update concepts.

Phase 3:
Package that same service into containers, run the complete stack locally with Docker Compose, move it into Kubernetes, template it with Helm, and operate it as a production-style workload.
```

The application remains the practice environment. The main subject of this phase is the container platform and the operational behavior around it.

## Phase Goal

By the end of Phase 3, you should be able to take the Phase 2 architecture and explain:

```text
How is each component packaged?
How do the containers communicate?
How is configuration injected without rebuilding images?
How is persistent data protected from container restarts?
How does Kubernetes create, expose, replace, and scale application Pods?
How does traffic move through Ingress, Service, EndpointSlice, and a ready Pod?
How do probes decide whether a Pod is alive and safe to receive traffic?
How are API and worker replicas scaled differently?
How do we verify a rollout and roll it back safely?
How do logs, metrics, traces, and request IDs support an RCA?
Where could Helm reduce duplication without hiding the Kubernetes fundamentals?
```

## Starting Architecture From Phase 2

Phase 3 begins with the completed Phase 2 service:

```text
Browser or curl
      |
      v
NGINX reverse proxy
      |
      v
Flask support-ticket API
   |-- PostgreSQL  # users, tickets, messages, audit events
   |-- Redis       # sessions, cache, queue
   |-- worker      # notification or diagnostic jobs
   |-- webhook receiver/test service
   `-- WebSocket/SSE/polling path
```

Phase 1 request IDs, client evidence, logs, latency measurements, and RCA habits must remain intact while the system is refactored.

## Target Architecture

### Local containerized architecture

First, package and run the complete service with Docker and Docker Compose:

```text
Browser or curl
      |
      v
NGINX container
      |
      v
Flask support-ticket API container
   |-- PostgreSQL container + persistent volume
   |-- Redis container
   |-- worker container
   |-- optional webhook receiver/test container
   `-- optional WebSocket/SSE/polling path
```

The local container environment should prove:

- repeatable builds
- service-to-service DNS
- isolated networks
- externalized configuration
- secret injection
- persistent database storage
- container health behavior
- dependency startup and readiness behavior
- request-ID continuity across the same Phase 2 request path

### Kubernetes architecture

Then migrate the application-facing components into Kubernetes while continuing to reason carefully about stateful dependencies:

```text
Client
  |
  v
Ingress controller
  |
  v
Service
  |
  v
EndpointSlice
  |
  v
Ready Flask API Pod
  |
  |-- PostgreSQL
  |-- Redis
  |-- Worker Deployment
  |-- optional webhook receiver/test service
  `-- optional real-time update path

Deployment
  |
  v
ReplicaSet
  |
  v
Flask Pods
```

The traffic path and management path are different:

```text
Traffic path:
Ingress -> Service -> EndpointSlice -> ready Pod -> container -> Flask

Management path:
Deployment -> ReplicaSet -> Pods
```

A Service does not route traffic to a Deployment. The Deployment manages Pods; the Service selects ready Pod endpoints.

## Scope

Phase 3 should go deeply into the mechanics and operational consequences of:

### Docker

- image layers and build context
- `.dockerignore`
- deterministic dependency installation
- multi-stage builds where useful
- non-root containers
- environment variables and mounted configuration
- container networking and DNS
- volumes and durable state
- health checks
- logs to stdout and stderr
- image tags, digests, and reproducibility
- graceful startup and shutdown
- Docker Compose orchestration
- debugging failed builds and unhealthy containers

### Kubernetes

- namespaces
- Pods and containers
- labels and selectors
- Deployments and ReplicaSets
- rolling updates and revision history
- Services and EndpointSlices
- Ingress and ingress controllers
- ConfigMaps and Secrets
- liveness, readiness, and startup probes
- resource requests and limits
- Horizontal Pod Autoscaling concepts
- persistent volumes, claims, and storage classes
- Jobs or init containers for controlled setup and migrations
- service discovery and cluster DNS
- events, logs, metrics, and rollout status
- failure injection, mitigation, rollback, and RCA

### Helm

Helm is introduced only after the raw Kubernetes resources are understood and operated manually.

Use Helm to learn:

- chart structure
- templates and values
- environment-specific configuration
- reusable labels and names
- conditional resources
- release history
- upgrade and rollback behavior
- rendered-manifest inspection before installation

Helm should reduce duplication. It should not become a substitute for understanding the Kubernetes objects it renders.

## What Is Intentionally Deferred

Phase 3 may describe future extension points, but it should not become the home for every production concern.

The following can be expanded in later phases after this container platform is stable:

- advanced asynchronous platform patterns beyond the small Phase 2 worker
- Kafka or advanced messaging design
- full CI/CD pipelines
- GitOps and Argo CD
- service mesh
- advanced multi-cluster or multi-region architecture
- managed-cloud production deployment
- advanced database high availability and disaster recovery exercises
- mature SLO and error-budget programs

Redis remains the Phase 2 cache/session/queue dependency. Phase 3 operates that dependency and any worker process without re-teaching queue semantics from scratch.

## Lab Progression

The labs should preserve a deliberate learning order: build the container foundation, operate the local stack, map it to Kubernetes, then add release safety and operational evidence.

| Lab | Focus | Outcome |
| --- | --- | --- |
| [01](labs/01-containerize-the-system.md) | Containerize the Phase 2 system | Build production-minded images for NGINX, Flask API, and worker, and define how PostgreSQL and Redis run locally |
| [02](labs/02-configuration-and-secrets.md) | Runtime configuration and secrets | Separate image contents from environment-specific configuration and sensitive values |
| [03](labs/03-observability.md) | Container observability and health | Preserve request IDs and expose useful logs, health, readiness, metrics, and dependency signals |
| [04](labs/04-alerting-and-supportability.md) | Docker Compose operations and supportability | Run the entire stack, inspect networking and volumes, and diagnose API, worker, webhook, real-time, and dependency failures |
| [05](labs/05-deployment-verification.md) | Kubernetes resource model and traffic flow | Deploy the service and prove how Ingress, Service, EndpointSlice, Pods, probes, and DNS work together |
| [06](labs/06-rollback-and-release-safety.md) | Kubernetes rollout safety | Perform rolling updates, verify revisions, detect a bad release, and roll back safely |
| [07](labs/07-kubernetes-migration.md) | Production-minded Kubernetes operations | Add resources, scaling concepts, persistent storage decisions, configuration updates, and controlled migrations |
| [08](labs/08-production-incident.md) | Incident response, RCA, and Helm introduction | Investigate a containerized-service incident, write the RCA, then package understood manifests into a small Helm chart |

## How To Work Through The Phase

For every lab:

```text
1. State what Phase 2 behavior must remain unchanged.
2. Draw the current request, container, or Kubernetes path.
3. Build or change one operational layer.
4. Verify the healthy path with evidence.
5. Inject one related failure.
6. Identify the customer-visible symptom.
7. Locate the failed layer using logs, events, metrics, traces, or request IDs.
8. Mitigate or roll back.
9. Explain the root cause and prevention.
10. Record the retained takeaway in AnswersByGetty.
```

Do not treat a successful `docker compose up` or `kubectl apply` as completion. You must prove how the system behaves and explain why.

## Evidence Location

Reusable lab instructions belong under:

```text
phases/phase-03-operating-a-production-service/
```

Completed commands, screenshots, logs, diagrams, conclusions, rollout notes, and RCA evidence belong under:

```text
AnswersByGetty/phase-03-operating-a-production-service/labs/
```

Phase 3 answers should explicitly connect back to evidence produced in Phases 1 and 2 whenever the behavior is being preserved or compared.

## Evidence Worksheet

Use this worksheet unless a lab provides a more specific one:

```text
Lab goal:
Phase 2 behavior being preserved:
Architecture or traffic path:
Container image or Kubernetes resources involved:
Configuration and secrets:
Commands run:
Expected healthy behavior:
Observed healthy behavior:
Request ID or correlation evidence:
Container logs or Kubernetes events:
Metrics, health, readiness, or probe evidence:
Database, Redis, network, or storage evidence:
Failure injected:
Customer-visible symptom:
Hypotheses considered:
Evidence that ruled causes out:
Failed layer:
Mitigation:
Rollback or roll-forward decision:
Root cause:
Prevention or hardening change:
Runbook update:
Interview explanation:
Retained takeaway:
```

## Production Readiness Questions

Before calling the containerized service ready, you should be able to answer:

### Images and runtime

```text
What image and immutable version are running?
Can another engineer rebuild the same artifact?
Does the container run as a non-root user?
What configuration is provided at runtime?
Where are secrets stored and injected?
What happens during startup and shutdown?
```

### Networking and traffic

```text
How do containers discover one another locally?
How does a Kubernetes request reach a ready Pod?
Which selectors connect Services to Pods?
What evidence appears when an Ingress rule, Service port, selector, or target port is wrong?
```

### State and dependencies

```text
What data must survive a restart?
What belongs in PostgreSQL versus Redis?
What is stored in a persistent volume?
What happens if PostgreSQL or Redis is unavailable?
What happens if the worker is stopped or the queue backs up?
Can readiness prevent unsafe traffic from reaching the app?
```

### Rollout and recovery

```text
How do we know the new version is healthy?
Can old and new versions safely run at the same time?
What signals would stop the rollout?
How is the previous revision restored?
What happens to database changes during application rollback?
```

### Supportability and RCA

```text
Can we trace one request across the edge, proxy, Pod, application, and dependencies?
Can we distinguish a routing failure from an application, database, Redis, or resource failure?
What would alert before customers report the issue?
What evidence proves the release caused or did not cause the incident?
What should support, engineering, and customers each be told?
```

## Phase 3 Completion Standard

Phase 3 is complete when you can demonstrate, not merely describe, all of the following:

```text
The Phase 2 service runs as a repeatable multi-container application.
The PostgreSQL data survives expected container replacement.
Configuration and secrets are externalized from the images.
The same request ID can still be followed through the service.
The Flask workload runs in Kubernetes behind a Service and Ingress.
You can explain the traffic path separately from the Deployment management path.
Readiness and liveness behavior are tested rather than assumed.
A rolling deployment can be verified and a bad revision can be rolled back.
A realistic failure can be diagnosed from operational evidence and documented as an RCA.
The raw Kubernetes manifests are understood before a Helm chart templates them.
Completed evidence is recorded in AnswersByGetty.
```

## What To Retain For Phase 4

Carry these habits into later phases:

- Package once and configure at runtime.
- Treat containers as replaceable and state as an explicit design decision.
- Separate the network traffic path from the Kubernetes controller hierarchy.
- Use readiness to protect customers, not just to satisfy a checklist.
- Establish healthy behavior before injecting failures.
- Correlate customer symptoms with logs, events, metrics, traces, and request IDs.
- Restore service before completing the deeper RCA.
- Understand generated Kubernetes manifests before introducing more automation.

Phase 4 should begin only after this container platform is stable enough to support the next architectural concern without hiding unresolved Docker or Kubernetes fundamentals.

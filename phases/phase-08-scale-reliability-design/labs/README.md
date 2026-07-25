# Phase 8 Labs

These labs document production architecture thinking at the level of a design review.

Put completed designs, tradeoffs, diagrams, and reflections in `AnswersByGetty/phase-08-scale-reliability-design/`.

## Lab 1: Production Readiness Review

Prompt:

```text
Assume the application has a React frontend, Node/Python backends, PostgreSQL, Redis, and queueing.
Management wants it in production next week.
You, another engineer, and a DevOps engineer are assigned.
What evidence is required before saying it is safe to deploy?
```

Cover:

* Architecture diagram
* Public vs private traffic
* Authentication and authorization
* CI/CD and rollback plan
* Container security
* Secrets management
* Database readiness
* Redis and queue readiness
* Smoke tests and integration tests
* Load test results
* Observability and alerts
* Runbooks and on-call ownership
* Go/no-go criteria

Completion standard:

```text
You can explain what evidence is required before production, what risks remain, and what would block the launch.
```

## Lab 2: AWS Production Architecture

Prompt:

```text
Design AWS infrastructure for the app. It needs globally available public pages and authenticated logged-in experiences.
```

Cover:

* DNS and global routing
* CDN for public/static content
* WAF and edge protection
* Load balancing
* Container runtime
* Private networking
* Database service
* Redis/cache service
* Queue service
* Object storage
* Secrets management
* Logs, metrics, traces, and dashboards
* Multi-AZ and multi-region tradeoffs

Completion standard:

```text
You can name the AWS services, explain why each exists, and trace a request through the public and logged-in paths.
```

## Lab 3: Global Availability Tradeoff

Prompt:

```text
The business asks for global availability. Decide what must be global now, what can be regional, and what should wait.
```

Cover:

* Public static pages
* Authenticated API traffic
* Database writes
* Read replicas
* Redis/session strategy
* Queue processing
* Data residency
* Failover
* Operational complexity

Completion standard:

```text
You can separate true global requirements from expensive complexity and explain the tradeoff clearly.
```

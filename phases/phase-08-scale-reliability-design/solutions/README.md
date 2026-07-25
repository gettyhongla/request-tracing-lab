# Phase 8 Solution Guide

This guide defines the evidence and reasoning standards for strong production architecture work.

## Solution Shape: Production Readiness Review

A strong answer starts by slowing down the deadline:

```text
Before I say this is safe for production, I need evidence across architecture, deployment, security, data, observability, testing, rollback, and ownership.
```

Minimum evidence:

* Architecture diagram and request flows
* CI/CD pipeline with repeatable builds
* Container image review and vulnerability scanning
* Environment-specific configuration
* Secrets in a secret manager, not in code or images
* Database migrations tested and rollback understood
* Redis/cache/session behavior defined
* Queue retry, idempotency, and dead-letter behavior defined
* Unit, integration, smoke, and load tests
* Logs, metrics, traces, dashboards, and alerts
* SLOs or launch health thresholds
* Runbooks and on-call ownership
* Rollback or roll-forward plan

Blockers:

```text
No rollback plan.
No production secrets strategy.
No health/readiness checks.
No database migration plan.
No observability for critical paths.
No load test or capacity estimate.
No owner for deploy and incident response.
```

## Solution Shape: AWS Architecture

One reasonable AWS design:

```text
Route 53
  |
  v
CloudFront + AWS WAF
  |
  |-- Static React assets in S3
  |
  v
Application Load Balancer
  |
  v
ECS Fargate or EKS services in private subnets
  |
  |-- RDS PostgreSQL Multi-AZ
  |-- ElastiCache Redis
  |-- SQS queue
  |-- Worker service
  |-- S3 object storage
```

Supporting services:

* ACM for TLS certificates
* Secrets Manager or SSM Parameter Store for secrets
* ECR for container images
* CloudWatch for logs and metrics
* X-Ray or OpenTelemetry collector for traces
* IAM roles for service permissions

Public experience:

```text
Route 53 -> CloudFront -> S3 static assets or public frontend route
```

Logged-in experience:

```text
Route 53 -> CloudFront/WAF -> ALB -> API service -> RDS/Redis/SQS
```

Key tradeoff:

```text
Static public content is easy to make global with CloudFront.
Authenticated write-heavy app traffic is harder to make truly global because identity, sessions, database writes, and consistency must be designed carefully.
```

## Solution Shape: Global Availability

Start practical:

* Make static assets global through CloudFront.
* Run the app in at least two Availability Zones.
* Use RDS Multi-AZ for regional database availability.
* Use autoscaling for API and worker services.
* Use health checks and rollback for failed deploys.

Then discuss multi-region only if requirements justify it:

* Route 53 latency or failover routing
* Multi-region read replicas
* Active-passive API failover
* Data replication and consistency strategy
* Session/token behavior during regional failover
* Queue replay and worker idempotency

Sharp conclusion:

```text
Global static delivery is straightforward.
Global authenticated application behavior requires explicit decisions about data consistency, failover, sessions, writes, and operational ownership.
```

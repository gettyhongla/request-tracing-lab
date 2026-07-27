# Lab 02: AWS Production Architecture

## Scenario

Design AWS infrastructure for the application.

The system needs:

```text
Globally available public pages
Authenticated logged-in experiences
Backend APIs
PostgreSQL
Redis
Queueing
Workers
Object storage
Observability
Safe deployment and rollback
```

## Goal

Draw and explain one reasonable AWS design.

The design should show how public traffic and logged-in traffic move through different parts of the architecture.

## Reference Architecture To Evaluate

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

Supporting services to account for:

* ACM for TLS certificates
* Secrets Manager or SSM Parameter Store for secrets
* ECR for container images
* CloudWatch for logs and metrics
* X-Ray or OpenTelemetry collector for traces
* IAM roles for service permissions

## Request Flows

Public experience:

```text
Route 53 -> CloudFront -> S3 static assets or public frontend route
```

Logged-in experience:

```text
Route 53 -> CloudFront/WAF -> ALB -> API service -> RDS/Redis/SQS
```

## Tradeoff To Explain

```text
Static public content is easy to make global with CloudFront.
Authenticated write-heavy app traffic is harder to make truly global because identity, sessions, database writes, and consistency must be designed carefully.
```

## Deliverable

Write the completed architecture review in:

```text
AnswersByGetty/phase-08-scale-reliability-design/lab-02-aws-production-architecture.md
```

Use this shape:

```text
Architecture diagram:
Public request flow:
Logged-in request flow:
AWS services and why each exists:
Security boundaries:
Data path:
Queue/worker path:
Observability path:
Failure modes:
Tradeoffs:
Retained takeaway:
```

## Completion Standard

You can name the AWS services, explain why each exists, and trace a request through the public and logged-in paths.

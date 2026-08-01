# Phase 3 Labs

## Table Of Contents

1. [Lab 01: Containerize The System](#lab-01-containerize-the-system)
2. [Lab 02: Configuration And Secrets](#lab-02-configuration-and-secrets)
3. [Lab 03: Observability](#lab-03-observability)
4. [Lab 04: Alerting And Supportability](#lab-04-alerting-and-supportability)
5. [Lab 05: Deployment Verification](#lab-05-deployment-verification)
6. [Lab 06: Rollback And Release Safety](#lab-06-rollback-and-release-safety)
7. [Lab 07: Kubernetes Migration](#lab-07-kubernetes-migration)
8. [Lab 08: Production Incident](#lab-08-production-incident)

## Lab 01: Containerize The System

Package the service so it can run the same way across environments.

### Tasks

1. Build a container image.
2. Run the container locally.
3. Confirm the app listens on the expected port.
4. Confirm logs go to stdout or stderr.
5. Identify what must not be copied into the image.

### Evidence To Capture

```text
Image build command:
Run command:
Port evidence:
Log evidence:
Image contents reviewed:
Security concerns:
Retained takeaway:
```

## Lab 02: Configuration And Secrets

Separate code, runtime configuration, and secrets.

### Tasks

1. List required environment variables.
2. Define safe defaults for local development.
3. Move secrets out of code and images.
4. Show how configuration changes runtime behavior.
5. Identify missing or unsafe configuration failures.

### Evidence To Capture

```text
Configuration list:
Secret handling:
Local values:
Production-like values:
Failure when missing:
Failure when wrong:
Retained takeaway:
```

## Lab 03: Observability

Define the evidence needed to operate the service.

### Tasks

1. Identify required logs.
2. Identify required metrics.
3. Identify where traces or request IDs should appear.
4. Define a dashboard for customer-facing health.
5. Define which signals support an RCA.

### Evidence To Capture

```text
Request ID strategy:
Log fields:
Metrics:
Trace points:
Dashboard sketch:
RCA evidence:
Retained takeaway:
```

## Lab 04: Alerting And Supportability

Decide what support and engineering need when the service is live.

### Tasks

1. Define customer-impacting alerts.
2. Separate page-worthy alerts from ticket-worthy alerts.
3. Define support triage steps.
4. Define engineering escalation evidence.
5. Identify noisy or low-value alerts.

### Evidence To Capture

```text
Alert:
Threshold:
Customer impact:
First triage step:
Escalation evidence:
Owner:
Runbook link:
Retained takeaway:
```

## Lab 05: Deployment Verification

Prove a release is healthy before and after it receives traffic.

### Tasks

1. Define pre-deploy checks.
2. Define post-deploy smoke tests.
3. Confirm which version handled a request.
4. Check logs, metrics, and dependency health.
5. Decide whether to promote, pause, or roll back.

### Evidence To Capture

```text
Version:
Pre-deploy checks:
Smoke test:
Request evidence:
Health evidence:
Customer-impact evidence:
Decision:
Retained takeaway:
```

## Lab 06: Rollback And Release Safety

Practice deciding whether to roll back or roll forward.

### Tasks

1. Define what changed in the release.
2. Identify rollback risks.
3. Identify roll-forward risks.
4. Define database migration safety checks.
5. Write a customer-safe release-risk explanation.

### Evidence To Capture

```text
Change:
Detected symptom:
Rollback option:
Roll-forward option:
Data risk:
Decision criteria:
Communication:
Retained takeaway:
```

## Lab 07: Kubernetes Migration

Map the service to Kubernetes concepts and prove the traffic path.

### Tasks

1. Review the Kubernetes manifests in `kubernetes/`.
2. Explain Deployment, Pod, Service, Ingress, Secret, HPA, and NetworkPolicy responsibilities.
3. Trace traffic from ingress to container port.
4. Explain health checks, readiness, and pod replacement.
5. Identify what would block a production cluster rollout.

### Evidence To Capture

```text
Kubernetes objects:
Traffic path:
Config and secret handling:
Health and readiness:
Scaling behavior:
Network policy:
Launch blockers:
Retained takeaway:
```

## Lab 08: Production Incident

Investigate a realistic production incident and write the RCA.

This lab should include one synchronous failure and one asynchronous-style failure.

Examples:

```text
Synchronous failure:
Login is slow because PostgreSQL queries are slow.

Asynchronous failure:
A background report job is queued but workers are not processing it.

Real-time symptom:
The user expects live progress, but the progress UI stops updating.
```

### Tasks

1. Start from a vague customer symptom.
2. Build a timeline.
3. Trace the request path.
4. Decide whether the symptom is synchronous, asynchronous, real-time, or a mix.
5. Rank hypotheses.
6. Collect evidence.
7. Mitigate the issue.
8. Write customer and engineering updates.
9. Write prevention work.

### Evidence To Capture

```text
Customer symptom:
Timeline:
Request path:
Sync, async, or real-time classification:
Hypotheses:
Evidence:
Queue or worker evidence, if relevant:
Root cause:
Mitigation:
Customer update:
Engineering follow-up:
Prevention:
Retained takeaway:
```

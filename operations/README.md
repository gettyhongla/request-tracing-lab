# Operations Tracks

Use this section to practice running the application like an operator. The goal is to package, deploy, observe, break, and fix the application while still tracing requests end to end.

```text
operations/
|-- README.md
|-- kubernetes-helm/
|   |-- README.md
```

## Current Track

Start here for Kubernetes and Helm practice:

```text
operations/kubernetes-helm/README.md
```

This track focuses on:

```text
Container packaging
Kubernetes manifests
Helm releases
Ingress, Services, Deployments, Pods, probes, and Secrets
Logs, metrics, and request IDs
Breaking and diagnosing live deployment failures
Production readiness and reliability
```

## Operating Model

For each operational exercise, use this loop:

```text
Package
  |
  v
Deploy
  |
  v
Run
  |
  v
Observe
  |
  v
Break
  |
  v
Diagnose
  |
  v
Fix
```

## Evidence To Collect

```text
Command used:

Expected result:

Actual result:

Request path:

Request ID:

Kubernetes object involved:

Logs:

Events:

Metrics:

Root cause:

Fix:

What I learned:
```

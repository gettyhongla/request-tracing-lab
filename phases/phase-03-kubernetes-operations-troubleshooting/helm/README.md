# Helm Assets

Helm is introduced in Phase 3 only as packaging for the Kubernetes manifests and as a troubleshooting surface for bad values, rendered templates, rollout history, and rollback.

The local chart lives at:

```text
helm/request-tracing-lab/
```

## Useful Commands

```bash
helm lint phases/phase-03-kubernetes-operations-troubleshooting/helm/request-tracing-lab
helm template request-tracing-lab phases/phase-03-kubernetes-operations-troubleshooting/helm/request-tracing-lab
helm upgrade --install request-tracing-lab phases/phase-03-kubernetes-operations-troubleshooting/helm/request-tracing-lab -n request-tracing-lab --create-namespace
helm history request-tracing-lab -n request-tracing-lab
helm rollback request-tracing-lab <revision> -n request-tracing-lab
```

If Helm is not installed, study the chart files and run Kubernetes manifest validation against the non-Helm manifests first.

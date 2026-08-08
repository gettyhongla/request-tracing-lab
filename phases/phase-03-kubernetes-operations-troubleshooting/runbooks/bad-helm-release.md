# Runbook: Bad Helm Release

## Symptom

```text
A Helm install or upgrade completes or partially completes, but runtime behavior is unhealthy.
```

## Mental Model

```text
Helm values -> rendered manifest -> Kubernetes object -> runtime behavior
```

## Evidence To Collect

| Question | Evidence |
| --- | --- |
| What changed in values? | values file or override |
| What did Helm render? | rendered manifests |
| What did Kubernetes accept? | live object YAML |
| What is unhealthy at runtime? | Pod, Service, EndpointSlice, Ingress, events, logs |
| Can the release roll back? | Helm history |

## Troubleshooting Process

1. Compare intended values with rendered manifests.
2. Compare rendered manifests with live Kubernetes objects.
3. Identify whether the failure is configuration, image, probe, Service, Ingress, or dependency behavior.
4. Decide whether to fix forward or roll back.
5. Validate the original request path after remediation.

## Common Root Causes

```text
Wrong image tag.
Wrong Service port.
Changed readiness probe.
Missing environment variable.
Bad values override.
Rendered manifest differs from expected object.
```

## Validation

```text
Helm release is deployed or rolled back to a known-good revision.
Kubernetes resources are healthy.
Client request succeeds through the expected path.
```

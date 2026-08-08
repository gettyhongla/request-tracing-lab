# Runbook: Kubernetes Service Has No Endpoints

## Symptom

```text
Service exists, but traffic has no ready backend endpoints.
```

## Path

```text
Service -> EndpointSlice -> Ready Pod
```

## Evidence To Collect

| Question | Evidence |
| --- | --- |
| What selector does the Service use? | Service YAML |
| Which Pods have matching labels? | Pod labels |
| Are matching Pods Ready? | Pod readiness conditions |
| What EndpointSlices exist? | EndpointSlice addresses, ports, readiness |
| Does targetPort match the container port? | Service and Pod spec |

## Troubleshooting Process

1. Compare Service selector with Pod labels.
2. Confirm matching Pods exist.
3. Confirm matching Pods are Ready.
4. Inspect EndpointSlices for addresses and ready state.
5. Compare `port`, `targetPort`, and container port.

## Common Root Causes

```text
Selector mismatch.
Pods not Ready.
Wrong targetPort.
Pods in the wrong namespace.
Application not listening on the expected port.
```

## Validation

```text
EndpointSlice contains ready endpoints.
Service request reaches the application.
Ingress/backend error clears if Ingress was depending on this Service.
```

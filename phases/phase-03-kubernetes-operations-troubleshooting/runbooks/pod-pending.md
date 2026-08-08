# Runbook: Pod Pending

## Symptom

```text
kubectl get pods shows one or more Pods stuck in Pending.
```

## Expected Path

```text
Deployment -> ReplicaSet -> Pod -> scheduler -> node -> Running container
```

## Investigation

Confirm the Pod and node state:

```bash
kubectl get pods -n request-tracing-lab -o wide
kubectl describe pod -n request-tracing-lab <pod-name>
kubectl get events -n request-tracing-lab --sort-by=.lastTimestamp
kubectl get nodes -o wide
```

What to inspect:

```text
Scheduling events:
Node availability:
Resource requests:
Taints/tolerations:
Volume claims:
Image pull events:
```

## Common Causes

```text
No node has enough requested CPU or memory.
A required volume or claim is unavailable.
Node selectors, affinity, or taints prevent scheduling.
The cluster is not running or not reachable.
```

## Fix Or Mitigation

```text
Reduce unrealistic resource requests for the lab.
Start or repair the local cluster.
Correct scheduling constraints.
Create required storage resources if the lab uses them.
```

## Validation

```bash
kubectl get pods -n request-tracing-lab -o wide
kubectl describe pod -n request-tracing-lab <pod-name>
```

The Pod should move from Pending to Running, then readiness determines whether it receives Service traffic.

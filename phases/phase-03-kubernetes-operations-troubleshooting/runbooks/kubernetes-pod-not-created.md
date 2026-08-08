# Runbook: Kubernetes Pod Not Created

## Symptom

```text
A Deployment or ReplicaSet exists, but the expected Pod does not appear.
```

## Path

```text
Deployment -> ReplicaSet -> Pod
```

This is a management-path problem first, not a traffic-path problem.

## Evidence To Collect

| Question | Evidence |
| --- | --- |
| Does the Deployment exist? | Deployment status and conditions |
| Did it create a ReplicaSet? | ReplicaSet list and owner references |
| Is the ReplicaSet allowed to create Pods? | ReplicaSet events |
| Are quotas, policies, or admission rules blocking creation? | namespace events and describe output |

## Troubleshooting Process

1. Confirm the Deployment exists and has the desired replica count.
2. Inspect whether a ReplicaSet exists for the Deployment.
3. Inspect ReplicaSet conditions and events before looking for Service or Ingress issues.
4. Identify whether creation is blocked by configuration, quota, policy, or controller behavior.

## Common Root Causes

```text
Invalid Pod template.
Namespace quota.
Admission policy rejection.
Missing required configuration.
Controller cannot create child objects.
```

## Remediation

Fix the rejected configuration or namespace constraint, then re-apply the manifest.

## Validation

```text
ReplicaSet creates the expected Pod.
Pod appears in the namespace.
Deployment available replicas move toward desired replicas.
```

## Escalation Criteria

Escalate with Deployment YAML, ReplicaSet events, namespace events, and the exact creation error if the controller rejects a valid-looking manifest.

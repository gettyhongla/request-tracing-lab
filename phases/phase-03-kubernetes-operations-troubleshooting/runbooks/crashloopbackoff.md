# Runbook: CrashLoopBackOff

## Symptom

```text
Pod exists, but the container repeatedly exits and Kubernetes backs off before restarting it again.
```

## Expected Path

```text
Pod -> container process -> application startup -> logs -> ready endpoint
```

## Investigation

```bash
kubectl get pods -n request-tracing-lab
kubectl describe pod -n request-tracing-lab <pod-name>
kubectl logs -n request-tracing-lab <pod-name>
kubectl logs -n request-tracing-lab <pod-name> --previous
```

What to inspect:

```text
Exit code:
Restart count:
Last state:
Current logs:
Previous logs:
Command and args:
Environment variables:
Secret and ConfigMap references:
```

## Common Causes

```text
Bad command or missing file.
Missing environment variable.
Secret or ConfigMap reference points to the wrong object/key.
Application starts but exits after dependency or schema failure.
Port conflict inside the container.
```

## Fix Or Mitigation

```text
Restore the correct command.
Correct runtime configuration.
Create or fix the Secret/ConfigMap.
Confirm dependency names and ports.
Roll back to the last known-good image if a new image caused the loop.
```

## Validation

```bash
kubectl rollout status deployment/request-tracing-lab -n request-tracing-lab
kubectl get pods -n request-tracing-lab
kubectl logs -n request-tracing-lab deploy/request-tracing-lab --tail=50
```

The restart count should stop increasing and the Pod should become Ready.

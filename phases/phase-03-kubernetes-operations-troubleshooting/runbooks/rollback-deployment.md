# Runbook: Roll Back A Deployment

## Symptom

```text
A new release causes unhealthy Pods, failed readiness, elevated errors, or broken request routing.
```

## Evidence Before Rollback

```text
Observed impact:
Current revision:
Previous known-good revision:
Failed health/readiness evidence:
Client-visible symptom:
Relevant logs/events:
```

## Decision Points

```text
Is customer impact active?
Is the root cause known?
Is fix-forward faster and safer than rollback?
Is the previous revision known-good?
Will rollback preserve data compatibility?
```

## Process

1. Capture the current state before changing it.
2. Inspect rollout status and history.
3. Choose rollback only if it is safer than fix-forward.
4. Roll back to the selected known-good revision.
5. Watch rollout status.
6. Validate the original request path.

## Validation

```text
New Pods are Ready.
Service has ready endpoints.
Client request succeeds.
Error rate returns to expected behavior.
Logs confirm healthy request handling.
```

## Prevention

```text
Add smoke tests.
Validate rendered manifests.
Use readiness checks.
Record release notes.
Automate rollback validation only after the manual process is understood.
```

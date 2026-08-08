# Runbook: Kubernetes Pod Running But Not Ready

## Symptom

```text
The Pod is Running, but readiness is false and Service traffic does not reach it.
```

## Path

```text
Service -> EndpointSlice -> Ready Pod -> container -> application
```

## Evidence To Collect

| Question | Evidence |
| --- | --- |
| Is the Pod running? | Pod status |
| Why is readiness false? | Pod conditions and events |
| Which probe is failing? | readiness probe configuration and failure messages |
| Is the app listening on the expected port? | container logs and port/config evidence |
| Did the EndpointSlice include the Pod? | EndpointSlice ready endpoints |

## Troubleshooting Process

1. Confirm the Pod is Running but not Ready.
2. Inspect readiness probe events and failure messages.
3. Compare probe path/port with the application listener.
4. Check whether the Service has ready endpoints.
5. Fix the app, probe, port, or dependency condition that prevents readiness.

## Common Root Causes

```text
Wrong readiness path.
Wrong readiness port.
Application bound to the wrong interface.
Required dependency unavailable.
Startup takes longer than probe timing allows.
```

## Validation

```text
Readiness condition becomes true.
EndpointSlice contains the Pod as ready.
Service request reaches the application.
```

## Prevention

Use readiness checks that prove the instance can safely receive traffic without depending on optional systems.

# Runbook: Ingress 502

## Symptom

```text
The client reaches the Ingress path, but receives a 502-style upstream failure.
```

## Path

```text
Client -> Ingress controller -> Service -> EndpointSlice -> Ready Pod -> application
```

## Evidence To Collect

| Question | Evidence |
| --- | --- |
| Did the request reach the ingress controller? | ingress controller logs |
| Which Service does the Ingress route to? | Ingress rule |
| Does that Service have ready endpoints? | EndpointSlice |
| Is the targetPort correct? | Service and Pod spec |
| Did the application receive the request? | application logs/request ID |

## Troubleshooting Process

1. Confirm this is not a DNS/client connectivity issue.
2. Inspect the Ingress rule and backend Service name/port.
3. Inspect Service endpoints.
4. Inspect Pod readiness and application listener.
5. Use application logs to determine whether the request reached Flask.

## Common Root Causes

```text
Ingress points to wrong Service.
Service has no ready endpoints.
Wrong Service port or targetPort.
Backend Pod not Ready.
Application process not listening.
```

## Validation

```text
Client receives expected HTTP status.
Ingress controller logs show successful upstream response.
Application logs show the request ID or route handling.
```

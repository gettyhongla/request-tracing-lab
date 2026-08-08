# Kubernetes Evidence-First Troubleshooting Worksheet

## Observed Symptom

```text
What did the client, rollout, Pod status, or operator observe?
```

## Which Path Is Failing?

```text
Traffic path:
Ingress -> Service -> EndpointSlice -> Ready Pod -> container -> application

Management path:
Deployment -> ReplicaSet -> Pod

Dependency path:
API Pod -> Service/DNS -> dependency endpoint -> dependency process
```

## Question Before Command

```text
What question am I asking?
Why does this command answer that question?
What evidence can it provide?
What would the result prove?
What would the result NOT prove?
What should determine my next step?
```

## Evidence Collected

```text
kubectl get:
kubectl describe:
kubectl logs:
events:
rollout status/history:
Service/EndpointSlice evidence:
Ingress evidence:
probe evidence:
configuration evidence:
```

## Failure Boundary

```text
Where did expected behavior become unhealthy?
```

## Fix And Validation

```text
What changed?
What proves the original behavior works again?
```

## Improvement

```text
Could readiness, validation, alerts, runbooks, smoke tests, or safer rollout checks catch this earlier?
```

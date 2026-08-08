# Runbook: ImagePullBackOff

## Symptom

```text
Pod is created, but Kubernetes cannot pull or find the configured image.
```

## Expected Path

```text
Deployment image field -> node image lookup/pull -> container start
```

## Investigation

```bash
kubectl get pods -n request-tracing-lab
kubectl describe pod -n request-tracing-lab <pod-name>
kubectl get deployment request-tracing-lab -n request-tracing-lab -o jsonpath='{.spec.template.spec.containers[0].image}{"\n"}'
```

For minikube/local image tests:

```bash
minikube image ls | grep request-tracing-lab
minikube image load request-tracing-lab:local
```

What to inspect:

```text
Image name:
Image tag:
imagePullPolicy:
Registry host:
Local cluster image availability:
Pull permission events:
```

## Common Causes

```text
Typo in image repository or tag.
Local image exists on the laptop but not inside the local cluster node.
imagePullPolicy forces a pull for an image that only exists locally.
Private registry credentials are missing.
```

## Fix Or Mitigation

```text
Correct the image reference.
Load the image into the local cluster.
Use IfNotPresent for local image labs.
Create the required image pull secret for private registries.
```

## Validation

```bash
kubectl rollout restart deployment/request-tracing-lab -n request-tracing-lab
kubectl rollout status deployment/request-tracing-lab -n request-tracing-lab
kubectl get pods -n request-tracing-lab
```

# Kubernetes Assets

These manifests support Phase 3 Labs 05-07.

## Objects

| File | Object | Purpose |
| --- | --- | --- |
| [namespace.yaml](namespace.yaml) | Namespace | Keeps lab resources grouped. |
| [configmap.yaml](configmap.yaml) | ConfigMap | Runtime settings that are not secrets. |
| [secret.example.yaml](secret.example.yaml) | Secret | Local-example session/JWT secrets. |
| [deployment.yaml](deployment.yaml) | Deployment | Runs two Flask app replicas. |
| [service.yaml](service.yaml) | Service | Routes stable cluster traffic to ready Pods. |
| [ingress.yaml](ingress.yaml) | Ingress | Optional HTTP entry point if an ingress controller exists. |
| [hpa.yaml](hpa.yaml) | HPA | Demonstrates scaling intent and metrics dependency. |
| [networkpolicy.yaml](networkpolicy.yaml) | NetworkPolicy | Demonstrates traffic policy boundaries. |

## Management Path

```text
Deployment -> ReplicaSet -> Pod
```

## Traffic Path

```text
Client -> Ingress -> Service -> EndpointSlice -> Ready Pod -> Container -> Flask -> Dependency
```

## Local Validation

```bash
kubectl config current-context
kubectl apply --dry-run=client -f phases/phase-03-kubernetes-operations-troubleshooting/kubernetes/
ruby -e 'require "yaml"; ARGV.each { |f| YAML.load_file(f); puts "OK #{f}" }' phases/phase-03-kubernetes-operations-troubleshooting/kubernetes/*.yaml
```

Before applying to minikube, load the local image:

```bash
minikube image load request-tracing-lab:local
```

Apply in dependency order from this directory:

```bash
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secret.example.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml
kubectl apply -f networkpolicy.yaml
```

# Kubernetes Manifests

This directory contains the plain Kubernetes manifests for running the request-tracing Flask app before converting the deployment to Helm.

## Mental Model

There are two different relationships happening in these manifests:

```text
Resource ownership:
Deployment -> ReplicaSet -> Pods -> Flask container on port 5001

Traffic path:
Ingress, optional -> Service on port 80 -> ready Pod endpoints -> container port 5001

Runtime configuration:
Secret -> Deployment environment variables -> Flask app

Scaling:
HPA -> watches/scales the Deployment

Organization:
Namespace -> groups these resources together
```

The arrows do not all mean the same thing. Some mean "creates," some mean "routes traffic to," and some mean "provides configuration to."

## Files

```text
k8s/
|-- namespace.yaml
|-- secret.example.yaml
|-- deployment.yaml
|-- service.yaml
|-- ingress.yaml
|-- hpa.yaml
|-- networkpolicy.yaml
```

## Common Kubernetes YAML Shape

Most Kubernetes manifests follow this shape:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: request-tracing-lab
  namespace: request-tracing-lab
spec:
  # desired state goes here
```

Key fields:

```text
apiVersion:
Which Kubernetes API group/version understands this object.

kind:
The type of Kubernetes object to create.

metadata:
The object's name, namespace, labels, and annotations.

spec:
The desired state you want Kubernetes to create and maintain.
```

## namespace.yaml

Creates a separate workspace for this lab:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: request-tracing-lab
```

Why it matters:

```text
Keeps the lab resources grouped together.
Lets kubectl commands target only this app with -n request-tracing-lab.
Makes cleanup easier.
```

Analogy:

```text
A Kubernetes Namespace is like a labeled workspace or folder inside the cluster.
It groups related objects so the lab's Pods, Service, Secret, and HPA are not mixed into the default namespace.
```

This is different from a Linux network namespace:

```text
Kubernetes Namespace:
Organizes Kubernetes objects.

Linux network namespace:
Isolates network interfaces, IP addresses, ports, routes, and localhost for a process/container.
```

## secret.example.yaml

Creates runtime secrets for the Flask session key and JWT signing key:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: request-tracing-lab-secrets
  namespace: request-tracing-lab
type: Opaque
stringData:
  FLASK_SECRET_KEY: replace-me-local-session-secret
  JWT_SECRET: replace-me-local-jwt-secret
```

Why it matters:

```text
Secrets should not be baked into the Docker image.
The same image can move across local, staging, and production.
Each environment can provide its own secret values at runtime.
```

Important note:

```text
This is an example file for lab use. Do not commit real production secrets.
```

## deployment.yaml

Runs the Flask application as 2 Pod replicas:

```yaml
apiVersion: apps/v1
kind: Deployment
spec:
  replicas: 2
```

Important parts:

```yaml
selector:
  matchLabels:
    app.kubernetes.io/name: request-tracing-lab
```

This tells the Deployment which Pods it owns.

```yaml
template:
  metadata:
    labels:
      app.kubernetes.io/name: request-tracing-lab
```

This labels every Pod the Deployment creates. The Deployment selector and Pod labels must match.

```yaml
containers:
  - name: request-tracing-lab
    image: request-tracing-lab:local
    imagePullPolicy: IfNotPresent
```

This tells Kubernetes which container image to run. For minikube, load the local image first:

```bash
minikube image load request-tracing-lab:local
```

Meaning:

```text
Copy the local Docker image into minikube so Kubernetes can run it.
```

```yaml
ports:
  - name: http
    containerPort: 5001
```

The Flask app listens on container port `5001`.

```yaml
env:
  - name: FLASK_RUN_HOST
    value: "0.0.0.0"
  - name: FLASK_SECRET_KEY
    valueFrom:
      secretKeyRef:
        name: request-tracing-lab-secrets
        key: FLASK_SECRET_KEY
```

Some config is plain runtime config. Secret values come from the Kubernetes Secret.

```yaml
readinessProbe:
  httpGet:
    path: /health
    port: http
```

Readiness decides whether the Pod should receive traffic.

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: http
```

Liveness decides whether Kubernetes should restart the container.

```yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 256Mi
```

Requests help Kubernetes schedule the Pod. Limits cap how much CPU/memory the container can use.

## service.yaml

Creates a stable internal address for the Pods:

```yaml
apiVersion: v1
kind: Service
spec:
  type: ClusterIP
  selector:
    app.kubernetes.io/name: request-tracing-lab
  ports:
    - name: http
      port: 80
      targetPort: http
```

What it means:

```text
Service port:
80

Target port:
The Pod's named port http, which points to containerPort 5001.

Selector:
Find Pods with app.kubernetes.io/name=request-tracing-lab.
```

Traffic path:

```text
Service request-tracing-lab:80
  |
  v
Ready Pod endpoint:5001
```

Proof command:

```bash
kubectl get endpoints -n request-tracing-lab
```

Healthy evidence:

```text
10.244.0.3:5001,10.244.0.4:5001
```

## ingress.yaml

Defines optional HTTP routing into the Service:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
spec:
  ingressClassName: nginx
  rules:
    - host: request-tracing-lab.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: request-tracing-lab
                port:
                  number: 80
```

What it means:

```text
If an nginx ingress controller is installed, requests for request-tracing-lab.local/ route to the request-tracing-lab Service on port 80.
```

For this local phase, port-forwarding is simpler than Ingress:

```bash
kubectl port-forward -n request-tracing-lab svc/request-tracing-lab 8080:80
```

## hpa.yaml

Defines scaling intent for the Deployment:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: request-tracing-lab
  minReplicas: 2
  maxReplicas: 5
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

What it means:

```text
Keep at least 2 replicas.
Scale up to 5 replicas.
Use CPU utilization as the scaling signal.
Target average CPU utilization of 70%.
```

If you see:

```text
cpu: <unknown>/70%
```

that usually means metrics are not available yet. The HPA exists, but it cannot calculate scaling without metrics-server data.

## networkpolicy.yaml

Defines allowed inbound traffic to the app Pods:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: request-tracing-lab
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector: {}
      ports:
        - protocol: TCP
          port: 5001
```

What it means:

```text
Select Pods labeled app.kubernetes.io/name=request-tracing-lab.
Control inbound traffic to those Pods.
Allow TCP traffic to port 5001 from namespaces selected by namespaceSelector.
```

Important note:

```text
NetworkPolicy behavior depends on the cluster CNI plugin.
Some local clusters may accept the object but not enforce it.
```

## Apply Order

Use a clear order so dependencies exist first:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.example.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/networkpolicy.yaml
```

## Evidence To Collect

```bash
kubectl get all -n request-tracing-lab
kubectl get pods -n request-tracing-lab -o wide
kubectl get svc -n request-tracing-lab
kubectl get endpoints -n request-tracing-lab
kubectl get hpa -n request-tracing-lab
kubectl get events -n request-tracing-lab --sort-by=.lastTimestamp
```

What each command proves:

```text
get all:
Shows the main workload, Service, ReplicaSet, and HPA state.

get pods -o wide:
Shows Pod readiness, restarts, IPs, and node placement.

get svc:
Shows the stable Service and exposed port.

get endpoints:
Shows whether the Service has ready Pod backends.

get hpa:
Shows scaling configuration and whether metrics are available.

get events:
Shows scheduling, image pull, probe, and runtime warnings.
```

## Test Traffic

Port-forward the Service:

```bash
kubectl port-forward -n request-tracing-lab svc/request-tracing-lab 8080:80
```

Call the app:

```bash
curl -i http://127.0.0.1:8080/health
```

Expected:

```text
HTTP/1.1 200 OK
X-Request-ID is present
JSON body reports healthy
```

Then inspect logs:

```bash
kubectl logs -n request-tracing-lab deploy/request-tracing-lab
```

Kubernetes probe traffic looks like:

```text
user_agent=kube-probe/1.35
```

Your curl traffic uses a different user agent and can be correlated with `X-Request-ID`.

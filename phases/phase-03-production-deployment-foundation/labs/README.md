# Phase 3 Labs

These labs build the production deployment skillset for the same Flask app.

Use this directory for prompts and completion standards. Put completed evidence, commands, screenshots, request IDs, conclusions, and reflections in `AnswersByGetty/phase-03-production-deployment-foundation/`.

## Lab 1: Container Readiness

Goal:

```text
Prove the app can run with production-style runtime configuration before building an image.
```

Practice:

* Run the app with `FLASK_RUN_HOST=0.0.0.0`.
* Move secrets into environment variables.
* Confirm `/health` works on the configured port.
* Confirm logs still include request IDs.
* Explain why binding to `127.0.0.1` breaks container reachability.

Completion standard:

```text
You can prove the app runs outside local defaults and explain which settings belong in runtime configuration.
```

## Lab 2: Container Packaging

Goal:

```text
Build and run the Flask app as a repeatable container image.
```

Practice:

* Build the image from the project `Dockerfile`.
* Exclude local-only files with `.dockerignore`.
* Run the container with environment variables.
* Test the containerized `/health` endpoint.
* Inspect logs from the running container.

Completion standard:

```text
You can explain the difference between image build, container runtime, host port, container port, environment variable, and container logs.
```

## Lab 3: Kubernetes Manifests

Goal:

```text
Deploy the same containerized Flask app with Kubernetes manifests.
```

Use:

```text
phases/phase-03-production-deployment-foundation/manifests/
```

Practice:

* Create a namespace.
* Inject secrets at runtime.
* Run multiple replicas with a Deployment.
* Route traffic through a Service and Ingress.
* Use readiness and liveness probes.
* Define basic resource requests and limits.
* Inspect which pod handled a request.

Completion standard:

```text
You can trace a request from client to Ingress to Service to Endpoint to Pod to Flask logs.
```

## Lab 4: Helm Release Thinking

Goal:

```text
Understand how deployment configuration becomes repeatable across environments.
```

Practice:

* Identify which values should be configurable.
* Render manifests before applying them.
* Inspect deployed values and manifests.
* Explain how a bad value can break image pulls, service routing, probes, secrets, or ingress.
* Define the rollback plan.

Completion standard:

```text
You can explain what changed between releases and how to roll back safely.
```

## Lab 5: Structured Deployment Troubleshooting

Goal:

```text
Diagnose a failed deployment by layer instead of jumping to random commands.
```

Investigation order:

```text
Client symptom
Ingress
Service
Endpoints
Deployment
ReplicaSet
Pod
Container
Application logs
```

Completion standard:

```text
You can say where the request stopped and name the evidence that proves it.
```

## Lab 6: Break And Diagnose

Goal:

```text
Inject realistic deployment failures and explain the evidence.
```

Scenarios:

* Bad image tag
* Missing or wrong secret
* Failed readiness probe
* Service selector mismatch
* Wrong target port
* Application exception after a successful deployment
* One replica running the wrong version

Completion standard:

```text
You can distinguish platform failure from application failure and describe the safest mitigation.
```

## Lab 7: Production Readiness

Goal:

```text
Evaluate whether the deployment is ready to operate.
```

Checklist:

* Health and readiness checks exist.
* Secrets are not baked into images.
* Logs go to stdout/stderr.
* Request IDs appear in logs.
* Resource requests and limits exist.
* Rollback path is known.
* Common failure runbook exists.
* Customer impact can be explained clearly.

Completion standard:

```text
You can explain what makes the service deployable, observable, and supportable.
```

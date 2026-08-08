# Phase 3 — Containerized Systems & Kubernetes Troubleshooting

Phase 3 is the homepage for the containerized systems and Kubernetes troubleshooting portion of the lab.

Start here before opening individual folders. This page explains where Phase 2 left the system, what Phase 3 changes, which files belong to each lab, and where to record evidence.

## Where You Are Coming From

Phase 2 focused on tracing service boundaries. By the end of that phase, the application was no longer just a Flask process receiving direct client traffic. It had a reverse proxy, durable data, temporary/cache behavior, and service-boundary failure evidence.

```mermaid
flowchart TD
    Client["Client / Browser / curl"] --> NGINX["NGINX reverse proxy"]
    NGINX --> App["Flask application"]
    App --> PostgreSQL["PostgreSQL durable state"]
    App --> Redis["Redis temporary state / cache"]
    App --> Async["Async or service-boundary paths introduced in Phase 2"]
```

By this point, the learner should understand:

- the application request path;
- reverse proxy behavior;
- durable state versus temporary state;
- dependency failures;
- application-level health/readiness;
- evidence-first troubleshooting;
- service boundaries.

Phase 3 does not replace those concepts. It places the same system inside containers and Kubernetes, which introduces new boundaries between the client and the application.

## What Changes In Phase 3

The application behavior is familiar. The new learning problem is understanding what Docker and Kubernetes add between these boundaries and what evidence those layers expose when something fails.

```mermaid
flowchart LR
    Phase2["Phase 2 service architecture"] --> Docker["Docker/container architecture"]
    Docker --> Kubernetes["Kubernetes architecture"]
```

## Show What Docker Changed

The logical application relationships are mostly the same. Docker introduces new runtime and networking boundaries around those components.

### End Of Phase 2

```text
Client
  ↓
NGINX
  ↓
Application
  ├── Redis
  └── PostgreSQL
```

### Phase 3 Docker Stage

```text
Client
  ↓
host/published port
  ↓
NGINX container
  ↓
Docker network
  ↓
Application container
  ├── Redis container
  └── PostgreSQL container
```

Containerization did not create a different application architecture. It changed how the components are packaged, addressed, started, networked, configured, and observed.

## Docker Container Architecture

This is the Docker Compose architecture implemented in [docker-compose.yml](docker-compose.yml) and [docker/nginx.conf](docker/nginx.conf).

```mermaid
flowchart LR
    Client["Browser / curl"]
    Host["Host published port<br/>127.0.0.1:8080"]
    Network["Docker bridge network<br/>request-tracing"]
    NGINX["nginx container<br/>nginx:1.27-alpine<br/>container port 80"]
    API["api container<br/>request-tracing-lab:phase3-compose<br/>container port 5001"]
    Redis["redis container<br/>redis:7-alpine<br/>redis:6379"]
    DB["postgres container<br/>postgres:16-alpine<br/>postgres:5432"]
    Volume["postgres-data volume"]

    Client -->|"HTTP"| Host
    Host -->|"published port 8080:80"| NGINX
    NGINX -->|"Docker DNS api + HTTP :5001"| API
    API -->|"REDIS_URL redis://redis:6379/0"| Redis
    API -->|"DATABASE_URL postgres:5432"| DB
    DB -->|"persistent database files"| Volume
    NGINX -.-> Network
    API -.-> Network
    Redis -.-> Network
    DB -.-> Network
```

### Client → Host / Published Port

The client reaches the Compose stack through the host-facing published port. In this repo, Compose publishes host port `8080` to the NGINX container's port `80`:

```yaml
ports:
  - "8080:80"
```

A browser or curl request to `http://127.0.0.1:8080` enters Docker through that published port.

### Host → NGINX Container

The host does not talk directly to the Flask container in the Compose stack. The host-facing entry point is the NGINX container. Docker forwards traffic from host port `8080` to container port `80`, where NGINX listens.

### NGINX → API Container

NGINX reaches the application through Docker bridge networking and Docker DNS. The NGINX config points to the Compose service name `api` on port `5001`:

```nginx
upstream request_tracing_api {
    server api:5001;
}
```

Inside the NGINX container, `localhost` would mean the NGINX container itself, not the Flask API container. The correct internal address is the Docker service name `api`.

### API → Redis / PostgreSQL

The API container reaches dependencies through Docker DNS service names:

```text
REDIS_URL=redis://redis:6379/0
DATABASE_URL=postgresql://request_lab:request_lab@postgres:5432/request_tracing_lab
```

`redis` resolves to the Redis container on the Docker network. `postgres` resolves to the PostgreSQL container. PostgreSQL data is stored in the `postgres-data` volume so durable database files are not tied only to the ephemeral container filesystem.

## New Failure Boundaries Added By Containers

Containers add new questions around the Phase 2 system:

- Did the image build correctly?
- Did the container start?
- Is the application process still running?
- Is the correct port exposed?
- Is the correct host port published?
- Is the application listening on `0.0.0.0` rather than only localhost?
- Are the containers on the same Docker network?
- Does Docker DNS resolve the expected service name?
- Is NGINX pointing to the correct container hostname and port?
- Can the API container reach Redis?
- Can the API container reach PostgreSQL?
- Is required configuration present?
- Is a volume mounted correctly?
- Is persistent data stored outside the ephemeral container filesystem?

These are new boundaries added around the Phase 2 system. A request can now fail because the application is broken, or because the container image, process, port, network, DNS name, dependency URL, or volume wiring is wrong.

## Kubernetes Architecture

Kubernetes keeps the containerized application idea, then adds cluster objects that manage workload creation and traffic routing.

### Kubernetes Traffic Path

This is the traffic path represented by the manifests in [kubernetes/](kubernetes/). The Service is named `request-tracing-lab`, listens on port `80`, and targets the application container's named `http` port, which maps to container port `5001`.

```mermaid
flowchart LR
    Client["Client"]
    Ingress["Ingress<br/>host request-tracing-lab.local"]
    Service["Service<br/>request-tracing-lab:80"]
    EndpointSlice["EndpointSlice<br/>ready Pod addresses"]
    Pod["Ready Pod<br/>app label selected by Service"]
    App["Application container<br/>request-tracing-lab:local<br/>container port 5001"]
    Dependencies["Dependencies<br/>Redis / PostgreSQL"]

    Client -->|"HTTP host/path"| Ingress
    Ingress -->|"backend service request-tracing-lab:80"| Service
    Service -->|"selector app.kubernetes.io/name=request-tracing-lab"| EndpointSlice
    EndpointSlice -->|"ready endpoint"| Pod
    Pod -->|"container port http / 5001"| App
    App -->|"REDIS_URL / DATABASE_URL"| Dependencies
```

A Kubernetes Service routes to Ready Pod endpoints, not to the Deployment object directly. If there are no ready endpoints, the Service has nowhere useful to send traffic.

### Kubernetes Management Path

```mermaid
flowchart LR
    Deployment["Deployment<br/>request-tracing-lab"] --> ReplicaSet["ReplicaSet"] --> Pod["Pod replicas"]
```

The management path answers whether Kubernetes created the workload. The traffic path answers whether a request can reach a healthy workload.

# Phase 3 Index

Use this table as the navigation map for the phase.

| Resource | Purpose | When To Use It |
| --- | --- | --- |
| [README.md](README.md) | Phase overview, architecture progression, study workflow, and navigation. | Start here. |
| [LABS.md](LABS.md) | Canonical Phase 3 exercises, requirements, failures, evidence prompts, and completion standards. | Follow labs in order. |
| [architecture/](architecture/) | Request-path and system architecture references for Docker, Kubernetes, and dependencies. | Before and during troubleshooting. |
| [docker/](docker/) | Docker notes, NGINX config, and database initialization used by container labs. | Labs 01-04. |
| [docker-compose.yml](docker-compose.yml) | Local full-stack Compose runtime for NGINX, Flask, PostgreSQL, and Redis. | Lab 04 and local full-stack validation. |
| [kubernetes/](kubernetes/) | Kubernetes manifests for namespace, config, secret example, Deployment, Service, Ingress, HPA, and NetworkPolicy. | Labs 05-07. |
| [helm/](helm/) | Helm chart and release-management materials. | Lab 08 and release troubleshooting. |
| [challenges/](challenges/) | Unknown-root-cause troubleshooting scenarios. | After guided exercises. |
| [runbooks/](runbooks/) | Repeatable troubleshooting procedures for common container/Kubernetes incidents. | During review, challenge work, or recurring failures. |
| [scripts/diagnose-service-routing.sh](scripts/diagnose-service-routing.sh) | Diagnostic helper that collects Service selector, Pods, readiness, EndpointSlices, ports, and recent events. | Lab 08 or Service-routing incidents. |
| [worksheets/](worksheets/) | Structured Kubernetes investigation worksheet. | During challenge investigations. |
| [../../AnswersByGetty/phase-03.md](../../AnswersByGetty/phase-03.md) | Execution and evidence companion for Phase 3. | Open side by side with `LABS.md`. |

## How To Study This Phase

Open `LABS.md` and `AnswersByGetty/phase-03.md` side by side.

```text
1. Read the relevant lab in LABS.md.
        ↓
2. Review its architecture/request path.
        ↓
3. Open the implementation files used by that lab.
        ↓
4. Establish the healthy baseline.
        ↓
5. Capture evidence.
        ↓
6. Introduce the guided failure.
        ↓
7. Troubleshoot from the symptom.
        ↓
8. Complete the challenge version without knowing the root cause.
        ↓
9. Compare or update AnswersByGetty/phase-03.md.
        ↓
10. Review or create the relevant runbook.
        ↓
11. Ask whether repetitive evidence collection should be automated.
```

Do not run commands as a reflex. Each command should answer a boundary question.

## LABS And AnswersByGetty

`LABS.md` is the canonical exercise specification. `AnswersByGetty/phase-03.md` is the execution and evidence companion. Their lab numbers, requirement numbers, failure sections, evidence sections, and troubleshooting sections intentionally map to each other so they can be followed side by side.

```text
LABS.md                         AnswersByGetty/phase-03.md

Lab 05                         Lab 05
Requirement 1  ──────────────> Requirement 1 walkthrough
Requirement 2  ──────────────> Requirement 2 walkthrough
Failure A      ──────────────> Failure A evidence
Checklist      ──────────────> Checklist reasoning
```

If evidence has not been captured yet, the answer file should say `Not yet captured` or `Manual validation required` rather than inventing output.

## Folder Navigation By Lab

| Lab | Primary files/resources |
| --- | --- |
| 01 | [LABS.md](LABS.md#lab-01-images-dockerfiles--buildruntime-boundaries), root [Dockerfile](../../Dockerfile), root [.dockerignore](../../.dockerignore), [docker/](docker/), [architecture/docker-request-path.md](architecture/docker-request-path.md), [AnswersByGetty/phase-03.md](../../AnswersByGetty/phase-03.md#lab-01-images-dockerfiles--buildruntime-boundaries) |
| 02 | [LABS.md](LABS.md#lab-02-runtime-configuration-ports-processes--filesystem), root [Dockerfile](../../Dockerfile), [docker/](docker/), [AnswersByGetty/phase-03.md](../../AnswersByGetty/phase-03.md#lab-02-runtime-configuration-ports-processes--filesystem) |
| 03 | [LABS.md](LABS.md#lab-03-docker-networking-dns--container-health), [docker/](docker/), [architecture/docker-request-path.md](architecture/docker-request-path.md), [challenges/](challenges/), [AnswersByGetty/phase-03.md](../../AnswersByGetty/phase-03.md#lab-03-docker-networking-dns--container-health) |
| 04 | [LABS.md](LABS.md#lab-04-docker-compose-full-stack-operations), [docker-compose.yml](docker-compose.yml), [docker/nginx.conf](docker/nginx.conf), [docker/init/002_request_notes.sql](docker/init/002_request_notes.sql), [AnswersByGetty/phase-03.md](../../AnswersByGetty/phase-03.md#lab-04-docker-compose-full-stack-operations) |
| 05 | [LABS.md](LABS.md#lab-05-kubernetes-workloads--traffic-path-troubleshooting), [kubernetes/](kubernetes/), [architecture/kubernetes-paths.md](architecture/kubernetes-paths.md), [challenges/](challenges/), [AnswersByGetty/phase-03.md](../../AnswersByGetty/phase-03.md#lab-05-kubernetes-workloads--traffic-path-troubleshooting) |
| 06 | [LABS.md](LABS.md#lab-06-readiness-dependencies-dns-config--resource-failures), [kubernetes/](kubernetes/), [architecture/dependency-path.md](architecture/dependency-path.md), [runbooks/](runbooks/), [AnswersByGetty/phase-03.md](../../AnswersByGetty/phase-03.md#lab-06-readiness-dependencies-dns-config--resource-failures) |
| 07 | [LABS.md](LABS.md#lab-07-rollouts-releases-rollback--persistent-state), [kubernetes/](kubernetes/), [runbooks/rollback-deployment.md](runbooks/rollback-deployment.md), [AnswersByGetty/phase-03.md](../../AnswersByGetty/phase-03.md#lab-07-rollouts-releases-rollback--persistent-state) |
| 08 | [LABS.md](LABS.md#lab-08-helm-complex-incident-runbook--diagnostic-automation), [helm/](helm/), [challenges/](challenges/), [runbooks/](runbooks/), [scripts/diagnose-service-routing.sh](scripts/diagnose-service-routing.sh), [AnswersByGetty/phase-03.md](../../AnswersByGetty/phase-03.md#lab-08-helm-complex-incident-runbook--diagnostic-automation) |

## Canonical Labs

| Lab | Focus | Start |
| --- | --- | --- |
| 01 | Images, Dockerfiles, and build/runtime boundaries | [Lab 01](LABS.md#lab-01-images-dockerfiles--buildruntime-boundaries) |
| 02 | Runtime configuration, ports, processes, and filesystem | [Lab 02](LABS.md#lab-02-runtime-configuration-ports-processes--filesystem) |
| 03 | Docker networking, DNS, and container health | [Lab 03](LABS.md#lab-03-docker-networking-dns--container-health) |
| 04 | Docker Compose full-stack operations | [Lab 04](LABS.md#lab-04-docker-compose-full-stack-operations) |
| 05 | Kubernetes workloads and traffic-path troubleshooting | [Lab 05](LABS.md#lab-05-kubernetes-workloads--traffic-path-troubleshooting) |
| 06 | Readiness, dependencies, DNS, config, and resource failures | [Lab 06](LABS.md#lab-06-readiness-dependencies-dns-config--resource-failures) |
| 07 | Rollouts, releases, rollback, and persistent state | [Lab 07](LABS.md#lab-07-rollouts-releases-rollback--persistent-state) |
| 08 | Helm, complex incident, runbook, and diagnostic automation | [Lab 08](LABS.md#lab-08-helm-complex-incident-runbook--diagnostic-automation) |

## Troubleshooting Method

Every major lab uses the same investigation loop:

```text
Symptom
  ↓
Expected request path
  ↓
Known-good boundaries
  ↓
First unknown boundary
  ↓
Evidence
  ↓
Hypothesis
  ↓
Test
  ↓
Root cause
  ↓
Fix / mitigation
  ↓
Validation
  ↓
Prevention / runbook / automation
```

## Architecture Visualization Standard

Prefer Mermaid for instructional diagrams, request paths, troubleshooting flows, component relationships, and architecture evolution because these diagrams remain version-controlled, editable, and synchronized with the implementation.

Use PNG architecture diagrams only when a visual requires detail that Mermaid cannot communicate cleanly, such as complex cloud topology or provider-specific infrastructure diagrams. Do not maintain duplicate Mermaid and PNG versions of the same diagram unless there is a clear learning reason, because duplicate diagrams can drift out of sync.

## Phase 3 Scope

Phase 3 stays focused on local Docker, Docker Compose, Kubernetes application troubleshooting, Helm packaging, runbooks, and diagnostic evidence. Broader cloud, observability-platform, infrastructure-as-code, and capacity-planning topics are intentionally deferred to later phases.

## Completion Standard

By the end of Phase 3, the learner should be able to explain the expected request path, identify what evidence each boundary exposes, find where behavior first diverged, prove the root cause, restore service safely, and make the next investigation easier.

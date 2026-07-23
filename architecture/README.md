# Architecture and Expansion Scenarios

Complete these exercises after finishing the request-tracing and failure-injection phases.

Draw each architecture before implementing it.

For every design, explain:

```text
How does the request move?

Where does TLS terminate?

How is identity propagated?

How are request IDs propagated?

What new failure points exist?

Which logs and metrics would expose those failures?
```

---

## Architecture Exercise 1: Add PostgreSQL

### Scenario

User profile data should no longer be hard-coded or stored in application memory.

Add PostgreSQL.

### Starting design

```text
Browser or curl
       |
       v
Flask application
       |
       v
PostgreSQL
```

### Tasks

1. Draw the complete request path for retrieving a user profile.
2. Decide where PostgreSQL should run.
3. Decide how Flask receives database credentials.
4. Decide whether the database connection uses TLS.
5. Identify how connection pooling should work.
6. Decide how secrets should be stored.
7. Explain how the application handles unavailable or slow database connections.
8. Identify the logs and metrics required for troubleshooting.

### Questions

```text
Where does the application authenticate to PostgreSQL?

Should database credentials be committed to Git?

What happens when the database is unavailable?

What status should the client receive?

How would a database timeout differ from an authentication failure?

Which component should log the failed query or connection?

Which metrics would reveal connection-pool exhaustion?
```

### Draw your design

```text







```

### Trace one request

```text
1.

2.

3.

4.

5.

6.
```

### Failure points

| Component or connection | Possible failure | Client symptom | Evidence to collect |
| ----------------------- | ---------------- | -------------- | ------------------- |
| Flask → PostgreSQL      |                  |                |                     |
| Database authentication |                  |                |                     |
| Query execution         |                  |                |                     |
| Connection pool         |                  |                |                     |

### Design conclusion

```text
Authentication method:

Secret storage:

TLS decision:

Client behavior during failure:

Required logs:

Required metrics:
```

---

## Architecture Exercise 2: Add Nginx

### Scenario

Clients should no longer connect directly to Flask.

Place Nginx in front of the application.

### Starting design

```text
Browser or curl
       |
       v
Nginx
       |
       v
Flask application
```

### Tasks

1. Decide which component listens on the public port.
2. Decide where TLS terminates.
3. Configure or describe upstream communication.
4. Preserve the original client IP.
5. Preserve the original protocol and host.
6. Propagate the request ID.
7. Define health-check behavior.
8. Identify conditions that could produce `502`, `503`, or `504`.

### Questions

```text
Which ports does Nginx listen on?

Which port does Flask listen on?

Can Flask remain private?

Which headers preserve the client address and original protocol?

Who creates the request ID?

What happens if Flask is stopped?

What happens if Flask responds too slowly?

Which logs show whether Nginx reached the upstream?
```

### Draw your design

```text







```

### Trace one request

```text
1.

2.

3.

4.

5.

6.
```

### Failure points

| Component or connection | Possible failure | Client symptom | Evidence to collect |
| ----------------------- | ---------------- | -------------- | ------------------- |
| Client → Nginx          |                  |                |                     |
| TLS at Nginx            |                  |                |                     |
| Nginx → Flask           |                  |                |                     |
| Upstream timeout        |                  |                |                     |

### Design conclusion

```text
Public listener:

TLS termination:

Upstream address:

Client-IP preservation:

Request-ID strategy:

Possible cause of 502:

Possible cause of 504:
```

---

## Architecture Exercise 3: Add Multiple Flask Instances

### Scenario

One Flask process should no longer be the only application instance.

### Starting design

```text
                         +--> Flask instance 1
Client --> Load balancer |
                         +--> Flask instance 2
```

### Tasks

1. Choose a load-balancing method.
2. Define health checks.
3. Decide how unhealthy instances are removed.
4. Explain how request IDs reach every instance.
5. Decide where session state is stored.
6. Explain why instance-local memory becomes unreliable.
7. Decide whether sticky sessions are required.
8. Explain how deployments avoid dropping all capacity.

### Questions

```text
How does the load balancer choose an instance?

What makes an instance healthy?

How quickly should failed instances be removed?

What happens to an in-memory session when the next request reaches another instance?

Would Redis remove the need for sticky sessions?

What happens when one instance returns errors while the other is healthy?

How would logs identify which instance handled a request?
```

### Draw your design

```text







```

### Trace one request

```text
1.

2.

3.

4.

5.

6.
```

### Failure points

| Component or connection | Possible failure | Client symptom | Evidence to collect |
| ----------------------- | ---------------- | -------------- | ------------------- |
| Load balancer           |                  |                |                     |
| Flask instance 1        |                  |                |                     |
| Flask instance 2        |                  |                |                     |
| Shared session storage  |                  |                |                     |

### Design conclusion

```text
Load-balancing method:

Health-check endpoint:

Session-storage decision:

Sticky-session decision:

Instance identification in logs:

Deployment strategy:
```

---

## Architecture Exercise 4: Add Redis Sessions

### Scenario

Session state must be shared between multiple application instances.

### Starting design

```text
                         +--> Flask instance 1 --+
Client --> Load balancer |                       |
                         +--> Flask instance 2 --+--> Redis
```

### Tasks

1. Move session state outside Flask process memory.
2. Decide how Flask authenticates to Redis.
3. Decide whether Redis traffic uses TLS.
4. Define session expiration.
5. Decide what happens when Redis is unavailable.
6. Identify the metrics required for capacity and latency.
7. Determine whether Redis is now a single point of failure.

### Questions

```text
Where is the session identifier stored?

Where is the session data stored?

Can both Flask instances read the same session?

What happens when Redis is slow?

What happens when Redis restarts?

How should session expiration be enforced?

How could Redis be made highly available?
```

### Draw your design

```text







```

### Design conclusion

```text
Session identifier location:

Session data location:

Authentication method:

TLS decision:

Expiration strategy:

Failure behavior:

High-availability strategy:
```

---

## Architecture Exercise 5: Design for High Availability

### Scenario

A single application, proxy, cache, or database failure should not make the entire service unavailable.

### Include

```text
Load balancer
Multiple application instances
Health checks
Shared session storage
Highly available database
Monitoring
Centralized logs
```

### Tasks

1. Identify every current single point of failure.
2. Add redundancy where appropriate.
3. Define health and readiness checks.
4. Decide how traffic is rerouted.
5. Define database backup and failover.
6. Define Redis availability.
7. Define how configuration and secrets are distributed.
8. Define monitoring and alerting.

### Draw your design

```text














```

### Questions

```text
How are unhealthy application instances detected?

Where is session state stored?

What happens if the load balancer fails?

What happens if Redis fails?

What happens if the primary database fails?

Which components span multiple availability zones?

What is still a single point of failure?

What would you improve next?
```

### Failure analysis

| Failure                          | Expected system behavior | User impact | Detection method |
| -------------------------------- | ------------------------ | ----------- | ---------------- |
| One Flask instance fails         |                          |             |                  |
| Redis primary fails              |                          |             |                  |
| Database primary fails           |                          |             |                  |
| One availability zone fails      |                          |             |                  |
| Load balancer health check fails |                          |             |                  |

---

## Architecture Exercise 6: Containerize the Application

### Scenario

Run the application in a Docker container.

### Starting design

```text
Client
  |
  v
Host port
  |
  v
Container port
  |
  v
Flask application
```

### Tasks

1. Create or design a Dockerfile.
2. Choose the container port.
3. Map the host port.
4. Pass configuration through environment variables.
5. Add a health check.
6. Decide how logs leave the container.
7. Ensure secrets are not baked into the image.
8. Decide whether the process runs as root.

### Questions

```text
Which address must Flask bind to inside the container?

What is the difference between a host port and container port?

Where should application logs be written?

How should configuration reach the container?

What happens if the container is running but Flask is unhealthy?

How would you inspect container networking and logs?
```

### Draw your design

```text







```

### Failure points

| Failure                      | Client symptom | Command or evidence |
| ---------------------------- | -------------- | ------------------- |
| Incorrect port mapping       |                |                     |
| Flask bound only to loopback |                |                     |
| Missing environment variable |                |                     |
| Container exits              |                |                     |
| Failed health check          |                |                     |

---

## Architecture Exercise 7: Deploy to Kubernetes

### Scenario

Deploy the containerized application to Kubernetes.

For a hands-on version that includes packaging the app, creating manifests, converting to Helm, and troubleshooting failures, use:

```text
architecture/kubernetes-helm/README.md
```

### Starting design

```text
Client
  |
  v
Ingress
  |
  v
Service
  |
  v
Pod
  |
  v
Flask container
```

### Tasks

1. Define the Deployment.
2. Define the Service.
3. Add readiness and liveness probes.
4. Add an Ingress.
5. Decide where TLS terminates.
6. Configure application secrets.
7. Decide how logs and metrics are collected.
8. Ensure request IDs pass through the Ingress.
9. Define scaling behavior.
10. Identify network-policy requirements.

### Questions

```text
How does the Service discover healthy Pods?

What happens when a readiness probe fails?

What happens when a liveness probe fails?

What can cause an Ingress 502 or 503?

How does Kubernetes DNS affect internal requests?

Which commands would you use to inspect Pods, Services, Endpoints, and logs?

How would you determine which Pod handled a request?
```

### Draw your design

```text














```

### Troubleshooting table

| Symptom                       | Possible layer | Evidence or command |
| ----------------------------- | -------------- | ------------------- |
| Ingress returns 404           |                |                     |
| Ingress returns 502           |                |                     |
| Service has no endpoints      |                |                     |
| Pod is not ready              |                |                     |
| Pod is restarting             |                |                     |
| Internal DNS fails            |                |                     |
| Network policy blocks traffic |                |                     |

---

## Architecture Exercise 8: Package and Operate with Helm

### Scenario

The Kubernetes deployment should be repeatable across local, staging, and production environments.

Package the application with Helm so environment-specific settings can be managed through values.

### Starting design

```text
Container image
  |
  v
Helm chart + values
  |
  v
Rendered Kubernetes manifests
  |
  v
Deployment, Service, Ingress, Secret, HPA, NetworkPolicy
```

### Tasks

1. Decide which Kubernetes settings should become Helm values.
2. Create a chart from the working Kubernetes manifests.
3. Create local values for a local cluster.
4. Describe what would differ in staging and production values.
5. Render the chart before applying it.
6. Install or upgrade the release.
7. Inspect release history, rendered manifests, and active values.
8. Roll back a bad release.
9. Break one value intentionally and diagnose the resulting failure.

### Questions

```text
Which settings change between environments?

Which settings should never be committed to Git?

How do you preview rendered manifests before deployment?

How do you inspect values used by a live release?

How can a wrong image tag, probe path, service targetPort, or selector break the deployment?

How do you roll back a bad release?

How does Helm help production operations?

How can Helm make production operations riskier if values are poorly managed?
```

### Useful commands

```bash
helm template request-tracing-lab ./helm/request-tracing-lab
helm upgrade --install request-tracing-lab ./helm/request-tracing-lab -n request-tracing-lab --create-namespace
helm status request-tracing-lab -n request-tracing-lab
helm get values request-tracing-lab -n request-tracing-lab
helm get manifest request-tracing-lab -n request-tracing-lab
helm history request-tracing-lab -n request-tracing-lab
helm rollback request-tracing-lab <revision> -n request-tracing-lab
```

### Design conclusion

```text
Values strategy:

Secret strategy:

Promotion strategy:

Rollback strategy:

Most likely Helm-related failure:

Evidence that would expose it:
```

---

## Architecture Exercise 9: Add Distributed Tracing

### Scenario

The request now crosses multiple services.

### Request path

```text
Browser
  |
  v
Load balancer or Ingress
  |
  v
API service
  |
  v
Authentication service
  |
  v
Database
```

### Tasks

1. Decide where the trace begins.
2. Define how trace context is propagated.
3. Identify the spans created by each component.
4. Add useful span attributes.
5. Identify where errors are recorded.
6. Decide how logs correlate with traces.
7. Define how to locate the slowest span.
8. Decide what information must not be added to traces.

### Questions

```text
Where is the trace ID created?

Does the request ID equal the trace ID?

How is trace context passed between services?

Which component creates each span?

Which span includes database timing?

How would you identify the slowest component?

How would you locate logs for one span?

What sensitive information should be excluded?
```

### Draw the trace

```text
Trace ID:

Root span:


Child spans:

1.

2.

3.

4.

5.
```

### Span table

| Span                   | Parent | Important attributes | Possible error |
| ---------------------- | ------ | -------------------- | -------------- |
| Incoming HTTP request  |        |                      |                |
| Load balancer or proxy |        |                      |                |
| API processing         |        |                      |                |
| Authentication request |        |                      |                |
| Database query         |        |                      |                |

### Design conclusion

```text
Trace starts at:

Propagation method:

Expected spans:

Log-correlation strategy:

Method for locating latency:

Sensitive fields to exclude:
```

---

## Architecture Exercise 10: Split into Microservices

### Scenario

Split the application into separate services such as authentication, profile, and audit logging.

The earlier PostgreSQL, Nginx, multiple-instance, Redis, Kubernetes, and Helm exercises already cover the foundation of a layered production application. This exercise focuses on what changes when one application becomes multiple independently deployed services.

### Starting design

```text
Client
  |
  v
Ingress or API gateway
  |
  v
Auth service
  |
  v
Profile service
  |
  v
Database
```

### Synchronous request questions

```text
Which service receives the first request?

How is identity passed between services?

How are request IDs and trace IDs propagated?

What happens if one downstream service is slow or unavailable?

Which service owns each log line?

How would you tell whether the failure is in the gateway, auth service, profile service, or database?
```

### Event-driven sub-scenario

Add an asynchronous workflow, such as publishing a login audit event after successful authentication.

```text
Client
  |
  v
API gateway
  |
  v
Auth service
  |
  v
Message broker or queue
  |
  v
Audit worker
  |
  v
Audit store
```

### Event-driven questions

```text
Which part of the request remains synchronous?

Which work happens after the client already received a response?

How do you trace one request across an event or queue?

What evidence proves the event was published?

What evidence proves the worker processed it?

What happens when the worker is down?

What happens when the broker has a backlog?
```

### Design conclusion

```text
Service boundaries:

Synchronous request path:

Asynchronous event path:

Identity propagation:

Request ID propagation:

Trace ID propagation:

Logs needed:

Metrics needed:
```

---

# Final Architecture Challenge

Design the complete production-style version of the request-tracing application.

Use this challenge to reason through a larger customer environment like a virtual appliance, managed platform, or enterprise SaaS service. This is where you practice the support-to-engineering thinking expected in Customer Success Engineering roles.

Your design may include:

```text
DNS
TLS
Load balancer
Nginx or Ingress
Multiple application instances
Authentication
Redis
PostgreSQL
Centralized logs
Metrics
Distributed traces
Alerts
Microservices
Event-driven workflows
Customer network or virtual appliance boundary
```

## Draw the architecture

```text


















```

## Trace one successful request

```text
1.

2.

3.

4.

5.

6.

7.

8.

9.

10.
```

## Trace one failed request

Choose one failure:

```text
DNS failure
TCP connection failure
TLS trust failure
Load-balancer failure
Unhealthy application instance
Authentication failure
Redis failure
Database timeout
Application exception
```

Then explain:

```text
Failure selected:

Deepest successful layer:

Failure layer:

Client symptom:

HTTP status, if any:

Request ID:

Trace ID:

Relevant logs:

Relevant metrics:

Relevant trace spans:

Immediate mitigation:

Long-term fix:
```

---

# Completion Reflection

Answer these questions after completing the request-tracing workbook and architecture scenarios.

```text
1. How do you separate a connection failure from an HTTP failure?


2. How do you determine whether a request reached the application?


3. How do request IDs help correlate client and server evidence?


4. How do session cookies differ from bearer tokens?


5. How do you distinguish authentication failure from application failure?


6. How do you identify whether latency occurred in DNS, TCP, TLS, the application, or a dependency?


7. What evidence proves that a 500 error occurred inside the application?


8. How does adding a reverse proxy change the request path?


9. How does adding multiple instances affect session state and troubleshooting?


10. How do logs, metrics, and traces complement one another?


11. What information belongs in an escalation to Engineering?


12. What troubleshooting step do you take before forming a conclusion?
```

---

# Completion Criteria

You have completed the labs when you can consistently answer:

```text
What request was sent?

How far did the request travel?

Which layers succeeded?

Where did the failure occur?

What evidence proves the conclusion?

Which tool exposed that evidence?

Which component owns the failure?

What should be investigated next?

How would the answer change in a larger architecture?
```

The goal is not to memorize Flask routes or curl commands.

The goal is to develop a repeatable, evidence-based method for tracing and troubleshooting requests across increasingly complex systems.

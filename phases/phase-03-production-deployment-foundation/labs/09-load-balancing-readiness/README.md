# 09: Load Balancing Readiness

Goal:

```text
Explain whether the service can safely receive production traffic through a load balancer.
```

## Scenario

Management wants the app online next week.

The app may run with multiple backend instances behind a load balancer.

Your job is to prove traffic can reach healthy instances, avoid unhealthy ones, and preserve correct application behavior.

## Questions

```text
What kind of load balancer is needed?
Where does TLS terminate?
What targets receive traffic?
What health check path is used?
What status code means healthy?
What happens when one target becomes unhealthy?
How do we prove traffic is distributed?
How do we prove which target handled a request?
Does the app store session state locally?
If yes, what breaks when requests hit different targets?
Are requests safe to retry?
Which endpoints are not safe to retry?
What metrics should alert before customers notice?
```

## Evidence To Collect

```text
Load balancer DNS name:

Target group or backend pool:

Health check path:

Healthy target count:

Unhealthy target evidence:

Request ID:

Target instance or pod:

Load balancer status code:

Target status code:

Target response time:

Retry behavior:

Session behavior:
```

## Failure Scenarios

Test these failure patterns conceptually or in the lab environment:

| Failure | Expected symptom | Evidence |
| --- | --- | --- |
| One target down | Traffic continues to healthy targets | Health status changes, successful requests continue |
| All targets down | Load balancer returns unavailable response | No healthy targets |
| Wrong health check path | Healthy app removed from rotation | Health check status fails while app route works |
| Wrong target port | Load balancer cannot connect | Target connection errors |
| Slow app target | High latency or timeout | Target response time increases |
| Local session state | Login breaks across targets | Different target logs show missing session |
| Unsafe retry | Duplicate write risk | Repeated POST with same request ID/body |

## Completion Standard

You are done when you can explain:

```text
How traffic is balanced.
How health is checked.
How unhealthy targets are removed.
How session state survives multiple targets.
How retries can help reads but harm unsafe writes.
What evidence proves the load balancer or app generated an error.
```

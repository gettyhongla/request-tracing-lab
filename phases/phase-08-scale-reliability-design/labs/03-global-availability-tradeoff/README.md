# Lab 03: Global Availability Tradeoff

## Scenario

The business asks for global availability.

Decide what must be global now, what can remain regional, and what should wait until requirements justify the complexity.

## Goal

Separate straightforward global static delivery from the harder problem of globally available authenticated application behavior.

## Start Practical

Begin with the lower-complexity availability moves:

* Make static assets global through CloudFront.
* Run the app in at least two Availability Zones.
* Use RDS Multi-AZ for regional database availability.
* Use autoscaling for API and worker services.
* Use health checks and rollback for failed deploys.

## Multi-Region Questions

Only discuss multi-region if requirements justify it.

If they do, evaluate:

* Route 53 latency or failover routing
* Multi-region read replicas
* Active-passive API failover
* Data replication and consistency strategy
* Session/token behavior during regional failover
* Queue replay and worker idempotency
* Data residency constraints
* Operational ownership during failover

## Sharp Conclusion To Defend

```text
Global static delivery is straightforward.
Global authenticated application behavior requires explicit decisions about data consistency, failover, sessions, writes, and operational ownership.
```

## Deliverable

Write the completed tradeoff review in:

```text
AnswersByGetty/phase-08-scale-reliability-design/lab-03-global-availability-tradeoff.md
```

Use this shape:

```text
Global requirements:
What should be global now:
What can remain regional:
What should wait:
Data consistency decisions:
Session/token behavior:
Failover behavior:
Operational risks:
Retained takeaway:
```

## Completion Standard

You can separate true global requirements from expensive complexity and explain the tradeoff clearly.

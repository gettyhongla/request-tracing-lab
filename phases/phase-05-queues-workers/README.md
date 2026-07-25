# Phase 5: Queues And Workers

Phase 5 adds asynchronous work so not every customer action finishes inside the original HTTP request.

Focus:

* Job creation
* Queue depth and backlog
* Worker processing
* Failed and stuck jobs
* Retries and duplicate execution
* Idempotency
* Request ID, job ID, and trace correlation
* Eventual consistency and backpressure

Completion standard:

```text
Given a delayed or missing result, prove whether the request failed before job creation, inside the queue, inside the worker, or while storing the final result.
```

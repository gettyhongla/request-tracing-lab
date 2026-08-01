# Lab 09: Workers And Queues

Move slow follow-up work out of the main ticket request.

## Why This Lab Exists

The customer should not wait for long-running notification or diagnostic-summary work before the ticket is saved. The app should commit the ticket synchronously, then queue background work that can finish later.

## Architecture Before

```text
Client -> Flask support-ticket API -> PostgreSQL
```

The user waits for the request response.

## Architecture After

```text
Client
  |
  v
Flask support-ticket API
  |-- PostgreSQL ticket rows
  `-- Redis queue
        |
        v
Background worker
  |
  v
Notification or diagnostic-summary job
```

## Key Terms

| Term | Meaning |
| --- | --- |
| Producer | Code that enqueues work |
| Queue | Temporary holding place for jobs |
| Job/message | Unit of background work |
| Consumer | Code that reads from the queue |
| Worker | Process that performs queued work |
| Acknowledgement | Signal that a job completed |
| Retry limit | Maximum attempts before giving up |
| Failed job | Job that could not complete |
| Dead-letter queue | Place to inspect failed jobs later |
| Queue depth | Number of jobs waiting |
| Backlog | Work piling up faster than workers process it |
| Poison message | Job that always fails |
| At-least-once delivery | Job may run more than once |

## Must Implement Or Inspect

1. Pick one background workflow: notification or diagnostic summary.
2. Ensure ticket creation commits to PostgreSQL first.
3. Enqueue a small job after the ticket is saved.
4. Run one worker process manually.
5. Complete one job.
6. Record queue depth and processing duration.
7. Stop the worker and observe backlog.
8. Fail one job and retry it.
9. Explain duplicate processing and idempotency.

Use Redis Queue or another simple Redis-backed Python worker if no queue exists yet. Do not introduce Kafka.

## Healthy-Path Verification

Capture:

```text
Ticket created:
Job enqueued:
Worker started:
Job completed:
Queue depth before:
Queue depth after:
Processing duration:
Request ID or linked event ID:
```

## Controlled Failures

Test:

```text
Worker stopped:
Queue backlog:
Job failure:
Retry:
Failed job:
Duplicate delivery:
Poison message:
```

## Evidence To Capture

```text
Producer code path:
Queue name:
Job payload:
Worker command:
Queue depth:
Worker log:
Retry evidence:
Failed job evidence:
Duplicate-processing prevention:
Interview explanation:
Retained takeaway:
```

## Troubleshooting Questions

```text
Was the ticket saved even if the worker failed?
Is the queue growing?
Are workers processing jobs?
Which job failed?
Can the same job produce duplicate side effects?
How would you avoid duplicate email or duplicate notifications?
```

## Interview Explanation

```text
The ticket request should save durable data first and return quickly. Background workers handle slower follow-up work from a queue. Queues improve responsiveness, but they introduce backlog, retries, failed jobs, and duplicate-processing risks.
```

## Completion Standard

```text
The learner can explain producer, queue, worker, retries, queue depth, and why async work must be idempotent.
```

## Retained Takeaway

```text
Async means the user request can finish before all work is complete. It is useful, but it creates a second system path that needs its own evidence.
```

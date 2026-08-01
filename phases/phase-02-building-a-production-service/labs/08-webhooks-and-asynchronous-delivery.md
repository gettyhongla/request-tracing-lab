# Lab 08: Webhooks And Asynchronous Delivery

Send support-ticket events to another system when something important happens.

## Why This Lab Exists

An API is when a client asks your app for something. A webhook is when your app tells another system that something happened.

Support-ticket systems often notify external tools when tickets are created, updated, or resolved.

## Architecture Before

```text
Client -> Flask support-ticket API -> PostgreSQL
```

The ticket request commits durable data synchronously.

## Architecture After

```text
Client
  |
  v
Flask support-ticket API
  |-- PostgreSQL ticket/event rows
  `-- webhook delivery attempt
        |
        v
Local webhook receiver
```

## Key Terms

| Term | Meaning |
| --- | --- |
| Webhook producer | The app sending the event |
| Webhook consumer | The receiver handling the callback |
| HTTP callback | Outbound HTTP request triggered by an event |
| Event payload | JSON body describing what happened |
| Event type | Name such as `ticket.created` |
| Event ID | Unique ID for deduplication |
| Signature | Proof the event came from your app |
| Shared secret | Secret used to create and verify a signature |
| Replay protection | Rejecting old or repeated events |
| Retry | Another delivery attempt after failure |
| Dead-letter thinking | Keeping failed events for later inspection |

## API Versus Webhook

```text
API:
A client requests something from the application.

Webhook:
The application sends an event to another system when something happens.
```

## Must Implement Or Inspect

1. Pick one event: `ticket.created` or `ticket.status_changed`.
2. Define a simple event payload.
3. Start a local webhook receiver.
4. Send an event after the ticket change is saved.
5. Include event ID, event type, timestamp, ticket ID, and request ID.
6. Add a shared-secret signature concept.
7. Store or log delivery status.
8. Define retry behavior and when to stop retrying.

## Healthy-Path Verification

Capture:

```text
Ticket action:
Webhook payload:
Receiver log:
Delivery status:
Event ID:
Request ID:
```

## Controlled Failures

Test:

```text
Receiver returns 500:
Receiver times out:
Wrong shared secret:
Duplicate delivery:
Old timestamp replay:
Network connection refused:
```

## Evidence To Capture

```text
Webhook URL:
Event type:
Event ID:
Payload:
Signature header:
Receiver response:
Delivery status:
Retry behavior:
Duplicate handling:
Failure symptom:
Interview explanation:
Retained takeaway:
```

## Troubleshooting Questions

```text
Was the ticket saved before webhook delivery failed?
Did the receiver receive the request?
Was the signature valid?
Was this a new event or a duplicate delivery?
Should the customer request fail because the webhook failed?
Where is the failed delivery recorded?
```

## Interview Explanation

```text
Webhook delivery lets the support-ticket app notify another system after a durable ticket event is saved. The receiver must verify signatures, handle retries, and process duplicate events safely because webhooks are commonly delivered at least once.
```

## Completion Standard

```text
The learner can explain the difference between an API request and a webhook event, and why webhook consumers must be idempotent.
```

## Retained Takeaway

```text
Webhooks are outbound event delivery. They connect systems, but they introduce retries, duplicates, signatures, and delivery evidence.
```

# Lab 07: Request IDs, Logs, And Latency

Make every request traceable.

This lab is where you practice collecting evidence instead of only generating logs.

## Build

1. Ensure every request has an `X-Request-ID`.
2. Make NGINX pass the request ID to Flask.
3. Make Flask include the request ID in responses.
4. Log method, path, status code, request ID, and duration.
5. Add a simple latency measurement for each request.

## Prove

Send one request and capture:

```text
Client response header:
NGINX access log:
Flask log:
Request ID match:
Request duration:
```

## Break

Send one slow request or add a temporary slow endpoint.

Answer:

```text
Where is the latency visible?
Does the request ID connect the client symptom to the server evidence?
What would be hard to prove without the request ID?
```

## Done When

You can trace one request from client to NGINX to Flask using the same request ID.

## Evidence To Capture

```text
Request ID:
Client evidence:
NGINX evidence:
Flask evidence:
Latency measurement:
Slow request evidence:
Interview explanation:
Retained takeaway:
```

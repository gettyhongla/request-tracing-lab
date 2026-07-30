# Failure 06: Server Unavailable

## Scenario

Stop Flask and send a request to the normal application port.

## Trigger The Failure

Stop the app first, then run:

```bash
curl -i \
  -H "X-Request-ID: failure-06-server-unavailable" \
  http://127.0.0.1:5000/health
```

## Evidence To Collect

```text
Client error:
HTTP response received:
X-Request-ID returned:
Matching server log present:
Failed layer:
What this rules out:
```

## Completion Standard

You are done when you can explain the difference between a controlled HTTP error from Flask and a client-side connection failure because no service accepted the request.

## Write Your Answer

Use:

```text
AnswersByGetty/phase-01-single-service-request-tracing/phase-2-inject-and-diagnose-failures/failure-06-server-unavailable.md
```

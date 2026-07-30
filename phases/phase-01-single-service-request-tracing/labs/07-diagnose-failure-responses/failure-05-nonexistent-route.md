# Failure 05: Nonexistent Route

## Scenario

Request a path that the Flask application does not define.

## Trigger The Failure

```bash
curl -i \
  -H "X-Request-ID: failure-05-nonexistent-route" \
  http://127.0.0.1:5000/not-a-real-route
```

## Evidence To Collect

```text
Request method and path:
Response status:
Response body:
X-Request-ID:
Matching server log:
Failed layer:
What this rules out:
```

## Completion Standard

You are done when you can prove the server was reachable but the requested route did not exist.

## Write Your Answer

Use:

```text
AnswersByGetty/phase-01-single-service-request-tracing/phase-2-inject-and-diagnose-failures/failure-05-nonexistent-route.md
```

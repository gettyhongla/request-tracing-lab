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
Requested path:
Client status:
Matching Flask access log:
Failed layer:
What this rules out:
```

## Hint

This is not the same as Flask being down. A `404` means the server answered, but the requested route did not match an application endpoint.

## Completion Standard

You are done when you can prove the server was reachable but the requested route did not exist.

## Write Your Answer

Use:

```text
AnswersByGetty/phase-01-understanding-a-request/phase-2-inject-and-diagnose-failures/failure-05-nonexistent-route.md
```

# Failure 07: Wrong Port

## Scenario

Send the request to a port where the Flask app is not listening.

## Trigger The Failure

```bash
curl -i \
  -H "X-Request-ID: failure-07-wrong-port" \
  http://127.0.0.1:5999/health
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

You are done when you can prove the request did not reach Flask because the client targeted the wrong port.

## Write Your Answer

Use:

```text
AnswersByGetty/phase-01-single-service-request-tracing/phase-2-inject-and-diagnose-failures/failure-07-wrong-port.md
```

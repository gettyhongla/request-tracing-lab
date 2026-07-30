# Failure 02: Missing Session Cookie

## Scenario

Request the session profile endpoint without sending the session cookie created during login.

## Trigger The Failure

```bash
curl -i \
  -H "X-Request-ID: failure-02-missing-session-cookie" \
  http://127.0.0.1:5000/session/profile
```

## Evidence To Collect

```text
Request method and path:
Cookie header present:
Response status:
Response body:
X-Request-ID:
Matching server log:
Failed layer:
What this rules out:
```

## Completion Standard

You are done when you can prove the request reached Flask and was rejected because session state was missing, not because the application was unavailable.

## Write Your Answer

Use:

```text
AnswersByGetty/phase-01-single-service-request-tracing/phase-2-inject-and-diagnose-failures/failure-02-missing-session-cookie.md
```

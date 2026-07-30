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
Cookie evidence:
Client status and error message:
Matching Flask logs:
Failed layer:
What this rules out:
```

## Hint

Focus on whether the client sent session state. The route can be healthy while the request is still unauthorized.

## Completion Standard

You are done when you can prove the request reached Flask and was rejected because session state was missing, not because the application was unavailable.

## Write Your Answer

Use:

```text
AnswersByGetty/phase-01-single-service-request-tracing/phase-2-inject-and-diagnose-failures/failure-02-missing-session-cookie.md
```

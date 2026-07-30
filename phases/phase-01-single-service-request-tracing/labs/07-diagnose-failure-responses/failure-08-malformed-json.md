# Failure 08: Malformed JSON

## Scenario

Submit a login request with a broken JSON body.

## Trigger The Failure

```bash
curl -i \
  -H "Content-Type: application/json" \
  -H "X-Request-ID: failure-08-malformed-json" \
  -d '{"username":"getty","password":' \
  http://127.0.0.1:5000/session/login
```

## Evidence To Collect

```text
Request method and path:
Content-Type header:
Malformed request body:
Response status:
Response body:
X-Request-ID:
Matching server log:
Failed layer:
What this rules out:
```

## Completion Standard

You are done when you can explain how malformed input changes application behavior and what the response proves.

## Write Your Answer

Use:

```text
AnswersByGetty/phase-01-single-service-request-tracing/phase-2-inject-and-diagnose-failures/failure-08-malformed-json.md
```

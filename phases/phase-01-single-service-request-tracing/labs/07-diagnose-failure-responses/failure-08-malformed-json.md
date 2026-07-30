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
Malformed input evidence:
Client status and error message:
Matching Flask logs:
Failed layer:
What this rules out:
```

## Hint

Look for the difference between request delivery and request parsing. The request can reach Flask even when the body cannot be interpreted as valid JSON.

## Completion Standard

You are done when you can explain how malformed input changes application behavior and what the response proves.

## Write Your Answer

Use:

```text
AnswersByGetty/phase-01-single-service-request-tracing/phase-2-inject-and-diagnose-failures/failure-08-malformed-json.md
```

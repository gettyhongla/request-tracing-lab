# Failure 12: Untrusted Certificate

## Scenario

Call the HTTPS version of the app with a certificate the client does not trust.

## Trigger The Failure

Start the HTTPS app mode if your local setup provides one, then run:

```bash
curl -v \
  -H "X-Request-ID: failure-12-untrusted-certificate" \
  https://127.0.0.1:5443/health
```

## Evidence To Collect

```text
Client TLS error:
HTTP response received:
Matching Flask log present:
Failed layer:
What this rules out:
```

## Hint

TLS trust failures happen before normal application evidence. If the handshake fails, the absence of a Flask request log is expected.

## Completion Standard

You are done when you can explain why the request failed before normal HTTP application handling completed.

## Write Your Answer

Use:

```text
AnswersByGetty/phase-01-understanding-a-request/phase-2-inject-and-diagnose-failures/failure-12-untrusted-certificate.md
```

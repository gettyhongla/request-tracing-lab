# Failure 01: Wrong Password

## Scenario

Submit invalid credentials to the login endpoint.

This failure should prove the difference between:

```text
The app is down.
The request failed authentication.
```

## Start The App

```bash
cd /Users/heavenlygetty/Documents/request-tracing-lab
source venv/bin/activate
python app.py
```

Keep the Flask terminal visible.

## Trigger The Failure

In a second terminal:

```bash
curl -i \
  -H "Content-Type: application/json" \
  -H "X-Request-ID: failure-01-wrong-password" \
  -d '{"username":"getty","password":"wrong"}' \
  http://127.0.0.1:5000/session/login
```

Optional JWT comparison:

```bash
curl -i \
  -H "Content-Type: application/json" \
  -H "X-Request-ID: failure-01-wrong-password-jwt" \
  -d '{"username":"getty","password":"wrong"}' \
  http://127.0.0.1:5000/jwt/login
```

## Evidence To Collect

```text
Client status and error message:
Matching Flask logs:
Failed layer:
What this rules out:
```

## Hint

The important distinction is that Flask answered the request. A `401` with matching Flask logs points to an authentication decision, not an unavailable application.

## Completion Standard

You are done when you can explain:

```text
The request reached Flask.
Flask parsed the request.
Flask rejected the credentials intentionally.
The evidence is the 401 response plus matching request_started and request_finished logs.
```

## Write Your Answer

Use:

```text
AnswersByGetty/phase-01-understanding-a-request/phase-2-inject-and-diagnose-failures/failure-01-wrong-password.md
```

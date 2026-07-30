# Lab 04: Compare GET And POST

## Goal

Compare a read-style request with a request that submits data to the application.

## Start The App

```bash
cd /Users/heavenlygetty/Documents/request-tracing-lab
source venv/bin/activate
python app.py
```

## Trigger GET And POST In The Browser

Open the app in a browser:

```text
http://127.0.0.1:5000/
```

Use the page controls to trigger a health check and a session login. Inspect both requests in DevTools > Network.

## Trigger A GET Request With curl

```bash
curl -i \
  -H "X-Request-ID: lab-04-get-health" \
  http://127.0.0.1:5000/health
```

## Trigger A POST Request With curl

```bash
curl -i \
  -H "Content-Type: application/json" \
  -H "X-Request-ID: lab-04-post-session-login" \
  -d '{"username":"getty","password":"cloud"}' \
  http://127.0.0.1:5000/session/login
```

## Evidence To Collect

```text
Browser GET request evidence:
Browser POST request evidence:
GET method, path, status, and body:
POST method, path, status, and body:
POST request Content-Type:
POST request body:
Response headers that changed:
Matching server logs for both request IDs:
Browser and curl comparison:
```

## Completion Standard

You are done when you can explain how a browser-triggered request and a `curl` request express GET and POST behavior, and how Flask logs prove both request paths.

## Write Your Answer

Use:

```text
AnswersByGetty/phase-01-single-service-request-tracing/phase-1-observe-successful-requests/lab-04-compare-get-and-post.md
```

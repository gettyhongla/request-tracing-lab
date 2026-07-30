# Lab 04: Compare GET And POST

## Goal

Compare a read-style request with a request that submits data to the application.

## Start The App

```bash
cd /Users/heavenlygetty/Documents/request-tracing-lab
source venv/bin/activate
python app.py
```

## Trigger A GET Request

```bash
curl -i \
  -H "X-Request-ID: lab-04-get-health" \
  http://127.0.0.1:5000/health
```

## Trigger A POST Request

```bash
curl -i \
  -H "Content-Type: application/json" \
  -H "X-Request-ID: lab-04-post-session-login" \
  -d '{"username":"getty","password":"cloud"}' \
  http://127.0.0.1:5000/session/login
```

## Evidence To Collect

```text
GET method, path, status, and body:
POST method, path, status, and body:
POST request Content-Type:
POST request body:
Response headers that changed:
Matching server logs for both request IDs:
```

## Completion Standard

You are done when you can explain how a GET request retrieves information and how a POST request sends a body that the application must parse and validate.

## Write Your Answer

Use:

```text
AnswersByGetty/phase-01-single-service-request-tracing/phase-1-observe-successful-requests/lab-04-compare-get-and-post.md
```

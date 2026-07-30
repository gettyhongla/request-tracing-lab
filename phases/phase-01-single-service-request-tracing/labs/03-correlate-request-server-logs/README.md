# Lab 03: Correlate Request Server Logs

## Goal

Use `X-Request-ID` to connect one client request to the matching Flask logs.

## Start The App

```bash
cd /Users/heavenlygetty/Documents/request-tracing-lab
source venv/bin/activate
python app.py
```

## Trigger The Request In The Browser

Open:

```text
http://127.0.0.1:5000/
```

Use DevTools > Network to capture the browser request, then compare it to the Flask logs.

## Trigger A Request With curl

```bash
curl -i \
  -H "X-Request-ID: lab-03-correlate-request-server-logs" \
  http://127.0.0.1:5000/health
```

## Evidence To Collect

```text
Browser URL:
DevTools method, path, and status:
DevTools request headers:
DevTools response headers:
curl command:
Client request ID:
Client status:
Client response body:
request_started log:
request_finished log:
Access log:
Method:
Path:
Status:
User agent:
Browser and curl comparison:
```

## Completion Standard

You are done when you can correlate browser evidence and `curl` evidence to Flask logs and explain how user agents, headers, and request IDs differ.

## Write Your Answer

Use:

```text
AnswersByGetty/phase-01-single-service-request-tracing/phase-1-observe-successful-requests/lab-03-correlate-request-server-logs.md
```

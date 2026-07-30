# Lab 01: Establish Baseline

## Goal

Prove the Flask application is running, reachable, and returning a healthy response before changing anything or injecting failures.

## Start The App

```bash
cd /Users/heavenlygetty/Documents/request-tracing-lab
source venv/bin/activate
python app.py
```

Keep the Flask terminal visible so you can capture the matching server logs.

## Trigger The Request In The Browser

Open:

```text
http://127.0.0.1:5000/health
```

Use DevTools > Network to inspect the request and response.

## Trigger The Same Request With curl

```bash
curl -i \
  -H "X-Request-ID: lab-01-establish-baseline" \
  http://127.0.0.1:5000/health
```

## Evidence To Collect

```text
Browser URL:
DevTools request method:
DevTools response status:
DevTools response body:
curl command:
Request method:
Request path:
Response status:
Response body:
X-Request-ID:
Matching request_started log:
Matching request_finished log:
Browser and curl comparison:
```

## Completion Standard

You are done when you can prove the browser and `curl` both reached Flask, Flask returned a healthy response, and the same request ID appears in terminal output and server logs.

## Write Your Answer

Use:

```text
AnswersByGetty/phase-01-single-service-request-tracing/phase-1-observe-successful-requests/lab-01-establish-baseline.md
```

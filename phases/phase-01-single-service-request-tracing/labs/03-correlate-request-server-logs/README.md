# Lab 03: Correlate Request Server Logs

## Goal

Use `X-Request-ID` to connect one client request to the matching Flask logs.

## Start The App

```bash
cd /Users/heavenlygetty/Documents/request-tracing-lab
source venv/bin/activate
python app.py
```

## Trigger The Request

```bash
curl -i \
  -H "X-Request-ID: lab-03-correlate-request-server-logs" \
  http://127.0.0.1:5000/health
```

## Evidence To Collect

```text
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
```

## Completion Standard

You are done when the same request ID appears in the client request, the `request_started` log, and the `request_finished` log.

## Write Your Answer

Use:

```text
AnswersByGetty/phase-01-single-service-request-tracing/phase-1-observe-successful-requests/lab-03-correlate-request-server-logs.md
```

# Trace Report: Lab 03 - Correlate A Request With Server Logs

## Purpose

Use `X-Request-ID` to connect client-side browser evidence to Flask server logs.

This trace proves that the same request can be followed from DevTools into the application log by matching the request ID, method, path, timestamp, and status code.

## Request And Response

```text
Method: GET
Path: /health
Status: 200
Request ID: c4d27ee1-55a4-4637-9876-5cc385890fff
```

The request ID first appeared in DevTools as the `X-Request-ID` response header for the `/health` request.

## Server Evidence

```text
2026-07-23 09:05:25,609 INFO request_started request_id=c4d27ee1-55a4-4637-9876-5cc385890fff method=GET path=/health remote_ip=127.0.0.1 user_agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36

2026-07-23 09:05:25,609 INFO request_finished request_id=c4d27ee1-55a4-4637-9876-5cc385890fff status=200
```

The same request ID appeared in both `request_started` and `request_finished`:

```text
request_id=c4d27ee1-55a4-4637-9876-5cc385890fff
```

## Trace Summary

```text
Client: Chrome browser
  |
  | GET /health
  | X-Request-ID returned: c4d27ee1-55a4-4637-9876-5cc385890fff
  v
Flask application
  |
  | request_started request_id=c4d27ee1-55a4-4637-9876-5cc385890fff method=GET path=/health
  | request_finished request_id=c4d27ee1-55a4-4637-9876-5cc385890fff status=200
  v
Client: 200 OK JSON health response
```

## What This Confirms

The `X-Request-ID` value from the browser response matched the `request_id` value in the Flask server logs.

The request log also recorded method, path, remote IP address, and user agent. The user agent identified the client as Chrome on macOS.

The evidence that both records represent the same request is:

```text
Matching request ID
Consistent method: GET
Consistent path: /health
Consistent status: 200
Consistent timestamp window
```

## Retained Takeaway

```text
X-Request-ID:
The correlation key across client and server evidence.

request_started:
Proves the request reached the Flask app and records method, path, remote IP, and user agent.

request_finished:
Proves the app finished handling the request and records the final status.
```

A strong operational note includes request ID, timestamp, route, status, user impact, and matching logs.

Phase 2 bridge:
In a layered system, this same request ID should appear in proxy logs, application logs, and dependency telemetry so one user action can be traced end to end.

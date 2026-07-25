# Trace Report: Lab 01 - Establish Baseline

## Purpose

Establish known-good behavior for the Flask application before introducing failures.

This baseline proves that the browser can reach the app, the `/health` route works, Flask returns a normal HTTP response, and server logs can be matched to client-side evidence.

## Request

```text
Method: GET
Path: /health
```

## Response

```text
Status: 200 OK
```

```json
{
  "status": "healthy",
  "timestamp": "2026-07-23T11:33:06.269340+00:00"
}
```

The `200 OK` status confirms that the request succeeded. The client reached Flask, the `/health` route handled the request, and the server returned a normal JSON response.

## Server Evidence

```text
request_started request_id=65656b60-5833-42c4-80a8-cd71f48492c8 method=GET path=/health remote_ip=127.0.0.1 user_agent=...
request_finished request_id=65656b60-5833-42c4-80a8-cd71f48492c8 status=200
"GET /health HTTP/1.1" 200
```

## Trace Summary

```text
Browser
  |
  | GET /health
  v
Flask application
  |
  | request_started
  | request_finished status=200
  v
Browser receives 200 OK JSON health response
```

## What This Confirms

```text
Client evidence:
The browser received an HTTP response.

Protocol evidence:
The response status was 200 OK.

Application evidence:
The response body reported "healthy" and included a UTC timestamp.

Server evidence:
The Flask logs showed request_started and request_finished for GET /health.
```

The Flask application is running, the browser can reach it at `127.0.0.1:5000`, the `/health` route works, and client-side evidence can be matched with server-side logs.

## Retained Takeaway

```text
A known-good baseline shows what success looks like before failures are introduced.
```

Later failures can be compared against this baseline to identify what changed: method, path, headers, body, status code, response body, timing, or server logs.

Phase 2 bridge:
Before adding NGINX, PostgreSQL, or Redis, capture healthy behavior so later failures can be compared against known-good request flow.

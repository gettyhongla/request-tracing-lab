# Trace Report: Lab 02 - Inspect A Request In DevTools

## Purpose

Separate request evidence from response evidence using browser DevTools.

This trace shows what the browser sent to Flask, what Flask returned, and which value can be used to correlate browser evidence with server logs.

## Request

```text
Request URL: http://127.0.0.1:5000/health
Method: GET
Remote address: 127.0.0.1:5000
Request body: None
```

Request headers:

```text
Host: 127.0.0.1:5000
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
Accept: */*
Connection: keep-alive
```

The `Host` header identifies the destination host. The `User-Agent` header identifies the client software, which was Chrome on macOS.

## Response

```text
Status: 200 OK
Content-Type: application/json
Content-Length: 77
X-Request-ID: c6360e43-e202-4a71-b511-28707e351f18
```

Response body:

```json
{
  "status": "healthy",
  "timestamp": "2026-07-23T12:06:35.921265+00:00"
}
```

The server returned JSON. The `Content-Type: application/json` response header confirms the response format.

## Trace Summary

```text
Browser sends:
GET /health with request headers and no request body.

Flask returns:
200 OK with JSON content, response headers, and X-Request-ID.
```

The `X-Request-ID` response header is the strongest tracing value because it can be matched against `request_id` in Flask logs.

## What This Confirms

```text
Request:
What the client sends.

Response:
What the server returns.

Request body:
Data sent by the client. This GET request did not have one.

Response body:
Data returned by the server. In this lab, it was JSON.

X-Request-ID:
The main correlation value between DevTools and Flask logs.
```

## Retained Takeaway

GET `/health` retrieved information without sending a body. The JSON object with `"status": "healthy"` was the response body, not the request body.

OSI context:
These are HTTP details at the application layer. Lower layers still matter when DNS, TCP, TLS, or routing fails.

Phase 2 bridge:
When a reverse proxy is added, compare browser evidence with proxy evidence and application evidence instead of assuming one layer tells the whole story.

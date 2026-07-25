# Phase 1: Single-Service Request Tracing

Phase 1 builds the foundation for every later architecture. Before adding NGINX, PostgreSQL, Redis, Kubernetes, queues, or distributed services, you should be able to prove what happened inside one simple request path.

```text
Browser or curl
      |
      v
Flask application
      |
      v
Application logs
```

## What This Phase Teaches

This phase focuses only on the client, the Flask API, and the application logs.

You should understand:

* How a browser or `curl` sends an HTTP request
* How to separate request data from response data
* How status codes describe the result
* How cookies carry session state
* How JWT bearer tokens differ from cookies
* How `X-Request-ID` connects client evidence to server logs
* How latency and application errors appear from both sides
* How local HTTPS changes the request path

## Labs

Complete these in order:

| Lab | Focus | Completion standard |
| --- | --- | --- |
| 1 | Establish a baseline | Prove the app is reachable and healthy |
| 2 | Inspect a request in DevTools | Separate URL, method, headers, status, and body |
| 3 | Correlate server logs | Match `X-Request-ID` to Flask log entries |
| 4 | Compare GET and POST | Explain retrieval versus submitted request body |
| 5 | Trace session authentication | Follow `Set-Cookie` and `Cookie` across requests |
| 6 | Trace JWT authentication | Follow token creation and `Authorization: Bearer` usage |
| 7 | Diagnose failure responses | Compare bad auth, missing state, bad paths, and app errors |
| 8 | Inspect latency and TLS | Distinguish slow app behavior from connection and certificate behavior |

## Investigation Worksheet

Use this for each request:

```text
Scenario:

Tool used:

Request method:

Request path:

Important request headers:

Request body:

Response status:

Important response headers:

Response body:

Request ID:

Matching server log:

Observed behavior:

Failure layer, if applicable:

Evidence:

Next troubleshooting step:
```

## Phase 1 Completion Standard

You are ready for Phase 2 when you can explain:

```text
The client sent this request.
The server returned this response.
This request ID connects the browser evidence to the Flask logs.
Authentication state appeared here.
The failure stopped at this layer.
This evidence proves the conclusion.
```

## What To Retain For Phase 2

Phase 2 adds a reverse proxy, database, and Redis. The important Phase 1 habit is evidence discipline.

Carry these forward:

* Always establish healthy behavior before failure testing.
* Always capture the request ID or trace ID.
* Always identify which layer observed the request.
* Always separate client symptoms from server evidence.
* Always explain what evidence rules out nearby causes.

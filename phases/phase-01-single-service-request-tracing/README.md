# Phase 1: Single-Service Request Tracing

Phase 1 builds the request investigation foundation for every later architecture. Before adding NGINX, PostgreSQL, Redis, Kubernetes, queues, or distributed services, you should be able to prove what happened inside one simple request path and explain why a failed request stopped where it did.

```text
Browser or curl
      |
      v
Flask application
      |
      v
Application logs
```

## Scope

This phase focuses only on the client, the Flask API, and the application logs.

You should understand:

* How a browser or `curl` sends an HTTP request
* How browser DevTools and terminal output show the same request from different angles
* How to separate request data from response data
* How status codes describe the result
* How cookies carry session state
* How JWT bearer tokens differ from cookies
* How `X-Request-ID` connects client evidence to server logs
* How latency and application errors appear from both sides
* How local HTTPS changes the request path

## Work Pattern

Phase 1 has two connected parts:

```text
Observe successful requests
        |
        v
Inject and diagnose failures
        |
        v
Write evidence-backed RCA notes
```

The first part establishes healthy behavior. The second part breaks specific request paths and proves whether the failure came from authentication, missing state, routing, malformed input, application behavior, availability, latency, or TLS trust.

## Labs

Complete these in order:

| Lab | Focus | Completion standard |
| --- | --- | --- |
| [1](labs/01-establish-baseline/) | Establish a baseline | Prove the app is reachable and healthy |
| [2](labs/02-inspect-request-devtools/) | Inspect a request in DevTools | Separate URL, method, headers, status, and body |
| [3](labs/03-correlate-request-server-logs/) | Correlate server logs | Match `X-Request-ID` to Flask log entries |
| [4](labs/04-compare-get-and-post/) | Compare GET and POST | Explain retrieval versus submitted request body |
| [5](labs/05-trace-session-authentication/) | Trace session authentication | Follow `Set-Cookie` and `Cookie` across requests |
| [6](labs/06-trace-jwt-authentication/) | Trace JWT authentication | Follow token creation and `Authorization: Bearer` usage |
| [7](labs/07-diagnose-failure-responses/) | Diagnose failure responses | Compare bad auth, missing state, bad paths, and app errors |
| [8](labs/08-inspect-latency-and-tls/) | Inspect latency and TLS | Distinguish slow app behavior from connection and certificate behavior |

## Evidence Location

The reusable lab prompts live in this `phases/` directory.

Completed evidence, commands, logs, conclusions, and RCA notes belong in:

```text
AnswersByGetty/phase-01-single-service-request-tracing/
```

Use these answer folders:

```text
phase-1-observe-successful-requests/
phase-2-inject-and-diagnose-failures/
```

## Evidence Worksheet

Use this as a lightweight guide. Capture the evidence that proves the conclusion; do not copy every header or every timing value unless it changes the diagnosis.

```text
Scenario:

Tools used:

User-visible behavior:

Most important DevTools evidence:

Most important terminal evidence:

Matching server log:

Request path and method:

Final status or client error:

State or auth evidence, if relevant:

UI and terminal comparison:

Conclusion:

What this rules out:
```

## Phase 1 Completion Standard

You are ready for Phase 2 when you can trace both healthy and failed requests with evidence:

```text
The client sent this request.
The server returned this response.
This request ID connects the browser evidence to the Flask logs.
Authentication state appeared here.
The failure stopped at this layer.
This evidence proves the conclusion.
```

You should also be able to write a short RCA for failed requests that separates the user-facing symptom from the failed layer, supporting evidence, ruled-out causes, and next operational action.

## What To Retain For Phase 2

Phase 2 adds a reverse proxy, PostgreSQL, and Redis. The important Phase 1 habit is evidence discipline.

Carry these forward:

* Always establish healthy behavior before failure testing.
* Always capture the request ID or trace ID.
* Always identify which layer observed the request.
* Always separate client symptoms from server evidence.
* Always explain what evidence rules out nearby causes.

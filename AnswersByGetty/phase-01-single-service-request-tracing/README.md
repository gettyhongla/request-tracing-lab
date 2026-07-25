# Phase 1 Answers: Single-Service Request Tracing

These answers capture the completed Phase 1 request-tracing work.

Read them for structure:

```text
Observation -> Evidence -> Conclusion -> Takeaway
```

## Completed Answers

```text
phase-1-observe-successful-requests/lab-01-establish-baseline.md
phase-1-observe-successful-requests/lab-02-inspect-request-devtools.md
phase-1-observe-successful-requests/lab-03-correlate-request-server-logs.md
phase-1-observe-successful-requests/lab-04-compare-get-and-post.md
phase-1-observe-successful-requests/lab-05-trace-session-authentication.md
phase-1-observe-successful-requests/lab-06-trace-jwt-authentication.md
```

## Phase 1 Concepts To Retain

```text
Request evidence:
Method, path, headers, body, cookies, authorization, and request ID.

Response evidence:
Status, headers, body, cookies set by the server, and request ID.

Server evidence:
request_started, request_finished, status, path, duration, and application errors.

Authentication evidence:
Cookies are automatically returned by the browser. JWTs must be explicitly sent in the Authorization header.

Correlation evidence:
X-Request-ID connects client-side observations to server-side logs.

Phase 2 bridge:
When NGINX, PostgreSQL, and Redis are added, the same evidence discipline expands across more layers.
```

## Planned Failure Answers

```text
phase-2-inject-and-diagnose-failures/failure-01-wrong-password.md
phase-2-inject-and-diagnose-failures/failure-02-missing-session-cookie.md
phase-2-inject-and-diagnose-failures/failure-03-invalid-jwt.md
phase-2-inject-and-diagnose-failures/failure-04-expired-jwt.md
phase-2-inject-and-diagnose-failures/failure-05-nonexistent-route.md
phase-2-inject-and-diagnose-failures/failure-06-server-unavailable.md
phase-2-inject-and-diagnose-failures/failure-07-wrong-port.md
phase-2-inject-and-diagnose-failures/failure-08-malformed-json.md
phase-2-inject-and-diagnose-failures/failure-09-missing-content-type.md
phase-2-inject-and-diagnose-failures/failure-10-slow-request.md
phase-2-inject-and-diagnose-failures/failure-11-application-exception.md
phase-2-inject-and-diagnose-failures/failure-12-untrusted-certificate.md
```

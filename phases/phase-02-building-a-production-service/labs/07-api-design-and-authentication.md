# Lab 07: API Design And Authentication

Use the support-ticket API to learn clear REST boundaries, validation, authentication, and authorization.

## Why This Lab Exists

APIs are where customers, browsers, scripts, and integrations touch the application. A production support-ticket app needs predictable endpoints, clear status codes, safe authentication, and ownership checks.

## Architecture Before

```text
Browser or curl -> NGINX -> Flask -> PostgreSQL
```

The app has ticket tables and basic support-ticket routes.

## Architecture After

```text
Client
  |
  v
REST API
  |-- /api/auth/*
  |-- /api/tickets
  |-- /api/tickets/<ticket_id>
  `-- /api/admin/tickets/*
        |
        v
Session auth, validation, ownership checks, PostgreSQL
```

## Key Terms

| Term | Meaning |
| --- | --- |
| Resource | Thing the API exposes, such as tickets or messages |
| GET | Read a resource |
| POST | Create a resource or trigger a create-style action |
| PATCH | Partially update a resource |
| DELETE | Remove a resource |
| Session authentication | Server-managed login state represented by a browser cookie |
| JWT | Signed token commonly used for stateless API auth examples |
| OAuth/OIDC | Standards for delegated login and identity |
| Authentication | Proving who the user is |
| Authorization | Deciding what the user can access |
| Idempotency key | Client-provided key that prevents duplicate side effects |

## Must Implement Or Inspect

1. List the support-ticket API resources.
2. Identify which routes require a session.
3. Compare session routes with the existing JWT learning routes.
4. Validate request bodies and content type behavior.
5. Confirm ownership checks for customer tickets.
6. Confirm admin-only routes require the `admin` role.
7. Add or document pagination, filtering, and sorting expectations.
8. Explain API versioning conceptually.
9. Design an idempotency-key approach for duplicate ticket submissions.

## HTTP Status Codes To Explain

| Code | Meaning In This App |
| --- | --- |
| 200 | Successful read or update |
| 201 | Created user, ticket, or message |
| 202 | Accepted for async processing |
| 204 | Success with no response body |
| 400 | Invalid request shape |
| 401 | Not logged in |
| 403 | Logged in but not allowed |
| 404 | Ticket or route not found |
| 409 | Duplicate account or conflicting request |
| 422 | Valid JSON but semantically invalid data |
| 429 | Too many requests |
| 500 | Unexpected application failure |
| 502 | Proxy could not get a valid upstream response |
| 503 | Dependency unavailable |
| 504 | Timeout waiting for upstream work |

## Healthy-Path Verification

Capture with browser DevTools and `curl`:

```text
Register request:
Login request:
Session cookie evidence:
Create ticket request:
List ticket response:
Admin list response:
Request ID:
PostgreSQL records:
```

## Controlled Failures

Test:

```text
Missing JSON body:
Wrong content type:
Missing session:
Customer reads another customer's ticket:
Customer calls admin route:
Duplicate account registration:
Duplicate ticket submission scenario:
```

## Evidence To Capture

```text
API route:
HTTP method:
Request body:
Response body:
Status code:
Request ID:
Browser DevTools evidence:
curl evidence:
Flask log:
PostgreSQL evidence:
Ownership decision:
Interview explanation:
Retained takeaway:
```

## Troubleshooting Questions

```text
Was the user unauthenticated or unauthorized?
Did the API reject the request before touching the database?
Did the API return the right status code for support triage?
Can the same client request create duplicate tickets?
Which evidence proves object ownership was enforced?
```

## Interview Explanation

```text
The support-ticket API uses nouns for resources, sessions for the browser workflow, and explicit ownership checks before returning ticket data. Authentication proves who the user is; authorization proves whether that user can access the ticket. Status codes and request IDs make failures easier to triage.
```

## Completion Standard

```text
The learner can explain the support-ticket API boundary, how login state is represented, and why ownership checks are separate from authentication.
```

## Retained Takeaway

```text
A clear API makes support easier because each request has an expected method, body, status code, owner, and evidence trail.
```

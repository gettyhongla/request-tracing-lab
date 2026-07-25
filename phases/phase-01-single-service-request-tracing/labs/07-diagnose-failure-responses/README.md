# Lab 7: Diagnose Failure Responses

This lab is the failure-injection half of Phase 1.

The goal is to compare failures that look similar from the outside but happen at different layers:

```text
Bad credentials
Missing session state
Invalid token
Expired token
Unknown route
Server unavailable
Wrong port
Malformed request body
Missing Content-Type
Slow request
Application exception
TLS trust failure
```

## What To Prove

For each failure, prove:

```text
Did the client receive an HTTP response?
Did the request reach Flask?
What status or client error occurred?
Was there an X-Request-ID?
Was there a matching server log?
Which layer failed?
What evidence rules out nearby layers?
```

## Failure Set

| Failure | Focus | Answer file |
| --- | --- | --- |
| [01](failure-01-wrong-password.md) | Wrong password | `AnswersByGetty/.../failure-01-wrong-password.md` |
| 02 | Missing session cookie | `AnswersByGetty/.../failure-02-missing-session-cookie.md` |
| 03 | Invalid JWT | `AnswersByGetty/.../failure-03-invalid-jwt.md` |
| 04 | Expired JWT | `AnswersByGetty/.../failure-04-expired-jwt.md` |
| 05 | Nonexistent route | `AnswersByGetty/.../failure-05-nonexistent-route.md` |
| 06 | Server unavailable | `AnswersByGetty/.../failure-06-server-unavailable.md` |
| 07 | Wrong port | `AnswersByGetty/.../failure-07-wrong-port.md` |
| 08 | Malformed JSON | `AnswersByGetty/.../failure-08-malformed-json.md` |
| 09 | Missing Content-Type | `AnswersByGetty/.../failure-09-missing-content-type.md` |
| 10 | Slow request | `AnswersByGetty/.../failure-10-slow-request.md` |
| 11 | Application exception | `AnswersByGetty/.../failure-11-application-exception.md` |
| 12 | Untrusted certificate | `AnswersByGetty/.../failure-12-untrusted-certificate.md` |

## Answer Location

Write your completed evidence and conclusions in:

```text
AnswersByGetty/phase-01-single-service-request-tracing/phase-2-inject-and-diagnose-failures/
```

The phase folder teaches the lab. `AnswersByGetty` proves that you did the work.

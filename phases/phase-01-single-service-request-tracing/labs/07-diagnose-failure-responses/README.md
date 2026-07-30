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
User-visible symptom:
Most important DevTools or curl evidence:
Did the request reach Flask:
Final status or client-side error:
Failed layer:
What this rules out:
```

## How To Run Each Failure

Use the browser first when the failure can be triggered from the app UI. Capture DevTools evidence from the Network tab, including request headers, response headers, status, body, timing, and cookies or authorization headers when relevant.

Then reproduce the same failure with `curl` so the terminal output can be compared against the browser evidence.

Some failures are easier to prove from the terminal, such as wrong port, server unavailable, malformed JSON, or TLS trust errors. For those, still record what the browser shows if you attempt the same request there.

Your notes should separate:

```text
User-visible symptom:
Best client-side evidence:
Best server-side evidence:
Conclusion:
```

## Hint

For failures, one strong negative signal is often as important as a positive one. For example, no Flask log usually points before Flask; a Flask `request_finished` log with `401` points to an application decision, not an outage.

## Failure Set

| Failure | Focus | Answer file |
| --- | --- | --- |
| [01](failure-01-wrong-password.md) | Wrong password | `AnswersByGetty/.../failure-01-wrong-password.md` |
| [02](failure-02-missing-session-cookie.md) | Missing session cookie | `AnswersByGetty/.../failure-02-missing-session-cookie.md` |
| [03](failure-03-invalid-jwt.md) | Invalid JWT | `AnswersByGetty/.../failure-03-invalid-jwt.md` |
| [04](failure-04-expired-jwt.md) | Expired JWT | `AnswersByGetty/.../failure-04-expired-jwt.md` |
| [05](failure-05-nonexistent-route.md) | Nonexistent route | `AnswersByGetty/.../failure-05-nonexistent-route.md` |
| [06](failure-06-server-unavailable.md) | Server unavailable | `AnswersByGetty/.../failure-06-server-unavailable.md` |
| [07](failure-07-wrong-port.md) | Wrong port | `AnswersByGetty/.../failure-07-wrong-port.md` |
| [08](failure-08-malformed-json.md) | Malformed JSON | `AnswersByGetty/.../failure-08-malformed-json.md` |
| [09](failure-09-missing-content-type.md) | Missing Content-Type | `AnswersByGetty/.../failure-09-missing-content-type.md` |
| [10](failure-10-slow-request.md) | Slow request | `AnswersByGetty/.../failure-10-slow-request.md` |
| [11](failure-11-application-exception.md) | Application exception | `AnswersByGetty/.../failure-11-application-exception.md` |
| [12](failure-12-untrusted-certificate.md) | Untrusted certificate | `AnswersByGetty/.../failure-12-untrusted-certificate.md` |

## Answer Location

Write your completed evidence and conclusions in:

```text
AnswersByGetty/phase-01-single-service-request-tracing/phase-2-inject-and-diagnose-failures/
```

The phase folder teaches the lab. `AnswersByGetty` proves that you did the work.

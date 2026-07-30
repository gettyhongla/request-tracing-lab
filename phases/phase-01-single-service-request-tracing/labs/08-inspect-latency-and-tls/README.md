# Lab 8: Inspect Latency And TLS

This lab separates slow application behavior from connection and TLS behavior.

Use this after completing the failure-response set.

## Focus

```text
Slow app response:
The request reaches Flask and returns slowly.

Connection failure:
The client cannot establish a connection to the server.

TLS trust failure:
The client reaches the TLS layer but does not trust the certificate.
```

## Evidence To Compare

Use both browser DevTools and terminal output when possible:

```text
Browser timing evidence:
Browser error message:
curl timing output:
curl TLS or connection output:
Matching Flask log, if any:
Was an HTTP response received:
Did the request reach Flask:
```

## Related Answer Files

```text
AnswersByGetty/phase-01-single-service-request-tracing/phase-2-inject-and-diagnose-failures/failure-10-slow-request.md
AnswersByGetty/phase-01-single-service-request-tracing/phase-2-inject-and-diagnose-failures/failure-12-untrusted-certificate.md
```

## Completion Standard

You are done when you can explain whether a delay or failure happened:

```text
Before TCP connection
During TLS negotiation
After HTTP reached Flask
Inside Flask application handling
```

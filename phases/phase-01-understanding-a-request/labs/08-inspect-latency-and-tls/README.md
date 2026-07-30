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
Best timing evidence:
Client error or HTTP status:
Matching Flask log, if any:
Where the delay or failure happened:
What this rules out:
```

## Hint

Do not chase every timing field. First decide whether the client connected, whether TLS completed, whether HTTP reached Flask, and whether Flask returned slowly.

## Related Answer Files

```text
AnswersByGetty/phase-01-understanding-a-request/phase-2-inject-and-diagnose-failures/failure-10-slow-request.md
AnswersByGetty/phase-01-understanding-a-request/phase-2-inject-and-diagnose-failures/failure-12-untrusted-certificate.md
```

## Completion Standard

You are done when you can explain whether a delay or failure happened:

```text
Before TCP connection
During TLS negotiation
After HTTP reached Flask
Inside Flask application handling
```

# Lab 3: Correlate a Request with Server Logs

## Record

```text
Request ID:
c4d27ee1-55a4-4637-9876-5cc385890fff

Request method from the log:
GET

Request path from the log:
/health

Response status from the log:
200

Request-started entry:
2026-07-23 09:05:25,609 INFO request_started request_id=c4d27ee1-55a4-4637-9876-5cc385890fff method=GET path=/health remote_ip=127.0.0.1 user_agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36

Request-finished entry:
2026-07-23 09:05:25,609 INFO request_finished request_id=c4d27ee1-55a4-4637-9876-5cc385890fff status=200
```

## Questions

1. Where did you first find the request ID?

The request ID first appeared in DevTools as the `X-Request-ID` response header for the `/health` request.

2. Where did the same value appear in the server logs?

The same value appeared in the Flask terminal logs on both the `request_started` and `request_finished` entries:

```text
request_id=c4d27ee1-55a4-4637-9876-5cc385890fff
```

3. Did the request and response use the same ID?

Yes. The `X-Request-ID` value from the browser response matched the `request_id` value in the Flask server logs.

4. What client information appeared in the request log?

The request log included the method, path, remote IP address, and user agent. The user agent identified the client as Chrome on macOS.

5. How would a request ID help investigate a customer report?

A request ID lets you connect a client-side report to the exact server-side log entries for that request. With the ID, you can find the method, path, timestamp, status code, user agent, and any related application errors for the same request.

6. What information would you include in an engineering escalation?

An engineering escalation should include the request ID, timestamp, request URL or path, HTTP method, response status code, response body or error message, relevant request and response headers, user agent, and the matching server log entries.

## Draw the Trace

```text
Client: Chrome browser
  |
  | GET /health
  | X-Request-ID returned: c4d27ee1-55a4-4637-9876-5cc385890fff
  v
Flask application
  |
  | request_started request_id=c4d27ee1-55a4-4637-9876-5cc385890fff method=GET path=/health
  | request_finished request_id=c4d27ee1-55a4-4637-9876-5cc385890fff status=200
  v
Client: 200 OK JSON health response
```

## Conclusion

```text
I correlated the client request with the server logs by:
Copying the X-Request-ID value from the DevTools response headers and finding the same request_id value in the Flask terminal logs.

The evidence that both records represent the same request is:
The request ID matched in both places, and the method, path, timestamp, and status were consistent: GET /health returned status 200.
```

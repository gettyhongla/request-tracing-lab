# Lab 2: Inspect a Request in DevTools

## Record: General

```text
Request URL:
http://127.0.0.1:5000/health

Request method:
GET

Status code:
200 OK

Remote address:
127.0.0.1:5000
```

## Request Headers

```text
Host:
127.0.0.1:5000

User-Agent:
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36

Accept:
*/*

Connection:
keep-alive
```

## Response Headers

```text
Content-Type:
application/json

Content-Length:
77

X-Request-ID:
c6360e43-e202-4a71-b511-28707e351f18
```

## Response Body

```json
{
  "status": "healthy",
  "timestamp": "2026-07-23T12:06:35.921265+00:00"
}
```

## Questions

1. Which information belongs to the request?

Request information is what the browser sent to the server. In this example, that includes the request URL, request method, path, and request headers such as `Host`, `User-Agent`, `Accept`, `Connection`, and any cookies the browser sent.

2. Which information belongs to the response?

Response information is what the server sent back to the browser. In this example, that includes the status code `200 OK`, response headers such as `Content-Type`, `Content-Length`, `Date`, `Server`, and `X-Request-ID`, plus the JSON response body.

3. Which header identifies the destination host?

The `Host` request header identifies the destination host:

```text
Host: 127.0.0.1:5000
```

`Remote Address` also shows where the browser connected, but it is not a request header.

4. Which header identifies the client software?

The `User-Agent` request header identifies the client software. In this case, it identifies Chrome on macOS.

5. Did the GET request contain a request body?

No. This `GET /health` request did not send a request body.

The JSON object with `"status": "healthy"` is the response body, not the request body.

6. What format was returned in the response body?

The server returned JSON. The `Content-Type: application/json` response header confirms the format.

7. Which header could help you locate this request in server logs?

The `X-Request-ID` response header can help locate the matching request in the Flask logs.

Example:

```text
X-Request-ID: c6360e43-e202-4a71-b511-28707e351f18
```

## Conclusion

```text
The client sent:
A GET request to http://127.0.0.1:5000/health with request headers such as Host, User-Agent, Accept, and Connection. The request did not include a body.

The server returned:
A 200 OK response with JSON content, response headers including Content-Type and X-Request-ID, and a body reporting "status": "healthy" plus a timestamp.

The most useful tracing evidence was:
The X-Request-ID response header, because it can be matched against the request_id value in the Flask server logs.
```

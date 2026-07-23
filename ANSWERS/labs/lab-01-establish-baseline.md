# Lab 1: Establish a Baseline

## Record

```text
Request method:
GET

Request path:
/health

Request URL:
http://127.0.0.1:5000/health

Response status:
200 OK

Response body:
{
  "status": "healthy",
  "timestamp": "2026-07-23T11:33:06.269340+00:00"
}

New server log entries:
request_started request_id=65656b60-5833-42c4-80a8-cd71f48492c8 method=GET path=/health remote_ip=127.0.0.1 user_agent=...
request_finished request_id=65656b60-5833-42c4-80a8-cd71f48492c8 status=200
"GET /health HTTP/1.1" 200
```

## Questions

1. What evidence confirms that the application is running?

The browser successfully received a response from `http://127.0.0.1:5000/health`, the response status was `200 OK`, the response body reported `"status": "healthy"`, and the Flask terminal logged the request.

2. Did the browser receive an HTTP response?

Yes. The browser received an HTTP response with status `200 OK`, response headers, and a JSON response body.

3. What does the status code communicate?

`200 OK` means the request succeeded. The client reached the Flask application, the `/health` route handled the request, and the server returned a normal successful response.

4. What information does the response body provide?

The response body reports that the application considers itself healthy and includes a UTC timestamp showing when the health response was generated.

5. Why is a known-good baseline useful before troubleshooting?

A known-good baseline shows what success looks like before failures are introduced. Later, when a request fails, you can compare the failed request against the baseline and identify what changed: method, path, headers, body, status code, response body, timing, or server logs.

## Conclusion

```text
What happened:
The browser sent a GET request to /health, and the Flask application returned a successful JSON health response.

Evidence:
The Network tab showed GET /health with status 200. The response body contained "status": "healthy" and a timestamp. The Flask terminal showed matching request_started and request_finished log entries for GET /health with status=200.

What this confirms:
The Flask application is running, the browser can reach it at 127.0.0.1:5000, the /health route works, and client-side evidence can be matched with server-side logs.
```

## Study Note

Lab 1 questions train you to prove the same request from multiple angles.

```text
Browser loaded page: The client could connect.

Status 200: The HTTP request succeeded.

Response body: The application returned useful data.

Flask logs: The server actually received and handled the request.
```

A page can fail before reaching the server, reach the server but return `401`, reach the wrong route and return `404`, use the wrong method and return `405`, or reach application code and return `500`.
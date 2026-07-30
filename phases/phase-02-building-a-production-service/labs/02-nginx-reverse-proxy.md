# Lab 02: NGINX Reverse Proxy

Put NGINX in front of Flask.

The point is not just to make NGINX work. The point is to understand why a production service usually has an edge or proxy layer before the application.

## Build

1. Run Flask on an internal app port.
2. Add an NGINX config that forwards traffic to Flask.
3. Preserve useful headers:
   ```text
   Host
   X-Forwarded-For
   X-Forwarded-Proto
   X-Request-ID
   ```
4. Send traffic through NGINX instead of directly to Flask.

## Prove

Capture:

```text
curl through NGINX:
curl directly to Flask:
NGINX access log:
NGINX error log:
Flask log:
Response headers:
```

## Break

Break the upstream Flask port or stop Flask.

Answer:

```text
What status did the client receive?
Did NGINX see the request?
Did Flask see the request?
What proves where the request stopped?
```

## Done When

You can explain why `502 Bad Gateway` usually means the proxy could not get a valid response from the upstream service.

## Evidence To Capture

```text
NGINX config:
Healthy request:
NGINX access log:
Flask log:
Broken upstream symptom:
Layer that failed:
Interview explanation:
Retained takeaway:
```

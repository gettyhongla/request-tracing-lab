# Lab 02: NGINX Reverse Proxy

## Build

The goal of this lab was to put NGINX in front of the Flask app so the request path becomes:

```text
Browser or curl -> NGINX on port 8080 -> Flask on port 5000 -> response
```

This builds directly on Phase 1, where I practiced understanding one HTTP request, and on Phase 2 Lab 01, where I drew the three-tier architecture before building it.

### 1. Verify NGINX installation on macOS

I installed NGINX with Homebrew and verified the installation:

```bash
brew info nginx
```

Important Homebrew output:

```text
nginx 1.31.3
HTTP(S) server and reverse proxy
Docroot is: /opt/homebrew/var/www
Default port is set in /opt/homebrew/etc/nginx/nginx.conf to 8080
NGINX will load all files in /opt/homebrew/etc/nginx/servers/
```

### 2. Important NGINX paths

**macOS Homebrew:**

```text
Main config:
/opt/homebrew/etc/nginx/nginx.conf

Extra config folder, if used:
/opt/homebrew/etc/nginx/servers/

Logs:
/opt/homebrew/var/log/nginx/

Access log:
/opt/homebrew/var/log/nginx/access.log

Error log:
/opt/homebrew/var/log/nginx/error.log

Web root:
/opt/homebrew/var/www/

Binary:
/opt/homebrew/opt/nginx/bin/nginx
```

**Ubuntu:**

```text
Main config:
/etc/nginx/nginx.conf

Site configs:
/etc/nginx/sites-available/
/etc/nginx/sites-enabled/
```

**RHEL / CentOS / Fedora:**

```text
Main config:
/etc/nginx/nginx.conf

App configs:
/etc/nginx/conf.d/
```

The exact folders change by operating system, but the purpose is the same: NGINX reads a config file, listens on a port, receives client traffic, and forwards matching requests to an upstream application.

### 3. Configure NGINX to route to Flask

I updated the Homebrew NGINX config:

```bash
vim /opt/homebrew/etc/nginx/nginx.conf
```

The key part of the config is the `server` block:

```nginx
server {
    listen 8080;
    server_name localhost;

    location / {
        proxy_pass http://127.0.0.1:5000;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Request-ID $request_id;
    }
}
```

### 4. What the config means

**`listen 8080`:**

NGINX listens for client traffic on port `8080`. Homebrew uses `8080` by default so NGINX can run without `sudo`.

**`server_name localhost`:**

This tells NGINX this server block is for local requests to `localhost`.

**`location /`:**

This matches requests starting at `/`. For this lab, all app traffic goes through this one location block.

**`proxy_pass http://127.0.0.1:5000`:**

This is the main reverse proxy instruction. NGINX receives the request on `8080` and forwards it to Flask on `5000`.

**`proxy_set_header Host $host`:**

This preserves the original host header from the client request.

**`proxy_set_header X-Real-IP $remote_addr`:**

This forwards the client IP address that NGINX saw.

**`proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for`:**

This keeps a chain of client/proxy IP addresses. This matters when requests pass through more than one proxy.

**`proxy_set_header X-Forwarded-Proto $scheme`:**

This tells Flask whether the original request used `http` or `https`.

**`proxy_set_header X-Request-ID $request_id`:**

This forwards a request ID from NGINX to Flask so one request can be correlated across NGINX logs, Flask logs, and the client response.

These headers are customizable. The main idea is that NGINX is not just forwarding traffic; it can also preserve useful request context for the application.

### 5. Start NGINX

I started NGINX as a Homebrew service:

```bash
brew services start nginx
```

I checked the service:

```bash
brew services list
```

Result:

```text
nginx started
```

I also checked that something was listening on port `8080`:

```bash
lsof -nP -iTCP:8080 -sTCP:LISTEN
```

Result:

```text
nginx TCP *:8080 (LISTEN)
```

## Prove

**curl directly to Flask:**

```bash
curl http://127.0.0.1:5000
```

This returned the Flask app HTML directly from Werkzeug/Flask.

**curl through NGINX:**

```bash
curl -i --max-time 3 http://127.0.0.1:8080
```

This returned the same Flask app through NGINX.

Important response evidence:

```text
HTTP/1.1 200 OK
Server: nginx/1.31.3
X-Request-ID: 6e8c60f9fd7dc6e0903910c024ea0428
```

That proves the request reached NGINX first, then NGINX routed it to Flask.

**NGINX access log:**

```bash
tail -f /opt/homebrew/var/log/nginx/access.log
```

Example access log evidence:

```text
127.0.0.1 - - [30/Jul/2026:16:52:46 -0400] "GET / HTTP/1.1" 200 4141 "-" "curl/8.7.1"
```

This proves NGINX saw the request and returned a `200` response to the client.

**NGINX error log:**

```bash
tail -f /opt/homebrew/var/log/nginx/error.log
```

The error log is where I would look if NGINX could not start, if the config was invalid, or if NGINX could not reach Flask.

**Flask log:**

The Flask log proves the request also reached the application after passing through NGINX.

**Response headers:**

The response headers matter because they show the proxy layer was involved:

```text
Server: nginx/1.31.3
X-Request-ID: <generated-request-id>
```

## Break

I have not fully completed the broken-upstream test yet in this answer file.

The test I expect to run next is:

1. Stop Flask.
2. Keep NGINX running.
3. Send traffic to `http://127.0.0.1:8080`.
4. Confirm that NGINX returns a `502 Bad Gateway`.
5. Check that NGINX saw the request but Flask did not process it.

Expected result:

```text
Client receives: 502 Bad Gateway
NGINX access log: shows the client request
NGINX error log: shows upstream connection failure
Flask log: no matching request
```

That would prove the request stopped at the proxy-to-application boundary.

## Interview Explanation

NGINX is the reverse proxy in front of Flask. The client sends traffic to NGINX on port `8080`, and NGINX forwards the request to Flask on port `5000`.

The value of NGINX is not only routing. It also gives the system a front door where I can manage headers, preserve client context, generate or forward request IDs, and collect access/error logs before the request reaches the application.

If Flask is healthy, NGINX returns the Flask response to the client. If Flask is down or unreachable, NGINX may return `502 Bad Gateway`, which means the proxy received the client request but could not get a valid response from the upstream Flask service.

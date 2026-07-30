# Lab 02: NGINX Reverse Proxy

## Build

The goal of this lab was to put NGINX in front of the Flask app so the request path becomes:

```text
Browser or curl -> NGINX on port 8080 -> Flask on port 5000 -> response
```

This builds on Phase 1 because I am still tracing one request, but now I added a proxy layer before the application. It also builds on Lab 01 because the architecture is no longer just a diagram: traffic now actually flows through `Browser/curl -> NGINX -> Flask`.

### Commands I ran

```bash
brew install nginx
brew info nginx
vim /opt/homebrew/etc/nginx/nginx.conf
/opt/homebrew/opt/nginx/bin/nginx -t
brew services start nginx
brew services list
curl http://127.0.0.1:5000
curl -i --max-time 3 http://127.0.0.1:8080
lsof -nP -iTCP:8080 -sTCP:LISTEN
tail -f /opt/homebrew/var/log/nginx/access.log
tail -f /opt/homebrew/var/log/nginx/error.log
```

### Important NGINX paths

**macOS Homebrew:**

```text
Main config: /opt/homebrew/etc/nginx/nginx.conf
Logs:        /opt/homebrew/var/log/nginx/
Access log:  /opt/homebrew/var/log/nginx/access.log
Error log:   /opt/homebrew/var/log/nginx/error.log
Web root:    /opt/homebrew/var/www/
Binary:      /opt/homebrew/opt/nginx/bin/nginx
```

**Ubuntu:**

```text
Main config:  /etc/nginx/nginx.conf
Site configs: /etc/nginx/sites-available/
Enabled site: /etc/nginx/sites-enabled/
```

**RHEL / CentOS / Fedora:**

```text
Main config: /etc/nginx/nginx.conf
App configs: /etc/nginx/conf.d/
```

The exact file locations change by operating system, but the purpose is the same: NGINX reads a config, listens on a port, receives client traffic, and forwards matching requests to an upstream service.

### NGINX config

I updated the Homebrew NGINX config:

```bash
vim /opt/homebrew/etc/nginx/nginx.conf
```

The important server block is:

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

### What the config means

**`listen 8080`:** NGINX listens for browser or curl traffic on port `8080`.

**`server_name localhost`:** This server block handles local requests to `localhost`.

**`location /`:** This matches the app routes for this lab.

**`proxy_pass http://127.0.0.1:5000`:** NGINX forwards the request to Flask on port `5000`.

**`proxy_set_header Host $host`:** Preserves the original host header.

**`proxy_set_header X-Real-IP $remote_addr`:** Sends Flask the client IP address NGINX saw.

**`proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for`:** Keeps the chain of client/proxy IP addresses.

**`proxy_set_header X-Forwarded-Proto $scheme`:** Tells Flask whether the original request used `http` or `https`.

**`proxy_set_header X-Request-ID $request_id`:** Sends a request ID downstream so one request can be correlated across NGINX, Flask, and the client response.

These headers are customizable. The essence is that NGINX can forward the request and preserve useful context about the original client request.

### NGINX functionality

NGINX is often used for more than one job:

- **Reverse proxy:** receives client traffic and forwards it to an upstream app.
- **SSL termination:** handles HTTPS/TLS at the edge before forwarding to the app.
- **Static web server:** serves files like HTML, CSS, JavaScript, and images.
- **Load balancer:** distributes traffic across multiple upstream app instances.
- **Ingress in Kubernetes:** routes external traffic into services inside a Kubernetes cluster.

In this lab, I am using NGINX as a reverse proxy first. The other roles explain why NGINX commonly appears at the front of production systems.

## Prove

**Flask direct test:**

```bash
curl http://127.0.0.1:5000
```

This proved Flask was reachable directly on port `5000`.

**NGINX proxy test:**

```bash
curl -i --max-time 3 http://127.0.0.1:8080
curl -i --max-time 5 http://127.0.0.1:8080/health
```

Important response evidence:

```text
HTTP/1.1 200 OK
Server: nginx/1.31.3
Content-Type: application/json
X-Request-ID: 6e8c60f9fd7dc6e0903910c024ea0428
```

This proved the request reached NGINX first, then NGINX routed it to Flask.

**Response headers captured:**

```text
Server: nginx/1.31.3
Content-Type: application/json
Content-Length: 77
Connection: keep-alive
X-Request-ID: b407c79ce1620eefce609310ca7a5070
```

The `Server: nginx/1.31.3` header proves the client received the response through NGINX. The `X-Request-ID` header proves NGINX added a request identifier that can be used to correlate the client response with proxy and application logs.

**Service check:**

```bash
brew services list
```

Result:

```text
nginx started
```

**Port check:**

```bash
lsof -nP -iTCP:8080 -sTCP:LISTEN
```

Result:

```text
nginx TCP *:8080 (LISTEN)
```

**NGINX access log:**

```bash
tail -f /opt/homebrew/var/log/nginx/access.log
```

Example evidence:

```text
127.0.0.1 - - [30/Jul/2026:16:52:46 -0400] "GET / HTTP/1.1" 200 4141 "-" "curl/8.7.1"
```

This proves NGINX saw the request and returned a `200` response.

**NGINX error log:**

```bash
tail -f /opt/homebrew/var/log/nginx/error.log
```

This is where I would check for config errors, startup problems, permission issues, or upstream failures when NGINX cannot reach Flask.

## Break

I completed the broken-upstream test by temporarily changing the upstream port in the NGINX config.

I changed this line:

```nginx
proxy_pass http://127.0.0.1:5000;
```

to this:

```nginx
proxy_pass http://127.0.0.1:5999;
```

I changed it inside `proxy_pass` because that directive controls where NGINX forwards matching traffic after it receives the request. NGINX still listened on `8080`, but it tried to forward the request to port `5999` instead of the Flask app on `5000`.

Then I reloaded NGINX:

```bash
/opt/homebrew/opt/nginx/bin/nginx -t
/opt/homebrew/opt/nginx/bin/nginx -s reload
```

I sent the request through NGINX:

```bash
curl -i --max-time 5 http://127.0.0.1:8080/health
```

Client response:

```text
HTTP/1.1 502 Bad Gateway
Server: nginx/1.31.3
Content-Type: text/html
```

NGINX access log:

```text
127.0.0.1 - - [30/Jul/2026:17:19:25 -0400] "GET /health HTTP/1.1" 502 497 "-" "curl/8.7.1"
```

NGINX error log:

```text
connect() failed (61: Connection refused) while connecting to upstream, upstream: "http://127.0.0.1:5999/health"
```

Direct Flask test still worked:

```bash
curl -i --max-time 5 http://127.0.0.1:5000/health
```

Direct Flask response:

```text
HTTP/1.1 200 OK
Server: Werkzeug/3.1.8 Python/3.9.6
X-Request-ID: 0fd2efdc-7942-496f-a2bc-213a735a2942
```

This proved Flask itself was healthy. The failure happened because NGINX was pointed at the wrong upstream port.

After the test, I restored the NGINX config back to:

```nginx
proxy_pass http://127.0.0.1:5000;
```

Then I reloaded NGINX and confirmed `http://127.0.0.1:8080/health` returned `200 OK` again.

## Key Takeaways

**NGINX became the front door:** I no longer had to send the request directly to Flask. I could send it to NGINX on `8080`, and NGINX routed it to Flask on `5000`.

**The request path is now visible at the proxy layer:** The NGINX access log proves the request reached the proxy before Flask.

**Headers carry context:** `Host`, `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`, and `X-Request-ID` help Flask understand the original client request after it passes through NGINX.

**`proxy_set_header` controls what NGINX forwards downstream:** These lines add or preserve headers before NGINX sends the request to Flask. I kept `proxy_set_header X-Request-ID $request_id;` because it lets NGINX generate a request ID. I removed the duplicate `proxy_set_header X-Request-ID $http_x_request_id;` because it only forwards a client-provided request ID and can be blank if the client did not send one.

**A reverse proxy gives production systems a control point:** NGINX can route traffic, serve static files, terminate SSL, load balance, and act as an ingress layer in Kubernetes.

**502 Bad Gateway means the proxy could not get a valid upstream response:** In this lab, the bad port made NGINX fail to connect to `127.0.0.1:5999`, so NGINX returned `502` even though Flask was still healthy on `5000`.

**Reverse proxy vs forward proxy:** A reverse proxy sits in front of servers and represents the server side to clients. A forward proxy sits in front of clients and represents the client side to servers.

# Request Tracing Lab

A hands-on lab for practicing HTTP request tracing, troubleshooting, and evidence-based debugging. The goal is to develop a repeatable troubleshooting process that can be applied to larger production systems.

This repository has three practice tracks and one example answer set:

```text
labs/
Practice request inspection, logs, headers, cookies, JWTs, latency, and errors.

operations/
Practice packaging, deploying, running, breaking, and fixing the app in Kubernetes.

architecture/
Practice system design, production architecture, reliability, scaling, and tradeoffs.

AnswersByGetty/
Review Getty's example answer set, or create your own named answer set.
```

This project is designed for aspiring:

* Cloud Operations Engineers
* Site Reliability Engineers
* Technical Support Engineers
* Customer Success Engineers
* DevOps and Platform Engineers

This is not primarily a Flask tutorial.

The Flask application provides a small, controlled environment where you can send requests, inspect what happened, deliberately create failures, and practice explaining where a request succeeded or failed.

---

## Objective

The objective of this project is to learn how to trace a request end to end.

The project starts with a small local Flask application so you can clearly see the request, response, logs, headers, cookies, tokens, status codes, and request IDs.

After that, the architecture exercises expand the same tracing method into larger systems, including 3-tier applications, microservices, Kubernetes, Helm, event-driven systems, and enterprise-style SaaS platforms.

You will practice using browser tools, command-line tools, application logs, headers, cookies, tokens, status codes, and request IDs to answer:

```text
What happened?
Where did the request fail?
What evidence proves it?
Which tool exposed that evidence?
What should I investigate next?
```

The goal is not simply to make the application work.
The goal is to understand what happens when it does not.

---

## What You Will Practice

You will use this project to practice:

* Inspecting requests with Chrome DevTools
* Reading HTTP methods, headers, bodies, and status codes
* Reproducing requests with `curl`
* Comparing session cookies and JWT authentication
* Correlating browser requests with application logs
* Tracing requests using `X-Request-ID`
* Investigating latency and application errors
* Distinguishing client, connection, authentication, and application failures
* Adding HTTPS and inspecting TLS behavior
* Expanding from one Flask app into 3-tier, microservice, event-driven, Kubernetes, and enterprise-style architectures

---

## Request Path

A request may pass through several layers before the client receives a response.

```text
Client
  |
  v
DNS
  |
  v
TCP connection
  |
  v
TLS handshake for HTTPS
  |
  v
HTTP request
  |
  v
Application
  |
  v
Authentication and business logic
  |
  v
HTTP response
  |
  v
Client
```

The current lab runs locally, so some layers are simplified.

As the architecture grows, more components and possible failure points can be added.

---

## Current Architecture

```text
Browser or curl
       |
       v
Flask application
       |
       v
Application logs
```

The application currently runs at:

```text
http://127.0.0.1:5000
```

The starting architecture does not include a database, reverse proxy, load balancer, Redis, containers, or Kubernetes.

Those components can be added later as architecture exercises.

---

## Lab Features

The application includes controlled examples for practicing:

| Feature         | Purpose                                    |
| --------------- | ------------------------------------------ |
| Health endpoint | Trace a successful request                 |
| Session login   | Inspect POST requests and cookies          |
| Session profile | Test cookie-based authentication           |
| JWT login       | Generate and inspect a JWT                 |
| JWT profile     | Test bearer-token authentication           |
| Slow endpoint   | Investigate latency                        |
| Error endpoint  | Trace an application failure               |
| Request IDs     | Correlate client requests with server logs |
| Local HTTPS     | Inspect TLS and certificate behavior       |

---

## Lab Credentials

The login credentials are intentionally hard-coded for this local lab:

```text
username: getty
password: cloud
```

They are used by both the session-login and JWT-login examples.

To change them, update:

* The browser button request bodies in `app.py`
* The credential checks in the `/session/login` and `/jwt/login` routes in `app.py`

These credentials are for local learning only. Do not reuse real passwords or production secrets in this project.

---

## Runtime Configuration

Local defaults work with:

```bash
python app.py
```

For container and Kubernetes exercises, the app can read:

```text
FLASK_RUN_HOST
FLASK_RUN_PORT
FLASK_DEBUG
FLASK_SECRET_KEY
JWT_SECRET
```

In a container, `FLASK_RUN_HOST` should usually be:

```text
0.0.0.0
```

Secrets such as `FLASK_SECRET_KEY` and `JWT_SECRET` should be provided through environment variables or Kubernetes Secrets, not baked into the image.

---

## Project Structure

```text
request-tracing-lab/
|
|-- app.py
|-- requirements.txt
|-- README.md
|-- labs/
|-- operations/
|-- architecture/
|-- AnswersByGetty/
```

Start with `labs/` when you want request-level practice.
Use `operations/` when you want packaging, Kubernetes, Helm, deployment, and live troubleshooting practice.
Use `architecture/` when you want system design, production architecture, scaling, and tradeoff practice.
Use `AnswersByGetty/` only after attempting the exercises.

If you are completing this as your own portfolio project, create your own answer directory:

```text
AnswersByYourName/
```

Use that directory for your notes, investigation evidence, diagrams, key takeaways, and final explanations.

---

## Requirements

Before starting, make sure you have:

* Python 3
* `pip`
* A web browser with Developer Tools
* `curl`
* OpenSSL for the HTTPS exercises
* Git, if cloning the repository

---

## Installation

### 1. Fork or clone the repository

```bash
git clone https://github.com/gettyhongla/request-tracing-lab.git
cd request-tracing-lab
```

You may also download the repository as a ZIP file and extract it.

### 2. Create a virtual environment

```bash
python3 -m venv venv
```

### 3. Activate the virtual environment

macOS or Linux:

```bash
source venv/bin/activate
```

Windows PowerShell:

```powershell
venv\Scripts\Activate.ps1
```

### 4. Install the dependencies

```bash
python -m pip install -r requirements.txt
```

### 5. Start the application

```bash
python app.py
```

The terminal should show that the application is running at:

```text
http://127.0.0.1:5000
```

### 6. Open the application

Visit:

```text
http://127.0.0.1:5000
```

Keep the Flask terminal open while completing the exercises.

The browser shows the client side of the request.

The Flask terminal shows the server side.

---

## Start the Exercises

Open:

```text
labs/README.md
```

Complete the exercises in order.

The request-tracing exercises begin with a successful request and gradually introduce:

1. Browser DevTools
2. Request and response headers
3. Request IDs
4. GET and POST requests
5. Cookies and sessions
6. JWT authentication
7. Reproducing requests with `curl`
8. Latency investigation
9. Application errors
10. Failure injection
11. HTTPS and TLS

Do not begin by reading `AnswersByGetty/`.

Try to investigate each scenario using evidence first.

---

## Investigation Method

For every request, try to answer:

```text
What request was sent?
Did the connection succeed?
Did the application receive the request?
What status code was returned?
What headers and body were returned?
Was authentication required?
Was a cookie or token present?
What request ID was assigned?
What appeared in the application logs?
Which layer failed?
What evidence supports that conclusion?
```

Avoid guessing based only on the error message.
Use the browser, `curl`, response headers, status codes, timing information, and application logs together.

---

## Useful Tools

### Chrome DevTools

Use the Network tab to inspect:

* Request URL
* HTTP method
* Status code
* Request headers
* Request payload
* Response headers
* Response body
* Cookies
* Timing

### `curl`

Use `curl` to reproduce requests outside the browser.

Example:

```bash
curl -v http://127.0.0.1:5000/health
```

### Flask logs

Use the terminal running Flask to inspect:

* Incoming requests
* Request paths
* HTTP methods
* Request IDs
* Response status codes
* Application exceptions

### Request IDs

The application returns an:

```http
X-Request-ID
```

response header.

Use that value to find the matching request in the Flask logs.

---

## Recommended Practice

Complete the request-tracing exercises more than once.

1. Follow the instructions and become familiar with the tools.

2. Repeat the exercises without reading the explanations.

3. Deliberately break several requests and diagnose each failure using evidence.

For every failure, record:

```text
What broke?
Where did it break?
What evidence proved it?
Which tool exposed the evidence?
What fixed it?
```

---

## After The Request Labs

After completing the request-tracing exercises, choose the track that matches what you want to practice next.

For hands-on operations, packaging, Kubernetes, and Helm, use:

```text
operations/README.md
```

For system design, architecture diagrams, scaling, and tradeoff reasoning, use:

```text
architecture/README.md
```

The operations track focuses on:

```text
Docker
Kubernetes
Helm
Ingress
Deployments
Services
Pods
Probes
Secrets
Logs and events
Live troubleshooting
```

The architecture track focuses on:

```text
Reverse proxies
Databases
Redis/session state
High availability
Distributed tracing
Microservices
Event-driven architecture
Enterprise-style SaaS architecture
```

Each new component creates additional request paths, logs, metrics, dependencies, tradeoffs, and possible failure points.

The purpose of expanding the architecture is to practice answering the same core questions in a more complex system:

```text
Where did the request go?

Where did it fail?

What evidence proves it?
```

---

## Completion Goal

You have completed the project when you can trace a request and clearly explain:

* The request method, path, headers, and body
* The response status, headers, and body
* Whether cookies or tokens were involved
* Whether the failure occurred before or inside the application
* How the request ID connects the client response to the server logs
* Which tool provided the evidence
* What you would investigate next

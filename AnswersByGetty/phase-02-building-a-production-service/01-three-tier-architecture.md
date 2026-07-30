# Lab 01: Three-Tier Architecture

## Build

### 1. Component View

This view shows the major components I am about to build.

```mermaid
flowchart LR
    Browser["Browser / curl"]
    NGINX["NGINX<br/>Reverse Proxy"]
    Flask["Flask API<br/>Application Logic"]
    Postgres["PostgreSQL<br/>Durable Data Store"]

    Browser -->|"HTTP request"| NGINX
    NGINX -->|"Proxy request"| Flask
    Flask -->|"SQL query"| Postgres
    Postgres -->|"Query results"| Flask
    Flask -->|"JSON response"| NGINX
    NGINX -->|"HTTP response"| Browser
```

### 2. Request-Tracing View

This view follows one request through the system and shows where evidence should appear.

```mermaid
flowchart TD
    A["Client<br/>GET /api/profile<br/>Request ID: abc123"]
    B["NGINX<br/>Access log<br/>Request ID: abc123"]
    C["Flask API<br/>Application log<br/>Request ID: abc123"]
    D["PostgreSQL<br/>Query evidence<br/>Request ID carried in app context"]
    E["Flask API<br/>JSON response<br/>Request ID: abc123"]
    F["NGINX<br/>Response log<br/>Request ID: abc123"]
    G["Client<br/>HTTP response<br/>Request ID: abc123"]

    A --> B
    B --> C
    C --> D
    D --> C
    C --> E
    E --> F
    F --> G
```

### 3. Request Path

For a successful `GET /api/profile` request:

1. The client sends an HTTP request to the application.
2. NGINX accepts the request as the public entry point.
3. NGINX forwards the request to the Flask API.
4. Flask validates the request and runs the application logic.
5. Flask queries PostgreSQL for the required data.
6. PostgreSQL returns the query result to Flask.
7. Flask formats the result as JSON.
8. NGINX returns the HTTP response to the client.

### 4. Layer Responsibilities

| Layer | Job | Evidence |
| --- | --- | --- |
| Browser or curl | Send the request and display the response | URL, method, status code, headers, response body, timing |
| NGINX | Accept public traffic and proxy requests to Flask | Access logs, upstream status, request ID, latency |
| Flask API | Run business logic and call dependencies | Application logs, request ID, route, status code, app latency |
| PostgreSQL | Store durable application data and answer SQL queries | Query result, query latency, database errors |

### 5. Request ID Plan

The same request ID should appear in:

```text
Client response headers
NGINX access logs
Flask application logs
Database-related application logs
```

The goal is to follow one request across every layer instead of guessing which log lines belong together.

## Prove

Write a short explanation for each layer:

**Browser or curl:**

The browser or curl acts as the client. It sends an HTTP request, such as `GET /api/profile`, to the application and displays the HTTP response, including the status code, headers, timing, and any JSON returned by the API.

**NGINX:**

NGINX acts as a reverse proxy. It accepts incoming client requests, forwards them to the Flask API, and returns the backend response to the client. NGINX also generates access logs, can forward request IDs, and provides a single public entry point to the application.

**Flask API:**

The Flask API contains the application's business logic. It receives requests from NGINX, validates authentication and authorization, processes the request, queries PostgreSQL for the required data, and returns a JSON response to the client.

**PostgreSQL:**

PostgreSQL is the application's durable data store. It stores user and application data, executes SQL queries from the Flask API, and returns the requested records. PostgreSQL is a backend service and is not directly accessible to clients.

## Break

Before building, predict symptoms:

**If NGINX cannot reach Flask:**

The user may receive a `502 Bad Gateway` response.

**What that means:**

This means NGINX accepted the client's request but could not obtain a valid response from its upstream Flask application. Possible causes include the Flask application being unavailable, listening on the wrong port, an incorrect upstream configuration, or a network connectivity issue.

**If Flask cannot reach PostgreSQL:**

The user will usually receive a `500 Internal Server Error` because Flask cannot complete the request after failing to communicate with the database.

**Possible alternate symptom:**

Depending on the application's error handling, some applications may instead return a `503 Service Unavailable` response.

**If PostgreSQL is slow:**

The user experiences slow page loads, delayed API responses, request timeouts, or possibly a `5xx` response if the application exceeds its configured timeout while waiting for the database.

**What that means:**

A `5xx` status code indicates that the server was unable to successfully complete the request.

**If request IDs are missing:**

Troubleshooting becomes significantly more difficult because it is no longer possible to correlate a single client request across NGINX logs, Flask application logs, and database-related logs.

**Why request IDs matter:**

Request IDs allow us to trace one request throughout the entire system.

## Evidence To Capture

```text
Architecture diagram:
Component view:
Request path:
Layer responsibilities:
Expected logs:
Expected metrics:
Expected failure symptoms:
Interview explanation:
Retained takeaway:
```

## Retained Takeaway

A three-tier architecture is not just a list of components. It is a request path. To explain it well, I need to know where the request enters, which layer handles each responsibility, what evidence each layer produces, and how failures appear to the user.

# Lab 01: Three-Tier Architecture

Start with the mental model before writing code.

You are designing the first production-style version of the app:

```text
Browser or curl -> NGINX -> Flask API -> PostgreSQL
```

## Build

Do not install anything new yet. Create the design you are about to build.

1. Draw the architecture.
2. Label each layer's job.
3. Define the request path for one successful login or API request.
4. Define where request IDs should appear.
5. Define what evidence each layer should produce.

## Prove

Write a short explanation for each layer:

```text
Browser or curl:
NGINX:
Flask API:
PostgreSQL:
```

## Break

Before building, predict symptoms:

```text
If NGINX cannot reach Flask, the user sees:
If Flask cannot reach PostgreSQL, the user sees:
If PostgreSQL is slow, the user sees:
If request IDs are missing, the investigation is harder because:
```

## Done When

You can explain the architecture without reading the diagram.

## Evidence To Capture

```text
Architecture diagram:
Request path:
Layer responsibilities:
Expected logs:
Expected metrics:
Expected failure symptoms:
Interview explanation:
Retained takeaway:
```

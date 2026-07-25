# Trace Report: Lab 04 - Compare GET And POST

## Purpose

Compare a successful `GET` request with a successful `POST` request.

This trace shows the difference between retrieving information and submitting information, and why method, body, content type, and cookies matter when interpreting request behavior.

## GET Request

```text
Method: GET
Path: /health
Request Content-Type: None observed
Request body: None
Response status: 200 OK
```

`GET /health` retrieved information from the server. It did not send a request body, so it did not need a request `Content-Type`.

## POST Request

```text
Method: POST
Path: /session/login
Content-Type: application/json
Response status: 200 OK
```

Request body:

```json
{
  "username": "getty",
  "password": "cloud"
}
```

Response body:

```json
{
  "message": "session login successful",
  "request_id": "f9018f3b-d1c6-4006-ba34-5193d9e8fd11"
}
```

`POST /session/login` submitted JSON credentials and created login state.

## Comparison

| Question | `/health` | `/session/login` |
| --- | --- | --- |
| HTTP method | GET | POST |
| Purpose | Retrieve application health data | Submit credentials and create login state |
| Request body present? | No | Yes |
| Request content type | None observed | `application/json` |
| Creates login state? | No | Yes |
| Response status | 200 OK | 200 OK with correct credentials |

## Reproduced Request Evidence

Copied browser request:

```text
URL: http://127.0.0.1:5000/session/login
Method: POST, implied by --data-raw
```

In `curl`, `--data`, `--data-raw`, and `-d` automatically send a `POST` request unless another method is specified.

Headers:

```http
Accept: */*
Accept-Language: en-US,en;q=0.9
Cache-Control: no-cache
Connection: keep-alive
Content-Type: application/json
Origin: http://127.0.0.1:5000
Pragma: no-cache
Referer: http://127.0.0.1:5000/
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
X-Client-Name: browser-lab
```

Request body:

```json
{"username":"getty","password":"cloud"}
```

Cookies, if present:

```http
session=eyJ1c2VybmFtZSI6ImdldHR5In0...
```

## What This Confirms

```text
GET:
Used here to retrieve health data. No request body was sent.

POST:
Used here to submit credentials. POST does not always create a database resource.

Content-Type:
Tells the server how to parse the request body.

curl --data-raw:
Makes curl send a POST request unless another method is specified.

Copied browser cookies:
If copied curl includes -b, curl is sending browser cookie state with the request.
```

## Retained Takeaway

GET `/health` retrieved information without a request body. POST `/session/login` submitted a JSON request body containing credentials and created login state.

Phase 2 bridge:
When NGINX and PostgreSQL are added, method, body, content type, and cookies still determine what the application can safely parse and process.

# Lab 4: Compare GET and POST

## Task 1: Inspect GET

```text
Method:
GET

Path:
/health

Content-Type request header, if present:
None observed. The GET request did not send a body, so it did not need a request Content-Type.

Request body:
None

Response status:
200 OK
```

## Task 2: Inspect POST

```text
Method:
POST

Path:
/session/login

Content-Type:
application/json
```

Request body:

```json
{
  "username": "getty",
  "password": "cloud"
}
```

```text
Response status:
200 OK
```

Response body:

```json
{
  "message": "session login successful",
  "request_id": "f9018f3b-d1c6-4006-ba34-5193d9e8fd11"
}
```

## Compare

| Question              | `/health`                         | `/session/login`                                      |
| --------------------- | --------------------------------- | ----------------------------------------------------- |
| HTTP method           | GET                               | POST                                                  |
| Purpose               | Retrieve application health data  | Submit credentials and create login state             |
| Request body present? | No                                | Yes                                                   |
| Request content type  | None observed                     | `application/json`                                    |
| Creates login state?  | No                                | Yes                                                   |
| Response status       | 200 OK                            | 200 OK with correct credentials                       |

## Questions

1. Which request retrieved information?

`GET /health` retrieved information from the server.

2. Which request submitted information?

`POST /session/login` submitted information to the server. It sent a JSON request body containing a username and password.

3. Where did DevTools display the POST body?

DevTools displayed the POST body in the Payload tab for the `/session/login` request.

4. Why was `Content-Type` important for the POST request?

`Content-Type: application/json` told Flask that the request body was JSON. That allowed the application to parse the submitted username and password correctly.

5. Does every POST request create a resource?

No. A POST request often submits data, but it does not always create a new resource. In this lab, `POST /session/login` creates login state rather than a new database record.

6. Does every GET request return JSON?

No. A GET request can return HTML, JSON, images, files, redirects, errors, or other response types. In this lab, `/health` returns JSON, but `/` returns HTML.

## Reproduce the Request

### Copied Request Breakdown

```text
URL:
http://127.0.0.1:5000/session/login

Method:
POST, implied by --data-raw
```

In `curl`, when you include `--data`, `--data-raw`, or `-d`, `curl` automatically sends a `POST` request unless another method is specified.

### Headers

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

### Request Body

```json
{"username":"getty","password":"cloud"}
```

### Cookies, If Present

```http
session=eyJ1c2VybmFtZSI6ImdldHR5In0...
```

## Conclusion

```text
The main difference I observed between GET and POST was:
GET /health retrieved information without a request body. POST /session/login submitted a JSON request body containing credentials and created login state on the server.

The browser represented the POST body as:
A JSON payload in the DevTools Payload tab:
{"username":"getty","password":"cloud"}
```

## Key Takeaways

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

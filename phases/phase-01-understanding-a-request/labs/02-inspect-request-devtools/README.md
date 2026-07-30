# Lab 02: Inspect Request In DevTools

## Goal

Use browser DevTools to separate request evidence from response evidence.

## Start The App

```bash
cd /Users/heavenlygetty/Documents/request-tracing-lab
source venv/bin/activate
python app.py
```

## Trigger The Request

Open the app in a browser:

```text
http://127.0.0.1:5000/
```

Then open DevTools, go to the Network tab, refresh the page, and inspect the main document request.

## Compare With curl

Run the same request from the terminal:

```bash
curl -i \
  -H "X-Request-ID: lab-02-inspect-request-devtools" \
  http://127.0.0.1:5000/
```

## Evidence To Collect

```text
DevTools request method, URL, and status:
One request header that explains what the browser sent:
One response header or body field that explains what Flask returned:
curl status and response shape:
Browser and curl comparison:
```

## Hint

DevTools is strongest for seeing what the browser actually sent. `curl` is strongest for reproducing the same request with fewer browser-added headers.

## Completion Standard

You are done when you can explain what the browser sent, what `curl` sent, what Flask returned, and which parts of DevTools describe the request versus the response.

## Write Your Answer

Use:

```text
AnswersByGetty/phase-01-understanding-a-request/phase-1-observe-successful-requests/lab-02-inspect-request-devtools.md
```

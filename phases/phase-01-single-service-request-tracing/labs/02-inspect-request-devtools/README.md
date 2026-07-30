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

## Evidence To Collect

```text
Request URL:
Request method:
Remote address:
Status code:
Important request headers:
Important response headers:
Response body or preview:
Was a request body sent:
```

## Completion Standard

You are done when you can explain what the browser sent, what Flask returned, and which parts of DevTools describe the request versus the response.

## Write Your Answer

Use:

```text
AnswersByGetty/phase-01-single-service-request-tracing/phase-1-observe-successful-requests/lab-02-inspect-request-devtools.md
```

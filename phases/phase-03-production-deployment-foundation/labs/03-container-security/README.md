# 03: Container Security

Goal:

```text
Evaluate whether the container is safe enough to promote toward production.
```

Review:

* Base image choice
* Dependency pinning
* Vulnerability scanning
* Non-root runtime user
* Exposed ports
* Runtime command
* Files copied into the image
* Secrets kept out of the image
* Logs written to stdout/stderr

Blockers:

```text
Secrets baked into image.
Local `.env`, keys, cookies, Git metadata, or venv copied into image.
Container requires root without a clear reason.
No known way to rebuild the image from source.
No vulnerability review before promotion.
```

Completion standard:

```text
You can identify container risks and explain which ones block production.
```

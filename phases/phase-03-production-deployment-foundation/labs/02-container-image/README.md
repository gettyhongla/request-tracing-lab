# 02: Container Image

Goal:

```text
Build and run the Flask app as a repeatable container image.
```

Practice:

* Build the image from the project `Dockerfile`.
* Use `.dockerignore` to keep local-only files out of the build context.
* Run the container with runtime environment variables.
* Map host port to container port intentionally.
* Test `/health` from outside the container.
* Inspect container logs.

Production question:

```text
Can this image be rebuilt, deployed, inspected, and rolled back predictably?
```

Completion standard:

```text
You can explain image build, container runtime, host port, container port, environment variables, and container logs.
```

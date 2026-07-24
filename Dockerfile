FROM python:3.12-slim

# Do not write .pyc bytecode files, and send logs to stdout/stderr immediately.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FLASK_RUN_HOST=0.0.0.0 \
    FLASK_RUN_PORT=5001 \
    FLASK_DEBUG=false

WORKDIR /app

RUN addgroup --system app && adduser --system --ingroup app app

COPY requirements.txt .
RUN python -m pip install --no-cache-dir --upgrade pip \
    && python -m pip install --no-cache-dir -r requirements.txt

COPY app.py .

USER app

EXPOSE 5001

# Health check timing:
# --interval=30s checks every 30 seconds.
# --timeout=3s fails a check if it takes longer than 3 seconds.
# --start-period=5s gives the app 5 seconds to start before failures count.
# --retries=3 marks the container unhealthy after 3 failed checks.
#
# urllib.request.urlopen(...) calls the app's own /health endpoint from inside
# the container. If the request fails or times out, the health check fails.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import os, urllib.request; urllib.request.urlopen(f'http://127.0.0.1:{os.environ.get(\"FLASK_RUN_PORT\", \"5001\")}/health', timeout=2).read()" || exit 1

CMD ["python", "app.py"]

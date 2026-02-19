FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Copy requirements first for layer caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY main.py .

# Create data directory
RUN mkdir -p /app/data

# Run as non-root user for security
RUN useradd --create-home --shell /bin/sh appuser \
    && chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD python -c "\
import json, sys; \
try: \
    d = json.load(open('/app/data/status.json')); \
    sys.exit(0 if d.get('uptime_check') == 'ok' else 1); \
except (FileNotFoundError, json.JSONDecodeError, KeyError): \
    sys.exit(1)"

ENV PYTHONUNBUFFERED=1 \
    LOG_LEVEL=INFO \
    POLL_INTERVAL=30

CMD ["python", "main.py"]

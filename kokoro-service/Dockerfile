# Kokoro TTS service - production Docker image
# Uses Python 3.11 slim, installs espeak-ng, and keeps the image small.

FROM python:3.11-slim

# Avoid interactive prompts during apt-get install
ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    KOKORO_LANG_CODE=a \
    KOKORO_WARM_ON_START=false

# Install system dependencies:
# - espeak-ng: required by Kokoro/misaki for G2P phoneme fallback
# - libsndfile1: required by soundfile to read/write audio
# - build-essential + libffi-dev: may be needed by some Python wheels
RUN apt-get update && apt-get install -y --no-install-recommends \
    espeak-ng \
    libsndfile1 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Python dependencies
# We use the CPU-only PyTorch index to keep the image small.
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY main.py .

# Expose the port that Uvicorn will listen on (Render sets $PORT at runtime)
EXPOSE 8000

# Run the FastAPI app with Uvicorn (Render injects $PORT at runtime)
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}

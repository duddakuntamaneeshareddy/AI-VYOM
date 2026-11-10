# Kokoro TTS Service

A production-hardened FastAPI wrapper around the [Kokoro 82M](https://huggingface.co/hexgrad/Kokoro-82M) text-to-speech model. This service powers the AI VYOM Next.js app and is designed to run on Render's free tier.

## Features

- `POST /synthesize` – convert text into a WAV/MP3 audio file
- `GET /warm` – pre-load the model + default voice to reduce cold-start latency
- `GET /voices` – discover available Kokoro voices
- `POST /synthesize/stream` – stream base64 WAV chunks via SSE for future real-time playback
- `GET /health` – readiness probe used by Render
- CORS, GZIP, simple per-IP rate limiting, and request logging
- Lazy model loading with an optional start-up warm-up flag
- Docker + Render Blueprint support

---

## Quick Start (Local Development)

The easiest way to run locally is the provided `start.sh` script:

```bash
cd kokoro-service
chmod +x start.sh
./start.sh
```

The script will:

1. Check for `espeak-ng` and offer to install it on Linux.
2. Create a Python virtual environment (`.venv`).
3. Install dependencies from `requirements.txt`.
4. Start Uvicorn with `--reload` on `http://localhost:8000`.

### Manual Setup

1. Create and activate a virtual environment:

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Install `espeak-ng`:

   - Ubuntu/Debian: `sudo apt-get install espeak-ng libsndfile1`
   - macOS: `brew install espeak-ng`
   - Windows: [espeak-ng releases](https://github.com/espeak-ng/espeak-ng/releases)

4. Run the server:

   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

---

## API Documentation

Interactive docs are available at `http://localhost:8000/docs` when the server is running.

### `GET /health`

Readiness probe. Forces the model to load on the first call, so expect it to be slow initially.

**Response:**

```json
{
  "status": "ok",
  "device": "cpu",
  "model_loaded": true,
  "voices_loaded": ["af_bella"],
  "espeak_available": true
}
```

### `GET /warm`

Pre-loads the Kokoro model and the default voice (`af_bella`). Call this from the Next.js app on page load to reduce the latency of the first `/synthesize` request.

**Response:**

```json
{
  "status": "ok",
  "device": "cpu",
  "message": "Model and voice 'af_bella' are ready."
}
```

### `GET /voices`

Lists the curated catalogue of Kokoro voices.

**Response:**

```json
{
  "voices": [
    { "id": "af_bella", "language": "American English", "gender": "Female", "quality": "A-" },
    { "id": "am_michael", "language": "American English", "gender": "Male", "quality": "C+" }
  ],
  "default": "af_bella",
  "count": 20
}
```

### `POST /synthesize`

Synthesize text into an audio file.

**Request body:**

```json
{
  "text": "Welcome to AI VYOM. How can I help you today?",
  "voice": "af_bella",
  "speed": 1.0,
  "output_format": "wav"
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `text` | string | required | Text to synthesize (1–5000 characters) |
| `voice` | string | `af_bella` | Kokoro voice ID |
| `speed` | float | `1.0` | Playback speed, 0.5–2.0 |
| `output_format` | string | `wav` | `wav` or `mp3` (mp3 currently falls back to WAV) |

**Response:** binary `audio/wav` or `audio/mpeg` file.

**cURL example:**

```bash
curl -X POST http://localhost:8000/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello from AI VYOM","voice":"af_bella"}' \
  --output speech.wav
```

### `POST /synthesize/stream`

Stream audio chunks as they are generated. Returns Server-Sent Events (SSE). Each event's `data` field contains a base64-encoded WAV chunk. The final event has type `done`.

**Request body:** same as `/synthesize`.

**Event format:**

```text
id: 0
data: <base64-wav-chunk>

id: 1
data: <base64-wav-chunk>

event: done
data: {}
```

**JavaScript example:**

```javascript
const es = new EventSource('/synthesize/stream', {
  // EventSource does not support POST natively; use a fetch polyfill or libraries like @microsoft/fetch-event-source
})
```

For a full POST-capable SSE client, use [`eventsource-parser`](https://www.npmjs.com/package/eventsource-parser) or [`fetch-event-source`](https://www.npmjs.com/package/@microsoft/fetch-event-source).

---

## Deploy to Render (Native Python)

1. Push this `kokoro-service/` folder to a Git repository.
2. In the Render Dashboard, click **New +** → **Blueprint** and connect the repo.
3. Render reads `render.yaml` and creates the `ai-vyom-tts` web service.
4. On first deploy the model is downloaded on demand; the initial `/warm` or `/synthesize` call may take 30–60 seconds.

The included `render.yaml`:

```yaml
services:
  - type: web
    name: ai-vyom-tts
    runtime: python
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: KOKORO_LANG_CODE
        value: a
      - key: KOKORO_WARM_ON_START
        value: "false"
      - key: PYTHONUNBUFFERED
        value: "1"
    healthCheckPath: /health
    maxShutdownDelaySeconds: 60
```

> **Note:** `KOKORO_WARM_ON_START` is `false` by default so the free-tier instance boots quickly. Have your Next.js frontend call `/warm` after page load.

---

## Deploy to Render (Docker)

If you prefer a containerized deployment:

1. Create a new **Web Service** on Render.
2. Select **Build and deploy from a Git repository** and connect the repo.
3. Set **Runtime** to **Docker**.
4. Set **Root Directory** to `kokoro-service`.
5. Deploy.

Render will use the included `Dockerfile`, which installs `espeak-ng` and the CPU-only PyTorch wheel to keep the image small.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8000` | HTTP port (set automatically by Render) |
| `KOKORO_LANG_CODE` | `a` | Kokoro language code. `a` = American English, `b` = British English |
| `KOKORO_WARM_ON_START` | `false` | If `true`, load the model at boot time |
| `NEXT_PUBLIC_APP_URL` | — | When set, CORS is restricted to this origin |
| `PYTHONUNBUFFERED` | — | Set to `1` so logs appear immediately on Render |

---

## Next.js Integration

The AI VYOM Next.js app already talks to this service through `src/lib/tts/kokoro.ts`:

```typescript
const service = new KokoroTTSService(process.env.KOKORO_SERVICE_URL)
const audioBuffer = await service.synthesize('Hello!', 'af_bella')
```

Set `KOKORO_SERVICE_URL` in your Next.js environment to the Render URL, e.g.:

```env
KOKORO_SERVICE_URL=https://ai-vyom-tts.onrender.com
```

To reduce cold-start latency, call `/warm` from a server action or `useEffect` when the page mounts:

```typescript
useEffect(() => {
  fetch(`${process.env.KOKORO_SERVICE_URL}/warm`).catch(() => {})
}, [])
```

---

## Rate Limiting

A simple in-memory rate limiter enforces **10 requests per minute per IP**. The limiter respects `X-Forwarded-For`, so it works correctly behind Render's proxy. If the limit is exceeded the service returns HTTP `429 Too Many Requests`.

---

## Voice List

Recommended voices for the demo:

| Voice | Language | Gender | Quality |
|-------|----------|--------|---------|
| `af_bella` | American English | Female | A- (default) |
| `af_heart` | American English | Female | A |
| `af_nicole` | American English | Female | B- (headphones/close-mic) |
| `am_michael` | American English | Male | C+ |
| `am_fenrir` | American English | Male | C+ |
| `bf_emma` | British English | Female | B- |
| `bm_george` | British English | Male | C |

See `GET /voices` for the complete list.

---

## Troubleshooting

### `espeak-ng` not found

Kokoro's `misaki` G2P layer uses `espeak-ng` as a fallback for out-of-dictionary words. If it is missing:

- **Local:** run `./start.sh` and let it install `espeak-ng`, or install it manually.
- **Docker:** already installed in the `Dockerfile`.
- **Render native:** Render's Python environment does not include `espeak-ng`. If you need it, use the **Docker** deployment path.

The service will still work without `espeak-ng`, but unusual words may be skipped or mispronounced.

### Cold starts / first request is slow

The Kokoro model and voices are downloaded from Hugging Face on first use. To hide this latency:

- Call `/warm` from the frontend after page load.
- Set `KOKORO_WARM_ON_START=true` to warm up at boot (slower deploy, faster first request).

### Render free-tier memory limits

Render free instances have 512 MB RAM. The Kokoro model is small (~82 M params) and the CPU-only PyTorch wheel fits, but memory is tight. If you see OOM errors:

- Use the `Dockerfile` build with `torch==2.5.1+cpu`.
- Avoid warming multiple voices at once.
- Consider a paid Render plan for heavier traffic.

### `ModuleNotFoundError: No module named 'soundfile'`

`soundfile` requires the `libsndfile1` system library. Install it:

```bash
sudo apt-get install libsndfile1
```

### CUDA errors

The service detects CUDA automatically. If CUDA is requested but fails, it falls back to CPU. For deployments, the CPU-only wheel in `requirements.txt` avoids pulling in large CUDA binaries.

---

## Testing

Run the included test script after starting the service locally:

```bash
python test_service.py
```

It checks `/health`, `/warm`, `/voices`, and `/synthesize`.

---

## License

This service wraps the Apache-licensed Kokoro model. See the upstream [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) repository for model weights and terms.

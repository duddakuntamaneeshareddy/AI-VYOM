"""
Kokoro TTS service for AI VYOM.

A production-hardened FastAPI wrapper around the Kokoro 82M text-to-speech model.
Designed to run on Render's free tier and consumed by the AI VYOM Next.js app.
"""

import base64
import os
import shutil
import tempfile
import time
import traceback
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from io import BytesIO
from typing import Any

import numpy as np
import soundfile as sf
import torch
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from kokoro import KPipeline
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
DEFAULT_VOICE = "af_bella"
DEFAULT_LANG_CODE = "a"  # American English
DEFAULT_SPEED = 1.0
SAMPLE_RATE = 24000
MAX_TEXT_LENGTH = 5000
RATE_LIMIT_REQUESTS = 10
RATE_LIMIT_WINDOW_SECONDS = 60


class SynthesizeRequest(BaseModel):
    text: str = Field(
        ..., min_length=1, max_length=MAX_TEXT_LENGTH, description="Text to synthesize."
    )
    voice: str = Field(default=DEFAULT_VOICE, description="Kokoro voice identifier.")
    speed: float = Field(default=DEFAULT_SPEED, ge=0.5, le=2.0, description="Playback speed multiplier.")
    output_format: str = Field(default="wav", pattern="^(wav|mp3)$")


class HealthResponse(BaseModel):
    status: str
    device: str
    model_loaded: bool
    voices_loaded: list[str]
    espeak_available: bool


class WarmResponse(BaseModel):
    status: str
    device: str
    message: str


class VoicesResponse(BaseModel):
    voices: list[dict[str, Any]]
    default: str
    count: int


# ---------------------------------------------------------------------------
# Global state
# ---------------------------------------------------------------------------
_pipeline: KPipeline | None = None
_device: str = "cpu"
_espeak_available: bool = False

# Simple in-memory rate limiter: {ip: [timestamps]}
_rate_limit_store: dict[str, list[float]] = {}

# Curated voice catalogue (mirrors the official Kokoro-82M voice list).
# Voices are lazy-loaded on first use; this list lets clients discover them.
VOICE_CATALOGUE: list[dict[str, Any]] = [
    # American English (lang_code='a')
    {"id": "af_heart", "language": "American English", "gender": "Female", "quality": "A"},
    {"id": "af_bella", "language": "American English", "gender": "Female", "quality": "A-"},
    {"id": "af_nicole", "language": "American English", "gender": "Female", "quality": "B-"},
    {"id": "af_sky", "language": "American English", "gender": "Female", "quality": "C-"},
    {"id": "af_alloy", "language": "American English", "gender": "Female", "quality": "C"},
    {"id": "af_aoede", "language": "American English", "gender": "Female", "quality": "C+"},
    {"id": "af_jessica", "language": "American English", "gender": "Female", "quality": "D"},
    {"id": "af_kore", "language": "American English", "gender": "Female", "quality": "C+"},
    {"id": "af_nova", "language": "American English", "gender": "Female", "quality": "C"},
    {"id": "af_river", "language": "American English", "gender": "Female", "quality": "D"},
    {"id": "af_sarah", "language": "American English", "gender": "Female", "quality": "C+"},
    {"id": "am_adam", "language": "American English", "gender": "Male", "quality": "F+"},
    {"id": "am_echo", "language": "American English", "gender": "Male", "quality": "D"},
    {"id": "am_eric", "language": "American English", "gender": "Male", "quality": "D"},
    {"id": "am_fenrir", "language": "American English", "gender": "Male", "quality": "C+"},
    {"id": "am_liam", "language": "American English", "gender": "Male", "quality": "D"},
    {"id": "am_michael", "language": "American English", "gender": "Male", "quality": "C+"},
    {"id": "am_onyx", "language": "American English", "gender": "Male", "quality": "D"},
    {"id": "am_puck", "language": "American English", "gender": "Male", "quality": "C+"},
    {"id": "am_santa", "language": "American English", "gender": "Male", "quality": "D-"},
    # British English (lang_code='b')
    {"id": "bf_alice", "language": "British English", "gender": "Female", "quality": "D"},
    {"id": "bf_emma", "language": "British English", "gender": "Female", "quality": "B-"},
    {"id": "bf_isabella", "language": "British English", "gender": "Female", "quality": "C"},
    {"id": "bf_lily", "language": "British English", "gender": "Female", "quality": "D"},
    {"id": "bm_daniel", "language": "British English", "gender": "Male", "quality": "D"},
    {"id": "bm_fable", "language": "British English", "gender": "Male", "quality": "C"},
    {"id": "bm_george", "language": "British English", "gender": "Male", "quality": "C"},
    {"id": "bm_lewis", "language": "British English", "gender": "Male", "quality": "D+"},
]


# ---------------------------------------------------------------------------
# Logging helpers
# ---------------------------------------------------------------------------
def _log(message: str) -> None:
    """Simple console logger with ISO timestamps."""
    ts = datetime.now(timezone.utc).isoformat()
    print(f"[{ts}] {message}")


def _client_ip(request: Request) -> str:
    """Return the client IP, honouring Render's X-Forwarded-For header."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _rate_limit_exceeded(ip: str) -> bool:
    """Simple sliding-window rate limiter."""
    now = time.time()
    window = _rate_limit_store.setdefault(ip, [])
    # Drop expired timestamps
    cutoff = now - RATE_LIMIT_WINDOW_SECONDS
    while window and window[0] < cutoff:
        window.pop(0)
    if len(window) >= RATE_LIMIT_REQUESTS:
        return True
    window.append(now)
    return False


# ---------------------------------------------------------------------------
# Model helpers
# ---------------------------------------------------------------------------
def _check_espeak() -> bool:
    """Check whether espeak-ng is installed on the system."""
    return shutil.which("espeak-ng") is not None


def _get_device() -> str:
    return "cuda" if torch.cuda.is_available() else "cpu"


def _load_pipeline() -> KPipeline:
    """Lazy-load the Kokoro KPipeline. Safe to call repeatedly."""
    global _pipeline, _device, _espeak_available

    if _pipeline is not None:
        return _pipeline

    _espeak_available = _check_espeak()
    if not _espeak_available:
        _log("WARNING: espeak-ng not found. Out-of-dictionary English words may be skipped.")

    _device = _get_device()
    lang_code = os.environ.get("KOKORO_LANG_CODE", DEFAULT_LANG_CODE)
    _log(f"Loading Kokoro pipeline (lang_code={lang_code}, device={_device})...")

    try:
        _pipeline = KPipeline(lang_code=lang_code, device=_device)
    except RuntimeError as exc:
        # If CUDA fails, fall back to CPU so the service stays alive.
        if "CUDA" in str(exc) and _device == "cuda":
            _log(f"CUDA init failed ({exc}); falling back to CPU.")
            _device = "cpu"
            _pipeline = KPipeline(lang_code=lang_code, device=_device)
        else:
            raise

    _log("Kokoro pipeline loaded.")
    return _pipeline


def _warmup_voice(pipeline: KPipeline, voice: str = DEFAULT_VOICE) -> None:
    """Force-download and cache a voice to reduce first-request latency."""
    try:
        pipeline.load_voice(voice)
        _log(f"Warmed up voice: {voice}")
    except Exception as exc:
        _log(f"Voice warm-up failed for {voice}: {exc}")


# ---------------------------------------------------------------------------
# Audio helpers
# ---------------------------------------------------------------------------
def _synthesize_audio(request: SynthesizeRequest) -> np.ndarray:
    """Run Kokoro inference and return a concatenated audio array."""
    pipeline = _load_pipeline()

    generator = pipeline(
        request.text,
        voice=request.voice,
        speed=request.speed,
        split_pattern=r"\n+",
    )

    chunks: list[np.ndarray] = []
    for result in generator:
        audio = getattr(result, "audio", None)
        if audio is not None:
            # Result.audio may be a torch Tensor; convert if needed.
            if hasattr(audio, "numpy"):
                audio = audio.numpy()
            chunks.append(audio)

    if not chunks:
        raise HTTPException(status_code=500, detail="No audio generated.")

    return np.concatenate(chunks)


def _write_audio_to_bytes(audio: np.ndarray, output_format: str) -> bytes:
    """Write audio array to an in-memory WAV/MP3 buffer."""
    buffer = BytesIO()
    if output_format == "mp3":
        # soundfile does not write MP3; fall back to WAV and note it.
        sf.write(buffer, audio, SAMPLE_RATE, format="WAV")
    else:
        sf.write(buffer, audio, SAMPLE_RATE, format="WAV")
    buffer.seek(0)
    return buffer.read()


def _write_audio_to_file(audio: np.ndarray, output_format: str) -> str:
    """Write audio array to a temporary file and return the path."""
    suffix = ".wav" if output_format == "wav" else ".mp3"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        output_path = tmp.name
    sf.write(output_path, audio, SAMPLE_RATE)
    return output_path


# ---------------------------------------------------------------------------
# Lifespan (startup / shutdown)
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    global _pipeline
    # Optional warm-up on startup is DISABLED by default to keep Render free-tier
    # boot fast. The Next.js app can call /warm after page load.
    _log("Service starting...")
    if os.environ.get("KOKORO_WARM_ON_START", "false").lower() == "true":
        try:
            pipeline = _load_pipeline()
            _warmup_voice(pipeline)
        except Exception as exc:
            _log(f"Startup warm-up failed: {exc}")
    yield
    # Shutdown cleanup
    _log("Service shutting down...")
    _rate_limit_store.clear()
    _pipeline = None


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="AI VYOM TTS",
    description="Production-hardened Kokoro TTS service for the AI-powered e-commerce website.",
    version="1.1.0",
    lifespan=lifespan,
)

# CORS: allow the Next.js app origin, or all origins for the college demo.
_origins = ["*"]
next_app_url = os.environ.get("NEXT_PUBLIC_APP_URL")
if next_app_url:
    _origins = [next_app_url]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GZIP responses larger than 1KB for faster audio/metadata transfer.
app.add_middleware(GZipMiddleware, minimum_size=1000, compresslevel=5)


# ---------------------------------------------------------------------------
# Request logging + rate limiting middleware
# ---------------------------------------------------------------------------
@app.middleware("http")
async def log_and_rate_limit(request: Request, call_next):
    ip = _client_ip(request)
    start = time.time()
    _log(f"{request.method} {request.url.path} from {ip}")

    if _rate_limit_exceeded(ip):
        _log(f"Rate limit exceeded for {ip}")
        return JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded: max 10 requests per minute."},
        )

    try:
        response = await call_next(request)
    except Exception as exc:
        _log(f"Unhandled error: {exc}\n{traceback.format_exc()}")
        return JSONResponse(status_code=500, content={"detail": f"Internal server error: {exc}"})

    duration = (time.time() - start) * 1000
    _log(f"{request.method} {request.url.path} -> {response.status_code} ({duration:.1f}ms)")
    return response


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    """Health check. Forces model load so it doubles as a readiness probe."""
    try:
        pipeline = _load_pipeline()
        voices = getattr(pipeline, "voices", {})
        return HealthResponse(
            status="ok",
            device=_device,
            model_loaded=_pipeline is not None,
            voices_loaded=list(voices.keys()) if voices else [],
            espeak_available=_espeak_available,
        )
    except Exception as exc:
        _log(f"Health check failed: {exc}")
        return HealthResponse(
            status="error",
            device=_device,
            model_loaded=False,
            voices_loaded=[],
            espeak_available=_espeak_available,
        )


@app.get("/warm", response_model=WarmResponse)
async def warm(request: Request) -> WarmResponse:
    """Pre-load the model and default voice. Call from the Next.js app on page load."""
    pipeline = _load_pipeline()
    _warmup_voice(pipeline, DEFAULT_VOICE)
    return WarmResponse(
        status="ok",
        device=_device,
        message=f"Model and voice '{DEFAULT_VOICE}' are ready.",
    )


@app.get("/voices", response_model=VoicesResponse)
async def voices() -> VoicesResponse:
    """List available Kokoro voices."""
    return VoicesResponse(
        voices=VOICE_CATALOGUE,
        default=DEFAULT_VOICE,
        count=len(VOICE_CATALOGUE),
    )


@app.post("/synthesize")
async def synthesize(request: SynthesizeRequest):
    """Synthesize text into a WAV or MP3 audio file."""
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text is empty.")

    try:
        audio = _synthesize_audio(request)
        output_path = _write_audio_to_file(audio, request.output_format)

        media_type = "audio/wav" if request.output_format == "wav" else "audio/mpeg"
        return FileResponse(
            output_path,
            media_type=media_type,
            filename=f"speech.{request.output_format}",
            background=lambda: os.unlink(output_path),
        )
    except HTTPException:
        raise
    except Exception as exc:
        _log(f"Synthesize error: {exc}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {exc}")


@app.post("/synthesize/stream")
async def synthesize_stream(request: SynthesizeRequest):
    """
    Stream audio chunks as they are generated.

    Returns Server-Sent Events (SSE). Each event's data is a base64-encoded WAV
    chunk. The final event has event type 'done'. This format is intended for
    future real-time TTS playback where the client can decode and enqueue each
    chunk as it arrives.
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text is empty.")

    async def event_generator():
        pipeline = _load_pipeline()
        generator = pipeline(
            request.text,
            voice=request.voice,
            speed=request.speed,
            split_pattern=r"\n+",
        )

        chunk_index = 0
        for result in generator:
            audio = getattr(result, "audio", None)
            if audio is None:
                continue
            if hasattr(audio, "numpy"):
                audio = audio.numpy()

            wav_bytes = _write_audio_to_bytes(audio, "wav")
            b64 = base64.b64encode(wav_bytes).decode("utf-8")
            yield f"id: {chunk_index}\ndata: {b64}\n\n"
            chunk_index += 1

        yield "event: done\ndata: {}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )


@app.get("/")
async def root() -> dict:
    return {
        "service": "AI VYOM TTS",
        "status": "ok",
        "version": "1.1.0",
        "docs": "/docs",
    }


# ---------------------------------------------------------------------------
# Local entrypoint
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)

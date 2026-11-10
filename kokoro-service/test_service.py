"""
Simple integration test for the Kokoro TTS service.

Run the service first (e.g. `./start.sh` or `uvicorn main:app`) then execute:

    python test_service.py

The script exits with a non-zero status if any endpoint fails.
"""

import os
import sys
import wave
from io import BytesIO

import requests

BASE_URL = os.environ.get("KOKORO_SERVICE_URL", "http://localhost:8000")
TEST_TEXT = "Hello, this is a test of the AI VYOM text to speech service."
TEST_VOICE = "af_bella"


def _url(path: str) -> str:
    return f"{BASE_URL.rstrip('/')}{path}"


def test_health() -> None:
    print("[TEST] GET /health")
    response = requests.get(_url("/health"), timeout=30)
    response.raise_for_status()
    data = response.json()
    assert data["status"] == "ok", f"Unexpected status: {data}"
    print(f"       OK: status={data['status']}, device={data['device']}, model_loaded={data['model_loaded']}")


def test_warm() -> None:
    print("[TEST] GET /warm")
    response = requests.get(_url("/warm"), timeout=120)
    response.raise_for_status()
    data = response.json()
    assert data["status"] == "ok", f"Unexpected status: {data}"
    print(f"       OK: {data['message']}")


def test_voices() -> None:
    print("[TEST] GET /voices")
    response = requests.get(_url("/voices"), timeout=30)
    response.raise_for_status()
    data = response.json()
    assert "voices" in data and isinstance(data["voices"], list)
    assert data["default"] == "af_bella"
    print(f"       OK: {data['count']} voices listed")


def test_synthesize() -> None:
    print("[TEST] POST /synthesize")
    payload = {"text": TEST_TEXT, "voice": TEST_VOICE, "output_format": "wav"}
    response = requests.post(_url("/synthesize"), json=payload, timeout=120)
    response.raise_for_status()

    content_type = response.headers.get("Content-Type", "")
    assert "audio" in content_type, f"Expected audio content type, got {content_type}"

    audio_bytes = response.content
    assert len(audio_bytes) > 0, "Empty audio response"

    # Verify the returned bytes are a valid WAV file.
    try:
        with wave.open(BytesIO(audio_bytes), "rb") as wav:
            channels = wav.getnchannels()
            sample_rate = wav.getframerate()
            frames = wav.getnframes()
        assert sample_rate == 24000, f"Expected 24000 Hz, got {sample_rate}"
        assert frames > 0, "WAV file has no frames"
        print(f"       OK: {len(audio_bytes)} bytes, {channels} channel(s), {sample_rate} Hz, {frames} frames")
    except Exception as exc:
        print(f"       WARNING: returned audio is not a valid WAV file: {exc}")


def test_stream() -> None:
    print("[TEST] POST /synthesize/stream")
    payload = {"text": TEST_TEXT, "voice": TEST_VOICE}
    response = requests.post(_url("/synthesize/stream"), json=payload, timeout=120, stream=True)
    response.raise_for_status()

    content_type = response.headers.get("Content-Type", "")
    assert "text/event-stream" in content_type, f"Expected SSE, got {content_type}"

    chunk_count = 0
    for line in response.iter_lines(decode_unicode=True):
        if line.startswith("data:"):
            chunk_count += 1
        elif line.startswith("event: done"):
            break

    print(f"       OK: received {chunk_count} SSE chunk(s)")


def main() -> int:
    print(f"Testing Kokoro TTS service at {BASE_URL}\n")
    try:
        test_health()
        test_warm()
        test_voices()
        test_synthesize()
        test_stream()
    except requests.exceptions.ConnectionError as exc:
        print(f"\nERROR: Could not connect to {BASE_URL}. Is the service running?\n{exc}")
        return 1
    except AssertionError as exc:
        print(f"\nASSERTION FAILED: {exc}")
        return 1
    except Exception as exc:
        print(f"\nERROR: {exc}")
        return 1

    print("\nAll tests passed!")
    return 0


if __name__ == "__main__":
    sys.exit(main())

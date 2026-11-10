#!/usr/bin/env bash
# Local development startup script for the Kokoro TTS service.
# Creates a virtual environment, installs dependencies, checks for espeak-ng,
# and starts Uvicorn with auto-reload enabled.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

VENV_DIR=".venv"
PORT="${PORT:-8000}"

echo "==> Kokoro TTS local launcher"

# Check for espeak-ng on Linux and offer to install if missing
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if ! command -v espeak-ng &>/dev/null; then
        echo "WARNING: espeak-ng is not installed. Kokoro's phoneme fallback will not work."
        read -rp "Install espeak-ng now? (y/N) " choice
        if [[ "$choice" =~ ^[Yy]$ ]]; then
            if command -v apt-get &>/dev/null; then
                sudo apt-get update
                sudo apt-get install -y espeak-ng libsndfile1
            elif command -v dnf &>/dev/null; then
                sudo dnf install -y espeak-ng libsndfile
            elif command -v pacman &>/dev/null; then
                sudo pacman -S --noconfirm espeak-ng libsndfile
            else
                echo "ERROR: Could not detect package manager. Please install espeak-ng manually."
                exit 1
            fi
        else
            echo "Continuing without espeak-ng. Some words may be skipped during synthesis."
        fi
    else
        echo "OK: espeak-ng found at $(command -v espeak-ng)"
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    if ! command -v espeak-ng &>/dev/null; then
        echo "WARNING: espeak-ng not found. Install it with: brew install espeak-ng"
    else
        echo "OK: espeak-ng found at $(command -v espeak-ng)"
    fi
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
    echo "NOTE: On Windows, download espeak-ng from https://github.com/espeak-ng/espeak-ng/releases"
fi

# Create virtual environment if it doesn't exist
if [[ ! -d "$VENV_DIR" ]]; then
    echo "==> Creating virtual environment in $VENV_DIR"
    python3 -m venv "$VENV_DIR"
fi

# Activate venv
source "$VENV_DIR/bin/activate"

# Upgrade pip and install requirements
echo "==> Installing / upgrading dependencies"
pip install --upgrade pip
pip install -r requirements.txt

# Start Uvicorn with auto-reload for local development
echo "==> Starting Uvicorn on http://localhost:$PORT"
echo "    API docs available at http://localhost:$PORT/docs"
uvicorn main:app --host 0.0.0.0 --port "$PORT" --reload

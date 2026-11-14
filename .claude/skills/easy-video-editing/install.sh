#!/usr/bin/env bash
# Installs the tools for the easy-video-editing skill. Safe to run again.
set -e
PIP="pip install --break-system-packages -q"
if ! command -v ffmpeg >/dev/null || ! fc-list | grep -qi "Montserrat"; then
  apt-get update -q >/dev/null 2>&1 || true
  command -v ffmpeg >/dev/null || apt-get install -y -q ffmpeg
  apt-get install -y -q fonts-montserrat >/dev/null 2>&1 || echo "Montserrat font not installed (captions fall back to a default font)"
fi
python3 -c "import faster_whisper, cv2" 2>/dev/null || \
  $PIP faster-whisper "av<19" "opencv-contrib-python-headless<5" numpy
python3 -c "from faster_whisper import WhisperModel; WhisperModel('small', device='cpu', compute_type='int8')" >/dev/null 2>&1 \
  && echo "Speech model ready" \
  || echo "Speech model could not download: Hugging Face domains are not allowed in this environment"
echo "Tools ready: $(ffmpeg -version | head -1 | cut -d' ' -f1-3)"

"""Voz del asistente de oficina: Whisper (entrada) + TTS (respuesta)."""

from __future__ import annotations

import base64
import io
import os

MAX_AUDIO_BYTES = 8 * 1024 * 1024


class VoiceError(ValueError):
    pass


def _openai_client():
    from openai import OpenAI

    key = os.getenv("OPENAI_API_KEY")
    if not key:
        raise VoiceError("Falta OPENAI_API_KEY per processar la veu.")
    return OpenAI(api_key=key)


def transcribe_audio_upload(uploaded, *, language: str = "ca") -> str:
    """Transcribe un fitxer d'àudio (webm/ogg/mp3/wav) amb Whisper. No s'exposa a l'UI com a pas extra."""
    data = uploaded.read()
    if not data:
        raise VoiceError("L'àudio és buit.")
    if len(data) > MAX_AUDIO_BYTES:
        raise VoiceError("L'àudio és massa llarg (màxim 8 MB).")

    name = (getattr(uploaded, "name", None) or "nota.webm").split("/")[-1]
    if "." not in name:
        name = f"{name}.webm"
    buf = io.BytesIO(data)
    buf.name = name

    lang = "ca" if (language or "ca").startswith("ca") else "es"
    client = _openai_client()
    result = client.audio.transcriptions.create(
        model="whisper-1",
        file=buf,
        language=lang,
    )
    text = (getattr(result, "text", None) or str(result) or "").strip()
    if not text:
        raise VoiceError("No s'ha entès l'àudio. Torna a gravar.")
    return text


def synthesize_speech(text: str, *, language: str = "ca") -> str | None:
    """Retorna MP3 en base64, o None si falla (el xat de text segueix)."""
    spoken = (text or "").strip()
    if not spoken:
        return None
    try:
        client = _openai_client()
        voice = "nova"
        response = client.audio.speech.create(
            model="tts-1",
            voice=voice,
            input=spoken[:4000],
        )
        raw = response.content if hasattr(response, "content") else bytes(response)
        if not raw:
            return None
        return base64.b64encode(raw).decode("ascii")
    except Exception:
        return None

"""Voz del asistente de oficina: Whisper (entrada) + TTS (respuesta)."""

from __future__ import annotations

import base64
import io
import os
import re

MAX_AUDIO_BYTES = 8 * 1024 * 1024
# TTS més curt = menys latència; el xat de text mostra la resposta completa.
_TTS_MAX_CHARS = 420


class VoiceError(ValueError):
    pass


def _openai_client():
    from openai import OpenAI

    key = os.getenv("OPENAI_API_KEY")
    if not key:
        raise VoiceError("Falta OPENAI_API_KEY per processar la veu.")
    return OpenAI(api_key=key)


def text_for_tts(text: str) -> str:
    """Retalla confirmacions llargues i ids tècnics abans de sintetitzar."""
    spoken = (text or "").strip()
    if not spoken:
        return ""
    # Treu blocs de confirmació / previsualització (l'operari els llegeix al xat).
    cut_markers = (
        "\n\nPendents d'enviar",
        "\n\nEscriu ara el text",
        "\n\nMissatge preparat",
        "\n\nEscriu «sí»",
        "\n\nEscribe «sí»",
    )
    for marker in cut_markers:
        idx = spoken.find(marker)
        if idx > 40:
            spoken = spoken[:idx].rstrip()
            break
    # Amaga leftovers tècnics si el model en va deixar.
    spoken = re.sub(r"\S+@(?:lid|c\.us)\b", "", spoken, flags=re.IGNORECASE)
    spoken = re.sub(r"\s{2,}", " ", spoken).strip()
    if len(spoken) > _TTS_MAX_CHARS:
        spoken = spoken[: _TTS_MAX_CHARS - 1].rstrip() + "…"
    return spoken


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
    # whisper-1 sol ser el més ràpid en batch curt (ordres d'oficina).
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
    spoken = text_for_tts(text) if text else ""
    if not spoken:
        return None
    try:
        client = _openai_client()
        # tts-1 + speed>1: menor latència que tts-1-hd / gpt-4o-mini-tts.
        response = client.audio.speech.create(
            model="tts-1",
            voice="nova",
            input=spoken[:4000],
            speed=1.15,
        )
        raw = response.content if hasattr(response, "content") else bytes(response)
        if not raw:
            return None
        return base64.b64encode(raw).decode("ascii")
    except Exception:
        return None

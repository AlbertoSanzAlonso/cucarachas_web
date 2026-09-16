"""Utilidades de post-procesado de texto para respuestas del chat."""


def limit_one_question(text: str) -> str:
    """Reduce una respuesta a como máximo una pregunta (conserva el contexto previo)."""
    if not text or "?" not in text:
        return (text or "").strip()

    lines = [line.strip() for line in text.splitlines() if line.strip()]
    question_lines = [line for line in lines if "?" in line]
    if len(question_lines) <= 1:
        return text.strip()

    kept: list[str] = []
    asked = False
    for line in lines:
        if "?" in line:
            if not asked:
                kept.append(line)
                asked = True
        else:
            kept.append(line)
    return "\n".join(kept).strip()

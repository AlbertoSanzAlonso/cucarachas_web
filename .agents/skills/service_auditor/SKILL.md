---
name: service-auditor
description: >-
  Sincronización de servicios (especies de cucarachas) entre Django y React.
---

# Skill: Service Auditor (CECSA)

## Propósito

Coherencia entre servicios en BD (backend) y representación en frontend. Nicho exclusivo: **control de cucarachas**.

## Responsabilidades

1. Cada especie en Django debe reflejarse en la web vía API, no hardcoded.
2. Al añadir especies o sectores, actualizar población de BD (`init_db.py` o migraciones).
3. Verificar `/api/services/` devuelve datos esperados.

## Reglas

- No hardcodear servicios en el frontend.
- Campos mínimos: `title`, `description`, icono (Lucide), color corporativo.
- Alinear copy con `copywriter_local` (ca/es).

## Relación con el agente

El diagnosticador usa `Species` en Django y RAG técnico. Si cambian especies en BD, revisar prompts en `backend/api/agents/prompts.py` y conocimiento RAG.

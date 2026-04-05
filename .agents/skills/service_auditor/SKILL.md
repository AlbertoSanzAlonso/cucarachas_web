---
name: Service Auditor
description: Sincronización de servicios entre Django y React.
---

# Skill: Service Auditor (CECSA)

## Propósito
Mantener la coherencia entre las especies de cucarachas (servicios) definidas en el backend y su representación visual multilingüe en el frontend.

## Especialización de Especies
El auditor debe velar por la sincronía de las 3 especies principales:
1.  **Cuca Alemanya**
2.  **Cuca Americana**
3.  **Cuca Oriental**

## Responsabilidades
1.  **Sincronización Content-Backend**: Asegurar que los datos en `backend/init_db.py` coincidan con las claves de traducción en `frontend/src/locales/`.
2.  **Integridad de i18n**: Al actualizar una especie en el backend, verificar que los archivos `ca.json`, `es.json` y `en.json` reflejen el cambio.
3.  **Chequeos de Salud**: El API `/api/services/` debe servir la información básica que coincida con los IDs usados en el frontend.

## Reglas
-   No agregar especies hardcoded fuera de los locales de i18n.
-   Cada especie debe incluir metadatos de riesgo y hábitat.

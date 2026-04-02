---
name: Service Auditor
description: Sincronización de servicios entre Django y React.
---

# Skill: Service Auditor (CECSA)

# Propósito
Mantener la coherencia entre los servicios de control de plagas definidos en la base de datos (Backend) y su representación visual (Frontend).

# Responsabilidades
1.  **Sincronización Total**: Asegurar que cada servicio en `backend/init_db.py` tenga su correspondiente representación en `Services.jsx` si hay alguna lógica específica.
2.  **Integridad de Datos**: Al agregar nuevos tipos de plaga o sectores, actualizar siempre el script de población de la DB (`init_db.py`).
3.  **Chequeos de Salud**: Verificar periódicamente que el API de servicios (/api/services/) devuelva la información esperada.

# Reglas
-   No agregar servicios hardcoded en el frontend. Usar siempre el API de Django.
-   Cada servicio debe incluir: `title`, `description`, `icon` (Lucide) y `color` (Corporate Blue/Gray).

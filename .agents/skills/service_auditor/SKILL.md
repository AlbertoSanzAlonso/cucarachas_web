# Skill: Service Auditor (Django Sync)

## 🎯 Objetivo
Mantener la sincronización entre las especies de plagas mostradas en el frontend (React) y la base de datos de servicios del backend (Django).

## 🧩 Procedimiento
1. Las especies se gestionan desde el modelo `Species` en Django.
2. El frontend debe consumir el endpoint `/api/species/` (o equivalente).
3. Asegurar que las imágenes (`.webp`) estén optimizadas y servidas correctamente.

## 🛠️ Reglas
- Al añadir una nueva especie en el backend, se debe verificar que existan las traducciones correspondientes en `frontend/src/locales/`.
- Las imágenes deben subirse al bucket/storage oficial y no quedar en el repo si superan los 500KB.

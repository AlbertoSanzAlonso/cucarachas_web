# Servidor MCP iGEO PDI (Cursor)

Expone tools sobre el cliente PDI compartido en `backend/api/igeo/`.

## Requisitos

1. Credenciales PDI de iGEO (user, password, virtual host `pre_…` en pruebas).
2. Códigos maestros CECSA: `IGEO_DEFAULT_DELEGACION`, `IGEO_DEFAULT_GESTOR`.
3. Python 3.11+ con deps:

```bash
cd mcp-igeo
pip install -r requirements.txt
```

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `IGEO_PDI_HOST` | Host AMQP (p. ej. `pdi.pre.igeoapp.com`) |
| `IGEO_PDI_PORT` | Puerto AMQP (`5671` TLS típico) |
| `IGEO_PDI_SSL` | `true` / `false` |
| `IGEO_PDI_USER` | Usuario RabbitMQ |
| `IGEO_PDI_PASSWORD` | Password |
| `IGEO_PDI_VHOST` | Virtual host (`pre_xxx` en pre) |
| `IGEO_PDI_DRY_RUN` | `true` = no publica (solo valida) |
| `IGEO_DEFAULT_DELEGACION` | Código delegación (*!) |
| `IGEO_DEFAULT_GESTOR` | Código empleado gestor (*!) |

Sin password/host → dry-run automático.

## Cursor (`~/.cursor/mcp.json` o proyecto)

No commitear secretos. Ejemplo local:

```json
{
  "mcpServers": {
    "igeo-pdi": {
      "command": "python",
      "args": ["/ABSOLUTE/PATH/cucarachasbarcelona/mcp-igeo/server.py"],
      "env": {
        "IGEO_PDI_HOST": "pdi.pre.igeoapp.com",
        "IGEO_PDI_PORT": "5671",
        "IGEO_PDI_SSL": "true",
        "IGEO_PDI_USER": "tu_user",
        "IGEO_PDI_PASSWORD": "tu_password",
        "IGEO_PDI_VHOST": "pre_cecsa",
        "IGEO_DEFAULT_DELEGACION": "DN",
        "IGEO_DEFAULT_GESTOR": "CODIGO_EMPLEADO",
        "IGEO_PDI_DRY_RUN": "true"
      }
    }
  }
}
```

## Tools

| Tool | Uso |
|------|-----|
| `igeo_status` | Config (sin password) |
| `igeo_create_lead` | `CLIENTE_POTENCIAL` |
| `igeo_publish_entity` | CRUD genérico CREATE/UPDATE/DELETE |
| `igeo_get_import_results` | Drain `resultadoImportaciones` |
| `igeo_peek_exports` | Drain `exportaciones` |

## Consola web iGEO

- Pre: https://pdi.pre.igeoapp.com:15671/
- Prod: https://pdi.igeoapp.com:15671/

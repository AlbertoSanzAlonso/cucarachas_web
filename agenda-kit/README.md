# agenda-kit

Módulo independiente (headless) de agenda multi-profesional: lógica pura, UI React sin estilos, adapters HTTP/memoria y esqueleto Hono + Postgres.

> Este directorio está en el `.gitignore` de Superpelu: no forma parte del producto desplegado. Cópialo o publícalo aparte para otros proyectos.

## Instalación en otro proyecto

```bash
# desde el host
npm install react react-dom hono postgres
# enlaza o copia packages/agenda-kit
```

Imports:

```ts
import { setAgendaConfig, buildStaffDayGrid } from 'agenda-kit/core'
import {
  AgendaDataSourceProvider,
  AgendaLabelsProvider,
  AdminAgendaWorkspace,
  useAgendaDate,
} from 'agenda-kit/react'
import {
  createHttpAgendaDataSource,
  createMemoryAgendaDataSource,
} from 'agenda-kit/adapters'
import { createAgendaRouter } from 'agenda-kit/server'
```

## Arranque rápido (demo en memoria)

```tsx
import { useState } from 'react'
import {
  AgendaDataSourceProvider,
  AdminAgendaWorkspace,
} from 'agenda-kit/react'
import { createMemoryAgendaDataSource } from 'agenda-kit/adapters'
import { setAgendaConfig } from 'agenda-kit/core'

setAgendaConfig({ timezone: 'Europe/Madrid', slotMinutes: 30 })

const dataSource = createMemoryAgendaDataSource({
  adminToken: 'admin',
  staff: [{ id: 's1', name: 'Ana', role: null, password: 'ana' }],
  services: [
    {
      id: 'svc-cut',
      nameEs: 'Corte',
      nameEn: 'Cut',
      durationMinutes: 30,
      categoryId: null,
    },
  ],
})

export function App() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  return (
    <AgendaDataSourceProvider dataSource={dataSource}>
      <AdminAgendaWorkspace token="admin" date={date} onDateChange={setDate} />
    </AgendaDataSourceProvider>
  )
}
```

Estilos: el kit no trae CSS. Usa atributos `data-agenda-*` o pasa `classNames` a los componentes.

```css
[data-agenda-calendar] { display: grid; }
[data-agenda-event] { background: #333; color: #fff; border: 0; }
[data-agenda-now-line] { background: tomato; }
[data-agenda-slot][data-selected='true'] { outline: 2px solid dodgerblue; }
```

## API HTTP

`createHttpAgendaDataSource({ baseUrl: 'https://host/api' })` habla rutas compatibles con Superpelu:

- Admin: `GET /schedule/day`, citas, bloques, slots, catálogo
- Staff: `/me/schedule`, `/me/appointments`, `/auth/staff/login`

## Server

```ts
import { Hono } from 'hono'
import postgres from 'postgres'
import { readFileSync } from 'node:fs'
import { createAgendaRouter } from 'agenda-kit/server'

const sql = postgres(process.env.DATABASE_URL!)
await sql.unsafe(readFileSync('node_modules/agenda-kit/src/server/schema.sql', 'utf8'))

const app = new Hono()
app.route(
  '/api',
  createAgendaRouter({
    sql,
    adminSecret: process.env.ADMIN_SECRET!,
    timezone: 'Europe/Madrid',
    hooks: {
      onAppointmentCreated: (apt) => console.log('created', apt),
    },
  }),
)
```

## Plugins opcionales

- **Coloración en dos tramos:** `setColorSplitPlugin({ washServiceId, colorServiceIds })` en core. El server no auto-split; guarda `color_group_*` si el host los envía.
- **WhatsApp / email / clientes HTML:** no incluidos. Usa `hooks` del router (`onAppointmentCancelled`, etc.).

## Estructura

```
src/
  core/       tipos, timeGrid, placement, occupancy, notificaciones
  adapters/   AgendaDataSource (http + memory)
  react/      hooks + UI headless
  server/     createAgendaRouter + schema.sql
```

## Typecheck

```bash
cd packages/agenda-kit && npm install && npm run typecheck
```

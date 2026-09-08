/**
 * agenda-kit server — Hono + Postgres skeleton.
 *
 * Esquema SQL: `src/server/schema.sql` (ruta relativa al paquete).
 * El host debe aplicarlo al arrancar, p. ej.:
 *   import { readFileSync } from 'node:fs'
 *   import { fileURLToPath } from 'node:url'
 *   const schemaPath = fileURLToPath(new URL('./schema.sql', import.meta.url))
 *   await sql.unsafe(readFileSync(schemaPath, 'utf8'))
 *
 * Montaje típico:
 *   app.route('/api', createAgendaRouter({ sql, adminSecret }))
 */

export { createAgendaRouter } from './router.js'
export {
  requireAdmin,
  requireStaff,
  getBearer,
  loginStaff,
  logoutStaff,
  resolveStaffSession,
  hashPassword,
  verifyPassword,
} from './auth.js'
export {
  buildDaySchedule,
  getFreeSlotsForStaff,
} from './schedule.js'
export {
  createAppointment,
  updateAppointment,
  cancelAppointment,
  markAppointmentNoShow,
  getAppointmentById,
  listAppointments,
  appointmentToPublic,
} from './appointments.js'
export {
  createBlock,
  updateBlock,
  deleteBlock,
  getBlockById,
  listBlocks,
  blockToPublic,
} from './blocks.js'
export type {
  AgendaRouterOptions,
  AgendaLifecycleHooks,
  StaffSessionUser,
  AppointmentRow,
  BlockRow,
  CreateAppointmentInput,
  UpdateAppointmentInput,
  CreateBlockInput,
  UpdateBlockInput,
} from './types.js'

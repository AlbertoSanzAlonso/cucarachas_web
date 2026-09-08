import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto'
import type { Context } from 'hono'
import type { Sql } from 'postgres'
import type { StaffSessionUser } from './types.js'

const SESSION_DAYS = 14

type HeaderContext = {
  req: { header: (name: string) => string | undefined }
}

export function getBearer(c: HeaderContext): string | undefined {
  const auth = c.req.header('Authorization')
  return auth?.startsWith('Bearer ') ? auth.slice(7).trim() : undefined
}

/** True si el Bearer coincide con el secreto de admin. */
export function requireAdmin(c: HeaderContext, secret: string): boolean {
  const token = getBearer(c) ?? ''
  return token.length > 0 && token === secret
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64)
  return `${salt}:${hash.toString('hex')}`
}

export function verifyPassword(password: string, stored: string | null | undefined): boolean {
  if (!stored) return false
  const [salt, expectedHex] = stored.split(':')
  if (!salt || !expectedHex) return false
  const attempt = scryptSync(password, salt, 64)
  const expected = Buffer.from(expectedHex, 'hex')
  if (attempt.length !== expected.length) return false
  return timingSafeEqual(attempt, expected)
}

type StaffRow = {
  id: string
  name: string
  role: string | null
  password_hash: string | null
  active: boolean
}

async function findStaffByLoginName(sql: Sql, name: string): Promise<StaffRow | undefined> {
  const normalized = name.trim().toLowerCase()
  const rows = await sql<StaffRow[]>`
    SELECT id, name, role, password_hash, active
    FROM staff
    WHERE active = TRUE AND lower(trim(name)) = ${normalized}
    LIMIT 1
  `
  return rows[0]
}

export async function loginStaff(
  sql: Sql,
  name: string,
  password: string,
): Promise<{ token: string; staff: StaffSessionUser }> {
  const row = await findStaffByLoginName(sql, name)
  if (!row || !verifyPassword(password, row.password_hash)) {
    throw new Error('CREDENCIALES_INVALIDAS')
  }

  const token = randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS)

  await sql`
    INSERT INTO staff_sessions (token, staff_id, expires_at)
    VALUES (${token}, ${row.id}, ${expiresAt.toISOString()})
  `

  return {
    token,
    staff: { id: row.id, name: row.name, role: row.role },
  }
}

export async function resolveStaffSession(
  sql: Sql,
  token: string | undefined,
): Promise<StaffSessionUser | undefined> {
  if (!token?.trim()) return undefined

  const rows = await sql<StaffSessionUser[]>`
    SELECT s.id, s.name, s.role
    FROM staff_sessions ss
    INNER JOIN staff s ON s.id = ss.staff_id
    WHERE ss.token = ${token.trim()}
      AND ss.expires_at > ${new Date().toISOString()}
      AND s.active = TRUE
  `
  return rows[0]
}

export async function logoutStaff(sql: Sql, token: string): Promise<void> {
  await sql`DELETE FROM staff_sessions WHERE token = ${token}`
}

/**
 * Resuelve sesión de staff desde Bearer.
 * Devuelve `{ error: Response }` o `{ staff }`.
 */
export async function requireStaff(
  c: Context,
  sql: Sql,
): Promise<{ error: Response; staff: null } | { error: null; staff: StaffSessionUser }> {
  const staff = await resolveStaffSession(sql, getBearer(c))
  if (!staff) {
    return { error: c.json({ error: 'No autorizado' }, 401), staff: null }
  }
  return { error: null, staff }
}

import { randomUUID } from 'node:crypto'
import type { Sql } from 'postgres'
import type { BlockRow, CreateBlockInput, UpdateBlockInput } from './types.js'

export async function getBlockById(sql: Sql, id: string): Promise<BlockRow | undefined> {
  const rows = await sql<BlockRow[]>`
    SELECT * FROM staff_time_blocks WHERE id = ${id} LIMIT 1
  `
  return rows[0]
}

export async function listBlocks(
  sql: Sql,
  opts: { staffId?: string; from: string; to: string },
): Promise<BlockRow[]> {
  if (opts.staffId) {
    return sql<BlockRow[]>`
      SELECT * FROM staff_time_blocks
      WHERE staff_id = ${opts.staffId}
        AND date >= ${opts.from}
        AND date <= ${opts.to}
      ORDER BY date, start_time
    `
  }
  return sql<BlockRow[]>`
    SELECT * FROM staff_time_blocks
    WHERE date >= ${opts.from}
      AND date <= ${opts.to}
    ORDER BY date, start_time
  `
}

export async function createBlock(sql: Sql, input: CreateBlockInput): Promise<BlockRow> {
  if (input.startTime >= input.endTime) throw new Error('RANGO_INVALIDO')

  const id = randomUUID()
  const rows = await sql<BlockRow[]>`
    INSERT INTO staff_time_blocks (
      id, staff_id, date, start_time, end_time, note, series_id, scope, created_at
    ) VALUES (
      ${id},
      ${input.staffId},
      ${input.date},
      ${input.startTime},
      ${input.endTime},
      ${input.note?.trim() || null},
      ${input.seriesId ?? null},
      ${input.scope ?? 'single'},
      ${new Date().toISOString()}
    )
    RETURNING *
  `
  return rows[0]!
}

export async function updateBlock(
  sql: Sql,
  id: string,
  input: UpdateBlockInput,
): Promise<BlockRow> {
  const existing = await getBlockById(sql, id)
  if (!existing) throw new Error('BLOQUEO_NO_ENCONTRADO')

  const date = input.date ?? existing.date
  const startTime = input.startTime ?? existing.start_time
  const endTime = input.endTime ?? existing.end_time
  if (startTime >= endTime) throw new Error('RANGO_INVALIDO')

  const note = input.note !== undefined ? input.note : existing.note
  const seriesId = input.seriesId !== undefined ? input.seriesId : existing.series_id
  const scope = input.scope !== undefined ? input.scope : existing.scope

  const rows = await sql<BlockRow[]>`
    UPDATE staff_time_blocks SET
      date = ${date},
      start_time = ${startTime},
      end_time = ${endTime},
      note = ${note},
      series_id = ${seriesId},
      scope = ${scope}
    WHERE id = ${id}
    RETURNING *
  `
  return rows[0]!
}

export async function deleteBlock(sql: Sql, id: string): Promise<boolean> {
  const rows = await sql<{ id: string }[]>`
    DELETE FROM staff_time_blocks WHERE id = ${id} RETURNING id
  `
  return rows.length > 0
}

export function blockToPublic(row: BlockRow) {
  return {
    id: row.id,
    staffId: row.staff_id,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    note: row.note,
    seriesId: row.series_id,
    scope: row.scope,
    createdAt: row.created_at,
  }
}

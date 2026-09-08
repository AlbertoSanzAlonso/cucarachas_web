-- agenda-kit — esquema Postgres mínimo (genérico, sin seed de salón)
-- El host aplica este SQL al arrancar (p. ej. leyendo AGENDA_KIT_SCHEMA_PATH).

CREATE TABLE IF NOT EXISTS service_categories (
  id TEXT PRIMARY KEY,
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  category_id TEXT REFERENCES service_categories(id),
  booking_pattern JSONB
);

CREATE INDEX IF NOT EXISTS idx_ak_services_category
  ON services (category_id);

CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  password_hash TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_ak_staff_active
  ON staff (active, name);

CREATE TABLE IF NOT EXISTS staff_services (
  staff_id TEXT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (staff_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_ak_staff_services_service
  ON staff_services (service_id);

-- Franjas semanales del salón (day_of_week: 0=dom … 6=sáb)
CREATE TABLE IF NOT EXISTS salon_schedule (
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  PRIMARY KEY (day_of_week, start_time)
);

-- Disponibilidad semanal por profesional
CREATE TABLE IF NOT EXISTS staff_availability (
  staff_id TEXT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  PRIMARY KEY (staff_id, day_of_week, start_time)
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  staff_id TEXT REFERENCES staff(id),
  service_id TEXT NOT NULL REFERENCES services(id),
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed',
  locale TEXT NOT NULL DEFAULT 'es',
  series_id TEXT,
  booking_group_id TEXT,
  color_group_id TEXT,
  color_group_role TEXT,
  origin TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ak_appointments_date_status
  ON appointments (date, status);

CREATE INDEX IF NOT EXISTS idx_ak_appointments_staff_date
  ON appointments (staff_id, date, status);

CREATE INDEX IF NOT EXISTS idx_ak_appointments_series
  ON appointments (series_id)
  WHERE series_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ak_appointments_booking_group
  ON appointments (booking_group_id)
  WHERE booking_group_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ak_appointments_color_group
  ON appointments (color_group_id)
  WHERE color_group_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS staff_time_blocks (
  id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  note TEXT,
  series_id TEXT,
  scope TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ak_blocks_staff_date
  ON staff_time_blocks (staff_id, date);

CREATE INDEX IF NOT EXISTS idx_ak_blocks_series
  ON staff_time_blocks (series_id)
  WHERE series_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS staff_sessions (
  token TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ak_sessions_staff
  ON staff_sessions (staff_id);

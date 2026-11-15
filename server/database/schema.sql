-- ============================================================
--  PERRICOS · Esquema de base de datos (PostgreSQL)
--  Identidad: verde bosque / marfil / salvia / rosa empolvado
-- ============================================================

-- Extensiones útiles
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
-- CATEGORÍAS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categorias (
  id          SERIAL PRIMARY KEY,
  nombre      TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- PRODUCTOS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS productos (
  id           SERIAL PRIMARY KEY,
  nombre       TEXT NOT NULL,
  categoria_id INT REFERENCES categorias(id) ON DELETE SET NULL,
  presentacion TEXT DEFAULT '',
  descripcion  TEXT DEFAULT '',
  beneficios   TEXT DEFAULT '',
  precio       NUMERIC(12,2) NOT NULL DEFAULT 0,
  costo        NUMERIC(12,2) NOT NULL DEFAULT 0,
  stock        NUMERIC(12,2) NOT NULL DEFAULT 0,
  tipo_venta   TEXT NOT NULL DEFAULT 'pieza' CHECK (tipo_venta IN ('pieza','gramos')),
  activo       BOOLEAN NOT NULL DEFAULT TRUE,
  imagen       TEXT DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- USUARIOS (cuentas de clientes con ID)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id             SERIAL PRIMARY KEY,
  nombre         TEXT NOT NULL,
  apellido       TEXT NOT NULL,
  username       TEXT,
  fecha_registro TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS username TEXT;
SELECT setval(
  'usuarios_id_seq',
  GREATEST((SELECT last_value FROM usuarios_id_seq), COALESCE((SELECT MAX(id) FROM usuarios), 999), 999),
  true
);

-- ------------------------------------------------------------
-- VENTAS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ventas (
  id              SERIAL PRIMARY KEY,
  producto_id     INT REFERENCES productos(id) ON DELETE SET NULL,
  nombre_producto TEXT NOT NULL,
  cantidad        NUMERIC(12,2) NOT NULL,
  total           NUMERIC(12,2) NOT NULL,
  tipo_venta      TEXT NOT NULL DEFAULT 'pieza',
  fecha           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas (fecha);
CREATE INDEX IF NOT EXISTS idx_ventas_producto ON ventas (producto_id);
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS usuario_id INT REFERENCES usuarios(id) ON DELETE SET NULL;
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS presentacion_producto TEXT;
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS descripcion_producto TEXT;
CREATE INDEX IF NOT EXISTS idx_ventas_usuario_fecha ON ventas (usuario_id, fecha);

-- ------------------------------------------------------------
-- OFERTAS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ofertas (
  id           SERIAL PRIMARY KEY,
  nombre       TEXT NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin    DATE NOT NULL,
  imagen       TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ofertas_rango_fechas CHECK (fecha_fin >= fecha_inicio)
);

-- ------------------------------------------------------------
-- SUGERENCIAS (buzón comunitario)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sugerencias (
  id        SERIAL PRIMARY KEY,
  producto  TEXT NOT NULL,
  categoria TEXT DEFAULT '',
  motivo    TEXT DEFAULT '',
  fecha     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- ADMINISTRADORES (auth)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  nombre        TEXT DEFAULT 'Administrador',
  foto          TEXT DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

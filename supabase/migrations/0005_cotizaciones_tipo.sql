-- ============================================================
-- BEAT — Migración 0005
-- Agrega columna 'tipo' a cotizaciones para diferenciar:
--   - 'beat'      → cot. propias / facturas emitidas
--   - 'recibidos' → cot. recibidas de proveedores
-- Nullable: las carpetas viejas quedan con NULL (se muestran en Beat por compat).
-- Idempotente.
-- ============================================================

alter table cotizaciones
  add column if not exists tipo text;

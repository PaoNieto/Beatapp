-- ============================================================
-- BEAT — Migración 0003
-- Agrega fecha_fin a proyectos para soportar rango de fechas.
-- equipo text[] ya existe en 0001.
-- Idempotente.
-- ============================================================

alter table proyectos
  add column if not exists fecha_fin date;

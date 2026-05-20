-- ============================================================
-- BEAT — Migración 0004
-- - 3 fases del proyecto: montaje, operacion, desmontaje
--   cada una con inicio (date) y fin (date) opcionales
-- - Estado 'finalizado' agregado al enum
-- - Tabla join proyecto_archivos para vincular archivos
--   de cotizaciones (u otros) a un proyecto
-- Idempotente.
-- ============================================================

alter table proyectos add column if not exists montaje_inicio    date;
alter table proyectos add column if not exists montaje_fin       date;
alter table proyectos add column if not exists operacion_inicio  date;
alter table proyectos add column if not exists operacion_fin     date;
alter table proyectos add column if not exists desmontaje_inicio date;
alter table proyectos add column if not exists desmontaje_fin    date;

alter type proyecto_estado add value if not exists 'finalizado';

create table if not exists proyecto_archivos (
  proyecto_id uuid references proyectos(id) on delete cascade,
  archivo_id  uuid references archivos(id)  on delete cascade,
  created_at  timestamptz default now() not null,
  primary key (proyecto_id, archivo_id)
);

create index if not exists idx_proyecto_archivos_proyecto on proyecto_archivos(proyecto_id);
create index if not exists idx_proyecto_archivos_archivo  on proyecto_archivos(archivo_id);

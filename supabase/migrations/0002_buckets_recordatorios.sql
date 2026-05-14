-- ============================================================
-- BEAT — Migración 0002
-- Cotizaciones como bucket libre + tabla recordatorios
-- Correr en SQL Editor de Supabase → Run
-- ============================================================

-- Dropear la tabla cotizaciones vieja (no tiene data aún)
drop table if exists cotizaciones cascade;
drop type if exists cotizacion_estado cascade;
drop type if exists moneda cascade;

-- Cotizaciones = bucket libre con archivos adentro
create table cotizaciones (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  descripcion text,
  cliente_id uuid references clientes(id),
  proyecto_id uuid references proyectos(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_cotizaciones_cliente on cotizaciones(cliente_id);
create index idx_cotizaciones_proyecto on cotizaciones(proyecto_id);

create trigger trg_cotizaciones_updated before update on cotizaciones
  for each row execute function set_updated_at();

-- Recordatorios: notas libres en el calendario
create table recordatorios (
  id uuid primary key default uuid_generate_v4(),
  fecha date not null,
  titulo text not null,
  descripcion text,
  color text default '#FFB600',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_recordatorios_fecha on recordatorios(fecha);

create trigger trg_recordatorios_updated before update on recordatorios
  for each row execute function set_updated_at();
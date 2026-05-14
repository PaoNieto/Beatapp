-- ============================================================
-- BEAT — Schema simplificado (sin auth)
-- Idempotente: se puede correr múltiples veces sin romper.
-- Correr en Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

create extension if not exists "uuid-ossp";

-- ===== LIMPIEZA (por si corriste el SQL viejo) =====
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user() cascade;

drop table if exists reunion_participantes cascade;
drop table if exists proyecto_equipo cascade;
drop table if exists proyecto_proveedores cascade;
drop table if exists archivos cascade;
drop table if exists reuniones cascade;
drop table if exists briefs cascade;
drop table if exists cotizaciones cascade;
drop table if exists proveedores cascade;
drop table if exists proyectos cascade;
drop table if exists clientes cascade;
drop table if exists profiles cascade;

drop type if exists user_role cascade;
drop type if exists proyecto_estado cascade;
drop type if exists tipo_evento cascade;
drop type if exists industria cascade;
drop type if exists cliente_relacion cascade;
drop type if exists prioridad cascade;
drop type if exists cotizacion_estado cascade;
drop type if exists moneda cascade;
drop type if exists proveedor_categoria cascade;
drop type if exists proveedor_estado cascade;
drop type if exists entidad_tipo cascade;

-- ===== ENUMS =====
create type proyecto_estado as enum ('brief','propuesta','cotizacion','aprobado','produccion','ejecutado','post_mortem','cerrado','cancelado');
create type tipo_evento as enum ('feria','conferencia','activacion','lanzamiento','gala','convencion','otro');
create type industria as enum ('banca','retail','farma','tech','educacion','gobierno','consumo_masivo','otro');
create type cliente_relacion as enum ('activo','dormido','perdido','prospecto');
create type prioridad as enum ('alta','media','baja');
create type cotizacion_estado as enum ('borrador','enviada','aprobada','rechazada','vencida');
create type moneda as enum ('PEN','USD');
create type proveedor_categoria as enum ('catering','sonido_av','mobiliario','escenografia','audiovisual','talento','logistica','impresion','locaciones','seguridad','decoracion','otros');
create type proveedor_estado as enum ('activo','inactivo','vetado');
create type entidad_tipo as enum ('cliente','proyecto','cotizacion','proveedor','brief','reunion');

-- ===== CLIENTES =====
create table clientes (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  razon_social text,
  ruc text,
  industria industria,
  contacto_principal text,
  cargo_contacto text,
  email text,
  telefono text,
  direccion text,
  primer_proyecto date,
  ultimo_proyecto date,
  proyectos_totales int default 0,
  ticket_promedio numeric(12,2),
  estado_relacion cliente_relacion default 'activo',
  prioridad prioridad default 'media',
  notas_clave text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ===== PROYECTOS =====
create table proyectos (
  id uuid primary key default uuid_generate_v4(),
  codigo text unique not null,
  nombre text not null,
  cliente_id uuid references clientes(id),
  tipo_evento tipo_evento,
  fecha_evento date,
  fecha_inicio_produccion date,
  estado proyecto_estado default 'brief',
  productor_lider text,
  equipo text[],
  locacion text,
  asistentes_estimados int,
  presupuesto_cliente numeric(12,2),
  presupuesto_real numeric(12,2),
  margen_estimado numeric(12,2),
  descripcion text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ===== COTIZACIONES =====
create table cotizaciones (
  id uuid primary key default uuid_generate_v4(),
  codigo text unique not null,
  proyecto_id uuid references proyectos(id),
  cliente_id uuid references clientes(id),
  fecha_envio date,
  fecha_validez date,
  monto_total numeric(12,2),
  moneda moneda default 'PEN',
  estado cotizacion_estado default 'borrador',
  version int default 1,
  elaborada_por text,
  partidas jsonb,
  notas text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ===== PROVEEDORES =====
create table proveedores (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  razon_social text,
  ruc text,
  categoria proveedor_categoria not null,
  subcategoria text,
  contacto text,
  telefono text,
  email text,
  ciudad text default 'Lima',
  calificacion int check (calificacion between 0 and 5) default 0,
  ticket_promedio numeric(12,2),
  veces_contratado int default 0,
  ultima_colaboracion date,
  estado proveedor_estado default 'activo',
  notas text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table proyecto_proveedores (
  proyecto_id uuid references proyectos(id) on delete cascade,
  proveedor_id uuid references proveedores(id) on delete cascade,
  servicio text,
  monto numeric(12,2),
  estado text default 'cotizando',
  primary key (proyecto_id, proveedor_id)
);

-- ===== BRIEFS =====
create table briefs (
  id uuid primary key default uuid_generate_v4(),
  proyecto_id uuid references proyectos(id) on delete cascade,
  cliente_id uuid references clientes(id),
  fecha date default current_date,
  concepto text,
  objetivo text,
  publico text,
  mood text,
  referencias text,
  elaborado_por text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ===== REUNIONES =====
create table reuniones (
  id uuid primary key default uuid_generate_v4(),
  fecha timestamptz not null,
  proyecto_id uuid references proyectos(id),
  tipo_reunion text,
  participantes text[],
  agenda text,
  notas text,
  decisiones text,
  proximos_pasos text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ===== ARCHIVOS =====
create table archivos (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  entidad_tipo entidad_tipo not null,
  entidad_id uuid not null,
  created_at timestamptz default now() not null
);

-- ===== ÍNDICES =====
create index idx_proyectos_estado on proyectos(estado);
create index idx_proyectos_fecha_evento on proyectos(fecha_evento);
create index idx_proyectos_cliente on proyectos(cliente_id);
create index idx_cotizaciones_estado on cotizaciones(estado);
create index idx_cotizaciones_proyecto on cotizaciones(proyecto_id);
create index idx_proveedores_categoria on proveedores(categoria);
create index idx_archivos_entidad on archivos(entidad_tipo, entidad_id);

-- ===== TRIGGERS updated_at =====
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger trg_clientes_updated before update on clientes for each row execute function set_updated_at();
create trigger trg_proyectos_updated before update on proyectos for each row execute function set_updated_at();
create trigger trg_cotizaciones_updated before update on cotizaciones for each row execute function set_updated_at();
create trigger trg_proveedores_updated before update on proveedores for each row execute function set_updated_at();
create trigger trg_briefs_updated before update on briefs for each row execute function set_updated_at();
create trigger trg_reuniones_updated before update on reuniones for each row execute function set_updated_at();

-- ===== STORAGE =====
insert into storage.buckets (id, name, public) values ('archivos','archivos', false)
on conflict (id) do nothing;

-- RLS DESACTIVADO: la app accede con service_role desde el server.
-- No habilitamos RLS porque no hay login.

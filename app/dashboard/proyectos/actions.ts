"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { EQUIPO_BEAT } from "@/lib/equipo";
import { ESTADOS_PROYECTO } from "@/lib/proyecto-estados";

const FECHA_FIELDS = [
  "montaje_inicio","montaje_fin",
  "operacion_inicio","operacion_fin",
  "desmontaje_inicio","desmontaje_fin",
] as const;

const FALLBACK_REGEX = /(montaje|operacion|desmontaje)_(inicio|fin)|fecha_fin/;

function parseFormPayload(formData: FormData) {
  const codigo = String(formData.get("codigo") || "").trim();
  const nombre = String(formData.get("nombre") || "").trim();
  const cliente_id = (formData.get("cliente_id") as string) || null;
  const tipo_evento = (formData.get("tipo_evento") as string) || null;
  const locacion = (formData.get("locacion") as string) || null;
  const descripcion = (formData.get("descripcion") as string) || null;
  const estadoRaw = (formData.get("estado") as string) || null;
  const estado = estadoRaw && ESTADOS_PROYECTO.some((e) => e.value === estadoRaw) ? estadoRaw : null;

  const equipoRaw = formData.getAll("equipo").map((v) => String(v));
  const equipo = equipoRaw.filter((n) => (EQUIPO_BEAT as readonly string[]).includes(n));

  const fechas: Record<string, string | null> = {};
  for (const f of FECHA_FIELDS) {
    const val = (formData.get(f) as string) || "";
    fechas[f] = val || null;
  }

  const archivos = formData.getAll("archivos").map((v) => String(v)).filter(Boolean);

  return {
    codigo,
    nombre,
    cliente_id: cliente_id || null,
    tipo_evento,
    locacion,
    descripcion,
    estado,
    equipo: equipo.length ? equipo : null,
    fechas,
    archivos,
  };
}

function buildPayload(p: ReturnType<typeof parseFormPayload>, includeNewCols: boolean) {
  const base: Record<string, any> = {
    codigo: p.codigo,
    nombre: p.nombre,
    cliente_id: p.cliente_id,
    tipo_evento: p.tipo_evento,
    locacion: p.locacion,
    descripcion: p.descripcion,
    equipo: p.equipo,
  };
  if (p.estado) base.estado = p.estado;
  if (includeNewCols) {
    Object.assign(base, p.fechas);
    // mantener legacy fecha_evento sincronizado con operacion_inicio para calendarios viejos
    if (p.fechas.operacion_inicio) base.fecha_evento = p.fechas.operacion_inicio;
  }
  return base;
}

async function syncArchivos(supabase: any, proyecto_id: string, archivos: string[]) {
  // wipe + insert. Idempotente.
  await supabase.from("proyecto_archivos").delete().eq("proyecto_id", proyecto_id);
  if (archivos.length === 0) return;
  await supabase
    .from("proyecto_archivos")
    .insert(archivos.map((archivo_id) => ({ proyecto_id, archivo_id })));
}

export async function crearProyecto(formData: FormData): Promise<void> {
  const p = parseFormPayload(formData);
  if (!p.codigo) redirect("/dashboard/proyectos/nuevo?error=Falta+codigo");
  if (!p.nombre) redirect("/dashboard/proyectos/nuevo?error=Falta+nombre");

  const supabase = await createClient();

  let resp = await supabase
    .from("proyectos")
    .insert(buildPayload(p, true))
    .select("id")
    .single();

  if (resp.error && FALLBACK_REGEX.test(resp.error.message)) {
    resp = await supabase
      .from("proyectos")
      .insert(buildPayload(p, false))
      .select("id")
      .single();
  }

  if (resp.error) redirect(`/dashboard/proyectos/nuevo?error=${encodeURIComponent(resp.error.message)}`);

  const id = resp.data!.id as string;
  try {
    await syncArchivos(supabase, id, p.archivos);
  } catch {
    // si la tabla join no existe (migración no corrida), no rompemos el create
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/proyectos");
  redirect(`/dashboard/proyectos/${id}`);
}

export async function actualizarProyecto(id: string, formData: FormData): Promise<void> {
  const p = parseFormPayload(formData);
  if (!p.codigo) redirect(`/dashboard/proyectos/${id}/editar?error=Falta+codigo`);
  if (!p.nombre) redirect(`/dashboard/proyectos/${id}/editar?error=Falta+nombre`);

  const supabase = await createClient();

  let resp = await supabase
    .from("proyectos")
    .update(buildPayload(p, true))
    .eq("id", id);

  if (resp.error && FALLBACK_REGEX.test(resp.error.message)) {
    resp = await supabase
      .from("proyectos")
      .update(buildPayload(p, false))
      .eq("id", id);
  }

  if (resp.error) redirect(`/dashboard/proyectos/${id}/editar?error=${encodeURIComponent(resp.error.message)}`);

  try {
    await syncArchivos(supabase, id, p.archivos);
  } catch {
    // join table no migrada todavia
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/proyectos");
  revalidatePath(`/dashboard/proyectos/${id}`);
  redirect(`/dashboard/proyectos/${id}`);
}

export async function eliminarProyecto(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("proyectos").delete().eq("id", id);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/proyectos");
  redirect("/dashboard/proyectos");
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { uploadArchivo, eliminarArchivo, getArchivoUrl } from "@/lib/archivos";

const TIPOS_VALIDOS = ["beat", "recibidos"] as const;

export async function crearBucketCotizacion(formData: FormData): Promise<void> {
  const nombre = String(formData.get("nombre") || "").trim();
  const tipoRaw = String(formData.get("tipo") || "").trim();
  const tipo = (TIPOS_VALIDOS as readonly string[]).includes(tipoRaw) ? tipoRaw : null;

  if (!nombre) redirect("/dashboard/cotizaciones/nuevo?error=Falta+nombre");
  if (!tipo) redirect("/dashboard/cotizaciones/nuevo?error=Eleg%C3%AD+un+tipo+(Beat+o+Recibidos)");

  const supabase = await createClient();
  const payloadBase: Record<string, any> = {
    nombre,
    descripcion: (formData.get("descripcion") as string) || null,
    cliente_id: (formData.get("cliente_id") as string) || null,
    proyecto_id: (formData.get("proyecto_id") as string) || null,
  };

  let resp = await supabase.from("cotizaciones").insert({ ...payloadBase, tipo }).select("id").single();
  if (resp.error && /tipo/.test(resp.error.message)) {
    // fallback si la migración 0005 no se corrió
    resp = await supabase.from("cotizaciones").insert(payloadBase).select("id").single();
  }
  if (resp.error) redirect(`/dashboard/cotizaciones/nuevo?error=${encodeURIComponent(resp.error.message)}`);

  revalidatePath("/dashboard/cotizaciones");
  redirect(`/dashboard/cotizaciones/${resp.data!.id}`);
}

export async function eliminarBucketCotizacion(id: string): Promise<void> {
  const supabase = await createClient();
  // borrar archivos asociados primero
  const { data: archs } = await supabase.from("archivos")
    .select("id, storage_path").eq("entidad_tipo", "cotizacion").eq("entidad_id", id);
  if (archs && archs.length) {
    await supabase.storage.from("archivos").remove(archs.map(a => a.storage_path));
    await supabase.from("archivos").delete().eq("entidad_tipo", "cotizacion").eq("entidad_id", id);
  }
  await supabase.from("cotizaciones").delete().eq("id", id);
  revalidatePath("/dashboard/cotizaciones");
  redirect("/dashboard/cotizaciones");
}

export async function subirArchivoCotizacion(formData: FormData): Promise<{ error?: string } | void> {
  const file = formData.get("file") as File;
  const entidad_id = String(formData.get("entidad_id"));
  const res = await uploadArchivo(file, "cotizacion", entidad_id);
  revalidatePath(`/dashboard/cotizaciones/${entidad_id}`);
  if (res.error) return { error: res.error };
}

export async function eliminarArchivoCotizacion(archivoId: string, entidadId: string): Promise<void> {
  await eliminarArchivo(archivoId);
  revalidatePath(`/dashboard/cotizaciones/${entidadId}`);
}

export async function urlArchivo(storagePath: string) {
  return getArchivoUrl(storagePath);
}

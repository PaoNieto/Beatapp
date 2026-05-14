"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { uploadArchivo, eliminarArchivo, getArchivoUrl } from "@/lib/archivos";

export async function crearBucketCotizacion(formData: FormData): Promise<void> {
  const nombre = String(formData.get("nombre") || "").trim();
  if (!nombre) redirect("/dashboard/cotizaciones/nuevo?error=Falta+nombre");

  const supabase = await createClient();
  const { error, data } = await supabase.from("cotizaciones").insert({
    nombre,
    descripcion: (formData.get("descripcion") as string) || null,
    cliente_id: (formData.get("cliente_id") as string) || null,
    proyecto_id: (formData.get("proyecto_id") as string) || null,
  }).select("id").single();

  if (error) redirect(`/dashboard/cotizaciones/nuevo?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard/cotizaciones");
  redirect(`/dashboard/cotizaciones/${data!.id}`);
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

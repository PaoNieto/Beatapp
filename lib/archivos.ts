"use server";

import { createClient } from "@/lib/supabase/server";

export type EntidadTipo = "cotizacion" | "proveedor" | "proyecto" | "cliente" | "brief" | "reunion";

export async function uploadArchivo(
  file: File,
  entidad_tipo: EntidadTipo,
  entidad_id: string,
): Promise<{ error?: string; archivoId?: string }> {
  if (!file || file.size === 0) return { error: "Archivo vacío" };

  const supabase = await createClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${entidad_tipo}/${entidad_id}/${Date.now()}_${safeName}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await supabase.storage
    .from("archivos")
    .upload(storagePath, buffer, { contentType: file.type, upsert: false });

  if (upErr) return { error: upErr.message };

  const { data, error: dbErr } = await supabase
    .from("archivos")
    .insert({
      nombre: file.name,
      storage_path: storagePath,
      mime_type: file.type,
      size_bytes: file.size,
      entidad_tipo,
      entidad_id,
    })
    .select("id")
    .single();

  if (dbErr) return { error: dbErr.message };
  return { archivoId: data!.id };
}

export async function listarArchivos(entidad_tipo: EntidadTipo, entidad_id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("archivos")
    .select("id, nombre, storage_path, mime_type, size_bytes, created_at")
    .eq("entidad_tipo", entidad_tipo)
    .eq("entidad_id", entidad_id)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getArchivoUrl(storage_path: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from("archivos")
    .createSignedUrl(storage_path, 60 * 60); // 1 hora
  return data?.signedUrl ?? null;
}

export async function eliminarArchivo(archivoId: string): Promise<void> {
  const supabase = await createClient();
  const { data: arch } = await supabase
    .from("archivos").select("storage_path").eq("id", archivoId).single();
  if (arch?.storage_path) {
    await supabase.storage.from("archivos").remove([arch.storage_path]);
  }
  await supabase.from("archivos").delete().eq("id", archivoId);
}

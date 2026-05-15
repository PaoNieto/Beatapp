"use server";

import { createClient } from "@/lib/supabase/server";

export type EntidadTipo = "cotizacion" | "proveedor" | "proyecto" | "cliente" | "brief" | "reunion";

// Pide a Supabase una URL firmada para que el navegador suba el archivo directo.
// El server NO recibe el archivo: solo devuelve token + path.
export async function crearSignedUpload(
  filename: string,
  entidad_tipo: EntidadTipo,
  entidad_id: string,
): Promise<{ error?: string; signedUrl?: string; token?: string; path?: string }> {
  if (!filename) return { error: "Nombre vacío" };
  const supabase = await createClient();
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${entidad_tipo}/${entidad_id}/${Date.now()}_${safeName}`;

  const { data, error } = await supabase.storage
    .from("archivos")
    .createSignedUploadUrl(path);

  if (error || !data) return { error: error?.message || "no se pudo firmar" };
  return { signedUrl: data.signedUrl, token: data.token, path };
}

// Una vez que el navegador subió a Supabase, registramos la metadata.
export async function registrarArchivoSubido(input: {
  nombre: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number;
  entidad_tipo: EntidadTipo;
  entidad_id: string;
}): Promise<{ error?: string; archivoId?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("archivos")
    .insert({
      nombre: input.nombre,
      storage_path: input.storage_path,
      mime_type: input.mime_type,
      size_bytes: input.size_bytes,
      entidad_tipo: input.entidad_tipo,
      entidad_id: input.entidad_id,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  return { archivoId: data!.id };
}

// Compat: sigue existiendo para llamadas viejas, pero ya no la usa el uploader.
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

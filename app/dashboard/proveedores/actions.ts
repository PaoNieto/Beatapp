"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { uploadArchivo, eliminarArchivo, getArchivoUrl } from "@/lib/archivos";

export async function crearProveedor(formData: FormData): Promise<void> {
  const nombre = String(formData.get("nombre") || "").trim();
  const categoria = String(formData.get("categoria") || "").trim();
  if (!nombre || !categoria) redirect("/dashboard/proveedores/nuevo?error=Falta+nombre+o+categoria");

  const supabase = await createClient();
  const calif = formData.get("calificacion") ? Number(formData.get("calificacion")) : 0;
  const { error, data } = await supabase.from("proveedores").insert({
    nombre,
    categoria,
    razon_social: formData.get("razon_social") || null,
    ruc: formData.get("ruc") || null,
    subcategoria: formData.get("subcategoria") || null,
    contacto: formData.get("contacto") || null,
    telefono: formData.get("telefono") || null,
    email: formData.get("email") || null,
    ciudad: formData.get("ciudad") || "Lima",
    calificacion: calif,
    notas: formData.get("notas") || null,
  }).select("id").single();

  if (error) redirect(`/dashboard/proveedores/nuevo?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard/proveedores");
  redirect(`/dashboard/proveedores/${data!.id}`);
}

export async function eliminarProveedor(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: archs } = await supabase.from("archivos")
    .select("id, storage_path").eq("entidad_tipo", "proveedor").eq("entidad_id", id);
  if (archs && archs.length) {
    await supabase.storage.from("archivos").remove(archs.map(a => a.storage_path));
    await supabase.from("archivos").delete().eq("entidad_tipo", "proveedor").eq("entidad_id", id);
  }
  await supabase.from("proveedores").delete().eq("id", id);
  revalidatePath("/dashboard/proveedores");
  redirect("/dashboard/proveedores");
}

export async function subirArchivoProveedor(formData: FormData): Promise<{ error?: string } | void> {
  const file = formData.get("file") as File;
  const entidad_id = String(formData.get("entidad_id"));
  const res = await uploadArchivo(file, "proveedor", entidad_id);
  revalidatePath(`/dashboard/proveedores/${entidad_id}`);
  if (res.error) return { error: res.error };
}

export async function eliminarArchivoProveedor(archivoId: string, entidadId: string): Promise<void> {
  await eliminarArchivo(archivoId);
  revalidatePath(`/dashboard/proveedores/${entidadId}`);
}

export async function urlArchivoProveedor(storagePath: string) {
  return getArchivoUrl(storagePath);
}

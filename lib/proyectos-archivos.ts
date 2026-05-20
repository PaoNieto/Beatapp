import { createClient } from "@/lib/supabase/server";

export type ArchivoCotizacion = {
  id: string;
  nombre: string;
  bucket_nombre: string;
};

export async function listarArchivosDeCotizaciones(): Promise<ArchivoCotizacion[]> {
  const supabase = await createClient();
  const { data: archivos } = await supabase
    .from("archivos")
    .select("id, nombre, entidad_id, created_at")
    .eq("entidad_tipo", "cotizacion")
    .order("created_at", { ascending: false });
  if (!archivos?.length) return [];

  const bucketIds = Array.from(new Set(archivos.map((a: any) => a.entidad_id)));
  const { data: buckets } = await supabase
    .from("cotizaciones")
    .select("id, nombre")
    .in("id", bucketIds);

  const nameById = new Map<string, string>(
    (buckets ?? []).map((b: any) => [b.id, b.nombre as string]),
  );

  return archivos.map((a: any) => ({
    id: a.id as string,
    nombre: a.nombre as string,
    bucket_nombre: nameById.get(a.entidad_id) || "(carpeta eliminada)",
  }));
}

export async function archivosVinculadosIds(proyectoId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proyecto_archivos")
    .select("archivo_id")
    .eq("proyecto_id", proyectoId);
  if (error) return [];
  return (data ?? []).map((r: any) => r.archivo_id as string);
}

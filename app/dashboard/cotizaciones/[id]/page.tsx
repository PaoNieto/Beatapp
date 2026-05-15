import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { listarArchivos } from "@/lib/archivos";
import ArchivosUploader from "@/components/archivos-uploader";
import ArchivoActions from "@/components/archivo-actions";
import { eliminarArchivoCotizacion, urlArchivo, eliminarBucketCotizacion } from "../actions";

function formatSize(b: number | null) {
  if (!b) return "—";
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(1) + " MB";
}

export default async function BucketCotizacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: bucket } = await supabase
    .from("cotizaciones")
    .select("id, nombre, descripcion, created_at")
    .eq("id", id)
    .single();
  if (!bucket) notFound();

  const archivos = await listarArchivos("cotizacion", id);
  const deleteWithId = async (archivoId: string) => {
    "use server";
    await eliminarArchivoCotizacion(archivoId, id);
  };
  const deleteBucket = async () => {
    "use server";
    await eliminarBucketCotizacion(id);
  };

  return (
    <div className="max-w-5xl">
      <Link href="/dashboard/cotizaciones" className="text-sm text-gray-600 hover:text-[var(--color-beat-yellow-hover)]">← Volver a cotizaciones</Link>

      <header className="mt-3 mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl">{bucket.nombre}</h1>
          {bucket.descripcion && <p className="text-gray-700 mt-2">{bucket.descripcion}</p>}
          <p className="text-sm text-gray-500 mt-2">📅 Creada {formatDate(bucket.created_at)}</p>
        </div>
        <form action={deleteBucket}>
          <button type="submit" className="px-3 py-2 text-xs rounded border border-red-300 text-red-700 hover:bg-red-50 transition">
            Eliminar carpeta
          </button>
        </form>
      </header>

      <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-xl mb-4">Subir archivos</h2>
        <ArchivosUploader entidadTipo="cotizacion" entidadId={id} />
      </section>

      <section className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl mb-4">Archivos ({archivos.length})</h2>
        {archivos.length === 0 ? (
          <p className="text-sm text-gray-500">Sin archivos todavía.</p>
        ) : (
          <ul className="divide-y">
            {archivos.map((a) => (
              <li key={a.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{a.nombre}</p>
                  <p className="text-xs text-gray-500">
                    {a.mime_type || "archivo"} · {formatSize(a.size_bytes)} · {formatDate(a.created_at)}
                  </p>
                </div>
                <ArchivoActions
                  archivoId={a.id}
                  storagePath={a.storage_path}
                  getUrl={urlArchivo}
                  onDelete={deleteWithId}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

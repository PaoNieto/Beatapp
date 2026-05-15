import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { listarArchivos } from "@/lib/archivos";
import ArchivosUploader from "@/components/archivos-uploader";
import ArchivoActions from "@/components/archivo-actions";
import { eliminarArchivoProveedor, urlArchivoProveedor, eliminarProveedor } from "../actions";

function formatSize(b: number | null) {
  if (!b) return "—";
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(1) + " MB";
}

export default async function ProveedorDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: p } = await supabase.from("proveedores").select("*").eq("id", id).single();
  if (!p) notFound();

  const archivos = await listarArchivos("proveedor", id);
  const deleteArch = async (archivoId: string) => {
    "use server";
    await eliminarArchivoProveedor(archivoId, id);
  };
  const deleteProv = async () => {
    "use server";
    await eliminarProveedor(id);
  };

  return (
    <div className="max-w-5xl">
      <Link href="/dashboard/proveedores" className="text-sm text-gray-600 hover:text-[var(--color-beat-yellow-hover)]">← Volver a proveedores</Link>

      <header className="mt-3 mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl">{p.nombre}</h1>
          <p className="text-gray-600 mt-1">
            {p.categoria}{p.subcategoria ? ` · ${p.subcategoria}` : ""} ·{" "}
            <span title={`${p.calificacion}/5`}>{"★".repeat(p.calificacion || 0)}{"☆".repeat(5 - (p.calificacion || 0))}</span>
          </p>
        </div>
        <form action={deleteProv}>
          <button type="submit" className="px-3 py-2 text-xs rounded border border-red-300 text-red-700 hover:bg-red-50 transition">
            Eliminar proveedor
          </button>
        </form>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500">Contacto</p>
          <p className="text-lg">{p.contacto || "—"}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500">Teléfono</p>
          <p className="text-lg">{p.telefono || "—"}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500">Email</p>
          <p className="text-lg">{p.email || "—"}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500">Ciudad</p>
          <p className="text-lg">{p.ciudad || "—"}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500">RUC</p>
          <p className="text-lg">{p.ruc || "—"}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500">Razón social</p>
          <p className="text-lg">{p.razon_social || "—"}</p>
        </div>
      </div>

      {p.notas && (
        <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl mb-2">Notas</h2>
          <p className="text-sm whitespace-pre-wrap text-gray-700">{p.notas}</p>
        </section>
      )}

      <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-xl mb-4">Subir archivos</h2>
        <ArchivosUploader entidadTipo="proveedor" entidadId={id} />
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
                  getUrl={urlArchivoProveedor}
                  onDelete={deleteArch}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

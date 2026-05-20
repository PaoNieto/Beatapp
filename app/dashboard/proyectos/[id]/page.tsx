import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { eliminarProyecto } from "../actions";

function formatRango(inicio: string | null, fin: string | null): string {
  if (!inicio && !fin) return "—";
  if (inicio && fin && inicio !== fin) return `${formatDate(inicio)} → ${formatDate(fin)}`;
  return formatDate(inicio || fin);
}

export default async function ProyectoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: p } = await supabase
    .from("proyectos")
    .select("*, clientes(id, nombre)")
    .eq("id", id)
    .single();

  if (!p) notFound();

  const equipo: string[] = Array.isArray(p.equipo) ? p.equipo : [];

  // Archivos vinculados (de cotizaciones u otros)
  let archivosVinc: Array<{ id: string; nombre: string; storage_path: string; bucket?: string | null }> = [];
  try {
    const { data: links } = await supabase
      .from("proyecto_archivos")
      .select("archivo_id")
      .eq("proyecto_id", id);
    const archivoIds = (links ?? []).map((l: any) => l.archivo_id);
    if (archivoIds.length) {
      const { data: archs } = await supabase
        .from("archivos")
        .select("id, nombre, storage_path, entidad_tipo, entidad_id")
        .in("id", archivoIds);
      const bucketIds = Array.from(new Set((archs ?? []).filter((a: any) => a.entidad_tipo === "cotizacion").map((a: any) => a.entidad_id)));
      const { data: buckets } = bucketIds.length
        ? await supabase.from("cotizaciones").select("id, nombre").in("id", bucketIds)
        : { data: [] as any[] };
      const bucketMap = new Map<string, string>((buckets ?? []).map((b: any) => [b.id, b.nombre as string]));
      archivosVinc = (archs ?? []).map((a: any) => ({
        id: a.id,
        nombre: a.nombre,
        storage_path: a.storage_path,
        bucket: a.entidad_tipo === "cotizacion" ? bucketMap.get(a.entidad_id) ?? null : null,
      }));
    }
  } catch {
    // tabla proyecto_archivos no existe (migración pendiente) — sigue sin archivos
  }

  const handleDelete = async () => {
    "use server";
    await eliminarProyecto(id);
  };

  return (
    <div className="max-w-5xl">
      <Link href="/dashboard/proyectos" className="text-sm text-gray-600 hover:text-[var(--color-beat-yellow-hover)]">
        ← Volver a proyectos
      </Link>

      <header className="mt-3 mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-gray-500">Cot. aprobada: {p.codigo}</p>
          <h1 className="text-3xl mt-1">{p.nombre}</h1>
          <p className="text-gray-600 mt-1">
            {p.clientes?.nombre ? `Cliente: ${p.clientes.nombre} · ` : ""}
            Estado: <span className="px-2 py-0.5 rounded text-xs bg-[var(--color-beat-yellow)]/20">{p.estado}</span>
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href={`/dashboard/proyectos/${id}/editar`}
            className="px-4 py-2 rounded-lg bg-[var(--color-beat-yellow)] text-[var(--color-beat-black)] font-semibold text-sm hover:bg-[var(--color-beat-yellow-hover)] transition"
          >
            Editar
          </Link>
          <form action={handleDelete}>
            <button
              type="submit"
              className="px-3 py-2 text-xs rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition"
            >
              Eliminar
            </button>
          </form>
        </div>
      </header>

      <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-xl mb-4">Fechas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-500 font-semibold">Montaje</p>
            <p className="text-sm mt-1">{formatRango(p.montaje_inicio, p.montaje_fin)}</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-500 font-semibold">Operación</p>
            <p className="text-sm mt-1">
              {formatRango(p.operacion_inicio ?? p.fecha_evento, p.operacion_fin ?? p.fecha_fin)}
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-500 font-semibold">Desmontaje</p>
            <p className="text-sm mt-1">{formatRango(p.desmontaje_inicio, p.desmontaje_fin)}</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500">Tipo</p>
          <p className="text-lg">{p.tipo_evento || "—"}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500">Locación</p>
          <p className="text-lg">{p.locacion || "—"}</p>
        </div>
      </div>

      <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-xl mb-3">Equipo Beat asignado</h2>
        {equipo.length === 0 ? (
          <p className="text-sm text-gray-500">Nadie asignado todavía.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {equipo.map((n) => (
              <span
                key={n}
                className="px-3 py-1 rounded-full text-sm bg-[var(--color-beat-yellow)]/20 border border-[var(--color-beat-yellow)]/40"
              >
                {n}
              </span>
            ))}
          </div>
        )}
      </section>

      {p.descripcion && (
        <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl mb-3">Descripción</h2>
          <p className="text-sm whitespace-pre-wrap text-gray-700">{p.descripcion}</p>
        </section>
      )}

      <section className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl mb-3">Archivos vinculados de Cotizaciones</h2>
        {archivosVinc.length === 0 ? (
          <p className="text-sm text-gray-500">
            Ninguno vinculado.{" "}
            <Link href={`/dashboard/proyectos/${id}/editar`} className="text-[var(--color-beat-yellow-hover)] hover:underline">
              Vincular ahora
            </Link>
          </p>
        ) : (
          <ul className="divide-y">
            {archivosVinc.map((a) => (
              <li key={a.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{a.nombre}</p>
                  {a.bucket && <p className="text-xs text-gray-500">📁 {a.bucket}</p>}
                </div>
                <a
                  href={`/api/archivo?path=${encodeURIComponent(a.storage_path)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50"
                >
                  Abrir
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

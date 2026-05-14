import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function CotizacionesPage() {
  const supabase = await createClient();
  const { data: buckets = [] } = await supabase
    .from("cotizaciones")
    .select("id, nombre, descripcion, created_at")
    .order("created_at", { ascending: false });

  const ids = (buckets ?? []).map((b: any) => b.id);
  const counts = new Map<string, number>();
  if (ids.length) {
    const { data: archs } = await supabase
      .from("archivos").select("entidad_id")
      .eq("entidad_tipo", "cotizacion").in("entidad_id", ids);
    (archs ?? []).forEach((a: any) => {
      counts.set(a.entidad_id, (counts.get(a.entidad_id) || 0) + 1);
    });
  }

  return (
    <div className="max-w-7xl">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl">Cotizaciones</h1>
          <p className="text-sm text-gray-600 mt-1">Carpetas personalizadas con archivos adentro</p>
        </div>
        <Link href="/dashboard/cotizaciones/nuevo"
          className="px-5 py-2.5 rounded-lg bg-[var(--color-beat-yellow)] text-[var(--color-beat-black)] font-semibold hover:bg-[var(--color-beat-yellow-hover)] transition">
          + Nueva carpeta
        </Link>
      </header>

      {(buckets ?? []).length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-500">
          Aún no hay carpetas de cotizaciones.{" "}
          <Link href="/dashboard/cotizaciones/nuevo" className="text-[var(--color-beat-yellow-hover)] hover:underline">Crear la primera</Link>.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(buckets ?? []).map((b: any) => (
            <Link
              key={b.id}
              href={`/dashboard/cotizaciones/${b.id}`}
              className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition border-l-4 border-[var(--color-beat-yellow)]"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-lg">{b.nombre}</h3>
                <span className="text-xs bg-[var(--color-beat-yellow)]/20 px-2 py-1 rounded">
                  {counts.get(b.id) || 0} archivos
                </span>
              </div>
              {b.descripcion && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{b.descripcion}</p>}
              <p className="text-xs text-gray-400 mt-2">Creada {formatDate(b.created_at)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

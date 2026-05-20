import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { eliminarReunion } from "./actions";

function formatFechaHora(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString("es-PE", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default async function ReunionesPage() {
  const supabase = await createClient();
  const { data: reuniones = [] } = await supabase
    .from("reuniones")
    .select("id, fecha, notas")
    .order("fecha", { ascending: false });

  return (
    <div className="max-w-5xl">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl">Reuniones</h1>
        <Link
          href="/dashboard/reuniones/nuevo"
          className="px-5 py-2.5 rounded-lg bg-[var(--color-beat-yellow)] text-[var(--color-beat-black)] font-semibold hover:bg-[var(--color-beat-yellow-hover)] transition"
        >
          + Nueva reunión
        </Link>
      </header>

      {(reuniones ?? []).length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-500">
          <p className="mb-2">Aún no hay reuniones.</p>
          <Link
            href="/dashboard/reuniones/nuevo"
            className="text-[var(--color-beat-yellow-hover)] hover:underline"
          >
            Crear la primera
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {(reuniones ?? []).map((r: any) => (
            <article
              key={r.id}
              className="bg-white rounded-2xl shadow-sm p-5 flex items-start justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--color-beat-black)]">
                  {formatFechaHora(r.fecha)}
                </p>
                {r.notas ? (
                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{r.notas}</p>
                ) : (
                  <p className="text-sm text-gray-400 mt-2 italic">Sin descripción</p>
                )}
              </div>
              <form action={eliminarReunion}>
                <input type="hidden" name="id" value={r.id} />
                <button
                  type="submit"
                  className="text-xs text-gray-500 hover:text-red-600 transition px-2 py-1"
                  title="Eliminar reunión"
                >
                  Eliminar
                </button>
              </form>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

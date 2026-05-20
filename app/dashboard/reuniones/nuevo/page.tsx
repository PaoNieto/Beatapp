import Link from "next/link";
import { crearReunion } from "../actions";

export default async function NuevaReunionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/reuniones" className="text-sm text-gray-600 hover:text-[var(--color-beat-yellow-hover)]">
        ← Volver a reuniones
      </Link>
      <h1 className="text-3xl mt-2 mb-6">Nueva reunión</h1>

      {error && (
        <div className="mb-4 p-4 rounded-lg border border-red-300 bg-red-50 text-red-800 text-sm">
          <p className="font-semibold mb-1">No se pudo crear la reunión</p>
          <p className="font-mono text-xs whitespace-pre-wrap">{error}</p>
        </div>
      )}

      <form action={crearReunion} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Fecha y hora *</label>
          <input
            name="fecha" type="datetime-local" required
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea
            name="descripcion" rows={6} placeholder="Qué se trató, acuerdos, próximos pasos..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-[var(--color-beat-yellow)] text-[var(--color-beat-black)] font-semibold hover:bg-[var(--color-beat-yellow-hover)] transition"
          >
            Crear reunión
          </button>
          <Link
            href="/dashboard/reuniones"
            className="px-6 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

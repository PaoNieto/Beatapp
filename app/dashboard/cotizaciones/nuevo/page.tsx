import Link from "next/link";
import { crearBucketCotizacion } from "../actions";

export default async function NuevaCotizacionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/cotizaciones" className="text-sm text-gray-600 hover:text-[var(--color-beat-yellow-hover)]">← Volver</Link>
      <h1 className="text-3xl mt-2 mb-6">Nueva carpeta de cotizaciones</h1>

      {sp.error && (
        <div className="bg-red-50 border border-red-300 text-red-800 rounded-lg p-3 text-sm mb-4">{sp.error}</div>
      )}

      <form action={crearBucketCotizacion} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre de la carpeta *</label>
          <input name="nombre" required placeholder="Cotizaciones Feria Nexo 2026"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
          <textarea name="descripcion" rows={3} placeholder="Cualquier nota o contexto..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="px-6 py-2.5 rounded-lg bg-[var(--color-beat-yellow)] text-[var(--color-beat-black)] font-semibold hover:bg-[var(--color-beat-yellow-hover)] transition">
            Crear carpeta
          </button>
          <Link href="/dashboard/cotizaciones" className="px-6 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}

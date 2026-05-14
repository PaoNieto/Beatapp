import Link from "next/link";
import { crearProveedor } from "../actions";

const categorias = [
  ["catering","Catering"],["sonido_av","Sonido / AV"],["mobiliario","Mobiliario"],
  ["escenografia","Escenografía"],["audiovisual","Audiovisual / foto / video"],
  ["talento","Talento / animación"],["logistica","Logística / transporte"],
  ["impresion","Impresión"],["locaciones","Locaciones"],["seguridad","Seguridad / salud"],
  ["decoracion","Decoración / florales"],["otros","Otros"],
];

export default async function NuevoProveedorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/proveedores" className="text-sm text-gray-600 hover:text-[var(--color-beat-yellow-hover)]">← Volver</Link>
      <h1 className="text-3xl mt-2 mb-6">Nuevo proveedor</h1>

      {sp.error && (
        <div className="bg-red-50 border border-red-300 text-red-800 rounded-lg p-3 text-sm mb-4">{sp.error}</div>
      )}

      <form action={crearProveedor} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre comercial *</label>
            <input name="nombre" required placeholder="Catering Vértice"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Categoría *</label>
            <select name="categoria" required defaultValue=""
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none">
              <option value="">— Elegí una —</option>
              {categorias.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Subcategoría (opcional)</label>
          <input name="subcategoria" placeholder="corporativo premium"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Razón social</label>
            <input name="razon_social" className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">RUC</label>
            <input name="ruc" className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Contacto</label>
            <input name="contacto" placeholder="Renzo Mendoza"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <input name="telefono" className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input name="email" type="email" className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ciudad</label>
            <input name="ciudad" defaultValue="Lima"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Calificación (0-5)</label>
          <input name="calificacion" type="number" min="0" max="5" defaultValue="0"
            className="w-32 px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notas</label>
          <textarea name="notas" rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="px-6 py-2.5 rounded-lg bg-[var(--color-beat-yellow)] text-[var(--color-beat-black)] font-semibold hover:bg-[var(--color-beat-yellow-hover)] transition">Crear proveedor</button>
          <Link href="/dashboard/proveedores" className="px-6 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}

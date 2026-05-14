import Link from "next/link";
import { crearCliente } from "../actions";

export default function NuevoClientePage() {
  const industrias = ["banca","retail","farma","tech","educacion","gobierno","consumo_masivo","otro"];

  return (
    <div className="max-w-3xl">
      <Link href="/dashboard/clientes" className="text-sm text-gray-600 hover:text-[var(--color-beat-yellow-hover)]">← Volver a clientes</Link>
      <h1 className="text-3xl mt-2 mb-6">Nuevo cliente</h1>

      <form action={crearCliente} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre comercial *</label>
          <input name="nombre" required placeholder="BCP"
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
            <label className="block text-sm font-medium mb-1">Industria</label>
            <select name="industria" className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none">
              <option value="">—</option>
              {industrias.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prioridad</label>
            <select name="prioridad" defaultValue="media" className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none">
              <option value="alta">alta</option>
              <option value="media">media</option>
              <option value="baja">baja</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Contacto principal</label>
            <input name="contacto_principal" className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cargo</label>
            <input name="cargo_contacto" className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input name="email" type="email" className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <input name="telefono" className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Dirección</label>
          <input name="direccion" className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notas clave</label>
          <textarea name="notas_clave" rows={3} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="px-6 py-2.5 rounded-lg bg-[var(--color-beat-yellow)] text-[var(--color-beat-black)] font-semibold hover:bg-[var(--color-beat-yellow-hover)] transition">Crear cliente</button>
          <Link href="/dashboard/clientes" className="px-6 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}

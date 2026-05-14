import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data: clientes = [] } = await supabase
    .from("clientes").select("id, nombre, industria, contacto_principal, telefono, prioridad")
    .order("nombre");

  return (
    <div className="max-w-7xl">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl">Clientes</h1>
        <Link href="/dashboard/clientes/nuevo"
          className="px-5 py-2.5 rounded-lg bg-[var(--color-beat-yellow)] text-[var(--color-beat-black)] font-semibold hover:bg-[var(--color-beat-yellow-hover)] transition">
          + Nuevo cliente
        </Link>
      </header>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-beat-yellow)] text-[var(--color-beat-black)]">
            <tr>
              <th className="text-left px-4 py-3 font-display">Cliente</th>
              <th className="text-left px-4 py-3 font-display">Industria</th>
              <th className="text-left px-4 py-3 font-display">Contacto</th>
              <th className="text-left px-4 py-3 font-display">Teléfono</th>
              <th className="text-left px-4 py-3 font-display">Prioridad</th>
            </tr>
          </thead>
          <tbody>
            {(clientes ?? []).length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-500">Aún no hay clientes.</td></tr>
            ) : (
              (clientes ?? []).map((c: any) => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.nombre}</td>
                  <td className="px-4 py-3">{c.industria || "—"}</td>
                  <td className="px-4 py-3">{c.contacto_principal || "—"}</td>
                  <td className="px-4 py-3">{c.telefono || "—"}</td>
                  <td className="px-4 py-3">{c.prioridad}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

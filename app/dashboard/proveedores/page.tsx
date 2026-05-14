import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const categoriaLabels: Record<string, string> = {
  catering: "Catering", sonido_av: "Sonido / AV", mobiliario: "Mobiliario",
  escenografia: "Escenografía", audiovisual: "Audiovisual", talento: "Talento",
  logistica: "Logística", impresion: "Impresión", locaciones: "Locaciones",
  seguridad: "Seguridad", decoracion: "Decoración", otros: "Otros",
};

export default async function ProveedoresPage() {
  const supabase = await createClient();
  const { data: proveedores = [] } = await supabase
    .from("proveedores")
    .select("id, nombre, categoria, subcategoria, contacto, telefono, calificacion, veces_contratado")
    .order("nombre");

  // agrupar por categoría
  const grouped: Record<string, any[]> = {};
  (proveedores ?? []).forEach((p: any) => {
    const cat = p.categoria || "otros";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  });

  return (
    <div className="max-w-7xl">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl">Proveedores</h1>
        <Link href="/dashboard/proveedores/nuevo"
          className="px-5 py-2.5 rounded-lg bg-[var(--color-beat-yellow)] text-[var(--color-beat-black)] font-semibold hover:bg-[var(--color-beat-yellow-hover)] transition">
          + Nuevo proveedor
        </Link>
      </header>

      {(proveedores ?? []).length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-500">
          Aún no hay proveedores.{" "}
          <Link href="/dashboard/proveedores/nuevo" className="text-[var(--color-beat-yellow-hover)] hover:underline">Crear el primero</Link>.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, items]) => (
            <section key={cat}>
              <h2 className="text-lg font-display mb-3">{categoriaLabels[cat] || cat}</h2>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--color-beat-yellow)]/30 text-[var(--color-beat-black)]">
                    <tr>
                      <th className="text-left px-4 py-2 font-display">Proveedor</th>
                      <th className="text-left px-4 py-2 font-display">Contacto</th>
                      <th className="text-left px-4 py-2 font-display">Teléfono</th>
                      <th className="text-left px-4 py-2 font-display">★</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((p: any) => (
                      <tr key={p.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <Link href={`/dashboard/proveedores/${p.id}`} className="font-medium hover:text-[var(--color-beat-yellow-hover)]">
                            {p.nombre}
                          </Link>
                          {p.subcategoria && <span className="ml-2 text-xs text-gray-500">{p.subcategoria}</span>}
                        </td>
                        <td className="px-4 py-2">{p.contacto || "—"}</td>
                        <td className="px-4 py-2">{p.telefono || "—"}</td>
                        <td className="px-4 py-2">{"★".repeat(p.calificacion || 0)}{"☆".repeat(5 - (p.calificacion || 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function ProyectosPage() {
  const supabase = await createClient();
  const { data: proyectos = [] } = await supabase
    .from("proyectos")
    .select("id, codigo, nombre, fecha_evento, estado, clientes(nombre)")
    .order("fecha_evento", { ascending: false });

  return (
    <div className="max-w-7xl">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl">Proyectos</h1>
        <Link
          href="/dashboard/proyectos/nuevo"
          className="px-5 py-2.5 rounded-lg bg-[var(--color-beat-yellow)] text-[var(--color-beat-black)] font-semibold hover:bg-[var(--color-beat-yellow-hover)] transition"
        >
          + Nuevo proyecto
        </Link>
      </header>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-beat-yellow)] text-[var(--color-beat-black)]">
            <tr>
              <th className="text-left px-4 py-3 font-display">Código</th>
              <th className="text-left px-4 py-3 font-display">Nombre</th>
              <th className="text-left px-4 py-3 font-display">Cliente</th>
              <th className="text-left px-4 py-3 font-display">Fecha</th>
              <th className="text-left px-4 py-3 font-display">Estado</th>
            </tr>
          </thead>
          <tbody>
            {(proyectos ?? []).length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-500">Aún no hay proyectos. <Link href="/dashboard/proyectos/nuevo" className="text-[var(--color-beat-yellow-hover)] hover:underline">Crear el primero</Link>.</td></tr>
            ) : (
              (proyectos ?? []).map((p: any) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{p.codigo}</td>
                  <td className="px-4 py-3"><Link href={`/dashboard/proyectos/${p.id}`} className="hover:text-[var(--color-beat-yellow-hover)]">{p.nombre}</Link></td>
                  <td className="px-4 py-3">{p.clientes?.nombre || "—"}</td>
                  <td className="px-4 py-3">{formatDate(p.fecha_evento)}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs bg-[var(--color-beat-yellow)]/20">{p.estado}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

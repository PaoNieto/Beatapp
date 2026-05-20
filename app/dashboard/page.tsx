import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import CalendarioInteractivo from "@/components/calendario-interactivo";

export default async function DashboardHome() {
  const supabase = await createClient();

  const [{ data: activos }, { data: proyectosFecha }, { data: recordatorios }] = await Promise.all([
    supabase
      .from("proyectos")
      .select("id, codigo, nombre, fecha_evento, estado, clientes(nombre)")
      .in("estado", ["brief", "propuesta", "cotizacion", "aprobado", "produccion"])
      .order("fecha_evento", { ascending: true })
      .limit(20),
    supabase
      .from("proyectos")
      .select("id, codigo, nombre, fecha_evento, fecha_fin, clientes(nombre)")
      .not("fecha_evento", "is", null),
    supabase
      .from("recordatorios")
      .select("id, fecha, titulo, descripcion"),
  ]);

  const eventos = [
    ...(proyectosFecha ?? []).map((p: any) => {
      const end = p.fecha_fin
        ? new Date(new Date(p.fecha_fin as string).getTime() + 86400000)
            .toISOString()
            .slice(0, 10)
        : undefined;
      return {
        id: `proyecto-${p.id}`,
        title: `${p.clientes?.nombre ? p.clientes.nombre + " — " : ""}${p.nombre}`,
        start: p.fecha_evento as string,
        end,
        allDay: true,
        url: `/dashboard/proyectos/${p.id}`,
        backgroundColor: "#FFB600",
        borderColor: "#FFB600",
        textColor: "#131615",
        extendedProps: { tipo: "proyecto" as const },
      };
    }),
    ...(recordatorios ?? []).map((r: any) => ({
      id: r.id,
      title: r.titulo,
      start: r.fecha as string,
      backgroundColor: "#131615",
      borderColor: "#131615",
      textColor: "#FFFFFF",
      extendedProps: { tipo: "recordatorio" as const, descripcion: r.descripcion },
    })),
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl">Beat</h1>
          <p className="text-gray-600 mt-1">Panel general</p>
        </div>
        <Link
          href="/dashboard/proyectos/nuevo"
          className="shrink-0 px-5 py-2.5 rounded-lg bg-[var(--color-beat-yellow)] text-[var(--color-beat-black)] font-semibold hover:bg-[var(--color-beat-yellow-hover)] transition"
        >
          + Nuevo proyecto
        </Link>
      </header>

      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
          <h2 className="text-xl">Calendario</h2>
          <p className="text-xs text-gray-500">
            Click en un día vacío para crear un recordatorio · Click en un evento para abrirlo
          </p>
        </div>
        <CalendarioInteractivo eventos={eventos} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl">Proyectos activos</h2>
          <Link href="/dashboard/proyectos" className="text-sm text-[var(--color-beat-yellow-hover)] hover:underline">
            Ver todos
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-beat-yellow)] text-[var(--color-beat-black)]">
              <tr>
                <th className="text-left px-4 py-3 font-display">Código</th>
                <th className="text-left px-4 py-3 font-display">Proyecto</th>
                <th className="text-left px-4 py-3 font-display">Cliente</th>
                <th className="text-left px-4 py-3 font-display">Fecha</th>
                <th className="text-left px-4 py-3 font-display">Estado</th>
              </tr>
            </thead>
            <tbody>
              {(activos ?? []).length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">
                  Sin proyectos activos.{" "}
                  <Link href="/dashboard/proyectos/nuevo" className="text-[var(--color-beat-yellow-hover)] hover:underline">Crear el primero</Link>.
                </td></tr>
              ) : (
                (activos ?? []).map((p: any) => (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{p.codigo}</td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/proyectos/${p.id}`} className="hover:text-[var(--color-beat-yellow-hover)]">{p.nombre}</Link>
                    </td>
                    <td className="px-4 py-3">{p.clientes?.nombre || "—"}</td>
                    <td className="px-4 py-3">{formatDate(p.fecha_evento)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs bg-[var(--color-beat-yellow)]/20">{p.estado}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

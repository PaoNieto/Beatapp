import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function ProyectoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: p } = await supabase
    .from("proyectos")
    .select("*, clientes(id, nombre)")
    .eq("id", id)
    .single();

  if (!p) notFound();

  return (
    <div className="max-w-5xl">
      <Link href="/dashboard/proyectos" className="text-sm text-gray-600 hover:text-[var(--color-beat-yellow-hover)]">
        ← Volver a proyectos
      </Link>

      <header className="mt-3 mb-6 flex items-start justify-between">
        <div>
          <p className="font-mono text-xs text-gray-500">{p.codigo}</p>
          <h1 className="text-3xl mt-1">{p.nombre}</h1>
          <p className="text-gray-600 mt-1">
            {p.clientes?.nombre ? `Cliente: ${p.clientes.nombre} · ` : ""}
            Estado: <span className="px-2 py-0.5 rounded text-xs bg-[var(--color-beat-yellow)]/20">{p.estado}</span>
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500">Fecha del evento</p>
          <p className="text-lg">{formatDate(p.fecha_evento)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500">Tipo</p>
          <p className="text-lg">{p.tipo_evento || "—"}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500">Locación</p>
          <p className="text-lg">{p.locacion || "—"}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500">Asistentes estimados</p>
          <p className="text-lg">{p.asistentes_estimados ?? "—"}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500">Presupuesto cliente</p>
          <p className="text-lg">{formatCurrency(p.presupuesto_cliente)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500">Presupuesto real</p>
          <p className="text-lg">{formatCurrency(p.presupuesto_real)}</p>
        </div>
      </div>

      {p.descripcion && (
        <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl mb-3">Descripción</h2>
          <p className="text-sm whitespace-pre-wrap text-gray-700">{p.descripcion}</p>
        </section>
      )}

      <section className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl mb-3">Archivos adjuntos</h2>
        <p className="text-sm text-gray-500">Pronto: subir PDFs, briefs, cotizaciones.</p>
      </section>
    </div>
  );
}

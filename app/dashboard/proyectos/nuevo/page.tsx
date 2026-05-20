import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { crearProyecto } from "../actions";
import { EQUIPO_BEAT } from "@/lib/equipo";

export default async function NuevoProyectoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: clientes = [] } = await supabase
    .from("clientes").select("id, nombre").order("nombre");

  const tipos = ["feria","conferencia","activacion","lanzamiento","gala","convencion","otro"];

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/dashboard/proyectos" className="text-sm text-gray-600 hover:text-[var(--color-beat-yellow-hover)]">
          ← Volver a proyectos
        </Link>
        <h1 className="text-3xl mt-2">Nuevo proyecto</h1>
        <p className="text-sm text-gray-500 mt-1">El código se asigna automáticamente.</p>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg border border-red-300 bg-red-50 text-red-800 text-sm">
          <p className="font-semibold mb-1">No se pudo crear el proyecto</p>
          <p className="font-mono text-xs whitespace-pre-wrap">{error}</p>
        </div>
      )}

      <form action={crearProyecto} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre del proyecto *</label>
          <input
            name="nombre" required placeholder="Aniversario BBVA 2026"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Cliente</label>
            <select
              name="cliente_id"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none"
            >
              <option value="">— Ninguno todavía —</option>
              {(clientes ?? []).map((c: any) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de evento</label>
            <select
              name="tipo_evento"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none"
            >
              <option value="">—</option>
              {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Fecha desde</label>
            <input
              name="fecha_inicio" type="date"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha hasta</label>
            <input
              name="fecha_fin" type="date"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Locación</label>
          <input
            name="locacion" placeholder="Westin Lima"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Equipo Beat asignado</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-lg border border-gray-300 bg-gray-50">
            {EQUIPO_BEAT.map((nombre) => (
              <label
                key={nombre}
                className="flex items-center gap-2 cursor-pointer text-sm hover:text-[var(--color-beat-yellow-hover)]"
              >
                <input
                  type="checkbox"
                  name="equipo"
                  value={nombre}
                  className="w-4 h-4 accent-[var(--color-beat-yellow)]"
                />
                <span>{nombre}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descripción / brief</label>
          <textarea
            name="descripcion" rows={4} placeholder="Resumen breve del proyecto..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-[var(--color-beat-yellow)] text-[var(--color-beat-black)] font-semibold hover:bg-[var(--color-beat-yellow-hover)] transition"
          >
            Crear proyecto
          </button>
          <Link
            href="/dashboard/proyectos"
            className="px-6 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

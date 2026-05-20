import Link from "next/link";
import { EQUIPO_BEAT } from "@/lib/equipo";
import { ESTADOS_PROYECTO } from "@/lib/proyecto-estados";

type ClienteOpt = { id: string; nombre: string };
type ArchivoOpt = {
  id: string;
  nombre: string;
  bucket_nombre: string;
};

export type ProyectoFormValues = {
  codigo?: string | null;
  nombre?: string | null;
  cliente_id?: string | null;
  tipo_evento?: string | null;
  locacion?: string | null;
  descripcion?: string | null;
  estado?: string | null;
  equipo?: string[] | null;
  montaje_inicio?: string | null;
  montaje_fin?: string | null;
  operacion_inicio?: string | null;
  operacion_fin?: string | null;
  desmontaje_inicio?: string | null;
  desmontaje_fin?: string | null;
  archivosVinculados?: string[]; // ids
};

const TIPOS = ["feria","conferencia","activacion","lanzamiento","gala","convencion","otro"];

function FaseInput({
  label,
  prefix,
  inicio,
  fin,
}: {
  label: string;
  prefix: "montaje" | "operacion" | "desmontaje";
  inicio?: string | null;
  fin?: string | null;
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <p className="text-sm font-semibold mb-2">{label}</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Desde</label>
          <input
            name={`${prefix}_inicio`} type="date" defaultValue={inicio ?? ""}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Hasta (opcional)</label>
          <input
            name={`${prefix}_fin`} type="date" defaultValue={fin ?? ""}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none text-sm"
          />
        </div>
      </div>
    </div>
  );
}

export default function ProyectoForm({
  action,
  values = {},
  clientes,
  archivosCotizaciones,
  submitLabel = "Crear proyecto",
  cancelHref = "/dashboard/proyectos",
  showEstado = false,
}: {
  action: (formData: FormData) => Promise<void>;
  values?: ProyectoFormValues;
  clientes: ClienteOpt[];
  archivosCotizaciones: ArchivoOpt[];
  submitLabel?: string;
  cancelHref?: string;
  showEstado?: boolean;
}) {
  const v = values;
  const linkedSet = new Set(v.archivosVinculados ?? []);

  // group archivos by bucket
  const grouped = new Map<string, ArchivoOpt[]>();
  for (const a of archivosCotizaciones) {
    const arr = grouped.get(a.bucket_nombre) || [];
    arr.push(a);
    grouped.set(a.bucket_nombre, arr);
  }

  return (
    <form action={action} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Código de cotización aprobada *</label>
          <input
            name="codigo" required defaultValue={v.codigo ?? ""} placeholder="COT-2026-045"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cliente</label>
          <select
            name="cliente_id" defaultValue={v.cliente_id ?? ""}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none"
          >
            <option value="">— Ninguno todavía —</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Nombre del proyecto *</label>
        <input
          name="nombre" required defaultValue={v.nombre ?? ""} placeholder="Aniversario BBVA 2026"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tipo de evento</label>
          <select
            name="tipo_evento" defaultValue={v.tipo_evento ?? ""}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none"
          >
            <option value="">—</option>
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {showEstado && (
          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <select
              name="estado" defaultValue={v.estado ?? "brief"}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none"
            >
              {ESTADOS_PROYECTO.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Fechas del proyecto</p>
        <p className="text-xs text-gray-500 mb-3">Cada fase es opcional. Si solo poné &quot;Desde&quot;, es 1 día; si poné ambos, es rango.</p>
        <div className="space-y-3">
          <FaseInput label="Montaje" prefix="montaje" inicio={v.montaje_inicio} fin={v.montaje_fin} />
          <FaseInput label="Operación" prefix="operacion" inicio={v.operacion_inicio} fin={v.operacion_fin} />
          <FaseInput label="Desmontaje" prefix="desmontaje" inicio={v.desmontaje_inicio} fin={v.desmontaje_fin} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Locación</label>
        <input
          name="locacion" defaultValue={v.locacion ?? ""} placeholder="Westin Lima"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Equipo Beat asignado</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-lg border border-gray-300 bg-gray-50">
          {EQUIPO_BEAT.map((nombre) => {
            const checked = (v.equipo ?? []).includes(nombre);
            return (
              <label key={nombre} className="flex items-center gap-2 cursor-pointer text-sm hover:text-[var(--color-beat-yellow-hover)]">
                <input
                  type="checkbox" name="equipo" value={nombre} defaultChecked={checked}
                  className="w-4 h-4 accent-[var(--color-beat-yellow)]"
                />
                <span>{nombre}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Archivos de Cotizaciones vinculados</label>
        {archivosCotizaciones.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No hay archivos en la pestaña Cotizaciones todavía.</p>
        ) : (
          <div className="border border-gray-300 rounded-lg p-3 max-h-72 overflow-y-auto bg-gray-50 space-y-3">
            {Array.from(grouped.entries()).map(([bucket, arr]) => (
              <div key={bucket}>
                <p className="text-xs font-semibold text-gray-700 mb-1">📁 {bucket}</p>
                <div className="space-y-1 pl-2">
                  {arr.map((a) => (
                    <label key={a.id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-[var(--color-beat-yellow-hover)]">
                      <input
                        type="checkbox" name="archivos" value={a.id} defaultChecked={linkedSet.has(a.id)}
                        className="w-4 h-4 accent-[var(--color-beat-yellow)]"
                      />
                      <span className="truncate">{a.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción / brief</label>
        <textarea
          name="descripcion" rows={4} defaultValue={v.descripcion ?? ""} placeholder="Resumen breve del proyecto..."
          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="px-6 py-2.5 rounded-lg bg-[var(--color-beat-yellow)] text-[var(--color-beat-black)] font-semibold hover:bg-[var(--color-beat-yellow-hover)] transition"
        >
          {submitLabel}
        </button>
        <Link href={cancelHref}
          className="px-6 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition">
          Cancelar
        </Link>
      </div>
    </form>
  );
}

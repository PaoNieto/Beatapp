import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { actualizarProyecto } from "../../actions";
import ProyectoForm from "@/components/proyecto-form";
import { listarArchivosDeCotizaciones, archivosVinculadosIds } from "@/lib/proyectos-archivos";

export default async function EditarProyectoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const [{ data: proyecto }, { data: clientes }, archivosCotizaciones, vinculados] = await Promise.all([
    supabase.from("proyectos").select("*").eq("id", id).single(),
    supabase.from("clientes").select("id, nombre").order("nombre"),
    listarArchivosDeCotizaciones(),
    archivosVinculadosIds(id),
  ]);

  if (!proyecto) notFound();

  const actionWithId = actualizarProyecto.bind(null, id);

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link
          href={`/dashboard/proyectos/${id}`}
          className="text-sm text-gray-600 hover:text-[var(--color-beat-yellow-hover)]"
        >
          ← Volver al proyecto
        </Link>
        <h1 className="text-3xl mt-2">Editar proyecto</h1>
        <p className="text-sm text-gray-500 mt-1">{proyecto.nombre}</p>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg border border-red-300 bg-red-50 text-red-800 text-sm">
          <p className="font-semibold mb-1">No se pudo guardar el proyecto</p>
          <p className="font-mono text-xs whitespace-pre-wrap">{error}</p>
        </div>
      )}

      <ProyectoForm
        action={actionWithId}
        clientes={(clientes ?? []) as any}
        archivosCotizaciones={archivosCotizaciones}
        showEstado
        submitLabel="Guardar cambios"
        cancelHref={`/dashboard/proyectos/${id}`}
        values={{
          codigo: proyecto.codigo,
          nombre: proyecto.nombre,
          cliente_id: proyecto.cliente_id,
          tipo_evento: proyecto.tipo_evento,
          locacion: proyecto.locacion,
          descripcion: proyecto.descripcion,
          estado: proyecto.estado,
          equipo: proyecto.equipo,
          montaje_inicio: proyecto.montaje_inicio,
          montaje_fin: proyecto.montaje_fin,
          operacion_inicio: proyecto.operacion_inicio,
          operacion_fin: proyecto.operacion_fin,
          desmontaje_inicio: proyecto.desmontaje_inicio,
          desmontaje_fin: proyecto.desmontaje_fin,
          archivosVinculados: vinculados,
        }}
      />
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { crearProyecto } from "../actions";
import ProyectoForm from "@/components/proyecto-form";
import { listarArchivosDeCotizaciones } from "@/lib/proyectos-archivos";

export default async function NuevoProyectoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const [{ data: clientes }, archivosCotizaciones] = await Promise.all([
    supabase.from("clientes").select("id, nombre").order("nombre"),
    listarArchivosDeCotizaciones(),
  ]);

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/dashboard/proyectos" className="text-sm text-gray-600 hover:text-[var(--color-beat-yellow-hover)]">
          ← Volver a proyectos
        </Link>
        <h1 className="text-3xl mt-2">Nuevo proyecto</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg border border-red-300 bg-red-50 text-red-800 text-sm">
          <p className="font-semibold mb-1">No se pudo crear el proyecto</p>
          <p className="font-mono text-xs whitespace-pre-wrap">{error}</p>
        </div>
      )}

      <ProyectoForm
        action={crearProyecto}
        clientes={(clientes ?? []) as any}
        archivosCotizaciones={archivosCotizaciones}
        submitLabel="Crear proyecto"
      />
    </div>
  );
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { EQUIPO_BEAT } from "@/lib/equipo";

async function generarCodigo(supabase: any): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `BEAT-${year}-`;
  const { data } = await supabase
    .from("proyectos")
    .select("codigo")
    .like("codigo", `${prefix}%`)
    .order("codigo", { ascending: false })
    .limit(1);

  const last = data?.[0]?.codigo as string | undefined;
  const lastN = last ? parseInt(last.slice(prefix.length), 10) : 0;
  const next = (Number.isFinite(lastN) ? lastN : 0) + 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

export async function crearProyecto(formData: FormData): Promise<void> {
  const nombre = String(formData.get("nombre") || "").trim();
  if (!nombre) redirect("/dashboard/proyectos/nuevo?error=Falta+nombre");

  const cliente_id = (formData.get("cliente_id") as string) || null;
  const fecha_inicio = (formData.get("fecha_inicio") as string) || null;
  const fecha_fin = (formData.get("fecha_fin") as string) || null;
  const tipo_evento = (formData.get("tipo_evento") as string) || null;
  const locacion = (formData.get("locacion") as string) || null;
  const descripcion = (formData.get("descripcion") as string) || null;

  const equipoRaw = formData.getAll("equipo").map((v) => String(v));
  const equipo = equipoRaw.filter((n) => (EQUIPO_BEAT as readonly string[]).includes(n));

  const supabase = await createClient();
  const codigo = await generarCodigo(supabase);

  const payloadBase = {
    codigo,
    nombre,
    cliente_id: cliente_id || null,
    fecha_evento: fecha_inicio,
    tipo_evento,
    locacion,
    descripcion,
    equipo: equipo.length ? equipo : null,
  };

  let { error, data } = await supabase
    .from("proyectos")
    .insert({ ...payloadBase, fecha_fin })
    .select("id")
    .single();

  if (error && /fecha_fin/.test(error.message)) {
    ({ error, data } = await supabase
      .from("proyectos")
      .insert(payloadBase)
      .select("id")
      .single());
  }

  if (error) redirect(`/dashboard/proyectos/nuevo?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/proyectos");
  redirect(`/dashboard/proyectos/${data!.id}`);
}

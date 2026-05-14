"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function crearProyecto(formData: FormData): Promise<void> {
  const codigo = String(formData.get("codigo") || "").trim();
  const nombre = String(formData.get("nombre") || "").trim();
  if (!codigo || !nombre) redirect("/dashboard/proyectos/nuevo?error=Falta+codigo+o+nombre");

  const cliente_id = (formData.get("cliente_id") as string) || null;
  const fecha_evento = (formData.get("fecha_evento") as string) || null;
  const tipo_evento = (formData.get("tipo_evento") as string) || null;
  const locacion = (formData.get("locacion") as string) || null;
  const asistentes_estimados = formData.get("asistentes_estimados")
    ? Number(formData.get("asistentes_estimados"))
    : null;
  const presupuesto_cliente = formData.get("presupuesto_cliente")
    ? Number(formData.get("presupuesto_cliente"))
    : null;
  const descripcion = (formData.get("descripcion") as string) || null;

  const supabase = await createClient();
  const { error, data } = await supabase
    .from("proyectos")
    .insert({
      codigo, nombre, cliente_id: cliente_id || null,
      fecha_evento, tipo_evento, locacion, asistentes_estimados,
      presupuesto_cliente, descripcion,
    })
    .select("id")
    .single();

  if (error) redirect(`/dashboard/proyectos/nuevo?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/proyectos");
  redirect(`/dashboard/proyectos/${data!.id}`);
}

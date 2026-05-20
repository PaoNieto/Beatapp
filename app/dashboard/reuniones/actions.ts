"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function crearReunion(formData: FormData): Promise<void> {
  const fecha = String(formData.get("fecha") || "").trim();
  const descripcion = String(formData.get("descripcion") || "").trim();
  if (!fecha) redirect("/dashboard/reuniones/nuevo?error=Falta+fecha");

  const supabase = await createClient();
  const { error } = await supabase
    .from("reuniones")
    .insert({ fecha, notas: descripcion || null });

  if (error) redirect(`/dashboard/reuniones/nuevo?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard/reuniones");
  redirect("/dashboard/reuniones");
}

export async function eliminarReunion(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "").trim();
  if (!id) redirect("/dashboard/reuniones");
  const supabase = await createClient();
  await supabase.from("reuniones").delete().eq("id", id);
  revalidatePath("/dashboard/reuniones");
  redirect("/dashboard/reuniones");
}

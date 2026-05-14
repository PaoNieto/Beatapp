"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function crearRecordatorio(formData: FormData): Promise<{ error?: string } | void> {
  const fecha = String(formData.get("fecha") || "").trim();
  const titulo = String(formData.get("titulo") || "").trim();
  if (!fecha || !titulo) return { error: "Fecha y título son obligatorios" };

  const supabase = await createClient();
  const { error } = await supabase.from("recordatorios").insert({
    fecha,
    titulo,
    descripcion: (formData.get("descripcion") as string) || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
}

export async function eliminarRecordatorio(id: string): Promise<{ error?: string } | void> {
  const supabase = await createClient();
  const { error } = await supabase.from("recordatorios").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
}

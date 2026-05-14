"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function crearCliente(formData: FormData): Promise<void> {
  const nombre = String(formData.get("nombre") || "").trim();
  if (!nombre) redirect("/dashboard/clientes/nuevo?error=Falta+nombre");

  const supabase = await createClient();
  const { error } = await supabase.from("clientes").insert({
    nombre,
    razon_social: formData.get("razon_social") || null,
    ruc: formData.get("ruc") || null,
    industria: (formData.get("industria") as string) || null,
    contacto_principal: formData.get("contacto_principal") || null,
    cargo_contacto: formData.get("cargo_contacto") || null,
    email: formData.get("email") || null,
    telefono: formData.get("telefono") || null,
    direccion: formData.get("direccion") || null,
    prioridad: (formData.get("prioridad") as string) || "media",
    notas_clave: formData.get("notas_clave") || null,
  });

  if (error) redirect(`/dashboard/clientes/nuevo?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard/clientes");
  redirect("/dashboard/clientes");
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";
import { crearSignedUpload, registrarArchivoSubido, type EntidadTipo } from "@/lib/archivos";

const MAX_RETRIES = 2;

async function subirUno(
  file: File,
  entidadTipo: EntidadTipo,
  entidadId: string,
): Promise<string | null> {
  let lastErr = "error desconocido";
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const sign = await crearSignedUpload(file.name, entidadTipo, entidadId);
      if (sign.error || !sign.token || !sign.path) {
        lastErr = sign.error || "no se pudo firmar";
      } else {
        const supabase = getBrowserClient();
        const { error: upErr } = await supabase.storage
          .from("archivos")
          .uploadToSignedUrl(sign.path, sign.token, file, {
            contentType: file.type || "application/octet-stream",
          });
        if (upErr) {
          lastErr = upErr.message;
        } else {
          const reg = await registrarArchivoSubido({
            nombre: file.name,
            storage_path: sign.path,
            mime_type: file.type || null,
            size_bytes: file.size,
            entidad_tipo: entidadTipo,
            entidad_id: entidadId,
          });
          if (reg.error) {
            lastErr = reg.error;
          } else {
            return null;
          }
        }
      }
    } catch (e: unknown) {
      lastErr = e instanceof Error ? e.message : "error de red";
    }
    if (attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  return `${file.name}: ${lastErr}`;
}

export default function ArchivosUploader({
  entidadTipo,
  entidadId,
}: {
  entidadTipo: EntidadTipo;
  entidadId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const router = useRouter();

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    const list = Array.from(files);
    setProgress({ done: 0, total: list.length });

    startTransition(async () => {
      const errors: string[] = [];
      for (let idx = 0; idx < list.length; idx++) {
        const err = await subirUno(list[idx], entidadTipo, entidadId);
        if (err) errors.push(err);
        setProgress({ done: idx + 1, total: list.length });
      }
      setProgress(null);
      if (errors.length) {
        setError(
          errors.slice(0, 3).join("\n") +
            (errors.length > 3 ? `\n(+${errors.length - 3} más)` : ""),
        );
      }
      router.refresh();
    });
  };

  return (
    <div>
      <label
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
        className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
          drag ? "border-[var(--color-beat-yellow)] bg-[var(--color-beat-yellow)]/10" : "border-gray-300 hover:border-[var(--color-beat-yellow)]"
        }`}
      >
        <input
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={isPending}
        />
        {isPending && progress ? (
          <p className="text-sm text-gray-600">Subiendo {progress.done} de {progress.total}...</p>
        ) : (
          <>
            <p className="text-sm font-medium">Arrastrá archivos acá o hacé click</p>
            <p className="text-xs text-gray-500 mt-1">PDF, Excel, imágenes, cualquier formato</p>
          </>
        )}
      </label>
      {error && <pre className="mt-3 text-sm text-red-600 whitespace-pre-wrap font-sans">{error}</pre>}
    </div>
  );
}

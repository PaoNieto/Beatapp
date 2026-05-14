"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { EntidadTipo } from "@/lib/archivos";

export default function ArchivosUploader({
  entidadTipo,
  entidadId,
  uploadAction,
}: {
  entidadTipo: EntidadTipo;
  entidadId: string;
  uploadAction: (formData: FormData) => Promise<{ error?: string } | void>;
}) {
  const [isPending, startTransition] = useTransition();
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    startTransition(async () => {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.set("file", file);
        fd.set("entidad_tipo", entidadTipo);
        fd.set("entidad_id", entidadId);
        const res = await uploadAction(fd);
        if (res && "error" in res && res.error) {
          setError(res.error);
          break;
        }
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
        {isPending ? (
          <p className="text-sm text-gray-600">Subiendo...</p>
        ) : (
          <>
            <p className="text-sm font-medium">Arrastrá archivos acá o hacé click</p>
            <p className="text-xs text-gray-500 mt-1">PDF, Excel, imágenes, cualquier formato</p>
          </>
        )}
      </label>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}

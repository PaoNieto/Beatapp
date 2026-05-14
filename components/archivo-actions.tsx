"use client";

import { useTransition } from "react";

export default function ArchivoActions({
  archivoId,
  storagePath,
  getUrl,
  onDelete,
}: {
  archivoId: string;
  storagePath: string;
  getUrl: (path: string) => Promise<string | null>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [downloading, startDownload] = useTransition();
  const [deleting, startDelete] = useTransition();

  const handleDownload = () => {
    startDownload(async () => {
      const url = await getUrl(storagePath);
      if (url) window.open(url, "_blank");
    });
  };

  const handleDelete = () => {
    if (!confirm("¿Eliminar este archivo?")) return;
    startDelete(async () => {
      await onDelete(archivoId);
    });
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="px-3 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50 transition"
      >
        {downloading ? "Abriendo..." : "Abrir"}
      </button>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="px-3 py-1 text-xs rounded border border-red-300 text-red-700 hover:bg-red-50 transition"
      >
        {deleting ? "..." : "Eliminar"}
      </button>
    </div>
  );
}

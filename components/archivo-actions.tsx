"use client";

import { useTransition } from "react";

export default function ArchivoActions({
  archivoId,
  storagePath,
  onDelete,
}: {
  archivoId: string;
  storagePath: string;
  onDelete: (id: string) => Promise<void>;
}) {
  const [deleting, startDelete] = useTransition();

  const handleDelete = () => {
    if (!confirm("¿Eliminar este archivo?")) return;
    startDelete(async () => {
      await onDelete(archivoId);
    });
  };

  const href = `/api/archivo?path=${encodeURIComponent(storagePath)}`;

  return (
    <div className="flex gap-2">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50 transition"
      >
        Abrir
      </a>
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

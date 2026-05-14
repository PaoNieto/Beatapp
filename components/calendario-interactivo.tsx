"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { crearRecordatorio, eliminarRecordatorio } from "@/lib/recordatorios-actions";

type EventoCal = {
  id: string;
  title: string;
  start: string;
  url?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps?: { tipo: "proyecto" | "recordatorio"; descripcion?: string };
};

export default function CalendarioInteractivo({ eventos }: { eventos: EventoCal[] }) {
  const router = useRouter();
  const [modal, setModal] = useState<
    | { type: "crear"; fecha: string }
    | { type: "ver-recordatorio"; id: string; titulo: string; descripcion?: string; fecha: string }
    | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmitCrear = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const res = await crearRecordatorio(formData);
      if (res && "error" in res && res.error) {
        setError(res.error);
        return;
      }
      setModal(null);
      router.refresh();
    });
  };

  const handleEliminarRec = (id: string) => {
    if (!confirm("¿Eliminar este recordatorio?")) return;
    startTransition(async () => {
      await eliminarRecordatorio(id);
      setModal(null);
      router.refresh();
    });
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={esLocale}
          events={eventos}
          dateClick={(info) => setModal({ type: "crear", fecha: info.dateStr })}
          eventClick={(info) => {
            info.jsEvent.preventDefault();
            const tipo = info.event.extendedProps?.tipo;
            if (tipo === "proyecto" && info.event.url) {
              router.push(info.event.url);
            } else if (tipo === "recordatorio") {
              setModal({
                type: "ver-recordatorio",
                id: info.event.id,
                titulo: info.event.title,
                descripcion: info.event.extendedProps?.descripcion,
                fecha: info.event.startStr,
              });
            }
          }}
          height="auto"
          headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,dayGridWeek" }}
          buttonText={{ today: "Hoy", month: "Mes", week: "Semana" }}
        />
      </div>

      {modal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setModal(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {modal.type === "crear" && (
              <>
                <h2 className="text-2xl font-display mb-1">Nuevo recordatorio</h2>
                <p className="text-sm text-gray-600 mb-4">Fecha: <strong>{modal.fecha}</strong></p>

                {error && <div className="bg-red-50 border border-red-300 text-red-800 rounded-lg p-2 text-sm mb-3">{error}</div>}

                <form action={handleSubmitCrear} className="space-y-3">
                  <input type="hidden" name="fecha" value={modal.fecha} />
                  <div>
                    <label className="block text-sm font-medium mb-1">Título *</label>
                    <input name="titulo" required autoFocus placeholder="Llamar a Sandra"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
                    <textarea name="descripcion" rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[var(--color-beat-yellow)] outline-none" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="submit" disabled={isPending}
                      className="px-5 py-2 rounded-lg bg-[var(--color-beat-yellow)] text-[var(--color-beat-black)] font-semibold hover:bg-[var(--color-beat-yellow-hover)] transition disabled:opacity-50">
                      {isPending ? "Guardando..." : "Guardar"}
                    </button>
                    <button type="button" onClick={() => setModal(null)}
                      className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition">
                      Cancelar
                    </button>
                  </div>
                </form>
              </>
            )}

            {modal.type === "ver-recordatorio" && (
              <>
                <h2 className="text-2xl font-display mb-1">{modal.titulo}</h2>
                <p className="text-sm text-gray-600 mb-4">📅 {modal.fecha}</p>
                {modal.descripcion && (
                  <p className="text-sm whitespace-pre-wrap mb-4">{modal.descripcion}</p>
                )}
                <div className="flex gap-2 pt-2">
                  <button onClick={() => handleEliminarRec(modal.id)} disabled={isPending}
                    className="px-4 py-2 text-sm rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition disabled:opacity-50">
                    {isPending ? "Eliminando..." : "Eliminar"}
                  </button>
                  <button onClick={() => setModal(null)}
                    className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition">
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

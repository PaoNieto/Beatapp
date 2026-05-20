export const ESTADOS_PROYECTO = [
  { value: "brief", label: "Brief" },
  { value: "cerrado", label: "Cerrado" },
  { value: "finalizado", label: "Finalizado" },
  { value: "cancelado", label: "Cancelado" },
] as const;

export type EstadoProyecto = (typeof ESTADOS_PROYECTO)[number]["value"];

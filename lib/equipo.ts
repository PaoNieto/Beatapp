export const EQUIPO_BEAT = [
  "Alan",
  "Paolo",
  "Paola",
  "Johnny",
  "Yulissa",
  "Lis",
  "Sandra",
] as const;

export type MiembroEquipo = (typeof EQUIPO_BEAT)[number];

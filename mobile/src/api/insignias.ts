import api, { extractData } from "./client";

export type TipoInsignia =
  | "goleador"
  | "mejor_jugador"
  | "fair_play"
  | "portero_menos_goleado"
  | "capitan"
  | "mvp_partido";

export type Insignia = {
  id: number;
  jugador: number;
  jugador_nombre: string;
  tipo: TipoInsignia;
  tipo_display: string;
  torneo: number;
  torneo_nombre: string;
  partido?: number | null;
  descripcion?: string | null;
  fecha: string;
  created_at: string;
  updated_at: string;
};

export type InsigniaPayload = {
  jugador: number;
  tipo: TipoInsignia;
  torneo: number;
  partido?: number | null;
  descripcion?: string | null;
};

export async function getInsignias(params?: {
  jugador_id?: number;
  torneo_id?: number;
  partido_id?: number;
  tipo?: TipoInsignia;
}): Promise<Insignia[]> {
  return extractData(api.get("/insignias/", { params }));
}

export async function createInsignia(payload: InsigniaPayload): Promise<Insignia> {
  return extractData(api.post("/insignias/", payload));
}

export async function deleteInsignia(id: number): Promise<void> {
  await api.delete(`/insignias/${id}/`);
}

export const INSIGNIA_CONFIG: Record<TipoInsignia, { emoji: string; label: string; color: string }> = {
  goleador:              { emoji: "🥇", label: "Goleador",          color: "#f59e0b" },
  mejor_jugador:         { emoji: "⭐", label: "Mejor Jugador",     color: "#fbbf24" },
  fair_play:             { emoji: "🤝", label: "Fair Play",         color: "#60a5fa" },
  portero_menos_goleado: { emoji: "🧤", label: "Portero",           color: "#a78bfa" },
  capitan:               { emoji: "🅒",  label: "Capitán",          color: "#f97316" },
  mvp_partido:           { emoji: "🏆", label: "MVP del Partido",   color: "#34d399" },
};

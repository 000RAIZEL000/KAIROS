import api, { extractData } from "./client";

export type Evento = {
  id: number;
  partido_id: number;
  jugador_id?: number | null;
  equipo_id?: number | null;
  tipo_evento: "gol" | "amarilla" | "roja" | "asistencia";
  minuto?: number | null;
  valor?: number | null;
  descripcion?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type EventoPayload = {
  partido_id: number;
  jugador_id?: number | null;
  equipo_id?: number | null;
  tipo_evento: "gol" | "amarilla" | "roja" | "asistencia";
  minuto?: number | null;
  valor?: number | null;
  descripcion?: string | null;
};

export async function getEventosByPartido(partidoId: string): Promise<Evento[]> {
  return extractData(api.get(`/eventos/?partido_id=${partidoId}`));
}

export async function createEvento(payload: EventoPayload): Promise<Evento> {
  return extractData(api.post("/eventos/", payload));
}

export async function updateEvento(id: string, payload: EventoPayload): Promise<Evento> {
  return extractData(api.put(`/eventos/${id}`, payload));
}

export async function deleteEvento(id: string): Promise<void> {
  await api.delete(`/eventos/${id}`);
}
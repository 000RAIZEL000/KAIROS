import api, { extractData } from "./client";
import type { Equipo } from "./equipos";

export type Partido = {
  id: number;
  torneo_id: number;
  equipo_local_id: number;
  equipo_visitante_id: number;
  fecha?: string | null;
  cancha?: string | null;
  jornada?: number | null;
  fase?: string | null;
  goles_local: number;
  goles_visitante: number;
  estado: string;
  arbitro?: string | null;
  observaciones?: string | null;
  created_at?: string;
  updated_at?: string;
  equipo_local?: Equipo;
  equipo_visitante?: Equipo;
};

export type PartidoPayload = {
  torneo_id: number;
  equipo_local_id: number;
  equipo_visitante_id: number;
  fecha?: string | null;
  cancha?: string | null;
  jornada?: number | null;
  fase?: string | null;
  goles_local?: number;
  goles_visitante?: number;
  estado?: string;
  arbitro?: string | null;
  observaciones?: string | null;
};

export async function getPartidos(torneoId: string): Promise<Partido[]> {
  return extractData(api.get(`/partidos/?torneo_id=${torneoId}`));
}

export async function getPartido(id: string): Promise<Partido> {
  return extractData(api.get(`/partidos/${id}`));
}

export async function createPartido(payload: PartidoPayload): Promise<Partido> {
  return extractData(api.post("/partidos/", payload));
}

export async function updatePartido(id: string, payload: Partial<PartidoPayload>): Promise<Partido> {
  return extractData(api.put(`/partidos/${id}`, payload));
}

export async function deletePartido(id: string): Promise<void> {
  await api.delete(`/partidos/${id}`);
}
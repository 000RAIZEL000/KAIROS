import api, { extractData } from "./client";

export type TablaRow = {
  equipo_id: number;
  equipo: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
};

export type GoleadorRow = {
  jugador_id?: number | null;
  jugador: string;
  equipo?: string | null;
  goles: number;
};

export type TarjetaRow = {
  jugador_id?: number | null;
  jugador: string;
  equipo?: string | null;
  amarillas: number;
  rojas: number;
};

export type ResumenTorneo = {
  torneo_id: number;
  total_equipos: number;
  total_jugadores: number;
  total_partidos: number;
  partidos_finalizados: number;
  total_goles: number;
};

export async function getTablaPosiciones(torneoId: string | number): Promise<TablaRow[]> {
  return extractData(api.get(`/stats/tabla/${torneoId}/`));
}

export async function getGoleadores(torneoId: string | number): Promise<GoleadorRow[]> {
  return extractData(api.get(`/stats/goleadores/${torneoId}/`));
}

export async function getTarjetas(torneoId: string | number): Promise<TarjetaRow[]> {
  return extractData(api.get(`/stats/tarjetas/${torneoId}/`));
}

export async function getResumenTorneo(torneoId: string | number): Promise<ResumenTorneo> {
  return extractData(api.get(`/stats/resumen/${torneoId}/`));
}
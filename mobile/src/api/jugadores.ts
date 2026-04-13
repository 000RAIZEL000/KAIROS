import api, { extractData } from "./client";

export type Jugador = {
  id: number;
  equipo_id: number;
  nombre: string;
  apellido: string;
  dni?: string | null;
  fecha_nacimiento?: string | null;
  posicion?: string | null;
  numero_camiseta?: number | null;
  foto_url?: string | null;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
};

export type JugadorPayload = {
  equipo_id: number;
  nombre: string;
  apellido: string;
  dni?: string | null;
  fecha_nacimiento?: string | null;
  posicion?: string | null;
  numero_camiseta?: number | null;
  foto_url?: string | null;
  activo?: boolean;
};

export async function getJugadoresByEquipo(equipoId: string): Promise<Jugador[]> {
  return extractData(api.get(`/jugadores/?equipo_id=${equipoId}`));
}

export async function getJugadorById(id: string): Promise<Jugador> {
  return extractData(api.get(`/jugadores/${id}`));
}

export async function createJugador(payload: JugadorPayload): Promise<Jugador> {
  return extractData(api.post("/jugadores/", payload));
}

export async function updateJugador(id: string, payload: Partial<JugadorPayload>): Promise<Jugador> {
  return extractData(api.put(`/jugadores/${id}`, payload));
}

export async function deleteJugador(id: string): Promise<void> {
  await api.delete(`/jugadores/${id}`);
}
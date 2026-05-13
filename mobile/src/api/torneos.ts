import api, { extractData } from "./client";

export type Torneo = {
  id: number;
  nombre: string;
  deporte: string;
  modalidad: string;
  descripcion?: string | null;
  direccion?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  estado?: string;
  imagen_url?: string | null;
};

export type TorneoPayload = {
  nombre: string;
  deporte: string;
  modalidad: string;
  descripcion?: string | null;
  direccion?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  estado?: string;
  imagen_url?: string | null;
};

export async function getTorneos(): Promise<Torneo[]> {
  return extractData(api.get("/torneos/"));
}

export async function getTorneoById(id: string | number): Promise<Torneo> {
  return extractData(api.get(`/torneos/${id}/`));
}

export async function createTorneo(payload: TorneoPayload): Promise<Torneo> {
  return extractData(api.post("/torneos/", payload));
}

export async function updateTorneo(
  id: string | number,
  payload: Partial<TorneoPayload>
): Promise<Torneo> {
  return extractData(api.patch(`/torneos/${id}/`, payload));
}

export async function deleteTorneo(id: string | number): Promise<void> {
  await api.delete(`/torneos/${id}/`);
}
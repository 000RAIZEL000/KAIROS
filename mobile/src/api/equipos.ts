import api, { extractData } from "./client";

export type Equipo = {
  id: number;
  torneo_id: number;
  nombre: string;
  escudo_url?: string | null;
  color_principal?: string | null;
  color_secundario?: string | null;
  grupo?: string | null;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
};

export type EquipoPayload = {
  torneo_id: number;
  nombre: string;
  escudo_url?: string | null;
  color_principal?: string | null;
  color_secundario?: string | null;
  grupo?: string | null;
  activo?: boolean;
};

export async function getEquiposByTorneo(torneoId: string | number): Promise<Equipo[]> {
  return extractData(api.get("/equipos/", { params: { torneo_id: torneoId } }));
}

export async function getEquipoById(id: string | number): Promise<Equipo> {
  return extractData(api.get(`/equipos/${id}/`));
}

export async function createEquipo(payload: EquipoPayload): Promise<Equipo> {
  return extractData(api.post("/equipos/", payload));
}

export async function updateEquipo(id: string | number, payload: Partial<EquipoPayload>): Promise<Equipo> {
  return extractData(api.patch(`/equipos/${id}/`, payload));
}

export async function deleteEquipo(id: string | number): Promise<void> {
  await api.delete(`/equipos/${id}/`);
}
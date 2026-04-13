export type Torneo = {
  id: number;
  user_id?: number | null;
  nombre: string;
  deporte: string;
  modalidad: string;
  descripcion?: string | null;
  direccion?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  estado: string;
  imagen_url?: string | null;
  created_at?: string;
  updated_at?: string;
};
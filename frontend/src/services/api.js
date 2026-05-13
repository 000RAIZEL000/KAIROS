import axios from "axios";

const BASE_URL = "https://kairos-backend-w96l.onrender.com/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Adjunta el token JWT en cada request si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si el servidor devuelve 401, limpia el token guardado
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authAPI = {
  register: (data) => api.post("/auth/register/", data),

  login: async (email, password) => {
    const res = await api.post("/auth/login/", { email, password });
    localStorage.setItem("access_token", res.data.access);
    localStorage.setItem("refresh_token", res.data.refresh);
    return res.data;
  },

  refreshToken: async () => {
    const refresh = localStorage.getItem("refresh_token");
    const res = await api.post("/auth/token/refresh/", { refresh });
    localStorage.setItem("access_token", res.data.access);
    return res.data;
  },

  profile: () => api.get("/auth/profile/"),

  forgotPassword: (email) => api.post("/auth/forgot-password/", { email }),

  resetPassword: (email, token, new_password) =>
    api.post("/auth/reset-password/", { email, token, new_password }),

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
};

// ── Torneos ───────────────────────────────────────────────────────────────────

export const torneosAPI = {
  list: () => api.get("/torneos/"),
  get: (id) => api.get(`/torneos/${id}/`),
  create: (data) => api.post("/torneos/", data),
  update: (id, data) => api.patch(`/torneos/${id}/`, data),
  delete: (id) => api.delete(`/torneos/${id}/`),
};

// ── Equipos ───────────────────────────────────────────────────────────────────

export const equiposAPI = {
  list: (torneo_id) =>
    api.get("/equipos/", { params: torneo_id ? { torneo_id } : {} }),
  get: (id) => api.get(`/equipos/${id}/`),
  create: (data) => api.post("/equipos/", data),
  update: (id, data) => api.patch(`/equipos/${id}/`, data),
  delete: (id) => api.delete(`/equipos/${id}/`),
};

// ── Jugadores ─────────────────────────────────────────────────────────────────

export const jugadoresAPI = {
  list: (equipo_id) =>
    api.get("/jugadores/", { params: equipo_id ? { equipo_id } : {} }),
  get: (id) => api.get(`/jugadores/${id}/`),
  create: (data) => api.post("/jugadores/", data),
  update: (id, data) => api.patch(`/jugadores/${id}/`, data),
  delete: (id) => api.delete(`/jugadores/${id}/`),
};

// ── Partidos ──────────────────────────────────────────────────────────────────

export const partidosAPI = {
  list: (torneo_id) =>
    api.get("/partidos/", { params: torneo_id ? { torneo_id } : {} }),
  get: (id) => api.get(`/partidos/${id}/`),
  create: (data) => api.post("/partidos/", data),
  update: (id, data) => api.patch(`/partidos/${id}/`, data),
  delete: (id) => api.delete(`/partidos/${id}/`),
};

// ── Eventos ───────────────────────────────────────────────────────────────────

export const eventosAPI = {
  list: (partido_id) =>
    api.get("/eventos/", { params: partido_id ? { partido_id } : {} }),
  get: (id) => api.get(`/eventos/${id}/`),
  create: (data) => api.post("/eventos/", data),
  update: (id, data) => api.patch(`/eventos/${id}/`, data),
  delete: (id) => api.delete(`/eventos/${id}/`),
};

// ── Stats ─────────────────────────────────────────────────────────────────────

export const statsAPI = {
  tabla: (torneo_id) => api.get(`/stats/tabla/${torneo_id}/`),
  goleadores: (torneo_id) => api.get(`/stats/goleadores/${torneo_id}/`),
  tarjetas: (torneo_id) => api.get(`/stats/tarjetas/${torneo_id}/`),
  resumen: (torneo_id) => api.get(`/stats/resumen/${torneo_id}/`),
};

export default api;

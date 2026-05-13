import api, { extractData } from "./client";

export type User = {
  id: number;
  nombre: string;
  email: string;
  telefono?: string | null;
  role: string;
  activo: boolean;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  nombre: string;
  email: string;
  telefono?: string | null;
  password: string;
};

export type TokenResponse = {
  access_token: string;
  token_type?: string;
  user: User;
};

// Django SimpleJWT devuelve { access, refresh } — lo normalizamos al formato
// que espera el resto de la app { access_token, user }
export async function loginRequest(payload: LoginPayload): Promise<TokenResponse> {
  const tokens = await extractData(api.post("/auth/login/", payload));
  const token: string = tokens.access ?? tokens.access_token;

  // Obtenemos el perfil usando el token recién emitido directamente en el header
  const user: User = await extractData(
    api.get("/auth/profile/", {
      headers: { Authorization: `Bearer ${token}` },
    })
  );

  return { access_token: token, token_type: "bearer", user };
}

// El endpoint de registro devuelve sólo los datos del usuario (sin token).
// Hacemos auto-login para devolver el formato TokenResponse esperado por la app.
export async function registerRequest(payload: RegisterPayload): Promise<TokenResponse> {
  await api.post("/auth/register/", payload);
  return loginRequest({ email: payload.email, password: payload.password });
}

export async function forgotPassword(
  email: string
): Promise<{ message: string; token?: string }> {
  return extractData(
    api.post("/auth/forgot-password/", { email: email.trim().toLowerCase() })
  );
}

export async function resetPassword(
  email: string,
  token: string,
  new_password: string
): Promise<{ message: string }> {
  return extractData(
    api.post("/auth/reset-password/", { email, token, new_password })
  );
}

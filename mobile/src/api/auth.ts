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

export async function loginRequest(payload: LoginPayload): Promise<TokenResponse> {
  return extractData(api.post("/auth/login", payload));
}

export async function registerRequest(payload: RegisterPayload): Promise<TokenResponse> {
  return extractData(api.post("/auth/register", payload));
}

export async function forgotPassword(email: string): Promise<{ message: string; token?: string }> {
  return extractData(
    api.post("/auth/forgot-password", {
      email: email.trim().toLowerCase(),
    })
  );
}

export async function resetPassword(email: string, token: string, new_password: string): Promise<{ message: string }> {
  return extractData(
    api.post("/auth/reset-password", {
      email,
      token,
      new_password,
    })
  );
}
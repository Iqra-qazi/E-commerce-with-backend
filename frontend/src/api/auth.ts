import { api } from "./client";
import type { AuthResponse, CurrentUserResponse } from "../types/auth";

export async function loginRequest(email: string, password: string) {
  const response = await api.post<AuthResponse>("/auth/login", { email, password });
  return response.data;
}

export async function registerRequest(name: string, email: string, password: string) {
  const response = await api.post<AuthResponse>("/auth/register", {
    username: name,
    email,
    password,
  });
  return response.data;
}

export async function getCurrentUserRequest() {
  const response = await api.get<CurrentUserResponse>("/auth/me");
  return response.data;
}

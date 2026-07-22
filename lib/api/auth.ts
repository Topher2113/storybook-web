import { apiFetch, type ApiFetchOptions } from "./http";
import type { AuthUser, LoginResponse } from "./types";

export function login(
  email: string,
  password: string,
  opts?: ApiFetchOptions,
) {
  return apiFetch<LoginResponse>("/api/auth/login", {
    ...opts,
    method: "POST",
    body: { email, password },
  });
}

export function getMe(token: string, opts?: ApiFetchOptions) {
  return apiFetch<AuthUser>("/api/auth/me", { ...opts, token });
}

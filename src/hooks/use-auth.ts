/* eslint-disable @typescript-eslint/no-explicit-any */
// src/config/constants.ts
// src/app/hooks/use-auth.ts
import { useCallback, useEffect } from "react";
export const AUTH_TOKEN_KEY = "authToken";
export const USER_STORAGE_KEY = "user";

// src/utils/validation.ts
/**
 * Basic email format check.
 */
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// src/lib/api/auth.ts
import api, { loginUser } from "../components/api/api";
import type { LoginResponse } from "../types/api";

/**
 * Sets the default Authorization header for all future API calls.
 */
function setAuthHeader(token: string): void {
  api.defaults.headers.common["Authorization"] = token;
}

/**
 * Persists token and user in localStorage.
 */
function persistAuth(token: string, user: unknown): void {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    setAuthHeader(token);
  } catch {
    // If storage fails, clear any partial data
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    throw new Error("Failed to save authentication data.");
  }
}

/**
 * Processes login response: store token & user.
 */
export function handleLoginSuccess(data: LoginResponse): void {
  const token = `${data.token_type} ${data.access_token}`;
  persistAuth(token, data.user);
}

export function useAuth() {
  /**
   * Attempts user login. Throws on validation or server error.
   */
  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const trimmedEmail = email.trim();
      if (!trimmedEmail || !password) {
        throw new Error("Email and password are required.");
      }
      if (!isValidEmail(trimmedEmail)) {
        throw new Error("Please provide a valid email address.");
      }
      const result = await loginUser(trimmedEmail, password);
      handleLoginSuccess(result);
    },
    []
  );

  return { login };
}

export function useHydrateAuth(): void {
  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userJson = localStorage.getItem(USER_STORAGE_KEY);

    if (!token || !userJson) {
      return;
    }

    try {
      api.defaults.headers.common["Authorization"] = token;
      // Here you could dispatch to Redux or context to set the user
    } catch {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, []);
}

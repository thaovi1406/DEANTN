import { API_BASE_URL } from "@/src/config/api";
import { authFetch } from "@/src/api/authFetch";

type LogoutResponse = {
  message: string;
};

async function parseJsonSafe(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function logoutApi(): Promise<LogoutResponse> {
  const response = await authFetch(`${API_BASE_URL}/auth/logout/`, {
    method: "POST",
  });

  const data = (await parseJsonSafe(response)) as
    | LogoutResponse
    | { errors?: Record<string, string[] | string> }
    | null;

  if (!response.ok) {
    const error = new Error("LOGOUT_FAILED") as Error & {
      status?: number;
      data?: any;
    };
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as LogoutResponse;
}
import { API_BASE_URL } from "@/src/config/api";
import { authFetch } from "@/src/api/authFetch";

export type ChangePasswordPayload = {
  old_password: string;
  new_password: string;
};

export type ChangePasswordSuccessResponse = {
  message: string;
};

export type ChangePasswordErrorResponse = {
  errors?: Record<string, string[] | string>;
  message?: string;
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

export async function changePasswordApi(
  payload: ChangePasswordPayload
): Promise<ChangePasswordSuccessResponse> {
  const response = await authFetch(`${API_BASE_URL}/auth/change-password/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const data = (await parseJsonSafe(response)) as
    | ChangePasswordSuccessResponse
    | ChangePasswordErrorResponse
    | null;

  if (!response.ok) {
    const error = new Error("CHANGE_PASSWORD_FAILED") as Error & {
      status?: number;
      data?: ChangePasswordErrorResponse | null;
    };

    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as ChangePasswordSuccessResponse;
}
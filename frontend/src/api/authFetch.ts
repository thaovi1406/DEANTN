import { getAuthToken, clearAuthToken } from "@/src/utils/authStorage";

type AuthFetchOptions = RequestInit & {
  requireAuth?: boolean;
};

export async function authFetch(
  url: string,
  options: AuthFetchOptions = {}
) {
  const { requireAuth = true, headers, ...restOptions } = options;

  const token = requireAuth ? await getAuthToken() : null;

  const response = await fetch(url, {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...(requireAuth && token ? { Authorization: `Token ${token}` } : {}),
      ...(headers || {}),
    },
  });

  if (response.status === 401) {
    await clearAuthToken();
    throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
  }

  return response;
}
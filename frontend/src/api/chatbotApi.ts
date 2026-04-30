import { API_BASE_URL } from "@/src/config/api";
import { authFetch } from "@/src/api/authFetch";

export type ChatRole = "user" | "assistant";

export type ChatHistoryItem = {
  role: ChatRole;
  content: string;
};

export type AskChatPayload = {
  message: string;
  chat_history: ChatHistoryItem[];
};

export type AskChatResponse = {
  answer: string;
  sources?: string[];
  mode?: string;
  intent?: string | null;
  context_used?: string[];
  route_scores?: Record<string, number>;
  route_confidence?: number | null;
};

type ErrorResponseShape = {
  message?: string;
  detail?: string;
  errors?: Record<string, string | string[]>;
  [key: string]: unknown;
};

async function parseJsonSafely(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function buildApiError(data: ErrorResponseShape, fallbackMessage: string) {
  if (typeof data?.message === "string" && data.message.trim()) {
    return new Error(data.message);
  }

  if (typeof data?.detail === "string" && data.detail.trim()) {
    return new Error(data.detail);
  }

  return new Error(fallbackMessage);
}

export async function askChatbot(
  payload: AskChatPayload
): Promise<AskChatResponse> {
  const response = await authFetch(`${API_BASE_URL}/chatbot/ask/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw buildApiError(data, "Không thể gửi tin nhắn đến chatbot");
  }

  return data as AskChatResponse;
}
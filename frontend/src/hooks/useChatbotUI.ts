import { useCallback, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import {
  askChatbot,
  ChatHistoryItem,
} from "@/src/api/chatbotApi";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  sources?: string[];
  isError?: boolean;
  mode?: string;
  intent?: string | null;
};

function createMessage(
  role: ChatRole,
  content: string,
  options?: Partial<ChatMessage>
): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random()}`,
    role,
    content,
    createdAt: Date.now(),
    sources: [],
    isError: false,
    mode: undefined,
    intent: null,
    ...options,
  };
}

function normalizeError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Đã có lỗi xảy ra";
}

export function useChatbotUI() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const listRef = useRef<any>(null);

  const hasMessages = messages.length > 0;

  const APP_FEATURE_ANSWER =
  "Chào bạn! Mình là trợ lý ảo hỗ trợ ứng dụng quản lý ẩm thực. Ứng dụng giúp bạn tối ưu hóa việc ăn uống qua các tính năng: Quản lý tài khoản bảo mật; Lưu trữ kho món ăn cá nhân; Lập kế hoạch thực đơn tuần thông minh với logic sao chép linh hoạt. Đặc biệt, hệ thống tự động đồng bộ thực đơn vào danh sách mua sắm và cập nhật kho thực phẩm khi hoàn tất, giúp quản lý nguyên liệu chính xác, tránh lãng phí. Với giao diện thân thiện và quy trình tự động hóa, mình sẽ đồng hành cùng bạn xây dựng lối sống khoa học và tiện lợi mỗi ngày.";

  const canSend = useMemo(() => {
    return input.trim().length > 0 && !sending;
  }, [input, sending]);

  const buildHistory = useCallback((items: ChatMessage[]): ChatHistoryItem[] => {
    return items.map((item) => ({
      role: item.role,
      content: item.content,
    }));
  }, []);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd?.({ animated: true });
    });
  }, []);

  const clearConversation = useCallback(() => {
    if (sending) return;
    if (!messages.length) return;

    Alert.alert("Thông báo", "Bạn có muốn bắt đầu cuộc trò chuyện mới không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đồng ý",
        onPress: () => {
          setMessages([]);
          setInput("");
        },
      },
    ]);
  }, [messages.length, sending]);

  const sendToBot = useCallback(
    async (text: string, currentMessages: ChatMessage[]) => {
      const payload = {
        message: text,
        chat_history: buildHistory(currentMessages),
      };

      const response = await askChatbot(payload);

      const botMessage = createMessage("assistant", response.answer, {
        sources: response.sources || [],
        mode: response.mode,
        intent: response.intent ?? null,
      });

      setMessages((prev) => [...prev, botMessage]);
      scrollToEnd();
    },
    [buildHistory, scrollToEnd]
  );

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const userMessage = createMessage("user", trimmed);
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setSending(true);

    scrollToEnd();

    try {
      await sendToBot(trimmed, nextMessages);
    } catch (error: unknown) {
      const errorMessage = createMessage("assistant", normalizeError(error), {
        isError: true,
      });

      setMessages((prev) => [...prev, errorMessage]);
      scrollToEnd();
    } finally {
      setSending(false);
    }
  }, [input, sending, messages, scrollToEnd, sendToBot]);

  const quickAsk = useCallback(
    async (text: string) => {
      if (sending) return;

      const userMessage = createMessage("user", text);
      const nextMessages = [...messages, userMessage];

      setMessages(nextMessages);
      setInput("");

      scrollToEnd();

      if (text === "Giải thích chức năng của ứng dụng") {
        const botMessage = createMessage("assistant", APP_FEATURE_ANSWER, {
          mode: "default_quickask",
          intent: "app_feature",
        });

        setMessages((prev) => [...prev, botMessage]);
        scrollToEnd();
        return;
      }

      setSending(true);

      try {
        await sendToBot(text, nextMessages);
      } catch (error: unknown) {
        const errorMessage = createMessage(
          "assistant",
          normalizeError(error),
          { isError: true }
        );
        setMessages((prev) => [...prev, errorMessage]);
        scrollToEnd();
      } finally {
        setSending(false);
      }
    },
    [sending, messages, scrollToEnd, sendToBot]
  );

  return {
    listRef,
    messages,
    input,
    setInput,
    sending,
    hasMessages,
    canSend,
    sendMessage,
    clearConversation,
    quickAsk,
  };
}
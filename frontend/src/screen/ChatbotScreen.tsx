import React, { useCallback, useEffect } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import BotIcon from "@/assets/hugeicons_bot";
import Profile_icon from "@/assets/profile.svg";
import { useChatbotUI } from "@/src/hooks/useChatbotUI";

const BG = "#E3ECE6";
const PRIMARY = "#5E9727";
const TEXT = "#1F1F1F";
const MUTED = "#6E6E6E";
const WHITE = "#FFFFFF";
const BOT_BUBBLE = "#F5F3F3";
const USER_BUBBLE = "#5D9625";
const ERROR = "#D93A3A";

function formatTime(timestamp: number) {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function MessageBubble({
  role,
  content,
  isError,
  sources,
}: {
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
  sources?: string[];
}) {
  const isUser = role === "user";

  return (
    <View style={[styles.messageRow, isUser ? styles.userRow : styles.botRow]}>
      {!isUser && (
        <View style={styles.avatarWrap}>
          <BotIcon width={34} height={34} />
        </View>
      )}

      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.botBubble,
          isError && styles.errorBubble,
        ]}
      >
        <Text style={[styles.bubbleText, isUser && styles.userBubbleText]}>
          {content}
        </Text>

        {!!sources?.length && (
          <View style={styles.sourceWrap}>
            {sources.map((source) => (
              <Text key={source} style={styles.sourceText}>
                Nguồn: {source}
              </Text>
            ))}
          </View>
        )}
      </View>

      {isUser && (
        <View style={styles.avatarWrap}>
          <Profile_icon width={34} height={34} />
        </View>
      )}
    </View>
  );
}

export default function ChatbotScreen() {
  const insets = useSafeAreaInsets();

  const {
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
} = useChatbotUI();

  const scrollToBottom = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd?.({ animated });
    });
  }, [listRef]);

  useEffect(() => {
    scrollToBottom(false);
  }, []);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages.length, sending, scrollToBottom]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      scrollToBottom(true);
    });

    return () => {
      showSub.remove();
    };
  }, [scrollToBottom]);

  const lastTime = messages.length
    ? formatTime(messages[messages.length - 1].createdAt)
    : "";

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Ionicons name="chevron-back" size={24} color={ PRIMARY} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>EatWise Bot</Text>

          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearConversation}
            activeOpacity={0.85}
          >
            <Ionicons name="refresh-outline" size={22} color={PRIMARY} />
          </TouchableOpacity>
        </View>

        {!hasMessages ? (
          <View style={styles.emptyContainer}>
            <BotIcon width={66} height={66} />
            <Text style={styles.emptyTitle}>EatWise</Text>
            <Text style={styles.emptyDescription}>
              Mình ở đây để hỗ trợ bạn mọi lúc, từ trả lời câu hỏi đến đưa ra
              những gợi ý phù hợp. Cùng trò chuyện nào!
            </Text>

            <View style={styles.quickWrap}>
              <TouchableOpacity
                style={styles.quickChip}
                onPress={() => quickAsk("Gợi ý thực đơn phù hợp")}
              >
                <Text style={styles.quickChipText}>Gợi ý thực đơn phù hợp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickChip}
                onPress={() => quickAsk("Giải thích chức năng của ứng dụng")}
              >
                <Text style={styles.quickChipText}>Hỏi về ứng dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={[
              styles.chatContent,
              { paddingBottom: 16 + insets.bottom },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollToBottom(true)}
            onLayout={() => scrollToBottom(false)}
            ListHeaderComponent={
              <View style={styles.timeWrap}>
                <Text style={styles.timeText}>Today, {lastTime}</Text>
              </View>
            }
            renderItem={({ item }) => (
              <MessageBubble
                role={item.role}
                content={item.content}
                isError={item.isError}
                sources={item.sources}
              />
            )}
            ListFooterComponent={
              sending ? (
                <View style={styles.messageRow}>
                  <View style={styles.avatarWrap}>
                    <BotIcon width={34} height={34} />
                  </View>
                  <View style={[styles.bubble, styles.botBubble]}>
                    <Text style={styles.bubbleText}>Đang trả lời...</Text>
                  </View>
                </View>
              ) : null
            }
          />
        )}

        <View
          style={[
            styles.inputBarWrap,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <View style={styles.inputBar}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Nhập tin của bạn ở đây"
              placeholderTextColor="#F2F2F2"
              style={styles.input}
              multiline
              editable={!sending}
              blurOnSubmit={false}
              returnKeyType="send"
              onFocus={() => scrollToBottom(true)}
              onSubmitEditing={() => {
                if (canSend) sendMessage();
              }}
            />

            <TouchableOpacity
              style={styles.sendButton}
              onPress={sendMessage}
              disabled={!canSend}
              activeOpacity={0.85}
            >
              <Ionicons
                name="paper-plane-outline"
                size={24}
                color={WHITE}
                style={!canSend ? { opacity: 0.7 } : undefined}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  header: {
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: PRIMARY,
  },
  clearButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },

  list: {
    flex: 1,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 34,
    fontWeight: "400",
    color: PRIMARY,
  },
  emptyDescription: {
    marginTop: 18,
    fontSize: 18,
    lineHeight: 30,
    textAlign: "center",
    color: TEXT,
  },

  quickWrap: {
    marginTop: 22,
    width: "100%",
    gap: 10,
  },
  quickChip: {
    backgroundColor: WHITE,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#D1DDD4",
  },
  quickChipText: {
    color: PRIMARY,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },

  chatContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  timeWrap: {
    alignItems: "center",
    marginBottom: 18,
  },
  timeText: {
    fontSize: 14,
    color: MUTED,
    fontWeight: "500",
  },

  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  botRow: {
    justifyContent: "flex-start",
  },
  userRow: {
    justifyContent: "flex-end",
  },
  avatarWrap: {
    width: 38,
    alignItems: "center",
    justifyContent: "flex-end",
  },

  bubble: {
    maxWidth: "72%",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  botBubble: {
    backgroundColor: BOT_BUBBLE,
    marginLeft: 8,
  },
  userBubble: {
    backgroundColor: USER_BUBBLE,
    marginRight: 8,
  },
  errorBubble: {
    backgroundColor: "#FFE8E8",
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 24,
    color: TEXT,
    fontWeight: "600",
  },
  userBubbleText: {
    color: WHITE,
  },
  sourceWrap: {
    marginTop: 8,
    gap: 4,
  },
  sourceText: {
    fontSize: 12,
    color: MUTED,
  },

  inputBarWrap: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: BG,
  },
  inputBar: {
    minHeight: 60,
    borderRadius: 36,
    backgroundColor: USER_BUBBLE,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 18,
    paddingRight: 12,
  },
  input: {
    flex: 1,
    color: WHITE,
    fontSize: 17,
    maxHeight: 110,
    paddingVertical: 14,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
});
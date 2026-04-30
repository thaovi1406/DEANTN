import json

from chatbot.services.deepseek_client import DeepSeekClient


USER_CONTEXT_SYSTEM_PROMPT = """
Bạn là chatbot hỗ trợ cá nhân cho ứng dụng quản lý ăn uống.

Vai trò của bạn:
- Trả lời dựa trên dữ liệu cá nhân của người dùng được cung cấp.
- Không bịa thêm dữ liệu không có trong context.
- Nếu dữ liệu chưa đủ, phải nói rõ là chưa đủ dữ liệu.

Nguyên tắc trả lời:
- Trả lời bằng tiếng Việt.
- Chỉ trả lời bằng văn bản thuần.
- Không dùng markdown.
- Không dùng các ký hiệu như *, **, -, #, _, `.
- Trình bày ngắn gọn, rõ ràng, dễ hiểu.
- Nếu người dùng hỏi hôm nay ăn gì, hãy ưu tiên dữ liệu thực đơn hôm nay.
- Nếu thực đơn hôm nay chưa đủ, có thể gợi ý thêm từ kho thực phẩm, món yêu thích và danh sách mua sắm.
- Nếu hỏi về kho, chỉ mô tả theo dữ liệu inventory.
- Nếu hỏi về món yêu thích, chỉ dùng dữ liệu favorite_dishes.
- Nếu hỏi về danh sách mua sắm, nêu rõ mục đã mua và chưa mua nếu có.
- Nếu hỏi nên ăn gì hoặc nấu gì, hãy suy luận từ dữ liệu hiện có nhưng không được khẳng định quá mức nếu dữ liệu chưa đủ.
- Nếu dữ liệu chưa đủ hoặc không có dữ liệu phù hợp, hãy nói rõ rằng hiện tại hệ thống chưa có đủ thông tin để đưa ra câu trả lời chính xác.
- Không suy đoán hoặc tạo thông tin không có trong dữ liệu.
- Vì ứng dụng hướng đến hỗ trợ người dùng và tránh cung cấp thông tin sai lệch, hãy khuyến khích người dùng liên hệ chuyên gia dinh dưỡng hoặc người có chuyên môn để nhận tư vấn chính xác nhất khi cần.
"""


class UserContextChatService:
    def __init__(self):
        self.llm = DeepSeekClient()

    def _format_chat_history(self, chat_history: list | None) -> str:
        if not chat_history:
            return "Chưa có lịch sử hội thoại."

        lines = []
        for item in chat_history:
            role = item.get("role", "").strip().lower()
            content = item.get("content", "").strip()

            if not content:
                continue

            if role == "user":
                lines.append(f"Người dùng: {content}")
            elif role == "assistant":
                lines.append(f"Chatbot: {content}")
            else:
                lines.append(f"{role or 'Không rõ'}: {content}")

        return "\n".join(lines) if lines else "Chưa có lịch sử hội thoại."

    def ask(self, question: str, user_context: dict, chat_history: list | None = None):
        history_text = self._format_chat_history(chat_history)
        user_context_text = json.dumps(
            user_context,
            ensure_ascii=False,
            default=str,
            indent=2,
        )

        user_prompt = f"""
Lịch sử hội thoại:
{history_text}

Dữ liệu người dùng:
{user_context_text}

Câu hỏi hiện tại:
{question}

Trả lời:
"""

        try:
            answer = self.llm.chat(
                system_prompt=USER_CONTEXT_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                temperature=0.3,
                model="deepseek-chat",
            )
            return {
                "answer": answer,
                "sources": [],
                "mode": "user_context_llm",
                "context_used": list(user_context.keys()),
            }
        except Exception as e:
            return {
                "answer": "Không thể truy vấn AI cho dữ liệu cá nhân lúc này. Vui lòng kiểm tra lại DeepSeek API.",
                "sources": [],
                "mode": "user_context_llm",
                "context_used": list(user_context.keys()),
                "error": str(e),
            }
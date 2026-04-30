from chatbot.services.user_context_intent_service import UserContextIntentService
from chatbot.services.user_context_service import UserContextService
from chatbot.services.user_context_chat_service import UserContextChatService


class UserContextRouteService:
    def __init__(self):
        self.intent_service = UserContextIntentService()
        self.context_service = UserContextService()
        self.chat_service = UserContextChatService()

    def answer(self, user, message: str, chat_history: list | None = None):
        message = (message or "").strip()
        if not message:
            return {
                "answer": "Vui lòng nhập câu hỏi.",
                "sources": [],
                "mode": "user_context_llm",
                "intent": None,
                "context_used": [],
            }

        intent = self.intent_service.detect_intent(message)
        if not intent:
            return {
                "sources": [],
                "mode": "user_context_llm",
                "intent": None,
                "context_used": [],
            }

        user_context = self.context_service.build_user_context(user, intent)

        result = self.chat_service.ask(
            question=message,
            user_context=user_context,
            chat_history=chat_history,
        )

        return {
            "answer": result.get("answer", ""),
            "sources": result.get("sources", []),
            "mode": result.get("mode", "user_context_llm"),
            "intent": intent,
            "context_used": result.get("context_used", []),
        }
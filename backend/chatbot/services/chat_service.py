from chatbot.services.rag_service import RAGService
from chatbot.services.llm_chat_service import LLMChatService
from chatbot.services.user_context_route_service import UserContextRouteService
from chatbot.services.user_context_intent_service import UserContextIntentService
from chatbot.services.semantic_router import SemanticRouter


class ChatService:
    """
    Router tổng cho chatbot:
    - user_context_llm: câu hỏi cá nhân hóa theo dữ liệu user
    - rag: câu hỏi cần tra tài liệu / knowledge base / chức năng app
    - llm_direct: câu hỏi kiến thức chung / tư vấn chung

    Chiến lược route:
    1. Ưu tiên user_context nếu câu hỏi có dấu hiệu cá nhân hóa rõ ràng
    2. Ưu tiên rag nếu câu hỏi có dấu hiệu hỏi về app / tính năng / logic / hướng dẫn
    3. Ưu tiên llm_direct nếu câu hỏi là kiến thức chung
    4. Nếu chưa rõ, mới dùng semantic router để hỗ trợ quyết định
    """

    ROUTE_CONFIDENCE_THRESHOLD = 0.55
    ROUTE_MARGIN_THRESHOLD = 0.03

    def __init__(self):
        self.rag_service = RAGService()
        self.llm_service = LLMChatService()
        self.user_context_route_service = UserContextRouteService()
        self.semantic_router = SemanticRouter()

    def _build_response(
        self,
        *,
        answer: str,
        mode: str,
        sources: list | None = None,
        intent: str | None = None,
        context_used: list | None = None,
        route_scores: dict | None = None,
        route_confidence: float | None = None,
    ):
        return {
            "answer": answer,
            "sources": sources or [],
            "mode": mode,
            "intent": intent,
            "context_used": context_used or [],
            "route_scores": route_scores or {},
            "route_confidence": route_confidence,
        }

    def _is_strong_personal_query(self, message: str) -> bool:
        detected_intent = UserContextIntentService.detect_intent(message)
        if detected_intent:
            return True

        lowered = (message or "").strip().lower()

        strong_personal_markers = [
            "của tôi",
            "kho của tôi",
            "thực đơn của tôi",
            "món yêu thích của tôi",
            "danh sách mua sắm của tôi",
            "tôi còn gì",
            "bữa sáng của tôi",
            "bữa trưa của tôi",
            "bữa tối của tôi",
        ]

        return any(marker in lowered for marker in strong_personal_markers)

    def _is_rag_like_query(self, message: str) -> bool:
        lowered = (message or "").strip().lower()

        rag_markers = [
            "chức năng",
            "tính năng",
            "faq",
            "fqa",
            "rag",
            "ứng dụng",
            "app",
            "logic",
            "hoạt động như thế nào",
            "xử lý như thế nào",
            "màn hình",
            "nút",
            "form",
            "quy trình",
            "luồng",
            "nghiệp vụ",
            "chatbot trong ứng dụng",
            "xóa thực đơn",
            "build index",
        ]

        return any(marker in lowered for marker in rag_markers)

    def _is_general_llm_query(self, message: str) -> bool:
        lowered = (message or "").strip().lower()

        general_markers = [
            "gợi ý",
            "cách làm",
            "bao nhiêu calo",
            "giàu protein",
            "giảm cân",
            "healthy",
            "dinh dưỡng",
            "bảo quản",
            "thực phẩm nào",
            "ăn gì để",
            "nên",
            "nên ăn gì sau khi tập",
            "lợi ích",
            "tác dụng",
            "vitamin",
            "protein",
            "carb",
            "chất béo",
            "uống gì",
            "kiêng gì",
            "sức khỏe",
            
        ]

        return any(marker in lowered for marker in general_markers)

    def _choose_route(self, message: str):
        """
        Trả về:
        {
            "route": "...",
            "confidence": float,
            "scores": {...},
            "reason": "..."
        }
        """
        # 1. Ưu tiên tuyệt đối cho câu cá nhân hóa
        if self._is_strong_personal_query(message):
            return {
                "route": "user_context_llm",
                "confidence": 1.0,
                "scores": {"user_context_llm": 1.0},
                "reason": "strong_personal_query",
            }

        # 2. Ưu tiên tuyệt đối cho câu hỏi về app / tài liệu / chức năng
        if self._is_rag_like_query(message):
            return {
                "route": "rag",
                "confidence": 1.0,
                "scores": {"rag": 1.0},
                "reason": "rag_keyword_override",
            }

        # 3. Ưu tiên tuyệt đối cho câu hỏi kiến thức chung
        if self._is_general_llm_query(message):
            return {
                "route": "llm_direct",
                "confidence": 1.0,
                "scores": {"llm_direct": 1.0},
                "reason": "general_llm_keyword_override",
            }

        # 4. Nếu không có dấu hiệu rõ ràng thì mới dùng semantic router
        best_route, best_score, all_scores = self.semantic_router.classify_route(message)

        sorted_scores = sorted(all_scores.items(), key=lambda item: item[1], reverse=True)
        top_1_score = sorted_scores[0][1]
        top_2_score = sorted_scores[1][1] if len(sorted_scores) > 1 else 0.0
        margin = top_1_score - top_2_score

        if (
            best_score >= self.ROUTE_CONFIDENCE_THRESHOLD
            and margin >= self.ROUTE_MARGIN_THRESHOLD
        ):
            return {
                "route": best_route,
                "confidence": best_score,
                "scores": all_scores,
                "reason": "semantic_router_confident",
            }

        # 5. Soft fallback:
        # - nếu semantic nghiêng về rag hoặc llm thì giữ route đó
        # - tránh ép toàn bộ sang llm như bản cũ
        if best_route in {"rag", "llm_direct"}:
            return {
                "route": best_route,
                "confidence": best_score,
                "scores": all_scores,
                "reason": "semantic_router_soft_fallback",
            }

        return {
            "route": "llm_direct",
            "confidence": best_score,
            "scores": all_scores,
            "reason": "default_llm_fallback",
        }

    def answer_question(self, user, message: str, chat_history: list | None = None):
        message = (message or "").strip()

        if not message:
            return self._build_response(
                answer="Vui lòng nhập câu hỏi.",
                mode="empty",
            )

        route_result = self._choose_route(message)
        chosen_route = route_result["route"]
        route_confidence = route_result["confidence"]
        route_scores = route_result["scores"]

        # Route 1: User context
        if chosen_route == "user_context_llm":
            result = self.user_context_route_service.answer(
                user=user,
                message=message,
                chat_history=chat_history,
            )

            if result.get("mode") == "route_not_matched":
                fallback_result = self.llm_service.ask(
                    question=message,
                    chat_history=chat_history,
                )

                return self._build_response(
                    answer=fallback_result.get("answer", ""),
                    mode=fallback_result.get("mode", "llm_direct"),
                    sources=fallback_result.get("sources", []),
                    route_scores=route_scores,
                    route_confidence=route_confidence,
                )

            return self._build_response(
                answer=result.get("answer", ""),
                mode=result.get("mode", "user_context_llm"),
                sources=result.get("sources", []),
                intent=result.get("intent"),
                context_used=result.get("context_used", []),
                route_scores=route_scores,
                route_confidence=route_confidence,
            )

        # Route 2: RAG
        if chosen_route == "rag":
            result = self.rag_service.ask(
                question=message,
                chat_history=chat_history,
            )

            if result.get("mode") == "rag_not_found":
                fallback_result = self.llm_service.ask(
                    question=message,
                    chat_history=chat_history,
                )

                return self._build_response(
                    answer=fallback_result.get("answer", ""),
                    mode=fallback_result.get("mode", "llm_direct"),
                    sources=fallback_result.get("sources", []),
                    route_scores=route_scores,
                    route_confidence=route_confidence,
                )

            return self._build_response(
                answer=result.get("answer", ""),
                mode=result.get("mode", "rag"),
                sources=result.get("sources", []),
                route_scores=route_scores,
                route_confidence=route_confidence,
            )

        # Route 3: LLM direct
        result = self.llm_service.ask(
            question=message,
            chat_history=chat_history,
        )

        return self._build_response(
            answer=result.get("answer", ""),
            mode=result.get("mode", "llm_direct"),
            sources=result.get("sources", []),
            route_scores=route_scores,
            route_confidence=route_confidence,
        )
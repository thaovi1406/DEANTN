import math
from typing import Dict, List, Tuple

from chatbot.rag.embedding import get_embedding_model


class SemanticRouter:
    def __init__(self):
        self.embedding_model = get_embedding_model()

        self.route_examples: Dict[str, List[str]] = {
            "rag": [
                "Hướng dẫn tôi thực hiện chức năng trong ứng dụng"
                "Chức năng thực đơn tuần hoạt động như thế nào?",
                "Làm sao sử dụng danh sách mua sắm trong ứng dụng?",
                "FAQ của ứng dụng nói gì về chatbot?",
                "Hướng dẫn sử dụng tính năng kho thực phẩm ở đâu?",
                "Nếu xóa thực đơn thì danh sách mua sắm có bị xóa không?",
                "Ứng dụng xử lý thực đơn ngày như thế nào?",
                "Màn hình món ăn cá nhân dùng để làm gì?",
                "Logic của chức năng thêm nguyên liệu là gì?",
                "Cách dùng app để tạo danh sách mua sắm tuần.",
                "Chatbot trong ứng dụng hỗ trợ những gì?",
            ],
            "llm_direct": [
                "Thực phẩm nào giàu protein?",
                "Bảo quản rau củ trong tủ lạnh được bao lâu?",
                "Gợi ý bữa sáng ít calo.",
                "Ăn gì để giảm cân lành mạnh?",
                "Chuối có bao nhiêu calo?",
                "Cách ăn uống cân bằng cho người bận rộn.",
                "Nên ăn gì sau khi tập thể dục?",
                "Thịt gà có lợi ích dinh dưỡng gì?",
                "Gợi ý thực đơn healthy trong một ngày.",
                "Cách bảo quản cà chua đúng cách.",
            ],
            "user_context_llm": [
                "Hôm nay tôi ăn gì?",
                "Bữa tối nay của tôi là gì?",
                "Trong kho của tôi còn gì?",
                "Tôi còn nguyên liệu gì trong kho thực phẩm?",
                "Danh sách mua sắm hiện tại của tôi có gì?",
                "Tôi cần mua gì hôm nay?",
                "Tuần này tôi đã lên thực đơn chưa?",
                "Món yêu thích của tôi có gì?",
            ],
        }

        self.user_intent_examples: Dict[str, List[str]] = {
            "today_meal": [
                "Hôm nay tôi ăn gì?",
                "Bữa trưa hôm nay của tôi là gì?",
                "Tối nay tôi ăn món gì?",
                "Hôm nay tôi đã có thực đơn chưa?",
                "Cho tôi biết thực đơn hôm nay.",
            ],
            "inventory": [
                "Trong kho của tôi còn gì?",
                "Tôi còn những nguyên liệu nào?",
                "Kiểm tra kho thực phẩm của tôi.",
                "Hiện tôi còn thịt, cá, rau gì?",
                "Xem nguyên liệu đang có trong kho.",
            ],
            "shopping": [
                "Tôi cần mua gì?",
                "Danh sách mua sắm của tôi có gì?",
                "Hôm nay tôi còn thiếu nguyên liệu gì?",
                "Xem danh sách mua sắm hiện tại.",
                "Tôi có những món nào cần mua?",
            ],
            "general_user_context": [
                "Tình hình ăn uống của tôi hiện tại thế nào?",
                "Hãy xem dữ liệu hiện tại của tôi.",
                "Dựa trên dữ liệu của tôi, hãy tư vấn giúp.",
                "Xem dữ liệu cá nhân của tôi trong ứng dụng.",
                "Phân tích dữ liệu ăn uống hiện tại của tôi.",
            ],
        }

        self.route_vectors = self._build_vectors(self.route_examples)
        self.user_intent_vectors = self._build_vectors(self.user_intent_examples)

    def _build_vectors(
        self,
        example_map: Dict[str, List[str]],
    ) -> Dict[str, List[List[float]]]:
        result = {}
        for name, examples in example_map.items():
            result[name] = self.embedding_model.embed_documents(examples)
        return result

    def _cosine_similarity(self, a: List[float], b: List[float]) -> float:
        dot = sum(x * y for x, y in zip(a, b))
        norm_a = math.sqrt(sum(x * x for x in a))
        norm_b = math.sqrt(sum(y * y for y in b))

        if norm_a == 0 or norm_b == 0:
            return 0.0

        return dot / (norm_a * norm_b)

    def _score_against_examples(
        self,
        query_vector: List[float],
        vector_map: Dict[str, List[List[float]]],
    ) -> Tuple[str, float, Dict[str, float]]:
        scores: Dict[str, float] = {}

        for name, vectors in vector_map.items():
            scores[name] = max(
                self._cosine_similarity(query_vector, vec)
                for vec in vectors
            )

        best_name = max(scores, key=scores.get)
        best_score = scores[best_name]

        return best_name, best_score, scores

    def classify_route(self, message: str) -> Tuple[str, float, Dict[str, float]]:
        query_vector = self.embedding_model.embed_query(message)
        return self._score_against_examples(query_vector, self.route_vectors)

    def classify_user_intent(self, message: str) -> Tuple[str, float, Dict[str, float]]:
        query_vector = self.embedding_model.embed_query(message)
        return self._score_against_examples(query_vector, self.user_intent_vectors)
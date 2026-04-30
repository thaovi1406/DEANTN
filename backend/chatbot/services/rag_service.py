from pathlib import Path

from chatbot.prompts.rag_prompt import RAG_SYSTEM_PROMPT, RAG_HUMAN_TEMPLATE
from chatbot.rag.embedding import get_embedding_model
from chatbot.rag.vector_store import load_faiss_index, get_retriever
from chatbot.services.deepseek_client import DeepSeekClient

BASE_DIR = Path(__file__).resolve().parent.parent
FAISS_INDEX_DIR = BASE_DIR / "knowledge_base" / "faiss_index"


class RAGService:
    def __init__(self):
        if not FAISS_INDEX_DIR.exists():
            raise FileNotFoundError(
                "Chưa tìm thấy FAISS index. Hãy gọi API build-index trước."
            )

        self.embedding_model = get_embedding_model()
        self.vector_store = load_faiss_index(
            str(FAISS_INDEX_DIR),
            self.embedding_model,
        )
        self.retriever = get_retriever(self.vector_store, k=4)
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

    def ask(self, question: str, chat_history: list | None = None):
        docs = self.retriever.invoke(question)

        if not docs:
            return {
                "answer": "Hiện tại tôi chưa tìm thấy thông tin phù hợp trong tài liệu.",
                "sources": [],
                "mode": "rag",
            }

        context = "\n\n".join(doc.page_content for doc in docs)
        history_text = self._format_chat_history(chat_history)

        user_prompt = RAG_HUMAN_TEMPLATE.format(
            chat_history=history_text,
            context=context,
            question=question,
        )

        answer = self.llm.chat(
            system_prompt=RAG_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=0.2,
            model="deepseek-chat",
        )

        sources = []
        for doc in docs:
            source_name = doc.metadata.get("source")
            if source_name and source_name not in sources:
                sources.append(source_name)

        return {
            "answer": answer,
            "sources": sources,
            "mode": "rag",
        }
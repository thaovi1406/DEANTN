import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

import django
django.setup()

from chatbot.services.rag_service import RAGService


def print_result(result):
    print("\n=== KẾT QUẢ RAG ===")
    print(f"Mode: {result.get('mode', 'rag')}")
    print(f"Sources: {result.get('sources', [])}")
    print(f"Bot: {result.get('answer', '')}\n")


def main():
    print("=== TEST RIÊNG RAG CHATBOT ===")
    print("Gõ 'exit' để thoát.")
    print("Gõ 'clear' để xóa lịch sử hội thoại.\n")

    service = RAGService()
    history = []

    while True:
        question = input("Bạn: ").strip()

        if not question:
            continue

        lower_question = question.lower()

        if lower_question in ["exit", "quit", "q"]:
            print("Kết thúc test.")
            break

        if lower_question == "clear":
            history = []
            print("Đã xóa lịch sử hội thoại.\n")
            continue

        try:
            result = service.ask(
                question=question,
                chat_history=history,
            )

            answer = result.get("answer", "")
            print_result(result)

            history.append({
                "role": "user",
                "content": question,
            })
            history.append({
                "role": "assistant",
                "content": answer,
            })

        except Exception as e:
            print(f"\nLỗi: {e}\n")


if __name__ == "__main__":
    main()
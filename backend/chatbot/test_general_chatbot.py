import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

import django
django.setup()

from chatbot.services.llm_chat_service import LLMChatService


def main():
    print("=== TEST GENERAL CHATBOT GEMINI ===")
    print("Gõ 'exit' để thoát.")
    print("Gõ 'clear' để xóa lịch sử hội thoại.\n")

    service = LLMChatService()
    history = []

    while True:
        question = input("Bạn: ").strip()

        if not question:
            continue

        if question.lower() in ["exit", "quit", "q"]:
            print("Kết thúc test.")
            break

        if question.lower() == "clear":
            history = []
            print("Đã xóa lịch sử hội thoại.\n")
            continue

        try:
            result = service.ask(question, history)
            answer = result["answer"]

            print(f"\nBot: {answer}\n")

            history.append({"role": "user", "content": question})
            history.append({"role": "assistant", "content": answer})

        except Exception as e:
            print(f"\nLỗi: {e}\n")


if __name__ == "__main__":
    main()
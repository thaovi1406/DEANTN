import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

import django
django.setup()

from django.contrib.auth import get_user_model
from chatbot.services.chat_service import ChatService


def choose_user():
    User = get_user_model()

    print("=== CHỌN USER ĐỂ TEST CHAT SERVICE ===")
    print("Nhập username hoặc id của user.\n")

    while True:
        raw_value = input("User: ").strip()

        if not raw_value:
            print("Vui lòng nhập username hoặc id.\n")
            continue

        try:
            if raw_value.isdigit():
                user = User.objects.filter(pk=int(raw_value)).first()
            else:
                user = User.objects.filter(username=raw_value).first()

            if not user:
                print("Không tìm thấy user. Vui lòng thử lại.\n")
                continue

            print(f"Đã chọn user: id={user.pk}, username={user.username}\n")
            return user

        except Exception as e:
            print(f"Lỗi khi tìm user: {e}\n")


def print_result(result):
    print("\n=== KẾT QUẢ CHAT SERVICE ===")
    print(f"Mode: {result.get('mode')}")
    print(f"Intent: {result.get('intent')}")
    print(f"Route confidence: {result.get('route_confidence')}")
    print(f"Context used: {result.get('context_used', [])}")
    print(f"Sources: {result.get('sources', [])}")
    print(f"Route scores: {result.get('route_scores', {})}")
    print(f"Bot: {result.get('answer', '')}\n")


def main():
    print("=== TEST CHAT SERVICE (RAG + USER CONTEXT + LLM) ===")
    print("Gõ 'exit' để thoát.")
    print("Gõ 'clear' để xóa lịch sử hội thoại.")
    print("Gõ 'change_user' để đổi user.")
    print("Gõ 'debug_off' để tắt in chi tiết route.")
    print("Gõ 'debug_on' để bật lại in chi tiết route.\n")

    user = choose_user()
    service = ChatService()
    history = []
    debug_mode = True

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

        if lower_question == "change_user":
            user = choose_user()
            history = []
            print("Đã đổi user và xóa lịch sử hội thoại.\n")
            continue

        if lower_question == "debug_off":
            debug_mode = False
            print("Đã tắt debug route.\n")
            continue

        if lower_question == "debug_on":
            debug_mode = True
            print("Đã bật debug route.\n")
            continue

        try:
            result = service.answer_question(
                user=user,
                message=question,
                chat_history=history,
            )

            answer = result.get("answer", "")

            if debug_mode:
                print_result(result)
            else:
                print(f"\nBot: {answer}\n")

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
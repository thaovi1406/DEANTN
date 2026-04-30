import re


class UserContextIntentService:
    INTENT_PATTERNS = {
        "today_meal": [
            r"\bhôm nay\b.*\b(ăn gì|món gì|thực đơn)\b",
            r"\b(thực đơn|món ăn)\b.*\bhôm nay\b",
            r"\b(sáng|trưa|tối) nay\b.*\b(ăn gì|món gì)\b",
            r"\bhôm nay tôi ăn gì\b",
            r"\bbữa nào hôm nay chưa có món\b",
            r"\bthực đơn hôm nay đã đủ 3 bữa chưa\b",
        ],
        "inventory": [
            r"\bkho\b.*\b(của tôi|hiện có|còn gì)\b",
            r"\btủ lạnh\b.*\b(có gì|còn gì)\b",
            r"\btôi còn\b.*\b(thịt|rau|cá|trứng|gia vị|nguyên liệu)\b",
            r"\btrong kho\b.*\b(có gì|còn gì)\b",
            r"\bkho của tôi hiện có gì\b",
        ],
        "favorite_dishes": [
            r"\bmón yêu thích\b",
            r"\btôi có món yêu thích nào\b",
            r"\bdanh sách món yêu thích\b",
            r"\bmón nào tôi thích\b",
        ],
        "shopping": [
            r"\bdanh sách mua sắm\b",
            r"\bshopping list\b",
            r"\btôi cần mua gì\b",
            r"\bđã mua\b",
            r"\bchưa mua\b",
            r"\bcòn thiếu gì\b",
            r"\bdanh sách mua sắm gần nhất\b",
        ],
        "cook_suggestion": [
            r"\bhôm nay\b.*\b(nấu gì|ăn gì)\b",
            r"\btối nay\b.*\b(nấu gì|ăn gì)\b",
            r"\btrưa nay\b.*\b(nấu gì|ăn gì)\b",
            r"\bsáng nay\b.*\b(nấu gì|ăn gì)\b",
            r"\bgợi ý\b.*\b(món|bữa ăn)\b",
            r"\bnấu gì với\b",
            r"\btừ nguyên liệu hiện có\b",
            r"\btôi nên nấu gì\b",
            r"\btôi nên ăn gì\b",
        ],
        "shopping_inventory_compare": [
            r"\bdanh sách mua sắm\b.*\bkho\b",
            r"\bkho\b.*\bdanh sách mua sắm\b",
            r"\bcòn thiếu gì so với danh sách mua sắm\b",
            r"\bđã có sẵn gì trong kho\b",
        ],
        "favorite_inventory_match": [
            r"\bmón yêu thích\b.*\bkho\b",
            r"\bkho hiện tại\b.*\bmón yêu thích\b",
            r"\bmón yêu thích nào\b.*\bnấu được\b",
        ],
        "personal_overview": [
            r"\bdựa vào dữ liệu của tôi\b",
            r"\btóm tắt dữ liệu ăn uống của tôi\b",
            r"\btình hình ăn uống của tôi\b",
        ],
    }

    PERSONAL_KEYWORDS = [
        "của tôi",
        "hôm nay của tôi",
        "kho của tôi",
        "tủ lạnh của tôi",
        "nguyên liệu của tôi",
        "món yêu thích",
        "danh sách mua sắm",
        "bữa sáng của tôi",
        "bữa trưa của tôi",
        "bữa tối của tôi",
    ]

    @classmethod
    def detect_intent(cls, message: str) -> str | None:
        text = (message or "").strip().lower()

        for intent, patterns in cls.INTENT_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, text):
                    return intent

        if cls.looks_like_personal_query(text):
            return "personal_overview"

        return None

    @classmethod
    def looks_like_personal_query(cls, message: str) -> bool:
        text = (message or "").strip().lower()
        return any(keyword in text for keyword in cls.PERSONAL_KEYWORDS)
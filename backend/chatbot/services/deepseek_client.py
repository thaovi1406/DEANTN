from django.conf import settings
from openai import OpenAI


class DeepSeekClient:
    def __init__(self):
        api_key = getattr(settings, "DEEPSEEK_API_KEY", None)
        if not api_key:
            raise ValueError("Thiếu DEEPSEEK_API_KEY trong file .env")

        self.client = OpenAI(
            api_key=api_key,
            base_url="https://api.deepseek.com",
        )

    def chat(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.4,
        model: str = "deepseek-chat",
    ) -> str:
        response = self.client.chat.completions.create(
            model=model,
            temperature=temperature,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            stream=False,
        )

        return response.choices[0].message.content or ""
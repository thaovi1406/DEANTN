from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from chatbot.serializers import ChatRequestSerializer
from chatbot.services.chat_service import ChatService
from chatbot.services.llm_chat_service import LLMChatService
from chatbot.rag.index_builder import build_index


class BuildIndexAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        result = build_index()
        return Response(result, status=status.HTTP_200_OK)


class ChatbotAskAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message = serializer.validated_data["message"]
        chat_history = serializer.validated_data.get("chat_history", [])

        service = ChatService()
        result = service.answer_question(
            user=request.user,
            message=message,
            chat_history=chat_history,
        )

        return Response(result, status=status.HTTP_200_OK)


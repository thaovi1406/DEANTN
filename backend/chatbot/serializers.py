from rest_framework import serializers


class ChatHistoryItemSerializer(serializers.Serializer):
    role = serializers.CharField(required=True, max_length=20)
    content = serializers.CharField(required=True, allow_blank=False)


class ChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField(required=True, allow_blank=False, max_length=2000)
    chat_history = ChatHistoryItemSerializer(many=True, required=False, default=[])
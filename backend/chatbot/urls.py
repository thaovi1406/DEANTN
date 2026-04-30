from django.urls import path

from .views import BuildIndexAPIView, ChatbotAskAPIView


urlpatterns = [
    path("ask/", ChatbotAskAPIView.as_view(), name="chatbot-ask"),
    path("build-index/", BuildIndexAPIView.as_view(), name="chatbot-build-index"),
]
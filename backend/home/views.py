from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .serializers import HomeDishQuerySerializer, IndividualDishQuerySerializer, UpsertIndividualDishSerializer
from .services import HomeService, IndividualService
import json

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def home_dish_list_view(request):
    serializer = HomeDishQuerySerializer(data=request.query_params)
    serializer.is_valid(raise_exception=True)

    data = HomeService.get_home_dishes(
        request=request,
        user=request.user,
        search=serializer.validated_data.get("search", ""),
        category=serializer.validated_data.get("category", ""),
        favorite_only=serializer.validated_data.get("favorite_only", False),
    )

    return Response(
        {
            "message": "Lấy danh sách món ăn thành công",
            "data": data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_favorite_view(request, dish_id):
    result = HomeService.toggle_favorite(
        user=request.user,
        dish_id=dish_id,
    )

    if not result["success"]:
        return Response(
            {
                "message": result["message"],
                "data": None,
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    return Response(
        {
            "message": result["message"],
            "data": result["data"],
        },
        status=status.HTTP_200_OK,
    )
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dish_detail_view(request, dish_id):
    result = HomeService.get_dish_detail(
        request=request,
        user=request.user,
        dish_id=dish_id,
    )

    if not result["success"]:
        return Response(
            {
                "message": result["message"],
                "data": None,
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    return Response(
        {
            "message": result["message"],
            "data": result["data"],
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def individual_dish_list_view(request):
    serializer = IndividualDishQuerySerializer(data=request.query_params)
    serializer.is_valid(raise_exception=True)

    data = IndividualService.get_individual_dishes(
        request=request,
        user=request.user,
        search=serializer.validated_data.get("search", ""),
        category=serializer.validated_data.get("category", ""),
    )

    return Response(
        {
            "message": "Lấy danh sách món ăn cá nhân thành công",
            "data": data,
        },
        status=status.HTTP_200_OK,
    )

def _normalize_upsert_payload(request):
    data = request.data.dict() if hasattr(request.data, 'dict') else request.data.copy()

    for field in ["ingredients", "methods"]:
        value = data.get(field)

        if isinstance(value, str):
            try:
                data[field] = json.loads(value)
            except (json.JSONDecodeError, TypeError):
                pass

    # Nếu có file image, DRF sẽ giữ nó trong request.data nhưng .dict() có thể làm mất 
    # nếu không cẩn thận. Ta nên ép lại file vào data nếu cần.
    if 'image' in request.FILES:
        data['image'] = request.FILES['image']

    return data

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def individual_dish_create_view(request):
    payload = _normalize_upsert_payload(request)

    serializer = UpsertIndividualDishSerializer(data=payload)
    serializer.is_valid(raise_exception=True)

    result = IndividualService.create_individual_dish(
        request=request,
        user=request.user,
        validated_data=serializer.validated_data,
    )

    return Response(
        {
            "message": result["message"],
            "data": result["data"],
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def individual_dish_update_view(request, dish_id):
    if request.method == "GET":
        result = IndividualService.get_individual_dish_for_update(
            request=request,
            user=request.user,
            dish_id=dish_id,
        )

        if not result["success"]:
            return Response(
                {
                    "message": result["message"],
                    "data": None,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "message": result["message"],
                "data": result["data"],
            },
            status=status.HTTP_200_OK,
        )

    payload = _normalize_upsert_payload(request)

    serializer = UpsertIndividualDishSerializer(data=payload)
    serializer.is_valid(raise_exception=True)

    result = IndividualService.update_individual_dish(
        request=request,
        user=request.user,
        dish_id=dish_id,
        validated_data=serializer.validated_data,
    )

    if not result["success"]:
        return Response(
            {
                "message": result["message"],
                "data": None,
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    return Response(
        {
            "message": result["message"],
            "data": result["data"],
        },
        status=status.HTTP_200_OK,
    )

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def individual_dish_delete_view(request, dish_id):
    result = IndividualService.delete_individual_dish(
        user=request.user,
        dish_id=dish_id,
    )

    if not result["success"]:
        return Response(
            {
                "message": result["message"],
                "data": None,
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    return Response(
        {
            "message": result["message"],
            "data": result["data"],
        },
        status=status.HTTP_200_OK,
    )
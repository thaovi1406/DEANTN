from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .serializers import (
    ShoppingListQuerySerializer,
    GenerateShoppingListWeekSerializer,
    GenerateShoppingListDaySerializer,
    ShoppingListDetailQuerySerializer,
    ShoppingListDeleteSerializer,
    ShoppingItemToggleStatusSerializer,
    ShoppingItemDeleteSerializer,
    ShoppingItemCreateSerializer,
    ShoppingItemUpdateSerializer,
)
from .services import ShoppingListService


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def shopping_list_view(request):
    serializer = ShoppingListQuerySerializer(data=request.query_params)
    serializer.is_valid(raise_exception=True)

    data = ShoppingListService.get_shopping_lists(
        user=request.user,
        search=serializer.validated_data.get("search", ""),
    )

    return Response(
        {
            "message": "Lấy danh sách mua sắm thành công",
            "data": data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def shopping_list_generate_week_view(request):
    serializer = GenerateShoppingListWeekSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    result = ShoppingListService.generate_week_shopping_list(
        user=request.user,
        week_start=serializer.validated_data["start_date"],
    )

    if not result["success"]:
        return Response(
            {
                "message": result["message"],
                "data": None,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(
        {
            "message": result["message"],
            "data": result["data"],
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def shopping_list_generate_day_view(request):
    serializer = GenerateShoppingListDaySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    result = ShoppingListService.generate_day_shopping_list(
        user=request.user,
        target_date=serializer.validated_data["date"],
    )

    if not result["success"]:
        return Response(
            {
                "message": result["message"],
                "data": None,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(
        {
            "message": result["message"],
            "data": result["data"],
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def shopping_list_detail_view(request):
    serializer = ShoppingListDetailQuerySerializer(data=request.query_params)
    serializer.is_valid(raise_exception=True)

    result = ShoppingListService.get_shopping_list_detail(
        user=request.user,
        shopping_id=serializer.validated_data["shopping_id"],
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


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def shopping_list_delete_view(request):
    serializer = ShoppingListDeleteSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    result = ShoppingListService.delete_shopping_list(
        user=request.user,
        shopping_id=serializer.validated_data["shopping_id"],
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


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def shopping_item_toggle_status_view(request):
    serializer = ShoppingItemToggleStatusSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    result = ShoppingListService.toggle_shopping_item_status(
        user=request.user,
        item_id=serializer.validated_data["item_id"],
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


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def shopping_item_delete_view(request):
    serializer = ShoppingItemDeleteSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    result = ShoppingListService.delete_shopping_item(
        user=request.user,
        item_id=serializer.validated_data["item_id"],
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


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def shopping_item_create_view(request):
    serializer = ShoppingItemCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    result = ShoppingListService.create_shopping_item(
        user=request.user,
        validated_data=serializer.validated_data,
    )

    if not result["success"]:
        return Response(
            {
                "message": result["message"],
                "errors": result.get("errors", {}),
                "data": None,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(
        {
            "message": result["message"],
            "data": result["data"],
        },
        status=status.HTTP_201_CREATED,
    )



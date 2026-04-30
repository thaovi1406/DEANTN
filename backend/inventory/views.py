from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .serializers import (
    FoodInventoryQuerySerializer,
    FoodInventoryDetailSerializer,
    FoodInventoryCreateSerializer,
    FoodInventoryUpdateQuantitySerializer,
    FoodInventoryDeleteSerializer,
    AddBoughtItemsToInventorySerializer,
)
from .services import FoodInventoryService


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def food_inventory_list_view(request):
    serializer = FoodInventoryQuerySerializer(data=request.query_params)
    serializer.is_valid(raise_exception=True)

    data = FoodInventoryService.get_food_inventory_list(
        user=request.user,
        search=serializer.validated_data.get("search", ""),
        group_name=serializer.validated_data.get("group_name", ""),
    )

    return Response(
        {
            "message": "Lấy danh sách nguyên liệu trong kho thành công",
            "data": data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def food_inventory_detail_view(request):
    serializer = FoodInventoryDetailSerializer(data=request.query_params)
    serializer.is_valid(raise_exception=True)

    result = FoodInventoryService.get_food_inventory_detail(
        user=request.user,
        food_inventory_id=serializer.validated_data["food_inventory_id"],
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
def food_inventory_create_view(request):
    serializer = FoodInventoryCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    result = FoodInventoryService.create_food_inventory(
        user=request.user,
        validated_data=serializer.validated_data,
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
def food_inventory_delete_view(request):
    serializer = FoodInventoryDeleteSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    result = FoodInventoryService.delete_food_inventory(
        user=request.user,
        food_inventory_id=serializer.validated_data["food_inventory_id"],
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
def check_bought_items_to_inventory_view(request):
    serializer = AddBoughtItemsToInventorySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    result = FoodInventoryService.check_bought_items_sufficient_in_inventory(
        user=request.user,
        shopping_id=serializer.validated_data["shopping_id"],
    )

    if not result["success"]:
        return Response(
            {
                "success": False,
                "message": result["message"],
                "data": result.get("data"),
            },
            status=status.HTTP_200_OK,
        )

    return Response(
        {
            "success": True,
            "message": result["message"],
            "data": result["data"],
        },
        status=status.HTTP_200_OK,
    )

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_bought_items_to_inventory_view(request):
    serializer = AddBoughtItemsToInventorySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    result = FoodInventoryService.add_bought_items_to_inventory(
        user=request.user,
        shopping_id=serializer.validated_data["shopping_id"],
    )

    if not result["success"]:
        return Response(
            {
                "success": False,
                "message": result["message"],
                "data": result.get("data"),
            },
            status=status.HTTP_200_OK,
        )

    return Response(
        {
            "success": True,
            "message": result["message"],
            "data": result["data"],
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def food_inventory_update_quantity_view(request):
    serializer = FoodInventoryUpdateQuantitySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    result = FoodInventoryService.update_food_inventory_quantity(
        user=request.user,
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
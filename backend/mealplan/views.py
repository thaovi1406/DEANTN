from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .serializers import (
    MealPlanWeekQuerySerializer,
    MealPlanDishQuerySerializer,
    AssignMealPlanDishSerializer,
    DeleteMealPlanDetailSerializer,
    ClearMealPlanWeekSerializer,
    ClearMealPlanDaySerializer,
    CopyMealPlanWeekOptionsQuerySerializer,
    CopyMealPlanWeekSerializer,
    CopyMealPlanDayOptionsQuerySerializer,
    CopyMealPlanDaySerializer,
)
from .services import MealPlanService



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def meal_plan_week_view(request):
    serializer = MealPlanWeekQuerySerializer(data=request.query_params)
    serializer.is_valid(raise_exception=True)

    data = MealPlanService.get_week_plan_by_date(
        request=request,
        user=request.user,
        target_date=serializer.validated_data.get("date"),
    )

    return Response(
        {
            "message": "Lấy thực đơn tuần thành công",
            "data": data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def meal_plan_dish_list_view(request):
    serializer = MealPlanDishQuerySerializer(data=request.query_params)
    serializer.is_valid(raise_exception=True)

    data = MealPlanService.get_available_dishes(
        request=request,
        user=request.user,
        search=serializer.validated_data.get("search", ""),
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
def meal_plan_assign_dish_view(request):
    serializer = AssignMealPlanDishSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    result = MealPlanService.assign_dish_to_meal(
        request=request,
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
def meal_plan_detail_delete_view(request):
    serializer = DeleteMealPlanDetailSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    result = MealPlanService.delete_meal_plan_detail(
        user=request.user,
        plan_detail_id=serializer.validated_data["plan_detail_id"],
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
def meal_plan_week_clear_view(request):
    serializer = ClearMealPlanWeekSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    result = MealPlanService.clear_week_plan(
        user=request.user,
        week_start=serializer.validated_data["start_date"],
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
def meal_plan_day_clear_view(request):
    serializer = ClearMealPlanDaySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    result = MealPlanService.clear_day_plan(
        user=request.user,
        target_date=serializer.validated_data["date"],
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
def meal_plan_copy_week_options_view(request):
    serializer = CopyMealPlanWeekOptionsQuerySerializer(data=request.query_params)
    serializer.is_valid(raise_exception=True)

    data = MealPlanService.get_copy_week_options(
        user=request.user,
        source_start_date=serializer.validated_data["source_start_date"],
        month_date=serializer.validated_data.get("month_date"),
    )

    return Response(
        {
            "message": "Lấy danh sách tuần đích thành công",
            "data": data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def meal_plan_copy_week_view(request):
    serializer = CopyMealPlanWeekSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    result = MealPlanService.copy_week_plan(
        user=request.user,
        source_start_date=serializer.validated_data["source_start_date"],
        target_start_date=serializer.validated_data["target_start_date"],
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
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def meal_plan_copy_day_options_view(request):
    serializer = CopyMealPlanDayOptionsQuerySerializer(data=request.query_params)
    serializer.is_valid(raise_exception=True)

    data = MealPlanService.get_copy_day_options(
        user=request.user,
        source_date=serializer.validated_data["source_date"],
        week_date=serializer.validated_data.get("week_date"),
    )

    return Response(
        {
            "message": "Lấy danh sách ngày đích thành công",
            "data": data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def meal_plan_copy_day_view(request):
    serializer = CopyMealPlanDaySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    result = MealPlanService.copy_day_plan(
        user=request.user,
        source_date=serializer.validated_data["source_date"],
        target_date=serializer.validated_data["target_date"],
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
        status=status.HTTP_200_OK,
    )

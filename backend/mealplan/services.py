from collections import OrderedDict
from datetime import date, timedelta

from django.db import transaction
from django.db.models import Q

from home.models import Dish
from home.services import HomeService
from .models import MealPlan, MealPlanDetail
import calendar

class MealPlanService:
    WEEKDAY_LABELS = {
        0: "THỨ HAI",
        1: "THỨ BA",
        2: "THỨ TƯ",
        3: "THỨ NĂM",
        4: "THỨ SÁU",
        5: "THỨ BẢY",
        6: "CHỦ NHẬT",
    }

    MEAL_LABELS = OrderedDict(
        [
            ("breakfast", "Sáng"),
            ("lunch", "Trưa"),
            ("dinner", "Tối"),
        ]
    )

    @staticmethod
    def get_week_range(target_date): #xác định phạm vi tuần theo ngày hiện tại
        week_start = target_date - timedelta(days=target_date.weekday()) #week_start tức là tìm ngày thứ 2 của tuần chứa target date truyền vào; trả về date (target_date lùi lại số bước cần để quay về thứ 2)
        week_end = week_start + timedelta(days=6)
        return week_start, week_end

    @staticmethod
    def get_or_create_week_plan(week_start, week_end):
        meal_plan, _ = MealPlan.objects.get_or_create(
            start_date=week_start,
            end_date=week_end,
        )
        return meal_plan

    @staticmethod
    def build_assigned_dish_item(request, detail):
        return {
            "plan_detail_id": detail.plan_detail_id,
            "dish_id": detail.dish.dish_id,
            "dish_name": detail.dish.dish_name,
            "image": HomeService.build_image_url(request, detail.dish),
            "cooking_time": detail.dish.cooking_time,
            "ration": detail.dish.ration,
            "category_name": detail.dish.category_name,
            "category_label": HomeService.get_category_label(detail.dish.category_name),
            "source_dish_id": detail.dish.source_dish_id,
        }

    @staticmethod
    def build_week_days(week_start, detail_map):
        days = []
        current_date = week_start

        while current_date <= week_start + timedelta(days=6):
            meals = []
            for meal_type, label in MealPlanService.MEAL_LABELS.items():
                meals.append(
                    {
                        "meal_type": meal_type,
                        "label": label,
                        "dishes": detail_map.get((current_date, meal_type), []),
                    }
                )

            days.append(
                {
                    "date": current_date, #ngày vd 21/03/2026
                    "day": current_date.day, # -> 21
                    "month": current_date.month, # -> 3
                    "weekday_key": str(current_date.weekday()), 
                    "weekday_label": MealPlanService.WEEKDAY_LABELS[current_date.weekday()], #thứ
                    "meals": meals,
                }
            )
            current_date += timedelta(days=1)
            #Nếu ngày đó chưa có dữ liệu -> tạo mảng rỗng

        return days

    @staticmethod
    def get_week_plan_by_date(request, user, target_date=None):
        target_date = target_date or date.today()
        week_start, week_end = MealPlanService.get_week_range(target_date)

        meal_plan = MealPlan.objects.filter(
            start_date=week_start,
            end_date=week_end,
        ).first()

        details = []
        if meal_plan:
            details = list(
                MealPlanDetail.objects.filter(
                    user=user,
                    plan=meal_plan,
                )
                .select_related("dish")
                .order_by("date", "meal_type", "plan_detail_id")
            ) #Lấy các record dish của plan detail nếu tồn tài plan_id (tức là tuần có thực đơn rồi)

        detail_map = {}
        for detail in details:
            key = (detail.date, detail.meal_type) #tại dictionary map ngày bữa -> thả món ăn vào đúng bữa của ngày mà ng dùng thêm
            if key not in detail_map:
                detail_map[key] = []
            detail_map[key].append(
                MealPlanService.build_assigned_dish_item(request, detail) #Nhóm các data của món ăn từ hàm build vào một dic detail map để gửi cho frontend
            )

        return {
            "plan_id": meal_plan.plan_id if meal_plan else None,
            "start_date": week_start,
            "end_date": week_end,
            "previous_week_date": week_start - timedelta(days=7),
            "next_week_date": week_start + timedelta(days=7),
            "days": MealPlanService.build_week_days(week_start, detail_map),
        }

    @staticmethod
    def get_available_dishes(request, user, search=""): #hàm chọn món để chọn vào thực đơn
        queryset = (
            Dish.objects.filter(
                individual_dishes__user=user,
            )
            .distinct()
            .order_by("dish_id")
        )

        if search:
            keyword = search.strip()
            queryset = queryset.filter(
                Q(dish_name__icontains=keyword)
                | Q(dish_details__ingredient__ingredient_name__icontains=keyword)
            ).distinct()

        dishes = []
        for dish in queryset:
            relation = dish.individual_dishes.filter(user=user).first()

            dishes.append(
                {
                    "dish_id": dish.dish_id,
                    "dish_name": dish.dish_name,
                    "cooking_time": dish.cooking_time,
                    "ration": dish.ration,
                    "image": HomeService.build_image_url(request, dish),
                    "category_name": dish.category_name,
                    "category_label": HomeService.get_category_label(dish.category_name),
                    "is_favorite": relation.is_favorite if relation else False,
                    "source_dish_id": dish.source_dish_id,
                }
            )

        return {"dishes": dishes}

    @staticmethod
    @transaction.atomic
    def assign_dish_to_meal(request, user, validated_data):
        dish_id = validated_data["dish_id"]
        target_date = validated_data["date"]
        meal_type = validated_data["meal_type"]

        dish = (
            Dish.objects.filter(
                dish_id=dish_id,
                individual_dishes__user=user,
            )
            .distinct()
            .first()
        )
        week_start, week_end = MealPlanService.get_week_range(target_date)
        meal_plan = MealPlanService.get_or_create_week_plan(week_start, week_end)

        detail = MealPlanDetail.objects.create(
            plan=meal_plan,
            dish=dish,
            user=user,
            date=target_date,
            meal_type=meal_type,
        )

        from shoppinglist.services import ShoppingListService

        deleted_day = ShoppingListService.delete_day_shopping_data(
            user=user,
            plan=meal_plan,
            target_date=target_date,
        )
        deleted_week = ShoppingListService.delete_week_shopping_data(
            user=user,
            plan=meal_plan,
        )

        shopping_reset = deleted_day or deleted_week

        message = "Thêm món vào thực đơn thành công"
        if shopping_reset:
            message += ". Danh sách mua sắm liên quan đã được xóa do thực đơn thay đổi"

        return {
            "success": True,
            "message": message,
            "data": {
                "plan_detail_id": detail.plan_detail_id,
                "plan_id": meal_plan.plan_id,
                "date": detail.date,
                "meal_type": detail.meal_type,
                "dish": MealPlanService.build_assigned_dish_item(request, detail),
                "shopping_reset": shopping_reset,
                "deleted_day_shopping": deleted_day,
                "deleted_week_shopping": deleted_week,
            },
        }

    @staticmethod
    @transaction.atomic
    def delete_meal_plan_detail(user, plan_detail_id):
        detail = (
            MealPlanDetail.objects.filter(
                plan_detail_id=plan_detail_id,
                user=user,
            )
            .select_related("plan", "dish")
            .first()
        )

        data = {
            "plan_detail_id": detail.plan_detail_id,
            "plan_id": detail.plan.plan_id,
            "date": detail.date,
            "meal_type": detail.meal_type,
            "dish_id": detail.dish.dish_id,
        }

        plan = detail.plan
        target_date = detail.date
        detail.delete()

        from shoppinglist.services import ShoppingListService

        deleted_day = ShoppingListService.delete_day_shopping_data(
            user=user,
            plan=plan,
            target_date=target_date,
        )
        deleted_week = ShoppingListService.delete_week_shopping_data(
            user=user,
            plan=plan,
        )

        shopping_reset = deleted_day or deleted_week

        message = "Đã xóa món ăn thành công"
        if shopping_reset:
            message += ". Danh sách mua sắm liên quan đã được xóa do thực đơn thay đổi"

        return {
            "success": True,
            "message": message,
            "data": {
                **data,
                "shopping_reset": shopping_reset,
                "deleted_day_shopping": deleted_day,
                "deleted_week_shopping": deleted_week,
            },
        }

    @staticmethod
    @transaction.atomic
    def clear_week_plan(user, week_start):
        week_end = week_start + timedelta(days=6)

        meal_plan = MealPlan.objects.filter(
            start_date=week_start,
            end_date=week_end,
        ).first()

        if not meal_plan:
            return {
                "success": True,
                "message": "Thực đơn tuần đã trống",
                "data": {
                    "start_date": week_start,
                    "end_date": week_end,
                    "deleted_count": 0,
                },
            }

        queryset = MealPlanDetail.objects.filter(
            user=user,
            plan=meal_plan,
        )
        deleted_count = queryset.count()
        queryset.delete()

        from shoppinglist.services import ShoppingListService

        deleted_week = ShoppingListService.delete_week_shopping_data(
            user=user,
            plan=meal_plan,
        )
        deleted_day_count = ShoppingListService.delete_all_day_shopping_data_by_plan(
            user=user,
            plan=meal_plan,
        )

        return {
            "success": True,
            "message": "Xóa thực đơn tuần thành công",
            "data": {
                "plan_id": meal_plan.plan_id,
                "start_date": week_start,
                "end_date": week_end,
                "deleted_count": deleted_count,
                "deleted_week_shopping": deleted_week,
                "deleted_day_shopping_count": deleted_day_count,
            },
        }

    @staticmethod
    @transaction.atomic
    def clear_day_plan(user, target_date):
        week_start, week_end = MealPlanService.get_week_range(target_date)

        meal_plan = MealPlan.objects.filter(
            start_date=week_start,
            end_date=week_end,
        ).first()

        if not meal_plan:
            return {
                "success": True,
                "message": "Thực đơn ngày đã trống",
                "data": {
                    "date": target_date,
                    "start_date": week_start,
                    "end_date": week_end,
                    "deleted_count": 0,
                },
            }

        queryset = MealPlanDetail.objects.filter(
            user=user,
            plan=meal_plan,
            date=target_date,
        )

        deleted_count = queryset.count()
        queryset.delete()

        from shoppinglist.services import ShoppingListService

        deleted_day = ShoppingListService.delete_day_shopping_data(
            user=user,
            plan=meal_plan,
            target_date=target_date,
        )
        deleted_week = ShoppingListService.delete_week_shopping_data(
            user=user,
            plan=meal_plan,
        )

        return {
            "success": True,
            "message": "Xóa thực đơn ngày thành công",
            "data": {
                "plan_id": meal_plan.plan_id,
                "date": target_date,
                "start_date": week_start,
                "end_date": week_end,
                "deleted_count": deleted_count,
                "deleted_day_shopping": deleted_day,
                "deleted_week_shopping": deleted_week,
            },
        }

    @staticmethod
    def get_month_start(any_date):
        return any_date.replace(day=1)

    @staticmethod
    def get_month_end(any_date):
        # _, last_day: dấu gạch dưới dùng để bỏ qua giá trị đầu tiên (thứ trong tuần)
        _, last_day = calendar.monthrange(any_date.year, any_date.month)
        
        # Chỉ cần thay thế ngày hiện tại bằng ngày cuối cùng vừa tìm được
        return any_date.replace(day=last_day)

    @staticmethod
    def get_weeks_of_month(month_date):
        month_start = MealPlanService.get_month_start(month_date)
        month_end = MealPlanService.get_month_end(month_date)

        first_week_start, _ = MealPlanService.get_week_range(month_start)
        current = first_week_start
        weeks = []

        while current <= month_end: #chạy while để lấy start date - end date của các tuần còn lại cho đến khi current = ngày end của month
            weeks.append(
                {
                    "start_date": current,
                    "end_date": current + timedelta(days=6),
                }
            )
            current += timedelta(days=7)

        return weeks

    @staticmethod
    def get_copy_week_options(user, source_start_date, month_date=None):
        month_date = month_date or source_start_date
        source_end_date = source_start_date + timedelta(days=6)

        weeks = MealPlanService.get_weeks_of_month(month_date)
        month_start = MealPlanService.get_month_start(month_date)
        month_end = MealPlanService.get_month_end(month_date)

        week_options = []
        for week in weeks:
            week_options.append(
                {
                    "start_date": week["start_date"],
                    "end_date": week["end_date"],
                    "has_data": MealPlanService.has_week_plan_data(user, week["start_date"]),
                }
            )

        return {
            "source_week": {
                "start_date": source_start_date,
                "end_date": source_end_date,
            },
            "month_range": {
                "start_date": month_start,
                "end_date": month_end,
            },
            "previous_month_date": month_start - timedelta(days=1),
            "next_month_date": month_end + timedelta(days=1),
            "weeks": week_options,
        }

    @staticmethod
    def clone_meal_details(user, source_details, target_plan, target_date_mapper):
        created_count = 0

        for source_detail in source_details:
            target_date = target_date_mapper(source_detail.date)

            if target_date < target_plan.start_date or target_date > target_plan.end_date:
                continue

            exists = MealPlanDetail.objects.filter(
                plan=target_plan,
                user=user,
                date=target_date,
                meal_type=source_detail.meal_type,
                dish=source_detail.dish,
            ).exists()

            if exists:
                continue

            MealPlanDetail.objects.create(
                plan=target_plan,
                user=user,
                dish=source_detail.dish,
                date=target_date,
                meal_type=source_detail.meal_type,
            )
            created_count += 1

        return created_count
    
    @staticmethod
    def has_week_plan_data(user, week_start):
        week_end = week_start + timedelta(days=6)

        meal_plan = MealPlan.objects.filter(
            start_date=week_start,
            end_date=week_end,
        ).first()

        if not meal_plan:
            return False

        return MealPlanDetail.objects.filter(
            user=user,
            plan=meal_plan,
        ).exists()

    @staticmethod
    @transaction.atomic
    def copy_week_plan(user, source_start_date, target_start_date):
        source_end_date = source_start_date + timedelta(days=6)
        target_end_date = target_start_date + timedelta(days=6)

        source_plan = MealPlan.objects.filter(
            start_date=source_start_date,
            end_date=source_end_date,
        ).first()

        if not source_plan:
            return {
                "success": False,
                "message": "Không tìm thấy thực đơn tuần nguồn",
                "data": None,
            }

        source_details = list(
            MealPlanDetail.objects.filter(
                user=user,
                plan=source_plan,
            ).select_related("dish")
        )

        if not source_details:
            return {
                "success": False,
                "message": "Tuần nguồn không có dữ liệu để sao chép",
                "data": None,
            }

        target_plan = MealPlanService.get_or_create_week_plan(
            target_start_date,
            target_end_date,
        )

        MealPlanDetail.objects.filter(
            user=user,
            plan=target_plan,
        ).delete()

        from shoppinglist.services import ShoppingListService

        ShoppingListService.delete_week_shopping_data(
            user=user,
            plan=target_plan,
        )
        ShoppingListService.delete_all_day_shopping_data_by_plan(
            user=user,
            plan=target_plan,
        )

        day_offset = (target_start_date - source_start_date).days

        created_count = MealPlanService.clone_meal_details(
            user=user,
            source_details=source_details,
            target_plan=target_plan,
            target_date_mapper=lambda source_date: source_date + timedelta(days=day_offset),
        )

        return {
            "success": True,
            "message": "Sao chép thực đơn tuần thành công",
            "data": {
                "source_start_date": source_start_date,
                "source_end_date": source_end_date,
                "target_start_date": target_start_date,
                "target_end_date": target_end_date,
                "created_count": created_count,
            },
        }

    @staticmethod
    def has_day_plan_data(user, target_date):
        week_start, week_end = MealPlanService.get_week_range(target_date)

        meal_plan = MealPlan.objects.filter(
            start_date=week_start,
            end_date=week_end,
        ).first()

        if not meal_plan:
            return False

        return MealPlanDetail.objects.filter(
            user=user,
            plan=meal_plan,
            date=target_date,
        ).exists()

    @staticmethod
    def get_copy_day_options(user, source_date, week_date=None): 
        week_date = week_date or source_date
        week_start, week_end = MealPlanService.get_week_range(week_date)

        days = []
        current = week_start
        while current <= week_end:#Lấy các ngày trong tuần của tuần đích có ngày muốn copy đến
            days.append(
                {
                    "date": current,
                    "day": current.day,
                    "month": current.month,
                    "weekday_label": MealPlanService.WEEKDAY_LABELS[current.weekday()],
                    "has_data": MealPlanService.has_day_plan_data(user, current),
                }
            )
            current += timedelta(days=1)

        return {
            "source_date": source_date,
            "source_week_start": source_date - timedelta(days=source_date.weekday()),
            "source_week_end": source_date - timedelta(days=source_date.weekday()) + timedelta(days=6),
            "week_start_date": week_start,
            "week_end_date": week_end,
            "previous_week_date": week_start - timedelta(days=7),
            "next_week_date": week_start + timedelta(days=7),
            "days": days,
        }

    @staticmethod
    @transaction.atomic
    def copy_day_plan(user, source_date, target_date):
        source_week_start, source_week_end = MealPlanService.get_week_range(source_date)
        target_week_start, target_week_end = MealPlanService.get_week_range(target_date)

        source_plan = MealPlan.objects.filter(
            start_date=source_week_start,
            end_date=source_week_end,
        ).first()

        if not source_plan:
            return {
                "success": False,
                "message": "Không tìm thấy thực đơn ngày nguồn",
                "data": None,
            }

        source_details = list(
            MealPlanDetail.objects.filter(
                user=user,
                plan=source_plan,
                date=source_date,
            ).select_related("dish")
        )

        if not source_details:
            return {
                "success": False,
                "message": "Ngày nguồn không có dữ liệu để sao chép",
                "data": None,
            }

        target_plan = MealPlanService.get_or_create_week_plan(
            target_week_start,
            target_week_end,
        )

        MealPlanDetail.objects.filter(
            user=user,
            plan=target_plan,
            date=target_date,
        ).delete()

        from shoppinglist.services import ShoppingListService

        ShoppingListService.delete_day_shopping_data(
            user=user,
            plan=target_plan,
            target_date=target_date,
        )
        ShoppingListService.delete_week_shopping_data(
            user=user,
            plan=target_plan,
        )

        created_count = MealPlanService.clone_meal_details(
            user=user,
            source_details=source_details,
            target_plan=target_plan,
            target_date_mapper=lambda _: target_date,
        )

        return {
            "success": True,
            "message": "Sao chép thực đơn ngày thành công",
            "data": {
                "source_date": source_date,
                "target_date": target_date,
                "created_count": created_count,
            },
        }
    
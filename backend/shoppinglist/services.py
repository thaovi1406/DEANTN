from datetime import timedelta

from django.db import transaction
from rest_framework.exceptions import ValidationError
from django.db.models import Sum

from home.models import DishDetail
from home.services import IngredientInputService, IngredientMergeHelper
from mealplan.services import MealPlanService
from mealplan.models import MealPlan, MealPlanDetail
from .models import ShoppingList, ShoppingItem
from inventory.models import FoodInventory


class ShoppingListService:
    @staticmethod
    def build_week_list_name(week_start, week_end):
        return f"Mua sắm tuần {week_start.strftime('%d/%m/%Y')} - {week_end.strftime('%d/%m/%Y')}"

    @staticmethod
    def build_day_list_name(target_date):
        return f"Mua sắm ngày {target_date.strftime('%d/%m/%Y')}"

    @staticmethod
    def _get_plan_by_week_range(week_start, week_end):
        return MealPlan.objects.filter(
            start_date=week_start,
            end_date=week_end,
        ).first()

    @staticmethod
    def _get_meal_details_for_week(user, plan):
        return MealPlanDetail.objects.filter(
            user=user,
            plan=plan,
        ).select_related("dish")

    @staticmethod
    def _get_meal_details_for_day(user, plan, target_date):
        return MealPlanDetail.objects.filter(
            user=user,
            plan=plan,
            date=target_date,
        ).select_related("dish")

    @staticmethod
    def _aggregate_ingredients_from_meal_details(meal_details):
        dish_ids = list(meal_details.values_list("dish_id", flat=True))
        if not dish_ids:
            return []

        aggregated_rows = (
            DishDetail.objects.filter(
                dish_id__in=dish_ids,
                ingredient__category__iexact="thực phẩm")
            .values("ingredient_id", "ingredient__ingredient_name", "unit")
            .annotate(total_quantity=Sum("quantity"))
            .order_by("ingredient__ingredient_name", "unit")
        )

        rows = [
            {
                "ingredient_id": row["ingredient_id"],
                "ingredient_name": row["ingredient__ingredient_name"],
                "quantity": row["total_quantity"] or 0,
                "unit": row["unit"] or "",
            }
            for row in aggregated_rows
        ]

        return IngredientMergeHelper.merge_rows(rows)

    @staticmethod
    def _build_shopping_list_summary(shopping_list):
        return {
            "shopping_id": shopping_list.shopping_id,
            "list_name": shopping_list.list_name,
            "list_type": shopping_list.list_type,
            "source_date": shopping_list.source_date,
            "created_date": shopping_list.created_date,
            "item_count": shopping_list.items.count(),
        }
    @staticmethod
    def _build_shopping_item_detail(item, inventory_quantity=0):
        return {
            "item_id": item.item_id,
            "ingredient_id": item.ingredient_id,
            "ingredient_name": item.ingredient.ingredient_name,
            "quantity": item.quantity,
            "unit": item.unit,
            "status": item.status,
            "inventory_quantity": inventory_quantity,
        }

    @staticmethod
    def _build_shopping_list_detail(shopping_list):
        items = list(
            shopping_list.items.select_related("ingredient")
            .order_by("status", "ingredient__ingredient_name", "item_id")
        )

        pending_items = []
        bought_items = []

        inventory_quantity_map = ShoppingListService._get_inventory_quantity_map(
            user=shopping_list.user,
            items=items,
        )

        for item in items:
            inventory_quantity = inventory_quantity_map.get(
                (item.ingredient_id, item.unit or ""),
                0,
            )

            built_item = ShoppingListService._build_shopping_item_detail(
                item,
                inventory_quantity=inventory_quantity,
            )

            if item.status == "bought":
                bought_items.append(built_item)
            else:
                pending_items.append(built_item)

        first_item = items[0] if items else None

        return {
            "shopping_id": shopping_list.shopping_id,
            "list_name": shopping_list.list_name,
            "list_type": shopping_list.list_type,
            "source_date": shopping_list.source_date,
            "created_date": shopping_list.created_date,
            "plan_id": first_item.plan_id if first_item else None,
            "pending_count": len(pending_items),
            "bought_count": len(bought_items),
            "pending_items": pending_items,
            "bought_items": bought_items,
        }

    @staticmethod
    def _find_mergeable_item(
        shopping_list,
        ingredient_name,
        unit,
        exclude_item_id=None,
    ):
        queryset = (
            ShoppingItem.objects.filter(
                shopping=shopping_list,
                ingredient__ingredient_name__iexact=(ingredient_name or "").strip(),
            )
            .select_related("ingredient")
            .order_by("item_id")
        )

        if exclude_item_id is not None:
            queryset = queryset.exclude(item_id=exclude_item_id)

        normalized_unit = IngredientMergeHelper.normalize_unit(unit)

        for existing_item in queryset:
            existing_unit = IngredientMergeHelper.normalize_unit(existing_item.unit)

            if IngredientMergeHelper.can_merge(existing_unit, normalized_unit):
                return existing_item

        return None

    @staticmethod
    def _merge_item_quantity(existing_item, quantity, unit):
        merged_result = IngredientMergeHelper.merge_two(
            quantity_a=existing_item.quantity,
            unit_a=existing_item.unit,
            quantity_b=quantity,
            unit_b=unit,
        )

        if merged_result is None:
            return None

        existing_item.quantity = merged_result["quantity"]
        existing_item.unit = merged_result["unit"]
        existing_item.save(update_fields=["quantity", "unit"])

        return existing_item

    @staticmethod
    @transaction.atomic
    def generate_week_shopping_list(user, week_start):
        week_end = week_start + timedelta(days=6)

        plan = ShoppingListService._get_plan_by_week_range(week_start, week_end)
        if not plan:
            return {
                "success": False,
                "message": "Không tìm thấy thực đơn tuần để tạo danh sách mua sắm",
                "data": None,
            }

        meal_details = ShoppingListService._get_meal_details_for_week(
            user=user,
            plan=plan,
        )
        if not meal_details.exists():
            return {
                "success": False,
                "message": "Thực đơn tuần chưa có món ăn",
                "data": None,
            }

        aggregated_items = ShoppingListService._aggregate_ingredients_from_meal_details(
            meal_details
        )
        if not aggregated_items:
            return {
                "success": False,
                "message": "Không tìm thấy nguyên liệu để tạo danh sách mua sắm",
                "data": None,
            }

        if ShoppingListService.has_week_shopping_list(user, plan):
            return {
                "success": False,
                "message": "Danh sách mua sắm thực đơn tuần này đã tồn tại",
                "data": None,
            }

        shopping_list = ShoppingList.objects.create(
            user=user,
            list_name=ShoppingListService.build_week_list_name(week_start, week_end),
            list_type="week",
            source_date=None,
        )

        ShoppingItem.objects.bulk_create(
            [
                ShoppingItem(
                    shopping=shopping_list,
                    plan=plan,
                    ingredient_id=item["ingredient_id"],
                    quantity=item["quantity"],
                    unit=item["unit"],
                    status="pending",
                )
                for item in aggregated_items
            ]
        )

        return {
            "success": True,
            "message": "Tạo danh sách mua sắm tuần thành công",
            "data": ShoppingListService._build_shopping_list_summary(shopping_list),
        }

    @staticmethod
    @transaction.atomic
    def generate_day_shopping_list(user, target_date):
        week_start, week_end = MealPlanService.get_week_range(target_date)

        plan = ShoppingListService._get_plan_by_week_range(week_start, week_end)
        if not plan:
            return {
                "success": False,
                "message": "Không tìm thấy thực đơn ngày để tạo danh sách mua sắm",
                "data": None,
            }

        meal_details = ShoppingListService._get_meal_details_for_day(
            user=user,
            plan=plan,
            target_date=target_date,
        )
        if not meal_details.exists():
            return {
                "success": False,
                "message": "Ngày này chưa có món ăn trong thực đơn",
                "data": None,
            }

        aggregated_items = ShoppingListService._aggregate_ingredients_from_meal_details(
            meal_details
        )
        if not aggregated_items:
            return {
                "success": False,
                "message": "Không tìm thấy nguyên liệu để tạo danh sách mua sắm",
                "data": None,
            }

        if ShoppingListService.has_day_shopping_list(user, plan, target_date):
            return {
                "success": False,
                "message": "Danh sách mua sắm ngày này đã tồn tại",
                "data": None,
            }

        shopping_list = ShoppingList.objects.create(
            user=user,
            list_name=ShoppingListService.build_day_list_name(target_date),
            list_type="day",
            source_date=target_date,
        )

        ShoppingItem.objects.bulk_create(
            [
                ShoppingItem(
                    shopping=shopping_list,
                    plan=plan,
                    ingredient_id=item["ingredient_id"],
                    quantity=item["quantity"],
                    unit=item["unit"],
                    status="pending",
                )
                for item in aggregated_items
            ]
        )

        return {
            "success": True,
            "message": "Tạo danh sách mua sắm ngày thành công",
            "data": ShoppingListService._build_shopping_list_summary(shopping_list),
        }

    @staticmethod
    def get_shopping_lists(user, search=""):
        queryset = ShoppingList.objects.filter(user=user).order_by("-created_date", "-shopping_id")

        if search:
            queryset = queryset.filter(list_name__icontains=search.strip())

        return {
            "shopping_lists": [
                ShoppingListService._build_shopping_list_summary(item)
                for item in queryset
            ]
        }

    @staticmethod
    def get_shopping_list_detail(user, shopping_id):
        shopping_list = ShoppingList.objects.filter(
            shopping_id=shopping_id,
            user=user,
        ).first()

        if not shopping_list:
            return {
                "success": False,
                "message": "Không tìm thấy danh sách mua sắm",
                "data": None,
            }

        return {
            "success": True,
            "message": "Lấy chi tiết danh sách mua sắm thành công",
            "data": ShoppingListService._build_shopping_list_detail(shopping_list),
        }

    @staticmethod
    @transaction.atomic
    def toggle_shopping_item_status(user, item_id):
        item = (
            ShoppingItem.objects.filter(
                item_id=item_id,
                shopping__user=user,
            )
            .select_related("shopping", "ingredient")
            .first()
        )

        if not item:
            return {
                "success": False,
                "message": "Không tìm thấy mục mua sắm",
                "data": None,
            }

        item.status = "bought" if item.status == "pending" else "pending"
        item.save(update_fields=["status"])

        return {
            "success": True,
            "message": "Cập nhật trạng thái mua sắm thành công",
            "data": {
                "item_id": item.item_id,
                "shopping_id": item.shopping_id,
                "status": item.status,
            },
        }

    @staticmethod
    def _delete_shopping_list_if_empty(shopping_list):
        if not shopping_list.items.exists():
            shopping_id = shopping_list.shopping_id
            shopping_list.delete()
            return {
                "deleted": True,
                "shopping_id": shopping_id,
            }
        return {
            "deleted": False,
            "shopping_id": shopping_list.shopping_id,
        }


    @staticmethod
    @transaction.atomic
    def delete_shopping_item(user, item_id):
        item = (
            ShoppingItem.objects.filter(
                item_id=item_id,
                shopping__user=user,
            )
            .select_related("shopping")
            .first()
        )

        if not item:
            return {
                "success": False,
                "message": "Không tìm thấy mục mua sắm",
                "data": None,
            }

        shopping_list = item.shopping
        shopping_id = item.shopping_id
        item.delete()

        delete_result = ShoppingListService._delete_shopping_list_if_empty(shopping_list)

        return {
            "success": True,
            "message": "Đã xóa danh sách mua sắm thành công",
            "data": {
                "item_id": item_id,
                "shopping_id": shopping_id,
                "shopping_deleted": delete_result["deleted"],
            },
        }

    @staticmethod
    @transaction.atomic
    def delete_shopping_list(user, shopping_id):
        shopping_list = ShoppingList.objects.filter(
            shopping_id=shopping_id,
            user=user,
        ).first()

        if not shopping_list:
            return {
                "success": False,
                "message": "Không tìm thấy danh sách mua sắm",
                "data": None,
            }

        shopping_list.delete()

        return {
            "success": True,
            "message": "Xóa danh sách mua sắm thành công",
            "data": {
                "shopping_id": shopping_id,
            },
        }

    @staticmethod
    @transaction.atomic
    def create_shopping_item(user, validated_data):
        shopping_id = validated_data["shopping_id"]
        quantity = validated_data["quantity"]
        unit = validated_data["unit"]
        ingredient_name = (validated_data.get("ingredient_name") or "").strip()
        
        from inventory.services import FoodInventoryService

        shopping_list = ShoppingList.objects.filter(
            shopping_id=shopping_id,
            user=user,
        ).first()

        if not shopping_list:
            return {
                "success": False,
                "message": "Không tìm thấy danh sách mua sắm",
                "errors": {},
                "data": None,
            }

        mergeable_item = ShoppingListService._find_mergeable_item(
            shopping_list=shopping_list,
            ingredient_name=ingredient_name,
            unit=unit,
        )

        if mergeable_item:
            try:
                FoodInventoryService._validate_inventory_metadata_from_input(
                    validated_data=validated_data,
                    matched_item=mergeable_item,
                )
            except ValidationError as exc:
                return {
                    "success": False,
                    "message": "Vui lòng kiểm tra lại thông tin",
                    "errors": exc.detail,
                    "data": None,
                }

            merged_item = ShoppingListService._merge_item_quantity(
                existing_item=mergeable_item,
                quantity=quantity,
                unit=unit,
            )
            if merged_item:
                return {
                    "success": True,
                    "message": "Thêm nguyên liệu vào danh sách mua sắm thành công",
                    "data": ShoppingListService._build_shopping_item_detail(merged_item),
                }
        
        ingredient, _, normalized_data = IngredientInputService.get_or_create_ingredient(
            validated_data
        )
        first_item = shopping_list.items.order_by("item_id").first()
        if not first_item:
            return {
                "success": False,
                "message": "Danh sách mua sắm chưa có plan để thêm mục mới",
                "data": None,
            }

        item = ShoppingItem.objects.create(
            shopping=shopping_list,
            ingredient=ingredient,
            plan=first_item.plan,
            quantity=normalized_data["quantity"],
            unit=normalized_data["unit"],
        )

        return {
            "success": True,
            "message": "Thêm nguyên liệu vào danh sách mua sắm thành công",
            "data": ShoppingListService._build_shopping_item_detail(item),
        }

    
    @staticmethod
    def _get_inventory_quantity_map(user, items):
        ingredient_ids = list({item.ingredient_id for item in items})
        units = list({item.unit for item in items})

        if not ingredient_ids:
            return {}

        inventory_rows = FoodInventory.objects.filter(
            user=user,
            ingredient_id__in=ingredient_ids,
            unit__in=units,
        ).values("ingredient_id", "unit", "quantity")

        quantity_map = {}
        for row in inventory_rows:
            key = (row["ingredient_id"], row["unit"] or "")
            quantity_map[key] = row["quantity"] or 0

        return quantity_map
    
    @staticmethod
    def _get_day_shopping_list_by_plan_and_date(user, plan, target_date):
        return ShoppingList.objects.filter(
            user=user,
            list_type="day",
            source_date=target_date,
            items__plan=plan,
        ).distinct().first()

    @staticmethod
    def _get_week_shopping_list_by_plan(user, plan):
        return ShoppingList.objects.filter(
            user=user,
            list_type="week",
            items__plan=plan,
        ).distinct().first()

    @staticmethod
    def has_day_shopping_list(user, plan, target_date):
        return ShoppingListService._get_day_shopping_list_by_plan_and_date(
            user=user,
            plan=plan,
            target_date=target_date,
        ) is not None

    @staticmethod
    def has_week_shopping_list(user, plan):
        return ShoppingListService._get_week_shopping_list_by_plan(
            user=user,
            plan=plan,
        ) is not None

    @staticmethod
    @transaction.atomic
    def delete_day_shopping_data(user, plan, target_date):
        shopping_list = ShoppingListService._get_day_shopping_list_by_plan_and_date(
            user=user,
            plan=plan,
            target_date=target_date,
        )
        if not shopping_list:
            return False

        shopping_list.items.filter(plan=plan).delete() #Xóa trong record shopping item của plan_id = plan và shopping_id = list mua sắm của target date
        #Như vậy source date là để map với ngày được tạo shopping list chứ ko nó sẽ map với cả tuần (theo plan_id)
        #Lý do là vì khi xóa plan day -> trả về plan id và user id, với 2 trường này thì shopping list chỉ check đc các record thuộc planid và user id -> xóa toàn bộ record trong plan id chứ không phải mỗi ngày muốn xóa thôi
        shopping_list.delete()
        return True

    @staticmethod
    @transaction.atomic
    def delete_week_shopping_data(user, plan): #dùng xóa list tuần (type = week)
        shopping_list = ShoppingListService._get_week_shopping_list_by_plan(
            user=user,
            plan=plan,
        )
        if not shopping_list:
            return False

        shopping_list.items.filter(plan=plan).delete()
        shopping_list.delete()
        return True

    @staticmethod
    @transaction.atomic
    def delete_all_day_shopping_data_by_plan(user, plan): #nghĩa là khi xóa một thực đơn -> xóa shopping list của thực đơn + shopping list của các ngày nằm trong thực đơn đó
        shopping_lists = ShoppingList.objects.filter(
            user=user,
            list_type="day",
            items__plan=plan,
        ).distinct()

        if not shopping_lists.exists():
            return 0

        deleted_count = shopping_lists.count()

        for shopping_list in shopping_lists:
            shopping_list.items.filter(plan=plan).delete()
            shopping_list.delete()

        return deleted_count
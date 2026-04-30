from datetime import date

from inventory.models import FoodInventory
from mealplan.models import MealPlanDetail
from shoppinglist.models import ShoppingList
from home.models import IndividualDish


class UserContextService:
    @staticmethod
    def get_today_meal_context(user, target_date=None):
        target_date = target_date or date.today()

        details = (
            MealPlanDetail.objects.filter(user=user, date=target_date)
            .select_related("dish")
            .order_by("meal_type", "plan_detail_id")
        )

        result = {
            "date": str(target_date),
            "breakfast": [],
            "lunch": [],
            "dinner": [],
            "missing_meals": [],
            "total_dishes": 0,
        }

        for detail in details:
            result[detail.meal_type].append(
                {
                    "dish_id": detail.dish.dish_id,
                    "dish_name": detail.dish.dish_name,
                    "category_name": detail.dish.category_name,
                    "calories": detail.dish.calories,
                    "cooking_time": detail.dish.cooking_time,
                    "ration": detail.dish.ration,
                }
            )

        result["total_dishes"] = (
            len(result["breakfast"]) +
            len(result["lunch"]) +
            len(result["dinner"])
        )

        if not result["breakfast"]:
            result["missing_meals"].append("breakfast")
        if not result["lunch"]:
            result["missing_meals"].append("lunch")
        if not result["dinner"]:
            result["missing_meals"].append("dinner")

        return result

    @staticmethod
    def get_inventory_context(user, limit=50):
        items = (
            FoodInventory.objects.filter(user=user)
            .select_related("ingredient")
            .order_by("ingredient__ingredient_name", "food_inventory_id")[:limit]
        )

        inventory_items = [
            {
                "ingredient_name": item.ingredient.ingredient_name,
                "group_name": item.ingredient.group_name,
                "category": item.ingredient.category,
                "quantity": item.quantity,
                "unit": item.unit,
            }
            for item in items
        ]

        group_summary = {}
        for item in inventory_items:
            key = item["group_name"] or "khác"
            group_summary[key] = group_summary.get(key, 0) + 1

        return {
            "total_items": len(inventory_items),
            "group_summary": group_summary,
            "items": inventory_items,
        }

    @staticmethod
    def get_favorite_dishes_context(user, limit=20):
        relations = (
            IndividualDish.objects.filter(user=user, is_favorite=True)
            .select_related("dish")
            .order_by("dish__dish_name")[:limit]
        )

        dishes = [
            {
                "dish_id": rel.dish.dish_id,
                "dish_name": rel.dish.dish_name,
                "category_name": rel.dish.category_name,
                "calories": rel.dish.calories,
                "cooking_time": rel.dish.cooking_time,
                "ration": rel.dish.ration,
            }
            for rel in relations
        ]

        return {
            "total_favorites": len(dishes),
            "items": dishes,
        }

    @staticmethod
    def get_recent_shopping_lists_context(user, limit=3):
        shopping_lists = (
            ShoppingList.objects.filter(user=user)
            .order_by("-created_date", "-shopping_id")[:limit]
        )

        results = []
        for shopping_list in shopping_lists:
            items = list(
                shopping_list.items.select_related("ingredient")
                .order_by("status", "ingredient__ingredient_name", "item_id")[:30]
            )

            pending_items = []
            bought_items = []

            for item in items:
                row = {
                    "ingredient_name": item.ingredient.ingredient_name,
                    "quantity": item.quantity,
                    "unit": item.unit,
                    "status": item.status,
                }

                if item.status == "bought":
                    bought_items.append(row)
                else:
                    pending_items.append(row)

            results.append(
                {
                    "shopping_id": shopping_list.shopping_id,
                    "list_name": shopping_list.list_name,
                    "list_type": shopping_list.list_type,
                    "source_date": str(shopping_list.source_date) if shopping_list.source_date else None,
                    "pending_count": len(pending_items),
                    "bought_count": len(bought_items),
                    "pending_items": pending_items,
                    "bought_items": bought_items,
                }
            )

        return results

    @staticmethod
    def get_full_context(user):
        return {
            "today_meal": UserContextService.get_today_meal_context(user),
            "inventory": UserContextService.get_inventory_context(user, limit=50),
            "favorite_dishes": UserContextService.get_favorite_dishes_context(user, limit=20),
            "shopping_lists": UserContextService.get_recent_shopping_lists_context(user, limit=3),
        }

    @staticmethod
    def build_user_context(user, intent: str):
        if intent == "today_meal":
            return {
                "today_meal": UserContextService.get_today_meal_context(user),
            }

        if intent == "inventory":
            return {
                "inventory": UserContextService.get_inventory_context(user, limit=50),
            }

        if intent == "favorite_dishes":
            return {
                "favorite_dishes": UserContextService.get_favorite_dishes_context(user, limit=20),
            }

        if intent == "shopping":
            return {
                "shopping_lists": UserContextService.get_recent_shopping_lists_context(user, limit=3),
            }

        if intent == "cook_suggestion":
            return {
                "today_meal": UserContextService.get_today_meal_context(user),
                "inventory": UserContextService.get_inventory_context(user, limit=50),
                "favorite_dishes": UserContextService.get_favorite_dishes_context(user, limit=20),
                "shopping_lists": UserContextService.get_recent_shopping_lists_context(user, limit=2),
            }

        if intent == "shopping_inventory_compare":
            return {
                "inventory": UserContextService.get_inventory_context(user, limit=50),
                "shopping_lists": UserContextService.get_recent_shopping_lists_context(user, limit=3),
            }

        if intent == "favorite_inventory_match":
            return {
                "inventory": UserContextService.get_inventory_context(user, limit=50),
                "favorite_dishes": UserContextService.get_favorite_dishes_context(user, limit=20),
            }

        return UserContextService.get_full_context(user)
from django.urls import path

from .views import (
    meal_plan_week_view,
    meal_plan_dish_list_view,
    meal_plan_assign_dish_view,
    meal_plan_detail_delete_view,
    meal_plan_week_clear_view,
    meal_plan_day_clear_view,
    meal_plan_copy_week_options_view,
    meal_plan_copy_week_view,
    meal_plan_copy_day_options_view,
    meal_plan_copy_day_view,
)

urlpatterns = [
    path("meal-plan/week/", meal_plan_week_view, name="meal-plan-week"),
    path("meal-plan/dishes/", meal_plan_dish_list_view, name="meal-plan-dish-list"),
    path("meal-plan/assign/", meal_plan_assign_dish_view, name="meal-plan-assign-dish"),
    path("meal-plan/detail/delete/", meal_plan_detail_delete_view, name="meal-plan-detail-delete"),
    path("meal-plan/week/clear/", meal_plan_week_clear_view, name="meal-plan-week-clear"),
    path("meal-plan/day/clear/", meal_plan_day_clear_view, name="meal-plan-day-clear"),
    path("meal-plan/copy-week/options/", meal_plan_copy_week_options_view, name="meal-plan-copy-week-options"),
    path("meal-plan/copy-week/", meal_plan_copy_week_view, name="meal-plan-copy-week"),
    path("meal-plan/copy-day/options/", meal_plan_copy_day_options_view, name="meal-plan-copy-day-options"),
    path("meal-plan/copy-day/", meal_plan_copy_day_view, name="meal-plan-copy-day"),
]
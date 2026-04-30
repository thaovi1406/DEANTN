from django.urls import path

from .views import (
    shopping_list_view,
    shopping_list_generate_week_view,
    shopping_list_generate_day_view,
    shopping_list_detail_view,
    shopping_list_delete_view,
    shopping_item_toggle_status_view,
    shopping_item_delete_view,
    shopping_item_create_view,
)

urlpatterns = [
    path("shopping/shopping-lists/", shopping_list_view, name="shopping-list"),
    path("shopping/shopping-lists/generate/week/", shopping_list_generate_week_view, name="shopping-list-generate-week"),
    path("shopping/shopping-lists/generate/day/", shopping_list_generate_day_view, name="shopping-list-generate-day"),
    path("shopping/shopping-lists/detail/", shopping_list_detail_view, name="shopping-list-detail"),
    path("shopping/shopping-lists/delete/", shopping_list_delete_view, name="shopping-list-delete"),
    path("shopping/shopping-lists/items/toggle-status/", shopping_item_toggle_status_view, name="shopping-item-toggle-status"),
    path("shopping/shopping-lists/items/delete/", shopping_item_delete_view, name="shopping-item-delete"),
    path("shopping/shopping-lists/items/create/", shopping_item_create_view, name="shopping-item-create"),
]
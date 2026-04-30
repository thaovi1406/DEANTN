from django.urls import path

from .views import (
    food_inventory_list_view,
    food_inventory_detail_view,
    food_inventory_create_view,
    food_inventory_delete_view,
    add_bought_items_to_inventory_view,
    check_bought_items_to_inventory_view,
    food_inventory_update_quantity_view
)

urlpatterns = [
    path("inventory/", food_inventory_list_view, name="food-inventory-list"),
    path("inventory/detail/", food_inventory_detail_view, name="food-inventory-detail"),
    path("inventory/create/", food_inventory_create_view, name="food-inventory-create"),
    path("inventory/delete/", food_inventory_delete_view, name="food-inventory-delete"),
    path("inventory/add-bought-items/", add_bought_items_to_inventory_view, name="food-inventory-add-bought-items",),
    path( "inventory/check-bought-items/", check_bought_items_to_inventory_view,name="check_bought_items_to_inventory",),
    path("inventory/update-quantity/", food_inventory_update_quantity_view, name="food-inventory-update-quantity",
),]
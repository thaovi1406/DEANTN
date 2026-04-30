from django.urls import path
from .views import home_dish_list_view, toggle_favorite_view, dish_detail_view, individual_dish_list_view,individual_dish_delete_view, individual_dish_list_view,individual_dish_create_view,individual_dish_update_view

urlpatterns = [
    path("home/dishes/", home_dish_list_view, name="home-dish-list"),
    path("home/dishes/<int:dish_id>/favorite/", toggle_favorite_view, name="toggle-favorite"),
    path("home/dishes/<int:dish_id>/", dish_detail_view, name="dish-detail"),
    path("home/individual/dishes/", individual_dish_list_view, name="individual-dish-list"),
    path("home/individual/dishes/create/", individual_dish_create_view, name="individual-dish-create"),
    path("home/individual/dishes/<int:dish_id>/update/", individual_dish_update_view, name="individual-dish-update"),
    path("home/individual/dishes/<int:dish_id>/", individual_dish_delete_view,name="individual-dish-delete",),
]
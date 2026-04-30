from django.conf import settings
from django.db import models

from home.models import Ingredient
from mealplan.models import MealPlan
    
class ShoppingList(models.Model):
    LIST_TYPE_CHOICES = [
        ("week", "Theo tuần"),
        ("day", "Theo ngày"),
    ]

    shopping_id = models.AutoField(primary_key=True)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="shopping_lists",
    )

    list_name = models.CharField(max_length=255)
    list_type = models.CharField(max_length=10, choices=LIST_TYPE_CHOICES)
    created_date = models.DateTimeField(auto_now_add=True)
    source_date = models.DateField(null=True, blank=True)
    class Meta:
        db_table = "shopping_list"
        indexes = [
            models.Index(fields=["user", "list_type"]),
            models.Index(fields=["user", "created_date"]),
        ]

    def __str__(self):
        return self.list_name


class ShoppingItem(models.Model):
    STATUS_CHOICES = [
        ("pending", "Chưa mua"),
        ("bought", "Đã mua"),
    ]

    item_id = models.AutoField(primary_key=True)

    shopping = models.ForeignKey(
        ShoppingList,
        on_delete=models.CASCADE,
        related_name="items",
    )

    plan = models.ForeignKey(
        MealPlan,
        on_delete=models.CASCADE,
        related_name="shopping_items",
    )

    ingredient = models.ForeignKey(
        Ingredient,
        on_delete=models.CASCADE,
        related_name="shopping_items",
    )

    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    unit = models.CharField(max_length=20, blank=True, default="")
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="pending",
    )

    class Meta:
        db_table = "shopping_item"
        indexes = [
            models.Index(fields=["shopping", "status"]),
            models.Index(fields=["plan", "ingredient"]),
        ]

    def __str__(self):
        return f"{self.shopping.list_name} - {self.ingredient.ingredient_name}"
    
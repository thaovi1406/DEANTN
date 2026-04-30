from django.conf import settings
from django.db import models

from home.models import Ingredient
    

class FoodInventory(models.Model):
    food_inventory_id = models.AutoField(primary_key=True)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="food_inventories",
    )

    ingredient = models.ForeignKey(
        Ingredient,
        on_delete=models.CASCADE,
        related_name="food_inventories",
    )

    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    unit = models.CharField(max_length=20, blank=True, default="")

    class Meta:
        db_table = "food_inventory"
        indexes = [
            models.Index(fields=["user", "ingredient"]),
            models.Index(fields=["user", "ingredient", "unit"]),
        ]
        unique_together = ("user", "ingredient", "unit")

    def __str__(self):
        return f"{self.user} - {self.ingredient.ingredient_name} - {self.quantity} {self.unit}"
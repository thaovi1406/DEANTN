from django.conf import settings
from django.db import models

from home.models import Dish, Ingredient


class MealPlan(models.Model):
    plan_id = models.AutoField(primary_key=True)
    created_date = models.DateTimeField(auto_now_add=True)
    start_date = models.DateField()
    end_date = models.DateField()

    class Meta:
        db_table = "meal_plan"
        unique_together = ("start_date", "end_date")

    def __str__(self):
        return f"{self.start_date} - {self.end_date}"


class MealPlanDetail(models.Model):
    MEAL_TYPE_CHOICES = [
        ("breakfast", "Sáng"),
        ("lunch", "Trưa"),
        ("dinner", "Tối"),
    ]

    plan_detail_id = models.AutoField(primary_key=True)

    plan = models.ForeignKey(
        MealPlan,
        on_delete=models.CASCADE,
        related_name="details",
    )

    dish = models.ForeignKey(
        Dish,
        on_delete=models.CASCADE,
        related_name="meal_plan_details",
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="meal_plan_details",
    )

    date = models.DateField()
    meal_type = models.CharField(max_length=20, choices=MEAL_TYPE_CHOICES)

    class Meta:
        db_table = "meal_plan_detail"
        unique_together = ("plan", "user", "date", "meal_type", "dish")
        indexes = [
            models.Index(fields=["user", "date"]),
            models.Index(fields=["plan", "date"]),
        ]

    def __str__(self):
        return f"{self.user} - {self.date} - {self.meal_type}"
    

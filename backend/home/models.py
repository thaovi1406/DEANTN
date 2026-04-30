
from django.conf import settings
from django.db import models

class Dish(models.Model):
    # Khai báo các lựa chọn cho Category
    CATEGORY_CHOICES = [
        ('Main Dish', 'Món chính'),
        ('Side Dish', 'Món phụ'),
        ('Salad', 'Salad'),
        ('Soup', 'Canh/Súp'),
        ('Dessert', 'Tráng miệng'),
        ('Drink', 'Đồ uống'),
    ]

    dish_id = models.AutoField(primary_key=True)
    dish_name = models.CharField(max_length=50)
    cooking_time = models.IntegerField()
    ration = models.IntegerField()
    image = models.ImageField(upload_to="dishes/", null=True, blank=True)
    
    category_name = models.CharField(
        max_length=50, 
        choices=CATEGORY_CHOICES, 
        default='Main Dish'
    )
    calories = models.IntegerField(
        null=True, 
        blank=True, 
        help_text="Lượng calo của món ăn (kcal)"
    )
    is_system = models.BooleanField(
        default=False,
        help_text="Đánh dấu đây là món mặc định của hệ thống"
    )
    source_dish = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="cloned_dishes",
        help_text="Món gốc của hệ thống nếu đây là món copy cho user"
    )
    class Meta:
        db_table = "dish"

    def __str__(self):
        return self.dish_name
        


class DishMethod(models.Model):
    dish_method_id = models.AutoField(primary_key=True)
    dish = models.ForeignKey(
        Dish,
        on_delete=models.CASCADE,
        related_name="methods"
    )
    step_number = models.IntegerField()
    instruction = models.TextField()

    class Meta:
        db_table = "dish_method"
        ordering = ["step_number"]

    def __str__(self):
        return f"{self.dish.dish_name} - Step {self.step_number}"



class Ingredient(models.Model):
    # Định nghĩa các lựa chọn cho Group Name
    GROUP_CHOICES = [
        ('rau củ', 'Rau củ'),
        ('thịt', 'Thịt'),
        ('cá-hải sản', 'Cá - Hải sản'),
        ('sữa-trứng', 'Sữa - Trứng'),
        ('trái cây', 'Trái cây'),
        ('gia vị', 'Gia vị'),
        ('khác', 'Khác'),
    ]

    # Định nghĩa các lựa chọn cho Category
    CATEGORY_CHOICES = [
        ('thực phẩm', 'Thực phẩm'),
        ('gia vị', 'Gia vị'),
    ]

    ingredient_id = models.AutoField(primary_key=True)
    ingredient_name = models.CharField(max_length=50)
    
    group_name = models.CharField(
        max_length=50, 
        choices=GROUP_CHOICES, 
        default='khác'
    )
    
    category = models.CharField(
        max_length=50, 
        choices=CATEGORY_CHOICES, 
        default='thực phẩm'
    )
    is_system = models.BooleanField(default=False)

    class Meta:
        db_table = "ingredient"

    def __str__(self):
        return self.ingredient_name

class DishDetail(models.Model):
    dish_detail_id = models.AutoField(primary_key=True)
    ingredient = models.ForeignKey(
        Ingredient,
        on_delete=models.CASCADE,
        related_name="dish_details"
    )
    dish = models.ForeignKey(
        Dish,
        on_delete=models.CASCADE,
        related_name="dish_details"
    )
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    unit = models.CharField(max_length=10)

    class Meta:
        db_table = "dish_detail"

    def __str__(self):
        return f"{self.dish.dish_name} - {self.ingredient.ingredient_name}"


class IndividualDish(models.Model):
    individual_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="individual_dishes"
    )
    dish = models.ForeignKey(
        Dish,
        on_delete=models.CASCADE,
        related_name="individual_dishes"
    )
    is_favorite = models.BooleanField(
        default=False,
        help_text="True: món yêu thích, False: món user tự tạo/thêm để quản lý"
    )

    class Meta:
        db_table = "individual_dish"
        unique_together = ("user", "dish")

    def __str__(self):
        relation_type = "Favorite" if self.is_favorite else "Owned"
        return f"{self.user.username} - {self.dish.dish_name} ({relation_type})"
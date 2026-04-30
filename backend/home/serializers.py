from rest_framework import serializers

from .models import Dish, Ingredient


class HomeDishQuerySerializer(serializers.Serializer):
    search = serializers.CharField(required=False, allow_blank=True)
    category = serializers.CharField(required=False, allow_blank=True)
    favorite_only = serializers.BooleanField(required=False, default=False)

    def validate_category(self, value):
        if not value:
            return value

        valid_categories = [choice[0] for choice in Dish.CATEGORY_CHOICES]
        if value != "all" and value not in valid_categories:
            raise serializers.ValidationError("Danh mục không hợp lệ")

        return value


class HomeDishItemSerializer(serializers.Serializer):
    dish_id = serializers.IntegerField()
    dish_name = serializers.CharField()
    cooking_time = serializers.IntegerField()
    ration = serializers.IntegerField()
    image = serializers.CharField(allow_null=True)
    category_name = serializers.CharField()
    category_label = serializers.CharField()
    is_favorite = serializers.BooleanField()


class ToggleFavoriteResponseSerializer(serializers.Serializer):
    dish_id = serializers.IntegerField()
    is_favorite = serializers.BooleanField()


class DishIngredientItemSerializer(serializers.Serializer):
    ingredient_id = serializers.IntegerField()
    display_text = serializers.CharField()


class DishIngredientGroupSerializer(serializers.Serializer):
    group_name = serializers.CharField()
    items = DishIngredientItemSerializer(many=True)


class DishMethodItemSerializer(serializers.Serializer):
    step_number = serializers.IntegerField()
    instruction = serializers.CharField()


class DishDetailResponseSerializer(serializers.Serializer):
    dish_id = serializers.IntegerField()
    dish_name = serializers.CharField()
    image = serializers.CharField(allow_null=True)
    cooking_time = serializers.IntegerField()
    ration = serializers.IntegerField()
    calories = serializers.IntegerField(allow_null=True)
    category_name = serializers.CharField()
    category_label = serializers.CharField()
    is_favorite = serializers.BooleanField()
    ingredients = DishIngredientGroupSerializer(many=True)
    methods = DishMethodItemSerializer(many=True)

class ToggleIndividualFavoriteResponseSerializer(serializers.Serializer):
    source_dish_id = serializers.IntegerField()
    individual_dish_id = serializers.IntegerField(allow_null=True)
    is_favorite = serializers.BooleanField()

class IndividualDishQuerySerializer(serializers.Serializer):
    search = serializers.CharField(required=False, allow_blank=True)
    category = serializers.CharField(required=False, allow_blank=True)

    def validate_category(self, value):
        if not value:
            return value

        valid_categories = [choice[0] for choice in Dish.CATEGORY_CHOICES]
        if value != "all" and value not in valid_categories:
            raise serializers.ValidationError("Danh mục không hợp lệ")

        return value
    

class DishMethodInputSerializer(serializers.Serializer):
    step_number = serializers.IntegerField(required=False, min_value=1)
    instruction = serializers.CharField(required=True, allow_blank=False)

    def validate_instruction(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Vui lòng điền đầy đủ thông tin")
        return value


class DishIngredientInputSerializer(serializers.Serializer):
    ingredient_name = serializers.CharField(required=True, allow_blank=False)
    group_name = serializers.ChoiceField(
        choices=Ingredient.GROUP_CHOICES,
        required=True
    )
    category = serializers.ChoiceField(
        choices=Ingredient.CATEGORY_CHOICES,
        required=True
    )
    quantity = serializers.IntegerField(required=True, min_value=1)
    unit = serializers.CharField(required=True, allow_blank=False)


class UpsertIndividualDishSerializer(serializers.Serializer):
    dish_name = serializers.CharField(required=True, allow_blank=False)
    cooking_time = serializers.IntegerField(required=True, min_value=1)
    ration = serializers.IntegerField(required=True, min_value=1)
    calories = serializers.IntegerField(required=False, allow_null=True, min_value=0)
    category_name = serializers.ChoiceField(
        choices=Dish.CATEGORY_CHOICES,
        required=True
    )
    image = serializers.ImageField(required=False, allow_null=True)
    ingredients = DishIngredientInputSerializer(many=True, required=True)
    methods = DishMethodInputSerializer(many=True, required=True)

    def validate_dish_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Vui lòng điền đầy đủ thông tin")
        return value

    def validate_ingredients(self, value):
        if not value:
            raise serializers.ValidationError("Vui lòng điền đầy đủ thông tin")
        return value

    def validate_methods(self, value):
        if not value:
            raise serializers.ValidationError("Vui lòng điền đầy đủ thông tin")
        return value


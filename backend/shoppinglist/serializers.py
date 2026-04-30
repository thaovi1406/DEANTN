from rest_framework import serializers

from home.models import Ingredient


class ShoppingListQuerySerializer(serializers.Serializer):
    search = serializers.CharField(required=False, allow_blank=True)

    def validate_search(self, value):
        return (value or "").strip()


class GenerateShoppingListWeekSerializer(serializers.Serializer):
    start_date = serializers.DateField(required=True)


class GenerateShoppingListDaySerializer(serializers.Serializer):
    date = serializers.DateField(required=True)


class ShoppingListDetailQuerySerializer(serializers.Serializer):
    shopping_id = serializers.IntegerField(required=True)

    def validate_shopping_id(self, value):
        if value <= 0:
            raise serializers.ValidationError("Danh sách mua sắm không hợp lệ")
        return value


class ShoppingListDeleteSerializer(serializers.Serializer):
    shopping_id = serializers.IntegerField(required=True)

    def validate_shopping_id(self, value):
        if value <= 0:
            raise serializers.ValidationError("Danh sách mua sắm không hợp lệ")
        return value


class ShoppingItemToggleStatusSerializer(serializers.Serializer):
    item_id = serializers.IntegerField(required=True)

    def validate_item_id(self, value):
        if value <= 0:
            raise serializers.ValidationError("Mục mua sắm không hợp lệ")
        return value


class ShoppingItemDeleteSerializer(serializers.Serializer):
    item_id = serializers.IntegerField(required=True)

    def validate_item_id(self, value):
        if value <= 0:
            raise serializers.ValidationError("Mục mua sắm không hợp lệ")
        return value


class IngredientFormSerializer(serializers.Serializer):
    ingredient_name = serializers.CharField(required=True, allow_blank=False)
    group_name = serializers.ChoiceField(
        choices=Ingredient.GROUP_CHOICES,
        required=True,
    )
    category = serializers.ChoiceField(
        choices=Ingredient.CATEGORY_CHOICES,
        required=True,
    )
    quantity = serializers.IntegerField(required=True, min_value=1)
    unit = serializers.CharField(required=True, allow_blank=False)

    def validate_ingredient_name(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("Vui lòng điền đầy đủ thông tin")
        return value

    def validate_unit(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("Vui lòng điền đầy đủ thông tin")
        return value

    def validate(self, attrs):
        required_fields = [
            "ingredient_name",
            "group_name",
            "category",
            "quantity",
            "unit",
        ]

        for field in required_fields:
            value = attrs.get(field, None)
            if value is None:
                raise serializers.ValidationError("Vui lòng điền đầy đủ thông tin")
            if isinstance(value, str) and not value.strip():
                raise serializers.ValidationError("Vui lòng điền đầy đủ thông tin")

        return attrs


class ShoppingItemCreateSerializer(IngredientFormSerializer):
    shopping_id = serializers.IntegerField(required=True)

    def validate_shopping_id(self, value):
        if value <= 0:
            raise serializers.ValidationError("Danh sách mua sắm không hợp lệ")
        return value


class ShoppingItemUpdateSerializer(IngredientFormSerializer):
    item_id = serializers.IntegerField(required=True)

    def validate_item_id(self, value):
        if value <= 0:
            raise serializers.ValidationError("Mục mua sắm không hợp lệ")
        return value
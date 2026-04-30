from rest_framework import serializers

from home.models import Ingredient


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
    quantity = serializers.DecimalField(
        required=True,
        min_value=1,
        max_digits=10,
        decimal_places=2,
    )
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


class FoodInventoryQuerySerializer(serializers.Serializer):
    search = serializers.CharField(required=False, allow_blank=True)
    group_name = serializers.CharField(required=False, allow_blank=True)

    def validate_search(self, value):
        return (value or "").strip()

    def validate_group_name(self, value):
        value = (value or "").strip()
        if not value:
            return value

        valid_groups = [choice[0] for choice in Ingredient.GROUP_CHOICES]
        if value != "all" and value not in valid_groups:
            raise serializers.ValidationError("Nhóm nguyên liệu không hợp lệ")
        return value


class FoodInventoryDetailSerializer(serializers.Serializer):
    food_inventory_id = serializers.IntegerField(required=True)

    def validate_food_inventory_id(self, value):
        if value <= 0:
            raise serializers.ValidationError("Thực phẩm không hợp lệ")
        return value


class FoodInventoryCreateSerializer(IngredientFormSerializer):
    pass



class FoodInventoryDeleteSerializer(serializers.Serializer):
    food_inventory_id = serializers.IntegerField(required=True)

    def validate_food_inventory_id(self, value):
        if value <= 0:
            raise serializers.ValidationError("Thực phẩm không hợp lệ")
        return value


class AddBoughtItemsToInventorySerializer(serializers.Serializer):
    shopping_id = serializers.IntegerField(required=True)
    

    def validate_shopping_id(self, value):
        if value <= 0:
            raise serializers.ValidationError("Danh sách mua sắm không hợp lệ")
        return value
    

class FoodInventoryUpdateQuantitySerializer(serializers.Serializer):
    food_inventory_id = serializers.IntegerField(required=True)
    quantity = serializers.DecimalField(
        required=True,
        min_value=1,
        max_digits=10,
        decimal_places=2,
    )
    unit = serializers.CharField(required=True, allow_blank=False)

    def validate_food_inventory_id(self, value):
        if value <= 0:
            raise serializers.ValidationError("Thực phẩm không hợp lệ")
        return value

    def validate_unit(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("Vui lòng điền đầy đủ thông tin")
        return value
from datetime import date

from rest_framework import serializers

from .models import MealPlanDetail, Ingredient


class MealPlanWeekQuerySerializer(serializers.Serializer):
    date = serializers.DateField(required=False)

    def validate_date(self, value):
        return value or date.today()


class MealPlanDishQuerySerializer(serializers.Serializer):
    search = serializers.CharField(required=False, allow_blank=True)

    def validate_search(self, value):
        return value.strip()


class AssignMealPlanDishSerializer(serializers.Serializer):
    dish_id = serializers.IntegerField(required=True)
    date = serializers.DateField(required=True)
    meal_type = serializers.ChoiceField(
        choices=MealPlanDetail.MEAL_TYPE_CHOICES,
        required=True,
    )

    def validate_dish_id(self, value):
        if value <= 0:
            raise serializers.ValidationError("Món ăn không hợp lệ")
        return value


class DeleteMealPlanDetailSerializer(serializers.Serializer):
    plan_detail_id = serializers.IntegerField(required=True)

    def validate_plan_detail_id(self, value):
        if value <= 0:
            raise serializers.ValidationError("Dữ liệu không hợp lệ")
        return value


class ClearMealPlanWeekSerializer(serializers.Serializer):
    start_date = serializers.DateField(required=True) #start date của tuần muốn xóa


class CopyMealPlanWeekOptionsQuerySerializer(serializers.Serializer):
    source_start_date = serializers.DateField(required=True) #lấy các lựa chọn trong tháng (month_date)
    month_date = serializers.DateField(required=False) 

    def validate_month_date(self, value): #nếu không truyền vào giá trị thì sẽ chọn tháng hiện tại
        return value or date.today()


class CopyMealPlanWeekSerializer(serializers.Serializer):
    source_start_date = serializers.DateField(required=True)
    target_start_date = serializers.DateField(required=True)

    def validate(self, attrs):
        if attrs["source_start_date"] == attrs["target_start_date"]:
            raise serializers.ValidationError("Tuần đích phải khác tuần nguồn")
        return attrs


class CopyMealPlanDayOptionsQuerySerializer(serializers.Serializer):
    source_date = serializers.DateField(required=True) #Lấy option các ngày trong tuần (week_date)
    week_date = serializers.DateField(required=False)

    def validate_week_date(self, value):
        return value or date.today()


class CopyMealPlanDaySerializer(serializers.Serializer):
    source_date = serializers.DateField(required=True)
    target_date = serializers.DateField(required=True)

    def validate(self, attrs):
        if attrs["source_date"] == attrs["target_date"]:
            raise serializers.ValidationError("Ngày đích phải khác ngày nguồn")
        return attrs
    
class ClearMealPlanDaySerializer(serializers.Serializer):
    date = serializers.DateField(required=True)




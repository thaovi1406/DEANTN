export interface IngredientItem {
  ingredient_id: number;
  display_text: string;
}

export interface IngredientGroup {
  group_name: string;
  items: IngredientItem[];
}

export interface MethodItem {
  step_number: number;
  instruction: string;
}

export interface DishDetail {
  dish_id: number;
  dish_name: string;
  image: string | null;
  cooking_time: number;
  ration: number;
  calories: number | null;
  category_name: string;
  category_label: string;
  is_favorite: boolean;
  ingredients: IngredientGroup[];
  methods: MethodItem[];
}

export interface DishDetailResponse {
  message: string;
  data: DishDetail;
}

export interface ToggleFavoriteResponse {
  message: string;
  data: {
    dish_id: number;
    is_favorite: boolean;
  };
}
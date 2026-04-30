import React from "react";
import { useLocalSearchParams } from "expo-router";
import IndividualDishFormScreen from "@/src/screen/IndividualDishFormScreen";

export default function EditIndividualDishRoute() {
  const params = useLocalSearchParams<{ dishId?: string }>();
  const dishId = params.dishId ? Number(params.dishId) : undefined;

  return <IndividualDishFormScreen mode="edit" dishId={dishId} />;
}
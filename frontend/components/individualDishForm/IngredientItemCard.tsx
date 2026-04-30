import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  text: string;
  onDelete: () => void;
};

export default function IngredientItemCard({ text, onDelete }: Props) {
  return (
    <View style={styles.item}>
      <Text style={styles.text}>{text}</Text>

      <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
        <Ionicons name="remove-circle" size={18} color="#5D9722" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    minHeight: 44,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginTop: 12,
  },
  text: {
    flex: 1,
    marginLeft: 10,
    color: "#2F2F2F",
    fontSize: 15,
  },
  deleteButton: {
    marginLeft: 8,
  },
});
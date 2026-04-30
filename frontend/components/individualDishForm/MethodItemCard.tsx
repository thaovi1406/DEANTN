import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  stepNumber: number;
  instruction: string;
  onDelete: () => void;
};

export default function MethodItemCard({
  stepNumber,
  instruction,
  onDelete,
}: Props) {
  return (
    <View style={styles.item}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepText}>{stepNumber}</Text>
      </View>

      <Text style={styles.text}>{instruction}</Text>

      <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
        <Ionicons name="remove-circle" size={18} color="#5D9722" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    minHeight: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginTop: 12,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#5D9722",
    justifyContent: "center",
    alignItems: "center",
  },
  stepText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
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
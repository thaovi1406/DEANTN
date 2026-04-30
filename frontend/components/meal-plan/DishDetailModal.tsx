import React from "react";
import { Modal, SafeAreaView, StyleSheet, View } from "react-native";
import DishDetailContent from "@/components/home/DishDetailContent";
import { useDishDetailModalUI } from "@/src/hooks/useDishDetailModalUI";

type Props = {
  visible: boolean;
  dishId: number | null;
  onClose: () => void;
};

export default function DishDetailModal({
  visible,
  dishId,
  onClose,
}: Props) {
  const {
    dish,
    loading,
    generalError,
    retry,
    onToggleFavorite,
  } = useDishDetailModalUI(dishId, visible);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          <DishDetailContent
            dish={dish}
            loading={loading}
            generalError={generalError}
            onBack={onClose}
            onToggleFavorite={onToggleFavorite}
            onRetry={retry}
            isModal
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
});
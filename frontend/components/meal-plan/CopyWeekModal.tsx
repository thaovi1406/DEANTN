import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { CopyWeekOptionItem } from "@/src/api/mealPlanApi";

function formatDateLabel(dateString?: string | null) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

function formatWeekLabel(startDate?: string | null, endDate?: string | null) {
  if (!startDate || !endDate) return "";
  return `${formatDateLabel(startDate)} - ${formatDateLabel(endDate)}`;
}

function CopyWeekCard({
  styles,
  item,
  selected,
  isDisabled,
  onPress,
}: {
  styles: any;
  item: CopyWeekOptionItem;
  selected: boolean;
  isDisabled: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.copyTargetCard,
        selected ? styles.copyTargetCardSelected : null,
        isDisabled ? styles.copyTargetCardDisabled : null,
      ]}
      onPress={onPress}
      activeOpacity={isDisabled ? 1 : 0.85}
      disabled={isDisabled}
    >
      <Text
        style={[
          styles.copyTargetTitle,
          isDisabled ? styles.copyTargetTextDisabled : null,
        ]}
      >
        TUẦN
      </Text>

      <Text
        style={[
          styles.copyTargetValue,
          isDisabled ? styles.copyTargetTextDisabled : null,
        ]}
      >
        {formatWeekLabel(item.start_date, item.end_date)}
      </Text>

      {isDisabled ? (
        <Text style={styles.copyDisabledHint}>Tuần nguồn</Text>
      ) : null}
    </TouchableOpacity>
  );
}

type Props = {
  styles: any;
  visible: boolean;
  loading: boolean;
  sourceStartDate: string | null;
  sourceEndDate: string | null;
  monthRangeLabel: string;
  weeks: CopyWeekOptionItem[];
  selectedTargetStartDate: string | null;
  generalError: string;
  targetError: string;
  onClose: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectWeek: (startDate: string) => void;
  onSubmit: () => void;
};

export default function CopyWeekModal({
  styles,
  visible,
  loading,
  sourceStartDate,
  sourceEndDate,
  monthRangeLabel,
  weeks,
  selectedTargetStartDate,
  generalError,
  targetError,
  onClose,
  onPrevMonth,
  onNextMonth,
  onSelectWeek,
  onSubmit,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalCardMedium} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tạo bản sao thực đơn</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={30} color="#5D9625" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Sao chép từ</Text>
            <Text style={styles.infoValue}>
              {formatWeekLabel(sourceStartDate, sourceEndDate)}
            </Text>
          </View>

          <Text style={styles.sectionLabel}>Chọn tuần đích</Text>

          <View style={styles.rangeSwitcher}>
            <TouchableOpacity style={styles.circleButton} onPress={onPrevMonth}>
              <Ionicons name="chevron-back" size={22} color="#5D9625" />
            </TouchableOpacity>

            <Text style={styles.rangeLabel}>{monthRangeLabel}</Text>

            <TouchableOpacity style={styles.circleButton} onPress={onNextMonth}>
              <Ionicons name="chevron-forward" size={22} color="#5D9625" />
            </TouchableOpacity>
          </View>

          {generalError ? <Text style={styles.fieldErrorText}>{generalError}</Text> : null}

          <View style={styles.copyWeekGrid}>
            {weeks.map((item) => {
              const isDisabled = item.start_date === sourceStartDate;

              return (
                <CopyWeekCard
                  key={item.start_date}
                  styles={styles}
                  item={item}
                  selected={selectedTargetStartDate === item.start_date}
                  isDisabled={isDisabled}
                  onPress={() => {
                    if (isDisabled) return;
                    onSelectWeek(item.start_date);
                  }}
                />
              );
            })}
          </View>

          {targetError ? <Text style={styles.fieldErrorText}>{targetError}</Text> : null}

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Sao chép tuần</Text>
            )}
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
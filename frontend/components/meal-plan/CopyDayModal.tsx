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
import type { CopyDayOptionItem } from "@/src/api/mealPlanApi";

function formatDateLabel(dateString?: string | null) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

function CopyDayCard({
  styles,
  item,
  selected,
  isDisabled,
  onPress,
}: {
  styles: any;
  item: CopyDayOptionItem;
  selected: boolean;
  isDisabled: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.copyDayCard,
        selected ? styles.copyTargetCardSelected : null,
        isDisabled ? styles.copyTargetCardDisabled : null,
      ]}
      onPress={onPress}
      activeOpacity={isDisabled ? 1 : 0.85}
      disabled={isDisabled}
    >
      <Text
        style={[
          styles.copyDayMonth,
          isDisabled ? styles.copyTargetTextDisabled : null,
        ]}
      >
        THÁNG {item.month}
      </Text>

      <Text
        style={[
          styles.copyDayNumber,
          isDisabled ? styles.copyTargetTextDisabled : null,
        ]}
      >
        {item.day}
      </Text>

      <Text
        style={[
          styles.copyDayWeekday,
          isDisabled ? styles.copyTargetTextDisabled : null,
        ]}
      >
        {item.weekday_label}
      </Text>

      {isDisabled ? (
        <Text style={styles.copyDisabledHint}>Ngày nguồn</Text>
      ) : null}
    </TouchableOpacity>
  );
}

type Props = {
  styles: any;
  visible: boolean;
  loading: boolean;
  sourceDate: string | null;
  weekLabel: string;
  days: CopyDayOptionItem[];
  selectedTargetDate: string | null;
  generalError: string;
  targetError: string;
  onClose: () => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onSelectDate: (date: string) => void;
  onSubmit: () => void;
};


export default function CopyDayModal({
  styles,
  visible,
  loading,
  sourceDate,
  weekLabel,
  days,
  selectedTargetDate,
  generalError,
  targetError,
  onClose,
  onPrevWeek,
  onNextWeek,
  onSelectDate,
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
            <Text style={styles.infoValue}>{formatDateLabel(sourceDate)}</Text>
          </View>

          <Text style={styles.sectionLabel}>Chọn ngày đích</Text>

          <View style={styles.rangeSwitcher}>
            <TouchableOpacity style={styles.circleButton} onPress={onPrevWeek}>
              <Ionicons name="chevron-back" size={22} color="#5D9625" />
            </TouchableOpacity>

            <Text style={styles.rangeLabel}>{weekLabel}</Text>

            <TouchableOpacity style={styles.circleButton} onPress={onNextWeek}>
              <Ionicons name="chevron-forward" size={22} color="#5D9625" />
            </TouchableOpacity>
          </View>

          {generalError ? <Text style={styles.fieldErrorText}>{generalError}</Text> : null}

          <View style={styles.copyDayGrid}>
            {days.map((item) => {
              const isDisabled = item.date === sourceDate;

              return (
                <CopyDayCard
                  key={item.date}
                  styles={styles}
                  item={item}
                  selected={selectedTargetDate === item.date}
                  isDisabled={isDisabled}
                  onPress={() => {
                    if (isDisabled) return;
                    onSelectDate(item.date);
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
              <Text style={styles.primaryButtonText}>Sao chép ngày</Text>
            )}
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
import ActionButton from "@/shared/components/ActionButton";
import React from "react";
import { View, Text, Modal, StyleSheet } from "react-native";

export type ConfirmationModalAction = {
  label: string;
  variant: "primary" | "secondary";
  onPress: () => void;
};

type ConfirmationModalProps = {
  visible: boolean;
  onRequestClose: () => void;
  title?: string;
  message: string;
  actions: [ConfirmationModalAction] | [ConfirmationModalAction, ConfirmationModalAction];
};

export function ConfirmationModal({
  visible,
  onRequestClose,
  title,
  message,
  actions,
}: ConfirmationModalProps) {
  const isSingle = actions.length === 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <View
        style={styles.overlay}
        className="bg-black/50 px-6 items-center justify-center"
      >
        <View
          className="w-full bg-white rounded-[32px] border-[1px] border-card-border p-6 shadow-soft"
          style={styles.modalCard}
        >
          {title ? (
            <Text className="text-black text-xl font-bold text-center mb-2 px-2">
              {title}
            </Text>
          ) : null}
          <Text
            className={
              title
                ? "text-base text-gray-700 text-center mb-6 px-2 leading-6"
                : "text-black text-xl font-bold text-center mb-6 px-3 leading-6"
            }
          >
            {message}
          </Text>

          {isSingle ? (
            <ActionButton
              text={actions[0].label}
              variant={actions[0].variant}
              icon={false}
              onPress={actions[0].onPress}
              className="w-full"
            />
          ) : (
            <View className="flex-row items-center justify-between gap-3">
              <ActionButton
                text={actions[0].label}
                variant={actions[0].variant}
                icon={false}
                onPress={actions[0].onPress}
                className="flex-1"
              />
              <ActionButton
                text={actions[1].label}
                variant={actions[1].variant}
                icon={false}
                onPress={actions[1].onPress}
                className="flex-1"
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  modalCard: {
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 10,
    borderColor: "#D4DBD1",
  },
});

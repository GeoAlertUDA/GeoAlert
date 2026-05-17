import React from "react";
import {
  Modal,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import type { IAlarm } from "@/features/alarm/types/IAlarm";

interface CancelAlarmPickerModalProps {
  visible: boolean;
  alarms: IAlarm[];
  onClose: () => void;
  onSelectAlarm: (id: number) => void;
}

export function CancelAlarmPickerModal({
  visible,
  alarms,
  onClose,
  onSelectAlarm,
}: CancelAlarmPickerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={styles.card}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={styles.title}>¿Cuál alerta querés desactivar?</Text>
          <ScrollView
            style={styles.list}
            keyboardShouldPersistTaps="handled"
          >
            {alarms.map((a) => (
              <Pressable
                key={a.id}
                style={styles.row}
                onPress={() => onSelectAlarm(a.id)}
              >
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {a.name || "Alarma"}
                </Text>
                {a.address ? (
                  <Text style={styles.rowSub} numberOfLines={2}>
                    {a.address}
                  </Text>
                ) : null}
              </Pressable>
            ))}
          </ScrollView>
          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cerrar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    maxHeight: "70%",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0D393C",
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  list: {
    maxHeight: 320,
  },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    marginBottom: 8,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  rowSub: {
    fontSize: 12,
    color: "#555",
    marginTop: 4,
  },
  cancelBtn: {
    marginTop: 12,
    alignSelf: "center",
    paddingVertical: 12,
  },
  cancelText: {
    fontSize: 16,
    color: "#0D393C",
    fontWeight: "600",
  },
});

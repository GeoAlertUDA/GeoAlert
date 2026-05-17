import React from "react";
import { ConfirmationModal } from "@/shared/components/ConfirmationModal";
import { MAX_ACTIVE_ALARMS } from "../constants/maxActiveAlarms";

interface MaxActiveAlarmsLimitModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export function MaxActiveAlarmsLimitModal({
  visible,
  onDismiss,
}: MaxActiveAlarmsLimitModalProps) {
  return (
    <ConfirmationModal
      visible={visible}
      onRequestClose={onDismiss}
      title="Límite de alarmas activas"
      message={`Solo podés tener hasta ${MAX_ACTIVE_ALARMS} alarmas activas a la vez. Desactivá alguna para activar otra.`}
      actions={[
        { label: "Entendido", variant: "primary", onPress: onDismiss },
      ]}
    />
  );
}

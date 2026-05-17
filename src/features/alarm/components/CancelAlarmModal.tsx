import React from "react";
import { ConfirmationModal } from "@/shared/components/ConfirmationModal";

interface CancelAlarmConfirmationModalProps {
  visible: boolean;
  destinationLabel: string;
  onContinueTrip: () => void;
  onConfirmCancelAlarm: () => void;
}

export const CancelAlarmConfirmationModal = ({
  visible,
  destinationLabel,
  onContinueTrip,
  onConfirmCancelAlarm,
}: CancelAlarmConfirmationModalProps) => {
  const label = destinationLabel.trim() || "esta ubicación";

  return (
    <ConfirmationModal
      visible={visible}
      onRequestClose={onContinueTrip}
      message={`¿Estás seguro que querés cancelar tu alarma hacia ${label}?`}
      actions={[
        {
          label: "Continuar viaje",
          variant: "primary",
          onPress: onContinueTrip,
        },
        {
          label: "Cancelar alarma",
          variant: "secondary",
          onPress: onConfirmCancelAlarm,
        },
      ]}
    />
  );
};

import React from "react";
import { ConfirmationModal } from "@/shared/components/ConfirmationModal";

interface DeleteAlarmConfirmationModalProps {
  visible: boolean;
  destinationLabel: string;
  onDismiss: () => void;
  onConfirmDelete: () => void;
}

export function DeleteAlarmConfirmationModal({
  visible,
  destinationLabel,
  onDismiss,
  onConfirmDelete,
}: DeleteAlarmConfirmationModalProps) {
  const label = destinationLabel.trim() || "esta ubicación";

  return (
    <ConfirmationModal
      visible={visible}
      onRequestClose={onDismiss}
      message={`¿Estás seguro que querés eliminar la alarma hacia ${label}?`}
      actions={[
        { label: "Volver", variant: "primary", onPress: onDismiss },
        { label: "Eliminar", variant: "secondary", onPress: onConfirmDelete },
      ]}
    />
  );
}

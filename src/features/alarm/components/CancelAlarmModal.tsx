import ActionButton from '@/shared/components/ActionButton';
import React from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';

interface CancelAlarmConfirmationModalProps {
    visible: boolean;
    onConfirm: () => void;
    onCancel: () => void; 
}

export const CancelAlarmConfirmationModal = ({
    visible,
    onConfirm,
    onCancel
}: CancelAlarmConfirmationModalProps) => {
    return (
        <Modal
            visible={visible}
            transparent={true} 
            animationType="fade" 
            onRequestClose={onCancel} 
        >
            <View style={styles.overlay} className="bg-black/50 px-6 items-center justify-center">
                <View
                    className="w-full bg-white rounded-[32px] border-[1px] border-card-border p-6 shadow-soft"
                    style={[styles.modalCard]}
                >
                    <Text
                        className="text-black text-xl font-bold text-center mb-6 px-3"
                    >
                        ¿Estás seguro que quieres cancelar tu alerta?
                    </Text>

                    <View className="flex-row items-center justify-between gap-3">
                        <ActionButton
                            text="Continuar"
                            variant="primary"
                            icon={false}
                            onPress={onConfirm}
                            className="flex-1" 
                        />
                        <ActionButton
                            text="Cancelar"
                            variant="secondary"
                            icon={false}
                            onPress={onCancel}
                            className="flex-1" 
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
    },
    modalCard: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 10,
        borderColor: '#D4DBD1',
    },
});

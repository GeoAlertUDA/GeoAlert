import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Check, X } from 'lucide-react-native';
import { AVAILABLE_SOUNDS } from '../constants/sound';
import { previewAlert } from '../service/soundService';
import { useGlobalSettingsStore } from '../store/globalSettingsStore';
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
};

export default function SoundPickerModal({ visible, selectedId, onSelect, onClose }: Props) {
  const { settings } = useGlobalSettingsStore();
  const insets = useSafeAreaInsets();

  async function handleSelect(id: string) {
    onSelect(id);
    // Preview inmediato al seleccionar
    await previewAlert({
      ...settings,
      selectedSoundId: id,
      vibrationEnabled: false, // solo sonido en el picker
    });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/60">
        <View
          className="overflow-hidden rounded-t-[35px] bg-[#052626]"
          style={{ paddingBottom: Math.max(insets.bottom, 20) }}
        >
          <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
            <Text className="text-white text-xl font-semibold">Tono de alarma</Text>
            <TouchableOpacity
              onPress={onClose}
              className="bg-[#113838] p-2 rounded-full"
              activeOpacity={0.75}
            >
              <X size={20} color="#A8D5BA" />
            </TouchableOpacity>
          </View>

          {/* Lista de tonos */}
          <FlatList
            data={AVAILABLE_SOUNDS}
            keyExtractor={(item) => item.id}
            contentContainerClassName="px-5"
            renderItem={({ item, index }) => {
              const isSelected = item.id === selectedId;
              const isLast = index === AVAILABLE_SOUNDS.length - 1;
              return (
                <TouchableOpacity
                  onPress={() => handleSelect(item.id)}
                  activeOpacity={0.75}
                  className={`flex-row items-center justify-between py-4 ${
                    !isLast ? 'border-b border-[#1a4747]' : ''
                  }`}
                >
                  <Text
                    className={`text-[17px] font-medium ${
                      isSelected ? 'text-[#A8D5BA]' : 'text-white'
                    }`}
                  >
                    {item.label}
                  </Text>
                  {isSelected && <Check size={20} color="#A8D5BA" />}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}


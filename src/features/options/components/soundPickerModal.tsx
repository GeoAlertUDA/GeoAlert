
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Check, X } from 'lucide-react-native';
import { AVAILABLE_SOUNDS } from '../constants/sound';
import { previewAlert } from '../service/soundService';
import { useGlobalSettingsStore } from '../store/globalSettingsStore';
 
type Props = {
  visible: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
};
 
export default function SoundPickerModal({ visible, selectedId, onSelect, onClose }: Props) {
  const { settings } = useGlobalSettingsStore();
 
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
      <View className="flex-1 justify-end bg-black/50">
        <SafeAreaView className="bg-[#052626] rounded-t-[35px] overflow-hidden">
          {/* Header */}
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
            contentContainerClassName="px-5 pb-8"
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
        </SafeAreaView>
      </View>
    </Modal>
  );
}
 

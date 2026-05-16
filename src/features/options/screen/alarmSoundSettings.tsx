/**
 * AlarmSoundSettings
 *
 * Se embebe en la pantalla de crear/editar alarma (feature alerts).
 * Permite usar la config global o personalizar por alarma.
 *
 * Uso:
 *   const [soundOverride, setSoundOverride] = useState(defaultAlarmSoundOverride());
 *   <AlarmSoundSettings value={soundOverride} onChange={setSoundOverride} />
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Music2, Vibrate, Volume2, ChevronDown } from 'lucide-react-native';
import CustomSwitch from '../../../shared/components/CustomSwitch';
import { AlarmSoundOverride } from '../types/settingsTypes';
import { AVAILABLE_SOUNDS } from '../constants/sound';
import { useGlobalSettingsStore } from '../store/globalSettingsStore';
import SoundPickerModal from '../components/soundPickerModal';

type Props = {
  value: AlarmSoundOverride;
  onChange: (updated: AlarmSoundOverride) => void;
};

export function AlarmSoundSettings({ value, onChange }: Props) {
  const { settings: global } = useGlobalSettingsStore();
  const [showSoundPicker, setShowSoundPicker] = useState(false);

  function patch(partial: Partial<AlarmSoundOverride>) {
    onChange({ ...value, ...partial });
  }

  const effectiveSoundId = value.useGlobal ? global.selectedSoundId : value.selectedSoundId;
  const selectedSoundLabel =
    AVAILABLE_SOUNDS.find((s) => s.id === effectiveSoundId)?.label ?? 'Por defecto';

  return (
    <>
      <View className="bg-[#113838] rounded-[35px] p-6">

        {/* Toggle: usar config global */}
        <View className="flex-row items-start justify-between mb-6">
          <View className="flex-1 mr-4">
            <Text className="text-white text-[17px] font-medium">Usar config. global</Text>
            <Text className="text-[#9BAEAE] text-[13px] mt-0.5 leading-4">
              Igual que en Ajustes de la app
            </Text>
          </View>
          <View className="w-32">
            <CustomSwitch
              title=""
              initialValue={value.useGlobal}
              onValueChange={(v) => patch({ useGlobal: v })}
            />
          </View>
        </View>

        {/* Opciones personalizadas — sólo visibles si useGlobal = false */}
        {!value.useGlobal && (
          <>
            {/* Tono */}
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center flex-1">
                <Music2 size={22} color="#A8D5BA" />
                <Text className="text-white text-[17px] font-medium ml-4">Tono</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowSoundPicker(true)}
                className="bg-[#1a4747] flex-row items-center px-4 py-2.5 rounded-2xl border border-[#265a5a]"
                activeOpacity={0.75}
              >
                <Text className="text-white text-sm mr-2 font-medium">{selectedSoundLabel}</Text>
                <ChevronDown size={16} color="white" />
              </TouchableOpacity>
            </View>

            {/* Vibración */}
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <Vibrate size={22} color="#A8D5BA" />
                <Text className="text-white text-[17px] font-medium ml-4">Vibración</Text>
              </View>
              <View className="w-32">
                <CustomSwitch
                  title=""
                  initialValue={value.vibrationEnabled}
                  onValueChange={(v) => patch({ vibrationEnabled: v })}
                />
              </View>
            </View>

            {/* Volumen progresivo */}
            <View className="flex-row items-start justify-between">
              <View className="flex-row items-start flex-1 mr-4">
                <Volume2 size={22} color="#A8D5BA" className="mt-1" />
                <View className="ml-4 flex-1">
                  <Text className="text-white text-[17px] font-medium">Volumen progresivo</Text>
                  <Text className="text-[#9BAEAE] text-[13px] mt-0.5 leading-4">
                    Aumenta gradualmente para no asustarte
                  </Text>
                </View>
              </View>
              <View className="w-32">
                <CustomSwitch
                  title=""
                  initialValue={value.progressiveVolume}
                  onValueChange={(v) => patch({ progressiveVolume: v })}
                />
              </View>
            </View>
          </>
        )}
      </View>

      <SoundPickerModal
        visible={showSoundPicker}
        selectedId={value.selectedSoundId}
        onSelect={(id) => {
          patch({ selectedSoundId: id });
          setShowSoundPicker(false);
        }}
        onClose={() => setShowSoundPicker(false)}
      />
    </>
  );
}

/** Valor inicial para una nueva alarma */
export function defaultAlarmSoundOverride(): AlarmSoundOverride {
  return {
    useGlobal: true,
    selectedSoundId: 'default',
    vibrationEnabled: true,
    progressiveVolume: false,
  };
}
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { 
  BellRing, 
  Music2, 
  Vibrate, 
  Volume2, 
  BatteryMedium, 
  Wifi, 
  ChevronDown 
} from 'lucide-react-native';
import CustomSwitch from '../../../shared/components/CustomSwitch';

export default function SettingsScreen() {
  const [vibration, setVibration] = useState(true);
  const [progVolume, setProgVolume] = useState(false);
  const [energySaving, setEnergySaving] = useState(false);
  const [dataSaving, setDataSaving] = useState(false);

  return (
    <ScrollView className="flex-1 bg-[#052626] px-5 pt-16">
      
      {/* SECCIÓN: SONIDO */}
      <View className="flex-row items-center mb-4 ml-1">
        <BellRing size={24} color="#A8D5BA" strokeWidth={1.5} />
        <Text className="text-white text-2xl font-semibold ml-4">Sonido</Text>
      </View>

      <View className="bg-[#113838] rounded-[35px] p-6 mb-8">
        {/* Tono de Alarma */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center flex-1">
            <Music2 size={22} color="#A8D5BA" />
            <Text className="text-white text-[17px] font-medium ml-4">Tono de alarma</Text>
          </View>
          <TouchableOpacity className="bg-[#1a4747] flex-row items-center px-4 py-2.5 rounded-2xl border border-[#265a5a]">
            <Text className="text-white text-sm mr-2 font-medium">Por defecto</Text>
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
              initialValue={vibration}
              onValueChange={setVibration}
            />
          </View>
        </View>

        {/* Volumen Progresivo */}
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
              initialValue={progVolume}
              onValueChange={setProgVolume}
            />
          </View>
        </View>
      </View>

      {/* SECCIÓN: RENDIMIENTO */}
      <View className="flex-row items-center mb-4 ml-1">
        <BatteryMedium size={24} color="#A8D5BA" strokeWidth={1.5} />
        <Text className="text-white text-2xl font-semibold ml-4">Rendimiento</Text>
      </View>

      <View className="bg-[#113838] rounded-[35px] p-6 mb-10">
        {/* Ahorro Energía */}
        <View className="flex-row items-start justify-between mb-6">
          <View className="flex-row items-start flex-1 mr-4">
            <BatteryMedium size={22} color="#A8D5BA" className="mt-1" />
            <View className="ml-4 flex-1">
              <Text className="text-white text-[17px] font-medium">Ahorro de energía</Text>
              <Text className="text-[#9BAEAE] text-[13px] mt-0.5 leading-4">
                Reduce precisión GPS en trayectos largos
              </Text>
            </View>
          </View>
          <View className="w-32">
            <CustomSwitch
              title=""
              initialValue={energySaving}
              onValueChange={setEnergySaving}
            />
          </View>
        </View>

        {/* Ahorro Datos */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Wifi size={22} color="#A8D5BA" />
            <Text className="text-white text-[17px] font-medium ml-4">Ahorro datos móviles</Text>
          </View>
          <View className="w-32">
            <CustomSwitch
              title=""
              initialValue={dataSaving}
              onValueChange={setDataSaving}
            />
          </View>
        </View>
      </View>

    </ScrollView>
  );
}
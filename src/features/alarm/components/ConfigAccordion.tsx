import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';

interface ConfigAccordionProps {
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export default function ConfigAccordion({ isExpanded, onToggle, children }: ConfigAccordionProps) {
  return (
    <View className="mt-4">
      <View className="h-[1px] bg-gray-200 mb-4" />

      <TouchableOpacity
        className="flex-row justify-between items-center mb-2"
        activeOpacity={0.7}
        onPress={onToggle}
      >
        <Text className="text-base font-semibold text-[#111]">
          Configurar alarma
        </Text>
        {isExpanded ? (
          <ChevronUp size={20} color="#111" />
        ) : (
          <ChevronDown size={20} color="#111" />
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View className="pt-2 pb-6">
          {children}
        </View>
      )}
    </View>
  );
}

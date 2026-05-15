import { AlarmScreen } from "@/features/alerts/components/AlarmScreen";
import { View, Text, FlatList, Pressable } from "react-native";
import { useEffect, useCallback } from "react";
import { useAlarmStore } from "@/features/alarm/store/useAlarmStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

const alarms = () => {
  const alarms = useAlarmStore((s) => s.alarms);
  const loadAlarms = useAlarmStore((s) => s.loadAlarms);
  const removeAlarm = useAlarmStore((s) => s.removeAlarm);
  const stopRinging = useAlarmStore((s) => s.stopRinging);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      loadAlarms();
    }, [loadAlarms]),
  );

  return <AlarmScreen />;
};

export default alarms;
//   return (
//     <View style={{ flex: 1, paddingTop: insets.top }} className="bg-white">
//       <Text className="text-2xl font-bold text-[#0D393C] px-6 py-4">
//         Mis alarmas
//       </Text>

//       {alarms.length === 0 ? (
//         <View className="flex-1 items-center justify-center">
//           <Text className="text-gray-400 text-base">No hay alarmas guardadas</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={alarms}
//           keyExtractor={(item) => String(item.id)}
//           contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 16 }}
//           renderItem={({ item }) => (
//             <View className="bg-[#E4EBE4] rounded-2xl p-4 mb-3">
//               <View className="flex-row justify-between items-start">
//                 <View className="flex-1 pr-2">
//                   <Text className="text-[#0D393C] font-semibold text-base" numberOfLines={1}>
//                     {item.name}
//                   </Text>
//                   {item.address && (
//                     <Text className="text-gray-500 text-sm mt-1" numberOfLines={2}>
//                       {item.address}
//                     </Text>
//                   )}
//                   <Text className="text-[#0D393C] text-sm mt-2 font-medium">
//                     Radio: {item.radius}m · {item.isActive ? 'Activa' : 'Inactiva'}
//                   </Text>
//                   <Text className="text-[#0D393C] text-xs mt-1">
//                     Sonido {item.soundEnabled ? 'sí' : 'no'} · Vibración {item.vibrationEnabled ? 'sí' : 'no'}
//                   </Text>
//                   {item.isRinging && (
//                     <Pressable
//                       onPress={() => stopRinging(item.id)}
//                       className="bg-[#0D393C] rounded-xl px-4 py-2 mt-3 self-start"
//                     >
//                       <Text className="text-white font-semibold text-sm">Detener</Text>
//                     </Pressable>
//                   )}
//                 </View>
//                 <Pressable
//                   onPress={() => removeAlarm(item.id)}
//                   className="bg-red-100 rounded-xl px-3 py-1"
//                 >
//                   <Text className="text-red-500 font-semibold text-sm">Eliminar</Text>
//                 </Pressable>
//               </View>
//             </View>
//           )}
//         />
//       )}
//     </View>
//   )
// }

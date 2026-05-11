import { View, Text, FlatList, Pressable } from 'react-native'
import React, { useEffect } from 'react'
import { useAlarmStore } from '@/features/alarm/store/useAlarmStore'
import { useLocationDebugStore } from '@/features/location'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function AlarmsScreen() {
  const alarms = useAlarmStore((s) => s.alarms)
  const loadAlarms = useAlarmStore((s) => s.loadAlarms)
  const removeAlarm = useAlarmStore((s) => s.removeAlarm)
  const locationDebug = useLocationDebugStore()
  const insets = useSafeAreaInsets()

  useEffect(() => {
    loadAlarms()
  }, [])

  return (
    <View style={{ flex: 1, paddingTop: insets.top }} className="bg-white">
      <Text className="text-2xl font-bold text-[#0D393C] px-6 py-4">
        Mis alarmas
      </Text>
      <View className="mx-6 mb-4 rounded-2xl bg-[#E4EBE4] p-4">
        <Text className="text-[#0D393C] font-bold text-base mb-2">Debug ubicación</Text>
        <Text className="text-[#0D393C] text-sm">Foreground: {locationDebug.foregroundPermission}</Text>
        <Text className="text-[#0D393C] text-sm">Background: {locationDebug.backgroundPermission}</Text>
        <Text className="text-[#0D393C] text-sm">
          Task registrada: {locationDebug.isTaskRegistered ? 'sí' : 'no'}
        </Text>
        <Text className="text-[#0D393C] text-sm">
          Tracking activo: {locationDebug.hasStartedLocationUpdates ? 'sí' : 'no'}
        </Text>
        <Text className="text-[#0D393C] text-sm">
          Alarmas activas evaluadas: {locationDebug.activeAlarmsCount}
        </Text>
        <Text className="text-[#0D393C] text-sm">
          Último evento: {locationDebug.lastEvent ?? 'sin eventos'}
        </Text>
        {locationDebug.lastLocationAt && (
          <Text className="text-[#0D393C] text-sm">
            Última ubicación: {new Date(locationDebug.lastLocationAt).toLocaleTimeString()}
          </Text>
        )}
        {locationDebug.lastTriggeredAlarmId && (
          <Text className="text-[#0D393C] text-sm">
            Última alarma detectada: #{locationDebug.lastTriggeredAlarmId}
          </Text>
        )}
        {locationDebug.lastError && (
          <Text className="text-red-500 text-sm">Error: {locationDebug.lastError}</Text>
        )}
      </View>

      {alarms.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400 text-base">No hay alarmas guardadas</Text>
        </View>
      ) : (
        <FlatList
          data={alarms}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 16 }}
          renderItem={({ item }) => (
            <View className="bg-[#E4EBE4] rounded-2xl p-4 mb-3">
              <View className="flex-row justify-between items-start">
                <View className="flex-1 pr-2">
                  <Text className="text-[#0D393C] font-semibold text-base" numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.address && (
                    <Text className="text-gray-500 text-sm mt-1" numberOfLines={2}>
                      {item.address}
                    </Text>
                  )}
                  <Text className="text-[#0D393C] text-sm mt-2 font-medium">
                    Radio: {item.radius}m · {item.isActive ? 'Activa' : 'Inactiva'}
                  </Text>
                </View>
                <Pressable
                  onPress={() => removeAlarm(item.id)}
                  className="bg-red-100 rounded-xl px-3 py-1"
                >
                  <Text className="text-red-500 font-semibold text-sm">Eliminar</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </View>
  )
}
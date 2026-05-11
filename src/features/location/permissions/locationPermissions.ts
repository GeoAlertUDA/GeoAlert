import { Alert, Linking, Platform } from 'react-native';
import * as Location from 'expo-location';
import { useLocationDebugStore } from '../store/locationDebugStore';

export interface BackgroundLocationPermissionResult {
  foregroundGranted: boolean;
  backgroundGranted: boolean;
  canAskBackgroundAgain: boolean;
}

const setPermissionDebug = (
  foregroundStatus: Location.PermissionStatus,
  backgroundStatus: Location.PermissionStatus,
) => {
  useLocationDebugStore.getState().setDebugState({
    foregroundPermission: foregroundStatus,
    backgroundPermission: backgroundStatus,
  });
};

export async function getBackgroundLocationPermissionState(): Promise<BackgroundLocationPermissionResult> {
  const foreground = await Location.getForegroundPermissionsAsync();
  const background = await Location.getBackgroundPermissionsAsync();

  setPermissionDebug(foreground.status, background.status);

  return {
    foregroundGranted: foreground.granted,
    backgroundGranted: background.granted,
    canAskBackgroundAgain: background.canAskAgain,
  };
}

export async function requestBackgroundLocationPermissions(): Promise<BackgroundLocationPermissionResult> {
  const foreground = await Location.requestForegroundPermissionsAsync();

  if (!foreground.granted) {
    setPermissionDebug(foreground.status, Location.PermissionStatus.UNDETERMINED);
    return {
      foregroundGranted: false,
      backgroundGranted: false,
      canAskBackgroundAgain: false,
    };
  }

  const background = await Location.requestBackgroundPermissionsAsync();
  setPermissionDebug(foreground.status, background.status);

  return {
    foregroundGranted: true,
    backgroundGranted: background.granted,
    canAskBackgroundAgain: background.canAskAgain,
  };
}

export function showBackgroundPermissionExplanation(onContinue: () => void) {
  Alert.alert(
    'Permiso de ubicación',
    'GeoAlert necesita ubicación en segundo plano para seguir evaluando alarmas activas cuando la app no está abierta.',
    [
      { text: 'Cancelar', style: 'cancel' },
      { text: Platform.OS === 'ios' ? 'Continuar' : 'Permitir', onPress: onContinue },
    ],
  );
}

export function confirmBackgroundPermissionExplanation(): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      'Permiso de ubicación',
      'GeoAlert necesita ubicación en segundo plano para seguir evaluando alarmas activas cuando la app no está abierta.',
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        {
          text: Platform.OS === 'ios' ? 'Continuar' : 'Permitir',
          onPress: () => resolve(true),
        },
      ],
    );
  });
}

export function showOpenSettingsAlert() {
  Alert.alert(
    'Permiso pendiente',
    'Para que GeoAlert funcione en segundo plano, activá el permiso de ubicación desde los ajustes del sistema.',
    [
      { text: 'Más tarde', style: 'cancel' },
      { text: 'Abrir ajustes', onPress: () => Linking.openSettings() },
    ],
  );
}

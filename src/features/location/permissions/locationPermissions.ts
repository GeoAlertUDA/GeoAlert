import { Alert, Linking, Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
export interface BackgroundLocationPermissionResult {
  foregroundGranted: boolean;
  backgroundGranted: boolean;
  canAskBackgroundAgain: boolean;
  /** iOS: el binario no incluye NSLocation* en Info.plist (p. ej. Expo Go o build desactualizado). */
  nativeLocationConfigMissing?: boolean;
}

export function shouldSkipStrictIosLocationFlow(): boolean {
  return Platform.OS === 'ios' && Constants.appOwnership === 'expo';
}

function isIosLocationPlistConfigError(error: unknown): boolean {
  if (Platform.OS !== 'ios') return false;

  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('Info.plist') &&
    (message.includes('NSLocation') || message.includes('NSLocation*UsageDescription'))
  );
}

function showIosNativeLocationConfigAlert() {
  Alert.alert(
    'Ubicación en iPhone',
    'La app que estás usando no incluye los textos de permiso de ubicación de GeoAlert. En Expo Go pasa a veces con geolocalización avanzada. Instalá un development build generado con EAS (o volvé a compilar el proyecto nativo) para que se apliquen las claves de app.json.',
    [{ text: 'Entendido' }],
  );
}

export async function getBackgroundLocationPermissionState(): Promise<BackgroundLocationPermissionResult> {
  const foreground = await Location.getForegroundPermissionsAsync();
  const background = await Location.getBackgroundPermissionsAsync();

  return {
    foregroundGranted: foreground.granted,
    backgroundGranted: background.granted,
    canAskBackgroundAgain: background.canAskAgain,
  };
}

export async function requestBackgroundLocationPermissions(): Promise<BackgroundLocationPermissionResult> {
  try {
    const foreground = await Location.requestForegroundPermissionsAsync();

    if (!foreground.granted) {
      return {
        foregroundGranted: false,
        backgroundGranted: false,
        canAskBackgroundAgain: false,
      };
    }

    const background = await Location.requestBackgroundPermissionsAsync();

    return {
      foregroundGranted: true,
      backgroundGranted: background.granted,
      canAskBackgroundAgain: background.canAskAgain,
    };
  } catch (e) {
    if (isIosLocationPlistConfigError(e)) {
      showIosNativeLocationConfigAlert();
      return {
        foregroundGranted: false,
        backgroundGranted: false,
        canAskBackgroundAgain: false,
        nativeLocationConfigMissing: true,
      };
    }
    throw e;
  }
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

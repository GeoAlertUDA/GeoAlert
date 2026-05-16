import { Audio } from 'expo-av';
import { Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';
import { GlobalSoundSettings, AlarmSoundOverride } from '../types/settingsTypes';
import { AVAILABLE_SOUNDS } from '../constants/sound';
 
// ─── Vibración ────────────────────────────────────────────────────────────────
 
const VIBRATION_MS: number[] = [0, 200, 150, 200]; // patrón "doble pulso"
const REPEATING_VIBRATION_MS: number[] = [0, 700, 400, 700];
 
async function triggerVibration(repeat = false) {
  // iOS: usa Haptics para feedback táctil nativo
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {
    // silencioso si falla en Android
  }
  // Android: Vibration API
  Vibration.vibrate(repeat ? REPEATING_VIBRATION_MS : VIBRATION_MS, repeat);
}
 
// ─── Audio ────────────────────────────────────────────────────────────────────

const PREVIEW_DURATION_MS = 3000;

type ActivePlayback = {
  sound: Audio.Sound;
  stopTimeout?: ReturnType<typeof setTimeout>;
  volumeInterval?: ReturnType<typeof setInterval>;
};

let activePreview: ActivePlayback | null = null;
let activeAlarmSound: ActivePlayback | null = null;
let previewRequestId = 0;

async function stopPlayback(playback: ActivePlayback) {
  if (playback.stopTimeout) clearTimeout(playback.stopTimeout);
  if (playback.volumeInterval) clearInterval(playback.volumeInterval);

  try {
    await playback.sound.stopAsync();
  } catch {
    // El sonido puede haberse detenido o descargado antes.
  }

  try {
    await playback.sound.unloadAsync();
  } catch {
    // Silencioso: descargar dos veces puede fallar según el estado interno.
  }
}

async function stopPreview() {
  if (!activePreview) return;

  const preview = activePreview;
  activePreview = null;
  await stopPlayback(preview);
}

async function stopAlarmSound() {
  if (!activeAlarmSound) return;

  const alarmSound = activeAlarmSound;
  activeAlarmSound = null;
  await stopPlayback(alarmSound);
}

async function playSound(
  soundId: string,
  progressive: boolean,
  options?: { preview?: boolean; alarm?: boolean; durationMs?: number },
) {
  const soundDef = AVAILABLE_SOUNDS.find((s) => s.id === soundId);
  if (!soundDef) return;

  const isPreview = options?.preview ?? false;
  const isAlarm = options?.alarm ?? false;
  const requestId = isPreview ? ++previewRequestId : previewRequestId;

  if (isPreview) {
    await stopPreview();
  }

  if (isAlarm) {
    await stopAlarmSound();
  }
 
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,   // suena aunque el iPhone esté en silencio
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
    });
 
    const { sound } = await Audio.Sound.createAsync(soundDef.file, {
      volume: progressive ? 0.1 : 1.0, // empieza bajo si es progresivo
      shouldPlay: true,
    });

    if (isPreview && requestId !== previewRequestId) {
      await sound.unloadAsync();
      return;
    }

    const playback: ActivePlayback = { sound };
 
    // Volumen progresivo: sube de 0.1 a 1.0 en 5 pasos de 600ms
    if (progressive) {
      const steps = [0.1, 0.3, 0.55, 0.8, 1.0];
      let step = 0;
      playback.volumeInterval = setInterval(async () => {
        step++;
        if (step < steps.length) {
          try {
            await sound.setVolumeAsync(steps[step]);
          } catch {
            if (playback.volumeInterval) clearInterval(playback.volumeInterval);
          }
        } else {
          if (playback.volumeInterval) clearInterval(playback.volumeInterval);
        }
      }, 600);
    }

    if (isPreview) {
      activePreview = playback;
      playback.stopTimeout = setTimeout(() => {
        void stopPreview();
      }, options?.durationMs ?? PREVIEW_DURATION_MS);
    } else if (isAlarm) {
      activeAlarmSound = playback;
    }
 
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        if (playback.volumeInterval) clearInterval(playback.volumeInterval);
        if (activePreview?.sound === sound) {
          activePreview = null;
          if (playback.stopTimeout) clearTimeout(playback.stopTimeout);
        }
        if (activeAlarmSound?.sound === sound) {
          activeAlarmSound = null;
        }
        sound.unloadAsync();
      }
    });
  } catch (err) {
    console.warn('[soundService] Error reproduciendo sonido:', err);
  }
}
 
// ─── API pública ──────────────────────────────────────────────────────────────
 
/**
 * Llamar desde el servicio de geofencing cuando el usuario entra al radio.
 *
 * @example
 * const { settings } = useGlobalSettingsStore.getState();
 * await triggerAlarmAlert(settings, alarm.soundOverride);
 */
type AlarmAlertOptions = {
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
  repeatVibration?: boolean;
};

export async function triggerAlarmAlert(
  global: GlobalSoundSettings,
  override?: AlarmSoundOverride,
  options: AlarmAlertOptions = {},
): Promise<void> {
  // Resolver config efectiva
  const useGlobal = !override || override.useGlobal;
  const soundId = useGlobal ? global.selectedSoundId : override!.selectedSoundId;
  const vibration =
    options.vibrationEnabled ?? (useGlobal ? global.vibrationEnabled : override!.vibrationEnabled);
  const progressive = useGlobal ? global.progressiveVolume : override!.progressiveVolume;
 
  if (vibration) await triggerVibration(options.repeatVibration ?? false);

  if (options.soundEnabled !== false) {
    await playSound(soundId, progressive, { alarm: true });
  }
}

export async function stopAlarmAlert(): Promise<void> {
  Vibration.cancel();
  await stopAlarmSound();
}
 
/**
 * Preview desde la pantalla de configuración (no queda en background).
 */
export async function previewAlert(
  settings: GlobalSoundSettings | AlarmSoundOverride,
): Promise<void> {
  const soundId =
    'selectedSoundId' in settings ? settings.selectedSoundId : DEFAULT_SOUND_ID;
  const vibration = settings.vibrationEnabled;
  const progressive =
    'progressiveVolume' in settings ? settings.progressiveVolume : false;
 
  if (vibration) await triggerVibration();
  await playSound(soundId, progressive, {
    preview: true,
    durationMs: PREVIEW_DURATION_MS,
  });
}
 
const DEFAULT_SOUND_ID = 'default';
 

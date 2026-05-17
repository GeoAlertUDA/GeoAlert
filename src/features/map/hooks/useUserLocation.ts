import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { LocationCoordinates } from '../types';
import { calculateDistance } from '../utils/calculateDistance';
import { getTierConfig } from '../utils/getTierConfig';

/** referencePoints: destinos para ajustar el tier (km); puede incluir alarmas activas + pin de borrador. */
export const useUserLocation =
  (fallbackRegion: LocationCoordinates, referencePoints: LocationCoordinates[]) => {
    const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null);
    const [heading, setHeading] = useState(0);
    const [trackingMode, setTrackingMode] = useState<'LOW' | 'BALANCED' | 'HIGH' | 'MAX'>('HIGH');

    const [trackingConfig, setTrackingConfig] = useState({
      accuracy: Location.Accuracy.High,
      timeInterval: 2000,
      distanceInterval: 2,
    });

    const trackingConfigRef = useRef(trackingConfig);
    trackingConfigRef.current = trackingConfig;

    const pointsKey = referencePoints
      .map((p) => `${p.latitude.toFixed(5)},${p.longitude.toFixed(5)}`)
      .join('|');

    useEffect(() => {
      let locationSubscription: Location.LocationSubscription;

      const startTracking = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación para calcular el tiempo de viaje.');
          setUserLocation(fallbackRegion);
          return;
        }

        const initialLocation = await Location.getCurrentPositionAsync({});
        const initialCoords = {
          latitude: initialLocation.coords.latitude,
          longitude: initialLocation.coords.longitude,
        };
        setUserLocation(initialCoords);

        locationSubscription = await Location.watchPositionAsync(
          trackingConfigRef.current,
          (location) => {
            const newCoords = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            };
            setUserLocation(newCoords);

            if (referencePoints.length > 0) {
              const minKm = Math.min(
                ...referencePoints.map((p) => calculateDistance(newCoords, p)),
              );
              const newConfig = getTierConfig(minKm);
              if (newConfig.timeInterval !== trackingConfigRef.current.timeInterval) {
                setTrackingConfig(newConfig);
                const mode =
                  minKm > 20
                    ? 'LOW'
                    : minKm > 5
                      ? 'BALANCED'
                      : minKm > 2
                        ? 'HIGH'
                        : 'MAX';
                setTrackingMode(mode);
              }
            }

            if (location.coords.heading !== null) {
              setHeading(location.coords.heading);
            }
          },
        );
      };

      void startTracking();

      return () => {
        locationSubscription?.remove();
      };
    }, [pointsKey, fallbackRegion.latitude, fallbackRegion.longitude]);

    return { userLocation, heading, trackingMode };
  };

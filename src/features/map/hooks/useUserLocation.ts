import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { LocationCoordinates } from '../types';

export const useUserLocation = (fallbackRegion: LocationCoordinates) => {
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null);
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription;

    const startTracking = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación para calcular el tiempo de viaje.');
        setUserLocation(fallbackRegion);
        return;
      }

      let initialLocation = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: initialLocation.coords.latitude,
        longitude: initialLocation.coords.longitude,
      });

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 2,
        },
        (location) => {
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          if (location.coords.heading !== null) {
            setHeading(location.coords.heading);
          }
        }
      );
    };

    startTracking();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []); 

  return { userLocation, heading };
};
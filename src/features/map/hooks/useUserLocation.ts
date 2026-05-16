import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { LocationCoordinates } from '../types';
import { calculateDistance } from '../utils/calculateDistance';
import { getTierConfig } from '../utils/getTierConfig';


//cambio de juancruz
//ahora recive un paremetro selectedLocation definido en mapScreen para definir el consumo del recorrido
export const useUserLocation = (fallbackRegion: LocationCoordinates,selectedLocation: LocationCoordinates | null) => {
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null);
  const [heading, setHeading] = useState(0);
  const [trackingMode, setTrackingMode] = useState<'LOW' | 'BALANCED' | 'HIGH' | 'MAX'>('HIGH');
  
  const [trackingConfig,setTrackingConfig]=useState({
    accuracy: Location.Accuracy.High,
    timeInterval: 2000,
    distanceInterval: 2
  })

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

      const distance = calculateDistance(userLocation,selectedLocation);

      locationSubscription = await Location.watchPositionAsync(
        trackingConfig,
        (location) => {
          const newCoords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          setUserLocation(newCoords);

          if (selectedLocation) {
            const distance = calculateDistance(newCoords, selectedLocation);
            const newConfig = getTierConfig(distance);

            if (newConfig.timeInterval !== trackingConfig.timeInterval) {
              setTrackingConfig(newConfig);
              const mode = distance > 20 ? 'LOW' : distance > 5 ? 'BALANCED' : distance > 2 ? 'HIGH' : 'MAX';
              setTrackingMode(mode);
            }
          }

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
  }, [selectedLocation, trackingConfig]); 

  return { userLocation, heading, trackingMode };
};
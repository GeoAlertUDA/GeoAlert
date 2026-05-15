import { useRef, useState, useEffect } from 'react';
import { Keyboard } from 'react-native';
import MapView from 'react-native-maps';
import { GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LocationCoordinates, MapRegion } from '../types';
import { useUserLocation } from './useUserLocation';

const FALLBACK_REGION: MapRegion = {
  latitude: -32.8895,
  longitude: -68.8458,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const calculateDistanceInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; 
  const φ1 = lat1 * (Math.PI / 180);
  const φ2 = lat2 * (Math.PI / 180);
  const Δφ = (lat2 - lat1) * (Math.PI / 180);
  const Δλ = (lon2 - lon1) * (Math.PI / 180);

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};

export const useMapController = () => {
  const mapRef = useRef<MapView>(null);
  const searchRef = useRef<GooglePlacesAutocompleteRef>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const isActivatingRef = useRef(false);

  const [mapRegion, setMapRegion] = useState<MapRegion>(FALLBACK_REGION);
  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates | null>(null);
  const [alarmRadius, setAlarmRadius] = useState(500);
  const [isTripActive, setIsTripActive] = useState(false);
  const [distanceToTarget, setDistanceToTarget] = useState(0);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const { userLocation, heading } = useUserLocation(FALLBACK_REGION, selectedLocation);

  useEffect(() => {
    if (isTripActive && userLocation && selectedLocation) {
      const distance = calculateDistanceInMeters(
        userLocation.latitude,
        userLocation.longitude,
        selectedLocation.latitude,
        selectedLocation.longitude
      );
      setDistanceToTarget(distance);
    }
  }, [userLocation, selectedLocation, isTripActive]);

  // --- Handlers ---
  const clearMapStates = () => {
    setSelectedLocation(null);
    searchRef.current?.setAddressText("");
    Keyboard.dismiss();
  };

  const handleLocationUpdate = (location: LocationCoordinates, updateSearchText = false) => {
    Keyboard.dismiss();
    setAlarmRadius(500);

    const isSameLocation = selectedLocation?.latitude === location.latitude &&
                           selectedLocation?.longitude === location.longitude;

    setSelectedLocation(location);

    if (updateSearchText) {
      searchRef.current?.setAddressText(
        `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
      );
    }

    setTimeout(() => bottomSheetModalRef.current?.present(), 150);

    if (!isSameLocation && !userLocation) {
      mapRef.current?.animateToRegion(
        { ...location, latitudeDelta: 0.005, longitudeDelta: 0.005 },
        1000
      );
    }
  };

  const handleSearchBarClear = () => {
    clearMapStates();
    bottomSheetModalRef.current?.dismiss();
  };

  const handleBottomSheetDismiss = () => {
    if (isActivatingRef.current) {
      isActivatingRef.current = false;
    } else if (!isTripActive) {
      clearMapStates();
    }
  };

  const handleActivateAlarm = () => {
    isActivatingRef.current = true;
    setIsTripActive(true);
  };

  const handleRequestCancelAlarm = () => {
    setShowCancelConfirmation(true);
  };
  const handleConfirmCancelAlarm = () => {
    setShowCancelConfirmation(false); 
    setIsTripActive(false);           
    clearMapStates();                
  };

  const handleDismissCancelConfirmation = () => {
    setShowCancelConfirmation(false);
  };


  return {
    refs: { mapRef, searchRef, bottomSheetModalRef },
    state: { mapRegion, selectedLocation, alarmRadius, isTripActive, distanceToTarget,  showCancelConfirmation, userLocation, heading },
    actions: { 
      setMapRegion, 
      setAlarmRadius, 
      handleLocationUpdate, 
      handleSearchBarClear, 
      handleBottomSheetDismiss, 
      handleActivateAlarm,
      handleRequestCancelAlarm,
      handleConfirmCancelAlarm,
      handleDismissCancelConfirmation
     
    }
  };
};

import React, { useRef, useState, useEffect } from "react";
import { StyleSheet, View, TouchableWithoutFeedback, Keyboard, Alert } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, LongPressEvent } from "react-native-maps";
import { GooglePlacesAutocompleteRef } from "react-native-google-places-autocomplete";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as Location from 'expo-location';
import { LocationSearchBar } from "../components/LocationSearchBar";
import AlarmBottomSheet from "../components/AlarmBottomSheet";
import { LocationCoordinates, MapRegion } from "../types";
import { usePlaceDetails } from "../hooks/usePlaceDetails";

const FALLBACK_REGION: MapRegion = {
  latitude: -32.8895,
  longitude: -68.8458,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export const MapScreen = () => {
  const mapRef = useRef<MapView>(null);
  const searchRef = useRef<GooglePlacesAutocompleteRef>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [pendingSheet, setPendingSheet] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates | null>(null);
  const [userLocation, setUserLocation] = useState<LocationCoordinates | null>(null);
  const { placeDetails, isLoading } = usePlaceDetails(selectedLocation, userLocation);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación para calcular el tiempo de viaje.');
        setUserLocation({ latitude: FALLBACK_REGION.latitude, longitude: FALLBACK_REGION.longitude });
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const currentCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(currentCoords);

      mapRef.current?.animateToRegion({
        ...currentCoords,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }, 0);
    })();
  }, []);

  const handleLocationUpdate = (location: LocationCoordinates, updateSearchText: boolean = false) => {
    Keyboard.dismiss();
    const isSameLocation = 
      selectedLocation?.latitude === location.latitude && 
      selectedLocation?.longitude === location.longitude;

    setSelectedLocation(location);

    if (updateSearchText) {
      const coordString = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
      searchRef.current?.setAddressText(coordString);
    }

    if (isSameLocation) {
      bottomSheetModalRef.current?.present();
      return;
    }

    setPendingSheet(true);

    mapRef.current?.animateToRegion(
      {
        ...location,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      1000
    );
  };

  const handleClearSelection = () => {
    setSelectedLocation(null);
    searchRef.current?.setAddressText("");
    Keyboard.dismiss();
    bottomSheetModalRef.current?.dismiss(); 
  };

  const onMapPress = (e: LongPressEvent) => {
    handleLocationUpdate(e.nativeEvent.coordinate, true);
  };

  return (
    <>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          showsUserLocation={true}
          showsMyLocationButton={false}
          initialRegion={FALLBACK_REGION}
          onLongPress={onMapPress}
          onRegionChangeComplete={() => {
            // 3. El mapa avisa que terminó de moverse. ¿Había un modal pendiente? ¡Ábrelo!
            if (pendingSheet) {
              bottomSheetModalRef.current?.present();
              setPendingSheet(false);
            }
          }}
        >
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              onPress={() => {
                // Si tocan el marcador directamente, el mapa no se mueve, solo abrimos
                bottomSheetModalRef.current?.present();
              }}
            />
          )}
        </MapView>

        <LocationSearchBar
          ref={searchRef}
          hasSelection={!!selectedLocation}
          onLocationSelect={(loc) => handleLocationUpdate(loc, false)}
          onClear={handleClearSelection}
          onClose={Keyboard.dismiss}
        />
      </View>

      <AlarmBottomSheet
        ref={bottomSheetModalRef}
        key="constant-bottom-sheet"
        locationData={placeDetails}
        isLoading={isLoading}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  searchContainer: {
    position: "absolute",
    top: 60,
    width: "94%",
    alignSelf: "center",
    zIndex: 10,
  },
  textInputContainer: {
    backgroundColor: "white",
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    paddingHorizontal: 25,
  },
  textInput: {
    height: 58,
    color: "#000",
    fontSize: 16,
    backgroundColor: "transparent",
    marginTop: 0,
    marginBottom: 0,
    paddingHorizontal: 15,
  },
  listView: {
    backgroundColor: "white",
    borderRadius: 12,
    marginTop: 5,
    elevation: 5,
  },
})

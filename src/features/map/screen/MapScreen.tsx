import React, { useRef, useState } from "react";
import { StyleSheet, View, Keyboard, Platform } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, LongPressEvent, Circle } from "react-native-maps";
import { GooglePlacesAutocompleteRef } from "react-native-google-places-autocomplete";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import MapViewDirections from 'react-native-maps-directions';
import { MousePointer2 } from "lucide-react-native";
import { LocationSearchBar } from "../components/LocationSearchBar";
import AlarmBottomSheet from "../components/AlarmBottomSheet";
import { usePlaceDetails } from "../hooks/usePlaceDetails";
import { useUserLocation } from "../hooks/useUserLocation";
import { useDebouncedBusStopsSync } from "../hooks/useDebouncedBusStopsSync";
import { useBusStopsStore } from "../store/busStopsStore";
import { LocationCoordinates, MapRegion } from "../types";

const FALLBACK_REGION: MapRegion = {
  latitude: -32.8895,
  longitude: -68.8458,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const GOOGLE_MAPS_APIKEY = Platform.OS === 'ios'
  ? process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY_IOS!
  : process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY_ANDROID!;

export const MapScreen = () => {
  const mapRef = useRef<MapView>(null);
  const searchRef = useRef<GooglePlacesAutocompleteRef>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [pendingSheet, setPendingSheet] = useState(false);
  const [mapRegion, setMapRegion] = useState<MapRegion>(FALLBACK_REGION);
  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates | null>(null);
  const { userLocation, heading } = useUserLocation({ latitude: FALLBACK_REGION.latitude, longitude: FALLBACK_REGION.longitude });
  const { placeDetails, isLoading } = usePlaceDetails(selectedLocation, userLocation);
  const visibleBusStops = useBusStopsStore((s) => s.visibleStops);

  useDebouncedBusStopsSync(mapRegion);
  
  const [alarmRadius, setAlarmRadius] = useState(300); //RADIO HARDCODEADO


  const handleLocationUpdate = (location: LocationCoordinates, updateSearchText: boolean = false) => {
    Keyboard.dismiss();
    const isSameLocation = selectedLocation?.latitude === location.latitude && selectedLocation?.longitude === location.longitude;

    setSelectedLocation(location);

    if (updateSearchText) {
      searchRef.current?.setAddressText(`${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`);
    }

    if (isSameLocation) {
      bottomSheetModalRef.current?.present();
      return;
    }

    setPendingSheet(true);
    mapRef.current?.animateToRegion(
      { ...location, latitudeDelta: 0.005, longitudeDelta: 0.005 },
      1000
    );
  };

  const handleClearSelection = () => {
    setSelectedLocation(null);
    searchRef.current?.setAddressText("");
    Keyboard.dismiss();
    bottomSheetModalRef.current?.dismiss();
  };

  const onMapPress = (e: LongPressEvent) => handleLocationUpdate(e.nativeEvent.coordinate, true);


  return (
    <>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          showsUserLocation={!selectedLocation}
          showsMyLocationButton={false}
          initialRegion={FALLBACK_REGION}
          onLongPress={onMapPress}
          onRegionChangeComplete={(region) => {
            setMapRegion(region);
            if (pendingSheet) {
              bottomSheetModalRef.current?.present();
              setPendingSheet(false);
            }
          }}
        >
          {visibleBusStops.map((stop, index) => (
            <Marker
              key={`bus-stop-${stop.id}-${index}`}
              coordinate={{ latitude: stop.lat, longitude: stop.lon }}
              tracksViewChanges={false}
              pinColor="#6B7280"
              title={stop.nombre}
            />
          ))}

          {selectedLocation && (
            <>
              <Circle
                center={selectedLocation}
                radius={alarmRadius}
                fillColor="rgba(249, 191, 83, 0.3)"
                strokeColor="rgba(249, 191, 83, 0.5)"
                strokeWidth={2}
              />
              <Marker pinColor={"#0D393C"} coordinate={selectedLocation} onPress={() => bottomSheetModalRef.current?.present()} />
            </>
          )}

          {userLocation && selectedLocation && (
            <Marker coordinate={userLocation} rotation={heading} flat={true} anchor={{ x: 0.5, y: 0.5 }}>
              <View>
                <MousePointer2 size={24} color="#0D393C" fill={"#0D393C"} />
              </View>
            </Marker>
          )}

          {userLocation && selectedLocation && (
            <MapViewDirections
              origin={userLocation}
              destination={selectedLocation}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={8}
              strokeColor="rgba(249, 191, 83, 1)"
              mode="TRANSIT"
              precision="high"
              lineDashPattern={[0]}
              onReady={(result) => {
                mapRef.current?.fitToCoordinates(result.coordinates, {
                  edgePadding: { right: 50, bottom: 50, left: 50, top: 100 },
                });
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

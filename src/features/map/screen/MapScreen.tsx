import React from "react";
import { StyleSheet, View, Keyboard, Platform } from "react-native";
import { PROVIDER_GOOGLE, LongPressEvent, Circle, Marker } from "react-native-maps";
import ClusteredMapView from "react-native-map-clustering";
import MapViewDirections from "react-native-maps-directions";
import { MousePointer2 } from "lucide-react-native";
import { LocationSearchBar } from "../components/LocationSearchBar";
import BusStopMarker from "../components/BusStopMarker";
import AlarmBottomSheet from "@/features/alarm/components/AlarmBottomSheet";
import { OngoingTripSheet } from "@/features/alarm/components/OngoingTripSheet";
import { usePlaceDetails } from "../hooks/usePlaceDetails";
import { useUserLocation } from "../hooks/useUserLocation";
import { useDebouncedBusStopsSync } from "../hooks/useDebouncedBusStopsSync";
import { useBusStopsStore } from "../store/busStopsStore";
import { useMapController } from "../hooks/useMapController"; // Nuestro nuevo hook
import { CancelAlarmConfirmationModal } from "@/features/alarm/components/CancelAlarmModal";

const GOOGLE_MAPS_APIKEY = Platform.OS === "ios"
  ? process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY_IOS!
  : process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY_ANDROID!;

export const MapScreen = () => {
  const mapRef = useRef<MapView>(null);
  const searchRef = useRef<GooglePlacesAutocompleteRef>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [pendingSheet, setPendingSheet] = useState(false);
  const [mapRegion, setMapRegion] = useState<MapRegion>(FALLBACK_REGION);
  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates | null>(null);
  const { userLocation, heading } = useUserLocation({
    latitude: FALLBACK_REGION.latitude,
    longitude: FALLBACK_REGION.longitude
  },selectedLocation);
  const { placeDetails, isLoading } = usePlaceDetails(selectedLocation, userLocation);
  const visibleBusStops = useBusStopsStore((s) => s.visibleStops);
  const { refs, state, actions } = useMapController(userLocation);
  const { placeDetails, isLoading } = usePlaceDetails(state.selectedLocation, userLocation);
  useDebouncedBusStopsSync(state.mapRegion);

  const onMapPress = (e: LongPressEvent) => actions.handleLocationUpdate(e.nativeEvent.coordinate, true);

  return (
    <>
      <View style={styles.container}>
        <ClusteredMapView
          ref={refs.mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          showsUserLocation={!state.isTripActive}
          showsMyLocationButton={false}
          initialRegion={{ latitude: -32.8895, longitude: -68.8458, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }}
          onLongPress={onMapPress}
          clusterColor="#0D393C"
          clusterTextColor="#F9BF53"
          radius={40}
          maxZoom={16}
          minPoints={3}
          onRegionChangeComplete={actions.setMapRegion}
        >
          {visibleBusStops.map((stop) => (
            <BusStopMarker key={`bus-stop-${stop.id}`} stop={stop} />
          ))}

          {state.selectedLocation && (
            <>
              <Circle
                center={state.selectedLocation}
                radius={state.alarmRadius}
                fillColor="rgba(249, 191, 83, 0.3)"
                strokeColor="rgba(249, 191, 83, 0.5)"
                strokeWidth={2}
              />
              <Marker
                pinColor="#0D393C"
                coordinate={state.selectedLocation}
                onPress={() => !state.isTripActive && refs.bottomSheetModalRef.current?.present()}
              />
            </>
          )}

          {userLocation && state.isTripActive && (
            <Marker coordinate={userLocation} rotation={heading} flat anchor={{ x: 0.5, y: 0.5 }}>
              <View>
                <MousePointer2 size={24} color="#0D393C" fill="#0D393C" />
              </View>
            </Marker>
          )}

          {userLocation && state.selectedLocation && (
            <MapViewDirections
              origin={userLocation}
              destination={state.selectedLocation}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={8}
              strokeColor="rgba(249, 191, 83, 1)"
              mode="TRANSIT"
              precision="high"
              lineDashPattern={[0]}
              onReady={(result) => {
                refs.mapRef.current?.fitToCoordinates(result.coordinates, {
                  edgePadding: { right: 50, bottom: 350, left: 50, top: 100 },
                  animated: true,
                });
              }}
            />
          )}
        </ClusteredMapView>

        {!state.isTripActive && (
          <LocationSearchBar
            ref={refs.searchRef}
            hasSelection={!!state.selectedLocation}
            onLocationSelect={(loc) => actions.handleLocationUpdate(loc, false)}
            onClear={actions.handleSearchBarClear}
            onClose={Keyboard.dismiss}
          />
        )}

        {state.isTripActive && state.selectedLocation && (
          <OngoingTripSheet
            distance={state.distanceToTarget}
            onCancelAlarm={actions.handleRequestCancelAlarm}
          />

        )}
          <CancelAlarmConfirmationModal
          visible={state.showCancelConfirmation}
          onConfirm={actions.handleConfirmCancelAlarm} 
          onCancel={actions.handleDismissCancelConfirmation}
        />
      </View>

      <AlarmBottomSheet
        ref={refs.bottomSheetModalRef}
        key="constant-bottom-sheet"
        locationData={placeDetails}
        isLoading={isLoading}
        onRadiusChange={actions.setAlarmRadius}
        onDismiss={actions.handleBottomSheetDismiss}
        onActivateAlarm={actions.handleActivateAlarm}
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
});
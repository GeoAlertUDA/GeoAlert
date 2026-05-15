import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Keyboard, Platform, Text } from "react-native";
import MapView, { PROVIDER_GOOGLE, LongPressEvent, Circle, Marker } from "react-native-maps";
import ClusteredMapView from "react-native-map-clustering";
import MapViewDirections from "react-native-maps-directions";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { GooglePlacesAutocompleteRef } from "react-native-google-places-autocomplete";
import { MousePointer2, Leaf, Zap, ShieldCheck } from "lucide-react-native";
import { LocationSearchBar } from "../components/LocationSearchBar";
import BusStopMarker from "../components/BusStopMarker";
import AlarmBottomSheet from "@/features/alarm/components/AlarmBottomSheet";
import { OngoingTripSheet } from "@/features/alarm/components/OngoingTripSheet";
import { usePlaceDetails } from "../hooks/usePlaceDetails";
import { useDebouncedBusStopsSync } from "../hooks/useDebouncedBusStopsSync";
import { useBusStopsStore } from "../store/busStopsStore";
import { useMapController, FALLBACK_REGION } from "../hooks/useMapController";
import { CancelAlarmConfirmationModal } from "@/features/alarm/components/CancelAlarmModal";
import { LocationCoordinates, MapRegion } from "../types";

const GOOGLE_MAPS_APIKEY = Platform.OS === "ios"
  ? process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY_IOS!
  : process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY_ANDROID!;

export const MapScreen = () => {
  const { refs, state, actions } = useMapController();
  const { placeDetails, isLoading } = usePlaceDetails(state.selectedLocation, state.userLocation);
  const visibleBusStops = useBusStopsStore((s) => s.visibleStops);

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

          {state.userLocation && state.isTripActive && (
            <Marker coordinate={state.userLocation} rotation={state.heading} flat anchor={{ x: 0.5, y: 0.5 }}>
              <View>
                <MousePointer2 size={24} color="#0D393C" fill="#0D393C" />
              </View>
            </Marker>
          )}

          {state.userLocation && state.selectedLocation && (
            <MapViewDirections
              origin={state.userLocation}
              destination={state.selectedLocation}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={8}
              strokeColor="rgba(249, 191, 83, 1)"
              mode="DRIVING"
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

        {state.selectedLocation && (
          <View style={styles.badgeContainer}>
            <View style={[styles.badge, state.trackingMode === 'LOW' || state.trackingMode === 'BALANCED' ? styles.lowResourceBadge : styles.highPrecisionBadge]}>
              {state.trackingMode === 'LOW' || state.trackingMode === 'BALANCED' ? (
                <Leaf size={14} color="#0D393C" />
              ) : (
                <Zap size={14} color="#F9BF53" />
              )}
              <View style={{ width: 6 }} />
              <Text style={styles.badgeText}>
                {state.trackingMode === 'LOW' || state.trackingMode === 'BALANCED' ? 'AHORRO DE RECURSOS' : 'ALTA PRECISIÓN'}
              </Text>
            </View>
          </View>
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
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D393C',
    letterSpacing: 0.5,
  },
  badgeContainer: {
    position: "absolute",
    top: 130,
    alignSelf: "center",
    zIndex: 100,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  lowResourceBadge: {
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#A5D6A7",
  },
  highPrecisionBadge: {
    backgroundColor: "#FFF8E1",
    borderWidth: 1,
    borderColor: "#FFE082",
  },
});

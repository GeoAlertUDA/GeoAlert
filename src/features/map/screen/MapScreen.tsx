import React, { useEffect, useRef, useCallback, useState } from "react";
import {
  StyleSheet,
  View,
  Keyboard,
  Platform,
  TouchableOpacity,
  Text,
  InteractionManager,
} from "react-native";
import {
  PROVIDER_GOOGLE,
  LongPressEvent,
  Circle,
  Marker,
} from "react-native-maps";
import type { LatLng } from "react-native-maps";
import ClusteredMapView from "react-native-map-clustering";
import MapViewDirections from "react-native-maps-directions";
import {
  MousePointer2,
  Navigation,
  Leaf,
  Zap,
  AlarmClock,
} from "lucide-react-native";
import { useIsFocused } from "@react-navigation/native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LocationSearchBar } from "../components/LocationSearchBar";
import BusStopMarker from "../components/BusStopMarker";
import AlarmBottomSheet from "@/features/alarm/components/AlarmBottomSheet";
import { OngoingTripSheet } from "@/features/alarm/components/OngoingTripSheet";
import { usePlaceDetails } from "../hooks/usePlaceDetails";
import { useDebouncedBusStopsSync } from "../hooks/useDebouncedBusStopsSync";
import { useBusStopsStore } from "../store/busStopsStore";
import { useMapController } from "../hooks/useMapController";
import { CancelAlarmPickerModal } from "@/features/alarm/components/CancelAlarmPickerModal";
import { CancelAlarmConfirmationModal } from "@/features/alarm/components/CancelAlarmModal";
import { MAX_ACTIVE_ALARMS } from "@/features/alarm/constants/maxActiveAlarms";

const GOOGLE_MAPS_APIKEY =
  Platform.OS === "ios"
    ? process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY_IOS!
    : process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY_ANDROID!;

/** Botón “mi ubicación” nativo de Google + margen, y espacio del tab bar */
const NATIVE_MY_LOCATION_WIDTH = 56;
const NATIVE_MY_LOCATION_MARGIN = 16;
const TAB_BAR_CLEARANCE = Platform.OS === "ios" ? 88 : 96;
const FAB_STACK_GAP = 12;
/** Amarillo encima del nativo; verde a la izquierda, misma altura */
const fabRowBottom =
  TAB_BAR_CLEARANCE +
  NATIVE_MY_LOCATION_MARGIN +
  NATIVE_MY_LOCATION_WIDTH +
  FAB_STACK_GAP;

const ROUTE_STROKE_COLORS = [
  "rgba(249, 191, 83, 1)",
  "rgba(13, 57, 60, 0.9)",
  "rgba(137, 176, 145, 1)",
  "rgba(255, 107, 107, 0.95)",
  "rgba(65, 105, 225, 0.9)",
];

export const MapScreen = () => {
  const { refs, state, actions } = useMapController();
  const isFocused = useIsFocused();
  const [tripSheetUserDismissed, setTripSheetUserDismissed] = useState(false);
  const tripSheetRef = useRef<BottomSheetModal>(null);
  const prevActiveAlarmCountRef = useRef(state.activeAlarmCount);

  const { placeDetails, isLoading } = usePlaceDetails(
    state.selectedLocation,
    state.userLocation,
  );
  const visibleBusStops = useBusStopsStore((s) => s.visibleStops);

  useDebouncedBusStopsSync(state.mapRegion);

  const routeCoordsBufferRef = useRef<Record<number, LatLng[]>>({});
  const fitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeRouteIdsKey = state.activeAlarms
    .slice(0, MAX_ACTIVE_ALARMS)
    .map((a) => a.id)
    .join(",");

  useEffect(() => {
    routeCoordsBufferRef.current = {};
  }, [activeRouteIdsKey]);

  useEffect(() => {
    if (!state.isTripActive) {
      setTripSheetUserDismissed(false);
    }
  }, [state.isTripActive]);

  useEffect(() => {
    if (state.activeAlarmCount > prevActiveAlarmCountRef.current) {
      setTripSheetUserDismissed(false);
    }
    prevActiveAlarmCountRef.current = state.activeAlarmCount;
  }, [state.activeAlarmCount]);

  useEffect(() => {
    if (!isFocused || !state.isTripActive || tripSheetUserDismissed) {
      return;
    }
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const handle = InteractionManager.runAfterInteractions(() => {
      if (cancelled) return;
      timeoutId = setTimeout(() => {
        if (!cancelled) {
          tripSheetRef.current?.present();
        }
      }, 280);
    });
    return () => {
      cancelled = true;
      handle.cancel();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [
    isFocused,
    state.isTripActive,
    tripSheetUserDismissed,
    state.activeAlarmCount,
  ]);

  const scheduleFitToActiveRoutes = useCallback(() => {
    if (fitTimeoutRef.current) clearTimeout(fitTimeoutRef.current);
    fitTimeoutRef.current = setTimeout(() => {
      const parts = Object.values(routeCoordsBufferRef.current);
      const flat: LatLng[] = parts.flat();
      if (state.userLocation) {
        flat.push(state.userLocation);
      }
      if (flat.length > 1) {
        refs.mapRef.current?.fitToCoordinates(flat, {
          edgePadding: { right: 50, bottom: 350, left: 50, top: 100 },
          animated: true,
        });
      }
    }, 400);
  }, [state.userLocation, refs.mapRef]);

  const onMapPress = (e: LongPressEvent) =>
    actions.handleLocationUpdate(e.nativeEvent.coordinate, true);

  const showPlanningRoute =
    !state.isTripActive &&
    !!state.userLocation &&
    !!state.selectedLocation;

  const activeAlarmsToRoute = state.activeAlarms.slice(0, MAX_ACTIVE_ALARMS);

  return (
    <>
      <View style={styles.container}>
        <ClusteredMapView
          ref={refs.mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          showsUserLocation={!state.isTripActive}
          showsMyLocationButton={true}
          mapPadding={{ top: 0, right: 10, bottom: 70, left: 0 }}
          onPanDrag={actions.handleMapDrag}
          initialRegion={{
            latitude: -32.8895,
            longitude: -68.8458,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
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

          {state.activeAlarms.map((alarm) => (
            <React.Fragment key={`active-${alarm.id}`}>
              <Circle
                center={{
                  latitude: alarm.latitude,
                  longitude: alarm.longitude,
                }}
                radius={alarm.radius}
                fillColor="rgba(249, 191, 83, 0.2)"
                strokeColor="rgba(249, 191, 83, 0.45)"
                strokeWidth={2}
              />
              <Marker
                pinColor="#89B091"
                coordinate={{
                  latitude: alarm.latitude,
                  longitude: alarm.longitude,
                }}
              />
            </React.Fragment>
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
                onPress={() =>
                  !state.isTripActive &&
                  refs.bottomSheetModalRef.current?.present()
                }
              />
            </>
          )}

          {state.userLocation && state.isTripActive && (
            <Marker
              coordinate={state.userLocation}
              rotation={state.heading}
              flat
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View>
                <MousePointer2 size={24} color="#0D393C" fill="#0D393C" />
              </View>
            </Marker>
          )}

          {state.isTripActive &&
            state.userLocation &&
            activeAlarmsToRoute.map((alarm, index) => (
              <MapViewDirections
                key={`dir-active-${alarm.id}`}
                origin={state.userLocation!}
                destination={{
                  latitude: alarm.latitude,
                  longitude: alarm.longitude,
                }}
                apikey={GOOGLE_MAPS_APIKEY}
                strokeWidth={7}
                strokeColor={
                  ROUTE_STROKE_COLORS[index % ROUTE_STROKE_COLORS.length]
                }
                mode="DRIVING"
                precision="high"
                lineDashPattern={[0]}
                onReady={(result) => {
                  routeCoordsBufferRef.current[alarm.id] = result.coordinates;
                  scheduleFitToActiveRoutes();
                }}
              />
            ))}

          {showPlanningRoute && (
            <MapViewDirections
              origin={state.userLocation!}
              destination={state.selectedLocation!}
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

        {state.isTripActive && (
          <OngoingTripSheet
            sheetRef={tripSheetRef}
            distance={state.distanceToTarget}
            activeAlarmCount={state.activeAlarmCount}
            onCancelAlarm={actions.handleRequestCancelAlarm}
            onDismiss={() => setTripSheetUserDismissed(true)}
          />
        )}

        {state.isTripActive && tripSheetUserDismissed && (
          <TouchableOpacity
            style={styles.tripSummaryFab}
            onPress={() => {
              setTripSheetUserDismissed(false);
              requestAnimationFrame(() => tripSheetRef.current?.present());
            }}
            activeOpacity={0.85}
            accessibilityLabel="Mostrar viaje en curso"
          >
            <AlarmClock size={26} color="#FFFFFF" strokeWidth={2.2} />
          </TouchableOpacity>
        )}

        {state.isTripActive && !state.isFollowingUser && (
          <TouchableOpacity
            style={styles.recenterTripButton}
            onPress={actions.handleResumeTracking}
            activeOpacity={0.7}
            accessibilityLabel="Seguir mi ubicación"
          >
            <Navigation size={24} color="#0D393C" />
          </TouchableOpacity>
        )}

        {(state.isTripActive || state.selectedLocation) && (
          <View style={styles.badgeContainer}>
            <View
              style={[
                styles.badge,
                state.trackingMode === "LOW" ||
                state.trackingMode === "BALANCED"
                  ? styles.lowResourceBadge
                  : styles.highPrecisionBadge,
              ]}
            >
              {state.trackingMode === "LOW" ||
              state.trackingMode === "BALANCED" ? (
                <Leaf size={14} color="#0D393C" />
              ) : (
                <Zap size={14} color="#F9BF53" />
              )}
              <View style={{ width: 6 }} />
              <Text style={styles.badgeText}>
                {state.trackingMode === "LOW" ||
                state.trackingMode === "BALANCED"
                  ? "AHORRO DE RECURSOS"
                  : "ALTA PRECISIÓN"}
              </Text>
            </View>
          </View>
        )}

        <CancelAlarmPickerModal
          visible={state.showCancelPicker}
          alarms={state.activeAlarms}
          onClose={actions.handleDismissCancelPicker}
          onSelectAlarm={(id) => actions.handleSelectAlarmToCancel(id)}
        />

        <CancelAlarmConfirmationModal
          visible={state.showCancelConfirm}
          destinationLabel={state.cancelConfirmDestinationLabel}
          onContinueTrip={actions.handleContinueTripFromConfirm}
          onConfirmCancelAlarm={() => {
            void actions.handleConfirmCancelAlarm();
          }}
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
        isEditing={!!state.editingAlarmId}
        alarmId={state.editingAlarmId}
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
  tripSummaryFab: {
    position: "absolute",
    left: 16,
    bottom: fabRowBottom,
    backgroundColor: "#0D393C",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    zIndex: 10,
  },
  recenterTripButton: {
    position: "absolute",
    right: NATIVE_MY_LOCATION_MARGIN,
    bottom: fabRowBottom,
    backgroundColor: "#F9BF53",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    zIndex: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0D393C",
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

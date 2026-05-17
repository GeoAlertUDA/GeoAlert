import { useRef, useState, useEffect, useMemo } from "react";
import { Keyboard } from "react-native";
import MapView from "react-native-maps";
import { GooglePlacesAutocompleteRef } from "react-native-google-places-autocomplete";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LocationCoordinates, MapRegion } from "../types";
import { useUserLocation } from "./useUserLocation";
import { useAlarmStore } from "@/features/alarm/store/useAlarmStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { IAlarm } from "@/features/alarm/types/IAlarm";

export const FALLBACK_REGION: MapRegion = {
  latitude: -32.8895,
  longitude: -68.8458,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export function alarmDestinationLabel(alarm: IAlarm): string {
  const n = alarm.name?.trim();
  if (n) return n;
  const addr = alarm.address?.trim();
  if (addr) return addr;
  return "esta ubicación";
}

const calculateDistanceInMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371e3;
  const φ1 = lat1 * (Math.PI / 180);
  const φ2 = lat2 * (Math.PI / 180);
  const Δφ = (lat2 - lat1) * (Math.PI / 180);
  const Δλ = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};

const FOLLOW_CAMERA_MIN_MOVE_M = 14;
const FOLLOW_CAMERA_MIN_INTERVAL_MS = 4500;

export const useMapController = () => {
  const params = useLocalSearchParams<{
    editAlarmId?: string;
    editName?: string;
    editLatitude?: string;
    editLongitude?: string;
    editRadius?: string;
    editAddress?: string;
  }>();
  const router = useRouter();

  const alarms = useAlarmStore((s) => s.alarms);
  const loadAlarms = useAlarmStore((s) => s.loadAlarms);
  const cancelAlarm = useAlarmStore((s) => s.cancelAlarm);

  const activeAlarms = useMemo(
    () => alarms.filter((a: IAlarm) => a.isActive),
    [alarms],
  );
  const isTripActive = activeAlarms.length > 0;

  const [editingAlarmId, setEditingAlarmId] = useState<number | null>(null);

  const mapRef = useRef<MapView>(null);
  const searchRef = useRef<GooglePlacesAutocompleteRef>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const isActivatingRef = useRef(false);

  const [mapRegion, setMapRegion] = useState<MapRegion>(FALLBACK_REGION);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationCoordinates | null>(null);
  const [alarmRadius, setAlarmRadius] = useState(500);
  const [distanceToTarget, setDistanceToTarget] = useState(0);
  const [showCancelPicker, setShowCancelPicker] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [pendingCancelAlarmId, setPendingCancelAlarmId] = useState<
    number | null
  >(null);

  const cancelConfirmDestinationLabel = useMemo(() => {
    if (pendingCancelAlarmId == null) return "";
    const a = activeAlarms.find((x) => x.id === pendingCancelAlarmId);
    return a ? alarmDestinationLabel(a) : "";
  }, [pendingCancelAlarmId, activeAlarms]);

  const referencePoints = useMemo(() => {
    const fromAlarms = activeAlarms.map((a) => ({
      latitude: a.latitude,
      longitude: a.longitude,
    }));
    if (selectedLocation) {
      return [...fromAlarms, selectedLocation];
    }
    return fromAlarms;
  }, [activeAlarms, selectedLocation]);

  const { userLocation, heading, trackingMode } = useUserLocation(
    FALLBACK_REGION,
    referencePoints,
  );
  const [isFollowingUser, setIsFollowingUser] = useState(true);
  const lastFollowCameraRef = useRef<{
    lat: number;
    lng: number;
    time: number;
  } | null>(null);

  useEffect(() => {
    void loadAlarms();
  }, [loadAlarms]);

  useEffect(() => {
    if (!userLocation || activeAlarms.length === 0) {
      setDistanceToTarget(0);
      return;
    }
    const minM = Math.min(
      ...activeAlarms.map((a) =>
        calculateDistanceInMeters(
          userLocation.latitude,
          userLocation.longitude,
          a.latitude,
          a.longitude,
        ),
      ),
    );
    setDistanceToTarget(minM);
  }, [userLocation, activeAlarms]);

  useEffect(() => {
    if (!isTripActive || !isFollowingUser || !userLocation) {
      if (!isTripActive || !isFollowingUser) {
        lastFollowCameraRef.current = null;
      }
      return;
    }

    const now = Date.now();
    const last = lastFollowCameraRef.current;

    const movedM =
      last == null
        ? Number.POSITIVE_INFINITY
        : calculateDistanceInMeters(
            last.lat,
            last.lng,
            userLocation.latitude,
            userLocation.longitude,
          );

    const elapsedMs = last == null ? Number.POSITIVE_INFINITY : now - last.time;

    if (
      last != null &&
      movedM < FOLLOW_CAMERA_MIN_MOVE_M &&
      elapsedMs < FOLLOW_CAMERA_MIN_INTERVAL_MS
    ) {
      return;
    }

    lastFollowCameraRef.current = {
      lat: userLocation.latitude,
      lng: userLocation.longitude,
      time: now,
    };

    mapRef.current?.animateCamera(
      {
        center: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
        pitch: 45,
        zoom: 16,
      },
      { duration: 1000 },
    );
  }, [userLocation, isTripActive, isFollowingUser]);

  useEffect(() => {
    if (params.editAlarmId && params.editLatitude && params.editLongitude) {
      const lat = parseFloat(params.editLatitude);
      const lon = parseFloat(params.editLongitude);
      const rad = parseInt(params.editRadius || "500", 10);

      setEditingAlarmId(Number(params.editAlarmId));
      setSelectedLocation({ latitude: lat, longitude: lon });
      setAlarmRadius(rad);

      mapRef.current?.animateToRegion(
        {
          latitude: lat,
          longitude: lon,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        800,
      );

      setTimeout(() => bottomSheetModalRef.current?.present(), 280);

      router.setParams({
        editAlarmId: undefined,
        editName: undefined,
        editLatitude: undefined,
        editLongitude: undefined,
        editRadius: undefined,
        editAddress: undefined,
      });
    }
  }, [params.editAlarmId, params.editLatitude, params.editLongitude]);

  const clearMapStates = () => {
    setSelectedLocation(null);
    searchRef.current?.setAddressText("");
    Keyboard.dismiss();
  };

  const handleMapDrag = () => {
    if (isTripActive && isFollowingUser) {
      setIsFollowingUser(false);
    }
  };

  const handleResumeTracking = () => {
    lastFollowCameraRef.current = null;
    setIsFollowingUser(true);
  };

  const handleLocationUpdate = (
    location: LocationCoordinates,
    updateSearchText = false,
  ) => {
    Keyboard.dismiss();
    setAlarmRadius(500);

    const isSameLocation =
      selectedLocation?.latitude === location.latitude &&
      selectedLocation?.longitude === location.longitude;

    setSelectedLocation(location);

    if (updateSearchText) {
      searchRef.current?.setAddressText(
        `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
      );
    }

    setTimeout(() => bottomSheetModalRef.current?.present(), 280);

    if (!isSameLocation) {
      mapRef.current?.animateToRegion(
        { ...location, latitudeDelta: 0.01, longitudeDelta: 0.01 },
        1000,
      );
    }
  };

  const handleSearchBarClear = () => {
    clearMapStates();
    bottomSheetModalRef.current?.dismiss();
  };

  const handleBottomSheetDismiss = () => {
    setEditingAlarmId(null);
    if (isActivatingRef.current) {
      isActivatingRef.current = false;
    } else if (!isTripActive) {
      clearMapStates();
    }
  };

  const handleActivateAlarm = (_alarmId: number) => {
    isActivatingRef.current = true;
  };

  const handleRequestCancelAlarm = () => {
    if (activeAlarms.length === 0) return;
    if (activeAlarms.length === 1) {
      setPendingCancelAlarmId(activeAlarms[0].id);
      setShowCancelConfirm(true);
      return;
    }
    setShowCancelPicker(true);
  };

  const handleDismissCancelPicker = () => {
    setShowCancelPicker(false);
  };

  const handleSelectAlarmToCancel = (id: number) => {
    setShowCancelPicker(false);
    setPendingCancelAlarmId(id);
    setShowCancelConfirm(true);
  };

  const handleContinueTripFromConfirm = () => {
    setShowCancelConfirm(false);
    setPendingCancelAlarmId(null);
  };

  const handleConfirmCancelAlarm = async () => {
    const id = pendingCancelAlarmId;
    setShowCancelConfirm(false);
    setPendingCancelAlarmId(null);
    if (id == null) return;
    await cancelAlarm(id);
    const stillActive = useAlarmStore
      .getState()
      .alarms.some((a) => a.isActive);
    if (!stillActive) {
      clearMapStates();
    }
  };

  return {
    refs: { mapRef, searchRef, bottomSheetModalRef },
    state: {
      mapRegion,
      selectedLocation,
      alarmRadius,
      isTripActive,
      distanceToTarget,
      showCancelPicker,
      showCancelConfirm,
      cancelConfirmDestinationLabel,
      userLocation,
      heading,
      isFollowingUser,
      trackingMode,
      editingAlarmId,
      activeAlarms,
      activeAlarmCount: activeAlarms.length,
    },
    actions: {
      setMapRegion,
      setAlarmRadius,
      handleLocationUpdate,
      handleSearchBarClear,
      handleBottomSheetDismiss,
      handleActivateAlarm,
      handleRequestCancelAlarm,
      handleDismissCancelPicker,
      handleSelectAlarmToCancel,
      handleContinueTripFromConfirm,
      handleConfirmCancelAlarm,
      handleMapDrag,
      handleResumeTracking,
    },
  };
};

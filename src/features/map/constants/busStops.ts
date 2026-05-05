import type { MapRegion } from "../types";

export const BUS_STOPS_MAX_LATITUDE_DELTA = 0.018;

export const BUS_STOPS_MAX_MARKERS = 250;

export const BUS_STOPS_DEBOUNCE_MS = 320;

export function isZoomSufficientForBusStops(region: MapRegion): boolean {
  return (
    region.latitudeDelta <= BUS_STOPS_MAX_LATITUDE_DELTA &&
    region.longitudeDelta <= BUS_STOPS_MAX_LATITUDE_DELTA * 2.5
  );
}

import type { IBusStop } from "@/types/IBusStop";
import type { MapRegion } from "../types";
import {
  BUS_STOPS_MAX_MARKERS,
  isZoomSufficientForBusStops,
} from "../constants/busStops";

export function bboxFromRegion(region: MapRegion): {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
} {
  const halfLat = region.latitudeDelta / 2;
  const halfLon = region.longitudeDelta / 2;
  return {
    minLat: region.latitude - halfLat,
    maxLat: region.latitude + halfLat,
    minLon: region.longitude - halfLon,
    maxLon: region.longitude + halfLon,
  };
}

function isInBbox(stop: IBusStop, box: ReturnType<typeof bboxFromRegion>): boolean {
  return (
    stop.lat >= box.minLat &&
    stop.lat <= box.maxLat &&
    stop.lon >= box.minLon &&
    stop.lon <= box.maxLon
  );
}

/**
 * Devuelve hasta BUS_STOPS_MAX_MARKERS paradas dentro del rectángulo visible.
 * Si no hay zoom suficiente, lista vacía.
 */
export function filterBusStopsInRegion(
  allStops: IBusStop[],
  region: MapRegion,
): IBusStop[] {
  if (!isZoomSufficientForBusStops(region)) return [];
  const box = bboxFromRegion(region);
  const inView = allStops.filter((s) => isInBbox(s, box));
  return inView.slice(0, BUS_STOPS_MAX_MARKERS);
}

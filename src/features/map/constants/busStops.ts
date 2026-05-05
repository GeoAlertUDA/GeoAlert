import type { MapRegion } from "../types";

/** Con zoom amplio, latitudeDelta es grande; al acercarse, el delta baja. Solo mostramos paradas si el delta es menor a este umbral. */
export const BUS_STOPS_MAX_LATITUDE_DELTA = 0.018;

/** Máximo de markers de parada en pantalla (rendimiento, sobre todo Android). */
export const BUS_STOPS_MAX_MARKERS = 250;

/** ms entre fin de gesto de mapa y recálculo de paradas visibles */
export const BUS_STOPS_DEBOUNCE_MS = 320;

export function isZoomSufficientForBusStops(region: MapRegion): boolean {
  return (
    region.latitudeDelta <= BUS_STOPS_MAX_LATITUDE_DELTA &&
    region.longitudeDelta <= BUS_STOPS_MAX_LATITUDE_DELTA * 2.5
  );
}

import { useEffect, useRef } from "react";
import type { MapRegion } from "../types";
import { BUS_STOPS_DEBOUNCE_MS } from "../constants/busStops";
import { useBusStopsStore } from "../store/busStopsStore";

export function useDebouncedBusStopsSync(mapRegion: MapRegion | null) {
  const setVisibleFromRegion = useBusStopsStore((s) => s.setVisibleFromRegion);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!mapRegion){
      return;
    } 
    if (timeoutRef.current){ 
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setVisibleFromRegion(mapRegion);
      timeoutRef.current = null;
    }, BUS_STOPS_DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current){
         clearTimeout(timeoutRef.current);
        }
    };
  }, [mapRegion, setVisibleFromRegion]);
}

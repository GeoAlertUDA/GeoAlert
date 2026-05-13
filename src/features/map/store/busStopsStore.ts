import { create } from "zustand";
import type { IBusStop } from "@/types/IBusStop";
import type { MapRegion } from "../types";
import { ALL_BUS_STOPS } from "../data/busStopsData";
import { filterBusStopsInRegion } from "../utils/filterBusStopsByRegion";

interface BusStopsState {
  visibleStops: IBusStop[];
  setVisibleFromRegion: (region: MapRegion) => void;
}

export const useBusStopsStore = create<BusStopsState>((set) => ({
  visibleStops: [],
  setVisibleFromRegion: (region) =>
    set({ visibleStops: filterBusStopsInRegion([...ALL_BUS_STOPS], region) }),
}));

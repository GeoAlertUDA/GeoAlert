import raw from "../data/paradas.json";
import type { IBusStop } from "@/types/IBusStop";

export const ALL_BUS_STOPS: readonly IBusStop[] = raw as IBusStop[];

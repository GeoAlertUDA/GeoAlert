import raw from "../data/paradas.json";
import type { IBusStop } from "@/types/IBusStop";

/** Lista estática embebida en el bundle (generada con `scripts/kml-to-json.js`). */
export const ALL_BUS_STOPS: readonly IBusStop[] = raw as IBusStop[];

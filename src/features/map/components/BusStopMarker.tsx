import React from "react";
import { Marker } from "react-native-maps";
import type { IBusStop } from "@/types/IBusStop";

const BUS_STOP_ICON = require("../assets/images/bus-stop.png");

interface Props {
  stop: IBusStop;
}

const BusStopMarker = React.memo(({ stop }: Props) => (
  <Marker
    coordinate={{ latitude: stop.lat, longitude: stop.lon }}
    tracksViewChanges={false}
    title={stop.nombre}
    image={BUS_STOP_ICON}
    anchor={{ x: 0.5, y: 0.5 }}
  />
));
BusStopMarker.displayName = "BusStopMarker";

export default BusStopMarker;
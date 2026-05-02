export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface MapRegion extends LocationCoordinates {
  latitudeDelta: number;
  longitudeDelta: number;
}
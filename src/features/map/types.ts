export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface MapRegion extends LocationCoordinates {
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface PlaceDetails extends LocationCoordinates {
  name: string;
  address: string;
  distanceText: string; 
  durationText: string; 
  photoUrl: string | null;
  radius: number
}
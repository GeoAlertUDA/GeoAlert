// screens/MapScreen.tsx
import React, { useRef, useState } from "react";
import { StyleSheet, View, TouchableWithoutFeedback, Keyboard } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, MapPressEvent, LongPressEvent } from "react-native-maps";
import { GooglePlacesAutocompleteRef } from "react-native-google-places-autocomplete";
import { LocationSearchBar } from "../components/LocationSearchBar";
import { LocationCoordinates, MapRegion } from "../types";

const INITIAL_REGION: MapRegion = {
  latitude: -32.8895,
  longitude: -68.8458,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export const MapScreen = () => {
  const mapRef = useRef<MapView>(null);
  const searchRef = useRef<GooglePlacesAutocompleteRef>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates | null>(null);

  const handleLocationUpdate = (location: LocationCoordinates, updateSearchText: boolean = false) => {
    setSelectedLocation(location);
    
    if (updateSearchText) {
      const coordString = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
      searchRef.current?.setAddressText(coordString);
    }

    mapRef.current?.animateToRegion({
      ...location,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 1000);

    console.log("Ubicación guardada:", location);
  };

  const onMapPress = (e: LongPressEvent) => {
    const { coordinate } = e.nativeEvent;
    handleLocationUpdate(coordinate, true);
    Keyboard.dismiss();
  };

  function handleClearSelection(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={INITIAL_REGION}
          onLongPress={onMapPress}
        >
          {selectedLocation && <Marker coordinate={selectedLocation} />}
        </MapView>
        
       <LocationSearchBar 
          ref={searchRef}
          hasSelection={!!selectedLocation} 
          onLocationSelect={(loc) => handleLocationUpdate(loc, false)} 
          onClear={handleClearSelection} 
          onClose={() => Keyboard.dismiss()}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  searchContainer: {
    position: "absolute",
    top: 60,
    width: "94%",
    alignSelf: "center",
    zIndex: 10,
  },
  textInputContainer: {
    backgroundColor: "white",
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    paddingHorizontal: 25,
  },
  textInput: {
    height: 58,
    color: "#000",
    fontSize: 16,
    backgroundColor: "transparent",
    marginTop: 0,
    marginBottom: 0,
    paddingHorizontal: 15,
  },
  listView: {
    backgroundColor: "white",
    borderRadius: 12,
    marginTop: 5,
    elevation: 5,
  },
})

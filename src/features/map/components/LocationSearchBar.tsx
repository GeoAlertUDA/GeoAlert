import React, { forwardRef, useRef, useState } from "react";
import { StyleSheet, View, TouchableOpacity, Keyboard } from "react-native";
import {
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from "react-native-google-places-autocomplete";
import { X, Search } from "lucide-react-native";
import { LocationCoordinates } from "../types";

interface LocationSearchBarProps {
  hasSelection: boolean;
  onLocationSelect: (location: LocationCoordinates) => void;
  onClear: () => void;
  onClose: () => void;
}

export const LocationSearchBar = forwardRef<GooglePlacesAutocompleteRef, LocationSearchBarProps>(
  ({ hasSelection, onLocationSelect, onClear, onClose }, ref) => {
    const [searchText, setSearchText] = useState("");

  const showClearButton = searchText.length > 0 || hasSelection;

  const handleClear = () => {
    setSearchText("");
    // @ts-ignore 
    if (ref && "current" in ref) ref.current?.setAddressText("");
    onClose();
  };

  const handleIconPress = () => {
      if (showClearButton) {
        setSearchText("");
        if (typeof ref !== 'function' && ref?.current) {
          ref.current.setAddressText("");
        }
        onClear();
      } else {
        if (typeof ref !== 'function' && ref?.current) {
          ref.current.focus();
        }
      }
    };

  return (
    <View style={styles.searchContainer}>
      <GooglePlacesAutocomplete
        ref={ref}
        placeholder="¿A dónde vas hoy?"
        fetchDetails={true}
        onPress={(data, details = null) => {
          if (details) {
            onLocationSelect({
              latitude: details.geometry.location.lat,
              longitude: details.geometry.location.lng,
            });
          }
        }}
        textInputProps={{
          onChangeText: setSearchText,
          placeholderTextColor: "#333333",
          clearButtonMode: "never",
        }}
        query={{
          key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY_IOS,
          language: "es",
          components: "country:ar",
        }}
       renderRightButton={() => (
            <TouchableOpacity onPress={handleIconPress} style={styles.iconContainer}>
              {showClearButton ? <X size={20} color="#333" /> : <Search size={20} color="#333" />}
            </TouchableOpacity>
          )}
        styles={{
          textInputContainer: styles.textInputContainer,
          textInput: styles.textInput,
          listView: styles.listView,
        }}
        enablePoweredByContainer={false}
      />
    </View>
  );
});

const styles = StyleSheet.create({
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
  iconContainer: {
    justifyContent: "center",
    paddingRight: 3,
  },
});

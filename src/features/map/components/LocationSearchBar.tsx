import React, { forwardRef, useState } from "react";
import { StyleSheet, TouchableOpacity, Platform } from "react-native";
import {
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from "react-native-google-places-autocomplete";
import { X, Search } from "lucide-react-native";
import { LocationCoordinates } from "../types";
import { SafeAreaView } from "react-native-safe-area-context";

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
      <SafeAreaView style={[styles.searchContainer, { elevation: 10 }]}>
        <GooglePlacesAutocomplete
          ref={ref}
          debounce={300}
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
            key: Platform.OS === 'ios'
              ? process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY_IOS
              : process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY_ANDROID,
            language: "es",
            components: "country:ar",
            location: "-32.8895,-68.8458",
            radius: "200000",
            strictbounds: false,
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
      </SafeAreaView>
    );
  });

LocationSearchBar.displayName = "LocationSearchBar";

const styles = StyleSheet.create({
  searchContainer: {
    position: "absolute",
    top: 5,
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

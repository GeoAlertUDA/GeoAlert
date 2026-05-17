import { useState, useEffect, useRef } from "react";
import { PlaceDetails, LocationCoordinates } from "../types";

const GOOGLE_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY_IOS ||
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY_ANDROID;

const DISTANCE_DEBOUNCE_MS = 1800;

export const usePlaceDetails = (
  destination: LocationCoordinates | null,
  userLocation: LocationCoordinates | null,
) => {
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Geocode + Place: solo cuando cambia el destino (no en cada tick de GPS). */
  useEffect(() => {
    if (!destination) {
      setPlaceDetails(null);
      setError(null);
      return;
    }

    const fetchStatic = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { latitude: destLat, longitude: destLng } = destination;

        const geocodeResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${destLat},${destLng}&key=${GOOGLE_API_KEY}`,
        );
        const geocodeData = await geocodeResponse.json();

        if (geocodeData.status !== "OK" || !geocodeData.results.length) {
          throw new Error(
            `Error de Google: ${geocodeData.status} - ${geocodeData.error_message || "Sin mensaje"}`,
          );
        }

        const bestResult = geocodeData.results[0];
        const placeId = bestResult.place_id;

        let finalName = "Ubicación seleccionada";
        let finalPhotoUrl = null;
        let finalAddress = bestResult.formatted_address;

        if (placeId) {
          const placeDetailsResponse = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,photos&key=${GOOGLE_API_KEY}`,
          );
          const placeDetailsData = await placeDetailsResponse.json();

          if (placeDetailsData.result) {
            if (placeDetailsData.result.name) {
              finalName = placeDetailsData.result.name;
            }

            if (
              placeDetailsData.result.photos &&
              placeDetailsData.result.photos.length > 0
            ) {
              const photoRef =
                placeDetailsData.result.photos[0].photo_reference;
              finalPhotoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${GOOGLE_API_KEY}`;
            }
          }
        }

        setPlaceDetails({
          latitude: destLat,
          longitude: destLng,
          name: finalName,
          address: finalAddress,
          distanceText: "-- km",
          durationText: "-- min",
          photoUrl: finalPhotoUrl,
          radius: 500,
        });
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("No pudimos obtener los detalles de esta ubicación.");
        setPlaceDetails(null);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchStatic();
  }, [destination?.latitude, destination?.longitude]);

  const baseReady = Boolean(
    destination &&
      placeDetails &&
      placeDetails.latitude === destination.latitude &&
      placeDetails.longitude === destination.longitude,
  );

  /** Distance Matrix: debounced; evita refetch en cada actualización de userLocation. */
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!baseReady || !destination || !userLocation) {
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      const { latitude: destLat, longitude: destLng } = destination;

      void (async () => {
        try {
          const distanceResponse = await fetch(
            `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${userLocation.latitude},${userLocation.longitude}&destinations=${destLat},${destLng}&key=${GOOGLE_API_KEY}`,
          );
          const distanceData = await distanceResponse.json();

          let finalDistanceText = "-- km";
          let finalDurationText = "-- min";

          if (distanceData?.rows?.[0]?.elements?.[0]?.status === "OK") {
            const element = distanceData.rows[0].elements[0];
            finalDistanceText = element.distance.text;
            finalDurationText = element.duration.text;
          }

          setPlaceDetails((prev) =>
            prev && prev.latitude === destLat && prev.longitude === destLng
              ? {
                  ...prev,
                  distanceText: finalDistanceText,
                  durationText: finalDurationText,
                }
              : prev,
          );
        } catch {
          // Mantener "--" si falla la matriz de distancias
        }
      })();
    }, DISTANCE_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [
    baseReady,
    destination?.latitude,
    destination?.longitude,
    userLocation?.latitude,
    userLocation?.longitude,
  ]);

  return { placeDetails, isLoading, error };
};

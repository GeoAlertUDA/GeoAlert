import { useState, useEffect } from 'react';
import { PlaceDetails, LocationCoordinates } from '../types';

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY_IOS || process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY_ANDROID;

export const usePlaceDetails = (
    destination: LocationCoordinates | null,
    userLocation: LocationCoordinates | null
) => {
    const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!destination) {
            setPlaceDetails(null);
            setError(null);
            return;
        }

        const fetchDetails = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const { latitude: destLat, longitude: destLng } = destination;
                const distancePromise = userLocation
                    ? fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${userLocation.latitude},${userLocation.longitude}&destinations=${destLat},${destLng}&key=${GOOGLE_API_KEY}`)
                        .then(res => res.json())
                    : Promise.resolve(null);


                const geocodeResponse = await fetch(
                    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${destLat},${destLng}&key=${GOOGLE_API_KEY}`
                );
                const geocodeData = await geocodeResponse.json();

                console.log("Respuesta Geocoding:", JSON.stringify(geocodeData, null, 2));

                if (geocodeData.status !== "OK" || !geocodeData.results.length) {
                    throw new Error(`Error de Google: ${geocodeData.status} - ${geocodeData.error_message || 'Sin mensaje'}`);
                }

                if (geocodeData.status !== "OK" || !geocodeData.results.length) {
                    throw new Error("No se pudo obtener la dirección.");
                }

                const bestResult = geocodeData.results[0];
                const placeId = bestResult.place_id;

    
                let finalName = "Ubicación seleccionada";
                let finalPhotoUrl = null;
                let finalAddress = bestResult.formatted_address;

                if (placeId) {
                    const placeDetailsResponse = await fetch(
                        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,photos&key=${GOOGLE_API_KEY}`
                    );
                    const placeDetailsData = await placeDetailsResponse.json();

                    if (placeDetailsData.result) {
                        if (placeDetailsData.result.name) {
                            finalName = placeDetailsData.result.name;
                        }

                        if (placeDetailsData.result.photos && placeDetailsData.result.photos.length > 0) {
                            const photoRef = placeDetailsData.result.photos[0].photo_reference;
                            finalPhotoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${GOOGLE_API_KEY}`;
                        }
                    }
                }

            
                const distanceData = await distancePromise;
                let finalDistanceText = "-- km";
                let finalDurationText = "-- min";

                if (distanceData?.rows?.[0]?.elements?.[0]?.status === "OK") {
                    const element = distanceData.rows[0].elements[0];
                    finalDistanceText = element.distance.text;
                    finalDurationText = element.duration.text;
                }

            
                setPlaceDetails({
                    latitude: destLat,
                    longitude: destLng,
                    name: finalName,
                    address: finalAddress,
                    distanceText: finalDistanceText,
                    durationText: finalDurationText,
                    photoUrl: finalPhotoUrl,
                    radius: 500
                });

            } catch (err) {
                console.error("Fetch Error:", err);
                setError("No pudimos obtener los detalles de esta ubicación.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [destination, userLocation]);

    return { placeDetails, isLoading, error };
};

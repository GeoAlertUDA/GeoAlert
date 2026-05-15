import { LocationCoordinates } from "../types";
//Fórmula de Haversine,calcula la distancia entre dos puntos en una esfera.
export const calculateDistance = (loc1: LocationCoordinates|null, loc2: LocationCoordinates|null): number => {
    if(!loc1 || !loc2){
        return 0;
    }
    const R = 6371; // Radio de la Tierra en km
    const dLat = (loc2.latitude - loc1.latitude) * (Math.PI / 180);
    const dLon = (loc2.longitude - loc1.longitude) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(loc1.latitude * (Math.PI / 180)) * 
        Math.cos(loc2.latitude * (Math.PI / 180)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; 
    return distance; // Devuelve la distancia exacta en Kilómetros
};
import * as Location from 'expo-location';

export const getTierConfig = (distance: number) => {
  if (distance > 20) {
    return { accuracy: Location.Accuracy.Low, timeInterval: 300000, distanceInterval: 1000 };
  } else if (distance > 5) {
    return { accuracy: Location.Accuracy.Balanced, timeInterval: 60000, distanceInterval: 500 };
  } else if (distance > 2) {
    return { accuracy: Location.Accuracy.High, timeInterval: 30000, distanceInterval: 100 };
  } else {
    return { accuracy: Location.Accuracy.Highest, timeInterval: 5000, distanceInterval: 5 };
  }
};
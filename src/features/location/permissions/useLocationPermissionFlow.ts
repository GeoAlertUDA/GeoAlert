import { useCallback, useState } from 'react';
import {
  confirmBackgroundPermissionExplanation,
  requestBackgroundLocationPermissions,
  showOpenSettingsAlert,
} from './locationPermissions';

export function useLocationPermissionFlow() {
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);

  const requestBackgroundAccess = useCallback(async () => {
    setIsRequestingPermissions(true);

    try {
      const result = await requestBackgroundLocationPermissions();

      if (!result.backgroundGranted) {
        showOpenSettingsAlert();
      }

      return result;
    } finally {
      setIsRequestingPermissions(false);
    }
  }, []);

  const explainAndRequestBackgroundAccess = useCallback(
    async () => {
      const shouldContinue = await confirmBackgroundPermissionExplanation();

      if (!shouldContinue) {
        return {
          foregroundGranted: false,
          backgroundGranted: false,
          canAskBackgroundAgain: true,
        };
      }

      return requestBackgroundAccess();
    },
    [requestBackgroundAccess],
  );

  return {
    isRequestingPermissions,
    requestBackgroundAccess,
    explainAndRequestBackgroundAccess,
  };
}

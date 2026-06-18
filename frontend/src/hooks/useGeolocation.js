import { useState, useCallback } from "react";







export function useGeolocation() {
  const [state, setState] = useState({
    loading: false,
    coords: null,
    error: null,
  });

  const getPosition = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const errorMsg = "Geolocation is not supported by your browser.";
        setState({ loading: false, coords: null, error: errorMsg });
        reject(new Error(errorMsg));
        return;
      }

      let watchId = null;
      let timeoutId = null;
      let bestPosition = null;
      let hasResolved = false;

      const cleanUp = () => {
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
          watchId = null;
        }
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      };

      const handleSuccess = (position) => {
        const accuracy = position.coords.accuracy;
        const currentCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: accuracy,
        };

        console.log(`Geolocation update: Lat ${currentCoords.latitude}, Lng ${currentCoords.longitude}, Accuracy: ${accuracy}m`);

        // Track the best position (lowest accuracy value is most accurate)
        if (!bestPosition || accuracy < bestPosition.accuracy) {
          bestPosition = currentCoords;
        }

        // If the accuracy is highly precise (<= 25 meters), resolve immediately
        if (accuracy <= 25 && !hasResolved) {
          hasResolved = true;
          cleanUp();
          setState({ loading: false, coords: currentCoords, error: null });
          resolve(currentCoords);
        }
      };

      const handleError = (error) => {
        console.warn("Geolocation watch error:", error);
        
        // If it is permission denied, we should fail immediately
        if (error.code === error.PERMISSION_DENIED && !hasResolved) {
          hasResolved = true;
          cleanUp();
          const errorMsg = "Location access denied. Please enable GPS permissions to check in.";
          setState({ loading: false, coords: null, error: errorMsg });
          reject(new Error(errorMsg));
        }
      };

      // Start watching the position to get a stream of increasingly accurate readings
      watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });

      // Set a maximum timeout (e.g., 8 seconds) to stop watching and resolve with the best reading so far
      timeoutId = setTimeout(() => {
        if (hasResolved) return;
        hasResolved = true;
        cleanUp();

        if (bestPosition) {
          console.log(`Geolocation timeout reached. Resolving with best position: Accuracy ${bestPosition.accuracy}m`);
          setState({ loading: false, coords: bestPosition, error: null });
          resolve(bestPosition);
        } else {
          const errorMsg = "Location request timed out. Please ensure GPS is ON in your settings and try again.";
          setState({ loading: false, coords: null, error: errorMsg });
          reject(new Error(errorMsg));
        }
      }, 8000);
    });
  }, []);

  return { ...state, getPosition };
}

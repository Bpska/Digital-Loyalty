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

      const optionsHigh = {
        enableHighAccuracy: true,
        timeout: 12000,     // 12 seconds
        maximumAge: 10000,  // Allow 10 seconds old cached position
      };

      const optionsLow = {
        enableHighAccuracy: false,
        timeout: 8000,      // 8 seconds
        maximumAge: 30000,  // Allow 30 seconds old cached position
      };

      const handleSuccess = (position) => {
        const newCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setState({ loading: false, coords: newCoords, error: null });
        resolve(newCoords);
      };

      const handleError = (error) => {
        // If high accuracy timed out, retry with low accuracy (network/wifi/cell tower location)
        if (error.code === error.TIMEOUT && optionsHigh.enableHighAccuracy) {
          console.warn("High accuracy GPS timed out. Retrying with low accuracy...");
          
          navigator.geolocation.getCurrentPosition(
            handleSuccess,
            (lowError) => {
              let errorMsg = "Failed to retrieve your location.";
              if (lowError.code === lowError.PERMISSION_DENIED) {
                errorMsg = "Location access denied. Please enable GPS permissions to check in.";
              } else if (lowError.code === lowError.POSITION_UNAVAILABLE) {
                errorMsg = "Location information is unavailable. Check your device GPS connection.";
              } else if (lowError.code === lowError.TIMEOUT) {
                errorMsg = "The request to get your location timed out. Please stand near a window or turn on WiFi.";
              }
              setState({ loading: false, coords: null, error: errorMsg });
              reject(new Error(errorMsg));
            },
            optionsLow
          );
          return;
        }

        let errorMsg = "Failed to retrieve your location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = "Location access denied. Please enable GPS permissions to check in.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = "Location information is unavailable. Check your device GPS connection.";
            break;
          case error.TIMEOUT:
            errorMsg = "The request to get your location timed out. Please stand near a window or turn on WiFi.";
            break;
        }
        setState({ loading: false, coords: null, error: errorMsg });
        reject(new Error(errorMsg));
      };

      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, optionsHigh);
    });
  }, []);

  return { ...state, getPosition };
}

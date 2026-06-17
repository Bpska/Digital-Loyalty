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

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setState({ loading: false, coords: newCoords, error: null });
          resolve(newCoords);
        },
        (error) => {
          let errorMsg = "Failed to retrieve your location.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = "Location access denied. Please enable GPS permissions to check in.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = "Location information is unavailable. Check your device GPS connection.";
              break;
            case error.TIMEOUT:
              errorMsg = "The request to get your location timed out. Please try again.";
              break;
          }
          setState({ loading: false, coords: null, error: errorMsg });
          reject(new Error(errorMsg));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  return { ...state, getPosition };
}

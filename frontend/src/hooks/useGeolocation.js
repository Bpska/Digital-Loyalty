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

      let resolved = false;

      const handleSuccess = (position) => {
        if (resolved) return;
        const newCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setState({ loading: false, coords: newCoords, error: null });
        resolved = true;
        resolve(newCoords);
      };

      // 1. Get quick network location (low accuracy)
      navigator.geolocation.getCurrentPosition(
        (lowPos) => {
          const lowCoords = {
            latitude: lowPos.coords.latitude,
            longitude: lowPos.coords.longitude,
          };

          // 2. Quickly try to get high accuracy GPS location in background
          navigator.geolocation.getCurrentPosition(
            (highPos) => {
              handleSuccess(highPos);
            },
            (highErr) => {
              console.warn("High accuracy GPS timed out/failed. Falling back to low accuracy:", highErr.message);
              if (!resolved) {
                setState({ loading: false, coords: lowCoords, error: null });
                resolved = true;
                resolve(lowCoords);
              }
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,     // 10 seconds background GPS timeout
              maximumAge: 0,      // Enforce fresh GPS read
            }
          );
        },
        (lowErr) => {
          // If low accuracy directly fails, run standard high accuracy query
          navigator.geolocation.getCurrentPosition(
            handleSuccess,
            (highErr) => {
              let errorMsg = "Failed to retrieve your location.";
              if (highErr.code === highErr.PERMISSION_DENIED) {
                errorMsg = "Location access denied. Please enable GPS permissions to check in.";
              } else if (highErr.code === highErr.POSITION_UNAVAILABLE) {
                errorMsg = "Location information is unavailable. Please check your device GPS connection.";
              } else if (highErr.code === highErr.TIMEOUT) {
                errorMsg = "Location request timed out. Please ensure GPS is ON in your settings and try again.";
              }
              setState({ loading: false, coords: null, error: errorMsg });
              reject(new Error(errorMsg));
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 60000,
            }
          );
        },
        {
          enableHighAccuracy: false,
          timeout: 4000,      // 4 seconds quick check
          maximumAge: 300000, // 5 minutes cached position is fine for quick check
        }
      );
    });
  }, []);

  return { ...state, getPosition };
}

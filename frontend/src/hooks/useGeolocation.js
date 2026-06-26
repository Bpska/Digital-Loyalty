import { useState, useCallback } from "react";

export function useGeolocation() {
  const [state, setState] = useState({
    loading: false,
    progress: "",
    coords: null,
    error: null,
    readings: [],
  });

  // LOCATION VERIFICATION DISABLED — always returns null coords immediately
  const getPosition = useCallback(() => {
    return Promise.resolve({ latitude: null, longitude: null, accuracy: null });
  }, []);

  /* LOCATION VERIFICATION COMMENTED OUT:
  const getPosition = useCallback(() => {
    setState({
      loading: true,
      progress: "Initializing GPS...",
      coords: null,
      error: null,
      readings: [],
    });

    return new Promise(async (resolve, reject) => {
      if (!navigator.geolocation) {
        const errorMsg = "Geolocation is not supported by your browser.";
        setState({ loading: false, progress: "", coords: null, error: errorMsg, readings: [] });
        reject(new Error(errorMsg));
        return;
      }

      const collectedReadings = [];

      for (let i = 0; i < 3; i++) {
        const readingNum = i + 1;
        setState((prev) => ({
          ...prev,
          progress: `Verifying your location (Reading ${readingNum}/3)...`,
        }));

        try {
          const position = await new Promise((resolvePos, rejectPos) => {
            navigator.geolocation.getCurrentPosition(
              resolvePos,
              (err) => {
                rejectPos(err);
              },
              {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
              }
            );
          });

          const accuracy = position.coords.accuracy;
          const coordsObj = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: accuracy,
          };

          collectedReadings.push(coordsObj);
          setState((prev) => ({
            ...prev,
            readings: [...collectedReadings],
          }));

          console.log(`GPS Reading ${readingNum}: Lat: ${coordsObj.latitude}, Lng: ${coordsObj.longitude}, Accuracy: ${accuracy}m`);
        } catch (err) {
          console.warn(`GPS Reading ${readingNum} failed:`, err);
          
          // If it is permission denied, fail immediately because retry won't work without system setting changes
          if (err.code === err.PERMISSION_DENIED) {
            const errorMsg = "Location access denied. Please enable GPS permissions to check in.";
            setState({ loading: false, progress: "", coords: null, error: errorMsg, readings: [] });
            reject(new Error(errorMsg));
            return;
          }
          // For other errors (like timeout on a single reading), we can proceed to next iterations.
        }
      }

      if (collectedReadings.length === 0) {
        const errorMsg = "Location request timed out. Please ensure GPS is ON in your settings and try again.";
        setState({ loading: false, progress: "", coords: null, error: errorMsg, readings: [] });
        reject(new Error(errorMsg));
        return;
      }

      // Sort by accuracy (lowest value is best/most precise)
      const sorted = [...collectedReadings].sort((a, b) => a.accuracy - b.accuracy);
      const bestCoords = sorted[0];

      console.log("Best GPS reading selected:", bestCoords);

      // GPS ACCURACY VALIDATION: If accuracy > 50 meters, reject validation
      if (bestCoords.accuracy > 50) {
        const errorMsg = "Unable to verify your precise location. Please move near the entrance, enable GPS, and try again.";
        setState({
          loading: false,
          progress: "",
          coords: bestCoords,
          error: errorMsg,
          readings: collectedReadings,
        });
        reject(new Error(errorMsg));
        return;
      }

      setState({
        loading: false,
        progress: "",
        coords: bestCoords,
        error: null,
        readings: collectedReadings,
      });

      resolve(bestCoords);
    });
  }, []);
  END LOCATION VERIFICATION COMMENTED OUT */

  return { ...state, getPosition };
}

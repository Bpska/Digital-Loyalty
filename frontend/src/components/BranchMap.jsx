import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Use CDNs for Leaflet's marker icons to bypass Vite asset bundling bugs
const customMarkerIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapEvents({ onLocationSelected }) {
  useMapEvents({
    click(e) {
      onLocationSelected(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function BranchMap({ lat, lng, radius, onChange }) {
  const numericLat = parseFloat(lat);
  const numericLng = parseFloat(lng);
  
  const hasCoordinates = !isNaN(numericLat) && !isNaN(numericLng);
  const position = hasCoordinates ? [numericLat, numericLng] : [20.271, 85.833]; // default to Bhubaneswar if empty

  const handleMarkerDragEnd = (e) => {
    const marker = e.target;
    if (marker != null) {
      const newPos = marker.getLatLng();
      onChange(newPos.lat, newPos.lng);
    }
  };

  const parsedRadius = parseInt(radius) || 50;

  return (
    <div className="h-56 w-full rounded-lg overflow-hidden border border-border shadow-sm relative z-0 my-3">
      <MapContainer
        center={position}
        zoom={hasCoordinates ? 16 : 13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents onLocationSelected={onChange} />
        <MapUpdater center={position} />
        {hasCoordinates && (
          <>
            <Marker
              position={position}
              icon={customMarkerIcon}
              draggable={true}
              eventHandlers={{
                dragend: handleMarkerDragEnd
              }}
            />
            <Circle
              center={position}
              radius={parsedRadius}
              pathOptions={{ fillColor: "#38bdf8", color: "#0ea5e9", fillOpacity: 0.25, weight: 2 }}
            />
          </>
        )}
      </MapContainer>
      <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-semibold text-muted-foreground border border-border pointer-events-none">
        💡 Click map or drag pin to adjust location
      </div>
    </div>
  );
}

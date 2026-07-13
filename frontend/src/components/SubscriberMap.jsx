import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Dynamic map centering component
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

// Custom 3D Pin builder for subscriber stores
const create3DPin = (initials) => {
  if (typeof window === "undefined" || !L) return null;
  return L.divIcon({
    className: "custom-3d-pin bg-transparent border-0",
    html: `
      <style>
        @keyframes custom-pin-bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-pin-bounce {
          animation: custom-pin-bounce 1.4s infinite ease-in-out;
        }
      </style>
      <div class="relative flex flex-col items-center select-none">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6A00] to-[#FF8E3C] text-white flex items-center justify-center font-black shadow-[0_4px_10px_rgba(255,106,0,0.35)] border-2 border-white animate-pin-bounce">
          <span class="text-[8px] uppercase tracking-tighter">${initials}</span>
        </div>
        <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-white -mt-[1px]"></div>
        <div class="w-4 h-1 bg-black/20 rounded-full filter blur-[1px] mt-0.5"></div>
      </div>
    `,
    iconSize: [32, 45],
    iconAnchor: [16, 37],
    popupAnchor: [0, -37]
  });
};

// Custom 3D Pin builder for User Location
const createUserPin = () => {
  if (typeof window === "undefined" || !L) return null;
  return L.divIcon({
    className: "user-3d-pin bg-transparent border-0",
    html: `
      <div class="relative flex flex-col items-center select-none">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] text-white flex items-center justify-center font-black shadow-[0_4px_10px_rgba(59,130,246,0.35)] border-2 border-white animate-pin-bounce">
          <span class="text-[8px] uppercase">YOU</span>
        </div>
        <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-white -mt-[1px]"></div>
        <div class="w-4 h-1 bg-black/20 rounded-full filter blur-[1px] mt-0.5"></div>
      </div>
    `,
    iconSize: [32, 45],
    iconAnchor: [16, 37],
    popupAnchor: [0, -37]
  });
};

export default function SubscriberMap({ userCoords, nearbyBranches }) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Delay mounting Leaflet container to keep transition animations buttery smooth
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!shouldRender || !userCoords) {
    return (
      <div className="h-[350px] w-full rounded-2xl bg-slate-50 border border-dashed border-border flex flex-col items-center justify-center text-xs text-muted-foreground gap-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span>Initializing map...</span>
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full rounded-2xl overflow-hidden border border-border shadow-sm relative z-0">
      <MapContainer
        center={[userCoords.lat, userCoords.lng]}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={[userCoords.lat, userCoords.lng]} />
        <Circle
          center={[userCoords.lat, userCoords.lng]}
          radius={7000}
          pathOptions={{ fillColor: "#3b82f6", color: "#2563eb", fillOpacity: 0.12, weight: 1.5, dashArray: "4, 4" }}
        />
        <Marker
          position={[userCoords.lat, userCoords.lng]}
          icon={createUserPin()}
        >
          <Popup>
            <span className="text-xs font-bold">Your Location</span>
          </Popup>
        </Marker>
        {nearbyBranches.map((branch) => {
          const branchLat = parseFloat(branch.latitude);
          const branchLng = parseFloat(branch.longitude);
          if (isNaN(branchLat) || isNaN(branchLng)) return null;
          const initials = (branch.business?.name || "B").substring(0, 2).toUpperCase();
          return (
            <Marker
              key={branch.id}
              position={[branchLat, branchLng]}
              icon={create3DPin(initials)}
            >
              <Tooltip permanent direction="top" offset={[0, -25]} className="bg-white border border-[#FF6A00]/25 text-[#0F172A] font-extrabold text-[9px] rounded-lg px-2 py-0.5 shadow-sm">
                {branch.business?.name}
              </Tooltip>
              <Popup>
                <div className="p-2 font-sans space-y-1 text-slate-800 min-w-[120px]">
                  <h4 className="font-black text-xs text-[#0F172A]">{branch.business?.name}</h4>
                  <p className="text-[9px] text-slate-500 font-bold">{branch.name}</p>
                  <p className="text-[9px] text-slate-400">{branch.address}</p>
                  <span className="inline-flex mt-1 text-[8px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full">
                    ⭐ Plan Subscriber
                  </span>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

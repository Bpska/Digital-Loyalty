import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, RefreshCw, AlertTriangle, MapPin, Loader2, Trash2, WifiOff } from "lucide-react";

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function formatDistance(meters) {
  if (meters == null || isNaN(meters)) return "N/A";
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
  return `${Math.round(meters)} m`;
}

function formatCoords(lat, lon) {
  if (lat == null || lon == null) return "Not provided";
  return `${Number(lat).toFixed(4)}, ${Number(lon).toFixed(4)}`;
}

export default function FraudMonitorPage() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState(null);

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/fraud/checkins/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superFraudList"] });
      setDeletingId(null);
    },
    onError: (err) => {
      alert(err.message || "Failed to delete log.");
      setDeletingId(null);
    },
  });

  const { data: fraudListData, isLoading, isError, refetch } = useQuery({
    queryKey: ["superFraudList"],
    queryFn: () => api.get("/admin/fraud/checkins").then((res) => res.data),
    refetchInterval: 60000,
  });

  const fraudList = Array.isArray(fraudListData) ? fraudListData : [];

  function handleDelete(id) {
    if (!window.confirm("Permanently delete this suspicious check-in log?")) return;
    setDeletingId(id);
    deleteMutation.mutate(id);
  }

  if (isLoading) {
    return React.createElement("div", { className: "space-y-4 animate-pulse" },
      React.createElement("div", { className: "h-10 w-48 rounded bg-muted" }),
      React.createElement("div", { className: "h-32 w-full rounded-xl bg-muted" }),
      React.createElement("div", { className: "h-32 w-full rounded-xl bg-muted" }),
    );
  }

  return React.createElement("div", { className: "space-y-6" },

    /* ── Header ── */
    React.createElement("div", { className: "flex items-center justify-between" },
      React.createElement("div", null,
        React.createElement("h1", { className: "text-2xl font-extrabold text-foreground tracking-tight" }, "Fraud Monitor"),
        React.createElement("p", { className: "text-xs text-muted-foreground mt-1" },
          "Suspicious check-in logs — flagged for spoofed location, out-of-range scans, or other anomalies."
        )
      ),
      React.createElement(Button, { variant: "outline", size: "sm", onClick: () => refetch() },
        React.createElement(RefreshCw, { className: "mr-2 h-4 w-4" }), "Sync Monitor"
      )
    ),

    /* ── Stats Strip ── */
    React.createElement("div", { className: "flex items-center gap-3" },
      React.createElement(Card, { className: "border-red-200 bg-red-50/40" },
        React.createElement(CardContent, { className: "px-5 py-3 flex items-center gap-3" },
          React.createElement(AlertTriangle, { className: "h-5 w-5 text-red-600" }),
          React.createElement("div", null,
            React.createElement("p", { className: "text-xl font-black text-red-700" }, fraudList.length),
            React.createElement("p", { className: "text-[10px] text-red-600 font-medium uppercase tracking-wider" }, "Flagged Logs")
          )
        )
      )
    ),

    /* ── Error State ── */
    isError && React.createElement("div", { className: "rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 text-center" },
      "Failed to load fraud logs. Please try refreshing."
    ),

    /* ── Empty State ── */
    !isError && fraudList.length === 0 && (
      React.createElement(Card, { className: "border-dashed border-border bg-slate-50/50 py-16 text-center" },
        React.createElement(CardContent, { className: "flex flex-col items-center justify-center space-y-3" },
          React.createElement(ShieldAlert, { className: "h-10 w-10 text-emerald-600 shrink-0" }),
          React.createElement("p", { className: "text-sm font-semibold text-foreground" }, "All Systems Green"),
          React.createElement("p", { className: "text-xs text-muted-foreground max-w-sm" },
            "No suspicious check-in logs. If customers attempt location spoofing or fail GPS distance checks, details will appear here."
          )
        )
      )
    ),

    /* ── Fraud Logs List ── */
    !isError && fraudList.length > 0 && (
      React.createElement("div", { className: "space-y-4" },
        fraudList.map((log) =>
          React.createElement(Card, {
            key: log.id,
            className: "border-red-200 bg-red-50/20 overflow-hidden",
          },
            React.createElement(CardContent, { className: "p-0" },
              /* Red left stripe */
              React.createElement("div", { className: "flex" },
                React.createElement("div", { className: "w-1 bg-red-500 shrink-0" }),
                React.createElement("div", { className: "flex-1 p-4 space-y-3" },

                  /* Top row — customer + timestamp + status badge */
                  React.createElement("div", { className: "flex items-start justify-between gap-3" },
                    React.createElement("div", { className: "flex items-center gap-2 min-w-0" },
                      React.createElement("div", { className: "h-9 w-9 rounded-full bg-red-100 flex items-center justify-center shrink-0" },
                        React.createElement(AlertTriangle, { className: "h-4 w-4 text-red-600" })
                      ),
                      React.createElement("div", { className: "min-w-0" },
                        React.createElement("p", { className: "font-bold text-sm text-foreground truncate" },
                          log.customer?.name || "Unknown Customer"
                        ),
                        React.createElement("p", { className: "text-xs text-muted-foreground font-mono" },
                          log.customer?.phone || "—"
                        )
                      )
                    ),
                    React.createElement("div", { className: "text-right shrink-0 space-y-1" },
                      React.createElement("span", { className: "text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full uppercase" },
                        "Suspicious"
                      ),
                      React.createElement("p", { className: "text-[10px] text-muted-foreground block" },
                        formatDateTime(log.createdAt)
                      )
                    )
                  ),

                  /* Info grid */
                  React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 text-xs" },

                    /* Target Business */
                    React.createElement("div", { className: "space-y-0.5" },
                      React.createElement("p", { className: "text-[9px] text-muted-foreground uppercase tracking-widest font-bold" }, "Target Store"),
                      React.createElement("p", { className: "font-semibold text-foreground truncate" }, log.business?.name || "—"),
                      React.createElement("p", { className: "text-muted-foreground flex items-center gap-1 truncate" },
                        React.createElement(MapPin, { className: "h-3 w-3 shrink-0" }),
                        log.branch?.name || "—",
                        log.branch?.radiusMeters ? ` (r: ${log.branch.radiusMeters}m)` : ""
                      )
                    ),

                    /* GPS Metrics */
                    React.createElement("div", { className: "space-y-0.5" },
                      React.createElement("p", { className: "text-[9px] text-muted-foreground uppercase tracking-widest font-bold" }, "GPS Metrics"),
                      React.createElement("p", { className: "text-red-600 font-semibold" },
                        "Distance: ", formatDistance(log.distanceMeters)
                      ),
                      React.createElement("p", { className: "text-muted-foreground" },
                        "Coords: ",
                        React.createElement("code", { className: "font-mono text-[9px]" },
                          formatCoords(log.latitude, log.longitude)
                        )
                      )
                    ),

                    /* Network */
                    React.createElement("div", { className: "space-y-0.5" },
                      React.createElement("p", { className: "text-[9px] text-muted-foreground uppercase tracking-widest font-bold" }, "Network"),
                      React.createElement("p", { className: "truncate" },
                        React.createElement("span", { className: "text-muted-foreground" }, "IP: "),
                        React.createElement("span", { className: "font-mono" }, log.ipAddress || "unknown")
                      ),
                      React.createElement("p", { className: "truncate" },
                        React.createElement("span", { className: "text-muted-foreground" }, "Device: "),
                        React.createElement("span", { className: "font-mono" },
                          log.deviceId ? log.deviceId.slice(0, 10) + "…" : "none"
                        )
                      )
                    ),

                    /* Actions */
                    React.createElement("div", { className: "flex items-center justify-end" },
                      React.createElement(Button, {
                        variant: "destructive",
                        size: "sm",
                        className: "gap-1.5",
                        disabled: deletingId === log.id,
                        onClick: () => handleDelete(log.id),
                      },
                        deletingId === log.id
                          ? React.createElement(Loader2, { className: "h-3.5 w-3.5 animate-spin" })
                          : React.createElement(Trash2, { className: "h-3.5 w-3.5" }),
                        deletingId === log.id ? "Deleting…" : "Delete"
                      )
                    )
                  )
                )
              )
            )
          )
        )
      )
    )
  );
}

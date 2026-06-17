const _jsxFileName = "src\\pages\\(super-admin)\\dashboard\\super\\fraud\\page.tsx";"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, RefreshCw, AlertTriangle, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";
























export default function FraudMonitorPage() {
  const { data: fraudListData, isLoading, refetch } = useQuery({
    queryKey: ["superFraudList"],
    queryFn: () => api.get("/admin/fraud/checkins").then((res) => res.data),
  });

  const fraudList = fraudListData || [];

  if (isLoading) {
    return (
      React.createElement('div', { className: "space-y-4 animate-pulse" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 44}}
        , React.createElement('div', { className: "h-10 w-48 rounded bg-muted"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 45}} )
        , React.createElement('div', { className: "h-32 w-full rounded-xl bg-muted"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 46}} )
        , React.createElement('div', { className: "h-32 w-full rounded-xl bg-muted"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 47}} )
      )
    );
  }

  return (
    React.createElement('div', { className: "space-y-6 animate-fade-in" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 53}}
      /* Header */
      , React.createElement('div', { className: "flex items-center justify-between"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 55}}
        , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 56}}
          , React.createElement('h1', { className: "text-3xl font-extrabold text-foreground tracking-tight"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 57}}, "Fraud Monitor" )
          , React.createElement('p', { className: "text-xs text-muted-foreground mt-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 58}}, "Audit logs of suspicious coordinates, spoofed locations or impossible customer travel metrics"

          )
        )
        , React.createElement(Button, { variant: "outline", size: "sm", onClick: () => refetch(), __self: this, __source: {fileName: _jsxFileName, lineNumber: 62}}
          , React.createElement(RefreshCw, { className: "mr-2 h-4 w-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 63}} ), " Sync Monitor"
        )
      )

      /* Main logs display */
      , React.createElement('div', { className: "grid grid-cols-1 gap-6"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 68}}
        , fraudList.length === 0 ? (
          React.createElement(Card, { className: "border-dashed border-border bg-slate-50/50 py-16 text-center"    , glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 70}}
            , React.createElement(CardContent, { className: "flex flex-col items-center justify-center space-y-3"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 71}}
              , React.createElement(ShieldAlert, { className: "h-10 w-10 text-emerald-600 shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 72}} )
              , React.createElement('p', { className: "text-sm text-muted-foreground font-medium"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 73}}, "All systems green. No fraud logs flagged."      )
              , React.createElement('p', { className: "text-xs text-muted-foreground/80 max-w-sm"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 74}}, "If customers attempt location spoofing or fail GPS distance checks, details are logged here."

              )
            )
          )
        ) : (
          React.createElement('div', { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 80}}
            , fraudList.map((log) => {
              const distanceKm = (log.distanceMeters / 1000).toFixed(2);
              
              return (
                React.createElement(Card, { key: log.id, className: "border-red-100 bg-red-50/30" , glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 85}}
                  , React.createElement(CardContent, { className: "p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-center"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 86}}
                    /* User and date info */
                    , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 88}}
                      , React.createElement('div', { className: "flex items-center space-x-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 89}}
                        , React.createElement(AlertTriangle, { className: "h-5 w-5 text-red-600 shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 90}} )
                        , React.createElement('h4', { className: "text-sm font-bold text-foreground truncate"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 91}}, log.customer.name)
                      )
                      , React.createElement('span', { className: "text-[10px] font-mono text-muted-foreground block"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 93}}, log.customer.phone)
                      , React.createElement('span', { className: "text-[9px] text-muted-foreground block"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 94}}, formatDate(log.createdAt))
                    )

                    /* Store Target */
                    , React.createElement('div', { className: "space-y-0.5 text-xs text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 98}}
                      , React.createElement('span', { className: "text-[9px] text-muted-foreground uppercase tracking-widest block font-bold"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 99}}, "Target store" )
                      , React.createElement('p', { className: "font-semibold text-foreground truncate"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 100}}, log.business.name)
                      , React.createElement('p', { className: "text-muted-foreground flex items-center"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 101}}
                        , React.createElement(MapPin, { className: "h-3.5 w-3.5 mr-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 102}} ), " " , log.branch.name, " (r: "  , log.branch.radiusMeters, "m)"
                      )
                    )

                    /* GPS calculations */
                    , React.createElement('div', { className: "space-y-0.5 text-xs text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 107}}
                      , React.createElement('span', { className: "text-[9px] text-muted-foreground uppercase tracking-widest block font-bold"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 108}}, "GPS metrics" )
                      , React.createElement('p', { className: "text-red-600 font-semibold" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 109}}, "Distance: "
                         , log.distanceMeters > 1000 ? `${distanceKm} km` : `${Math.round(log.distanceMeters)}m`
                      )
                      , React.createElement('p', { className: "text-[10px] text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 112}}, "Scanned coords: "
                          , React.createElement('code', { className: "font-mono text-[9px]" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 113}}, log.latitude.toFixed(4), ", " , log.longitude.toFixed(4))
                      )
                    )

                    /* Network details */
                    , React.createElement('div', { className: "space-y-0.5 text-xs text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 118}}
                      , React.createElement('span', { className: "text-[9px] text-muted-foreground uppercase tracking-widest block font-bold"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 119}}, "Network details" )
                      , React.createElement('p', { className: "truncate", __self: this, __source: {fileName: _jsxFileName, lineNumber: 120}}, React.createElement('span', { className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 120}}, "IP:"), " " , React.createElement('span', { className: "font-mono text-[10px]" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 120}}, log.ipAddress || "unknown"))
                      , React.createElement('p', { className: "truncate", __self: this, __source: {fileName: _jsxFileName, lineNumber: 121}}, React.createElement('span', { className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 121}}, "Device ID:" ), " " , React.createElement('span', { className: "font-mono text-[9px] text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 121}}, log.deviceId ? log.deviceId.slice(0, 8) + "..." : "none"))
                    )
                  )
                )
              );
            })
          )
        )
      )
    )
  );
}

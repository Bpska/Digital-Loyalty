import { Link } from "react-router-dom";
const _jsxFileName = "src\\pages\\(customer)\\history\\page.tsx";"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, } from "@/components/ui/card";
import { Loader2, Calendar, Award, ChevronLeft, ArrowUpRight, } from "lucide-react";
import { formatDate } from "@/lib/utils";



















export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState("visits");

  // Fetch checkin history
  const { data: checkinsData, isLoading: checkinsLoading } = useQuery({
    queryKey: ["checkinHistory"],
    queryFn: () => api.get("/checkins/history").then((res) => res.data),
    enabled: activeTab === "visits",
  });

  // Fetch rewards history
  const { data: rewardsData, isLoading: rewardsLoading } = useQuery({
    queryKey: ["rewardsHistory"],
    queryFn: () => api.get("/customer/rewards").then((res) => res.data),
    enabled: activeTab === "rewards",
  });

  const checkins = checkinsData || [];
  const rewards = rewardsData || [];

  return (
    React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 50}}
      /* Header */
      , React.createElement('div', { className: "flex items-center space-x-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 52}}
        , React.createElement(Link, { to: "/dashboard", className: "rounded-lg p-2 text-muted-foreground hover:bg-slate-100 hover:text-foreground transition-colors"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 53}}
          , React.createElement(ChevronLeft, { className: "h-5 w-5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 54}} )
        )
        , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 56}}
          , React.createElement('h2', { className: "text-xl font-extrabold text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 57}}, "History Wallet" )
          , React.createElement('p', { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 58}}, "Track all your check-ins and voucher redemptions"      )
        )
      )

      , React.createElement(Tabs, { defaultValue: "visits", className: "w-full", onValueChange: setActiveTab, __self: this, __source: {fileName: _jsxFileName, lineNumber: 62}}
        , React.createElement(TabsList, { className: "grid w-full grid-cols-2 mb-4"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 63}}
          , React.createElement(TabsTrigger, { value: "visits", __self: this, __source: {fileName: _jsxFileName, lineNumber: 64}}, "Visits History" )
          , React.createElement(TabsTrigger, { value: "rewards", __self: this, __source: {fileName: _jsxFileName, lineNumber: 65}}, "Voucher Logs" )
        )

        /* Visits History Tab */
        , React.createElement(TabsContent, { value: "visits", className: "space-y-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 69}}
          , checkinsLoading ? (
            React.createElement('div', { className: "flex justify-center py-12"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 71}}
              , React.createElement(Loader2, { className: "h-6 w-6 animate-spin text-primary"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 72}} )
            )
          ) : checkins.length === 0 ? (
            React.createElement(Card, { className: "border-dashed border-border bg-slate-50/50 py-12 text-center"    , glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 75}}
              , React.createElement(CardContent, { className: "flex flex-col items-center justify-center space-y-3"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 76}}
                , React.createElement(Calendar, { className: "h-10 w-10 text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 77}} )
                , React.createElement('p', { className: "text-sm text-muted-foreground font-medium"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 78}}, "No check-ins logged yet"   )
                , React.createElement('p', { className: "text-xs text-muted-foreground/80 max-w-xs"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 79}}, "Your successful physical store check-ins will show up here after verification."

                )
              )
            )
          ) : (
            React.createElement('div', { className: "space-y-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 85}}
              , checkins.map((item) => (
                React.createElement(Card, { key: item.id, className: "glass", glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 87}}
                  , React.createElement(CardContent, { className: "p-4 flex items-center justify-between"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 88}}
                    , React.createElement('div', { className: "flex items-center space-x-3 min-w-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 89}}
                      , React.createElement('div', { className: "h-9 w-9 rounded-lg bg-indigo-50 text-primary flex items-center justify-center shrink-0"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 90}}
                        , React.createElement(ArrowUpRight, { className: "h-5 w-5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 91}} )
                      )
                      , React.createElement('div', { className: "min-w-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 93}}
                        , React.createElement('h4', { className: "text-sm font-bold text-foreground truncate"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 94}}, item.business.name)
                        , React.createElement('p', { className: "text-[10px] text-muted-foreground truncate"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 95}}
                          , item.branch.name, " • "  , Math.round(item.distanceMeters), "m away"
                        )
                      )
                    )
                    , React.createElement('div', { className: "text-right shrink-0" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 100}}
                      , React.createElement('span', { className: "text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 101}}, "Verified"

                      )
                      , React.createElement('p', { className: "text-[9px] text-muted-foreground mt-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 104}}, formatDate(item.createdAt))
                    )
                  )
                )
              ))
            )
          )
        )

        /* Voucher Logs Tab */
        , React.createElement(TabsContent, { value: "rewards", className: "space-y-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 114}}
          , rewardsLoading ? (
            React.createElement('div', { className: "flex justify-center py-12"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 116}}
              , React.createElement(Loader2, { className: "h-6 w-6 animate-spin text-primary"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 117}} )
            )
          ) : rewards.length === 0 ? (
            React.createElement(Card, { className: "border-dashed border-border bg-slate-50/50 py-12 text-center"    , glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 120}}
              , React.createElement(CardContent, { className: "flex flex-col items-center justify-center space-y-3"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 121}}
                , React.createElement(Award, { className: "h-10 w-10 text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 122}} )
                , React.createElement('p', { className: "text-sm text-muted-foreground font-medium"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 123}}, "No vouchers earned yet"   )
                , React.createElement('p', { className: "text-xs text-muted-foreground/80 max-w-xs"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 124}}, "Accumulate stamps or points to unlock special loyalty vouchers from our partners."

                )
              )
            )
          ) : (
            React.createElement('div', { className: "space-y-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 130}}
              , rewards.map((item) => {
                const isRedeemed = item.status === "REDEEMED";
                const isUnlocked = item.status === "UNLOCKED";
                
                return (
                  React.createElement(Card, { key: item.id, className: "glass", glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 136}}
                    , React.createElement(CardContent, { className: "p-4 flex items-center justify-between"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 137}}
                      , React.createElement('div', { className: "flex items-center space-x-3 min-w-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 138}}
                        , React.createElement('div', { className: `h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isRedeemed ? "bg-slate-100 text-muted-foreground" : "bg-primary/10 text-primary animate-pulse"
                        }`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 139}}
                          , React.createElement(Award, { className: "h-5 w-5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 142}} )
                        )
                        , React.createElement('div', { className: "min-w-0", __self: this, __source: {fileName: _jsxFileName, lineNumber: 144}}
                          , React.createElement('h4', { className: "text-sm font-bold text-foreground truncate"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 145}}, item.reward.title)
                          , React.createElement('p', { className: "text-[10px] text-muted-foreground truncate"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 146}}
                            , isRedeemed ? `Redeemed: ${formatDate(item.redeemedAt)}` : `Expires: ${formatDate(item.createdAt)}`
                          )
                        )
                      )
                      , React.createElement('div', { className: "text-right shrink-0" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 151}}
                        , React.createElement('span', { className: `text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                          isRedeemed 
                            ? "bg-slate-100 text-muted-foreground border border-slate-200" 
                            : isUnlocked 
                              ? "bg-primary/10 text-primary border border-primary/20" 
                              : "bg-destructive/10 text-destructive border border-destructive/20"
                        }`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 152}}
                          , item.status.toLowerCase()
                        )
                        , React.createElement('p', { className: "text-[9px] text-muted-foreground font-mono mt-1"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 161}}, "Code: " , item.redemptionCode.slice(0, 8))
                      )
                    )
                  )
                );
              })
            )
          )
        )
      )
    )
  );
}

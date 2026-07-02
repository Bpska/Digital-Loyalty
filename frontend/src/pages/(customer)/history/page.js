import { Link } from "react-router-dom";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Calendar, Award, ChevronLeft, ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState("visits");

  // Fetch checkin history
  const { data: checkinsData, isLoading: checkinsLoading } = useQuery({
    queryKey: ["checkinHistory"],
    queryFn: () => api.get("/checkins/history").then((res) => res.data),
    enabled: activeTab === "visits",
  });

  // Fetch rewards history and points totals
  const { data: rewardsData, isLoading: rewardsLoading } = useQuery({
    queryKey: ["rewardsHistory"],
    queryFn: () => api.get("/customer/rewards").then((res) => res.data),
  });

  const checkins = checkinsData || [];
  const rewards = rewardsData?.rewards || [];
  const totalPointsEarned = rewardsData?.totalPointsEarned ?? 0;
  const totalExtraPoints = rewardsData?.totalExtraPoints ?? 0;

  return (
    React.createElement('div', { className: "space-y-6" }
      /* Header */
      , React.createElement('div', { className: "flex items-center space-x-3" }
        , React.createElement(Link, { to: "/dashboard", className: "rounded-lg p-2 text-muted-foreground hover:bg-slate-100 hover:text-foreground transition-colors" }
          , React.createElement(ChevronLeft, { className: "h-5 w-5" })
        )
        , React.createElement('div', null
          , React.createElement('h2', { className: "text-xl font-extrabold text-foreground" }, "History Wallet")
          , React.createElement('p', { className: "text-xs text-muted-foreground" }, "Track all your check-ins and voucher redemptions")
        )
      )



      , React.createElement(Tabs, { defaultValue: "visits", className: "w-full", onValueChange: setActiveTab }
        , React.createElement(TabsList, { className: "grid w-full grid-cols-2 mb-4" }
          , React.createElement(TabsTrigger, { value: "visits" }, "Visits History")
          , React.createElement(TabsTrigger, { value: "rewards" }, "Voucher Logs")
        )

        /* Visits History Tab */
        , React.createElement(TabsContent, { value: "visits", className: "space-y-3" }
          , checkinsLoading ? (
            React.createElement('div', { className: "flex justify-center py-12" }
              , React.createElement(Loader2, { className: "h-6 w-6 animate-spin text-primary" })
            )
          ) : checkins.length === 0 ? (
            React.createElement(Card, { className: "border-dashed border-border bg-slate-50/50 py-12 text-center", glass: true }
              , React.createElement(CardContent, { className: "flex flex-col items-center justify-center space-y-3" }
                , React.createElement(Calendar, { className: "h-10 w-10 text-muted-foreground" })
                , React.createElement('p', { className: "text-sm text-muted-foreground font-medium" }, "No check-ins logged yet")
                , React.createElement('p', { className: "text-xs text-muted-foreground/80 max-w-xs" }, "Your successful physical store check-ins will show up here after verification.")
              )
            )
          ) : (
            React.createElement('div', { className: "space-y-3" }
              , checkins.map((item) => (
                React.createElement(Card, { key: item.id, className: "glass", glass: true }
                  , React.createElement(CardContent, { className: "p-4 flex items-center justify-between" }
                    , React.createElement('div', { className: "flex items-center space-x-3 min-w-0" }
                      , React.createElement('div', { className: "h-9 w-9 rounded-lg bg-indigo-50 text-primary flex items-center justify-center shrink-0" }
                        , React.createElement(ArrowUpRight, { className: "h-5 w-5" })
                      )
                      , React.createElement('div', { className: "min-w-0" }
                        , React.createElement('h4', { className: "text-sm font-bold text-foreground truncate" }, item.business.name)
                        , React.createElement('p', { className: "text-[10px] text-muted-foreground truncate" }
                          , item.branch.name, " • ", Math.round(item.distanceMeters), "m away"
                        )
                      )
                    )
                    , React.createElement('div', { className: "text-right shrink-0" }
                      , React.createElement('span', { className: "text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0" }, "Verified")
                      , React.createElement('p', { className: "text-[9px] text-muted-foreground mt-1" }, formatDate(item.createdAt))
                    )
                  )
                )
              ))
            )
          )
        )

        /* Voucher Logs Tab */
        , React.createElement(TabsContent, { value: "rewards", className: "space-y-3" }
          , rewardsLoading ? (
            React.createElement('div', { className: "flex justify-center py-12" }
              , React.createElement(Loader2, { className: "h-6 w-6 animate-spin text-primary" })
            )
          ) : rewards.length === 0 ? (
            React.createElement(Card, { className: "border-dashed border-border bg-slate-50/50 py-12 text-center", glass: true }
              , React.createElement(CardContent, { className: "flex flex-col items-center justify-center space-y-3" }
                , React.createElement(Award, { className: "h-10 w-10 text-muted-foreground" })
                , React.createElement('p', { className: "text-sm text-muted-foreground font-medium" }, "No vouchers earned yet")
                , React.createElement('p', { className: "text-xs text-muted-foreground/80 max-w-xs" }, "Accumulate stamps or points to unlock special loyalty vouchers from our partners.")
              )
            )
          ) : (
            React.createElement('div', { className: "space-y-3" }
              , rewards.map((item) => {
                const isRedeemed = item.status === "REDEEMED";
                const isUnlocked = item.status === "UNLOCKED";

                return (
                  React.createElement(Card, { key: item.id, className: "glass", glass: true }
                    , React.createElement(CardContent, { className: "p-4 flex items-center justify-between" }
                      , React.createElement('div', { className: "flex items-center space-x-3 min-w-0" }
                        , React.createElement('div', { className: `h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isRedeemed ? "bg-slate-100 text-muted-foreground" : "bg-primary/10 text-primary animate-pulse"
                        }` }
                          , React.createElement(Award, { className: "h-5 w-5" })
                        )
                        , React.createElement('div', { className: "min-w-0" }
                          , React.createElement('h4', { className: "text-sm font-bold text-foreground truncate" }, item.reward.title)
                          , React.createElement('p', { className: "text-[10px] text-muted-foreground truncate" }
                            , isRedeemed ? `Redeemed: ${formatDate(item.redeemedAt)}` : `Expires: ${formatDate(item.createdAt)}`
                          )
                        )
                      )
                      , React.createElement('div', { className: "text-right shrink-0" }
                        , React.createElement('span', { className: `text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                          isRedeemed 
                            ? "bg-slate-100 text-muted-foreground border border-slate-200" 
                            : isUnlocked 
                              ? "bg-primary/10 text-primary border border-primary/20" 
                              : "bg-destructive/10 text-destructive border border-destructive/20"
                        }` }
                          , item.status.toLowerCase()
                        )
                        , React.createElement('p', { className: "text-[9px] text-muted-foreground font-mono mt-1" }, "Code: ", item.redemptionCode.slice(0, 8))
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

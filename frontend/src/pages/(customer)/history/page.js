import { Link } from "react-router-dom";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Calendar, Award, ChevronLeft, ArrowUpRight, MapPin, Clock, ShieldCheck, Tag } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState("visits");
  const [selectedItem, setSelectedItem] = useState(null);

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
                React.createElement(Card, { key: item.id, className: "glass cursor-pointer hover:bg-slate-50/50 active:scale-[0.99] transition-all", glass: true, onClick: () => setSelectedItem({ type: 'visit', data: item }) }
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
                  React.createElement(Card, { key: item.id, className: "glass cursor-pointer hover:bg-slate-50/50 active:scale-[0.99] transition-all", glass: true, onClick: () => setSelectedItem({ type: 'voucher', data: item }) }
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

      /* Details Modal Dialog */
      , selectedItem && React.createElement(
          Dialog, { open: !!selectedItem, onOpenChange: (open) => !open && setSelectedItem(null) },
          React.createElement(DialogContent, { className: "max-w-[360px] bg-white border border-border p-6 rounded-3xl text-slate-800 flex flex-col items-center shadow-xl text-center" },
            selectedItem.type === "visit" ? (
              React.createElement("div", { className: "w-full space-y-4" },
                React.createElement(DialogHeader, { className: "flex flex-col items-center" },
                  React.createElement("div", { className: "h-12 w-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2" },
                    React.createElement(ArrowUpRight, { className: "h-6 w-6" })
                  ),
                  React.createElement(DialogTitle, { className: "text-lg font-extrabold text-foreground" }, selectedItem.data.business.name),
                  React.createElement(DialogDescription, { className: "text-xs text-muted-foreground" }, "Verified Visit Details")
                ),
                React.createElement("div", { className: "w-full bg-slate-50 rounded-2xl p-4 border border-border/50 text-left space-y-2.5 text-xs" },
                  React.createElement("div", { className: "flex justify-between" },
                    React.createElement("span", { className: "text-muted-foreground font-semibold" }, "Branch Location"),
                    React.createElement("span", { className: "font-bold text-foreground" }, selectedItem.data.branch.name)
                  ),
                  React.createElement("div", { className: "flex justify-between" },
                    React.createElement("span", { className: "text-muted-foreground font-semibold" }, "Distance to Counter"),
                    React.createElement("span", { className: "font-bold text-foreground" }, `${Math.round(selectedItem.data.distanceMeters)}m away`)
                  ),
                  React.createElement("div", { className: "flex justify-between" },
                    React.createElement("span", { className: "text-muted-foreground font-semibold" }, "Visit Date & Time"),
                    React.createElement("span", { className: "font-bold text-foreground" }, formatDate(selectedItem.data.createdAt))
                  ),
                  React.createElement("div", { className: "flex justify-between" },
                    React.createElement("span", { className: "text-muted-foreground font-semibold" }, "Verification GPS"),
                    React.createElement("span", { className: "font-bold text-emerald-600 flex items-center gap-1" },
                      React.createElement(ShieldCheck, { className: "h-3.5 w-3.5" }),
                      "Match Confirmed"
                    )
                  )
                )
              )
            ) : (
              React.createElement("div", { className: "w-full space-y-4" },
                React.createElement(DialogHeader, { className: "flex flex-col items-center" },
                  React.createElement("div", { className: "h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2" },
                    React.createElement(Award, { className: "h-6 w-6" })
                  ),
                  React.createElement(DialogTitle, { className: "text-lg font-extrabold text-foreground" }, selectedItem.data.reward.title),
                  React.createElement(DialogDescription, { className: "text-xs text-muted-foreground" }, selectedItem.data.reward.description || "Partner discount voucher logs")
                ),
                React.createElement("div", { className: "w-full bg-slate-50 rounded-2xl p-4 border border-border/50 text-left space-y-2.5 text-xs" },
                  React.createElement("div", { className: "flex justify-between" },
                    React.createElement("span", { className: "text-muted-foreground font-semibold" }, "Redemption Status"),
                    React.createElement("span", { className: `font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full ${
                      selectedItem.data.status === "REDEEMED" ? "bg-slate-100 text-muted-foreground" : "bg-primary/10 text-primary"
                    }` }, selectedItem.data.status)
                  ),
                  React.createElement("div", { className: "flex justify-between" },
                    React.createElement("span", { className: "text-muted-foreground font-semibold" }, "Redemption Code"),
                    React.createElement("span", { className: "font-mono font-bold text-foreground bg-white border border-border/60 px-1.5 py-0.5 rounded" }, selectedItem.data.redemptionCode.toUpperCase())
                  ),
                  selectedItem.data.redeemedAt && React.createElement("div", { className: "flex justify-between" },
                    React.createElement("span", { className: "text-muted-foreground font-semibold" }, "Redeemed At"),
                    React.createElement("span", { className: "font-bold text-foreground" }, formatDate(selectedItem.data.redeemedAt))
                  ),
                  React.createElement("div", { className: "flex justify-between" },
                    React.createElement("span", { className: "text-muted-foreground font-semibold" }, "Log Date"),
                    React.createElement("span", { className: "font-bold text-foreground" }, formatDate(selectedItem.data.createdAt))
                  )
                )
              )
            ),
            React.createElement(Button, {
              type: "button",
              variant: "outline",
              onClick: () => setSelectedItem(null),
              className: "w-full text-xs rounded-xl"
            }, "Close")
          )
        )
    )
  );
}

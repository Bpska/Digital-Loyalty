const _jsxFileName = "src\\pages\\(customer)\\history\\page.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }"use client";

import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Loader2, Calendar, Award, ChevronLeft, ArrowUpRight, MapPin, Clock, ShieldCheck, Tag,
  Wallet, Gift, Star, Coffee, Scissors, Utensils, SlidersHorizontal, ChevronRight, Store, Hotel, Coins, TrendingUp, X
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

// Category style mapping: background tint and text/icon colors
const getCategoryStyle = (category) => {
  const norm = (category || "").toLowerCase().trim();
  if (norm.includes("salon") || norm.includes("spa") || norm.includes("beauty") || norm.includes("hair")) {
    return {
      bg: "bg-[#DBEAFE]", // blue tint
      text: "text-blue-600",
      icon: Scissors
    };
  }
  if (norm.includes("hotel") || norm.includes("resort") || norm.includes("stay") || norm.includes("hostel")) {
    return {
      bg: "bg-[#EDE9FE]", // violet tint
      text: "text-purple-600",
      icon: Hotel
    };
  }
  if (norm.includes("restaurant") || norm.includes("food") || norm.includes("bakery")) {
    return {
      bg: "bg-[#FEF3C7]", // amber tint
      text: "text-amber-600",
      icon: Utensils
    };
  }
  // Default is Cafe
  return {
    bg: "bg-[#FFEDD5]", // peach tint
    text: "text-[#F97316]",
    icon: Coffee
  };
};

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState("visits"); // "visits" | "vouchers"
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterChip, setFilterChip] = useState("All");
  const [selectedStore, setSelectedStore] = useState(null);
  const [showAllShopsLoyaltyModal, setShowAllShopsLoyaltyModal] = useState(false);

  // Fetch checkin history
  const { data: checkinsData, isLoading: checkinsLoading } = useQuery({
    queryKey: ["checkinHistory"],
    queryFn: () => api.get("/checkins/history").then((res) => res.data),
  });

  // Fetch rewards history and points totals
  const { data: rewardsData, isLoading: rewardsLoading } = useQuery({
    queryKey: ["rewardsHistory"],
    queryFn: () => api.get("/customer/rewards").then((res) => res.data),
  });

  // Fetch nearest active loyalty card details for progress callout
  const { data: dashboardData } = useQuery({
    queryKey: ["customerDashboard"],
    queryFn: () => api.get("/customer/dashboard").then((res) => res.data),
  });

  // Fetch per-store points history
  const { data: pointsHistoryData, isLoading: pointsHistoryLoading } = useQuery({
    queryKey: ["pointsHistory"],
    queryFn: () => api.get("/customer/points-history").then((res) => res.data),
    enabled: filterChip === "Points",
  });
  const storePoints = (pointsHistoryData?.storePoints ?? pointsHistoryData?.data?.storePoints) || [];
  const grandTotal = (pointsHistoryData?.grandTotal ?? pointsHistoryData?.data?.grandTotal) || 0;

  const checkins = checkinsData || [];
  const rewards = (rewardsData?.rewards ?? rewardsData?.data?.rewards) || [];
  const totalPointsEarned = (rewardsData?.totalPointsEarned ?? rewardsData?.data?.totalPointsEarned) ?? 0;
  const totalExtraPoints = (rewardsData?.totalExtraPoints ?? rewardsData?.data?.totalExtraPoints) ?? 0;

  // Filter lists based on chip
  const filteredCheckins = checkins.filter(item => {
    if (filterChip === "All") return true;
    if (filterChip === "Check-ins") return true; // checkins tab shows visits anyway
    return false;
  });

  const filteredRewards = rewards.filter(item => {
    if (filterChip === "All") return true;
    if (filterChip === "Rewards") return true;
    return false;
  });

  // Group checkins by Date
  const groupCheckinsByDate = (items) => {
    const groups = {};
    items.forEach(item => {
      const date = new Date(item.createdAt);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      let groupKey = date.toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' });
      if (date.toDateString() === today.toDateString()) {
        groupKey = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = "Yesterday";
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });
    return groups;
  };

  const groupedCheckins = groupCheckinsByDate(filteredCheckins);

  // Compute nearest reward progress
  const activeCards = dashboardData?.loyaltyCards || [];
  const nearestCard = activeCards.length > 0
    ? [...activeCards].sort((a, b) => {
        const stampsA = a.visitCard?.wallet?.currentStamps || a.wallet?.currentStamps || 0;
        const stampsB = b.visitCard?.wallet?.currentStamps || b.wallet?.currentStamps || 0;
        return stampsB - stampsA; // sort descending to find the one closest to complete
      })[0]
    : null;

  const currentStamps = nearestCard ? (nearestCard.visitCard?.wallet?.currentStamps || nearestCard.wallet?.currentStamps || 0) : 0;
  const requiredStamps = nearestCard ? (nearestCard.visitCard?.settings?.requiredStamps || nearestCard.settings?.requiredStamps || 7) : 7;
  const rewardName = nearestCard ? (nearestCard.visitCard?.settings?.rewardName || nearestCard.settings?.rewardName || "Free Reward") : "";
  const stampsRemaining = requiredStamps - currentStamps;
  const progressPercent = requiredStamps > 0 ? (currentStamps / requiredStamps) * 100 : 0;

  // Stats
  const statCheckinsCount = checkins.length;
  const statPointsEarned = totalPointsEarned;
  const statRewardsEarned = rewards.length;

  return (
    React.createElement('div', { className: "space-y-6" }

      /* Title bar & back button */
      , React.createElement('div', { className: "flex items-start gap-3.5" }
        , React.createElement('div', { className: "w-11 h-11 bg-[#FFEDD5] text-[#F97316] rounded-2xl flex items-center justify-center shrink-0" }
          , React.createElement(Wallet, { className: "h-5.5 w-5.5" })
        )
        , React.createElement('div', null
          , React.createElement('h2', { className: "text-xl font-black text-[#0F172A] leading-tight" }, "History Wallet")
          , React.createElement('p', { className: "text-xs text-[#64748B] mt-0.5" }, "All your visits, stamps & rewards in one place")
        )
      )

      /* Tab toggle (2 segments, full width) */
      , React.createElement('div', { className: "flex bg-slate-100 rounded-2xl p-1" }
        , React.createElement('button', {
            type: "button",
            onClick: () => setActiveTab("visits"),
            className: cn("flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
              , activeTab === "visits" ? "bg-white text-[#F97316] shadow-sm" : "text-[#64748B] hover:text-[#0F172A]"
            )
          }
          , React.createElement(Clock, { className: "h-4 w-4" })
          , "Visits History"
        )
        , React.createElement('button', {
            type: "button",
            onClick: () => setActiveTab("vouchers"),
            className: cn("flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
              , activeTab === "vouchers" ? "bg-white text-[#F97316] shadow-sm" : "text-[#64748B] hover:text-[#0F172A]"
            )
          }
          , React.createElement(Gift, { className: "h-4 w-4" })
          , "Voucher Logs"
        )
      )

      /* D. Stats row (3 cards tinted bg) */
      , React.createElement('div', { className: "grid grid-cols-3 gap-2.5" }
        , React.createElement('div', { className: "bg-[#FFF1E6] rounded-3xl p-3.5 flex flex-col justify-between space-y-2 border border-[#FFF1E6]" }
          , React.createElement('div', { className: "w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#F97316]" }
            , React.createElement(Store, { className: "h-4 w-4" })
          )
          , React.createElement('div', null
            , React.createElement('p', { className: "text-xl font-black text-[#F97316] leading-none" }, statCheckinsCount)
            , React.createElement('p', { className: "text-[9px] font-bold text-[#64748B] tracking-tight mt-1" }, "Total Check-ins")
            , React.createElement('p', { className: "text-[8px] text-[#F97316]/75 mt-0.5" }, "Keep it up!")
          )
        )
        , React.createElement('div', { className: "bg-[#EDE9FE] rounded-3xl p-3.5 flex flex-col justify-between space-y-2 border border-[#EDE9FE]" }
          , React.createElement('div', { className: "w-8 h-8 rounded-full bg-white flex items-center justify-center text-purple-600" }
            , React.createElement(Star, { className: "h-4 w-4" })
          )
          , React.createElement('div', null
            , React.createElement('p', { className: "text-xl font-black text-purple-600 leading-none" }, statPointsEarned)
            , React.createElement('p', { className: "text-[9px] font-bold text-[#64748B] tracking-tight mt-1" }, "Total Points")
            , React.createElement('p', { className: "text-[8px] text-purple-600/75 mt-0.5" }, "Awesome!")
          )
        )
        , React.createElement('div', { className: "bg-[#DCFCE7] rounded-3xl p-3.5 flex flex-col justify-between space-y-2 border border-[#DCFCE7]" }
          , React.createElement('div', { className: "w-8 h-8 rounded-full bg-white flex items-center justify-center text-emerald-600" }
            , React.createElement(Gift, { className: "h-4 w-4" })
          )
          , React.createElement('div', null
            , React.createElement('p', { className: "text-xl font-black text-[#22C55E] leading-none" }, statRewardsEarned)
            , React.createElement('p', { className: "text-[9px] font-bold text-[#64748B] tracking-tight mt-1" }, "Rewards Earned")
            , React.createElement('p', { className: "text-[8px] text-[#22C55E]/75 mt-0.5" }, "Enjoy more!")
          )
        )
      )

      /* E. Filter row */
      , React.createElement('div', { className: "flex items-center justify-between gap-3 pt-2" }
        , React.createElement('div', { className: "flex gap-2 overflow-x-auto scrollbar-none" }
          , ["All", "Check-ins", "Rewards", "Points"].map((chip) => {
              const active = filterChip === chip;
              return React.createElement('button', {
                key: chip,
                onClick: () => setFilterChip(chip),
                className: cn("px-4 py-1.5 rounded-full text-xs font-bold border transition-colors flex items-center gap-1.5 shrink-0"
                  , active ? "border-[#F97316] bg-[#FFEDD5]/60 text-[#F97316]" : "border-slate-200 text-[#64748B] hover:text-[#0F172A]"
                )
              }
                , chip === "All" && React.createElement(SlidersHorizontal, { className: "h-3 w-3 shrink-0" })
                , chip
              );
            })
        )
        , React.createElement('button', { className: "w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 shrink-0" }
          , React.createElement(SlidersHorizontal, { className: "h-3.5 w-3.5" })
        )
      )

      /* VISITS HISTORY TAB VIEW */
      , activeTab === "visits" && React.createElement(React.Fragment, null
          , checkinsLoading ? (
              React.createElement('div', { className: "flex justify-center py-12" }
                , React.createElement(Loader2, { className: "h-6 w-6 animate-spin text-primary" })
              )
            )
          : Object.keys(groupedCheckins).length === 0 ? (
              React.createElement(Card, { className: "border-dashed border-slate-200 bg-slate-50/50 py-12 text-center rounded-3xl" }
                , React.createElement(CardContent, { className: "flex flex-col items-center justify-center space-y-3" }
                  , React.createElement(Calendar, { className: "h-10 w-10 text-slate-300" })
                  , React.createElement('p', { className: "text-sm text-[#0F172A] font-bold" }, "No check-ins logged yet")
                  , React.createElement('p', { className: "text-xs text-[#64748B] max-w-xs" }, "Your successful counter check-ins will show up here.")
                )
              )
            )
          : React.createElement('div', { className: "space-y-6 relative pl-3" }
              /* Vertical dashed line */
              , React.createElement('div', { className: "absolute left-[23px] top-4 bottom-4 w-0.5 border-l-2 border-dashed border-slate-200" })

              , Object.keys(groupedCheckins).map((dateGroup, gIdx) => React.createElement('div', { key: dateGroup, className: "space-y-4" }
                  /* Date group pill */
                  , React.createElement('div', { className: "relative z-10 flex" }
                    , React.createElement('span', { className: "bg-slate-100 text-[#0F172A] text-[10px] font-black uppercase px-2.5 py-1 rounded-full" }, dateGroup)
                  )

                  /* Entries */
                  , groupedCheckins[dateGroup].map((item, idx) => {
                      const styles = getCategoryStyle(item.business.category);
                      const CategoryIcon = styles.icon;
                      // Dot fill state based on dateGroup recency
                      const isRecent = dateGroup === "Today";

                      return React.createElement('div', {
                        key: item.id,
                        onClick: () => setSelectedItem({ type: 'visit', data: item }),
                        className: "relative flex items-start gap-4 cursor-pointer"
                      }
                        /* Timeline indicator dot */
                        , React.createElement('div', { className: "absolute left-[7px] top-[18px] z-10 w-3 h-3 rounded-full border-2 border-white flex items-center justify-center shadow-sm" }
                          , React.createElement('div', { className: cn("w-1.5 h-1.5 rounded-full", isRecent ? "bg-[#F97316]" : "bg-slate-300") })
                        )

                        /* Entry card */
                        , React.createElement('div', { className: "flex-1 bg-white rounded-3xl border border-slate-100 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center justify-between gap-3 hover:scale-[1.01] active:scale-[0.99] transition-all ml-4" }
                            , React.createElement('div', { className: "flex items-center gap-3 min-w-0" }
                              , React.createElement('div', { className: cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0", styles.bg, styles.text) }
                                , React.createElement(CategoryIcon, { className: "h-5 w-5" })
                              )
                              , React.createElement('div', { className: "min-w-0" }
                                , React.createElement('h4', { className: "font-black text-sm text-[#0F172A] truncate" }, item.business.name)
                                , React.createElement('div', { className: "flex items-center gap-1.5 mt-0.5" }
                                  , React.createElement('span', { className: "text-[9px] bg-slate-100 text-slate-500 font-extrabold px-1.5 py-0.5 rounded-full" }, item.business.category || "Cafe")
                                  , React.createElement('span', { className: "text-[9px] text-[#64748B]" }
                                      , new Date(item.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                                    )
                                )
                              )
                            )
                            , React.createElement('div', { className: "flex items-center gap-2 shrink-0 text-right" }
                              , React.createElement('div', { className: "space-y-1" }
                                , React.createElement('span', { className: "block text-[9px] bg-[#DCFCE7] text-[#16A34A] font-extrabold px-1.5 py-0.5 rounded-full whitespace-nowrap" }, "✓ Stamp Earned")
                                , React.createElement('p', { className: "font-black text-xs text-[#F97316]" }, "+10 Points")
                              )
                              , React.createElement(ChevronRight, { className: "h-4 w-4 text-slate-300" })
                            )
                        )
                      );
                    })
                ))
            )
        )

      /* VOUCHER LOGS TAB VIEW */
      , activeTab === "vouchers" && React.createElement(React.Fragment, null
          , rewardsLoading ? (
              React.createElement('div', { className: "flex justify-center py-12" }
                , React.createElement(Loader2, { className: "h-6 w-6 animate-spin text-primary" })
              )
            )
          : filteredRewards.length === 0 ? (
              React.createElement(Card, { className: "border-dashed border-slate-200 bg-slate-50/50 py-12 text-center rounded-3xl" }
                , React.createElement(CardContent, { className: "flex flex-col items-center justify-center space-y-3" }
                  , React.createElement(Award, { className: "h-10 w-10 text-slate-300" })
                  , React.createElement('p', { className: "text-sm text-[#0F172A] font-bold" }, "No rewards unlocked yet")
                  , React.createElement('p', { className: "text-xs text-[#64748B] max-w-xs" }, "Accumulate stamps on your loyalty card to unlock promotional vouchers.")
                )
              )
            )
          : React.createElement('div', { className: "space-y-3" }
              , filteredRewards.map((item) => {
                  const isRedeemed = item.status === "REDEEMED";
                  return React.createElement('div', {
                    key: item.id,
                    onClick: () => setSelectedItem({ type: 'voucher', data: item }),
                    className: "bg-white rounded-3xl border border-slate-100 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center justify-between gap-3 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
                  }
                    , React.createElement('div', { className: "flex items-center gap-3 min-w-0" }
                      , React.createElement('div', { className: cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                          , isRedeemed ? "bg-slate-100 text-slate-400" : "bg-[#DCFCE7] text-[#16A34A]"
                        ) }
                        , React.createElement(Award, { className: "h-5 w-5" })
                      )
                      , React.createElement('div', { className: "min-w-0" }
                        , React.createElement('h4', { className: "font-black text-sm text-[#0F172A] truncate" }, item.reward.title)
                        , React.createElement('p', { className: "text-[10px] text-[#64748B]" }
                          , isRedeemed ? `Redeemed: ${formatDate(item.redeemedAt)}` : `Unlocked: ${formatDate(item.createdAt)}`
                        )
                      )
                    )
                    , React.createElement('div', { className: "flex items-center gap-2 shrink-0 text-right" }
                      , React.createElement('div', { className: "space-y-1" }
                        , React.createElement('span', { className: cn("block text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase border"
                            , isRedeemed ? "bg-slate-50 text-slate-400 border-slate-100" : "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]"
                          ) }, item.status)
                        , React.createElement('p', { className: "text-[9px] text-[#64748B] font-mono" }, "Code: ", item.redemptionCode.slice(0, 8).toUpperCase())
                      )
                      , React.createElement(ChevronRight, { className: "h-4 w-4 text-slate-300" })
                    )
                  );
                })
            )
        )

      /* POINTS TAB: per-store breakdown */
      , filterChip === "Points" && React.createElement(React.Fragment, null
          , pointsHistoryLoading ? (
            React.createElement('div', { className: "flex flex-col items-center justify-center py-14 gap-3" }
              , React.createElement(Loader2, { className: "h-7 w-7 animate-spin text-[#F97316]" })
              , React.createElement('p', { className: "text-xs text-[#64748B]" }, "Loading points history...")
            )
          ) : storePoints.length === 0 ? (
            React.createElement('div', { className: "flex flex-col items-center justify-center py-14 gap-3" }
              , React.createElement('div', { className: "w-16 h-16 rounded-full bg-[#FFEDD5] flex items-center justify-center" }
                , React.createElement(Star, { className: "h-8 w-8 text-[#F97316]" })
              )
              , React.createElement('p', { className: "text-sm text-[#0F172A] font-black" }, "No points earned yet")
              , React.createElement('p', { className: "text-xs text-[#64748B] text-center max-w-xs" }, "Visit partner stores and earn points with every check-in.")
            )
          ) : React.createElement('div', { className: "space-y-3" }
            /* Grand Total Banner */
            , React.createElement('div', { className: "bg-gradient-to-r from-[#F97316] to-[#EA580C] rounded-3xl p-4 flex items-center justify-between" }
              , React.createElement('div', null
                , React.createElement('p', { className: "text-[10px] text-white/75 font-semibold uppercase tracking-wide" }, "Total Points Earned")
                , React.createElement('p', { className: "text-2xl font-black text-white leading-none mt-0.5" }, grandTotal)
              )
              , React.createElement('div', { className: "w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center" }
                , React.createElement(TrendingUp, { className: "h-6 w-6 text-white" })
              )
            )
            /* Per-store cards */
            , storePoints.map((store) => {
                const styles = getCategoryStyle(store.category);
                const StoreIcon = styles.icon;
                return React.createElement('div', {
                  key: store.businessId,
                  onClick: () => setSelectedStore(store),
                  className: "bg-white rounded-3xl border border-slate-100 p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center justify-between gap-3 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
                }
                  , React.createElement('div', { className: "flex items-center gap-3 min-w-0" }
                    , React.createElement('div', { className: cn("w-11 h-11 rounded-2xl flex items-center justify-center shrink-0", styles.bg, styles.text) }
                      , React.createElement(StoreIcon, { className: "h-5 w-5" })
                    )
                    , React.createElement('div', { className: "min-w-0" }
                      , React.createElement('h4', { className: "font-black text-sm text-[#0F172A] truncate" }, store.businessName)
                      , React.createElement('div', { className: "flex items-center gap-1.5 mt-0.5" }
                        , React.createElement('span', { className: "text-[9px] bg-slate-100 text-slate-500 font-extrabold px-1.5 py-0.5 rounded-full" }, store.category || "Store")
                        , React.createElement('span', { className: "text-[9px] text-[#64748B]" }, `${store.visitCount} visit${store.visitCount !== 1 ? 's' : ''}`)
                      )
                    )
                  )
                  , React.createElement('div', { className: "flex items-center gap-2 shrink-0" }
                    , React.createElement('div', { className: "text-right" }
                      , React.createElement('p', { className: "text-base font-black text-[#F97316] leading-none" }, `+${store.totalPoints}`)
                      , React.createElement('p', { className: "text-[9px] text-[#64748B] font-semibold mt-0.5" }, "pts earned")
                    )
                    , React.createElement(ChevronRight, { className: "h-4 w-4 text-slate-300" })
                  )
                );
              })
          )
        )

      /* G. Reward-progress callout */
      , React.createElement('div', {
          onClick: () => setShowAllShopsLoyaltyModal(true),
          className: "bg-[#FFF1E6] rounded-3xl p-4 flex items-center justify-between gap-3 border border-[#FFF1E6] cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
        }
        , !nearestCard ? (
            React.createElement('div', { className: "flex items-center gap-2.5" }
              , React.createElement('span', { className: "text-lg shrink-0" }, "🎁")
              , React.createElement('div', null
                , React.createElement('p', { className: "text-xs font-black text-[#F97316] leading-tight" }, "Scan QR at shops to earn stamps!")
                , React.createElement('p', { className: "text-[9px] text-[#64748B] font-semibold mt-0.5" }, "Track all your active rewards shop-wise")
              )
            )
          ) : (
            React.createElement('div', { className: "flex items-start gap-2.5" }
              , React.createElement('span', { className: "text-lg shrink-0 mt-0.5" }, "🎁")
              , React.createElement('div', null
                , React.createElement('p', { className: "text-[10px] text-[#64748B] font-semibold" }, `You're ${stampsRemaining} stamp${stampsRemaining > 1 ? "s" : ""} away from:`)
                , React.createElement('p', { className: "text-xs font-black text-[#F97316] leading-tight" }, `${rewardName} ☕`)
              )
            )
          )
        , nearestCard ? (
            React.createElement('div', { className: "flex items-center gap-1.5 shrink-0" }
              , React.createElement('div', { className: "relative w-10 h-10 flex items-center justify-center" }
                /* Simple SVG Progress Ring */
                , React.createElement('svg', { className: "absolute inset-0 w-full h-full transform -rotate-95" }
                  , React.createElement('circle', { cx: 20, cy: 20, r: 16, stroke: "#FFF", strokeWidth: "3.5", fill: "transparent" })
                  , React.createElement('circle', {
                      cx: 20, cy: 20, r: 16,
                      stroke: "#F97316", strokeWidth: "3.5",
                      strokeDasharray: 2 * Math.PI * 16,
                      strokeDashoffset: 2 * Math.PI * 16 * (1 - progressPercent / 100),
                      strokeLinecap: "round",
                      fill: "transparent"
                    })
                )
                , React.createElement('span', { className: "text-[9px] font-black text-[#F97316] z-10" }, `${currentStamps}/${requiredStamps}`)
              )
              , React.createElement(ChevronRight, { className: "h-4 w-4 text-[#F97316] ml-0.5" })
            )
          ) : (
            React.createElement(ChevronRight, { className: "h-4 w-4 text-[#F97316]" })
          )
      )

      /* All Shops Loyalty Modal */
      , showAllShopsLoyaltyModal && React.createElement(
          Dialog, { open: showAllShopsLoyaltyModal, onOpenChange: (open) => !open && setShowAllShopsLoyaltyModal(false) },
          React.createElement(DialogContent, { className: "max-w-[400px] w-[95vw] bg-white border border-border p-6 rounded-3xl shadow-xl max-h-[85vh] flex flex-col" },
            React.createElement('div', { className: "space-y-4 w-full flex-1 flex flex-col min-h-0" }
              , React.createElement(DialogHeader, { className: "flex flex-col items-center shrink-0" }
                , React.createElement('div', { className: "h-12 w-12 rounded-full bg-[#FFF1E6] flex items-center justify-center mb-2" }
                  , React.createElement(Gift, { className: "h-6 w-6 text-[#F97316]" })
                )
                , React.createElement(DialogTitle, { className: "text-base font-black text-foreground text-center" }, "My Shop Loyalty Programs")
                , React.createElement(DialogDescription, { className: "text-xs text-muted-foreground text-center" }, "Your active stamps and points across all visited shops")
              )
              , React.createElement('div', { className: "flex-1 overflow-y-auto space-y-3.5 py-4 scrollbar-none" }
                , activeCards.length === 0 ? (
                    React.createElement('div', { className: "text-center py-6 text-slate-400 space-y-2" }
                      , React.createElement('p', { className: "text-xs font-bold" }, "No shops visited yet")
                      , React.createElement('p', { className: "text-[10px]" }, "Scan a shop's QR code to join their loyalty program.")
                    )
                  ) : (
                    activeCards.map((card) => {
                      const hasStampProgram = !!card.visitCard;
                      const stamps = card.visitCard?.wallet?.currentStamps ?? card.wallet?.currentStamps ?? 0;
                      const required = card.visitCard?.settings?.requiredStamps ?? card.settings?.requiredStamps ?? 7;
                      const reward = card.visitCard?.settings?.rewardName ?? card.settings?.rewardName ?? "Free Reward";
                      const points = card.wallet?.currentPoints ?? 0;
                      const style = getCategoryStyle(card.business?.category);
                      const IconComponent = style.icon;

                      return React.createElement('div', {
                        key: card.id,
                        className: "bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3"
                      }
                        , React.createElement('div', { className: "flex items-center justify-between" }
                          , React.createElement('div', { className: "flex items-center gap-2.5 min-w-0" }
                            , React.createElement('div', { className: cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", style.bg, style.text) }
                              , React.createElement(IconComponent, { className: "h-4 w-4" })
                            )
                            , React.createElement('div', { className: "min-w-0" }
                              , React.createElement('h4', { className: "font-black text-xs text-[#0F172A] truncate" }, card.business?.name)
                              , React.createElement('span', { className: "text-[8px] bg-slate-200/60 text-slate-500 font-extrabold px-1.5 py-0.5 rounded-full uppercase" }, card.business?.category || "Store")
                            )
                          )
                          , React.createElement('div', { className: "text-right shrink-0" }
                            , React.createElement('p', { className: "text-xs font-black text-[#F97316]" }, `+${points} pts`)
                            , React.createElement('p', { className: "text-[7px] text-[#64748B] font-bold" }, "balance")
                          )
                        )
                        , (hasStampProgram || stamps > 0) && (
                          React.createElement('div', { className: "bg-white border border-slate-100/80 rounded-xl p-2.5 flex items-center justify-between gap-2" }
                            , React.createElement('div', { className: "flex items-center gap-2" }
                              , React.createElement('span', { className: "text-xs" }, "🎁")
                              , React.createElement('div', null
                                , React.createElement('p', { className: "text-[9px] text-slate-800 font-black leading-tight" }, reward)
                                , React.createElement('p', { className: "text-[8px] text-slate-400 font-semibold" }, `${required - stamps} stamps remaining`)
                              )
                            )
                            , React.createElement('span', { className: "text-[9px] font-black bg-orange-50 text-[#F97316] border border-orange-100 px-2 py-0.5 rounded-full" }, `${stamps}/${required} Stamps`)
                          )
                        )
                      );
                    })
                  )
              )
              , React.createElement('div', { className: "pt-2 shrink-0" }
                , React.createElement(Button, {
                    type: "button",
                    onClick: () => setShowAllShopsLoyaltyModal(false),
                    className: "w-full rounded-xl text-xs font-bold bg-[#F97316] text-white hover:bg-orange-600 h-9"
                  }, "Close")
              )
            )
          )
        )

      /* Store Points Detail Modal */
      , selectedStore && React.createElement(
          Dialog, { open: !!selectedStore, onOpenChange: (open) => !open && setSelectedStore(null) },
          React.createElement(DialogContent, { className: "max-w-[360px] bg-white border border-border p-6 rounded-3xl shadow-xl" },
            React.createElement('div', { className: "space-y-4 w-full" }
              , React.createElement(DialogHeader, { className: "flex flex-col items-center" }
                , React.createElement('div', { className: cn("h-12 w-12 rounded-full flex items-center justify-center mb-2", getCategoryStyle(selectedStore.category).bg, getCategoryStyle(selectedStore.category).text) }
                  , React.createElement(Store, { className: "h-6 w-6" })
                )
                , React.createElement(DialogTitle, { className: "text-base font-black text-foreground" }, selectedStore.businessName)
                , React.createElement(DialogDescription, { className: "text-xs text-muted-foreground" }, `${selectedStore.visitCount} verified visit${selectedStore.visitCount !== 1 ? 's' : ''} • ${selectedStore.category}`)
              )
              , React.createElement('div', { className: "bg-gradient-to-r from-[#FFEDD5] to-[#FFF7ED] rounded-2xl p-4 flex items-center justify-between" }
                , React.createElement('div', null
                  , React.createElement('p', { className: "text-[10px] text-[#64748B] font-semibold" }, "Total Points from this Store")
                  , React.createElement('p', { className: "text-2xl font-black text-[#F97316]" }, selectedStore.totalPoints)
                )
                , React.createElement(Star, { className: "h-8 w-8 text-[#F97316]/40" })
              )
              , selectedStore.recentVisits.length > 0 && React.createElement('div', { className: "space-y-2" }
                , React.createElement('p', { className: "text-[10px] font-black text-[#64748B] uppercase tracking-wider" }, "Recent Visits")
                , selectedStore.recentVisits.map((visit, i) => React.createElement('div', { key: i, className: "flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2" }
                    , React.createElement('div', null
                      , React.createElement('p', { className: "text-[10px] text-[#64748B]" }, formatDate(visit.date))
                    )
                    , React.createElement('div', { className: "text-right" }
                      , React.createElement('p', { className: "text-xs font-black text-[#F97316]" }, `+${visit.points} pts`)
                      , visit.extraPoints > 0 && React.createElement('p', { className: "text-[9px] text-amber-500 font-bold" }, `+${visit.extraPoints} extra`)
                    )
                  ))
              )
              , React.createElement(Button, { type: "button", variant: "outline", onClick: () => setSelectedStore(null), className: "w-full text-xs rounded-xl" }, "Close")
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
                  React.createElement("div", { className: "h-12 w-12 rounded-full bg-indigo-50 text-[#F97316] flex items-center justify-center mb-2" },
                    React.createElement(ArrowUpRight, { className: "h-6 w-6" })
                  ),
                  React.createElement(DialogTitle, { className: "text-lg font-black text-foreground" }, selectedItem.data.business.name),
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
                  React.createElement("div", { className: "h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2" },
                    React.createElement(Award, { className: "h-6 w-6" })
                  ),
                  React.createElement(DialogTitle, { className: "text-lg font-black text-foreground" }, selectedItem.data.reward.title),
                  React.createElement(DialogDescription, { className: "text-xs text-muted-foreground" }, selectedItem.data.reward.description || "Partner discount voucher logs")
                ),
                React.createElement("div", { className: "w-full bg-slate-50 rounded-2xl p-4 border border-border/50 text-left space-y-2.5 text-xs" },
                  React.createElement("div", { className: "flex justify-between" },
                    React.createElement("span", { className: "text-muted-foreground font-semibold" }, "Redemption Status"),
                    React.createElement("span", { className: cn("font-bold uppercase tracking-wider text-[9px] px-2 py-0.5 rounded-full border"
                      , selectedItem.data.status === "REDEEMED" ? "bg-slate-100 text-slate-400" : "bg-[#DCFCE7] text-[#16A34A]"
                    ) }, selectedItem.data.status)
                  ),
                  React.createElement("div", { className: "flex justify-between" },
                    React.createElement("span", { className: "text-muted-foreground font-semibold" }, "Redemption Code"),
                    React.createElement("span", { className: "font-mono font-bold text-[#F97316] bg-white border border-border/60 px-1.5 py-0.5 rounded" }, selectedItem.data.redemptionCode.toUpperCase())
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

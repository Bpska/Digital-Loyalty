const _jsxFileName = "src\\pages\\(customer)\\loyalty-history\\page.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Award, Star, Loader2, History, Building2, ChevronDown, ChevronRight, 
  QrCode, Hourglass, Gift, Check, ArrowRight, BookOpen, User, ArrowUpRight, Store
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

// Category style mapping
const getCategoryStyle = (category) => {
  const norm = (category || "").toLowerCase().trim();
  if (norm.includes("salon") || norm.includes("spa") || norm.includes("beauty") || norm.includes("hair")) {
    return { bg: "bg-[#DBEAFE]", text: "text-blue-600", icon: Award };
  }
  if (norm.includes("hotel") || norm.includes("resort") || norm.includes("stay") || norm.includes("hostel")) {
    return { bg: "bg-[#EDE9FE]", text: "text-purple-600", icon: Building2 };
  }
  if (norm.includes("restaurant") || norm.includes("food") || norm.includes("bakery")) {
    return { bg: "bg-[#FEF3C7]", text: "text-amber-600", icon: Star };
  }
  return { bg: "bg-[#FFEDD5]", text: "text-[#F97316]", icon: CoffeeIcon };
};

// Muted Coffee Icon fallback
function CoffeeIcon(props) {
  return React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ...props
  },
    React.createElement("path", { d: "M17 8h1a4 4 0 1 1 0 8h-1" }),
    React.createElement("path", { d: "M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" }),
    React.createElement("line", { x1: "6", y1: "2", x2: "6", y2: "4" }),
    React.createElement("line", { x1: "10", y1: "2", x2: "10", y2: "4" }),
    React.createElement("line", { x1: "14", y1: "2", x2: "14", y2: "4" })
  );
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

export default function CustomerLoyaltyHistoryPage() {
  const [timeRange, setTimeRange] = useState("This Month");
  const [selectedTx, setSelectedTx] = useState(null);
  const [showAllShopsLoyaltyModal, setShowAllShopsLoyaltyModal] = useState(false);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["loyaltyHistory"],
    queryFn: () => api.get("/loyalty-approval/history?limit=100").then(r => r),
    refetchInterval: 60000,
  });

  const { data: dashboardData } = useQuery({
    queryKey: ["customerDashboard"],
    queryFn: () => api.get("/customer/dashboard").then((res) => res.data),
  });

  const transactions = data?.data || [];
  
  // Filter transactions based on time range
  const filteredTransactions = transactions.filter(tx => {
    if (timeRange === "All Time") return true;
    const txDate = new Date(tx.createdAt);
    const now = new Date();
    if (timeRange === "This Month") {
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    }
    if (timeRange === "This Week") {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return txDate >= oneWeekAgo;
    }
    return true;
  });

  const totalPoints = filteredTransactions.reduce((sum, tx) => sum + (tx.extraPoints || 0), 0);
  const totalExtraPoints = filteredTransactions.reduce((sum, tx) => sum + (tx.extraPoints || 0), 0);

  // Compute nearest reward progress
  const activeCards = dashboardData?.loyaltyCards || [];
  const nearestCard = activeCards.length > 0
    ? [...activeCards].sort((a, b) => {
        const stampsA = a.visitCard?.wallet?.currentStamps || a.wallet?.currentStamps || 0;
        const stampsB = b.visitCard?.wallet?.currentStamps || b.wallet?.currentStamps || 0;
        return stampsB - stampsA;
      })[0]
    : null;

  const currentStamps = nearestCard ? (nearestCard.visitCard?.wallet?.currentStamps || nearestCard.wallet?.currentStamps || 0) : 0;
  const requiredStamps = nearestCard ? (nearestCard.visitCard?.settings?.requiredStamps || nearestCard.settings?.requiredStamps || 7) : 7;
  const rewardName = nearestCard ? (nearestCard.visitCard?.settings?.rewardName || nearestCard.settings?.rewardName || "Free Reward") : "";
  const stampsRemaining = requiredStamps - currentStamps;
  const progressPercent = requiredStamps > 0 ? (currentStamps / requiredStamps) * 100 : 0;

  // Calculate points breakdown per store
  const pointsByStore = filteredTransactions.reduce((acc, tx) => {
    const bizId = tx.businessId;
    const bizName = tx.business?.name || "Unknown Store";
    const bizCategory = tx.business?.category || "Store";
    if (!acc[bizId]) {
      acc[bizId] = { name: bizName, category: bizCategory, points: 0, extraPoints: 0 };
    }
    acc[bizId].points += tx.points;
    acc[bizId].extraPoints += (tx.extraPoints || 0);
    return acc;
  }, {});

  const pointsByStoreList = Object.values(pointsByStore);
  const totalStoresVisited = pointsByStoreList.length;

  // Group transactions by date label
  const groupTransactionsByDate = (items) => {
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
    return Object.entries(groups);
  };

  const groupedTransactions = groupTransactionsByDate(filteredTransactions);

  return (
    React.createElement('div', { className: "space-y-6" }

      /* B. Page title block */
      , React.createElement('div', { className: "flex items-start justify-between gap-4" }
        , React.createElement('div', null
          , React.createElement('h2', { className: "text-[26px] font-black text-[#0F172A] leading-tight" }, "Loyalty History")
          , React.createElement('p', { className: "text-xs text-[#64748B] mt-0.5" }, "Track all your points and rewards in one place.")
        )
        , React.createElement('div', { className: "relative shrink-0" }
          , React.createElement('select', {
              value: timeRange,
              onChange: (e) => setTimeRange(e.target.value),
              className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            }
            , React.createElement('option', { value: "This Month" }, "This Month")
            , React.createElement('option', { value: "This Week" }, "This Week")
            , React.createElement('option', { value: "All Time" }, "All Time")
          )
          , React.createElement('button', { className: "bg-[#FFEDD5] text-[#F97316] rounded-full px-3 py-1.5 flex items-center gap-1 hover:bg-[#FFEDD5]/80 active:scale-95 transition-all text-[10px] font-bold shadow-sm relative z-0" }
            , React.createElement(BookOpen, { className: "h-3.5 w-3.5" })
            , timeRange
            , React.createElement(ChevronDown, { className: "h-3 w-3" })
          )
        )
      )

      /* C. Points summary (2 cards side by side) */
      , React.createElement('div', { className: "grid grid-cols-2 gap-3" }
        /* Total Points Card */
        , React.createElement('div', {
            onClick: () => setShowBreakdownModal(true),
            className: "bg-[#F97316] text-white rounded-3xl p-4 relative overflow-hidden flex flex-col justify-between h-28 shadow-sm border border-[#F97316] cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
          }
          , React.createElement('div', { className: "flex justify-between items-start" }
            , React.createElement('span', { className: "text-[9px] font-extrabold tracking-wider opacity-90 uppercase" }, "Total Points")
            , React.createElement('div', { className: "w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0" }
              , React.createElement(User, { className: "h-3.5 w-3.5" })
            )
          )
          , React.createElement('div', { className: "mt-auto" }
            , React.createElement('p', { className: "text-2xl font-black leading-none" }, totalPoints)
            , React.createElement('p', { className: "text-[8px] opacity-80 mt-1" }, "From Businesses")
          )
        )
        /* Extra Points Card */
        , React.createElement('div', { className: "bg-white text-[#F97316] rounded-3xl p-4 relative overflow-hidden flex flex-col justify-between h-28 shadow-sm border border-[#F97316]/30" }
          , React.createElement('div', { className: "flex justify-between items-start" }
            , React.createElement('span', { className: "text-[9px] font-extrabold tracking-wider text-[#64748B] uppercase" }, "Extra Points")
            , React.createElement('div', { className: "w-7 h-7 rounded-full bg-[#FFEDD5] flex items-center justify-center text-[#F97316] shrink-0" }
              , React.createElement(Star, { className: "h-3.5 w-3.5 fill-current" })
            )
          )
          , React.createElement('div', { className: "mt-auto" }
            , React.createElement('p', { className: "text-2xl font-black text-[#F97316] leading-none" }, totalExtraPoints)
            , React.createElement('p', { className: "text-[8px] text-[#64748B] mt-1" }, "From Offers & Bonuses")
          )
        )
      )

      /* POPULATED VS EMPTY STATE */
      , isLoading ? (
          React.createElement('div', { className: "flex justify-center py-12" }
            , React.createElement(Loader2, { className: "h-6 w-6 animate-spin text-[#F97316]" })
          )
        )
      : transactions.length === 0 ? (
          /* D. Empty state panel */
          React.createElement('div', { className: "bg-[#F8FAFC] border border-slate-100 rounded-3xl p-6 text-center flex flex-col items-center justify-center space-y-4" }
            , React.createElement('div', { className: "relative w-16 h-16 flex items-center justify-center" }
              /* Decorative background blobs */
              , React.createElement('div', { className: "absolute inset-0 bg-[#FFEDD5] rounded-full blur-sm opacity-60 scale-105" })
              , React.createElement(History, { className: "h-8 w-8 text-slate-400 relative z-10" })
            )
            , React.createElement('div', { className: "space-y-1" }
              , React.createElement('h3', { className: "text-base font-black text-[#0F172A]" }, "No Points Earned Yet")
              , React.createElement('p', { className: "text-xs text-[#64748B] max-w-xs mx-auto leading-relaxed" }
                , "Visit a business, scan their QR code, and wait for the owner to approve your loyalty points."
              )
            )
            , React.createElement(Link, { to: "/checkin", className: "border-2 border-[#F97316] hover:bg-[#FFEDD5]/20 text-[#F97316] font-black text-xs px-6 py-2.5 rounded-full flex items-center gap-1.5 transition-all shadow-sm active:scale-95" }
              , React.createElement(QrCode, { className: "h-4 w-4" })
              , "Scan QR Now"
            )
          )
        )
      : (
          /* Populated State (Visits & Points Timeline) */
          React.createElement('div', { className: "space-y-6 relative pl-3" }
            , React.createElement('div', { className: "absolute left-[23px] top-4 bottom-4 w-0.5 border-l-2 border-dashed border-slate-200" })

            , groupedTransactions.map(([dateLabel, txns]) => React.createElement('div', { key: dateLabel, className: "space-y-4" }
                , React.createElement('div', { className: "relative z-10 flex" }
                  , React.createElement('span', { className: "bg-slate-100 text-[#0F172A] text-[10px] font-black uppercase px-2.5 py-1 rounded-full" }, dateLabel)
                )

                , txns.map((tx) => {
                    const styles = getCategoryStyle(tx.business?.category);
                    const CategoryIcon = styles.icon;
                    const isRecent = dateLabel === "Today";

                    return React.createElement('div', { key: tx.id, className: "relative flex items-start gap-4" }
                      , React.createElement('div', { className: "absolute left-[7px] top-[18px] z-10 w-3 h-3 rounded-full border-2 border-white flex items-center justify-center shadow-sm" }
                        , React.createElement('div', { className: cn("w-1.5 h-1.5 rounded-full", isRecent ? "bg-[#F97316]" : "bg-slate-300") })
                      )

                      , React.createElement('div', {
                          onClick: () => setSelectedTx(tx),
                          className: "flex-1 bg-white rounded-3xl border border-slate-100 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center justify-between gap-3 ml-4 cursor-pointer hover:scale-[1.01] transition-all active:scale-[0.99]"
                        }
                          , React.createElement('div', { className: "flex items-center gap-3 min-w-0" }
                            , React.createElement('div', { className: cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0", styles.bg, styles.text) }
                              , React.createElement(CategoryIcon, { className: "h-5 w-5" })
                            )
                            , React.createElement('div', { className: "min-w-0" }
                              , React.createElement('h4', { className: "font-black text-sm text-[#0F172A] truncate" }, tx.business?.name || "Business")
                              , React.createElement('div', { className: "flex items-center gap-1.5 mt-0.5" }
                                , React.createElement('span', { className: "text-[9px] bg-slate-100 text-slate-500 font-extrabold px-1.5 py-0.5 rounded-full" }, tx.business?.category || "Cafe")
                                , React.createElement('span', { className: "text-[9px] text-[#64748B]" }, formatTime(tx.createdAt))
                              )
                            )
                          )
                          , React.createElement('div', { className: "flex items-center gap-2 shrink-0 text-right" }
                            , React.createElement('div', { className: "space-y-0.5" }
                              , React.createElement('p', { className: "font-black text-xs text-[#F97316]" }, `+${tx.extraPoints ?? 0} Points`)
                              , (tx.points - (tx.extraPoints ?? 0)) > 0 && React.createElement('p', { className: "text-[9px] font-bold text-amber-500" }, `+${tx.points - (tx.extraPoints ?? 0)} stamp points`)
                            )
                            , React.createElement(ChevronRight, { className: "h-4 w-4 text-slate-300" })
                          )
                      )
                    );
                  })
              ))
          )
        )



      /* F. Promo callout card */
      , React.createElement('div', { className: "bg-[#FFEDD5]/60 rounded-3xl p-4 flex items-center justify-between gap-4 border border-[#FFEDD5]/20" }
        , React.createElement('div', { className: "flex items-center gap-3" }
          , React.createElement('span', { className: "text-2xl shrink-0" }, "🎁")
          , React.createElement('div', null
            , React.createElement('h4', { className: "font-black text-xs text-[#0F172A]" }, "Keep Exploring & Earning!")
            , React.createElement('p', { className: "text-[9px] text-[#64748B] leading-tight" }, "The more you visit, the more rewards you unlock.")
          )
        )
        , React.createElement(Link, { to: "/dashboard", className: "w-8 h-8 rounded-full bg-[#F97316] text-white flex items-center justify-center shadow-md hover:bg-[#EA580C] transition-transform active:scale-95 shrink-0" }
          , React.createElement(ArrowRight, { className: "h-4 w-4" })
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
      , selectedTx && React.createElement(Dialog, {
          open: !!selectedTx,
          onOpenChange: (open) => { if (!open) setSelectedTx(null); }
        }
          , React.createElement(DialogContent, { className: "bg-white rounded-3xl max-w-sm p-6 space-y-4" }
            , React.createElement(DialogHeader, { className: "space-y-1.5" }
              , React.createElement(DialogTitle, { className: "text-lg font-black text-slate-800" }, selectedTx.business?.name || "Visit Details")
              , React.createElement(DialogDescription, { className: "text-[10px] text-slate-500 font-semibold" }
                , `Logged at: ${new Date(selectedTx.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}`
              )
            )
            , React.createElement('div', { className: "space-y-3 pt-2" }
              , React.createElement('div', { className: "flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100" }
                , React.createElement('span', { className: "text-xs font-extrabold text-[#64748B]" }, "Purchasing Amount")
                , React.createElement('span', { className: "text-sm font-black text-[#0F172A]" }
                  , selectedTx.spendAmount ? `₹${Number(selectedTx.spendAmount)}` : "—"
                )
              )
              , React.createElement('div', { className: "flex justify-between items-center bg-orange-50/40 p-3 rounded-2xl border border-orange-100/50" }
                , React.createElement('span', { className: "text-xs font-extrabold text-[#F97316]" }, "Total Points")
                , React.createElement('span', { className: "text-sm font-black text-[#F97316]" }, `+${selectedTx.points} pts`)
              )
              , React.createElement('div', { className: "flex justify-between items-center bg-purple-50/40 p-3 rounded-2xl border border-purple-100/50" }
                , React.createElement('span', { className: "text-xs font-extrabold text-purple-600" }, "Extra Points")
                , React.createElement('span', { className: "text-sm font-black text-purple-600" }, `+${selectedTx.extraPoints || 0} pts`)
              )
            )
            , React.createElement(Button, {
                onClick: () => setSelectedTx(null),
                className: "w-full bg-[#F97316] text-white font-bold rounded-2xl text-xs py-2.5 h-10 flex items-center justify-center active:scale-95 transition-transform mt-2"
              }
              , "Close"
            )
          )
        )
      , showBreakdownModal && React.createElement(Dialog, {
          open: showBreakdownModal,
          onOpenChange: (open) => !open && setShowBreakdownModal(false)
        }
          , React.createElement(DialogContent, { className: "max-w-[360px] bg-white border border-border p-6 rounded-3xl shadow-xl max-h-[80vh] flex flex-col" }
            , React.createElement(DialogHeader, { className: "flex flex-col items-center shrink-0" }
              , React.createElement('div', { className: "h-12 w-12 rounded-full bg-[#FFEDD5] flex items-center justify-center mb-2 text-[#F97316]" }
                , React.createElement(Store, { className: "h-6 w-6" })
              )
              , React.createElement(DialogTitle, { className: "text-base font-black text-slate-800 text-center" }, "Points Breakdown")
              , React.createElement(DialogDescription, { className: "text-xs text-muted-foreground text-center" }
                , `You have visited ${totalStoresVisited} shop${totalStoresVisited !== 1 ? 's' : ''} overall.`
              )
            )
            , React.createElement('div', { className: "flex-1 overflow-y-auto space-y-3 py-4 scrollbar-none" }
              , pointsByStoreList.length === 0 ? (
                  React.createElement('p', { className: "text-center text-xs text-slate-400 py-6" }, "No store visits logged yet.")
                ) : (
                  pointsByStoreList.map((item, idx) => {
                    const style = getCategoryStyle(item.category);
                    const IconComponent = style.icon;
                    return React.createElement('div', { key: idx, className: "flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl p-3.5" }
                      , React.createElement('div', { className: "flex items-center gap-2.5 min-w-0" }
                        , React.createElement('div', { className: cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", style.bg, style.text) }
                          , React.createElement(IconComponent, { className: "h-4.5 w-4.5" })
                        )
                        , React.createElement('div', { className: "min-w-0" }
                          , React.createElement('h4', { className: "font-black text-xs text-[#0F172A] truncate" }, item.name)
                          , React.createElement('span', { className: "text-[8px] bg-slate-200/60 text-slate-500 font-extrabold px-1.5 py-0.5 rounded-full uppercase" }, item.category)
                        )
                      )
                      , React.createElement('div', { className: "text-right shrink-0" }
                        , React.createElement('p', { className: "text-xs font-black text-[#F97316]" }, `+${item.extraPoints} pts`)
                        , React.createElement('p', { className: "text-[7px] text-[#64748B] font-bold" }, `+${item.points} total`)
                      )
                    );
                  })
                )
            )
            , React.createElement(Button, {
                onClick: () => setShowBreakdownModal(false),
                className: "w-full bg-[#F97316] text-white font-bold rounded-2xl text-xs py-2.5 h-10 flex items-center justify-center active:scale-95 transition-transform mt-2 shrink-0"
              }
              , "Close"
            )
          )
        )
    )
  );
}

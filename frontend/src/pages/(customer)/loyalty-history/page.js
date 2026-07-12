const _jsxFileName = "src\\pages\\(customer)\\loyalty-history\\page.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Award, Star, Loader2, History, Building2, ChevronDown, ChevronRight, 
  QrCode, Hourglass, Gift, Check, ArrowRight, BookOpen, User, ArrowUpRight
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

  const { data, isLoading, error } = useQuery({
    queryKey: ["loyaltyHistory"],
    queryFn: () => api.get("/loyalty-approval/history?limit=100").then(r => r),
    refetchInterval: 60000,
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

  const totalPoints = filteredTransactions.reduce((sum, tx) => sum + tx.points, 0);
  const totalExtraPoints = filteredTransactions.reduce((sum, tx) => sum + (tx.extraPoints || 0), 0);

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
        , React.createElement('div', { className: "bg-[#F97316] text-white rounded-3xl p-4 relative overflow-hidden flex flex-col justify-between h-28 shadow-sm border border-[#F97316]" }
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

                      , React.createElement('div', { className: "flex-1 bg-white rounded-3xl border border-slate-100 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center justify-between gap-3 ml-4" }
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
                              , React.createElement('p', { className: "font-black text-xs text-[#F97316]" }, `+${tx.points} Points`)
                              , tx.extraPoints > 0 && React.createElement('p', { className: "text-[9px] font-bold text-amber-500" }, `+${tx.extraPoints} extra`)
                            )
                            , React.createElement(ChevronRight, { className: "h-4 w-4 text-slate-300" })
                          )
                      )
                    );
                  })
              ))
          )
        )

      /* E. "How It Works" panel */
      , React.createElement('div', { className: "bg-[#F1F5F9] rounded-3xl p-5 space-y-4" }
        , React.createElement('h3', { className: "font-black text-sm text-[#0F172A] tracking-tight" }, "How It Works")
        , React.createElement('div', { className: "flex items-center justify-between gap-1.5" }
          , [
              { num: "1", title: "Scan QR", desc: "Scan the QR code at any business", icon: QrCode },
              { num: "2", title: "Wait Approval", desc: "Business owner approves your visit", icon: Hourglass },
              { num: "3", title: "Earn Points", desc: "Points added to your account", icon: Gift }
            ].map((step, i) => React.createElement(React.Fragment, { key: step.num }
              , React.createElement('div', { className: "flex-1 flex flex-col items-center text-center space-y-1.5 min-w-0" }
                , React.createElement('div', { className: "relative w-10 h-10 rounded-full bg-[#FFEDD5] flex items-center justify-center text-[#F97316] shrink-0 shadow-sm border border-[#FFE4E6]/25" }
                  , React.createElement(step.icon, { className: "h-4.5 w-4.5" })
                  , React.createElement('span', {
                      className: "absolute -top-1.5 -right-1.5 bg-[#F97316] text-white text-[9px] font-black flex items-center justify-center border border-white shadow-sm",
                      style: { borderRadius: "50%", width: "16px", height: "16px", minWidth: "16px", minHeight: "16px", padding: 0 }
                    }, step.num)
                )
                , React.createElement('p', { className: "text-[10px] font-black text-[#0F172A] truncate w-full" }, step.title)
                , React.createElement('p', { className: "text-[8px] text-[#64748B] leading-normal line-clamp-2 w-full" }, step.desc)
              )
              , i < 2 && React.createElement('span', { className: "text-[#94A3B8] text-xs font-bold -translate-y-4" }, "→")
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
    )
  );
}

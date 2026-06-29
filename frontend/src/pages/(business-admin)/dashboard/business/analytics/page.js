const _jsxFileName = "src\\pages\\(business-admin)\\dashboard\\business\\analytics\\page.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip,
  Cell, 
  PieChart, 
  Pie 
} from "recharts";
import { Activity, Coins, TrendingUp, Users, Award, ShoppingBag } from "lucide-react";

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const businessId = _optionalChain([user, 'optionalAccess', _ => _.businessId]);

  // Average bill state in Rupees for estimating profit
  const [avgBill, setAvgBill] = useState(250);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["businessAnalyticsDetails", businessId],
    queryFn: () => api.get(`/analytics/business/${businessId}`).then((res) => res.data),
    enabled: !!businessId && businessId !== "null" && businessId !== "undefined",
  });

  if (isLoading) {
    return (
      React.createElement('div', { className: "space-y-6 animate-pulse" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 49}}
        , React.createElement('div', { className: "h-8 w-48 rounded bg-muted"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 50}} )
        , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-6"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 51}}
          , React.createElement('div', { className: "h-40 rounded-xl bg-muted"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 52}} )
          , React.createElement('div', { className: "h-40 rounded-xl bg-muted"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 53}} )
          , React.createElement('div', { className: "h-40 rounded-xl bg-muted"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 54}} )
        )
        , React.createElement('div', { className: "h-80 w-full rounded-xl bg-muted"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 56}} )
      )
    );
  }

  // 1. Process Monthly Trend Data for Recharts
  const processTrendData = (trend = []) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const counts = {};
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
      counts[label] = 0;
    }

    trend.forEach((item) => {
      const date = new Date(item.createdAt);
      const label = `${months[date.getMonth()]} ${date.getFullYear().toString().slice(2)}`;
      
      // Extract count value safely
      let countVal = 1;
      if (item._count) {
        if (typeof item._count === "number") countVal = item._count;
        else if (typeof item._count === "object") {
          countVal = (item._count ).id || (item._count )._all || 1;
        }
      }

      if (counts[label] !== undefined) {
        counts[label] += countVal;
      }
    });

    return Object.entries(counts).map(([name, checkins]) => ({ name, checkins }));
  };

  const chartData = processTrendData(_optionalChain([analytics, 'optionalAccess', _2 => _2.monthlyTrend]));

  // 2. Process Voucher status for PieChart
  const redeemedCount = _optionalChain([analytics, 'optionalAccess', _3 => _3.totalRewardsRedeemed]) || 0;
  const lockedCount = Math.max(0, (_optionalChain([analytics, 'optionalAccess', _4 => _4.totalRewardsIssued]) || 0) - redeemedCount);
  
  const voucherPieData = [
    { name: "Claimed & Redeemed", value: redeemedCount, color: "#FF6A00" },
    { name: "Unlocked & Unredeemed", value: lockedCount, color: "#FFaa66" }
  ];

  return (
    React.createElement('div', { className: "space-y-6 sm:space-y-8 animate-fade-in p-1 sm:p-2" }
      /* Header */
      , React.createElement('div', null
        , React.createElement('h1', { className: "text-2xl sm:text-3xl font-black text-foreground tracking-tight" }, "Live Business Analytics" )
        , React.createElement('p', { className: "text-xs sm:text-sm text-muted-foreground mt-1" }, "See how your rewards program is driving return visits and growing your sales." )
      )

      /* Interactive Program Value Card (Profit Calculator) */
      , React.createElement(Card, { className: "glass border border-[#FF6A00]/25 bg-gradient-to-tr from-white via-amber-50/10 to-[#FF6A00]/5 overflow-hidden shadow-lg", glass: true }
        , React.createElement(CardContent, { className: "p-6 sm:p-8 space-y-6" }
          , React.createElement('div', { className: "flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4" }
            , React.createElement('div', { className: "space-y-1.5" }
              , React.createElement('h2', { className: "text-lg font-black text-slate-800 flex items-center gap-2" }
                , React.createElement(Coins, { className: "h-5 .5 text-[#FF6A00] shrink-0" })
                , "Business Sales & Profit Estimator"
              )
              , React.createElement('p', { className: "text-xs text-muted-foreground" }
                , "Calculate estimated revenue generated from customer visits and stamp card completions."
              )
            )
            /* Average Bill Selector */
            , React.createElement('div', { className: "flex flex-wrap items-center gap-1.5 bg-slate-100/80 border border-slate-200 rounded-xl p-1.5 shrink-0 self-start lg:self-auto" }
              , React.createElement('span', { className: "text-[10px] font-black text-slate-500 uppercase px-2" }, "Avg Bill:")
              , [150, 250, 500, 1000].map((val) => (
                  React.createElement(Button, {
                    key: val,
                    variant: avgBill === val ? "default" : "ghost",
                    className: `h-8 text-xs px-3 font-bold rounded-lg transition-all ${
                      avgBill === val ? "bg-gradient-to-tr from-[#FF6A00] to-[#800020] hover:opacity-95 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200/50"
                    }`,
                    onClick: () => setAvgBill(val)
                  }
                  , `₹${val}`
                )
              ))
            )
          )

          , React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2" }
            /* Total Sales Driven */
            , React.createElement('div', { className: "bg-gradient-to-br from-emerald-500/10 via-emerald-50/20 to-teal-500/5 border border-emerald-500/25 rounded-2xl p-5 shadow-sm space-y-2 flex flex-col justify-between" }
              , React.createElement('div', { className: "flex justify-between items-center" }
                , React.createElement('span', { className: "text-[9px] font-black text-emerald-700 uppercase tracking-widest block" }, "Estimated Sales")
                , React.createElement('span', { className: "bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider" }, "🚀 Total")
              )
              , React.createElement('span', { className: "text-3xl font-black text-emerald-800 block pt-1" }
                , `₹ ${((analytics?.totalCheckIns || 0) * avgBill).toLocaleString()}`
              )
              , React.createElement('span', { className: "text-[10px] text-emerald-800/80 block leading-snug pt-1" }
                , `Calculated from ${analytics?.totalCheckIns || 0} counter scans.`
              )
            )
            /* Repeat visits sales */
            , React.createElement('div', { className: "bg-gradient-to-br from-amber-500/10 via-amber-50/20 to-orange-500/5 border border-amber-500/25 rounded-2xl p-5 shadow-sm space-y-2 flex flex-col justify-between" }
              , React.createElement('div', { className: "flex justify-between items-center" }
                , React.createElement('span', { className: "text-[9px] font-black text-amber-700 uppercase tracking-widest block" }, "Loyal Repeat Sales")
                , React.createElement('span', { className: "bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider" }, "🔥 Profit")
              )
              , React.createElement('span', { className: "text-3xl font-black text-amber-800 block pt-1" }
                , `₹ ${(Math.max(0, (analytics?.totalCheckIns || 0) - (analytics?.totalCustomers || 0)) * avgBill).toLocaleString()}`
              )
              , React.createElement('span', { className: "text-[10px] text-amber-800/80 block leading-snug pt-1" }
                , "Pure cash flow driven by returning customers."
              )
            )
            /* Customer retention */
            , React.createElement('div', { className: "bg-gradient-to-br from-indigo-500/10 via-indigo-50/20 to-purple-500/5 border border-indigo-500/25 rounded-2xl p-5 shadow-sm space-y-2 flex flex-col justify-between" }
              , React.createElement('div', { className: "flex justify-between items-center" }
                , React.createElement('span', { className: "text-[9px] font-black text-indigo-700 uppercase tracking-widest block" }, "Retention Score")
                , React.createElement('span', { className: "bg-indigo-100 text-indigo-800 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider" }, "💎 Loyalty")
              )
              , React.createElement('span', { className: "text-3xl font-black text-indigo-800 block pt-1" }
                , `${analytics?.repeatRate || 0}%`
              )
              , React.createElement('span', { className: "text-[10px] text-indigo-800/80 block leading-snug pt-1" }
                , "Percentage of customers coming back 2+ times."
              )
            )
          )
        )
      )

      /* Detail Analytics Cards Grid */
      , React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6" }

        /* Card 1: Repeat Rate */
        , React.createElement(Card, { className: "glass", glass: true }
          , React.createElement(CardHeader, { className: "pb-2" }
            , React.createElement(CardTitle, { className: "text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5" }
              , React.createElement(Users, { className: "h-4 w-4 text-primary shrink-0" })
              , "Customer Loyalty"
            )
          )
          , React.createElement(CardContent, { className: "space-y-3" }
            , React.createElement('div', { className: "flex items-baseline space-x-1.5" }
              , React.createElement('span', { className: "text-3xl font-black text-foreground" }, _optionalChain([analytics, 'optionalAccess', _5 => _5.repeatRate]), "%")
              , React.createElement('span', { className: "text-xs text-muted-foreground font-semibold" }, "Return Rate")
            )
            , React.createElement('div', { className: "w-full bg-slate-100 rounded-full h-2 overflow-hidden" }
              , React.createElement('div', { 
                className: "bg-gradient-to-r from-primary to-amber-500 h-full rounded-full"    , 
                style: { width: `${_optionalChain([analytics, 'optionalAccess', _6 => _6.repeatRate])}%` }}
              )
            )
            , React.createElement('p', { className: "text-[10px] text-muted-foreground leading-normal" }
              , "This shows how many customers check in 2 or more times. A higher percentage shows healthier customer retention."
            )
          )
        )

        /* Card 2: Conversion Rate */
        , React.createElement(Card, { className: "glass", glass: true }
          , React.createElement(CardHeader, { className: "pb-2" }
            , React.createElement(CardTitle, { className: "text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5" }
              , React.createElement(Award, { className: "h-4 w-4 text-primary shrink-0" })
              , "Voucher Claim Rate"
            )
          )
          , React.createElement(CardContent, { className: "space-y-3" }
            , React.createElement('div', { className: "flex items-baseline space-x-1.5" }
              , React.createElement('span', { className: "text-3xl font-black text-foreground" }, _optionalChain([analytics, 'optionalAccess', _7 => _7.redemptionRate]), "%")
              , React.createElement('span', { className: "text-xs text-muted-foreground font-semibold" }, "Redeemed")
            )
            , React.createElement('div', { className: "w-full bg-slate-100 rounded-full h-2 overflow-hidden" }
              , React.createElement('div', { 
                className: "bg-primary h-full rounded-full"  , 
                style: { width: `${_optionalChain([analytics, 'optionalAccess', _8 => _8.redemptionRate])}%` }}
              )
            )
            , React.createElement('p', { className: "text-[10px] text-muted-foreground leading-normal" }
              , "Tracks how many customers complete their stamp cards and successfully claim their rewards at your billing counter."
            )
          )
        )

        /* Card 3: Registered customers */
        , React.createElement(Card, { className: "glass", glass: true }
          , React.createElement(CardHeader, { className: "pb-2" }
            , React.createElement(CardTitle, { className: "text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5" }
              , React.createElement(ShoppingBag, { className: "h-4 w-4 text-primary shrink-0" })
              , "Registered Customers"
            )
          )
          , React.createElement(CardContent, { className: "space-y-3" }
            , React.createElement('div', { className: "flex items-baseline space-x-1.5" }
              , React.createElement('span', { className: "text-3xl font-black text-foreground" }, _optionalChain([analytics, 'optionalAccess', _5 => _5.totalCustomers]))
              , React.createElement('span', { className: "text-xs text-muted-foreground font-semibold" }, "Total Members")
            )
            , React.createElement('div', { className: "pt-2 border-t border-slate-100 flex justify-between text-[11px]" }
              , React.createElement('span', { className: "text-muted-foreground" }, "Active Promos:")
              , React.createElement('span', { className: "font-bold text-foreground" }, _optionalChain([analytics, 'optionalAccess', _12 => _12.activeCoupons]) || 0, " coupons")
            )
            , React.createElement('p', { className: "text-[10px] text-muted-foreground leading-normal" }
              , "This is the total number of unique customers who have scanned your QR code and joined your digital club."
            )
          )
        )
      )

      /* Store Visits Tracker (Today, This Week, This Month) */
      , React.createElement(Card, { className: "glass", glass: true }
        , React.createElement(CardHeader, { className: "pb-2" }
          , React.createElement(CardTitle, { className: "text-xs font-black uppercase tracking-wider text-muted-foreground" }, "Recent Store Scans Tracker")
          , React.createElement(CardDescription, { className: "text-xs" }, "Real-time count of customer check-in scans completed at your storefront counter.")
        )
        , React.createElement(CardContent, { className: "grid grid-cols-3 gap-2.5 text-center pt-2" }
          , React.createElement('div', { className: "bg-slate-50/60 p-3 rounded-xl border border-border/50" }
            , React.createElement('span', { className: "text-muted-foreground block text-[9px] uppercase tracking-wider font-bold" }, "Today")
            , React.createElement('span', { className: "text-xl sm:text-2xl font-black text-foreground block pt-1" }, _optionalChain([analytics, 'optionalAccess', _9 => _9.checkInsToday]))
          )
          , React.createElement('div', { className: "bg-slate-50/60 p-3 rounded-xl border border-border/50" }
            , React.createElement('span', { className: "text-muted-foreground block text-[9px] uppercase tracking-wider font-bold" }, "Last 7 Days" )
            , React.createElement('span', { className: "text-xl sm:text-2xl font-black text-foreground block pt-1" }, _optionalChain([analytics, 'optionalAccess', _10 => _10.checkInsThisWeek]))
          )
          , React.createElement('div', { className: "bg-slate-50/60 p-3 rounded-xl border border-border/50" }
            , React.createElement('span', { className: "text-muted-foreground block text-[9px] uppercase tracking-wider font-bold" }, "Last 30 Days" )
            , React.createElement('span', { className: "text-xl sm:text-2xl font-black text-foreground block pt-1" }, _optionalChain([analytics, 'optionalAccess', _11 => _11.checkInsThisMonth]))
          )
        )
      )

      /* Charts Panels */
      , React.createElement('div', { className: "grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6" }

        /* Main Check-in Area Chart */
        , React.createElement(Card, { className: "lg:col-span-2 glass", glass: true }
          , React.createElement(CardHeader, { className: "pb-2" }
            , React.createElement(CardTitle, { className: "text-sm sm:text-base flex items-center gap-2" }
              , React.createElement(Activity, { className: "h-4.5 w-4.5 text-primary shrink-0" }), "Store Customer Visits Trend"
            )
            , React.createElement(CardDescription, { className: "text-xs" }, "Number of scans completed at your storefront month-by-month." )
          )
          , React.createElement(CardContent, { className: "h-56 sm:h-64 pt-2" }
            , React.createElement(ResponsiveContainer, { width: "100%", height: "100%" }
              , React.createElement(AreaChart, { data: chartData, margin: { top: 10, right: 10, left: -25, bottom: 0 } }
                , React.createElement('defs', null
                  , React.createElement('linearGradient', { id: "colorCheckins", x1: "0", y1: "0", x2: "0", y2: "1" }
                    , React.createElement('stop', { offset: "5%", stopColor: "#FF6A00", stopOpacity: 0.15 })
                    , React.createElement('stop', { offset: "95%", stopColor: "#FF6A00", stopOpacity: 0 })
                  )
                )
                , React.createElement(XAxis, { dataKey: "name", stroke: "#94a3b8", fontSize: 9, tickLine: false })
                , React.createElement(YAxis, { stroke: "#94a3b8", fontSize: 9, tickLine: false })
                , React.createElement(Tooltip, { 
                  contentStyle: { backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: 12, fontSize: 11 },
                  labelClassName: "text-foreground font-bold"
                })
                , React.createElement(Area, { type: "monotone", dataKey: "checkins", stroke: "#FF6A00", strokeWidth: 2, fillOpacity: 1, fill: "url(#colorCheckins)", name: "Visits" })
              )
            )
          )
        )

        /* Voucher Conversion Pie Chart */
        , React.createElement(Card, { className: "glass", glass: true }
          , React.createElement(CardHeader, { className: "pb-2" }
            , React.createElement(CardTitle, { className: "text-sm sm:text-base" }, "Voucher Rewards Status" )
            , React.createElement(CardDescription, { className: "text-xs" }, "Breakdown of completed stamp cards vs redeemed gifts." )
          )
          , React.createElement(CardContent, { className: "h-56 sm:h-64 pt-2 flex flex-col justify-between items-center" }
            , redeemedCount === 0 && lockedCount === 0 ? (
              React.createElement('div', { className: "flex-1 flex flex-col items-center justify-center text-muted-foreground text-xs text-center p-4" }
                , "No coupons or stamp cards completed by customers yet."
              )
            ) : (
              React.createElement(React.Fragment, null
                , React.createElement('div', { className: "w-full h-36 sm:h-40" }
                  , React.createElement(ResponsiveContainer, { width: "100%", height: "100%" }
                    , React.createElement(PieChart, null
                      , React.createElement(Pie, {
                        data: voucherPieData,
                        cx: "50%",
                        cy: "50%",
                        innerRadius: 45,
                        outerRadius: 60,
                        paddingAngle: 3,
                        dataKey: "value"
                      }
                        , voucherPieData.map((entry, index) => (
                          React.createElement(Cell, { key: `cell-${index}`, fill: entry.color } )
                        ))
                      )
                      , React.createElement(Tooltip, { 
                        contentStyle: { backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: 12, fontSize: 11 }
                      })
                    )
                  )
                )
                /* Custom Legend */
                , React.createElement('div', { className: "w-full space-y-1.5 text-[10px] text-muted-foreground px-1 pb-2" }
                  , voucherPieData.map((item, i) => (
                    React.createElement('div', { key: i, className: "flex justify-between items-center" }
                      , React.createElement('span', { className: "flex items-center gap-1.5 font-medium" }
                        , React.createElement('span', { className: "h-2 w-2 rounded-full", style: { backgroundColor: item.color } } )
                        , item.name
                      )
                      , React.createElement('span', { className: "font-mono text-foreground font-semibold" }, item.value, " rewards" )
                    )
                  ))
                )
              )
            )
          )
        )
      )
    )
  );
}

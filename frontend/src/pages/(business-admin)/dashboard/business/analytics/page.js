const _jsxFileName = "src\\pages\\(business-admin)\\dashboard\\business\\analytics\\page.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Activity } from "lucide-react";















export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const businessId = _optionalChain([user, 'optionalAccess', _ => _.businessId]);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["businessAnalyticsDetails", businessId],
    queryFn: () => api.get(`/analytics/business/${businessId}`).then((res) => res.data),
    enabled: !!businessId,
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
    { name: "Unlocked & Unredeemed", value: lockedCount, color: "#FF5E00" }
  ];

  return (
    React.createElement('div', { className: "space-y-8 animate-fade-in" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 107}}
      /* Header */
      , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 109}}
        , React.createElement('h1', { className: "text-3xl font-extrabold text-foreground tracking-tight"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 110}}, "Analytics Ledger" )
        , React.createElement('p', { className: "text-xs text-muted-foreground mt-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 111}}, "Perform audit reviews on repeat customer frequencies and voucher conversion pipelines"

        )
      )

      /* Detail Analytics Cards Grid */
      , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-6"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 117}}

        /* Card 1: Repeat Rate */
        , React.createElement(Card, { className: "glass", glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 120}}
          , React.createElement(CardHeader, { className: "pb-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 121}}
            , React.createElement(CardDescription, { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 122}}, "Customer Retention Rate"

            )
          )
          , React.createElement(CardContent, { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 126}}
            , React.createElement('div', { className: "flex items-baseline space-x-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 127}}
              , React.createElement('span', { className: "text-4xl font-extrabold text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 128}}, _optionalChain([analytics, 'optionalAccess', _5 => _5.repeatRate]), "%")
              , React.createElement('span', { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 129}}, "repeat visitors" )
            )
            , React.createElement('div', { className: "w-full bg-slate-100 rounded-full h-2.5 overflow-hidden"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 131}}
              , React.createElement('div', { 
                className: "bg-gradient-to-r from-primary to-indigo-400 h-full rounded-full"    , 
                style: { width: `${_optionalChain([analytics, 'optionalAccess', _6 => _6.repeatRate])}%` }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 132}}
              )
            )
            , React.createElement('p', { className: "text-[10px] text-muted-foreground leading-normal"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 137}}, "Retention rate measures the percentage of your registered customer pool that have checked in at least 2 times. Higher rate reflects strong loyalty."

            )
          )
        )

        /* Card 2: Conversion Rate */
        , React.createElement(Card, { className: "glass", glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 144}}
          , React.createElement(CardHeader, { className: "pb-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 145}}
            , React.createElement(CardDescription, { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 146}}, "Voucher Redemption conversion"

            )
          )
          , React.createElement(CardContent, { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 150}}
            , React.createElement('div', { className: "flex items-baseline space-x-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 151}}
              , React.createElement('span', { className: "text-4xl font-extrabold text-primary"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 152}}, _optionalChain([analytics, 'optionalAccess', _7 => _7.redemptionRate]), "%")
              , React.createElement('span', { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 153}}, "claimed")
            )
            , React.createElement('div', { className: "w-full bg-slate-100 rounded-full h-2.5 overflow-hidden"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 155}}
              , React.createElement('div', { 
                className: "bg-primary h-full rounded-full"  , 
                style: { width: `${_optionalChain([analytics, 'optionalAccess', _8 => _8.redemptionRate])}%` }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 156}}
              )
            )
            , React.createElement('p', { className: "text-[10px] text-muted-foreground leading-normal"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 161}}, "Redemption conversion tracks the ratio of earned customer rewards that cashiers successfully process and redeem at checkout counters."

            )
          )
        )

        /* Card 3: Check-in Activity Overview */
        , React.createElement(Card, { className: "glass", glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 168}}
          , React.createElement(CardHeader, { className: "pb-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 169}}
            , React.createElement(CardDescription, { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 170}}, "Check-in Windows"

            )
          )
          , React.createElement(CardContent, { className: "grid grid-cols-3 gap-2 text-center pt-2"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 174}}
            , React.createElement('div', { className: "bg-slate-50/60 p-2.5 rounded-lg border border-border/50"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 175}}
              , React.createElement('span', { className: "text-muted-foreground block text-[9px] uppercase tracking-wider"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 176}}, "Today")
              , React.createElement('span', { className: "text-lg font-bold text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 177}}, _optionalChain([analytics, 'optionalAccess', _9 => _9.checkInsToday]))
            )
            , React.createElement('div', { className: "bg-slate-50/60 p-2.5 rounded-lg border border-border/50"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 179}}
              , React.createElement('span', { className: "text-muted-foreground block text-[9px] uppercase tracking-wider"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 180}}, "This Week" )
              , React.createElement('span', { className: "text-lg font-bold text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 181}}, _optionalChain([analytics, 'optionalAccess', _10 => _10.checkInsThisWeek]))
            )
            , React.createElement('div', { className: "bg-slate-50/60 p-2.5 rounded-lg border border-border/50"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 183}}
              , React.createElement('span', { className: "text-muted-foreground block text-[9px] uppercase tracking-wider"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 184}}, "This Month" )
              , React.createElement('span', { className: "text-lg font-bold text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 185}}, _optionalChain([analytics, 'optionalAccess', _11 => _11.checkInsThisMonth]))
            )
          )
        )
      )

      /* Charts Panels */
      , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-6"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 192}}

        /* Main Check-in Area Chart */
        , React.createElement(Card, { className: "md:col-span-2 glass" , glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 195}}
          , React.createElement(CardHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 196}}
            , React.createElement(CardTitle, { className: "text-base flex items-center gap-2"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 197}}
              , React.createElement(Activity, { className: "h-4.5 w-4.5 text-primary"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 198}} ), " Store Check-in Volume Trend"
            )
            , React.createElement(CardDescription, { className: "text-xs", __self: this, __source: {fileName: _jsxFileName, lineNumber: 200}}, "Verified GPS scans aggregated over the past 6 months"

            )
          )
          , React.createElement(CardContent, { className: "h-64 pt-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 204}}
            , React.createElement(ResponsiveContainer, { width: "100%", height: "100%", __self: this, __source: {fileName: _jsxFileName, lineNumber: 205}}
              , React.createElement(AreaChart, { data: chartData, margin: { top: 10, right: 10, left: -20, bottom: 0 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 206}}
                , React.createElement('defs', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 207}}
                  , React.createElement('linearGradient', { id: "colorCheckins", x1: "0", y1: "0", x2: "0", y2: "1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 208}}
                    , React.createElement('stop', { offset: "5%", stopColor: "#FF6A00", stopOpacity: 0.2, __self: this, __source: {fileName: _jsxFileName, lineNumber: 209}})
                    , React.createElement('stop', { offset: "95%", stopColor: "#FF6A00", stopOpacity: 0, __self: this, __source: {fileName: _jsxFileName, lineNumber: 210}})
                  )
                )
                , React.createElement(XAxis, { dataKey: "name", stroke: "#FF5E00", fontSize: 10, tickLine: false, __self: this, __source: {fileName: _jsxFileName, lineNumber: 213}} )
                , React.createElement(YAxis, { stroke: "#FF5E00", fontSize: 10, tickLine: false, __self: this, __source: {fileName: _jsxFileName, lineNumber: 214}} )
                , React.createElement(Tooltip, { 
                  contentStyle: { backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: 8, fontSize: 11 },
                  labelClassName: "text-foreground font-bold" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 215}}
                )
                , React.createElement(Area, { type: "monotone", dataKey: "checkins", stroke: "#FF6A00", strokeWidth: 2.5, fillOpacity: 1, fill: "url(#colorCheckins)", name: "Check-ins", __self: this, __source: {fileName: _jsxFileName, lineNumber: 219}} )
              )
            )
          )
        )

        /* Voucher Conversion Pie Chart */
        , React.createElement(Card, { className: "glass", glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 226}}
          , React.createElement(CardHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 227}}
            , React.createElement(CardTitle, { className: "text-base", __self: this, __source: {fileName: _jsxFileName, lineNumber: 228}}, "Voucher Redemption Split"  )
            , React.createElement(CardDescription, { className: "text-xs", __self: this, __source: {fileName: _jsxFileName, lineNumber: 229}}, "Review unlocked vs redeemed vouchers"

            )
          )
          , React.createElement(CardContent, { className: "h-64 pt-2 flex flex-col justify-between items-center"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 233}}
            , redeemedCount === 0 && lockedCount === 0 ? (
              React.createElement('div', { className: "flex-1 flex flex-col items-center justify-center text-muted-foreground text-xs"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 235}}, "No vouchers issued yet."

              )
            ) : (
              React.createElement(React.Fragment, null
                , React.createElement('div', { className: "w-full h-44" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 240}}
                  , React.createElement(ResponsiveContainer, { width: "100%", height: "100%", __self: this, __source: {fileName: _jsxFileName, lineNumber: 241}}
                    , React.createElement(PieChart, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 242}}
                      , React.createElement(Pie, {
                        data: voucherPieData,
                        cx: "50%",
                        cy: "50%",
                        innerRadius: 55,
                        outerRadius: 70,
                        paddingAngle: 3,
                        dataKey: "value", __self: this, __source: {fileName: _jsxFileName, lineNumber: 243}}

                        , voucherPieData.map((entry, index) => (
                          React.createElement(Cell, { key: `cell-${index}`, fill: entry.color, __self: this, __source: {fileName: _jsxFileName, lineNumber: 253}} )
                        ))
                      )
                      , React.createElement(Tooltip, { 
                        contentStyle: { backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: 8, fontSize: 11 }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 256}}
                      )
                    )
                  )
                )
                /* Custom Legend */
                , React.createElement('div', { className: "w-full space-y-2 text-[10px] text-muted-foreground px-2"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 263}}
                  , voucherPieData.map((item, i) => (
                    React.createElement('div', { key: i, className: "flex justify-between items-center"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 265}}
                      , React.createElement('span', { className: "flex items-center gap-1.5 font-medium"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 266}}
                        , React.createElement('span', { className: "h-2 w-2 rounded-full"  , style: { backgroundColor: item.color }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 267}} )
                        , item.name
                      )
                      , React.createElement('span', { className: "font-mono text-foreground font-semibold"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 270}}, item.value, " vouchers" )
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

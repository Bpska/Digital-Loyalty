import { Link } from "react-router-dom";
const _jsxFileName = "src\\pages\\(business-admin)\\dashboard\\business\\page.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  MapPin,
 
  Zap,
 
  RefreshCcw, 
  UserCheck, 
  Gift,
 
  TrendingUp, 
  Calendar, 
  AlertCircle 
} from "lucide-react";
import { formatDate } from "@/lib/utils";













































export default function BusinessDashboard() {
  const { user } = useAuthStore();
  const businessId = _optionalChain([user, 'optionalAccess', _ => _.businessId]);

  // 1. Fetch business details
  const { data: business, isLoading: bizLoading } = useQuery({
    queryKey: ["businessProfile", businessId],
    queryFn: () => api.get(`/businesses/${businessId}`).then((res) => res.data),
    enabled: !!businessId,
  });

  // 2. Fetch business analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["businessAnalytics", businessId],
    queryFn: () => api.get(`/analytics/business/${businessId}`).then((res) => res.data),
    enabled: !!businessId,
  });

  // 3. Fetch recent check-ins
  const { data: checkinsData, isLoading: checkinsLoading, refetch: refetchCheckins } = useQuery({
    queryKey: ["businessCheckins", businessId],
    queryFn: () => api.get(`/checkins/business/${businessId}?limit=5`).then((res) => res.data),
    enabled: !!businessId,
  });

  const checkins = checkinsData || [];

  const loading = bizLoading || analyticsLoading || checkinsLoading;

  if (loading) {
    return (
      React.createElement('div', { className: "space-y-6 animate-pulse" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 100}}
        , React.createElement('div', { className: "h-8 w-48 rounded bg-slate-100"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 101}} )
        , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-4 gap-6"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 102}}
          , React.createElement('div', { className: "h-28 rounded-xl bg-slate-100"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 103}} )
          , React.createElement('div', { className: "h-28 rounded-xl bg-slate-100"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 104}} )
          , React.createElement('div', { className: "h-28 rounded-xl bg-slate-100"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 105}} )
          , React.createElement('div', { className: "h-28 rounded-xl bg-slate-100"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 106}} )
        )
        , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-6"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 108}}
          , React.createElement('div', { className: "h-80 md:col-span-2 rounded-xl bg-slate-100"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 109}} )
          , React.createElement('div', { className: "h-80 rounded-xl bg-slate-100"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 110}} )
        )
      )
    );
  }

  const limitProgress = (current, max) => {
    return Math.round((current / max) * 100);
  };

  return (
    React.createElement('div', { className: "space-y-8", __self: this, __source: {fileName: _jsxFileName, lineNumber: 121}}
      /* Title Header */
      , React.createElement('div', { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 123}}
        , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 124}}
          , React.createElement('h1', { className: "text-3xl font-extrabold text-foreground tracking-tight"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 125}}, "Dashboard"

          )
          , React.createElement('p', { className: "text-xs text-muted-foreground mt-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 128}}, "Real-time analytics and activity logs for "
                  , _optionalChain([business, 'optionalAccess', _2 => _2.name])
          )
        )
        , React.createElement('div', { className: "flex gap-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 132}}
          , React.createElement(Button, { variant: "outline", size: "sm", onClick: () => refetchCheckins(), __self: this, __source: {fileName: _jsxFileName, lineNumber: 133}}
            , React.createElement(RefreshCcw, { className: "mr-2 h-4 w-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 134}} ), " Sync Logs"
          )
          , React.createElement(Link, { to: "/dashboard/business/branches", __self: this, __source: {fileName: _jsxFileName, lineNumber: 136}}
            , React.createElement(Button, { size: "sm", className: "bg-primary hover:bg-primary/90 text-primary-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 137}}
              , React.createElement(MapPin, { className: "mr-2 h-4 w-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 138}} ), " Manage Outlets"
            )
          )
        )
      )

      /* Main KPI Stats Grid */
      , React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 145}}
        , React.createElement(Card, { className: "glass", glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 146}}
          , React.createElement(CardHeader, { className: "flex flex-row items-center justify-between pb-2"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 147}}
            , React.createElement(CardDescription, { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 148}}, "Total Customers"

            )
            , React.createElement(Users, { className: "h-5 w-5 text-primary"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 151}} )
          )
          , React.createElement(CardContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 153}}
            , React.createElement('span', { className: "text-3xl font-extrabold text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 154}}, _optionalChain([analytics, 'optionalAccess', _3 => _3.totalCustomers]))
            , React.createElement('p', { className: "text-[10px] text-muted-foreground mt-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 155}}, "Unique visitor registry count"   )
          )
        )

        , React.createElement(Card, { className: "glass", glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 159}}
          , React.createElement(CardHeader, { className: "flex flex-row items-center justify-between pb-2"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 160}}
            , React.createElement(CardDescription, { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 161}}, "Verified Check-Ins"

            )
            , React.createElement(UserCheck, { className: "h-5 w-5 text-emerald-600"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 164}} )
          )
          , React.createElement(CardContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 166}}
            , React.createElement('span', { className: "text-3xl font-extrabold text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 167}}, _optionalChain([analytics, 'optionalAccess', _4 => _4.totalCheckIns]))
            , React.createElement('p', { className: "text-[10px] text-emerald-600 flex items-center gap-1 mt-1 font-semibold"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 168}}
              , React.createElement(TrendingUp, { className: "h-3 w-3" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 169}} ), " +" , _optionalChain([analytics, 'optionalAccess', _5 => _5.checkInsToday]), " check-ins today"
            )
          )
        )

        , React.createElement(Card, { className: "glass", glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 174}}
          , React.createElement(CardHeader, { className: "flex flex-row items-center justify-between pb-2"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 175}}
            , React.createElement(CardDescription, { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 176}}, "Repeat Rate"

            )
            , React.createElement(Zap, { className: "h-5 w-5 text-indigo-600"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 179}} )
          )
          , React.createElement(CardContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 181}}
            , React.createElement('span', { className: "text-3xl font-extrabold text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 182}}, _optionalChain([analytics, 'optionalAccess', _6 => _6.repeatRate]), "%")
            , React.createElement('p', { className: "text-[10px] text-muted-foreground mt-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 183}}, "Customers with >1 visit profile"    )
          )
        )

        , React.createElement(Card, { className: "glass", glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 187}}
          , React.createElement(CardHeader, { className: "flex flex-row items-center justify-between pb-2"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 188}}
            , React.createElement(CardDescription, { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 189}}, "Reward Conversions"

            )
            , React.createElement(Gift, { className: "h-5 w-5 text-primary"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 192}} )
          )
          , React.createElement(CardContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 194}}
            , React.createElement('span', { className: "text-3xl font-extrabold text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 195}}, _optionalChain([analytics, 'optionalAccess', _7 => _7.redemptionRate]), "%")
            , React.createElement('p', { className: "text-[10px] text-muted-foreground mt-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 196}}
              , _optionalChain([analytics, 'optionalAccess', _8 => _8.totalRewardsRedeemed]), " of "  , _optionalChain([analytics, 'optionalAccess', _9 => _9.totalRewardsIssued]), " redeemed"
            )
          )
        )
      )

      /* Main Panels Section */
      , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-6"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 204}}

        /* Left Panel: Recent Activity */
        , React.createElement(Card, { className: "md:col-span-2 flex flex-col glass"   , glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 207}}
          , React.createElement(CardHeader, { className: "p-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 208}}
            , React.createElement(CardTitle, { className: "text-base font-bold text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 209}}, "Recent Check-In Activity"  )
            , React.createElement(CardDescription, { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 210}}, "Latest location-verified customer check-ins"

            )
          )
          , React.createElement(CardContent, { className: "p-6 pt-0 flex-1 overflow-x-auto"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 214}}
            , checkins.length === 0 ? (
              React.createElement('div', { className: "h-full flex flex-col items-center justify-center py-12 text-center text-muted-foreground text-sm"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 216}}
                , React.createElement(Calendar, { className: "h-8 w-8 mb-2 text-muted-foreground/60"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 217}} ), "No check-in logs recorded yet today."

              )
            ) : (
              React.createElement('table', { className: "w-full text-left border-collapse text-xs"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 221}}
                , React.createElement('thead', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 222}}
                  , React.createElement('tr', { className: "border-b border-border text-muted-foreground font-bold"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 223}}
                    , React.createElement('th', { className: "pb-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 224}}, "Customer")
                    , React.createElement('th', { className: "pb-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 225}}, "Outlet")
                    , React.createElement('th', { className: "pb-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 226}}, "Timestamp")
                    , React.createElement('th', { className: "pb-3 text-right" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 227}}, "Status")
                  )
                )
                , React.createElement('tbody', { className: "divide-y divide-border" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 230}}
                  , checkins.map((log) => (
                    React.createElement('tr', { key: log.id, className: "hover:bg-slate-50/50 transition-colors" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 232}}
                      , React.createElement('td', { className: "py-3 font-semibold text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 233}}
                        , log.customer.name
                        , React.createElement('span', { className: "block text-[10px] font-normal text-muted-foreground font-mono mt-0.5"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 235}}, log.customer.phone)
                      )
                      , React.createElement('td', { className: "py-3 text-slate-700 font-medium"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 237}}, log.branch.name)
                      , React.createElement('td', { className: "py-3 text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 238}}, formatDate(log.createdAt))
                      , React.createElement('td', { className: "py-3 text-right" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 239}}
                        , React.createElement('span', { className: `text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          log.status === "VALID" 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                            : "bg-amber-50 text-amber-700 border-amber-100"
                        }`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 240}}
                          , log.status
                        )
                      )
                    )
                  ))
                )
              )
            )
          )
        )

        /* Right Panel: Subscription & Limits */
        , React.createElement(Card, { className: "glass", glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 257}}
          , React.createElement(CardHeader, { className: "p-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 258}}
            , React.createElement(CardTitle, { className: "text-base font-bold text-foreground flex items-center gap-2"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 259}}
              , React.createElement(Zap, { className: "h-4.5 w-4.5 text-primary"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 260}} ), " Current Plan Usage"
            )
            , React.createElement(CardDescription, { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 262}}, "Track subscription capacity limits"

            )
          )
          , React.createElement(CardContent, { className: "p-6 pt-0 space-y-6"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 266}}
            /* Plan Badge Info */
            , React.createElement('div', { className: "rounded-xl bg-slate-50 p-4 border border-border flex items-center justify-between"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 268}}
              , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 269}}
                , React.createElement('span', { className: "text-[10px] text-muted-foreground font-bold uppercase tracking-wider block"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 270}}, "Active Plan" )
                , React.createElement('span', { className: "text-base font-extrabold text-foreground uppercase tracking-wider"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 271}}, _optionalChain([business, 'optionalAccess', _10 => _10.plan, 'optionalAccess', _11 => _11.name]) || "No Plan")
              )
              , React.createElement('span', { className: "text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 273}}, "₹"
                , parseInt(_optionalChain([business, 'optionalAccess', _12 => _12.plan, 'optionalAccess', _13 => _13.priceMonthly]) || "0").toLocaleString("en-IN"), "/mo"
              )
            )

            /* Utilization bar 1: Branches */
            , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 279}}
              , React.createElement('div', { className: "flex justify-between text-xs font-semibold"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 280}}
                , React.createElement('span', { className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 281}}, "Branches Installed" )
                , React.createElement('span', { className: "text-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 282}}, _optionalChain([business, 'optionalAccess', _14 => _14._count, 'access', _15 => _15.branches]), " / "  , _optionalChain([business, 'optionalAccess', _16 => _16.plan, 'optionalAccess', _17 => _17.maxBranches]) || 0)
              )
              , React.createElement('div', { className: "w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-border"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 284}}
                , React.createElement('div', { 
                  className: "bg-primary h-full rounded-full transition-all duration-500"    , 
                  style: { width: `${limitProgress(_optionalChain([business, 'optionalAccess', _18 => _18._count, 'access', _19 => _19.branches]) || 0, _optionalChain([business, 'optionalAccess', _20 => _20.plan, 'optionalAccess', _21 => _21.maxBranches]) || 1)}%` }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 285}}
                )
              )
            )

            /* Utilization bar 2: Customers */
            , React.createElement('div', { className: "space-y-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 293}}
              , React.createElement('div', { className: "flex justify-between text-xs font-semibold"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 294}}
                , React.createElement('span', { className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 295}}, "Enrolled Customers" )
                , React.createElement('span', { className: "text-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 296}}, _optionalChain([analytics, 'optionalAccess', _22 => _22.totalCustomers]), " / "  , _optionalChain([business, 'optionalAccess', _23 => _23.plan, 'optionalAccess', _24 => _24.maxCustomers]) || 0)
              )
              , React.createElement('div', { className: "w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-border"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 298}}
                , React.createElement('div', { 
                  className: "bg-primary h-full rounded-full transition-all duration-500"    , 
                  style: { width: `${limitProgress(_optionalChain([analytics, 'optionalAccess', _25 => _25.totalCustomers]) || 0, _optionalChain([business, 'optionalAccess', _26 => _26.plan, 'optionalAccess', _27 => _27.maxCustomers]) || 1)}%` }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 299}}
                )
              )
            )

            /* Subscription Expiry Alert */
            , React.createElement('div', { className: "rounded-lg bg-slate-50 p-3.5 border border-border flex gap-3 text-xs text-muted-foreground"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 307}}
              , React.createElement(AlertCircle, { className: "h-5 w-5 text-primary shrink-0 mt-0.5"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 308}} )
              , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 309}}
                , React.createElement('span', { className: "font-semibold text-foreground block mb-0.5"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 310}}, "Subscription Status" )
                , _optionalChain([business, 'optionalAccess', _28 => _28.subscription]) ? (
                  React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 312}}, "Your subscription is currently "
                        , React.createElement('strong', { className: "text-emerald-600 uppercase" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 313}}, business.subscription.status), ". Next billing date is "
                        , business.subscription.currentPeriodEnd ? formatDate(business.subscription.currentPeriodEnd) : "N/A", "."
                  )
                ) : (
                  React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 317}}, "No active Razorpay subscription. Plan is running on trial limits."         )
                )
              )
            )
          )
        )
      )
    )
  );
}

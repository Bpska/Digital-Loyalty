import { Link } from "react-router-dom";
const _jsxFileName = "src\\pages\\(super-admin)\\dashboard\\super\\page.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  UserCheck, 
  Award, 
  CreditCard, 
  ShieldAlert,
 
  ArrowRight 
} from "lucide-react";











export default function SuperDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["superDashboardStats"],
    queryFn: () => api.get("/admin/dashboard").then((res) => res.data),
  });

  if (isLoading) {
    return (
      React.createElement('div', { className: "space-y-6 animate-pulse" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 37}}
        , React.createElement('div', { className: "h-8 w-48 rounded bg-muted"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 38}} )
        , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-6"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 39}}
          , React.createElement('div', { className: "h-28 rounded-xl bg-muted"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 40}} )
          , React.createElement('div', { className: "h-28 rounded-xl bg-muted"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 41}} )
          , React.createElement('div', { className: "h-28 rounded-xl bg-muted"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 42}} )
        )
        , React.createElement('div', { className: "h-64 w-full rounded-xl bg-muted mt-6"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 44}} )
      )
    );
  }

  return (
    React.createElement('div', { className: "space-y-8 animate-fade-in" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 50}}
      /* Title Header */
      , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 52}}
        , React.createElement('h1', { className: "text-3xl font-extrabold text-foreground tracking-tight"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 53}}, "Super Admin Dashboard"  )
        , React.createElement('p', { className: "text-xs text-muted-foreground mt-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 54}}, "Monitor platform tenancy, tenant subscriptions, check-in activity and system security logs"

        )
      )

      /* KPI Stats Grid */
      , React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 60}}

        /* Total Tenancies */
        , React.createElement(Card, { className: "glass", glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 63}}
          , React.createElement(CardHeader, { className: "flex flex-row items-center justify-between pb-2"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 64}}
            , React.createElement(CardDescription, { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 65}}, "Total Tenancies"

            )
            , React.createElement(Building2, { className: "h-5 w-5 text-indigo-600"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 68}} )
          )
          , React.createElement(CardContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 70}}
            , React.createElement('span', { className: "text-3xl font-extrabold text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 71}}, _optionalChain([stats, 'optionalAccess', _ => _.totalBusinesses]))
            , React.createElement('p', { className: "text-[10px] text-muted-foreground mt-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 72}}
              , _optionalChain([stats, 'optionalAccess', _2 => _2.activeBusinesses]), " active storefronts currently"
            )
          )
        )

        /* Total Registered Customers */
        , React.createElement(Card, { className: "glass", glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 79}}
          , React.createElement(CardHeader, { className: "flex flex-row items-center justify-between pb-2"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 80}}
            , React.createElement(CardDescription, { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 81}}, "Platform Customers"

            )
            , React.createElement(Users, { className: "h-5 w-5 text-purple-600"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 84}} )
          )
          , React.createElement(CardContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 86}}
            , React.createElement('span', { className: "text-3xl font-extrabold text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 87}}, _optionalChain([stats, 'optionalAccess', _3 => _3.totalCustomers]))
            , React.createElement('p', { className: "text-[10px] text-muted-foreground mt-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 88}}, "Registered OTP consumer accounts"   )
          )
        )

        /* Platform Check-ins */
        , React.createElement(Card, { className: "glass", glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 93}}
          , React.createElement(CardHeader, { className: "flex flex-row items-center justify-between pb-2"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 94}}
            , React.createElement(CardDescription, { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 95}}, "Platform Check-ins"

            )
            , React.createElement(UserCheck, { className: "h-5 w-5 text-emerald-600"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 98}} )
          )
          , React.createElement(CardContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 100}}
            , React.createElement('span', { className: "text-3xl font-extrabold text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 101}}, _optionalChain([stats, 'optionalAccess', _4 => _4.totalCheckIns]))
            , React.createElement('p', { className: "text-[10px] text-muted-foreground mt-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 102}}, "Lifetime verified GPS check-in logs"    )
          )
        )

        /* Platform Redemptions */
        , React.createElement(Card, { className: "glass", glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 107}}
          , React.createElement(CardHeader, { className: "flex flex-row items-center justify-between pb-2"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 108}}
            , React.createElement(CardDescription, { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 109}}, "Vouchers Redeemed"

            )
            , React.createElement(Award, { className: "h-5 w-5 text-primary"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 112}} )
          )
          , React.createElement(CardContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 114}}
            , React.createElement('span', { className: "text-3xl font-extrabold text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 115}}, _optionalChain([stats, 'optionalAccess', _5 => _5.totalRewardsRedeemed]))
            , React.createElement('p', { className: "text-[10px] text-muted-foreground mt-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 116}}, "Successfully claimed catalog vouchers"   )
          )
        )
      )

      /* Subscription overview and billing status */
      , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 122}}

        /* Billing Overview Card */
        , React.createElement(Card, { className: "glass", glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 125}}
          , React.createElement(CardHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 126}}
            , React.createElement(CardTitle, { className: "text-base flex items-center gap-2"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 127}}
              , React.createElement(CreditCard, { className: "h-4.5 w-4.5 text-indigo-600"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 128}} ), " Subscription Tenancies"
            )
            , React.createElement(CardDescription, { className: "text-xs", __self: this, __source: {fileName: _jsxFileName, lineNumber: 130}}, "Overview of paying merchant cohorts"

            )
          )
          , React.createElement(CardContent, { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 134}}
            , React.createElement('div', { className: "bg-slate-50 p-4 rounded-xl border border-border/50 flex justify-between items-center"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 135}}
              , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 136}}
                , React.createElement('span', { className: "text-[10px] text-muted-foreground font-bold uppercase block tracking-wider"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 137}}, "Paid Subscription Enrolls"  )
                , React.createElement('span', { className: "text-2xl font-extrabold text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 138}}, _optionalChain([stats, 'optionalAccess', _6 => _6.activeSubscriptions]), " Businesses" )
              )
              , React.createElement('span', { className: "text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 140}}, "Captured"

              )
            )
            , React.createElement('p', { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 144}}, "Merchant subscription billings are processed directly through Razorpay Subscriptions link callbacks. Tenants failing payment automatically enter a 7-day grace period before suspension."

            )
            , React.createElement(Link, { to: "/dashboard/super/businesses", __self: this, __source: {fileName: _jsxFileName, lineNumber: 147}}
              , React.createElement(Button, { size: "sm", className: "w-full mt-2 bg-primary"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 148}}, "Manage Subscriptions & Plans "
                    , React.createElement(ArrowRight, { className: "ml-1.5 h-4 w-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 149}} )
              )
            )
          )
        )

        /* Security / Fraud Monitoring alert panel */
        , React.createElement(Card, { className: "glass", glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 156}}
          , React.createElement(CardHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 157}}
            , React.createElement(CardTitle, { className: "text-base flex items-center gap-2"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 158}}
              , React.createElement(ShieldAlert, { className: "h-4.5 w-4.5 text-red-600"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 159}} ), " Platform Security Center"
            )
            , React.createElement(CardDescription, { className: "text-xs", __self: this, __source: {fileName: _jsxFileName, lineNumber: 161}}, "Suspicious activity metrics and fraud logs"

            )
          )
          , React.createElement(CardContent, { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 165}}
            , React.createElement('div', { className: "p-4 rounded-xl bg-red-50 border border-red-200 flex gap-4"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 166}}
              , React.createElement(ShieldAlert, { className: "h-10 w-10 text-red-600 shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 167}} )
              , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 168}}
                , React.createElement('span', { className: "text-sm font-bold text-red-900 block"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 169}}, "Fraud Location Scans Detected"   )
                , React.createElement('span', { className: "text-xs text-red-700 leading-normal block"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 170}}, "Suspicious coordinates (impossible GPS jumps, null island check-ins, spoofed locations) are automatically logged for forensic audit logs."

                )
              )
            )
            , React.createElement(Link, { to: "/dashboard/super/fraud", __self: this, __source: {fileName: _jsxFileName, lineNumber: 175}}
              , React.createElement(Button, { size: "sm", variant: "outline", className: "w-full mt-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 176}}, "Launch Fraud Monitor Console"

              )
            )
          )
        )

      )
    )
  );
}

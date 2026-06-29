import { Link } from "react-router-dom";
const _jsxFileName = "src\\pages\\(super-admin)\\dashboard\\super\\page.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Building2, 
  Users, 
  UserCheck, 
  Award, 
  CreditCard, 
  ShieldAlert,
  Bell,
  Loader2,
  ArrowRight 
} from "lucide-react";











export default function SuperDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["superDashboardStats"],
    queryFn: () => api.get("/admin/dashboard").then((res) => res.data),
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["adminUsersList"],
    queryFn: () => api.get("/admin/users").then((res) => res.data || []),
  });

  const [recipientRole, setRecipientRole] = React.useState("CUSTOMER"); // "CUSTOMER" or "BUSINESS_ADMIN"
  const [selectedUserId, setSelectedUserId] = React.useState("");
  const [alertTitle, setAlertTitle] = React.useState("");
  const [alertBody, setAlertBody] = React.useState("");
  const [sendingAlert, setSendingAlert] = React.useState(false);
  const [alertStatus, setAlertStatus] = React.useState(null);

  const handleSendAlert = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !alertTitle || !alertBody) {
      setAlertStatus({ success: false, message: "Please select a recipient and fill in all alert fields." });
      return;
    }
    setSendingAlert(true);
    setAlertStatus(null);
    try {
      await api.post("/admin/notifications", {
        targetType: "user_id",
        targetValue: selectedUserId,
        title: alertTitle,
        body: alertBody,
      });
      setAlertStatus({ success: true, message: "Alert sent successfully to recipient!" });
      setSelectedUserId("");
      setAlertTitle("");
      setAlertBody("");
    } catch (err) {
      setAlertStatus({
        success: false,
        message: err.response?.data?.message || err.message || "Failed to send platform alert.",
      });
    } finally {
      setSendingAlert(false);
    }
  };

  const isLoading = statsLoading || usersLoading;

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

      /* Send Platform Alerts Section */
      , React.createElement(Card, { className: "glass border-[#FF6A00]/20 bg-gradient-to-tr from-white to-amber-50/20" }
        , React.createElement(CardHeader, null
          , React.createElement(CardTitle, { className: "text-base flex items-center gap-2" }
            , React.createElement(Bell, { className: "h-4.5 w-4.5 text-[#FF6A00]" })
            , "Send Direct Platform Notification"
          )
          , React.createElement(CardDescription, { className: "text-xs" }
            , "Select a customer or business admin from the platform database. This will send a database alert and trigger an instant Web Push notification."
          )
        )
        , React.createElement(CardContent, null
          , React.createElement('form', { onSubmit: handleSendAlert, className: "space-y-4" }
            , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-4" }
              
              /* Recipient Role Toggle pills */
              , React.createElement('div', { className: "space-y-1.5" }
                , React.createElement(Label, { className: "text-xs font-bold text-muted-foreground block" }, "Recipient Role")
                , React.createElement('div', { className: "flex bg-slate-100 p-1 rounded-lg border border-zinc-200" }
                  , React.createElement('button', {
                      type: "button",
                      onClick: () => {
                        setRecipientRole("CUSTOMER");
                        setSelectedUserId("");
                      },
                      className: `flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                        recipientRole === "CUSTOMER"
                          ? "bg-white text-[#FF6A00] shadow-sm"
                          : "text-slate-600 hover:bg-white/50"
                      }`
                    }, `Customers (${users.filter(u => u.role === "CUSTOMER").length})`)
                  , React.createElement('button', {
                      type: "button",
                      onClick: () => {
                        setRecipientRole("BUSINESS_ADMIN");
                        setSelectedUserId("");
                      },
                      className: `flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                        recipientRole === "BUSINESS_ADMIN"
                          ? "bg-white text-[#FF6A00] shadow-sm"
                          : "text-slate-600 hover:bg-white/50"
                      }`
                    }, `Admins (${users.filter(u => u.role === "BUSINESS_ADMIN").length})`)
                )
              )

              /* Recipient Selection Dropdown */
              , React.createElement('div', { className: "space-y-1.5 md:col-span-2" }
                , React.createElement(Label, { htmlFor: "alert-target-user", className: "text-xs font-bold text-muted-foreground" }, "Select Recipient")
                , React.createElement('select', {
                    id: "alert-target-user",
                    value: selectedUserId,
                    onChange: (e) => setSelectedUserId(e.target.value),
                    className: "w-full h-10 border border-zinc-200 rounded-md bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6A00] text-slate-800",
                    required: true
                  },
                    React.createElement('option', { value: "" }, `Select a ${recipientRole === "CUSTOMER" ? "Customer" : "Business Admin"}...`),
                    users.filter(u => u.role === recipientRole).map(u =>
                      React.createElement('option', { key: u.id, value: u.id },
                        `${u.name} (${u.phone || u.email || "No Contact"})`
                      )
                    )
                  )
              )
            )

            , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-4" }
              
              /* Notification Title */
              , React.createElement('div', { className: "space-y-1.5 md:col-span-1" }
                , React.createElement(Label, { htmlFor: "alert-title", className: "text-xs font-bold text-muted-foreground" }, "Notification Title")
                , React.createElement(Input, {
                    id: "alert-title",
                    value: alertTitle,
                    onChange: (e) => setAlertTitle(e.target.value),
                    placeholder: "e.g. System Alert or Reward Ready!",
                    className: "text-xs border-border bg-white h-9",
                    required: true
                  })
              )

              /* Notification Body */
              , React.createElement('div', { className: "space-y-1.5 md:col-span-2" }
                , React.createElement(Label, { htmlFor: "alert-body", className: "text-xs font-bold text-muted-foreground" }, "Alert Message / Content")
                , React.createElement(Input, {
                    id: "alert-body",
                    value: alertBody,
                    onChange: (e) => setAlertBody(e.target.value),
                    placeholder: "Enter the details of your notification here...",
                    className: "text-xs border-border bg-white h-9",
                    required: true
                  })
              )
            )

            /* Submit Button & Status Alerts */
            , React.createElement('div', { className: "flex flex-col md:flex-row items-center justify-between gap-4 pt-2" }
              , React.createElement('div', { className: "w-full md:flex-1" }
                , alertStatus && (
                    React.createElement('div', {
                      className: `text-xs px-3 py-2 rounded-lg border ${
                        alertStatus.success
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-red-50 text-red-800 border-red-200"
                      }`
                    }, alertStatus.message)
                  )
              )
              , React.createElement(Button, {
                  type: "submit",
                  disabled: sendingAlert,
                  className: "w-full md:w-auto bg-gradient-to-r from-[#FF6A00] to-[#800020] hover:from-[#FF8E3C] hover:to-[#FF6A00] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-[#FF6A00]/25 flex items-center justify-center gap-2 border-0 transition-all duration-300"
                }
                , sendingAlert ? React.createElement(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : null
                , sendingAlert ? "Sending..." : "Send Notification"
              )
            )
          )
        )
      )
    )
  );
}

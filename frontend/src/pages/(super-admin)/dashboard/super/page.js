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
  ArrowRight,
  Tag,
  Trash2,
  Plus
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

  const [recipientRole, setRecipientRole] = React.useState("CUSTOMER");
  const [selectedUserId, setSelectedUserId] = React.useState("");
  const [alertTitle, setAlertTitle] = React.useState("");
  const [alertBody, setAlertBody] = React.useState("");
  const [sendingAlert, setSendingAlert] = React.useState(false);
  const [alertStatus, setAlertStatus] = React.useState(null);

  // ── Coupon State ──────────────────────────────────────────────
  const [coupons, setCoupons] = React.useState([]);
  const [couponsLoading, setCouponsLoading] = React.useState(false);
  const [couponCode, setCouponCode] = React.useState("");
  const [couponDiscountType, setCouponDiscountType] = React.useState("PERCENTAGE");
  const [couponDiscountValue, setCouponDiscountValue] = React.useState("");
  const [couponDescription, setCouponDescription] = React.useState("");
  const [couponSaving, setCouponSaving] = React.useState(false);
  const [couponStatus, setCouponStatus] = React.useState(null);

  const fetchCoupons = React.useCallback(async () => {
    setCouponsLoading(true);
    try {
      const res = await api.get("/admin/coupons");
      setCoupons(res.data || []);
    } catch (_) {}
    finally { setCouponsLoading(false); }
  }, []);

  React.useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    const value = parseFloat(couponDiscountValue);
    if (!code || isNaN(value) || value <= 0) {
      setCouponStatus({ success: false, message: "Please fill in all coupon fields correctly." });
      return;
    }
    if (couponDiscountType === "PERCENTAGE" && value > 100) {
      setCouponStatus({ success: false, message: "Percentage discount cannot exceed 100%." });
      return;
    }
    setCouponSaving(true);
    setCouponStatus(null);
    try {
      await api.post("/admin/coupons", {
        code,
        discountType: couponDiscountType,
        discountValue: value,
        description: couponDescription.trim(),
      });
      setCouponStatus({ success: true, message: `Coupon "${code}" created successfully!` });
      setCouponCode("");
      setCouponDiscountValue("");
      setCouponDescription("");
      fetchCoupons();
    } catch (err) {
      setCouponStatus({
        success: false,
        message: err.response?.data?.message || err.message || "Failed to create coupon.",
      });
    } finally { setCouponSaving(false); }
  };

  const handleDeleteCoupon = async (code) => {
    if (!window.confirm(`Delete coupon "${code}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/coupons/${code}`);
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete coupon.");
    }
  };

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

      /* Coupon Code Management Section */
      , React.createElement(Card, { className: "glass border-emerald-500/20 bg-gradient-to-tr from-white to-emerald-50/20" }
        , React.createElement(CardHeader, null
          , React.createElement(CardTitle, { className: "text-base flex items-center gap-2" }
            , React.createElement(Tag, { className: "h-4.5 w-4.5 text-emerald-600" })
            , "Subscription Coupon Codes"
          )
          , React.createElement(CardDescription, { className: "text-xs" }
            , "Create discount coupon codes that business owners can apply at checkout to reduce their subscription price."
          )
        )
        , React.createElement(CardContent, { className: "space-y-5" }
          /* Create Form */
          , React.createElement('form', { onSubmit: handleCreateCoupon, className: "space-y-4" }
            , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-4 gap-4" }
              /* Code */
              , React.createElement('div', { className: "space-y-1.5" }
                , React.createElement(Label, { htmlFor: "coupon-code", className: "text-xs font-bold text-muted-foreground" }, "Coupon Code")
                , React.createElement(Input, {
                    id: "coupon-code",
                    value: couponCode,
                    onChange: (e) => setCouponCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "")),
                    placeholder: "e.g. LAUNCH50",
                    className: "text-xs border-border bg-white h-9 font-mono uppercase",
                    required: true,
                    maxLength: 32
                  })
              )
              /* Discount Type */
              , React.createElement('div', { className: "space-y-1.5" }
                , React.createElement(Label, { htmlFor: "coupon-type", className: "text-xs font-bold text-muted-foreground" }, "Discount Type")
                , React.createElement('select', {
                    id: "coupon-type",
                    value: couponDiscountType,
                    onChange: (e) => setCouponDiscountType(e.target.value),
                    className: "w-full h-9 border border-zinc-200 rounded-md bg-white px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                  },
                  React.createElement('option', { value: "PERCENTAGE" }, "Percentage (%)"),
                  React.createElement('option', { value: "FIXED_AMOUNT" }, "Fixed Amount (₹)")
                )
              )
              /* Discount Value */
              , React.createElement('div', { className: "space-y-1.5" }
                , React.createElement(Label, { htmlFor: "coupon-value", className: "text-xs font-bold text-muted-foreground" },
                  couponDiscountType === "PERCENTAGE" ? "Value (%)" : "Value (₹)"
                )
                , React.createElement(Input, {
                    id: "coupon-value",
                    type: "number",
                    min: "0.01",
                    step: "0.01",
                    max: couponDiscountType === "PERCENTAGE" ? "100" : undefined,
                    value: couponDiscountValue,
                    onChange: (e) => setCouponDiscountValue(e.target.value),
                    placeholder: couponDiscountType === "PERCENTAGE" ? "e.g. 20" : "e.g. 200",
                    className: "text-xs border-border bg-white h-9",
                    required: true
                  })
              )
              /* Description */
              , React.createElement('div', { className: "space-y-1.5" }
                , React.createElement(Label, { htmlFor: "coupon-desc", className: "text-xs font-bold text-muted-foreground" }, "Description (optional)")
                , React.createElement(Input, {
                    id: "coupon-desc",
                    value: couponDescription,
                    onChange: (e) => setCouponDescription(e.target.value),
                    placeholder: "e.g. Launch offer",
                    className: "text-xs border-border bg-white h-9"
                  })
              )
            )
            , React.createElement('div', { className: "flex flex-col md:flex-row items-center justify-between gap-4" }
              , React.createElement('div', { className: "w-full md:flex-1" }
                , couponStatus && (
                    React.createElement('div', {
                      className: `text-xs px-3 py-2 rounded-lg border ${
                        couponStatus.success
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-red-50 text-red-800 border-red-200"
                      }`
                    }, couponStatus.message)
                  )
              )
              , React.createElement('button', {
                  type: "submit",
                  disabled: couponSaving,
                  className: "w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition-all duration-200 disabled:opacity-60"
                }
                , couponSaving ? React.createElement(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : React.createElement(Plus, { className: "h-3.5 w-3.5" })
                , couponSaving ? "Creating..." : "Create Coupon"
              )
            )
          )

          /* Existing Coupons List */
          , React.createElement('div', { className: "border-t border-border pt-4" }
            , React.createElement('p', { className: "text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-3" }, "Active Coupons")
            , couponsLoading ? (
                React.createElement('div', { className: "flex items-center gap-2 text-xs text-muted-foreground py-2" }
                  , React.createElement(Loader2, { className: "h-3.5 w-3.5 animate-spin" })
                  , "Loading coupons..."
                )
              ) : coupons.length === 0 ? (
                React.createElement('p', { className: "text-xs text-muted-foreground py-2" }, "No coupon codes created yet.")
              ) : (
                React.createElement('div', { className: "space-y-2" }
                  , coupons.map(c =>
                    React.createElement('div', {
                        key: c.code,
                        className: "flex items-center justify-between bg-slate-50 border border-border rounded-xl px-4 py-2.5 text-xs"
                      }
                      , React.createElement('div', { className: "flex items-center gap-3" }
                        , React.createElement('span', { className: "font-mono font-black text-emerald-700 text-sm tracking-wider" }, c.code)
                        , React.createElement('span', { className: `px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.discountType === "PERCENTAGE"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }` },
                          c.discountType === "PERCENTAGE"
                            ? `${c.discountValue}% OFF`
                            : `₹${c.discountValue} OFF`
                        )
                        , c.description && React.createElement('span', { className: "text-muted-foreground hidden sm:inline" }, c.description)
                      )
                      , React.createElement('button', {
                          onClick: () => handleDeleteCoupon(c.code),
                          className: "p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors",
                          title: "Delete coupon"
                        }
                        , React.createElement(Trash2, { className: "h-3.5 w-3.5" })
                      )
                    )
                  )
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

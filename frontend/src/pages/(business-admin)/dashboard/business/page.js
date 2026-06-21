import { Link } from "react-router-dom";
const _jsxFileName = "src\\pages\\(business-admin)\\dashboard\\business\\page.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } "use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api, getImageUrl } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Users,
  MapPin,

  Zap,

  RefreshCcw,
  UserCheck,
  Gift,

  TrendingUp,
  Calendar,
  AlertCircle,
  Loader2
} from "lucide-react";
import { formatDate } from "@/lib/utils";
export default function BusinessDashboard() {
  const { user } = useAuthStore();
  const businessId = _optionalChain([user, 'optionalAccess', _ => _.businessId]);
  const [statusLoading, setStatusLoading] = React.useState({});

  const logoInputRef = React.useRef(null);
  const [logoUploading, setLogoUploading] = React.useState(false);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert("Only JPEG, PNG, and WebP images are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size should not exceed 5MB.");
      return;
    }

    const formData = new FormData();
    formData.append("logo", file);

    setLogoUploading(true);
    try {
      await api.post(`/businesses/${businessId}/logo`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      await refetchProfile();
      alert("Profile icon updated successfully!");
    } catch (err) {
      alert(err.message || "Failed to upload profile icon.");
    } finally {
      setLogoUploading(false);
    }
  };

  // Dialog and input states
  const [showSocialModal, setShowSocialModal] = React.useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);
  const [showDemoCheckout, setShowDemoCheckout] = React.useState(false);
  const [demoOrder, setDemoOrder] = React.useState(null);

  const [instagramUrl, setInstagramUrl] = React.useState("");
  const [facebookUrl, setFacebookUrl] = React.useState("");
  const [whatsappUrl, setWhatsappUrl] = React.useState("");
  const [googleReviewUrl, setGoogleReviewUrl] = React.useState("");
  const [socialSaving, setSocialSaving] = React.useState(false);

  const [pricing, setPricing] = React.useState(null);
  const [pricingLoading, setPricingLoading] = React.useState(false);
  const [paymentLoading, setPaymentLoading] = React.useState(false);
  const [demoPayLoading, setDemoPayLoading] = React.useState(false);
  const [demoPaySuccess, setDemoPaySuccess] = React.useState(false);

  const handleStatusChange = async (checkInId, newStatus) => {
    setStatusLoading(prev => ({ ...prev, [checkInId]: true }));
    try {
      await api.patch(`/checkins/${checkInId}/status`, { status: newStatus });
      refetchCheckins();
    } catch (err) {
      alert(err.message || "Failed to update check-in status.");
    } finally {
      setStatusLoading(prev => ({ ...prev, [checkInId]: false }));
    }
  };

  // 1. Fetch business details
  const { data: business, isLoading: bizLoading, refetch: refetchProfile } = useQuery({
    queryKey: ["businessProfile", businessId],
    queryFn: () => api.get(`/businesses/${businessId}`).then((res) => res.data),
    enabled: !!businessId,
  });

  const handleOpenSocialModal = () => {
    if (business) {
      setInstagramUrl(business.instagramUrl || "");
      setFacebookUrl(business.facebookUrl || "");
      setWhatsappUrl(business.whatsappUrl || "");
      setGoogleReviewUrl(business.googleReviewUrl || "");
    }
    setShowSocialModal(true);
  };

  const fetchPricing = async () => {
    setPricingLoading(true);
    try {
      const res = await api.get("/subscriptions/pricing");
      setPricing(res.data);
    } catch (err) {
      console.error("Failed to fetch pricing:", err);
    } finally {
      setPricingLoading(false);
    }
  };

  React.useEffect(() => {
    if (showUpgradeModal) {
      fetchPricing();
    }
  }, [showUpgradeModal]);

  const handleSaveSocial = async (e) => {
    e.preventDefault();
    setSocialSaving(true);
    try {
      await api.patch(`/businesses/${businessId}`, {
        instagramUrl: instagramUrl || null,
        facebookUrl: facebookUrl || null,
        whatsappUrl: whatsappUrl || null,
        googleReviewUrl: googleReviewUrl || null,
      });
      await refetchProfile();
      setShowSocialModal(false);
      alert("Social links updated successfully!");
    } catch (err) {
      alert(err.message || "Failed to save social links.");
    } finally {
      setSocialSaving(false);
    }
  };

  const handlePayAndUpgrade = async () => {
    setPaymentLoading(true);
    try {
      // 1. Create order on backend
      const orderRes = await api.post("/subscriptions/create-order", { businessId });
      const order = orderRes.data;

      if (order.isMock) {
        // Show styled demo checkout modal instead of window.confirm
        setDemoOrder(order);
        setDemoPaySuccess(false);
        setShowUpgradeModal(false);
        setShowDemoCheckout(true);
      } else {
        // Live Razorpay Checkout flow
        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "ScanLoyal SaaS",
          description: "Launch Year Special — Yearly Subscription",
          image: "/image.png",
          order_id: order.orderId,
          handler: async (response) => {
            try {
              const verifyRes = await api.post("/subscriptions/verify-payment", {
                businessId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              alert(verifyRes.message || "Subscription upgraded!");
              await refetchProfile();
              setShowUpgradeModal(false);
            } catch (err) {
              alert(err.message || "Payment verification failed.");
            }
          },
          prefill: {
            name: business?.owner?.name || "",
            contact: business?.owner?.phone || "",
            email: business?.owner?.email || "",
          },
          notes: {
            businessId,
            planType: "yearly",
          },
          theme: {
            color: "#FF6A00",
          },
          modal: {
            ondismiss: () => { setPaymentLoading(false); }
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      alert(err.message || "Failed to initiate payment.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleDemoConfirmPay = async () => {
    if (!demoOrder) return;
    setDemoPayLoading(true);
    try {
      await api.post("/subscriptions/verify-payment", {
        businessId,
        razorpayOrderId: demoOrder.orderId,
        razorpayPaymentId: `mock-pay-${Date.now()}`,
      });
      setDemoPaySuccess(true);
      await refetchProfile();
      setTimeout(() => {
        setShowDemoCheckout(false);
        setDemoOrder(null);
        setDemoPaySuccess(false);
      }, 2500);
    } catch (err) {
      alert(err.message || "Demo payment failed.");
    } finally {
      setDemoPayLoading(false);
    }
  };

  // 2. Fetch business analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["businessAnalytics", businessId],
    queryFn: () => api.get(`/analytics/business/${businessId}`).then((res) => res.data),
    enabled: !!businessId,
  });

  // 3. Fetch recent check-ins
  const { data: checkinsData, isLoading: checkinsLoading, isFetching: checkinsFetching, refetch: refetchCheckins } = useQuery({
    queryKey: ["businessCheckins", businessId],
    queryFn: () => api.get(`/checkins/business/${businessId}?limit=5`).then((res) => res.data),
    enabled: !!businessId,
  });

  const checkins = checkinsData || [];

  const loading = bizLoading || analyticsLoading || checkinsLoading;

  if (loading) {
    return (
      React.createElement('div', { className: "space-y-6 animate-pulse", __self: this, __source: { fileName: _jsxFileName, lineNumber: 100 } }
        , React.createElement('div', { className: "h-8 w-48 rounded bg-slate-100", __self: this, __source: { fileName: _jsxFileName, lineNumber: 101 } })
        , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-4 gap-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 102 } }
          , React.createElement('div', { className: "h-28 rounded-xl bg-slate-100", __self: this, __source: { fileName: _jsxFileName, lineNumber: 103 } })
          , React.createElement('div', { className: "h-28 rounded-xl bg-slate-100", __self: this, __source: { fileName: _jsxFileName, lineNumber: 104 } })
          , React.createElement('div', { className: "h-28 rounded-xl bg-slate-100", __self: this, __source: { fileName: _jsxFileName, lineNumber: 105 } })
          , React.createElement('div', { className: "h-28 rounded-xl bg-slate-100", __self: this, __source: { fileName: _jsxFileName, lineNumber: 106 } })
        )
        , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 108 } }
          , React.createElement('div', { className: "h-80 md:col-span-2 rounded-xl bg-slate-100", __self: this, __source: { fileName: _jsxFileName, lineNumber: 109 } })
          , React.createElement('div', { className: "h-80 rounded-xl bg-slate-100", __self: this, __source: { fileName: _jsxFileName, lineNumber: 110 } })
        )
      )
    );
  }

  const limitProgress = (current, max) => {
    return Math.round((current / max) * 100);
  };

  return (
    React.createElement('div', { className: "space-y-8", __self: this, __source: { fileName: _jsxFileName, lineNumber: 121 } }
      /* Title Header */
      , React.createElement('div', { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 123 } }
        , React.createElement('div', { className: "flex items-center gap-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 124 } }
          , React.createElement('div', { className: "relative group w-16 h-16 shrink-0 rounded-2xl border-2 border-border shadow-md overflow-hidden bg-slate-50 flex items-center justify-center cursor-pointer" }
            , logoUploading ? (
                React.createElement(Loader2, { className: "h-6 w-6 animate-spin text-primary" })
              ) : (
                React.createElement(React.Fragment, null
                  , React.createElement('img', {
                      src: getImageUrl(business?.logoUrl) || "/image.png",
                      alt: business?.name || "Logo",
                      className: "w-full h-full object-cover group-hover:opacity-60 transition-opacity"
                    })
                  , React.createElement('div', {
                      onClick: () => logoInputRef.current?.click(),
                      className: "absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                    }
                    , React.createElement('span', { className: "text-[9px] text-white font-extrabold tracking-wider uppercase" }, "Upload")
                  )
                )
              )
          )
          , React.createElement('div', null
            , React.createElement('h1', { className: "text-3xl font-extrabold text-foreground tracking-tight" }, "Dashboard")
            , React.createElement('p', { className: "text-xs text-muted-foreground mt-1" }, "Real-time analytics and activity logs for "
              , _optionalChain([business, 'optionalAccess', _2 => _2.name])
            )
          )
        )
        , React.createElement('div', { className: "flex gap-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 132 } }
          , React.createElement(Button, { variant: "outline", size: "sm", onClick: () => refetchCheckins(), disabled: checkinsFetching, __self: this, __source: { fileName: _jsxFileName, lineNumber: 133 } }
            , React.createElement(RefreshCcw, { className: `mr-2 h-4 w-4 ${checkinsFetching ? 'animate-spin' : ''}`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 134 } })
            , checkinsFetching ? "Syncing..." : "Sync Logs"
          )
          , React.createElement(Link, { to: "/dashboard/business/checkins" },
            React.createElement(Button, { variant: "outline", size: "sm" },
              React.createElement(UserCheck, { className: "mr-2 h-4 w-4" }), " Manage Check-ins"
            )
          )
          , React.createElement(Link, { to: "/dashboard/business/branches", __self: this, __source: { fileName: _jsxFileName, lineNumber: 136 } },
            React.createElement(Button, { size: "sm", className: "bg-primary hover:bg-primary/90 text-primary-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 137 } },
              React.createElement(MapPin, { className: "mr-2 h-4 w-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 138 } }), " Manage Outlets"
            )
          )
          , React.createElement(Button, { variant: "outline", size: "sm", onClick: handleOpenSocialModal },
            "🔗 Social Links"
          )
        )
      )

      /* Main KPI Stats Grid */
      , React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 145 } }
        , React.createElement(Card, { className: "glass", glass: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 146 } }
          , React.createElement(CardHeader, { className: "flex flex-row items-center justify-between pb-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 147 } }
            , React.createElement(CardDescription, { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 148 } }, "Total Customers"

            )
            , React.createElement(Users, { className: "h-5 w-5 text-primary", __self: this, __source: { fileName: _jsxFileName, lineNumber: 151 } })
          )
          , React.createElement(CardContent, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 153 } }
            , React.createElement('span', { className: "text-3xl font-extrabold text-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 154 } }, _optionalChain([analytics, 'optionalAccess', _3 => _3.totalCustomers]) ?? 1)
            , React.createElement('p', { className: "text-[10px] text-muted-foreground mt-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 155 } }, "Unique visitor registry count")
          )
        )

        , React.createElement(Card, { className: "glass", glass: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 159 } }
          , React.createElement(CardHeader, { className: "flex flex-row items-center justify-between pb-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 160 } }
            , React.createElement(CardDescription, { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 161 } }, "Verified Check-Ins"

            )
            , React.createElement(UserCheck, { className: "h-5 w-5 text-emerald-600", __self: this, __source: { fileName: _jsxFileName, lineNumber: 164 } })
          )
          , React.createElement(CardContent, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 166 } }
            , React.createElement('span', { className: "text-3xl font-extrabold text-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 167 } }, _optionalChain([analytics, 'optionalAccess', _4 => _4.totalCheckIns]) ?? 2)
            , React.createElement('p', { className: "text-[10px] text-emerald-600 flex items-center gap-1 mt-1 font-semibold", __self: this, __source: { fileName: _jsxFileName, lineNumber: 168 } }
              , React.createElement(TrendingUp, { className: "h-3 w-3", __self: this, __source: { fileName: _jsxFileName, lineNumber: 169 } }), " +", _optionalChain([analytics, 'optionalAccess', _5 => _5.checkInsToday]) ?? 2, " check-ins today"
            )
          )
        )

        , React.createElement(Card, { className: "glass", glass: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 174 } }
          , React.createElement(CardHeader, { className: "flex flex-row items-center justify-between pb-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 175 } }
            , React.createElement(CardDescription, { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 176 } }, "Repeat Rate"

            )
            , React.createElement(Zap, { className: "h-5 w-5 text-indigo-600", __self: this, __source: { fileName: _jsxFileName, lineNumber: 179 } })
          )
          , React.createElement(CardContent, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 181 } }
            , React.createElement('span', { className: "text-3xl font-extrabold text-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 182 } }, _optionalChain([analytics, 'optionalAccess', _6 => _6.repeatRate]) ?? 100, "%")
            , React.createElement('p', { className: "text-[10px] text-muted-foreground mt-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 183 } }, "Customers with >1 visit profile")
          )
        )

        , React.createElement(Card, { className: "glass", glass: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 187 } }
          , React.createElement(CardHeader, { className: "flex flex-row items-center justify-between pb-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 188 } }
            , React.createElement(CardDescription, { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 189 } }, "Reward Conversions"

            )
            , React.createElement(Gift, { className: "h-5 w-5 text-primary", __self: this, __source: { fileName: _jsxFileName, lineNumber: 192 } })
          )
          , React.createElement(CardContent, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 194 } }
            , React.createElement('span', { className: "text-3xl font-extrabold text-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 195 } }, _optionalChain([analytics, 'optionalAccess', _7 => _7.redemptionRate]) ?? 0, "%")
            , React.createElement('p', { className: "text-[10px] text-muted-foreground mt-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 196 } }
              , _optionalChain([analytics, 'optionalAccess', _8 => _8.totalRewardsRedeemed]) ?? 0, " of ", _optionalChain([analytics, 'optionalAccess', _9 => _9.totalRewardsIssued]) ?? 0, " redeemed"
            )
          )
        )
      )

      /* Main Panels Section */
      , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 204 } }

        /* Left Panel: Recent Activity */
        , React.createElement(Card, { className: "md:col-span-2 flex flex-col glass", glass: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 207 } }
          , React.createElement(CardHeader, { className: "p-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 208 } }
            , React.createElement(CardTitle, { className: "text-base font-bold text-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 209 } }, "Recent Check-In Activity")
            , React.createElement(CardDescription, { className: "text-xs text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 210 } }, "Latest location-verified customer check-ins"

            )
          )
          , React.createElement(CardContent, { className: "p-6 pt-0 flex-1 overflow-x-auto", __self: this, __source: { fileName: _jsxFileName, lineNumber: 214 } }
            , checkins.length === 0 ? (
              React.createElement('div', { className: "h-full flex flex-col items-center justify-center py-12 text-center text-muted-foreground text-sm", __self: this, __source: { fileName: _jsxFileName, lineNumber: 216 } }
                , React.createElement(Calendar, { className: "h-8 w-8 mb-2 text-muted-foreground/60", __self: this, __source: { fileName: _jsxFileName, lineNumber: 217 } }), "No check-in logs recorded yet today."

              )
            ) : (
              React.createElement('table', { className: "w-full text-left border-collapse text-xs", __self: this, __source: { fileName: _jsxFileName, lineNumber: 221 } }
                , React.createElement('thead', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 222 } }
                  , React.createElement('tr', { className: "border-b border-border text-muted-foreground font-bold", __self: this, __source: { fileName: _jsxFileName, lineNumber: 223 } }
                    , React.createElement('th', { className: "pb-3", __self: this, __source: { fileName: _jsxFileName, lineNumber: 224 } }, "Customer")
                    , React.createElement('th', { className: "pb-3", __self: this, __source: { fileName: _jsxFileName, lineNumber: 225 } }, "Outlet")
                    , React.createElement('th', { className: "pb-3", __self: this, __source: { fileName: _jsxFileName, lineNumber: 226 } }, "Timestamp")
                    , React.createElement('th', { className: "pb-3 text-right", __self: this, __source: { fileName: _jsxFileName, lineNumber: 227 } }, "Status")
                  )
                )
                , React.createElement('tbody', { className: "divide-y divide-border", __self: this, __source: { fileName: _jsxFileName, lineNumber: 230 } }
                  , checkins.map((log) => (
                    React.createElement('tr', { key: log.id, className: "hover:bg-slate-50/50 transition-colors", __self: this, __source: { fileName: _jsxFileName, lineNumber: 232 } }
                      , React.createElement('td', { className: "py-3 font-semibold text-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 233 } }
                        , log.customer.name
                        , React.createElement('span', { className: "block text-[10px] font-normal text-muted-foreground font-mono mt-0.5", __self: this, __source: { fileName: _jsxFileName, lineNumber: 235 } }, log.customer.phone)
                      )
                      , React.createElement('td', { className: "py-3 text-slate-700 font-medium", __self: this, __source: { fileName: _jsxFileName, lineNumber: 237 } }, log.branch.name)
                      , React.createElement('td', { className: "py-3 text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 238 } }, formatDate(log.createdAt))
                      , React.createElement('td', { className: "py-3 text-right", __self: this, __source: { fileName: _jsxFileName, lineNumber: 239 } }
                        , statusLoading[log.id] ? (
                          React.createElement(Loader2, { className: "h-4 w-4 animate-spin text-muted-foreground ml-auto" })
                        ) : (
                          React.createElement('select', {
                            value: log.status,
                            onChange: (e) => handleStatusChange(log.id, e.target.value),
                            className: `text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer outline-none bg-white ${log.status === "VALID"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : log.status === "SUSPICIOUS"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-red-50 text-red-700 border-red-200"
                              }`
                          },
                            React.createElement('option', { value: "VALID" }, "VALID"),
                            React.createElement('option', { value: "SUSPICIOUS" }, "SUSPICIOUS"),
                            React.createElement('option', { value: "REJECTED" }, "REJECTED")
                          )
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
        , React.createElement(Card, { className: "glass", glass: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 257 } }
          , React.createElement(CardHeader, { className: "p-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 258 } }
            , React.createElement(CardTitle, { className: "text-base font-bold text-foreground flex items-center gap-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 259 } }
              , React.createElement(Zap, { className: "h-4.5 w-4.5 text-primary", __self: this, __source: { fileName: _jsxFileName, lineNumber: 260 } }), " Current Plan Usage"
            )
            , React.createElement(CardDescription, { className: "text-xs text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 262 } }, "Track subscription capacity limits"

            )
          )
          , React.createElement(CardContent, { className: "p-6 pt-0 space-y-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 266 } }
            /* Plan Badge Info */
            , React.createElement('div', { className: "rounded-xl bg-slate-50 p-4 border border-border flex items-center justify-between", __self: this, __source: { fileName: _jsxFileName, lineNumber: 268 } }
              , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 269 } }
                , React.createElement('span', { className: "text-[10px] text-muted-foreground font-bold uppercase tracking-wider block", __self: this, __source: { fileName: _jsxFileName, lineNumber: 270 } }, "Active Plan")
                , React.createElement('span', { className: "text-base font-extrabold text-foreground uppercase tracking-wider", __self: this, __source: { fileName: _jsxFileName, lineNumber: 271 } }, _optionalChain([business, 'optionalAccess', _10 => _10.plan, 'optionalAccess', _11 => _11.name]) || "No Plan")
              )
              , React.createElement('span', { className: "text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20", __self: this, __source: { fileName: _jsxFileName, lineNumber: 273 } }, "₹"
                , parseInt(_optionalChain([business, 'optionalAccess', _12 => _12.plan, 'optionalAccess', _13 => _13.priceMonthly]) || "0").toLocaleString("en-IN"), "/mo"
              )
            )

            /* Utilization bar 1: Branches */
            , React.createElement('div', { className: "space-y-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 279 } }
              , React.createElement('div', { className: "flex justify-between text-xs font-semibold", __self: this, __source: { fileName: _jsxFileName, lineNumber: 280 } }
                , React.createElement('span', { className: "text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 281 } }, "Branches Installed")
                , React.createElement('span', { className: "text-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 282 } }, _optionalChain([business, 'optionalAccess', _14 => _14._count, 'access', _15 => _15.branches]), " / ", _optionalChain([business, 'optionalAccess', _16 => _16.plan, 'optionalAccess', _17 => _17.maxBranches]) || 0)
              )
              , React.createElement('div', { className: "w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-border", __self: this, __source: { fileName: _jsxFileName, lineNumber: 284 } }
                , React.createElement('div', {
                  className: "bg-primary h-full rounded-full transition-all duration-500",
                  style: { width: `${limitProgress(_optionalChain([business, 'optionalAccess', _18 => _18._count, 'access', _19 => _19.branches]) || 0, _optionalChain([business, 'optionalAccess', _20 => _20.plan, 'optionalAccess', _21 => _21.maxBranches]) || 1)}%` }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 285 }
                }
                )
              )
            )

            /* Utilization bar 2: Customers */
            , React.createElement('div', { className: "space-y-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 293 } }
              , React.createElement('div', { className: "flex justify-between text-xs font-semibold", __self: this, __source: { fileName: _jsxFileName, lineNumber: 294 } }
                , React.createElement('span', { className: "text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 295 } }, "Enrolled Customers")
                , React.createElement('span', { className: "text-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 296 } }, _optionalChain([analytics, 'optionalAccess', _22 => _22.totalCustomers]), " / ", _optionalChain([business, 'optionalAccess', _23 => _23.plan, 'optionalAccess', _24 => _24.maxCustomers]) || 0)
              )
              , React.createElement('div', { className: "w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-border", __self: this, __source: { fileName: _jsxFileName, lineNumber: 298 } }
                , React.createElement('div', {
                  className: "bg-primary h-full rounded-full transition-all duration-500",
                  style: { width: `${limitProgress(_optionalChain([analytics, 'optionalAccess', _25 => _25.totalCustomers]) || 0, _optionalChain([business, 'optionalAccess', _26 => _26.plan, 'optionalAccess', _27 => _27.maxCustomers]) || 1)}%` }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 299 }
                }
                )
              )
            )

            /* Subscription Expiry Alert */
            , React.createElement('div', { className: "rounded-lg bg-slate-50 p-3.5 border border-border flex gap-3 text-xs text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 307 } }
              , React.createElement(AlertCircle, { className: "h-5 w-5 text-primary shrink-0 mt-0.5", __self: this, __source: { fileName: _jsxFileName, lineNumber: 308 } })
              , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 309 } }
                , React.createElement('span', { className: "font-semibold text-foreground block mb-0.5", __self: this, __source: { fileName: _jsxFileName, lineNumber: 310 } }, "Subscription Status")
                , _optionalChain([business, 'optionalAccess', _28 => _28.subscription]) ? (
                  React.createElement('span', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 312 } }, "Your subscription is currently "
                    , React.createElement('strong', { className: "text-emerald-600 uppercase", __self: this, __source: { fileName: _jsxFileName, lineNumber: 313 } }, business.subscription.status), ". Next billing date is "
                    , business.subscription.currentPeriodEnd ? formatDate(business.subscription.currentPeriodEnd) : "N/A", "."
                  )
                ) : (
                  React.createElement('span', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 317 } }, "No active Razorpay subscription. Plan is running on trial limits.")
                )
              )
            )
            , React.createElement(Button, {
              onClick: () => setShowUpgradeModal(true),
              className: "w-full bg-primary hover:bg-primary/95 text-white shadow-sm font-semibold text-xs mt-2"
            }, "Upgrade / Purchase Plan")
          )
        )
      )

      /* Social Links Modal */
      , showSocialModal && (
        React.createElement(Dialog, { open: showSocialModal, onOpenChange: (open) => !open && setShowSocialModal(false) }
          , React.createElement(DialogContent, { className: "max-w-[420px] bg-white border border-border" }
            , React.createElement(DialogHeader, null
              , React.createElement(DialogTitle, { className: "text-lg font-bold text-foreground" }, "Manage Social Links")
              , React.createElement(DialogDescription, { className: "text-xs text-muted-foreground" }, "Add social media platform links to display on customer loyalty cards.")
            )
            , React.createElement('form', { onSubmit: handleSaveSocial, className: "space-y-4 py-2" }
              , React.createElement('div', { className: "space-y-1.5" }
                , React.createElement(Label, { htmlFor: "inst-url", className: "text-xs font-semibold text-muted-foreground" }, "Instagram URL / Profile")
                , React.createElement(Input, {
                  id: "inst-url",
                  placeholder: "e.g. https://instagram.com/mybrand",
                  value: instagramUrl,
                  onChange: (e) => setInstagramUrl(e.target.value),
                  className: "text-xs border-border bg-white"
                })
              )
              , React.createElement('div', { className: "space-y-1.5" }
                , React.createElement(Label, { htmlFor: "fb-url", className: "text-xs font-semibold text-muted-foreground" }, "Facebook Page URL")
                , React.createElement(Input, {
                  id: "fb-url",
                  placeholder: "e.g. https://facebook.com/mypage",
                  value: facebookUrl,
                  onChange: (e) => setFacebookUrl(e.target.value),
                  className: "text-xs border-border bg-white"
                })
              )
              , React.createElement('div', { className: "space-y-1.5" }
                , React.createElement(Label, { htmlFor: "wa-url", className: "text-xs font-semibold text-muted-foreground" }, "WhatsApp Contact (Number or Link)")
                , React.createElement(Input, {
                  id: "wa-url",
                  placeholder: "e.g. +919937012345 or link",
                  value: whatsappUrl,
                  onChange: (e) => setWhatsappUrl(e.target.value),
                  className: "text-xs border-border bg-white"
                })
              )
              , React.createElement('div', { className: "space-y-1.5" }
                , React.createElement(Label, { htmlFor: "g-url", className: "text-xs font-semibold text-muted-foreground" }, "Google Review Link")
                , React.createElement(Input, {
                  id: "g-url",
                  placeholder: "e.g. https://g.page/r/...",
                  value: googleReviewUrl,
                  onChange: (e) => setGoogleReviewUrl(e.target.value),
                  className: "text-xs border-border bg-white"
                })
              )
              , React.createElement(DialogFooter, { className: "pt-4" }
                , React.createElement(Button, { type: "button", variant: "outline", onClick: () => setShowSocialModal(false) }, "Cancel")
                , React.createElement(Button, { type: "submit", className: "bg-primary text-primary-foreground hover:bg-primary/95", disabled: socialSaving }
                  , socialSaving ? "Saving..." : "Save Links"
                )
              )
            )
          )
        )
      )

      /* Upgrade Plan Modal */
      , showUpgradeModal && (
        React.createElement(Dialog, { open: showUpgradeModal, onOpenChange: (open) => !open && setShowUpgradeModal(false) }
          , React.createElement(DialogContent, { className: "max-w-[400px] bg-white border-0 shadow-2xl rounded-3xl overflow-hidden p-0" }
            /* Gradient Header */
            , React.createElement('div', { className: "bg-gradient-to-br from-[#FF8A00] via-[#FF5E00] to-[#E31B00] px-6 pt-7 pb-6 text-white relative overflow-hidden" }
              , React.createElement('div', { className: "absolute -top-6 -right-6 w-32 h-32 bg-white/5 rounded-full" })
              , React.createElement('div', { className: "absolute -bottom-8 -left-4 w-24 h-24 bg-white/5 rounded-full" })
              , React.createElement('div', { className: "relative z-10" }
                , React.createElement('div', { className: "flex items-center gap-2 mb-1" }
                  , React.createElement('img', { src: "/image.png", alt: "ScanLoyal", className: "h-6 w-auto object-contain brightness-0 invert" })
                  , React.createElement('span', { className: "text-xs font-black uppercase tracking-widest opacity-80" }, "ScanLoyal")
                )
                , React.createElement('h2', { className: "text-xl font-black tracking-tight mt-2" }, "Launch Year Special")
                , React.createElement('p', { className: "text-xs opacity-80 mt-0.5" }, "Secure yearly subscription · Razorpay Gateway")
              )
            )

            , React.createElement('div', { className: "px-6 py-5 space-y-4" }
              , pricingLoading ? (
                React.createElement('div', { className: "flex flex-col items-center justify-center py-8" }
                  , React.createElement(Loader2, { className: "h-8 w-8 animate-spin text-[#FF6A00]" })
                  , React.createElement('span', { className: "text-xs text-slate-500 mt-2" }, "Calculating your price...")
                )
              ) : pricing && (
                React.createElement(React.Fragment, null
                  /* Bill Breakdown */
                  , React.createElement('div', { className: "rounded-2xl border border-[#FFF2E8] bg-[#FFF9F5] p-4 space-y-2.5 text-xs" }
                    , React.createElement('p', { className: "text-[10px] font-black text-[#FF6A00] uppercase tracking-wider mb-3" }, "Bill Summary")
                    , React.createElement('div', { className: "flex justify-between text-slate-600" }
                      , React.createElement('span', null, "Base Plan (Yearly):")
                      , React.createElement('span', { className: "font-semibold text-slate-800" }, "₹", pricing.basePrice.toLocaleString("en-IN", { minimumFractionDigits: 2 }))
                    )
                    , pricing.isEligibleForPromo && (
                      React.createElement('div', { className: "text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5 text-center" }
                        , `🎉 Launch Promotion Active — First ${pricing.promoLimit} Business Owners`
                      )
                    )

                    , React.createElement('div', { className: "flex justify-between border-t border-[#FFD8B8] pt-2.5 text-sm font-black" }
                      , React.createElement('span', { className: "text-slate-800" }, "Total Payable:")
                      , React.createElement('span', { className: "text-[#FF6A00]" }, "₹", pricing.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 }))
                    )
                  )

                  /* Secure badge */
                  , React.createElement('div', { className: "flex items-center justify-center gap-2 text-[10px] text-slate-500" }
                    , React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-3.5 w-3.5 text-emerald-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }
                      , React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" })
                    )
                    , "Secured by Razorpay · 256-bit SSL"
                  )

                  /* Action Buttons */
                  , React.createElement('div', { className: "flex gap-3 pt-1" }
                    , React.createElement(Button, { type: "button", variant: "outline", className: "flex-1 text-xs rounded-xl border-slate-200 text-slate-500", onClick: () => setShowUpgradeModal(false) }, "Later")
                    , React.createElement(Button, {
                      type: "button",
                      className: "flex-1 text-xs font-bold h-10 bg-gradient-to-r from-[#FF7A00] to-[#FF4D00] hover:from-[#FF6A00] hover:to-[#E31B00] text-white shadow-lg shadow-[#FF6A00]/20 rounded-xl border-0",
                      onClick: handlePayAndUpgrade,
                      disabled: paymentLoading
                    }
                      , paymentLoading ? React.createElement(Loader2, { className: "mr-1.5 h-3.5 w-3.5 animate-spin" }) : null
                      , paymentLoading ? "Opening Gateway..." : "Pay ₹" + pricing.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })
                    )
                  )
                )
              )
            )
          )
        )
      )

      /* Demo Checkout Modal (shown when Razorpay keys not configured) */
      , showDemoCheckout && demoOrder && (
        React.createElement(Dialog, { open: showDemoCheckout, onOpenChange: (open) => { if (!open && !demoPayLoading) { setShowDemoCheckout(false); } } }
          , React.createElement(DialogContent, { className: "max-w-[400px] bg-white border-0 shadow-2xl rounded-3xl overflow-hidden p-0" }
            /* Razorpay-style Header */
            , React.createElement('div', { className: "bg-[#072654] px-6 pt-6 pb-5 text-white relative" }
              , React.createElement('div', { className: "flex items-center justify-between mb-4" }
                , React.createElement('div', { className: "flex items-center gap-2" }
                  , React.createElement('div', { className: "w-6 h-6 bg-[#006AFF] rounded-full flex items-center justify-center" }
                    , React.createElement('span', { className: "text-white text-[9px] font-black" }, "R")
                  )
                  , React.createElement('span', { className: "text-xs font-bold opacity-80" }, "Razorpay Checkout")
                )
                , React.createElement('span', { className: "text-[10px] bg-white/10 px-2 py-0.5 rounded-full" }, "DEMO MODE")
              )
              , React.createElement('div', null
                , React.createElement('p', { className: "text-xs opacity-70" }, "ScanLoyal SaaS")
                , React.createElement('h3', { className: "text-2xl font-black mt-1" }, "₹", (demoOrder.amount / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 }))
                , React.createElement('p', { className: "text-[10px] opacity-60 mt-0.5" }, "Launch Year Special · Yearly Subscription")
              )
            )

            , React.createElement('div', { className: "px-6 py-5 space-y-4" }
              , demoPaySuccess ? (
                React.createElement('div', { className: "flex flex-col items-center justify-center py-8 space-y-3" }
                  , React.createElement('div', { className: "w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center" }
                    , React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-8 w-8 text-emerald-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }
                      , React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" })
                    )
                  )
                  , React.createElement('h3', { className: "text-base font-black text-emerald-700" }, "Payment Successful!")
                  , React.createElement('p', { className: "text-xs text-slate-500 text-center" }, "Your yearly subscription is now active. Welcome to ScanLoyal!")
                )
              ) : (
                React.createElement(React.Fragment, null
                  /* Demo payment method selector */
                  , React.createElement('div', { className: "rounded-2xl border border-slate-200 overflow-hidden" }
                    , React.createElement('div', { className: "bg-[#006AFF]/5 border-b border-slate-200 px-4 py-2.5" }
                      , React.createElement('p', { className: "text-[10px] font-bold text-slate-600 uppercase tracking-wider" }, "Payment Method")
                    )
                    , React.createElement('div', { className: "px-4 py-3 space-y-3" }
                      , React.createElement('div', { className: "flex items-center gap-3 p-2.5 rounded-xl bg-[#006AFF]/5 border border-[#006AFF]/20 cursor-pointer" }
                        , React.createElement('div', { className: "w-3.5 h-3.5 rounded-full border-2 border-[#006AFF] flex items-center justify-center" }
                          , React.createElement('div', { className: "w-2 h-2 rounded-full bg-[#006AFF]" })
                        )
                        , React.createElement('div', null
                          , React.createElement('p', { className: "text-xs font-bold text-slate-800" }, "UPI / Net Banking / Cards")
                          , React.createElement('p', { className: "text-[10px] text-slate-500" }, "All payment methods via Razorpay")
                        )
                      )
                      , React.createElement('div', { className: "flex items-center gap-3 p-2.5 rounded-xl border border-dashed border-slate-200 cursor-not-allowed opacity-50" }
                        , React.createElement('div', { className: "w-3.5 h-3.5 rounded-full border-2 border-slate-300" })
                        , React.createElement('p', { className: "text-xs text-slate-500" }, "EMI (Coming Soon)")
                      )
                    )
                  )

                  /* Prefill info */
                  , React.createElement('div', { className: "rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 space-y-1.5 text-xs text-slate-600" }
                    , React.createElement('div', { className: "flex justify-between" }
                      , React.createElement('span', { className: "text-slate-500" }, "Business:")
                      , React.createElement('span', { className: "font-semibold" }, business?.name || "—")
                    )
                    , React.createElement('div', { className: "flex justify-between" }
                      , React.createElement('span', { className: "text-slate-500" }, "Owner:")
                      , React.createElement('span', { className: "font-semibold" }, business?.owner?.name || "—")
                    )
                    , React.createElement('div', { className: "flex justify-between" }
                      , React.createElement('span', { className: "text-slate-500" }, "Contact:")
                      , React.createElement('span', { className: "font-mono text-[11px]" }, business?.owner?.phone || "—")
                    )
                  )

                  , React.createElement('div', { className: "text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-center" }
                    , "⚡ Demo Mode — Add RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET in backend/.env for live payments"
                  )

                  , React.createElement('div', { className: "flex gap-3" }
                    , React.createElement(Button, { variant: "outline", className: "flex-1 text-xs rounded-xl border-slate-200 text-slate-500", onClick: () => setShowDemoCheckout(false) }, "Cancel")
                    , React.createElement(Button, {
                      className: "flex-1 text-xs font-bold h-10 bg-[#006AFF] hover:bg-[#0052CC] text-white rounded-xl border-0 shadow-lg shadow-blue-500/20",
                      onClick: handleDemoConfirmPay,
                      disabled: demoPayLoading
                    }
                      , demoPayLoading ? React.createElement(Loader2, { className: "mr-1.5 h-3.5 w-3.5 animate-spin" }) : null
                      , demoPayLoading ? "Processing..." : "Pay ₹" + (demoOrder.amount / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })
                    )
                  )
                )
              )
            )
          )
        )
      )
      /* Hidden Logo File Input */
      , React.createElement('input', {
          type: "file",
          ref: logoInputRef,
          onChange: handleLogoUpload,
          accept: "image/jpeg,image/png,image/webp",
          className: "hidden"
        })
    )
  );
}

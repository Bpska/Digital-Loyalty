import { useNavigate, useLocation, Outlet, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
const _jsxFileName = "src\\pages\\(business-admin)\\layout.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }"use client";

import React, { useEffect, useState } from "react";

import { useAuthStore } from "@/store/authStore";
import { 
  LayoutDashboard, 
  MapPin,
 
  Settings, 
  Award, 
  Percent, 
  BarChart3,
 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Loader2,
  ClipboardCheck,
  Settings2
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api, getImageUrl } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function BusinessAdminLayout({
  children,
}

) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, loading, logout } = useAuthStore();
  const [authorized, setAuthorized] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const businessId = _optionalChain([user, 'optionalAccess', _ => _.businessId]);

  const { data: business, refetch: refetchProfile } = useQuery({
    queryKey: ["businessProfile", businessId],
    queryFn: () => api.get(`/businesses/${businessId}`).then((res) => res.data),
    enabled: !!businessId,
  });

  const isPending = _optionalChain([business, 'optionalAccess', _ => _.status]) === "PENDING";

  // Checkout page states
  const [pricing, setPricing] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showDemoCheckout, setShowDemoCheckout] = useState(false);
  const [demoOrder, setDemoOrder] = useState(null);
  const [demoPayLoading, setDemoPayLoading] = useState(false);
  const [demoPaySuccess, setDemoPaySuccess] = useState(false);

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

  useEffect(() => {
    if (isPending) {
      fetchPricing();
    }
  }, [isPending]);

  const handlePayAndUpgrade = async () => {
    setPaymentLoading(true);
    try {
      const orderRes = await api.post("/subscriptions/create-order", { businessId });
      const order = orderRes.data;

      if (order.isMock) {
        setDemoOrder(order);
        setDemoPaySuccess(false);
        setShowDemoCheckout(true);
      } else {
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
              await api.post("/subscriptions/verify-payment", {
                businessId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              alert("Subscription upgraded!");
              await refetchProfile();
            } catch (err) {
              alert(err.message || "Payment verification failed.");
            }
          },
          prefill: {
            name: user?.name || "",
            contact: user?.phone || "",
            email: user?.email || "",
          },
          theme: { color: "#FF6A00" },
          modal: { ondismiss: () => { setPaymentLoading(false); } }
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

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingApprovals, setPendingApprovals] = React.useState(0);
  const [notifiedIds, setNotifiedIds] = useState(new Set());

  // Helper to trigger standard browser/mobile notification bar alert
  const triggerMobileNotification = (title, body) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "granted") {
      try {
        new Notification(title, {
          body,
          icon: "/image.png",
          vibrate: [200, 100, 200],
        });
      } catch (e) {
        // Fallback for mobile Chrome/Android where a Service Worker registration is required to show notification
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(title, {
              body,
              icon: "/image.png",
              vibrate: [200, 100, 200],
            });
          }).catch(err => console.error("SW notification error:", err));
        }
      }
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      const fetched = res.data || [];

      // Update local unread notifications matching native system bar
      if (notifiedIds.size === 0) {
        const initialIds = new Set(fetched.map(n => n.id));
        setNotifiedIds(initialIds);
      } else {
        const newUnread = fetched.filter(n => !n.isRead && !notifiedIds.has(n.id));
        if (newUnread.length > 0) {
          const updatedIds = new Set(notifiedIds);
          newUnread.forEach(n => {
            updatedIds.add(n.id);
            triggerMobileNotification("ScanLoyal Notification", n.message);
          });
          setNotifiedIds(updatedIds);
        }
      }

      setNotifications(fetched);
      const countRes = await api.get("/notifications/unread-count");
      setUnreadCount(countRes.data?.count || 0);
    } catch (err) {
      console.error("Failed to fetch business notifications:", err);
    }
  };

  useEffect(() => {
    if (authorized && !isPending) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000);

      // Request native browser/mobile phone notification permission
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "default") {
          Notification.requestPermission();
        }
      }

      return () => clearInterval(interval);
    }
  }, [authorized, isPending]);

  React.useEffect(() => {
    if (!businessId || isPending) return;
    const fetchPending = async () => {
      try {
        const res = await api.get(`/loyalty-approval/analytics/${businessId}`);
        setPendingApprovals(res.data?.pendingCount ?? 0);
      } catch (_) {}
    };
    fetchPending();
    const iv = setInterval(fetchPending, 30000);
    return () => clearInterval(iv);
  }, [businessId, isPending]);

  const handleMarkAllRead = async () => {
    try {
      await api.post("/notifications/read-all");
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "BUSINESS_ADMIN") {
        navigate("/login");
      } else {
        setAuthorized(true);
      }
    }
  }, [user, loading, navigate]);

  if (loading || !authorized) {
    return (
      React.createElement('div', { className: "flex min-h-screen items-center justify-center bg-background"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 47}}
        , React.createElement(Loader2, { className: "h-8 w-8 animate-spin text-primary"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 48}} )
      )
    );
  }

  if (isPending) {
    return (
      React.createElement('div', { className: "min-h-screen w-full bg-[#07122A] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden" }
        , React.createElement('div', { className: "absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none" })
        , React.createElement('div', { className: "absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" })
        , React.createElement('div', { className: "w-full max-w-[460px] bg-white text-slate-800 rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-slate-800/10 animate-fade-in" }
          , React.createElement('div', { className: "bg-gradient-to-br from-[#FF8A00] via-[#FF5E00] to-[#E31B00] px-8 py-8 text-white relative" }
            , React.createElement('div', { className: "absolute top-4 right-4" }
              , React.createElement('button', { 
                  onClick: logout, 
                  className: "text-xs font-semibold bg-black/10 hover:bg-black/20 px-3 py-1 rounded-full flex items-center gap-1 transition-colors text-white" 
                }
                , React.createElement(LogOut, { className: "h-3 w-3" })
                , "Sign Out"
              )
            )
            , React.createElement('div', { className: "flex items-center gap-2 mb-2" }
              , React.createElement('img', { src: "/image.png", alt: "ScanLoyal", className: "h-7 w-auto object-contain brightness-0 invert" })
              , React.createElement('span', { className: "text-xs font-black uppercase tracking-widest opacity-80" }, "ScanLoyal")
            )
            , React.createElement('h2', { className: "text-2xl font-black tracking-tight mt-3" }, "Activate Your Business")
            , React.createElement('p', { className: "text-xs opacity-85 mt-1" }, "Complete payment to unlock your digital loyalty dashboard")
          )
          , React.createElement('div', { className: "p-8 space-y-6" }
            , pricingLoading ? (
              React.createElement('div', { className: "flex flex-col items-center justify-center py-12" }
                , React.createElement(Loader2, { className: "h-8 w-8 animate-spin text-[#FF6A00]" })
                , React.createElement('span', { className: "text-xs text-slate-500 mt-3" }, "Fetching checkout details...")
              )
            ) : pricing ? (
              React.createElement(React.Fragment, null
                , React.createElement('div', { className: "rounded-2xl border border-[#FFF2E8] bg-[#FFF9F5] p-5 space-y-3.5 text-xs" }
                  , React.createElement('p', { className: "text-[10px] font-black text-[#FF6A00] uppercase tracking-wider mb-2" }, "Order Summary")
                  , React.createElement('div', { className: "flex justify-between text-slate-600" }
                    , React.createElement('span', null, "Launch Special (Yearly):")
                    , React.createElement('span', { className: "font-semibold text-slate-800" }, "₹", pricing.basePrice.toLocaleString("en-IN", { minimumFractionDigits: 2 }))
                  )
                  , pricing.isEligibleForPromo && (
                    React.createElement('div', { className: "text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5 text-center my-2" }
                      , `🎉 Launch Promotion Active — First ${pricing.promoLimit} Business Owners`
                    )
                  )
                  , React.createElement('div', { className: "flex justify-between text-slate-600" }
                    , React.createElement('span', null, `Gateway Charges (${pricing.gatewayPercent}%):`)
                    , React.createElement('span', null, "₹", pricing.gatewayAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 }))
                  )
                  , React.createElement('div', { className: "flex justify-between text-slate-600" }
                    , React.createElement('span', null, `GST (${pricing.gstPercent}%):`)
                    , React.createElement('span', null, "₹", pricing.gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 }))
                  )
                  , React.createElement('div', { className: "flex justify-between border-t border-[#FFD8B8] pt-3.5 text-sm font-black mt-2" }
                    , React.createElement('span', { className: "text-slate-800" }, "Total Payable:")
                    , React.createElement('span', { className: "text-[#FF6A00]" }, "₹", pricing.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 }))
                  )
                )
                , React.createElement('div', { className: "space-y-2.5 text-xs text-slate-600" }
                  , React.createElement('p', { className: "font-bold text-slate-700 text-[10px] uppercase tracking-wider" }, "What's included:")
                  , React.createElement('div', { className: "grid grid-cols-2 gap-2 text-[11px]" }
                    , React.createElement('div', { className: "flex items-center gap-1.5" }, "✅ Multi-outlet QR Codes")
                    , React.createElement('div', { className: "flex items-center gap-1.5" }, "✅ Customer Point Database")
                    , React.createElement('div', { className: "flex items-center gap-1.5" }, "✅ Loyalty Reward Builder")
                    , React.createElement('div', { className: "flex items-center gap-1.5" }, "✅ Analytics Dashboard")
                  )
                )
                , React.createElement('div', { className: "flex items-center justify-center gap-2 text-[10px] text-slate-500" }
                  , React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-3.5 w-3.5 text-emerald-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }
                    , React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" })
                  )
                  , "Secured by Razorpay · 256-bit SSL"
                )
                , React.createElement(Button, { 
                    type: "button", 
                    className: "w-full text-sm font-bold h-12 bg-gradient-to-r from-[#FF7A00] to-[#FF4D00] hover:from-[#FF6A00] hover:to-[#E31B00] text-white shadow-lg shadow-[#FF6A00]/25 rounded-2xl border-0 transition-all duration-300" ,
                    onClick: handlePayAndUpgrade,
                    disabled: paymentLoading 
                  }
                  , paymentLoading ? React.createElement(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null
                  , paymentLoading ? "Opening Gateway..." : "Pay ₹" + pricing.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })
                )
              )
            ) : (
              React.createElement('div', { className: "text-center text-xs text-red-500 py-6" }, "Failed to load pricing information. Please contact support.")
            )
          )
        )
        , showDemoCheckout && demoOrder && (
            React.createElement(Dialog, { open: showDemoCheckout, onOpenChange: () => {} }
              , React.createElement(DialogContent, { className: "max-w-[400px] bg-white border-0 shadow-2xl rounded-3xl overflow-hidden p-0 text-slate-800" }
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
                        )
                      )
                      , React.createElement('div', { className: "rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 space-y-1.5 text-xs text-slate-600" }
                        , React.createElement('div', { className: "flex justify-between" }
                          , React.createElement('span', { className: "text-slate-500" }, "Business:")
                          , React.createElement('span', { className: "font-semibold" }, business?.name || "—")
                        )
                        , React.createElement('div', { className: "flex justify-between" }
                          , React.createElement('span', { className: "text-slate-500" }, "Owner:")
                          , React.createElement('span', { className: "font-semibold" }, user?.name || "—")
                        )
                        , React.createElement('div', { className: "flex justify-between" }
                          , React.createElement('span', { className: "text-slate-500" }, "Contact:")
                          , React.createElement('span', { className: "font-mono text-[11px]" }, user?.phone || "—")
                        )
                      )
                      , React.createElement('div', { className: "text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-center" }
                        , "⚡ Demo Mode — Add RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET in backend/.env for live payments"
                      )
                      , React.createElement('div', { className: "flex gap-3" }
                        , React.createElement(Button, {
                            className: "w-full text-xs font-bold h-10 bg-[#006AFF] hover:bg-[#0052CC] text-white rounded-xl border-0 shadow-lg shadow-blue-500/20" ,
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
      )
    );
  }





  const menuItems = isPending
    ? [{ label: "Subscription Required", icon: LayoutDashboard, href: "/dashboard/business" }]
    : [
        { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/business" },
        { label: "Branches", icon: MapPin, href: "/dashboard/business/branches" },
        { label: "Loyalty Programs", icon: Settings, href: "/dashboard/business/loyalty" },
        { label: "Rewards", icon: Award, href: "/dashboard/business/rewards" },
        { label: "Coupons", icon: Percent, href: "/dashboard/business/coupons" },
        { label: "Analytics", icon: BarChart3, href: "/dashboard/business/analytics" },
        { label: "Loyalty Approvals", icon: ClipboardCheck, href: "/dashboard/business/approvals", badge: pendingApprovals },
        { label: "Loyalty Config", icon: Settings2, href: "/dashboard/business/loyalty-config" },
      ];

  return (
    React.createElement('div', { className: "min-h-screen bg-background flex text-foreground"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 63}}
      /* Desktop Sidebar */
      , React.createElement('aside', { className: "w-64 border-r border-border bg-card hidden md:flex flex-col h-screen sticky top-0"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 65}}
        , React.createElement('div', { className: "p-6 border-b border-border flex items-center space-x-2"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 66}}
          , business?.logoUrl 
            ? React.createElement('img', { src: getImageUrl(business.logoUrl), alt: business.name, className: "h-7 w-7 rounded-lg object-cover border border-border shrink-0" })
            : React.createElement('img', { src: "/image.png", alt: "LogiSaar Logo", className: "h-7 w-auto object-contain" })
          , React.createElement('span', { className: "text-base font-bold text-foreground tracking-tight"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 70}}, "Business" )
        )
        , React.createElement('nav', { className: "flex-1 p-4 space-y-1 overflow-y-auto"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 72}}
          , menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              React.createElement(Link, {
                key: item.href,
                to: item.href,
                className: cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground font-medium shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                ), __self: this, __source: {fileName: _jsxFileName, lineNumber: 77}}

                , React.createElement(Icon, { className: "h-4.5 w-4.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 87}} )
                , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 88}}, item.label)
                , item.badge > 0 && React.createElement('span', { className: "ml-auto bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center" }, item.badge)
              )
            );
          })
        )
        , React.createElement('div', { className: "p-4 border-t border-border"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 93}}
          , React.createElement('button', {
            onClick: logout,
            className: "flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 94}}

            , React.createElement(LogOut, { className: "h-4.5 w-4.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 98}} )
            , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 99}}, "Sign Out" )
          )
        )
      )

      /* Mobile Nav Drawer Overlay */
      , mobileOpen && (
        React.createElement('div', { 
          className: "fixed inset-0 bg-black/40 z-40 md:hidden"    ,
          onClick: () => setMobileOpen(false), __self: this, __source: {fileName: _jsxFileName, lineNumber: 106}}
        )
      )

      /* Mobile Sidebar */
      , React.createElement('aside', { className: cn(
        "fixed top-0 bottom-0 left-0 w-64 bg-card z-50 border-r border-border transition-transform duration-300 md:hidden flex flex-col",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      ), __self: this, __source: {fileName: _jsxFileName, lineNumber: 113}}
        , React.createElement('div', { className: "p-6 border-b border-border flex items-center justify-between"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 117}}
          , React.createElement('div', { className: "flex items-center space-x-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 118}}
            , business?.logoUrl 
              ? React.createElement('img', { src: getImageUrl(business.logoUrl), alt: business.name, className: "h-7 w-7 rounded-lg object-cover border border-border shrink-0" })
              : React.createElement('img', { src: "/image.png", alt: "LogiSaar Logo", className: "h-7 w-auto object-contain" })
            , React.createElement('span', { className: "text-base font-bold text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 122}}, "Business" )
          )
          , React.createElement('button', { onClick: () => setMobileOpen(false), className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 124}}
            , React.createElement(X, { className: "h-5 w-5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 125}} )
          )
        )
        , React.createElement('nav', { className: "flex-1 p-4 space-y-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 128}}
          , menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              React.createElement(Link, {
                key: item.href,
                to: item.href,
                onClick: () => setMobileOpen(false),
                className: cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground font-medium" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                ), __self: this, __source: {fileName: _jsxFileName, lineNumber: 133}}

                , React.createElement(Icon, { className: "h-4.5 w-4.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 144}} )
                , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 145}}, item.label)
                , item.badge > 0 && React.createElement('span', { className: "ml-auto bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center" }, item.badge)
              )
            );
          })
        )
        , React.createElement('div', { className: "p-4 border-t border-border"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 150}}
          , React.createElement('button', {
            onClick: logout,
            className: "flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 151}}

            , React.createElement(LogOut, { className: "h-4.5 w-4.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 155}} )
            , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 156}}, "Sign Out" )
          )
        )
      )

      /* Main Container */
      , React.createElement('div', { className: "flex-1 flex flex-col min-w-0 bg-background bg-dots pb-20 md:pb-0"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 162}}
        /* Top Navbar */
        , React.createElement('header', { className: "h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 164}}
          , React.createElement('div', { className: "flex items-center space-x-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 165}}
            , React.createElement('button', { 
              className: "text-muted-foreground md:hidden p-1 rounded-lg hover:bg-muted"    , 
              onClick: () => setMobileOpen(true), __self: this, __source: {fileName: _jsxFileName, lineNumber: 166}}

              , React.createElement(Menu, { className: "h-5 w-5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 170}} )
            )
            , React.createElement('h2', { className: "text-sm font-semibold text-muted-foreground hidden sm:block"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 172}}, "Business Portal"

            )
          )
          , React.createElement('div', { className: "flex items-center space-x-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 176}}
            /* Notifications */
            , !isPending && React.createElement('button', {
                onClick: () => {
                  setShowNotifications(true);
                  fetchNotifications();
                },
                className: "relative p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
                __self: this,
                __source: {fileName: _jsxFileName, lineNumber: 178}
              }
              , React.createElement(Bell, { className: "h-4.5 w-4.5" })
              , unreadCount > 0 && (
                  React.createElement('span', { className: "absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary" })
                )
            )
            , React.createElement('div', { className: "h-px bg-border w-4 hidden sm:block"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 182}} )
            /* User avatar */
            , React.createElement('div', { className: "flex items-center space-x-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 184}}
              , React.createElement('div', { className: "h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 text-primary font-bold flex items-center justify-center text-xs"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 185}}
                , _optionalChain([user, 'optionalAccess', _ => _.name, 'optionalAccess', _2 => _2[0], 'optionalAccess', _3 => _3.toUpperCase, 'optionalCall', _4 => _4()])
              )
              , React.createElement('span', { className: "text-xs text-foreground font-semibold hidden md:block"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 188}}
                , _optionalChain([user, 'optionalAccess', _5 => _5.name])
              )
            )
          )
        )

        /* Content Box */
        , React.createElement('main', { className: "flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 196}}
          , React.createElement(Outlet, null)
        )
        /* Notifications Modal Dialog */
        , showNotifications && (
            React.createElement(Dialog, { open: showNotifications, onOpenChange: (open) => !open && setShowNotifications(false) }
              , React.createElement(DialogContent, { className: "max-w-[420px] bg-white border border-border" }
                , React.createElement(DialogHeader, { className: "flex flex-row justify-between items-center pb-2 border-b border-border/60" }
                  , React.createElement('div', null
                    , React.createElement(DialogTitle, { className: "text-base font-bold text-foreground" }, "System Notifications")
                    , React.createElement(DialogDescription, { className: "text-[10px] text-muted-foreground mt-0.5" }, "Alerts and messages sent by Super Admin")
                  )
                  , unreadCount > 0 && (
                      React.createElement(Button, { size: "sm", variant: "ghost", className: "text-[10px] h-7 text-primary hover:text-primary/80 font-bold px-2", onClick: handleMarkAllRead }, "Mark all read")
                    )
                )
                , React.createElement('div', { className: "max-h-[320px] overflow-y-auto space-y-3 py-2 scrollbar-none" }
                  , notifications.length === 0 ? (
                      React.createElement('div', { className: "text-center py-8 text-muted-foreground text-xs" }, "No notifications from administration.")
                    ) : (
                      notifications.map((notif) => (
                        React.createElement('div', { key: notif.id, className: `p-3 rounded-lg border text-xs transition-colors ${notif.isRead ? 'bg-slate-50/50 border-slate-100' : 'bg-primary/5 border-primary/10'}` }
                          , React.createElement('div', { className: "flex justify-between items-start mb-1" }
                            , React.createElement('span', { className: "font-bold text-foreground" }, notif.title)
                            , React.createElement('span', { className: "text-[9px] text-muted-foreground" }, formatDate(notif.createdAt))
                          )
                          , React.createElement('p', { className: "text-muted-foreground leading-relaxed text-[11px]" }, notif.body)
                        )
                      ))
                    )
                )
              )
            )
          )
        /* Mobile Bottom Navigation */
        , !isPending && React.createElement('div', { className: "fixed bottom-0 left-0 right-0 z-40 bg-card/85 backdrop-blur-lg border-t border-border px-2 py-2.5 flex justify-around items-center md:hidden safe-bottom shadow-[0_-4px_12px_rgba(0,0,0,0.05)]" }
          , [
              { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/business" },
              { label: "Branches", icon: MapPin, href: "/dashboard/business/branches" },
              { label: "Rewards", icon: Award, href: "/dashboard/business/rewards" },
              { label: "Coupons", icon: Percent, href: "/dashboard/business/coupons" },
              { label: "Menu", icon: Menu, onClick: () => setMobileOpen(true) }
            ].map((item, idx) => {
              const isActive = item.href ? pathname === item.href : false;
              const Icon = item.icon;
              
              if (item.onClick) {
                return React.createElement('button', {
                  key: idx,
                  onClick: item.onClick,
                  className: "flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 text-muted-foreground hover:text-foreground active:scale-95 min-w-[56px]"
                }
                  , React.createElement(Icon, { className: "h-5 w-5 mb-0.5 stroke-[2px]" })
                  , React.createElement('span', { className: "text-[9px] tracking-tight font-medium" }, item.label)
                );
              }

              return React.createElement(Link, {
                key: item.href,
                to: item.href,
                className: cn(
                  "flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 relative min-w-[56px]",
                  isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                )
              }
                , React.createElement(Icon, { className: cn("h-5 w-5 mb-0.5", isActive ? "stroke-[2.5px]" : "stroke-[2px]") })
                , React.createElement('span', { className: "text-[9px] tracking-tight font-medium" }, item.label)
                , isActive && React.createElement('span', { className: "absolute -bottom-1 w-4 h-1 bg-primary rounded-full" })
              );
            })
          )
      )
    )
  );
}

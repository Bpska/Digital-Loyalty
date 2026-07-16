import { useNavigate, useLocation, Outlet, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
const _jsxFileName = "src\\pages\\(business-admin)\\layout.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }"use client";

import React, { useEffect, useState } from "react";

import { useAuthStore } from "@/store/authStore";
import { 
  LayoutDashboard, 
  MapPin,
  Home,
  QrCode,
  Ticket,
  Settings, 
  Award, 
  Percent, 
  BarChart3,
  LogOut, 
  Menu, 
  X, 
  Bell, 
  ClipboardCheck,
  Settings2,
  Upload,
  Users,
  Palette,
  Coffee,
  Gift,
  Star,
  Wallet,
  Camera,
  UserCheck,
  HelpCircle,
  CreditCard,
  Building2,
  Lock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Globe,
  Plus,
  Trash2,
  Info,
  Loader2
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api, getImageUrl } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { subscribeUserToPush } from "@/lib/pushSubscription";
import Loader from "@/components/Loader";

const BrandIcon = ({ iconName, customUrl, defaultIcon: DefaultIcon, className = "h-5.5 w-5.5" }) => {
  if (customUrl && (customUrl.startsWith("/") || customUrl.startsWith("http"))) {
    return React.createElement("img", {
      src: getImageUrl(customUrl),
      alt: "custom-icon",
      className: `${className} object-contain shrink-0`,
      loading: "lazy"
    });
  }
  const BUILTIN_MAP = {
    coffee: Coffee,
    gift: Gift,
    coupon: Percent,
    star: Star,
    wallet: Wallet,
    membership: Award,
    dashboard: LayoutDashboard,
    notification: Bell
  };
  const IconComponent = BUILTIN_MAP[iconName];
  if (IconComponent) {
    return React.createElement(IconComponent, { className: `${className} shrink-0` });
  }
  return React.createElement(DefaultIcon, { className: `${className} shrink-0` });
};

export default function BusinessAdminLayout({
  children,
}

) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { pathname } = useLocation();
  const { user, loading, logout } = useAuthStore();
  const [authorized, setAuthorized] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profileCategory, setProfileCategory] = useState("Cafe");
  const [profileBookingUrl, setProfileBookingUrl] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  const businessId = _optionalChain([user, 'optionalAccess', _ => _.businessId]);

  const handleOpenProfileModal = () => {
    if (business) {
      setProfileName(business.name || "");
      setProfilePhone(business.phone || "");
      setProfileAddress(business.address || "");
      setProfileCategory(business.category || "Cafe");
      setProfileBookingUrl(business.bookingUrl || "");
    }
    setShowProfileModal(true);
  };

  const handleUpdateProfileDetails = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) {
      alert("Business Name cannot be empty.");
      return;
    }
    setProfileSaving(true);
    try {
      await api.patch(`/businesses/${businessId}`, {
        name: profileName,
        phone: profilePhone || null,
        address: profileAddress || null,
        category: profileCategory || null,
        bookingUrl: profileCategory === "Hotels" ? profileBookingUrl : null,
      });
      await refetchProfile();
      setShowProfileModal(false);
      alert("Business profile updated successfully!");
    } catch (err) {
      alert(err.message || "Failed to update business profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const { data: business, refetch: refetchProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["businessProfile", businessId],
    queryFn: () => api.get(`/businesses/${businessId}`).then((res) => res.data),
    enabled: !!businessId && businessId !== "null" && businessId !== "undefined",
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

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discountType, discountValue, description }
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponApplying(true);
    setCouponError("");
    setAppliedCoupon(null);
    try {
      const res = await api.post("/subscriptions/validate-coupon", { code });
      setAppliedCoupon(res.data);
      await fetchPricing(code);
    } catch (err) {
      setCouponError(err.response?.data?.message || "Invalid coupon code.");
    } finally {
      setCouponApplying(false);
    }
  };

  const getDiscountedTotal = () => {
    return pricing?.totalAmount ?? 0;
  };

  const fetchPricing = async (couponCode = "") => {
    setPricingLoading(true);
    try {
      const url = couponCode ? `/subscriptions/pricing?coupon=${couponCode}` : "/subscriptions/pricing";
      const res = await api.get(url);
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
      const orderRes = await api.post("/subscriptions/create-order", { 
        businessId,
        couponCode: appliedCoupon?.code
      });
      const order = orderRes.data;

      if (order.isFreeUpgrade) {
        alert("You are the Loyal customer");
        await refetchProfile();
        return;
      }

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "ScanLoyal SaaS",
        description: "Launch Year Special — Yearly Subscription",
        image: "/new.png",
        order_id: order.orderId,
        handler: async (response) => {
          try {
            await api.post("/subscriptions/verify-payment", {
              businessId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              couponCode: appliedCoupon?.code,
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
    } catch (err) {
      alert(err.message || "Failed to initiate payment. Please try again.");
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
        couponCode: appliedCoupon?.code,
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

  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemCode, setRedeemCode] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemResult, setRedeemResult] = useState(null);
  const [redeemError, setRedeemError] = useState("");
  const [scanningRedeem, setScanningRedeem] = useState(false);
  const html5QrCodeRedeemRef = React.useRef(null);

  const handleCloseRedeemModal = async () => {
    if (html5QrCodeRedeemRef.current && html5QrCodeRedeemRef.current.isScanning) {
      try {
        await html5QrCodeRedeemRef.current.stop();
      } catch (err) {
        console.error("Failed to stop scanner on close:", err);
      }
    }
    setShowRedeemModal(false);
    setRedeemCode("");
    setRedeemResult(null);
    setRedeemError("");
    setScanningRedeem(false);
  };

  const handleProcessRedeem = async (code) => {
    let codeToRedeem = code || redeemCode;
    if (!codeToRedeem) {
      setRedeemError("Please enter or scan a valid code");
      return;
    }

    if (typeof codeToRedeem === "string" && codeToRedeem.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(codeToRedeem);
        if (parsed.redemptionCode) {
          codeToRedeem = parsed.redemptionCode;
        }
      } catch (e) {
        // Fallback
      }
    }
    setRedeemLoading(true);
    setRedeemError("");
    setRedeemResult(null);
    try {
      // 1. Try to redeem as a loyalty reward first
      const res = await api.post("/checkins/redeem", { redemptionCode: codeToRedeem });
      setRedeemResult({
        type: "reward",
        title: res.data.reward.title,
        customerName: res.data.customerName
      });
      setRedeemCode("");
      queryClient.invalidateQueries(["businessCheckins", businessId]);
      queryClient.invalidateQueries(["businessAnalytics", businessId]);
      queryClient.invalidateQueries(["businessRedemptions", businessId]);
    } catch (err) {
      // 2. If it fails, try applying as a coupon code
      try {
        const couponRes = await api.post("/coupons/admin-apply", {
          code: codeToRedeem.trim(),
          businessId
        });
        setRedeemResult({
          type: "coupon",
          title: couponRes.data.coupon.title,
          customerName: couponRes.data.customer?.name || "Walk-in Customer"
        });
        setRedeemCode("");
        queryClient.invalidateQueries(["couponUsageHistory", businessId]);
        queryClient.invalidateQueries(["businessCoupons", businessId]);
        alert("Your coupon code is applied successfully!");
      } catch (couponErr) {
        // Show original error or coupon error
        const errMsg = couponErr.response?.data?.message || err.response?.data?.message || "Failed to process code. Not a valid reward or coupon.";
        setRedeemError(errMsg);
      }
    } finally {
      setRedeemLoading(false);
    }
  };

  React.useEffect(() => {
    let qrScanner = null;
    let isMounted = true;

    if (showRedeemModal && scanningRedeem) {
      const initScanner = async () => {
        try {
          const { Html5Qrcode } = await import("html5-qrcode");
          if (!isMounted) return;

          const scannerId = "reader-redeem-global";
          qrScanner = new Html5Qrcode(scannerId);
          html5QrCodeRedeemRef.current = qrScanner;

          await qrScanner.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              if (isMounted) {
                qrScanner.stop().then(() => {
                  setScanningRedeem(false);
                  handleProcessRedeem(decodedText);
                }).catch(err => {
                  console.error("Failed to stop scanner on success:", err);
                  setScanningRedeem(false);
                  handleProcessRedeem(decodedText);
                });
              }
            },
            (_errorMessage) => {
              // ignore scan errors
            }
          );
        } catch (err) {
          console.warn("Camera access denied or unavailable:", err?.message || err);
          if (isMounted) {
            setScanningRedeem(false);
            setRedeemError("Camera access denied or unavailable. Please enter the redemption code manually.");
          }
        }
      };
      initScanner();
    }

    return () => {
      isMounted = false;
      if (qrScanner && qrScanner.isScanning) {
        qrScanner.stop().catch(err => console.error("Clean up scanner stop error:", err));
      }
    };
  }, [showRedeemModal, scanningRedeem]);

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
          icon: "/new.png",
          vibrate: [200, 100, 200],
        });
      } catch (e) {
        // Fallback for mobile Chrome/Android where a Service Worker registration is required to show notification
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(title, {
              body,
              icon: "/new.png",
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

      // Auto subscribe user to Web Push notifications (VAPID)
      subscribeUserToPush();

      return () => clearInterval(interval);
    }
  }, [authorized, isPending]);

  const fetchPendingApprovals = React.useCallback(async () => {
    if (!businessId || businessId === "null" || businessId === "undefined" || isPending) return;
    try {
      const res = await api.get(`/loyalty-approval/analytics/${businessId}`);
      setPendingApprovals(res.data?.pendingCount ?? 0);
    } catch (_) {}
  }, [businessId, isPending]);

  React.useEffect(() => {
    fetchPendingApprovals();
    const iv = setInterval(fetchPendingApprovals, 30000);
    return () => clearInterval(iv);
  }, [fetchPendingApprovals]);

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

  if (loading || !authorized || (businessId && businessId !== "null" && businessId !== "undefined" && isProfileLoading)) {
    return (
      React.createElement('div', { className: "flex min-h-screen items-center justify-center bg-background"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 47}}
        , React.createElement(Loader)
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
              , React.createElement('img', { src: "/new.png", alt: "ScanLoyal", className: "h-7 w-auto object-contain" })
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
                  , appliedCoupon && (
                    React.createElement('div', { className: "flex justify-between text-emerald-700 font-bold border-t border-emerald-100 pt-2 mt-1" }
                      , React.createElement('span', null, `Coupon (${appliedCoupon.code}):`)
                      , React.createElement('span', null,
                        appliedCoupon.discountType === "PERCENTAGE"
                          ? `−${appliedCoupon.discountValue}%`
                          : `−₹${appliedCoupon.discountValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                      )
                    )
                  )
                  , React.createElement('div', { className: "flex justify-between text-slate-800 font-black border-t border-[#F0E0D0] pt-2 mt-1 text-sm" }
                    , React.createElement('span', null, "Total Payable:")
                    , React.createElement('span', { className: appliedCoupon ? "text-emerald-700" : "" },
                      "₹", getDiscountedTotal().toLocaleString("en-IN", { minimumFractionDigits: 2 })
                    )
                  )
                )

                /* Coupon Code Input */
                , React.createElement('div', { className: "space-y-2" }
                  , React.createElement('p', { className: "text-[10px] font-black text-[#FF6A00] uppercase tracking-wider" }, "Have a Coupon Code?")
                  , React.createElement('div', { className: "flex gap-2" }
                    , React.createElement('input', {
                        type: "text",
                        value: couponInput,
                        onChange: (e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); },
                        placeholder: "Enter coupon code",
                        disabled: !!appliedCoupon,
                        className: "flex-1 h-9 border border-[#FFD9B3] rounded-xl px-3 text-xs font-mono uppercase bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6A00] disabled:opacity-50 disabled:bg-slate-50"
                      })
                    , appliedCoupon ? (
                        React.createElement('button', {
                            type: "button",
                            onClick: () => { setAppliedCoupon(null); setCouponInput(""); setCouponError(""); fetchPricing(); },
                            className: "h-9 px-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-xs font-bold transition-colors"
                          }, "Remove")
                      ) : (
                        React.createElement('button', {
                            type: "button",
                            onClick: handleApplyCoupon,
                            disabled: !couponInput.trim() || couponApplying,
                            className: "h-9 px-4 rounded-xl bg-[#FF6A00] hover:bg-[#E05E00] text-white text-xs font-bold transition-colors disabled:opacity-50"
                          },
                          couponApplying ? "..." : "Apply"
                        )
                      )
                  )
                  , couponError && React.createElement('p', { className: "text-[10px] text-red-500 font-semibold" }, couponError)
                  , appliedCoupon && React.createElement('p', { className: "text-[10px] text-emerald-700 font-bold" },
                    `✅ Coupon applied! ${appliedCoupon.description || "Discount applied to your total."}`
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
                  , paymentLoading ? "Opening Gateway..." : "Pay ₹" + getDiscountedTotal().toLocaleString("en-IN", { minimumFractionDigits: 2 })
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
    ? [{ label: "Subscription Required", icon: LayoutDashboard, href: "/dashboard/business", iconKey: "dashboardIcon" }]
    : [
        { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/business", iconKey: "dashboardIcon" },
        { label: "Loyalty Approvals", icon: ClipboardCheck, href: "/dashboard/business/approvals", badge: pendingApprovals, iconKey: "redemptionIcon" },
        { label: "Coupons", icon: Percent, href: "/dashboard/business/coupons", iconKey: "couponIcon" },
        { label: "Customer Notifications", icon: Bell, href: "/dashboard/business/notifications", iconKey: "dashboardIcon" },
        { label: "Analytics", icon: BarChart3, href: "/dashboard/business/analytics", iconKey: "dashboardIcon" },
        { label: "Branches", icon: MapPin, href: "/dashboard/business/branches", iconKey: "dashboardIcon" },
        { label: "Loyalty Settings", icon: Settings2, href: "/dashboard/business/loyalty-config", iconKey: "loyaltyIcon" },
        { label: "Settings & Profile", icon: Settings, href: "/dashboard/business/profile", iconKey: "dashboardIcon" },
      ];

  return (
    React.createElement('div', { className: "min-h-screen bg-background flex text-foreground"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 63}}
      /* Desktop Sidebar */
      , React.createElement('aside', { className: "group/sidebar w-16 hover:w-64 border-r border-border bg-card hidden md:flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out overflow-hidden"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 65}}
        , React.createElement('div', { className: "p-4 border-b border-border flex items-center space-x-2 min-w-[256px]"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 66}}
          , business?.logoUrl 
            ? React.createElement('img', { src: getImageUrl(business.logoUrl), alt: business.name, className: "h-7 w-7 rounded-lg object-cover border border-border shrink-0" })
            : React.createElement('img', { src: "/new.png", alt: "LogiSaar Logo", className: "h-7 w-auto object-contain shrink-0" })
          , React.createElement('span', { className: "text-base font-bold text-foreground tracking-tight whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 70}}, "Business" )
        )
        , React.createElement('nav', { className: "flex-1 p-2 space-y-1 overflow-y-auto"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 72}}
          , menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              React.createElement(Link, {
                key: item.href,
                to: item.href,
                title: item.label,
                className: cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 min-w-[240px]",
                  isActive 
                    ? "bg-primary text-primary-foreground font-medium shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                ), __self: this, __source: {fileName: _jsxFileName, lineNumber: 77}}

                , React.createElement(BrandIcon, { iconName: business?.brandAsset?.[item.iconKey], customUrl: business?.brandAsset?.[item.iconKey], defaultIcon: Icon, className: "h-5.5 w-5.5 shrink-0" })
                , React.createElement('span', { className: "whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200", __self: this, __source: {fileName: _jsxFileName, lineNumber: 88}}, item.label)
                , item.badge > 0 && React.createElement('span', { className: "ml-auto bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200" }, item.badge)
              )
            );
          })
        )
        , React.createElement('div', { className: "p-2 border-t border-border"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 93}}
          , React.createElement('button', {
            onClick: logout,
            title: "Sign Out",
            className: "flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors min-w-[240px]"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 94}}

            , React.createElement(LogOut, { className: "h-5.5 w-5.5 shrink-0" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 98}} )
            , React.createElement('span', { className: "whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200", __self: this, __source: {fileName: _jsxFileName, lineNumber: 99}}, "Sign Out" )
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
              : React.createElement('img', { src: "/new.png", alt: "LogiSaar Logo", className: "h-7 w-auto object-contain" })
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

                , React.createElement(BrandIcon, { iconName: business?.brandAsset?.[item.iconKey], customUrl: business?.brandAsset?.[item.iconKey], defaultIcon: Icon, className: "h-5.5 w-5.5 shrink-0" })
                , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 145}}, item.label)
                , item.badge > 0 && React.createElement('span', { className: "ml-auto bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center" }, item.badge)
              )
            );
          })
        )
        , React.createElement('div', { className: "p-4 border-t border-border space-y-1" }
          /* Settings shortcut */
          , React.createElement(Link, {
              to: "/dashboard/business/profile",
              onClick: () => setMobileOpen(false),
              className: "flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            }
            , React.createElement(Settings, { className: "h-5.5 w-5.5" })
            , React.createElement('span', null, "Settings & Profile")
          )
          , React.createElement('button', {
            onClick: logout,
            className: "flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 151}}

            , React.createElement(LogOut, { className: "h-5.5 w-5.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 155}} )
            , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 156}}, "Sign Out" )
          )
        )
      )

      /* Main Container */
      , React.createElement('div', { className: "flex-1 flex flex-col min-w-0 bg-background bg-dots pb-20 md:pb-0 relative overflow-hidden"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 162}}
        /* Background Glows for Orange Glassy Effect */
        , React.createElement('div', { className: "absolute top-1/4 -right-48 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px] pointer-events-none z-0" })
        , React.createElement('div', { className: "absolute bottom-1/4 -left-48 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0" })
        /* Top Navbar */
        , React.createElement('header', { className: "h-14 md:h-16 border-b border-border bg-card/80 backdrop-blur-md hidden md:flex items-center justify-between px-4 md:px-6 sticky top-0 z-30", __self: this, __source: {fileName: _jsxFileName, lineNumber: 164}}
          , React.createElement('div', { className: "flex items-center space-x-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 165}}
            , React.createElement('button', {
              onClick: () => setMobileOpen(true),
              className: "md:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            }
              , React.createElement(Menu, { className: "h-6 w-6" })
            )
            , React.createElement('h2', { className: "text-sm font-semibold text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 172}}, "Business Portal")
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
              , React.createElement(Bell, { className: "h-5.5 w-5.5" })
              , unreadCount > 0 && (
                  React.createElement('span', { className: "absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary" })
                )
            )
            , React.createElement('div', { className: "h-px bg-border w-4 hidden sm:block"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 182}} )
            /* User avatar */
            , React.createElement(Link, { 
                to: "/dashboard/business/profile",
                className: "flex items-center space-x-2 p-1 rounded-lg hover:bg-muted transition-colors outline-none",
                __self: this, 
                __source: {fileName: _jsxFileName, lineNumber: 184}
              }
              , React.createElement('div', { className: "h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 text-primary font-bold flex items-center justify-center text-xs" }
                , _optionalChain([user, 'optionalAccess', _ => _.name, 'optionalAccess', _2 => _2[0], 'optionalAccess', _3 => _3.toUpperCase, 'optionalCall', _4 => _4()])
              )
              , React.createElement('span', { className: "text-xs text-foreground font-semibold hidden md:block" }
                , _optionalChain([user, 'optionalAccess', _5 => _5.name])
              )
            )
          )
        )

        /* Content Box */
        , React.createElement('main', { className: "flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto relative z-10", __self: this, __source: {fileName: _jsxFileName, lineNumber: 196}}
          , React.createElement(Outlet, { context: { setShowNotifications, notifications, unreadCount, fetchNotifications, setShowRedeemModal, setScanningRedeem, fetchPendingApprovals } })
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
        /* Profile Settings Modal Dialog */
        , showProfileModal && (
            React.createElement(Dialog, { open: showProfileModal, onOpenChange: (open) => !open && setShowProfileModal(false) }
              , React.createElement(DialogContent, { className: "max-w-[420px] bg-white border border-border p-6 rounded-2xl text-slate-800" }
                , React.createElement(DialogHeader, { className: "pb-4 border-b border-border/60" }
                  , React.createElement(DialogTitle, { className: "text-base font-bold text-foreground flex items-center gap-2" }
                      , React.createElement(Users, { className: "h-4.5 w-4.5 text-primary" })
                      , "Business Settings & Profile"
                  )
                  , React.createElement(DialogDescription, { className: "text-xs mt-1 text-muted-foreground" }
                    , "Update your business details and view owner credentials"
                  )
                )
                
                , React.createElement('form', { onSubmit: handleUpdateProfileDetails, className: "space-y-4 py-4" }
                  , React.createElement('div', { className: "space-y-1.5" }
                    , React.createElement(Label, { htmlFor: "modal-profile-name", className: "text-xs font-semibold text-muted-foreground" }, "Business Name")
                    , React.createElement(Input, {
                        id: "modal-profile-name",
                        value: profileName,
                        onChange: (e) => setProfileName(e.target.value),
                        placeholder: "e.g. Brews by Pattnaik",
                        className: "text-xs border-border bg-white",
                        required: true
                      })
                  )
                  , React.createElement('div', { className: "space-y-1.5" }
                    , React.createElement(Label, { htmlFor: "modal-profile-phone", className: "text-xs font-semibold text-muted-foreground" }, "Business Phone")
                    , React.createElement(Input, {
                        id: "modal-profile-phone",
                        value: profilePhone,
                        onChange: (e) => setProfilePhone(e.target.value),
                        placeholder: "e.g. +91 99370 XXXXX",
                        className: "text-xs border-border bg-white"
                      })
                  )
                  , React.createElement('div', { className: "space-y-1.5" }
                    , React.createElement(Label, { htmlFor: "modal-profile-address", className: "text-xs font-semibold text-muted-foreground" }, "Business Address")
                    , React.createElement(Input, {
                        id: "modal-profile-address",
                        value: profileAddress,
                        onChange: (e) => setProfileAddress(e.target.value),
                        placeholder: "e.g. MG Road, Bhubaneswar",
                        className: "text-xs border-border bg-white"
                      })
                  )
                  , React.createElement('div', { className: "space-y-1.5" }
                    , React.createElement(Label, { htmlFor: "modal-profile-category", className: "text-xs font-semibold text-muted-foreground" }, "Business Category")
                    , React.createElement('select', {
                        id: "modal-profile-category",
                        value: profileCategory,
                        onChange: (e) => setProfileCategory(e.target.value),
                        className: "w-full h-9 border border-border rounded-md bg-white text-xs px-2.5 outline-none focus:ring-1 focus:ring-primary text-slate-800",
                      },
                        React.createElement('option', { value: "Cafe" }, "Café"),
                        React.createElement('option', { value: "Restaurant" }, "Restaurant"),
                        React.createElement('option', { value: "Salon" }, "Salon"),
                        React.createElement('option', { value: "Retail" }, "Retail"),
                        React.createElement('option', { value: "Bakery" }, "Bakery"),
                        React.createElement('option', { value: "Hotels" }, "Hotels"),
                        React.createElement('option', { value: "Other" }, "Other")
                      )
                  )
                  , profileCategory === "Hotels" && React.createElement('div', { className: "space-y-1.5" }
                    , React.createElement(Label, { htmlFor: "modal-profile-booking-url", className: "text-xs font-semibold text-muted-foreground" }, "Booking Website URL")
                    , React.createElement(Input, {
                        id: "modal-profile-booking-url",
                        type: "url",
                        value: profileBookingUrl,
                        onChange: (e) => setProfileBookingUrl(e.target.value),
                        placeholder: "e.g. https://myhotelbooking.com",
                        className: "text-xs border-border bg-white",
                        required: true
                      })
                  )
                  
                  , React.createElement(Button, { type: "submit", className: "w-full rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-xs mt-2", disabled: profileSaving }
                    , profileSaving ? React.createElement(Loader2, { className: "h-3.5 w-3.5 animate-spin mr-1.5" }) : null
                    , "Save Profile Changes"
                  )
                )

                /* Read-only details / Metadata Block */
                , React.createElement('div', { className: "border-t border-dashed border-border pt-4 space-y-2 text-xs" }
                  , React.createElement('p', { className: "text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2" }, "Account Metadata")
                  , React.createElement('div', { className: "flex justify-between" }
                    , React.createElement('span', { className: "text-muted-foreground" }, "Owner Name:")
                    , React.createElement('span', { className: "font-semibold text-foreground" }, business?.owner?.name || "—")
                  )
                  , React.createElement('div', { className: "flex justify-between" }
                    , React.createElement('span', { className: "text-muted-foreground" }, "Owner Email:")
                    , React.createElement('span', { className: "font-semibold text-foreground" }, business?.owner?.email || "—")
                  )
                  , React.createElement('div', { className: "flex justify-between" }
                    , React.createElement('span', { className: "text-muted-foreground" }, "Owner Phone:")
                    , React.createElement('span', { className: "font-semibold text-foreground font-mono" }, business?.owner?.phone || "—")
                  )
                  , React.createElement('div', { className: "flex justify-between" }
                    , React.createElement('span', { className: "text-muted-foreground" }, "Timezone:")
                    , React.createElement('span', { className: "text-slate-600 font-medium text-right truncate max-w-[150px]" }, business?.timezone || "Asia/Kolkata")
                  )
                  , React.createElement('div', { className: "flex justify-between items-center" }
                    , React.createElement('span', { className: "text-muted-foreground" }, "Business Status:")
                    , React.createElement('span', { className: `text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        business?.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }` }, business?.status || "—")
                  )
                )
              )
            )
          )
        /* Global Scan & Redeem Modal */
        , showRedeemModal && (
          React.createElement(Dialog, { open: showRedeemModal, onOpenChange: (open) => !open && handleCloseRedeemModal() }
            , React.createElement(DialogContent, { className: "max-w-[400px] bg-white border border-border p-6 rounded-3xl text-slate-800" }
              , React.createElement(DialogHeader, { className: "flex flex-col items-center justify-center text-center w-full" }
                , React.createElement(DialogTitle, { className: "text-lg font-extrabold text-foreground" }, "Scan & Redeem")
                , React.createElement(DialogDescription, { className: "text-xs mt-1 text-muted-foreground" }, "Scan the customer's reward or coupon QR code.")
              )
              , React.createElement('div', { className: "space-y-4 py-3" }
                , scanningRedeem
                  ? React.createElement('div', { className: "space-y-3" }
                    , React.createElement('div', { className: "relative w-full aspect-square max-w-[280px] mx-auto rounded-2xl overflow-hidden border-2 border-[#F97316]/40 bg-black flex items-center justify-center" }
                      , React.createElement('div', { id: "reader-redeem-global", className: "absolute inset-0 w-full h-full" })
                      , React.createElement('div', { className: "absolute inset-x-4 top-1/2 h-[2px] bg-[#F97316] animate-pulse z-10" })
                    )
                    , React.createElement(Button, { type: "button", variant: "outline", onClick: () => setScanningRedeem(false), className: "w-full text-xs rounded-xl" }
                      , React.createElement(Camera, { className: "h-3.5 w-3.5 mr-1.5" }), "Use Manual Code Input"
                    )
                  )
                  : React.createElement('div', { className: "space-y-3" }
                    , React.createElement('div', { className: "space-y-1.5" }
                      , React.createElement(Label, { htmlFor: "redeem-code-input", className: "text-xs font-bold text-muted-foreground" }, "Redemption Code")
                      , React.createElement('div', { className: "flex gap-2" }
                        , React.createElement(Input, { id: "redeem-code-input", placeholder: "e.g. A1B2C3D4", value: redeemCode, onChange: (e) => setRedeemCode(e.target.value.toUpperCase()), className: "text-xs border-border bg-white font-mono tracking-wider font-bold" })
                        , React.createElement(Button, { type: "button", onClick: () => handleProcessRedeem(), disabled: redeemLoading, className: "bg-gradient-to-r from-[#FF6A00] to-[#800020] text-white text-xs font-bold rounded-xl" }
                          , redeemLoading ? React.createElement(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : "Redeem"
                        )
                      )
                    )
                    , React.createElement(Button, { type: "button", variant: "outline", onClick: () => { setRedeemError(""); setScanningRedeem(true); }, className: "w-full text-xs py-2 rounded-xl border border-[#F97316]/40 hover:bg-[#F97316]/5 flex items-center justify-center gap-1.5 text-[#F97316] font-bold" }
                      , React.createElement(Camera, { className: "h-4 w-4" })
                      , "Back to Scanner"
                    )
                  )
                , redeemResult && (
                  React.createElement('div', { className: "rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800 space-y-1" }
                    , React.createElement('p', { className: "font-bold" }, redeemResult.type === "coupon" ? "✅ Coupon Applied Successfully!" : "✅ Redemption Successful!")
                    , React.createElement('p', null, redeemResult.type === "coupon" ? "Coupon: " : "Voucher: ", React.createElement('strong', null, redeemResult.title))
                    , React.createElement('p', null, "Customer: ", React.createElement('strong', null, redeemResult.customerName))
                  )
                )
                , redeemError && (
                  React.createElement('div', { className: "rounded-2xl bg-red-50 border border-red-200 p-4 text-xs text-red-800 font-medium" }
                    , redeemError
                  )
                )
              )
              , React.createElement(DialogFooter, { className: "pt-2" }
                , React.createElement(Button, { type: "button", variant: "outline", onClick: handleCloseRedeemModal, className: "w-full text-xs rounded-xl" }, "Close")
              )
            )
          )
        )
        /* Mobile Bottom Navigation - ScanLoyal Premium Style */
        , !isPending && React.createElement('div', { className: "fixed bottom-0 left-0 right-0 z-40 md:hidden" }
          , React.createElement('div', { className: "bg-white/95 backdrop-blur-xl border-t border-[#F1F5F9] shadow-[0_-4px_24px_rgba(0,0,0,0.06)]" }
            , React.createElement('div', { className: "flex justify-around items-end px-2 pt-2 pb-safe pb-2" }
              /* Dashboard */
              , React.createElement(Link, { to: "/dashboard/business", className: "flex flex-col items-center gap-1 py-1 px-3 min-w-[56px]" }
                , React.createElement('div', { className: cn("flex items-center justify-center w-12 h-7 rounded-full transition-all", pathname === "/dashboard/business" ? "bg-[#FFF0E6]" : "bg-transparent") }
                  , React.createElement(Home, { className: cn("h-6 w-6 transition-colors", pathname === "/dashboard/business" ? "text-[#F97316]" : "text-[#94A3B8]") })
                )
                , React.createElement('span', { className: cn("text-[10px] font-semibold transition-colors", pathname === "/dashboard/business" ? "text-[#F97316]" : "text-[#94A3B8]") }, "Dashboard")
              )
              /* Approvals */
              , React.createElement(Link, { to: "/dashboard/business/approvals", className: "flex flex-col items-center gap-1 py-1 px-3 min-w-[56px] relative" }
                , React.createElement('div', { className: cn("flex items-center justify-center w-12 h-7 rounded-full transition-all", pathname === "/dashboard/business/approvals" ? "bg-[#FFF0E6]" : "bg-transparent") }
                  , React.createElement(ClipboardCheck, { className: cn("h-6 w-6 transition-colors", pathname === "/dashboard/business/approvals" ? "text-[#F97316]" : "text-[#94A3B8]") })
                  , pendingApprovals > 0 && React.createElement('span', { className: "absolute top-0 right-1 bg-amber-500 text-white text-[8px] font-black h-3.5 min-w-[14px] flex items-center justify-center px-1 rounded-full shadow-sm" }, pendingApprovals)
                )
                , React.createElement('span', { className: cn("text-[10px] font-semibold transition-colors", pathname === "/dashboard/business/approvals" ? "text-[#F97316]" : "text-[#94A3B8]") }, "Approvals")
              )
              /* CENTER — Scan (raised floating button) */
              , React.createElement('div', { className: "flex flex-col items-center -mt-5" }
                , React.createElement('button', {
                    onClick: () => {
                      setShowRedeemModal(true);
                      setScanningRedeem(true);
                      setRedeemError("");
                      setRedeemResult(null);
                    },
                    className: "w-14 h-14 rounded-full bg-[#F97316] flex items-center justify-center shadow-lg shadow-[#F97316]/40 active:scale-95 transition-transform border-4 border-white"
                  }
                  , React.createElement(QrCode, { className: "h-7 w-7 text-white" })
                )
                , React.createElement('span', { className: "text-[10px] font-semibold text-[#94A3B8] mt-1" }, "Scan")
              )
              /* Coupons */
              , React.createElement(Link, { to: "/dashboard/business/coupons", className: "flex flex-col items-center gap-1 py-1 px-3 min-w-[56px]" }
                , React.createElement('div', { className: cn("flex items-center justify-center w-12 h-7 rounded-full transition-all", pathname === "/dashboard/business/coupons" ? "bg-[#FFF0E6]" : "bg-transparent") }
                  , React.createElement(Ticket, { className: cn("h-6 w-6 transition-colors", pathname === "/dashboard/business/coupons" ? "text-[#F97316]" : "text-[#94A3B8]") })
                )
                , React.createElement('span', { className: cn("text-[10px] font-semibold transition-colors", pathname === "/dashboard/business/coupons" ? "text-[#F97316]" : "text-[#94A3B8]") }, "Coupons")
              )
              /* Profile */
              , React.createElement(Link, { to: "/dashboard/business/profile", className: "flex flex-col items-center gap-1 py-1 px-3 min-w-[56px]" }
                , React.createElement('div', { className: cn("flex items-center justify-center w-12 h-7 rounded-full transition-all", pathname === "/dashboard/business/profile" ? "bg-[#FFF0E6]" : "bg-transparent") }
                  , React.createElement(Settings, { className: cn("h-6 w-6 transition-colors", pathname === "/dashboard/business/profile" ? "text-[#F97316]" : "text-[#94A3B8]") })
                )
                , React.createElement('span', { className: cn("text-[10px] font-semibold transition-colors", pathname === "/dashboard/business/profile" ? "text-[#F97316]" : "text-[#94A3B8]") }, "Profile")
              )
            )
          )
        )
      )
    )
  );
}


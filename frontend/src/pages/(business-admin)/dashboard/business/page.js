import { Link } from "react-router-dom";
const _jsxFileName = "src\\pages\\(business-admin)\\dashboard\\business\\page.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } "use client";

import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  Loader2,
  Upload,
  Scan,
  QrCode,
  Camera
} from "lucide-react";
import { formatDate } from "@/lib/utils";
export default function BusinessDashboard() {
  const { user } = useAuthStore();
  const businessId = _optionalChain([user, 'optionalAccess', _ => _.businessId]);
  const [statusLoading, setStatusLoading] = React.useState({});

  const logoInputRef = React.useRef(null);
  const [logoUploading, setLogoUploading] = React.useState(false);

  const [bizType, setBizType] = React.useState("");
  const [revGoogleUrl, setRevGoogleUrl] = React.useState("");
  const [revInstagramUrl, setRevInstagramUrl] = React.useState("");
  const [revFacebookUrl, setRevFacebookUrl] = React.useState("");
  const [revSaving, setRevSaving] = React.useState(false);
  const [googleBusinessName, setGoogleBusinessName] = React.useState("");
  const [googlePlaceId, setGooglePlaceId] = React.useState("");
  const [googleSearchQuery, setGoogleSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);
  const [searchingPlaces, setSearchingPlaces] = React.useState(false);

  const handleSearchPlaces = async () => {
    if (!googleSearchQuery.trim()) {
      alert("Please enter a business name to search.");
      return;
    }
    setSearchingPlaces(true);
    setSearchResults([]);
    try {
      const res = await api.get(`/reviews/search-places/${businessId}?query=${encodeURIComponent(googleSearchQuery)}`);
      setSearchResults(res.data || []);
      if ((res.data || []).length === 0) {
        alert("No listings found. Try adjusting your search query.");
      }
    } catch (err) {
      alert(err.message || "Failed to search Google listings.");
    } finally {
      setSearchingPlaces(false);
    }
  };

  const queryClient = useQueryClient();
  const [showRedeemModal, setShowRedeemModal] = React.useState(false);
  const [redeemCode, setRedeemCode] = React.useState("");
  const [redeemLoading, setRedeemLoading] = React.useState(false);
  const [redeemResult, setRedeemResult] = React.useState(null);
  const [redeemError, setRedeemError] = React.useState("");
  const [scanningRedeem, setScanningRedeem] = React.useState(false);
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
    const codeToRedeem = code || redeemCode;
    if (!codeToRedeem) {
      setRedeemError("Please enter or scan a valid code");
      return;
    }
    setRedeemLoading(true);
    setRedeemError("");
    setRedeemResult(null);
    try {
      const res = await api.post("/checkins/redeem", { redemptionCode: codeToRedeem });
      setRedeemResult(res.data);
      setRedeemCode("");
      queryClient.invalidateQueries(["businessCheckins", businessId]);
      queryClient.invalidateQueries(["businessAnalytics", businessId]);
      refetchCheckins();
    } catch (err) {
      setRedeemError(err.response?.data?.message || err.message || "Failed to redeem reward. Please check the code and try again.");
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

          const scannerId = "reader-redeem";
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
          console.error("Failed to start camera scanner:", err);
          if (isMounted) {
            setScanningRedeem(false);
            setRedeemError("Camera access denied or unavailable. Please enter the redemption code manually.");
          }
        }
      };

      const timer = setTimeout(initScanner, 100);
      return () => {
        clearTimeout(timer);
        isMounted = false;
        if (qrScanner && qrScanner.isScanning) {
          qrScanner.stop().catch((err) => console.error("Error stopping scanner on cleanup:", err));
        }
      };
    }
  }, [showRedeemModal, scanningRedeem]);

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
    enabled: !!businessId && businessId !== "null" && businessId !== "undefined",
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

  React.useEffect(() => {
    if (businessId && businessId !== "null" && businessId !== "undefined") {
      api.get(`/reviews/settings/${businessId}`)
        .then((res) => {
          if (res && res.data) {
            setBizType(res.data.businessType || "");
            setRevGoogleUrl(res.data.googleReviewUrl || "");
            setRevInstagramUrl(res.data.instagramUrl || "");
            setRevFacebookUrl(res.data.facebookUrl || "");
            setGoogleBusinessName(res.data.googleBusinessName || "");
            setGooglePlaceId(res.data.googlePlaceId || "");
          }
        })
        .catch((err) => {
          console.error("Failed to fetch review settings:", err);
        });
    }
  }, [businessId]);

  const handleSaveReviewSettings = async (e) => {
    e.preventDefault();
    setRevSaving(true);
    try {
      const response = await api.post(`/reviews/settings/${businessId}`, {
        businessType: bizType || null,
        googleReviewUrl: revGoogleUrl || null,
        instagramUrl: revInstagramUrl || null,
        facebookUrl: revFacebookUrl || null,
        googleBusinessName: googleBusinessName || null,
        googlePlaceId: googlePlaceId || null,
      });
      const updated = response?.data;
      if (updated) {
        setBizType(updated.businessType || "");
        setRevGoogleUrl(updated.googleReviewUrl || "");
        setRevInstagramUrl(updated.instagramUrl || "");
        setRevFacebookUrl(updated.facebookUrl || "");
        setGoogleBusinessName(updated.googleBusinessName || "");
        setGooglePlaceId(updated.googlePlaceId || "");
      }
      await refetchProfile();
      alert("AI Review settings saved successfully!");
    } catch (err) {
      alert(err.message || "Failed to save AI Review settings.");
    } finally {
      setRevSaving(false);
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
          image: "/new.png",
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
    enabled: !!businessId && businessId !== "null" && businessId !== "undefined",
  });

  // 3. Fetch recent check-ins
  const { data: checkinsData, isLoading: checkinsLoading, isFetching: checkinsFetching, refetch: refetchCheckins } = useQuery({
    queryKey: ["businessCheckins", businessId],
    queryFn: () => api.get(`/checkins/business/${businessId}?limit=5`).then((res) => res.data),
    enabled: !!businessId && businessId !== "null" && businessId !== "undefined",
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
          , React.createElement('div', {
              onClick: () => logoInputRef.current?.click(),
              className: "relative group w-16 h-16 shrink-0 rounded-2xl border-2 border-border shadow-md overflow-hidden bg-slate-50 flex items-center justify-center cursor-pointer"
            }
            , logoUploading ? (
                React.createElement(Loader2, { className: "h-6 w-6 animate-spin text-primary" })
              ) : (
                React.createElement(React.Fragment, null
                  , React.createElement('img', {
                      src: getImageUrl(business?.logoUrl) || "/new.png",
                      alt: business?.name || "Logo",
                      className: "w-full h-full object-cover group-hover:opacity-60 transition-opacity"
                    })
                  , React.createElement('div', {
                      className: "absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                    }
                    , React.createElement(Upload, { className: "h-4 w-4 text-white mb-1" })
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
        , React.createElement('div', { className: "flex flex-wrap gap-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 132 } }
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
          , React.createElement(Button, {
              onClick: () => {
                setShowRedeemModal(true);
                setScanningRedeem(true);
              },
              size: "sm",
              className: "bg-gradient-to-r from-[#FF6A00] to-[#FF8E3C] hover:from-[#FF6A00] hover:to-[#FF8E3C] text-white shadow-md shadow-[#FF6A00]/25 font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
            },
              React.createElement(Scan, { className: "mr-2 h-4 w-4" }), " Scan & Redeem"
            )
          , React.createElement(Button, { variant: "outline", size: "sm", onClick: handleOpenSocialModal },
              "🔗 Social Links"
            )
        )
      )

      /* Main KPI Stats Grid */
      , React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 145 } }
        , React.createElement(Link, { to: "/dashboard/business/analytics", className: "block cursor-pointer hover:scale-[1.02] transition-transform duration-200" }
          , React.createElement(Card, { className: "glass hover:shadow-md transition-shadow h-full", glass: true }
            , React.createElement(CardHeader, { className: "flex flex-row items-center justify-between pb-2" }
              , React.createElement(CardDescription, { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground" }, "Total Customers")
              , React.createElement(Users, { className: "h-5 w-5 text-primary" })
            )
            , React.createElement(CardContent, null
              , React.createElement('span', { className: "text-3xl font-extrabold text-foreground" }, _optionalChain([analytics, 'optionalAccess', _3 => _3.totalCustomers]) ?? 1)
              , React.createElement('p', { className: "text-[10px] text-muted-foreground mt-1" }, "Unique visitor registry count")
            )
          )
        )

        , React.createElement(Link, { to: "/dashboard/business/checkins", className: "block cursor-pointer hover:scale-[1.02] transition-transform duration-200" }
          , React.createElement(Card, { className: "glass hover:shadow-md transition-shadow h-full", glass: true }
            , React.createElement(CardHeader, { className: "flex flex-row items-center justify-between pb-2" }
              , React.createElement(CardDescription, { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground" }, "Verified Check-Ins")
              , React.createElement(UserCheck, { className: "h-5 w-5 text-emerald-600" })
            )
            , React.createElement(CardContent, null
              , React.createElement('span', { className: "text-3xl font-extrabold text-foreground" }, _optionalChain([analytics, 'optionalAccess', _4 => _4.totalCheckIns]) ?? 2)
              , React.createElement('p', { className: "text-[10px] text-emerald-600 flex items-center gap-1 mt-1 font-semibold" }
                , React.createElement(TrendingUp, { className: "h-3 w-3" }), " +", _optionalChain([analytics, 'optionalAccess', _5 => _5.checkInsToday]) ?? 2, " check-ins today"
              )
            )
          )
        )

        , React.createElement(Link, { to: "/dashboard/business/analytics", className: "block cursor-pointer hover:scale-[1.02] transition-transform duration-200" }
          , React.createElement(Card, { className: "glass hover:shadow-md transition-shadow h-full", glass: true }
            , React.createElement(CardHeader, { className: "flex flex-row items-center justify-between pb-2" }
              , React.createElement(CardDescription, { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground" }, "Repeat Rate")
              , React.createElement(Zap, { className: "h-5 w-5 text-indigo-600" })
            )
            , React.createElement(CardContent, null
              , React.createElement('span', { className: "text-3xl font-extrabold text-foreground" }, _optionalChain([analytics, 'optionalAccess', _6 => _6.repeatRate]) ?? 100, "%")
              , React.createElement('p', { className: "text-[10px] text-muted-foreground mt-1" }, "Customers with >1 visit profile")
            )
          )
        )

        , React.createElement(Link, { to: "/dashboard/business/approvals", className: "block cursor-pointer hover:scale-[1.02] transition-transform duration-200" }
          , React.createElement(Card, { className: "glass hover:shadow-md transition-shadow h-full", glass: true }
            , React.createElement(CardHeader, { className: "flex flex-row items-center justify-between pb-2" }
              , React.createElement(CardDescription, { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground" }, "Reward Conversions")
              , React.createElement(Gift, { className: "h-5 w-5 text-primary" })
            )
            , React.createElement(CardContent, null
              , React.createElement('span', { className: "text-3xl font-extrabold text-foreground" }, _optionalChain([analytics, 'optionalAccess', _7 => _7.redemptionRate]) ?? 0, "%")
              , React.createElement('p', { className: "text-[10px] text-muted-foreground mt-1" }
                , _optionalChain([analytics, 'optionalAccess', _8 => _8.totalRewardsRedeemed]) ?? 0, " of ", _optionalChain([analytics, 'optionalAccess', _9 => _9.totalRewardsIssued]) ?? 0, " redeemed"
              )
            )
          )
        )
      )

      /* Main Panels Section */
      , React.createElement('div', { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 items-start" }

        /* Left Column: Subscription & Limits */
        , React.createElement('div', { className: "space-y-6" }
          , React.createElement(Card, { className: "glass", glass: true }
            , React.createElement(CardHeader, { className: "p-6" }
              , React.createElement(CardTitle, { className: "text-base font-bold text-foreground flex items-center gap-2" }
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
                className: "w-full bg-primary hover:bg-primary/95 text-white shadow-sm font-semibold text-xs mt-2 rounded-full"
              }, "Upgrade / Purchase Plan")
            )
          )
        )

        /* Right Column: AI Review Settings & QR */
        , React.createElement('div', { className: "space-y-6" }
          /* AI Review Generator Settings Card */
          , React.createElement(Card, { className: "glass", glass: true }
            , React.createElement(CardHeader, { className: "p-6" }
              , React.createElement(CardTitle, { className: "text-base font-bold text-foreground flex items-center gap-2" }
                , "⭐ AI Review Settings"
              )
              , React.createElement(CardDescription, { className: "text-xs text-muted-foreground" }, "Configure options for AI review generation and customer social links")
            )
            , React.createElement(CardContent, { className: "p-6 pt-0 space-y-4" }
              , React.createElement('form', { onSubmit: handleSaveReviewSettings, className: "space-y-4" }
                
                // Google Places Integrator Search Panel
                , React.createElement('div', { className: "bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/60 space-y-3 mb-2" }
                  , React.createElement('div', { className: "flex justify-between items-center" }
                    , React.createElement('h4', { className: "text-xs font-bold text-indigo-900" }, "🔍 Google Place Finder")
                    , React.createElement('span', { className: "text-[9px] text-indigo-600 bg-indigo-100 font-semibold px-2 py-0.5 rounded-full" }, "Auto Review Link")
                  )
                  , React.createElement('p', { className: "text-[10px] text-indigo-700 leading-normal" }, "Enter your shop/brand name to locate your Google listing and automatically generate a direct review link.")
                  , React.createElement('div', { className: "flex gap-2" }
                    , React.createElement(Input, {
                        value: googleSearchQuery,
                        onChange: (e) => setGoogleSearchQuery(e.target.value),
                        placeholder: "e.g. Starbucks Cafe",
                        className: "text-xs border-indigo-200 bg-white flex-1"
                      })
                    , React.createElement(Button, {
                        type: "button",
                        onClick: handleSearchPlaces,
                        disabled: searchingPlaces,
                        className: "bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg px-3"
                      }
                      , searchingPlaces ? "Searching..." : "Search"
                    )
                  )
                  , searchResults.length > 0 && React.createElement('div', { className: "space-y-1.5 bg-white border border-indigo-100 p-2 rounded-lg max-h-[160px] overflow-y-auto" }
                    , React.createElement('p', { className: "text-[9px] font-bold text-indigo-500 uppercase tracking-wider mb-1" }, "Search results:")
                    , searchResults.map((place) =>
                        React.createElement('div', {
                          key: place.placeId,
                          className: "flex justify-between items-center p-2 rounded hover:bg-indigo-50 transition-colors text-left text-xs border-b border-slate-50 last:border-b-0 gap-2"
                        }
                          , React.createElement('div', { className: "min-w-0" }
                            , React.createElement('p', { className: "font-bold text-slate-800 truncate text-[11px]" }, place.name)
                            , React.createElement('p', { className: "text-[9px] text-slate-500 truncate" }, place.formattedAddress)
                          )
                          , React.createElement(Button, {
                              type: "button",
                              size: "xs",
                              onClick: () => {
                                setGooglePlaceId(place.placeId);
                                setGoogleBusinessName(place.name);
                                setRevGoogleUrl(`https://search.google.com/local/writereview?placeid=${place.placeId}`);
                                setSearchResults([]);
                                alert(`Listing verified! Google Place ID set to "${place.placeId}". Click Save below to apply.`);
                              },
                              className: "bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold h-6 rounded-md px-2 shrink-0"
                            }, "Confirm")
                        )
                      )
                    )
                  , googlePlaceId && React.createElement('div', { className: "text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-100 p-2 rounded-lg flex items-center justify-between" }
                      , React.createElement('span', { className: "truncate flex-1 mr-2" }, `✓ Matched: ${googleBusinessName}`)
                      , React.createElement('button', {
                          type: "button",
                          onClick: () => {
                            setGooglePlaceId("");
                            setGoogleBusinessName("");
                          },
                          className: "text-[9px] text-red-500 hover:underline font-bold shrink-0"
                        }, "Clear")
                    )
                )

                , React.createElement('div', { className: "space-y-1.5" }
                  , React.createElement(Label, { htmlFor: "review-biz-type", className: "text-xs font-semibold text-muted-foreground" }, "Business Type")
                  , React.createElement(Input, {
                      id: "review-biz-type",
                      value: bizType,
                      onChange: (e) => setBizType(e.target.value),
                      placeholder: "e.g. Cafe, Restaurant, Salon",
                      className: "text-xs border-border bg-white"
                    })
                )
                , React.createElement('div', { className: "space-y-1.5" }
                  , React.createElement(Label, { htmlFor: "review-google-url", className: "text-xs font-semibold text-muted-foreground" }, "Google Review Link")
                  , React.createElement(Input, {
                      id: "review-google-url",
                      value: revGoogleUrl,
                      onChange: (e) => setRevGoogleUrl(e.target.value),
                      placeholder: "https://g.page/r/...",
                      className: "text-xs border-border bg-white"
                    })
                )
                , React.createElement('div', { className: "space-y-1.5" }
                  , React.createElement(Label, { htmlFor: "review-instagram-url", className: "text-xs font-semibold text-muted-foreground" }, "Instagram Link")
                  , React.createElement(Input, {
                      id: "review-instagram-url",
                      value: revInstagramUrl,
                      onChange: (e) => setRevInstagramUrl(e.target.value),
                      placeholder: "https://instagram.com/...",
                      className: "text-xs border-border bg-white"
                    })
                )
                , React.createElement('div', { className: "space-y-1.5" }
                  , React.createElement(Label, { htmlFor: "review-facebook-url", className: "text-xs font-semibold text-muted-foreground" }, "Facebook Link")
                  , React.createElement(Input, {
                      id: "review-facebook-url",
                      value: revFacebookUrl,
                      onChange: (e) => setRevFacebookUrl(e.target.value),
                      placeholder: "https://facebook.com/...",
                      className: "text-xs border-border bg-white"
                    })
                )
                , React.createElement(Button, { type: "submit", className: "w-full rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-xs mt-2", disabled: revSaving }
                  , revSaving ? React.createElement(Loader2, { className: "h-3.5 w-3.5 animate-spin mr-1.5" }) : null
                  , "Save Review Settings"
                )
              )
            )
          )

          // Google Review Link & QR Code Card
          , revGoogleUrl && React.createElement(Card, { className: "border-border bg-white shadow-sm rounded-xl" }
            , React.createElement(CardHeader, { className: "p-6 pb-2" }
              , React.createElement(CardTitle, { className: "text-base font-bold text-[#FF6A00] flex items-center gap-2" }
                , React.createElement(QrCode, { className: "h-4 w-4" })
                , "Google Review QR Code"
              )
              , React.createElement(CardDescription, { className: "text-xs text-muted-foreground" }, "Show this QR code at your checkout counter to collect reviews")
            )
            , React.createElement(CardContent, { className: "p-6 pt-2 flex flex-col items-center text-center space-y-4" }
              , React.createElement('div', { className: "rounded-xl border border-dashed border-indigo-100 bg-slate-50/50 p-4 shadow-sm" }
                , React.createElement('img', {
                    src: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=0f172a&data=${encodeURIComponent(revGoogleUrl)}`,
                    alt: "Google Review QR Code",
                    className: "h-36 w-36 shadow-sm border border-slate-100 rounded-lg bg-white"
                  })
              )
              , React.createElement('div', { className: "w-full space-y-1.5" }
                , React.createElement('span', { className: "text-[9px] text-muted-foreground uppercase tracking-widest font-bold" }, "Direct Review Link")
                , React.createElement('input', {
                    readOnly: true,
                    value: revGoogleUrl,
                    className: "w-full text-[10px] font-mono select-all bg-slate-50 border border-border p-2 rounded-lg text-center"
                  })
              )
              , React.createElement(Button, {
                  type: "button",
                  variant: "outline",
                  onClick: () => {
                    navigator.clipboard.writeText(revGoogleUrl);
                    alert("Google Review Link copied to clipboard!");
                  },
                  className: "w-full rounded-full border-[#FF6A00] text-[#FF6A00] hover:bg-orange-50 font-bold text-xs"
                }, "Copy Review Link")
            )
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
                  , React.createElement('img', { src: "/new.png", alt: "ScanLoyal", className: "h-6 w-auto object-contain brightness-0 invert" })
                  , React.createElement('span', { className: "text-xs font-black uppercase tracking-widest opacity-80" }, "ScanLoyal")
                )
                , React.createElement('h2', { className: "text-xl font-black tracking-tight mt-2" }, "Launch Year Special")
                , React.createElement('p', { className: "text-xs opacity-80 mt-0.5" }, "Secure yearly subscription · Razorpay Gateway")
              )
            )

            , React.createElement('div', { className: "px-6 py-5 space-y-4" }
              , business?.status === 'ACTIVE' ? (
                  React.createElement('div', { className: "space-y-4 text-center py-4" }
                    , React.createElement('div', { className: "h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto" }
                      , React.createElement(Zap, { className: "h-6 w-6" })
                    )
                    , React.createElement('div', { className: "space-y-1.5" }
                      , React.createElement('h3', { className: "text-base font-extrabold text-foreground" }, "Launch Year Special Plan")
                      , React.createElement('p', { className: "text-xs text-muted-foreground" }, "You are currently on the Launch Year Special plan (₹999/mo) and your account status is ACTIVE.")
                    )
                    , React.createElement('div', { className: "rounded-2xl border border-[#D0E2FF] bg-[#EDF5FF] p-4 text-xs text-[#002D9C] leading-relaxed text-left" }
                      , "To upgrade to a higher tier plan with custom outlets/capacity, please contact Customer Support at "
                      , React.createElement('strong', { className: "text-[#001D6C]" }, "support@logisaar.in")
                      , "."
                    )
                    , React.createElement(Button, { className: "w-full rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-xs mt-2", onClick: () => setShowUpgradeModal(false) }, "Close")
                  )
                ) : pricingLoading ? (
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
      /* Scan & Redeem QR Modal */
      , showRedeemModal && (
        React.createElement(Dialog, { open: showRedeemModal, onOpenChange: (open) => !open && handleCloseRedeemModal() }
          , React.createElement(DialogContent, { className: "max-w-[400px] bg-white border border-border p-6 rounded-3xl text-slate-800" }
            , React.createElement(DialogHeader, { className: "flex flex-col items-center justify-center text-center w-full" }
              , React.createElement(DialogTitle, { className: "text-lg font-extrabold text-foreground" }, "Scan & Redeem Reward")
              , React.createElement(DialogDescription, { className: "text-xs mt-1 text-muted-foreground" }, "Scan the customer's reward QR code or enter the code manually.")
            )
            , React.createElement('div', { className: "space-y-4 py-3" }
              
              /* Camera / Scanner container */
              , scanningRedeem ? (
                  React.createElement('div', { className: "space-y-3" }
                    , React.createElement('div', { className: "relative w-full aspect-square max-w-[280px] mx-auto rounded-2xl overflow-hidden border-2 border-[#FF6A00]/40 bg-black flex items-center justify-center" }
                      , React.createElement('div', { id: "reader-redeem", className: "absolute inset-0 w-full h-full" })
                      , React.createElement('div', { className: "absolute inset-x-4 top-1/2 h-[2px] bg-[#FF6A00] animate-pulse z-10" })
                    )
                    , React.createElement(Button, {
                        type: "button",
                        variant: "outline",
                        onClick: () => setScanningRedeem(false),
                        className: "w-full text-xs rounded-xl"
                      }
                      , React.createElement(Camera, { className: "h-3.5 w-3.5 mr-1.5" })
                      , "Use Manual Code Input"
                    )
                  )
                ) : (
                  React.createElement('div', { className: "space-y-3" }
                    , React.createElement(Button, {
                        type: "button",
                        variant: "outline",
                        onClick: () => {
                          setRedeemError("");
                          setScanningRedeem(true);
                        },
                        className: "w-full text-xs py-5 rounded-2xl border-2 border-dashed border-[#FF6A00]/40 hover:bg-[#FF6A00]/5 flex items-center justify-center gap-2"
                      }
                      , React.createElement(Scan, { className: "h-5 w-5 text-[#FF6A00]" })
                      , React.createElement('span', { className: "font-bold text-[#FF6A00]" }, "Start Camera Scanner")
                    )
                  )
                )

              /* Manual entry input and status alerts */
              , !scanningRedeem && React.createElement('div', { className: "space-y-3" }
                  , React.createElement('div', { className: "space-y-1.5" }
                    , React.createElement(Label, { htmlFor: "redeem-code-input", className: "text-xs font-bold text-muted-foreground" }, "Redemption Code")
                    , React.createElement('div', { className: "flex gap-2" }
                      , React.createElement(Input, {
                          id: "redeem-code-input",
                          placeholder: "e.g. A1B2C3D4",
                          value: redeemCode,
                          onChange: (e) => setRedeemCode(e.target.value.toUpperCase()),
                          className: "text-xs border-border bg-white font-mono tracking-wider font-bold"
                        })
                      , React.createElement(Button, {
                          type: "button",
                          onClick: () => handleProcessRedeem(),
                          disabled: redeemLoading,
                          className: "bg-gradient-to-r from-[#FF6A00] to-[#800020] hover:from-[#FF8E3C] hover:to-[#FF6A00] text-white text-xs font-bold rounded-xl border-0 shadow-sm transition-all duration-300"
                        }
                        , redeemLoading ? React.createElement(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : "Redeem"
                      )
                    )
                  )
                )

              /* Success outcome screen */
              , redeemResult && (
                  React.createElement('div', { className: "rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800 space-y-1" }
                    , React.createElement('div', { className: "flex items-center gap-2 font-bold text-emerald-950" }
                      , React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 text-emerald-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }
                        , React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" })
                      )
                      , "Redemption Successful!"
                    )
                    , React.createElement('p', null, `Reward: `, React.createElement('strong', null, redeemResult.reward.title))
                    , React.createElement('p', null, `Customer: `, React.createElement('strong', null, redeemResult.customerName))
                  )
                )

              /* Error outcome screen */
              , redeemError && (
                  React.createElement('div', { className: "rounded-2xl bg-red-50 border border-red-200 p-4 text-xs text-red-800 font-medium" }
                    , redeemError
                  )
                )
            )
            , React.createElement(DialogFooter, { className: "pt-2" }
              , React.createElement(Button, {
                  type: "button",
                  variant: "outline",
                  onClick: handleCloseRedeemModal,
                  className: "w-full text-xs rounded-xl"
                }
                , "Close"
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

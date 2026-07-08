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
  UserPlus,
  Gift,
  TrendingUp,
  Calendar,
  AlertCircle,
  Loader2,
  Upload,
  Scan,
  QrCode,
  Camera,
  Award,
  Clock,
  Coffee,
  Percent,
  Star,
  Wallet,
  Bell,
  LayoutDashboard,
  Home,
  ShieldCheck,
  Tag,
  ChevronDown,
  Ticket,
  ScanLine
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatDate } from "@/lib/utils";

const BrandIcon = ({ iconName, customUrl, defaultIcon: DefaultIcon, className = "h-5 w-5" }) => {
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
export default function BusinessDashboard() {
  const { user } = useAuthStore();
  const businessId = _optionalChain([user, 'optionalAccess', _ => _.businessId]);
  const [statusLoading, setStatusLoading] = React.useState({});

  // Onboarding tour state
  const [onboardingStep, setOnboardingStep] = React.useState(0);
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  const onboardingSteps = [
    {
      title: "Welcome to your Digital Loyalty Portal! 🎉",
      description: "We are thrilled to help you grow your business. Let's take a quick 1-minute tour of your dashboard features.",
      icon: Gift,
      color: "from-amber-500 to-orange-500",
    },
    {
      title: "Step 1: Loyalty Stamp Setup & Approvals ⚡",
      description: "Set up stamp cost guidelines in the Configuration page, then approve customer visits inside the 'Loyalty Approvals' tab to reward them.",
      icon: Zap,
      color: "from-violet-500 to-indigo-500",
    },
    {
      title: "Step 2: Scan & Redeem Rewards 🔍",
      description: "When a customer earns a free reward or discount coupon, click the 'Scan & Redeem' button on your dashboard to instantly scan their QR code.",
      icon: Scan,
      color: "from-emerald-500 to-teal-500",
    },
    {
      title: "Step 3: Growth Analytics & Feedback 📈",
      description: "Track check-in counts, user details, and reviews. Integrate your Google, Instagram, and Facebook profiles below to grow your reach.",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
    }
  ];

  React.useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("has_seen_onboarding_v1");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleNextOnboarding = () => {
    if (onboardingStep < onboardingSteps.length - 1) {
      setOnboardingStep(prev => prev + 1);
    } else {
      handleSkipOnboarding();
    }
  };

  const handleSkipOnboarding = () => {
    localStorage.setItem("has_seen_onboarding_v1", "true");
    setShowOnboarding(false);
  };

  const logoInputRef = React.useRef(null);
  const [logoUploading, setLogoUploading] = React.useState(false);

  const [isEditingReview, setIsEditingReview] = React.useState(false);
  const [bizType, setBizType] = React.useState("");
  const [revGoogleUrl, setRevGoogleUrl] = React.useState("");
  const [revInstagramUrl, setRevInstagramUrl] = React.useState("");
  const [revFacebookUrl, setRevFacebookUrl] = React.useState("");
  const [revSaving, setRevSaving] = React.useState(false);
  const [reviewError, setReviewError] = React.useState("");
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
      const res = await api.post("/checkins/redeem", { redemptionCode: codeToRedeem });
      setRedeemResult(res.data);
      setRedeemCode("");
      queryClient.invalidateQueries(["businessCheckins", businessId]);
      queryClient.invalidateQueries(["businessAnalytics", businessId]);
      queryClient.invalidateQueries(["businessRedemptions", businessId]);
      refetchCheckins();
      refetchRedemptions();
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
          console.warn("Camera access denied or unavailable:", err?.message || err);
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
  const [description, setDescription] = React.useState("");
  const [socialSaving, setSocialSaving] = React.useState(false);
  const [coverUploading, setCoverUploading] = React.useState(false);
  const coverInputRef = React.useRef(null);

  const handleCoverUpload = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size should not exceed 5MB.");
      return;
    }

    const formData = new FormData();
    formData.append("cover", file);

    setCoverUploading(true);
    try {
      await api.post(`/businesses/${businessId}/cover`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      await refetchProfile();
      alert("Cover page image updated successfully!");
    } catch (err) {
      alert(err.message || "Failed to upload cover image.");
    } finally {
      setCoverUploading(false);
    }
  };

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

  // Fetch branches list for QR display
  const { data: branches = [] } = useQuery({
    queryKey: ["businessBranches", businessId],
    queryFn: () => api.get(`/branches/business/${businessId}`).then((res) => res.data),
    enabled: !!businessId && businessId !== "null" && businessId !== "undefined",
  });
  const primaryBranch = branches[0];

  React.useEffect(() => {
    if (primaryBranch && (!primaryBranch.qrImage || !primaryBranch.qrPayload)) {
      api.get(`/branches/${primaryBranch.id}/qr?format=base64`)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["businessBranches", businessId] });
        })
        .catch((err) => console.error("Failed to auto-generate QR code:", err));
    }
  }, [primaryBranch, businessId, queryClient]);

  const handleOpenSocialModal = () => {
    if (business) {
      setInstagramUrl(business.instagramUrl || "");
      setFacebookUrl(business.facebookUrl || "");
      setWhatsappUrl(business.whatsappUrl || "");
      setGoogleReviewUrl(business.googleReviewUrl || "");
      setDescription(business.description || "");
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
        description: description || null,
      });
      await refetchProfile();
      setShowSocialModal(false);
      alert("Business settings updated successfully!");
    } catch (err) {
      alert(err.message || "Failed to save business settings.");
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

            // Set editing to false if already configured
            const isConfig = !!(res.data.businessType || res.data.googleReviewUrl);
            setIsEditingReview(!isConfig);
          } else {
            setIsEditingReview(true);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch review settings:", err);
          setIsEditingReview(true);
        });
    }
  }, [businessId]);

  const handleSaveReviewSettings = async (e) => {
    e.preventDefault();
    setReviewError("");

    const isValidUrl = (string, platform) => {
      if (!string) return true;
      try {
        const url = new URL(string);
        if (url.protocol !== "http:" && url.protocol !== "https:") return false;

        const hostname = url.hostname.toLowerCase();

        if (platform === "google") {
          return hostname.includes("google.") || hostname.includes("g.page");
        }
        if (platform === "instagram") {
          return hostname.includes("instagram.com");
        }
        if (platform === "facebook") {
          return hostname.includes("facebook.com") || hostname.includes("fb.com");
        }

        return true;
      } catch (_) {
        return false;
      }
    };

    if (!isValidUrl(revGoogleUrl, "google")) {
      setReviewError("Invalid Google Review Link. Please enter a valid Google link (e.g. g.page or google.com).");
      return;
    }
    if (!isValidUrl(revInstagramUrl, "instagram")) {
      setReviewError("Invalid Instagram Link. Please enter a valid Instagram link (e.g. instagram.com).");
      return;
    }
    if (!isValidUrl(revFacebookUrl, "facebook")) {
      setReviewError("Invalid Facebook Link. Please enter a valid Facebook link (e.g. facebook.com).");
      return;
    }

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
        setIsEditingReview(false);
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

  const [undoingId, setUndoingId] = React.useState(null);
  const { data: redemptionsData, isLoading: redemptionsLoading, refetch: refetchRedemptions } = useQuery({
    queryKey: ["businessRedemptions", businessId],
    queryFn: () => api.get(`/businesses/${businessId}/redemptions`).then((res) => res.data),
    enabled: !!businessId && businessId !== "null" && businessId !== "undefined",
  });
  const redemptions = redemptionsData || [];

  const handleUndoRedemption = async (id) => {
    if (!confirm("Are you sure you want to undo this redemption? The customer's voucher will become ready to redeem again.")) return;
    setUndoingId(id);
    try {
      await api.post(`/businesses/${businessId}/redemptions/${id}/undo`);
      queryClient.invalidateQueries(["customerDashboard"]);
      queryClient.invalidateQueries(["businessRedemptions", businessId]);
      refetchRedemptions();
      alert("Redemption undone successfully!");
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to undo redemption");
    } finally {
      setUndoingId(null);
    }
  };

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

  // Build weekly chart data from analytics or use sample progression
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const baseCheckins = analytics?.totalCheckIns ?? 0;
  const chartData = weekDays.map((day, i) => ({
    day,
    value: Math.max(0, Math.round(baseCheckins * (0.08 + (i * 0.04) + (Math.sin(i) * 0.06))))
  }));

  const socialLinks = [
    { name: 'Google Review', connected: !!(revGoogleUrl), icon: 'G', color: '#4285F4', bg: '#E8F0FE' },
    { name: 'Instagram', connected: !!(revInstagramUrl), icon: '📷', color: '#E1306C', bg: '#FDE8F0' },
    { name: 'Facebook', connected: !!(revFacebookUrl), icon: 'f', color: '#1877F2', bg: '#E7F0FD' },
  ];

  return (
    React.createElement('div', { className: "min-h-screen bg-[#F8FAFC] -m-4 md:-m-8 md:m-0 md:bg-transparent" }

      /* ── Mobile-first premium dashboard wrapper ── */

      /* A. Mobile Header Bar */
      , React.createElement('div', { className: "flex items-center justify-between px-5 pt-4 pb-2 md:hidden" }
        , React.createElement('div', { className: "flex items-center gap-2" }
          , React.createElement('div', {
            onClick: () => logoInputRef.current?.click(),
            className: "w-10 h-10 rounded-xl bg-[#F97316] flex items-center justify-center shadow-md cursor-pointer shrink-0"
          }
            , logoUploading
              ? React.createElement(Loader2, { className: "h-5 w-5 animate-spin text-white" })
              : React.createElement('img', { src: getImageUrl(business?.logoUrl) || "/new.png", alt: "logo", className: "w-full h-full object-cover rounded-xl" })
          )
          , React.createElement('span', { className: "text-lg font-bold tracking-tight" }
            , React.createElement('span', { className: "text-[#0F172A]" }, "Scan")
            , React.createElement('span', { className: "text-[#F97316]" }, "Loyal")
          )
        )
        , React.createElement('div', { className: "flex items-center gap-3" }
          , React.createElement('button', {
            onClick: () => { setShowNotifications && setShowNotifications(true); },
            className: "relative w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-[#64748B]"
          }
            , React.createElement(Bell, { className: "h-4.5 w-4.5" })
            , React.createElement('span', { className: "absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center leading-none" }, "3")
          )
          , React.createElement('div', { className: "w-9 h-9 rounded-full bg-[#6D5DD3] flex items-center justify-center text-white text-sm font-bold shadow-sm" }
            , _optionalChain([user, 'optionalAccess', _ => _.name, 'optionalAccess', _a => _a[0], 'optionalAccess', _b => _b.toUpperCase, 'optionalCall', _c => _c()])
          )
        )
      )

      /* Desktop Header (unchanged) */
      , React.createElement('div', { className: "hidden md:flex items-center justify-between gap-3" }
        , React.createElement('div', { className: "flex items-center gap-4" }
          , React.createElement('div', {
            onClick: () => logoInputRef.current?.click(),
            className: "relative group w-14 h-14 shrink-0 rounded-2xl border-2 border-border shadow-md overflow-hidden bg-slate-50 flex items-center justify-center cursor-pointer"
          }
            , logoUploading
              ? React.createElement(Loader2, { className: "h-6 w-6 animate-spin text-primary" })
              : React.createElement(React.Fragment, null
                , React.createElement('img', { src: getImageUrl(business?.logoUrl) || "/new.png", alt: business?.name || "Logo", className: "w-full h-full object-cover group-hover:opacity-60 transition-opacity" })
                , React.createElement('div', { className: "absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity" }
                  , React.createElement(Upload, { className: "h-4 w-4 text-white mb-1" })
                  , React.createElement('span', { className: "text-[9px] text-white font-extrabold tracking-wider uppercase" }, "Upload")
                )
              )
          )
          , React.createElement('div', null
            , React.createElement('h1', { className: "text-3xl font-extrabold text-foreground tracking-tight" }, "Dashboard")
            , React.createElement('p', { className: "text-xs text-muted-foreground mt-1" }, "Real-time analytics · ", _optionalChain([business, 'optionalAccess', _2 => _2.name]))
          )
        )
        , React.createElement('div', { className: "flex items-center gap-2" }
          , React.createElement(Button, {
            onClick: () => { setShowRedeemModal(true); setScanningRedeem(true); },
            size: "sm",
            className: "bg-gradient-to-r from-[#FF6A00] to-[#FF8E3C] text-white shadow-md font-bold transition-all"
          }
            , React.createElement(Scan, { className: "mr-2 h-4 w-4" }), "Scan & Redeem"
          )
          , React.createElement(Button, { variant: "outline", size: "sm", onClick: handleOpenSocialModal }, "🔗 Social Links")
        )
      )

      /* ── MOBILE-ONLY PREMIUM SECTIONS ── */
      , React.createElement('div', { className: "md:hidden space-y-4 px-4 pb-6" }

        /* B. Greeting Block */
        , React.createElement('div', { className: "pt-1" }
          , React.createElement('h2', { className: "text-xl font-bold text-[#0F172A]" }, "Hi, ", _optionalChain([business, 'optionalAccess', _g => _g.name]) || _optionalChain([user, 'optionalAccess', _h => _h.name]) || "there", " 👋")
          , React.createElement('p', { className: "text-sm text-[#64748B] mt-0.5" }, "Let's grow your business today")
        )

        /* C. Hero Banner */
        , React.createElement('div', { className: "rounded-3xl overflow-hidden relative", style: { background: "linear-gradient(135deg, #FF8A3D 0%, #F0350C 100%)" } }
          , React.createElement('div', { className: "px-6 py-5 relative z-10" }
            , React.createElement('div', { className: "w-3/5" }
              , React.createElement('h3', { className: "text-white font-bold text-xl leading-snug" }, "Grow loyalty.", React.createElement('br', null), "Grow your business. 🚀")
              , React.createElement('p', { className: "text-white/90 text-sm mt-1.5 leading-snug" }, "Track check-ins, reward customers and boost engagement.")
              , React.createElement('div', { className: "flex gap-2.5 mt-4 flex-wrap" }
                , React.createElement('button', {
                  onClick: () => { setShowRedeemModal(true); setScanningRedeem(true); },
                  className: "flex items-center gap-1.5 bg-white text-[#0F172A] text-xs font-bold px-4 py-2 rounded-full shadow-md active:scale-95 transition-transform"
                }
                  , React.createElement(ScanLine, { className: "h-3.5 w-3.5" })
                  , "Scan & Redeem"
                )
                , React.createElement('button', {
                  onClick: () => window.location.href = "/dashboard/business/coupons",
                  className: "flex items-center gap-1.5 bg-transparent text-white text-xs font-bold px-4 py-2 rounded-full border border-white/70 active:scale-95 transition-transform"
                }
                  , React.createElement(Gift, { className: "h-3.5 w-3.5" })
                  , "Add Coupon"
                )
              )
            )
          )
          /* Decorative right side */
          , React.createElement('div', { className: "absolute right-0 top-0 h-full w-2/5 pointer-events-none select-none flex items-center justify-end pr-2" }
            , React.createElement('svg', { viewBox: "0 0 130 140", className: "h-32 w-32 opacity-90", fill: "none" }
              /* Phone outline */
              , React.createElement('rect', { x: 45, y: 2, width: 55, height: 90, rx: 8, fill: "white", fillOpacity: 0.25 })
              , React.createElement('rect', { x: 50, y: 10, width: 45, height: 74, rx: 4, fill: "white", fillOpacity: 0.5 })
              /* QR code grid */
              , React.createElement('rect', { x: 56, y: 17, width: 8, height: 8, rx: 1, fill: "#F97316" })
              , React.createElement('rect', { x: 66, y: 17, width: 4, height: 4, rx: 0.5, fill: "#F97316", fillOpacity: 0.7 })
              , React.createElement('rect', { x: 72, y: 17, width: 8, height: 8, rx: 1, fill: "#F97316" })
              , React.createElement('rect', { x: 56, y: 27, width: 4, height: 4, rx: 0.5, fill: "#F97316", fillOpacity: 0.7 })
              , React.createElement('rect', { x: 62, y: 27, width: 8, height: 8, rx: 1, fill: "#F97316" })
              , React.createElement('rect', { x: 72, y: 27, width: 4, height: 4, rx: 0.5, fill: "#F97316", fillOpacity: 0.7 })
              , React.createElement('rect', { x: 56, y: 35, width: 8, height: 8, rx: 1, fill: "#F97316" })
              , React.createElement('rect', { x: 66, y: 35, width: 4, height: 4, rx: 0.5, fill: "#F97316", fillOpacity: 0.7 })
              , React.createElement('rect', { x: 72, y: 35, width: 8, height: 8, rx: 1, fill: "#F97316" })
              /* QR corner brackets */
              , React.createElement('path', { d: "M54 14 h6 v1.5 h-4.5 v4.5 h-1.5z", fill: "#0F172A" })
              , React.createElement('path', { d: "M83 14 h-6 v1.5 h4.5 v4.5 h1.5z", fill: "#0F172A" })
              , React.createElement('path', { d: "M54 47 h1.5 v4.5 h4.5 v1.5 h-6z", fill: "#0F172A" })
              , React.createElement('path', { d: "M83 47 h-1.5 v4.5 h-4.5 v1.5 h6z", fill: "#0F172A" })
              /* Gift box */
              , React.createElement('rect', { x: 28, y: 82, width: 44, height: 32, rx: 6, fill: "#F97316" })
              , React.createElement('rect', { x: 28, y: 82, width: 44, height: 10, rx: 4, fill: "#E05E00" })
              , React.createElement('rect', { x: 47, y: 82, width: 6, height: 32, fill: "#E05E00" })
              /* Ribbon bow */
              , React.createElement('path', { d: "M50 82 C50 78 42 72 40 76 C38 80 46 82 50 82z", fill: "#FDBA74" })
              , React.createElement('path', { d: "M50 82 C50 78 58 72 60 76 C62 80 54 82 50 82z", fill: "#FDBA74" })
              /* Stars/sparkles */
              , React.createElement('circle', { cx: 22, cy: 30, r: 3, fill: "white", fillOpacity: 0.8 })
              , React.createElement('circle', { cx: 108, cy: 50, r: 2, fill: "white", fillOpacity: 0.7 })
              , React.createElement('circle', { cx: 18, cy: 70, r: 2, fill: "white", fillOpacity: 0.6 })
              , React.createElement('path', { d: "M110 20 L112 24 L116 26 L112 28 L110 32 L108 28 L104 26 L108 24z", fill: "white", fillOpacity: 0.85 })
              , React.createElement('path', { d: "M25 100 L26.5 103 L30 104.5 L26.5 106 L25 109 L23.5 106 L20 104.5 L23.5 103z", fill: "white", fillOpacity: 0.7 })
            )
          )
        )

        /* D. Stats Grid — single card, 4 equal columns */
        , React.createElement('div', { className: "bg-white rounded-3xl shadow-sm p-4" }
          , React.createElement('div', { className: "grid grid-cols-4 gap-2" }
            /* Customers */
            , React.createElement('div', { className: "flex flex-col items-center text-center gap-1.5" }
              , React.createElement('div', { className: "w-12 h-12 rounded-full flex items-center justify-center", style: { background: "#EDE9FF" } }
                , React.createElement(Users, { className: "h-5 w-5", style: { color: "#6D5DD3" } })
              )
              , React.createElement('span', { className: "text-lg font-bold text-[#0F172A] leading-none" }, (_optionalChain([analytics, 'optionalAccess', _ => _.totalCustomers]) ?? 0).toLocaleString())
              , React.createElement('span', { className: "text-[9px] text-[#64748B] font-medium leading-tight" }, "Customers")
              , React.createElement('span', { className: "text-[9px] font-semibold text-[#22C55E]" }, "↗ 18% this month")
            )
            /* Check-ins */
            , React.createElement('div', { className: "flex flex-col items-center text-center gap-1.5" }
              , React.createElement('div', { className: "w-12 h-12 rounded-full flex items-center justify-center", style: { background: "#DCFCE7" } }
                , React.createElement(ShieldCheck, { className: "h-5 w-5", style: { color: "#22C55E" } })
              )
              , React.createElement('span', { className: "text-lg font-bold text-[#0F172A] leading-none" }, (_optionalChain([analytics, 'optionalAccess', _2 => _2.totalCheckIns]) ?? 0).toLocaleString())
              , React.createElement('span', { className: "text-[9px] text-[#64748B] font-medium leading-tight" }, "Check-ins")
              , React.createElement('span', { className: "text-[9px] font-semibold text-[#22C55E]" }, "↗ 25% this week")
            )
            /* Rewards Redeemed */
            , React.createElement('div', { className: "flex flex-col items-center text-center gap-1.5" }
              , React.createElement('div', { className: "w-12 h-12 rounded-full flex items-center justify-center", style: { background: "#FEF3E2" } }
                , React.createElement(Gift, { className: "h-5 w-5", style: { color: "#F97316" } })
              )
              , React.createElement('span', { className: "text-lg font-bold text-[#0F172A] leading-none" }, (redemptions?.length ?? 0).toLocaleString())
              , React.createElement('span', { className: "text-[9px] text-[#64748B] font-medium leading-tight" }, "Rewards")
              , React.createElement('span', { className: "text-[9px] font-semibold text-[#22C55E]" }, "↗ 12% this week")
            )
            /* Active Coupons */
            , React.createElement('div', { className: "flex flex-col items-center text-center gap-1.5" }
              , React.createElement('div', { className: "w-12 h-12 rounded-full flex items-center justify-center", style: { background: "#DBEAFE" } }
                , React.createElement(Tag, { className: "h-5 w-5", style: { color: "#3B82F6" } })
              )
              , React.createElement('span', { className: "text-lg font-bold text-[#0F172A] leading-none" }, (_optionalChain([analytics, 'optionalAccess', _3 => _3.activeCoupons]) ?? 0).toLocaleString())
              , React.createElement('span', { className: "text-[9px] text-[#64748B] font-medium leading-tight" }, "Coupons")
              , React.createElement('span', { className: "text-[9px] font-semibold text-[#F97316]" }, "🕐 expiring soon")
            )
          )
        )

        /* E. Quick Actions */
        , React.createElement('div', { className: "bg-white rounded-3xl shadow-sm p-4" }
          , React.createElement('div', { className: "flex items-center justify-between mb-3" }
            , React.createElement('span', { className: "text-sm font-bold text-[#0F172A]" }, "Quick Actions")
            , React.createElement('a', { href: "/dashboard/business/coupons", className: "text-xs font-semibold", style: { color: "#6D5DD3" } }, "View All")
          )
          , React.createElement('div', { className: "grid grid-cols-5 gap-1" }
            /* Create Coupon */
            , React.createElement('a', { href: "/dashboard/business/coupons", className: "flex flex-col items-center gap-1.5 active:scale-95 transition-transform" }
              , React.createElement('div', { className: "w-12 h-12 rounded-2xl flex items-center justify-center", style: { background: "#FEF3E2" } }
                , React.createElement(Ticket, { className: "h-5 w-5", style: { color: "#F97316" } })
              )
              , React.createElement('span', { className: "text-[9px] text-[#64748B] font-medium text-center leading-tight" }, "Create", React.createElement('br', null), "Coupon")
            )
            /* Add Reward */
            , React.createElement('a', { href: "/dashboard/business/loyalty-config", className: "flex flex-col items-center gap-1.5 active:scale-95 transition-transform" }
              , React.createElement('div', { className: "w-12 h-12 rounded-2xl flex items-center justify-center", style: { background: "#FDE8F0" } }
                , React.createElement(Gift, { className: "h-5 w-5", style: { color: "#EC4899" } })
              )
              , React.createElement('span', { className: "text-[9px] text-[#64748B] font-medium text-center leading-tight" }, "Add", React.createElement('br', null), "Reward")
            )
            /* QR Code */
            , primaryBranch
              ? React.createElement('button', {
                onClick: () => { setShowRedeemModal(true); setScanningRedeem(false); },
                className: "flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
              }
                , React.createElement('div', { className: "w-12 h-12 rounded-2xl flex items-center justify-center", style: { background: "#DBEAFE" } }
                  , React.createElement(QrCode, { className: "h-5 w-5", style: { color: "#3B82F6" } })
                )
                , React.createElement('span', { className: "text-[9px] text-[#64748B] font-medium text-center leading-tight" }, "QR", React.createElement('br', null), "Code")
              )
              : React.createElement('div', { className: "flex flex-col items-center gap-1.5" }
                , React.createElement('div', { className: "w-12 h-12 rounded-2xl flex items-center justify-center", style: { background: "#DBEAFE" } }
                  , React.createElement(QrCode, { className: "h-5 w-5", style: { color: "#3B82F6" } })
                )
                , React.createElement('span', { className: "text-[9px] text-[#64748B] font-medium text-center leading-tight" }, "QR", React.createElement('br', null), "Code")
              )
            /* Review Settings */
            , React.createElement('a', { href: "/dashboard/business/profile", className: "flex flex-col items-center gap-1.5 active:scale-95 transition-transform" }
              , React.createElement('div', { className: "w-12 h-12 rounded-2xl flex items-center justify-center", style: { background: "#FEF3E2" } }
                , React.createElement(Star, { className: "h-5 w-5", style: { color: "#F97316" } })
              )
              , React.createElement('span', { className: "text-[9px] text-[#64748B] font-medium text-center leading-tight" }, "Review", React.createElement('br', null), "Settings")
            )
            /* Invite Customer */
            , React.createElement('a', { href: "/dashboard/business/analytics", className: "flex flex-col items-center gap-1.5 active:scale-95 transition-transform" }
              , React.createElement('div', { className: "w-12 h-12 rounded-2xl flex items-center justify-center", style: { background: "#DCFCE7" } }
                , React.createElement(UserPlus, { className: "h-5 w-5", style: { color: "#22C55E" } })
              )
              , React.createElement('span', { className: "text-[9px] text-[#64748B] font-medium text-center leading-tight" }, "Invite", React.createElement('br', null), "Customer")
            )
          )
        )

        /* F. Check-in Overview */
        , React.createElement('div', { className: "bg-white rounded-3xl shadow-sm p-4" }
          , React.createElement('div', { className: "flex items-center justify-between mb-3" }
            , React.createElement('div', { className: "flex items-center gap-1.5" }
              , React.createElement(TrendingUp, { className: "h-4 w-4", style: { color: "#6D5DD3" } })
              , React.createElement('span', { className: "text-sm font-bold text-[#0F172A]" }, "Check-in Overview")
            )
            , React.createElement('div', { className: "flex items-center gap-1 px-3 py-1 rounded-full text-xs text-[#64748B] font-medium", style: { background: "#F1F5F9" } }
              , "This Week"
              , React.createElement(ChevronDown, { className: "h-3 w-3 ml-0.5" })
            )
          )
          , React.createElement('div', { style: { height: "140px" } }
            , React.createElement(ResponsiveContainer, { width: "100%", height: "100%" }
              , React.createElement(AreaChart, { data: chartData, margin: { top: 5, right: 5, bottom: 0, left: -20 } }
                , React.createElement('defs', null
                  , React.createElement('linearGradient', { id: "checkinGrad", x1: "0", y1: "0", x2: "0", y2: "1" }
                    , React.createElement('stop', { offset: "5%", stopColor: "#6D5DD3", stopOpacity: 0.3 })
                    , React.createElement('stop', { offset: "95%", stopColor: "#6D5DD3", stopOpacity: 0 })
                  )
                )
                , React.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: "#F1F5F9", vertical: false })
                , React.createElement(XAxis, { dataKey: "day", tick: { fill: "#94A3B8", fontSize: 10 }, axisLine: false, tickLine: false })
                , React.createElement(YAxis, { tick: { fill: "#94A3B8", fontSize: 9 }, axisLine: false, tickLine: false, ticks: [0, 25, 50, 75, 100] })
                , React.createElement(Tooltip, { contentStyle: { background: "white", border: "none", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: "12px" }, itemStyle: { color: "#6D5DD3" }, cursor: false })
                , React.createElement(Area, { type: "monotone", dataKey: "value", stroke: "#6D5DD3", strokeWidth: 2.5, fill: "url(#checkinGrad)", dot: { fill: "#6D5DD3", r: 3, strokeWidth: 0 }, activeDot: { r: 5, fill: "#6D5DD3", strokeWidth: 0 } })
              )
            )
          )
          , React.createElement('div', { className: "flex items-center mt-3 pt-3", style: { borderTop: "1px solid #F1F5F9" } }
            , React.createElement('div', { className: "flex-1 text-center" }
              , React.createElement('p', { className: "text-[10px] text-[#64748B]" }, "Total Check-ins")
              , React.createElement('p', { className: "text-xl font-bold text-[#0F172A]" }, (_optionalChain([analytics, 'optionalAccess', _4 => _4.totalCheckIns]) ?? 0).toLocaleString())
              , React.createElement('p', { className: "text-[9px] font-semibold mt-0.5", style: { color: "#22C55E" } }
                , "↗ ", (_optionalChain([analytics, 'optionalAccess', _5 => _5.checkInsToday]) ?? 0), " from last week"
              )
            )
            , React.createElement('div', { className: "w-px h-10 self-center", style: { background: "#F1F5F9" } })
            , React.createElement('div', { className: "flex-1 text-center" }
              , React.createElement('p', { className: "text-[10px] text-[#64748B]" }, "Daily Average")
              , React.createElement('p', { className: "text-xl font-bold text-[#0F172A]" }
                , analytics?.totalCheckIns ? Math.round(analytics.totalCheckIns / 7) : 0
              )
            )
          )
        )

        /* G. Reviews & Social Links */
        , React.createElement('div', { className: "bg-white rounded-3xl shadow-sm p-4" }
          , React.createElement('div', { className: "flex items-center justify-between mb-3" }
            , React.createElement('div', { className: "flex items-center gap-1.5" }
              , React.createElement(Star, { className: "h-4 w-4", style: { color: "#6D5DD3" } })
              , React.createElement('span', { className: "text-sm font-bold text-[#0F172A]" }, "Reviews & Social Links")
            )
            , React.createElement('button', {
              onClick: handleOpenSocialModal,
              className: "text-xs font-semibold px-3 py-1 rounded-full",
              style: { background: "#EDE9FF", color: "#6D5DD3" }
            }
              , "Manage"
            )
          )
          , React.createElement('div', { className: "grid grid-cols-3 gap-2" }
            /* Google */
            , React.createElement('div', { className: "flex flex-col items-center gap-1.5 p-2 rounded-2xl", style: { background: "#F8FAFC" } }
              , React.createElement('div', { className: "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow-sm", style: { background: "#4285F4" } }, "G")
              , React.createElement('span', { className: "text-[9px] text-[#64748B] font-medium" }, "Google Review")
              , React.createElement('span', { className: "text-[9px] font-bold flex items-center gap-0.5", style: { color: revGoogleUrl ? "#22C55E" : "#94A3B8" } }
                , revGoogleUrl ? "✓ Connected" : "Not set"
              )
            )
            /* Instagram */
            , React.createElement('div', { className: "flex flex-col items-center gap-1.5 p-2 rounded-2xl", style: { background: "#F8FAFC" } }
              , React.createElement('div', { className: "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow-sm", style: { background: "linear-gradient(135deg, #F09433, #E6683C, #DC2743, #CC2366, #BC1888)" } }, "📷")
              , React.createElement('span', { className: "text-[9px] text-[#64748B] font-medium" }, "Instagram")
              , React.createElement('span', { className: "text-[9px] font-bold flex items-center gap-0.5", style: { color: revInstagramUrl ? "#22C55E" : "#94A3B8" } }
                , revInstagramUrl ? "✓ Connected" : "Not set"
              )
            )
            /* Facebook */
            , React.createElement('div', { className: "flex flex-col items-center gap-1.5 p-2 rounded-2xl", style: { background: "#F8FAFC" } }
              , React.createElement('div', { className: "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow-sm", style: { background: "#1877F2" } }, "f")
              , React.createElement('span', { className: "text-[9px] text-[#64748B] font-medium" }, "Facebook")
              , React.createElement('span', { className: "text-[9px] font-bold flex items-center gap-0.5", style: { color: revFacebookUrl ? "#22C55E" : "#94A3B8" } }
                , revFacebookUrl ? "✓ Connected" : "Not set"
              )
            )
          )
        )

        /* QR Code Card (mobile) */
        , primaryBranch && React.createElement('div', { className: "bg-white rounded-3xl shadow-sm p-4" }
          , React.createElement('div', { className: "flex items-center gap-2 mb-3" }
            , React.createElement(QrCode, { className: "h-4 w-4", style: { color: "#F97316" } })
            , React.createElement('span', { className: "text-sm font-bold text-[#0F172A]" }, "Customer Check-in QR Code")
          )
          , React.createElement('div', { className: "flex flex-col items-center gap-3" }
            , React.createElement('div', { className: "rounded-2xl border-2 border-dashed p-3 flex items-center justify-center", style: { borderColor: "#FED7AA" } }
              , primaryBranch.qrImage
                ? React.createElement('div', { className: "relative" }
                  , React.createElement('img', { src: primaryBranch.qrImage, alt: "Check-in QR", className: "h-40 w-40 rounded-xl" })
                  , React.createElement('div', { className: "absolute inset-0 flex items-center justify-center pointer-events-none" }
                    , React.createElement('div', { className: "w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-md" }
                      , React.createElement('span', { className: "text-[10px] font-black", style: { background: "linear-gradient(to right, #FF6A00, #800020)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } }, "LS")
                    )
                  )
                )
                : React.createElement('div', { className: "h-40 w-40 flex items-center justify-center" }
                  , React.createElement(Loader2, { className: "h-6 w-6 animate-spin text-[#F97316]" })
                )
            )
            , React.createElement('input', { readOnly: true, value: primaryBranch.qrPayload || "", className: "w-full text-[10px] font-mono bg-[#F8FAFC] border border-[#F1F5F9] p-2.5 rounded-xl text-center text-[#64748B]" })
            , React.createElement('div', { className: "flex gap-2 w-full" }
              , React.createElement('button', {
                onClick: () => { navigator.clipboard.writeText(primaryBranch.qrPayload || ""); alert("Link copied!"); },
                className: "flex-1 py-2.5 rounded-full border-2 text-xs font-bold active:scale-95 transition-transform",
                style: { borderColor: "#F97316", color: "#F97316" }
              }
                , "Copy Link"
              )
              , React.createElement('button', {
                onClick: () => { const a = document.createElement("a"); a.href = primaryBranch.qrImage; a.download = `QR-${primaryBranch.name}.png`; a.click(); },
                disabled: !primaryBranch.qrImage,
                className: "flex-1 py-2.5 rounded-full text-xs font-bold text-white active:scale-95 transition-transform disabled:opacity-50",
                style: { background: "#F97316" }
              }
                , "Download PNG"
              )
            )
          )
        )

        /* AI Review Settings (mobile compact) */
        , React.createElement('div', { className: "bg-white rounded-3xl shadow-sm p-4" }
          , React.createElement('div', { className: "flex items-center justify-between mb-3" }
            , React.createElement('span', { className: "text-sm font-bold text-[#0F172A]" }, "⭐ AI Review Settings")
            , !isEditingReview && React.createElement('button', {
              onClick: () => setIsEditingReview(true),
              className: "text-xs font-semibold px-3 py-1 rounded-full",
              style: { background: "#EDE9FF", color: "#6D5DD3" }
            }
              , "Edit"
            )
          )
          , !isEditingReview && (bizType || revGoogleUrl)
            ? React.createElement('div', { className: "grid grid-cols-2 gap-2 text-xs" }
              , React.createElement('div', { className: "p-3 rounded-2xl", style: { background: "#F8FAFC" } }
                , React.createElement('p', { className: "text-[9px] text-[#94A3B8] uppercase tracking-wider font-bold mb-1" }, "Business Type")
                , React.createElement('p', { className: "font-bold text-[#0F172A]" }, bizType || "—")
              )
              , React.createElement('div', { className: "p-3 rounded-2xl", style: { background: "#F8FAFC" } }
                , React.createElement('p', { className: "text-[9px] text-[#94A3B8] uppercase tracking-wider font-bold mb-1" }, "Google Link")
                , React.createElement('p', { className: "font-bold text-[#0F172A] truncate" }, revGoogleUrl ? "✓ Set" : "—")
              )
            )
            : React.createElement('form', { onSubmit: handleSaveReviewSettings, className: "space-y-3" }
              , React.createElement('input', { value: bizType, onChange: (e) => setBizType(e.target.value), placeholder: "Business Type (e.g. Cafe)", className: "w-full text-xs border border-[#F1F5F9] rounded-2xl px-3 py-2.5 bg-[#F8FAFC] text-[#0F172A] outline-none focus:ring-2 focus:ring-[#6D5DD3]/30" })
              , React.createElement('input', { value: revGoogleUrl, onChange: (e) => setRevGoogleUrl(e.target.value), placeholder: "Google Review URL", className: "w-full text-xs border border-[#F1F5F9] rounded-2xl px-3 py-2.5 bg-[#F8FAFC] text-[#0F172A] outline-none focus:ring-2 focus:ring-[#6D5DD3]/30" })
              , React.createElement('input', { value: revInstagramUrl, onChange: (e) => setRevInstagramUrl(e.target.value), placeholder: "Instagram URL", className: "w-full text-xs border border-[#F1F5F9] rounded-2xl px-3 py-2.5 bg-[#F8FAFC] text-[#0F172A] outline-none focus:ring-2 focus:ring-[#6D5DD3]/30" })
              , React.createElement('input', { value: revFacebookUrl, onChange: (e) => setRevFacebookUrl(e.target.value), placeholder: "Facebook URL", className: "w-full text-xs border border-[#F1F5F9] rounded-2xl px-3 py-2.5 bg-[#F8FAFC] text-[#0F172A] outline-none focus:ring-2 focus:ring-[#6D5DD3]/30" })
              , reviewError && React.createElement('p', { className: "text-xs text-red-500 font-semibold" }, reviewError)
              , React.createElement('button', { type: "submit", disabled: revSaving, className: "w-full py-2.5 rounded-full text-white text-xs font-bold active:scale-95 transition-transform", style: { background: "#F97316" } }
                , revSaving ? "Saving..." : "Save Review Settings"
              )
            )
        )
      )

      /* ── DESKTOP-ONLY SECTIONS (hidden on mobile) ── */
      , React.createElement('div', { className: "hidden md:block space-y-8" }

        /* KPI Stats Grid */
        , React.createElement('div', { className: "grid grid-cols-2 gap-4" }
          , React.createElement(Link, { to: "/dashboard/business/analytics", className: "block cursor-pointer hover:scale-[1.02] transition-transform" }
            , React.createElement(Card, { className: "glass hover:shadow-md transition-shadow h-full" }
              , React.createElement(CardHeader, { className: "flex flex-row items-center justify-between pb-2" }
                , React.createElement(CardDescription, { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground" }, "Total Customers")
                , React.createElement(Users, { className: "h-5 w-5 text-primary" })
              )
              , React.createElement(CardContent, null
                , React.createElement('span', { className: "text-3xl font-extrabold text-foreground" }, _optionalChain([analytics, 'optionalAccess', _d1 => _d1.totalCustomers]) ?? 0)
                , React.createElement('p', { className: "text-[10px] text-muted-foreground mt-1" }, "Unique visitor registry count")
              )
            )
          )
          , React.createElement(Link, { to: "/dashboard/business/approvals", className: "block cursor-pointer hover:scale-[1.02] transition-transform" }
            , React.createElement(Card, { className: "glass hover:shadow-md transition-shadow h-full" }
              , React.createElement(CardHeader, { className: "flex flex-row items-center justify-between pb-2" }
                , React.createElement(CardDescription, { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground" }, "Verified Check-Ins")
                , React.createElement(UserCheck, { className: "h-5 w-5 text-emerald-600" })
              )
              , React.createElement(CardContent, null
                , React.createElement('span', { className: "text-3xl font-extrabold text-foreground" }, _optionalChain([analytics, 'optionalAccess', _d2 => _d2.totalCheckIns]) ?? 0)
                , React.createElement('p', { className: "text-[10px] text-emerald-600 flex items-center gap-1 mt-1 font-semibold" }
                  , React.createElement(TrendingUp, { className: "h-3 w-3" }), " +", _optionalChain([analytics, 'optionalAccess', _d3 => _d3.checkInsToday]) ?? 0, " check-ins today"
                )
              )
            )
          )
        )

        /* Desktop 2-col panels */
        , React.createElement('div', { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 items-start" }
          , React.createElement('div', { className: "space-y-6" }
            /* QR Code Card */
            , primaryBranch && React.createElement(Card, { className: "border-border bg-white shadow-sm rounded-xl" }
              , React.createElement(CardHeader, { className: "p-6 pb-2" }
                , React.createElement(CardTitle, { className: "text-base font-bold text-primary flex items-center gap-2" }
                  , React.createElement(QrCode, { className: "h-4 w-4" }), "Customer Check-in QR Code"
                )
                , React.createElement(CardDescription, { className: "text-xs text-muted-foreground" }, "Display this QR code for customers to scan and earn stamps/points")
              )
              , React.createElement(CardContent, { className: "p-6 pt-2 flex flex-col items-center text-center space-y-4" }
                , React.createElement('div', { className: "rounded-xl border border-dashed border-primary/20 bg-slate-50/50 p-4 shadow-sm" }
                  , primaryBranch.qrImage
                    ? React.createElement('div', { className: "relative flex items-center justify-center bg-white" }
                      , React.createElement('img', { src: primaryBranch.qrImage, alt: "Branch Check-in QR Code", className: "h-40 w-40 shadow-sm border border-slate-100 rounded-lg" })
                      , React.createElement('div', { className: "absolute w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-md border border-[#FF6A00]/25" }
                        , React.createElement('span', { className: "text-[10px] font-black bg-gradient-to-tr from-[#FF6A00] to-[#800020] bg-clip-text text-transparent" }, "LS")
                      )
                    )
                    : React.createElement('div', { className: "h-40 w-40 flex items-center justify-center" }
                      , React.createElement(Loader2, { className: "h-6 w-6 animate-spin text-zinc-500" })
                    )
                )
                , React.createElement('div', { className: "w-full space-y-1.5" }
                  , React.createElement('span', { className: "text-[9px] text-muted-foreground uppercase tracking-widest font-bold" }, "Direct Check-in Link")
                  , React.createElement('input', { readOnly: true, value: primaryBranch.qrPayload || "", className: "w-full text-[10px] font-mono select-all bg-slate-50 border border-border p-2 rounded-lg text-center" })
                )
                , React.createElement('div', { className: "flex gap-2 w-full" }
                  , React.createElement(Button, { type: "button", variant: "outline", onClick: () => { navigator.clipboard.writeText(primaryBranch.qrPayload || ""); alert("Check-in Link copied!"); }, className: "flex-1 rounded-full border-primary text-primary hover:bg-orange-50 font-bold text-xs" }, "Copy Link")
                  , React.createElement(Button, { type: "button", onClick: () => { const a = document.createElement("a"); a.href = primaryBranch.qrImage; a.download = `CheckIn-QR-${primaryBranch.name.replace(/\s+/g, "_")}.png`; a.click(); }, disabled: !primaryBranch.qrImage, className: "flex-1 rounded-full bg-primary text-white font-bold text-xs" }, "Download PNG")
                )
              )
            )
          )
          , React.createElement('div', { className: "space-y-6" }
            , React.createElement(Card, { className: "glass" }
              , !isEditingReview && (bizType || revGoogleUrl || revInstagramUrl || revFacebookUrl)
                ? React.createElement(React.Fragment, null
                  , React.createElement(CardHeader, { className: "pb-4 border-b border-slate-100/50 flex flex-row items-center justify-between space-y-0" }
                    , React.createElement('div', null
                      , React.createElement(CardTitle, { className: "text-base font-bold text-foreground flex items-center gap-2" }, "⭐ AI Review Settings")
                      , React.createElement(CardDescription, { className: "text-[10px] text-muted-foreground mt-0.5" }, "Currently active AI review generation settings")
                    )
                    , React.createElement(Button, { size: "xs", variant: "outline", onClick: () => setIsEditingReview(true), className: "border-primary/20 text-primary hover:bg-primary/5 font-bold h-7 rounded-md px-2.5" }, "Edit Settings")
                  )
                  , React.createElement(CardContent, { className: "p-6 grid grid-cols-2 gap-4 text-xs" }
                    , React.createElement('div', { className: "bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 space-y-1" }
                      , React.createElement('span', { className: "text-slate-400 block uppercase tracking-wider text-[8px] font-bold" }, "Business Type")
                      , React.createElement('span', { className: "text-slate-800 font-extrabold text-xs" }, bizType || "—")
                    )
                    , React.createElement('div', { className: "bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 space-y-1" }
                      , React.createElement('span', { className: "text-slate-400 block uppercase tracking-wider text-[8px] font-bold" }, "Google Link")
                      , React.createElement('span', { className: "text-slate-800 font-extrabold text-xs truncate block" }, revGoogleUrl || "—")
                    )
                    , React.createElement('div', { className: "bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 space-y-1" }
                      , React.createElement('span', { className: "text-slate-400 block uppercase tracking-wider text-[8px] font-bold" }, "Instagram")
                      , React.createElement('span', { className: "text-slate-800 font-extrabold text-xs truncate block" }, revInstagramUrl || "—")
                    )
                    , React.createElement('div', { className: "bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 space-y-1" }
                      , React.createElement('span', { className: "text-slate-400 block uppercase tracking-wider text-[8px] font-bold" }, "Facebook")
                      , React.createElement('span', { className: "text-slate-800 font-extrabold text-xs truncate block" }, revFacebookUrl || "—")
                    )
                  )
                )
                : React.createElement(React.Fragment, null
                  , React.createElement(CardHeader, { className: "p-6" }
                    , React.createElement(CardTitle, { className: "text-base font-bold text-foreground flex items-center gap-2" }, "⭐ AI Review Settings")
                    , React.createElement(CardDescription, { className: "text-xs text-muted-foreground" }, "Configure options for AI review generation and customer social links")
                  )
                  , React.createElement(CardContent, { className: "p-6 pt-0 space-y-4" }
                    , React.createElement('form', { onSubmit: handleSaveReviewSettings, className: "space-y-4" }
                      , React.createElement('div', { className: "space-y-1.5" }
                        , React.createElement(Label, { htmlFor: "review-biz-type", className: "text-xs font-semibold text-muted-foreground" }, "Business Type")
                        , React.createElement(Input, { id: "review-biz-type", value: bizType, onChange: (e) => setBizType(e.target.value), placeholder: "e.g. Cafe, Restaurant, Salon", className: "text-xs border-border bg-white" })
                      )
                      , React.createElement('div', { className: "space-y-1.5" }
                        , React.createElement(Label, { htmlFor: "review-google-url", className: "text-xs font-semibold text-muted-foreground" }, "Google Review Link")
                        , React.createElement(Input, { id: "review-google-url", value: revGoogleUrl, onChange: (e) => setRevGoogleUrl(e.target.value), placeholder: "https://g.page/r/...", className: "text-xs border-border bg-white" })
                      )
                      , React.createElement('div', { className: "space-y-1.5" }
                        , React.createElement(Label, { htmlFor: "review-instagram-url", className: "text-xs font-semibold text-muted-foreground" }, "Instagram Link")
                        , React.createElement(Input, { id: "review-instagram-url", value: revInstagramUrl, onChange: (e) => setRevInstagramUrl(e.target.value), placeholder: "https://instagram.com/...", className: "text-xs border-border bg-white" })
                      )
                      , React.createElement('div', { className: "space-y-1.5" }
                        , React.createElement(Label, { htmlFor: "review-facebook-url", className: "text-xs font-semibold text-muted-foreground" }, "Facebook Link")
                        , React.createElement(Input, { id: "review-facebook-url", value: revFacebookUrl, onChange: (e) => setRevFacebookUrl(e.target.value), placeholder: "https://facebook.com/...", className: "text-xs border-border bg-white" })
                      )
                      , reviewError && React.createElement('div', { className: "bg-red-50 text-red-600 border border-red-200 text-xs p-3 rounded-xl flex items-center gap-2 font-semibold" }
                        , React.createElement(AlertCircle, { className: "h-4 w-4 shrink-0" }), reviewError
                      )
                      , React.createElement('div', { className: "flex gap-2" }
                        , (bizType || revGoogleUrl || revInstagramUrl || revFacebookUrl) && React.createElement(Button, { type: "button", variant: "outline", onClick: () => { setReviewError(""); setIsEditingReview(false); }, className: "flex-1 rounded-full border-border text-muted-foreground font-semibold text-xs mt-2" }, "Cancel")
                        , React.createElement(Button, { type: "submit", className: "flex-1 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-xs mt-2", disabled: revSaving }
                          , revSaving ? React.createElement(Loader2, { className: "h-3.5 w-3.5 animate-spin mr-1.5" }) : null
                          , "Save Review Settings"
                        )
                      )
                    )
                  )
                )
            )
          )
        )
      )

      /* ── ALL ORIGINAL MODALS (unchanged) ── */

      /* Social Links Modal */
      , showSocialModal && (
        React.createElement(Dialog, { open: showSocialModal, onOpenChange: (open) => !open && setShowSocialModal(false) }
          , React.createElement(DialogContent, { className: "max-w-[420px] bg-white border border-border overflow-y-auto max-h-[90vh]" }
            , React.createElement(DialogHeader, null
              , React.createElement(DialogTitle, { className: "text-lg font-bold text-foreground" }, "Business Details & Links")
              , React.createElement(DialogDescription, { className: "text-xs text-muted-foreground" }, "Manage cover page, description, and social media platform links.")
            )
            , React.createElement('form', { onSubmit: handleSaveSocial, className: "space-y-4 py-2" }
              , React.createElement('div', { className: "space-y-1.5" }
                , React.createElement(Label, { className: "text-xs font-semibold text-muted-foreground" }, "Cover Page Image")
                , React.createElement('div', { className: "flex items-center gap-3" }
                  , React.createElement('div', { className: "w-24 h-12 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0" }
                    , coverUploading ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin text-primary" }) : React.createElement('img', { src: getImageUrl(business?.coverUrl) || "/new.png", alt: "Cover", className: "w-full h-full object-cover" })
                  )
                  , React.createElement(Button, { type: "button", size: "xs", variant: "outline", onClick: () => coverInputRef.current?.click(), className: "text-[11px] rounded-lg border-primary text-primary hover:bg-orange-50 font-bold" }, "Upload Cover Page")
                )
              )
              , React.createElement('div', { className: "space-y-1.5" }
                , React.createElement(Label, { htmlFor: "biz-desc", className: "text-xs font-semibold text-muted-foreground" }, "Business Description")
                , React.createElement('textarea', { id: "biz-desc", placeholder: "Write 1 or 2 lines describing your business services...", value: description, onChange: (e) => setDescription(e.target.value), rows: 2, className: "w-full text-xs border border-border rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-primary text-slate-800" })
              )
              , React.createElement('div', { className: "space-y-1.5" }
                , React.createElement(Label, { htmlFor: "inst-url", className: "text-xs font-semibold text-muted-foreground" }, "Instagram URL")
                , React.createElement(Input, { id: "inst-url", placeholder: "e.g. https://instagram.com/mybrand", value: instagramUrl, onChange: (e) => setInstagramUrl(e.target.value), className: "text-xs border-border bg-white" })
              )
              , React.createElement('div', { className: "space-y-1.5" }
                , React.createElement(Label, { htmlFor: "fb-url", className: "text-xs font-semibold text-muted-foreground" }, "Facebook Page URL")
                , React.createElement(Input, { id: "fb-url", placeholder: "e.g. https://facebook.com/mypage", value: facebookUrl, onChange: (e) => setFacebookUrl(e.target.value), className: "text-xs border-border bg-white" })
              )
              , React.createElement('div', { className: "space-y-1.5" }
                , React.createElement(Label, { htmlFor: "wa-url", className: "text-xs font-semibold text-muted-foreground" }, "WhatsApp Contact")
                , React.createElement(Input, { id: "wa-url", placeholder: "e.g. +919937012345", value: whatsappUrl, onChange: (e) => setWhatsappUrl(e.target.value), className: "text-xs border-border bg-white" })
              )
              , React.createElement('div', { className: "space-y-1.5" }
                , React.createElement(Label, { htmlFor: "g-url", className: "text-xs font-semibold text-muted-foreground" }, "Google Review Link")
                , React.createElement(Input, { id: "g-url", placeholder: "e.g. https://g.page/r/...", value: googleReviewUrl, onChange: (e) => setGoogleReviewUrl(e.target.value), className: "text-xs border-border bg-white" })
              )
              , React.createElement(DialogFooter, { className: "pt-4 gap-2" }
                , React.createElement(Button, { type: "button", variant: "outline", onClick: () => setShowSocialModal(false) }, "Cancel")
                , React.createElement(Button, { type: "submit", className: "bg-primary text-primary-foreground hover:bg-primary/95", disabled: socialSaving }, socialSaving ? "Saving..." : "Save Settings")
              )
            )
          )
        )
      )
      /* Upgrade Plan Modal */
      , showUpgradeModal && (
        React.createElement(Dialog, { open: showUpgradeModal, onOpenChange: (open) => !open && setShowUpgradeModal(false) }
          , React.createElement(DialogContent, { className: "max-w-[400px] bg-white border-0 shadow-2xl rounded-3xl overflow-hidden p-0" }
            , React.createElement('div', { className: "bg-gradient-to-br from-[#FF8A00] via-[#FF5E00] to-[#E31B00] px-6 pt-7 pb-6 text-white relative overflow-hidden" }
              , React.createElement('div', { className: "absolute -top-6 -right-6 w-32 h-32 bg-white/5 rounded-full" })
              , React.createElement('div', { className: "relative z-10" }
                , React.createElement('h2', { className: "text-xl font-black tracking-tight mt-2" }, "Launch Year Special")
                , React.createElement('p', { className: "text-xs opacity-80 mt-0.5" }, "Secure yearly subscription · Razorpay Gateway")
              )
            )
            , React.createElement('div', { className: "px-6 py-5 space-y-4" }
              , business?.status === 'ACTIVE'
                ? React.createElement('div', { className: "space-y-4 text-center py-4" }
                  , React.createElement('h3', { className: "text-base font-extrabold text-foreground" }, "Launch Year Special Plan")
                  , React.createElement('p', { className: "text-xs text-muted-foreground" }, "Your account status is ACTIVE.")
                  , React.createElement(Button, { className: "w-full rounded-full bg-primary text-white font-semibold text-xs mt-2", onClick: () => setShowUpgradeModal(false) }, "Close")
                )
                : pricingLoading
                  ? React.createElement('div', { className: "flex flex-col items-center justify-center py-8" }
                    , React.createElement(Loader2, { className: "h-8 w-8 animate-spin text-[#FF6A00]" })
                  )
                  : pricing && React.createElement(React.Fragment, null
                    , React.createElement('div', { className: "rounded-2xl border border-[#FFF2E8] bg-[#FFF9F5] p-4 space-y-2.5 text-xs" }
                      , React.createElement('div', { className: "flex justify-between text-slate-600" }
                        , React.createElement('span', null, "Base Plan (Yearly):")
                        , React.createElement('span', { className: "font-semibold text-slate-800" }, "₹", pricing.basePrice.toLocaleString("en-IN", { minimumFractionDigits: 2 }))
                      )
                    )
                    , React.createElement('div', { className: "flex gap-3 pt-1" }
                      , React.createElement(Button, { type: "button", variant: "outline", className: "flex-1 text-xs rounded-xl border-slate-200 text-slate-500", onClick: () => setShowUpgradeModal(false) }, "Later")
                      , React.createElement(Button, { type: "button", className: "flex-1 text-xs font-bold h-10 bg-gradient-to-r from-[#FF7A00] to-[#FF4D00] text-white rounded-xl border-0", onClick: handlePayAndUpgrade, disabled: paymentLoading }
                        , paymentLoading ? React.createElement(Loader2, { className: "mr-1.5 h-3.5 w-3.5 animate-spin" }) : null
                        , paymentLoading ? "Opening..." : "Pay ₹" + pricing.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })
                      )
                    )
                  )
            )
          )
        )
      )

      /* Demo Checkout Modal */
      , showDemoCheckout && demoOrder && (
        React.createElement(Dialog, { open: showDemoCheckout, onOpenChange: (open) => { if (!open && !demoPayLoading) setShowDemoCheckout(false); } }
          , React.createElement(DialogContent, { className: "max-w-[400px] bg-white border-0 shadow-2xl rounded-3xl overflow-hidden p-0" }
            , React.createElement('div', { className: "bg-[#072654] px-6 pt-6 pb-5 text-white" }
              , React.createElement('h3', { className: "text-2xl font-black mt-1" }, "₹", (demoOrder.amount / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 }))
              , React.createElement('p', { className: "text-[10px] opacity-60 mt-0.5" }, "Launch Year Special · Demo Mode")
            )
            , React.createElement('div', { className: "px-6 py-5 space-y-4" }
              , demoPaySuccess
                ? React.createElement('div', { className: "flex flex-col items-center py-8 space-y-3" }
                  , React.createElement('h3', { className: "text-base font-black text-emerald-700" }, "Payment Successful!")
                )
                : React.createElement('div', { className: "flex gap-3" }
                  , React.createElement(Button, { variant: "outline", className: "flex-1 text-xs rounded-xl", onClick: () => setShowDemoCheckout(false) }, "Cancel")
                  , React.createElement(Button, { className: "flex-1 text-xs font-bold h-10 bg-[#006AFF] text-white rounded-xl", onClick: handleDemoConfirmPay, disabled: demoPayLoading }
                    , demoPayLoading ? React.createElement(Loader2, { className: "mr-1.5 h-3.5 w-3.5 animate-spin" }) : null
                    , demoPayLoading ? "Processing..." : "Pay ₹" + (demoOrder.amount / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })
                  )
                )
            )
          )
        )
      )

      /* Scan & Redeem Modal */
      , showRedeemModal && (
        React.createElement(Dialog, { open: showRedeemModal, onOpenChange: (open) => !open && handleCloseRedeemModal() }
          , React.createElement(DialogContent, { className: "max-w-[400px] bg-white border border-border p-6 rounded-3xl text-slate-800" }
            , React.createElement(DialogHeader, { className: "flex flex-col items-center justify-center text-center w-full" }
              , React.createElement(DialogTitle, { className: "text-lg font-extrabold text-foreground" }, "Scan & Redeem Reward")
              , React.createElement(DialogDescription, { className: "text-xs mt-1 text-muted-foreground" }, "Scan the customer's reward QR code or enter the code manually.")
            )
            , React.createElement('div', { className: "space-y-4 py-3" }
              , scanningRedeem
                ? React.createElement('div', { className: "space-y-3" }
                  , React.createElement('div', { className: "relative w-full aspect-square max-w-[280px] mx-auto rounded-2xl overflow-hidden border-2 border-[#FF6A00]/40 bg-black flex items-center justify-center" }
                    , React.createElement('div', { id: "reader-redeem", className: "absolute inset-0 w-full h-full" })
                    , React.createElement('div', { className: "absolute inset-x-4 top-1/2 h-[2px] bg-[#FF6A00] animate-pulse z-10" })
                  )
                  , React.createElement(Button, { type: "button", variant: "outline", onClick: () => setScanningRedeem(false), className: "w-full text-xs rounded-xl" }
                    , React.createElement(Camera, { className: "h-3.5 w-3.5 mr-1.5" }), "Use Manual Code Input"
                  )
                )
                : React.createElement('div', { className: "space-y-3" }
                  , React.createElement(Button, { type: "button", variant: "outline", onClick: () => { setRedeemError(""); setScanningRedeem(true); }, className: "w-full text-xs py-5 rounded-2xl border-2 border-dashed border-[#FF6A00]/40 hover:bg-[#FF6A00]/5 flex items-center justify-center gap-2" }
                    , React.createElement(Scan, { className: "h-5 w-5 text-[#FF6A00]" })
                    , React.createElement('span', { className: "font-bold text-[#FF6A00]" }, "Start Camera Scanner")
                  )
                )
              , !scanningRedeem && React.createElement('div', { className: "space-y-3" }
                , React.createElement('div', { className: "space-y-1.5" }
                  , React.createElement(Label, { htmlFor: "redeem-code-input", className: "text-xs font-bold text-muted-foreground" }, "Redemption Code")
                  , React.createElement('div', { className: "flex gap-2" }
                    , React.createElement(Input, { id: "redeem-code-input", placeholder: "e.g. A1B2C3D4", value: redeemCode, onChange: (e) => setRedeemCode(e.target.value.toUpperCase()), className: "text-xs border-border bg-white font-mono tracking-wider font-bold" })
                    , React.createElement(Button, { type: "button", onClick: () => handleProcessRedeem(), disabled: redeemLoading, className: "bg-gradient-to-r from-[#FF6A00] to-[#800020] text-white text-xs font-bold rounded-xl" }
                      , redeemLoading ? React.createElement(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : "Redeem"
                    )
                  )
                )
              )
              , redeemResult && (
                React.createElement('div', { className: "rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800 space-y-1" }
                  , React.createElement('p', { className: "font-bold" }, "✅ Redemption Successful!")
                  , React.createElement('p', null, "Reward: ", React.createElement('strong', null, redeemResult.reward.title))
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

      /* Onboarding Tour Dialog */
      , showOnboarding && React.createElement(
        Dialog, { open: showOnboarding, onOpenChange: (open) => !open && handleSkipOnboarding() },
        React.createElement(DialogContent, { className: "max-w-[440px] w-[95vw] bg-white border border-border rounded-3xl p-6 shadow-2xl" },
          React.createElement("div", { className: "flex flex-col items-center text-center space-y-4" },
            React.createElement("div", { className: `h-16 w-16 rounded-3xl bg-gradient-to-br ${onboardingSteps[onboardingStep].color} text-white flex items-center justify-center shadow-lg` },
              React.createElement(onboardingSteps[onboardingStep].icon, { className: "h-8 w-8" })
            ),
            React.createElement("div", { className: "space-y-1.5" },
              React.createElement(DialogTitle, { className: "text-xl font-black text-slate-800" }, onboardingSteps[onboardingStep].title),
              React.createElement(DialogDescription, { className: "text-sm text-muted-foreground leading-relaxed px-2" }, onboardingSteps[onboardingStep].description)
            ),
            React.createElement("div", { className: "flex items-center gap-1.5 py-2" },
              onboardingSteps.map((_, idx) =>
                React.createElement("div", { key: idx, className: `h-1.5 rounded-full transition-all duration-300 ${idx === onboardingStep ? "w-6 bg-primary" : "w-1.5 bg-slate-200"}` })
              )
            ),
            React.createElement("div", { className: "flex items-center justify-between w-full pt-2 gap-3" },
              React.createElement(Button, { type: "button", variant: "ghost", onClick: handleSkipOnboarding, className: "text-xs font-bold text-muted-foreground rounded-xl" }, "Skip"),
              React.createElement("div", { className: "flex items-center gap-2" },
                React.createElement("a", { href: "https://github.com/Bpska/Digital-Loyalty/blob/main/README.md", target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center justify-center px-4 h-9 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl" }, "Read Docs"),
                React.createElement(Button, { type: "button", onClick: handleNextOnboarding, className: "bg-gradient-to-r from-primary to-indigo-600 text-white text-xs font-bold px-5 h-9 rounded-xl" },
                  onboardingStep === onboardingSteps.length - 1 ? "Finish" : "Next"
                )
              )
            )
          )
        )
      )

      /* Hidden Logo File Input */
      , React.createElement('input', { type: "file", ref: logoInputRef, onChange: handleLogoUpload, accept: "image/jpeg,image/png,image/webp", className: "hidden" })
      /* Hidden Cover File Input */
      , React.createElement('input', { type: "file", ref: coverInputRef, onChange: handleCoverUpload, accept: "image/jpeg,image/png,image/webp", className: "hidden" })
    )
  );
}

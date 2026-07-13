import { Link, useOutletContext } from "react-router-dom";
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
  ScanLine,
  ExternalLink
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatDate, cn } from "@/lib/utils";

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
  const { setShowNotifications, unreadCount, fetchNotifications, setShowRedeemModal, setScanningRedeem } = useOutletContext() || {};
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
  const [showQrModal, setShowQrModal] = React.useState(false);
  const [pdfLoading, setPdfLoading] = React.useState(false);

  const handleDownloadQr = () => {
    if (!primaryBranch?.qrImage) return;
    const link = document.createElement("a");
    link.href = primaryBranch.qrImage;
    link.download = `QR-${primaryBranch.name.replace(/\s+/g, "_")}.png`;
    link.click();
  };

  const handleDownloadPdf = async () => {
    if (!primaryBranch) return;
    setPdfLoading(true);
    try {
      const response = await api.get(`/branches/${primaryBranch.id}/qr?format=pdf`, {
        responseType: "blob",
      });
      const blob = response instanceof Blob ? response : new Blob([response], { type: "application/pdf" });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Poster-${primaryBranch.name.replace(/\s+/g, "_")}.pdf`;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Failed to download PDF:", err);
    } finally {
      setPdfLoading(false);
    }
  };

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
  const [chartTimeRange, setChartTimeRange] = React.useState("Last Week");
  const [currentAdIndex, setCurrentAdIndex] = React.useState(0);
  const [startDate, setStartDate] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = React.useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const { data: redemptionsData, isLoading: redemptionsLoading, refetch: refetchRedemptions } = useQuery({
    queryKey: ["businessRedemptions", businessId],
    queryFn: () => api.get(`/businesses/${businessId}/redemptions`).then((res) => res.data),
    enabled: !!businessId && businessId !== "null" && businessId !== "undefined",
  });
  const redemptions = redemptionsData || [];

  // 4. Fetch platform ad banners
  const { data: adBannerData } = useQuery({
    queryKey: ["platformAdBanners"],
    queryFn: () => api.get("/admin/ads").then((res) => res.data),
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });
  const adBanners = adBannerData?.banners || [];

  React.useEffect(() => {
    if (adBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % adBanners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [adBanners.length]);

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

  // Build chart data based on selected time range
  const getChartData = () => {
    const baseCheckins = analytics?.totalCheckIns ?? 0;
    if (chartTimeRange === "Last Month" || chartTimeRange === "This Month") {
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      return weeks.map((week, i) => ({
        day: week,
        value: Math.max(0, Math.round(baseCheckins * (0.15 + (i * 0.12) + (Math.cos(i) * 0.08))))
      }));
    } else if (chartTimeRange === "Last 3 Months" || chartTimeRange === "This Year") {
      const months = ['Month 1', 'Month 2', 'Month 3'];
      return months.map((month, i) => ({
        day: month,
        value: Math.max(0, Math.round(baseCheckins * (0.25 + (i * 0.18) + (Math.sin(i) * 0.1))))
      }));
    } else if (chartTimeRange === "Custom Date") {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      
      const dataPoints = [];
      const steps = Math.min(15, diffDays); // Limit chart points to 15 max to keep it clean
      const stepSize = Math.max(1, Math.floor(diffDays / steps));

      for (let i = 0; i <= steps; i++) {
        const currDate = new Date(start.getTime() + i * stepSize * 24 * 60 * 60 * 1000);
        if (currDate > end) break;
        const dayLabel = currDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        dataPoints.push({
          day: dayLabel,
          value: Math.max(0, Math.round(baseCheckins * (0.05 + (i * 0.05) + (Math.sin(i) * 0.04))))
        });
      }
      return dataPoints.length > 0 ? dataPoints : [{ day: "No Date", value: 0 }];
    } else {
      // Last Week (default)
      const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return weekDays.map((day, i) => ({
        day,
        value: Math.max(0, Math.round(baseCheckins * (0.08 + (i * 0.04) + (Math.sin(i) * 0.06))))
      }));
    }
  };
  const chartData = getChartData();

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
            className: "w-10 h-10 rounded-full bg-[#F97316]/10 border border-[#F97316]/20 flex items-center justify-center shadow-md cursor-pointer shrink-0"
          }
            , logoUploading
              ? React.createElement(Loader2, { className: "h-5 w-5 animate-spin text-[#F97316]" })
              : business?.logoUrl
                ? React.createElement('img', { src: getImageUrl(business.logoUrl), alt: "logo", className: "w-full h-full object-cover rounded-full" })
                : React.createElement('span', { className: "text-sm font-black text-[#F97316]" }, (business?.name?.[0]?.toUpperCase() || "B"))
          )
          , React.createElement('span', { className: "text-lg font-bold tracking-tight" }
            , React.createElement('span', { className: "text-[#0F172A]" }, "Scan")
            , React.createElement('span', { className: "text-[#F97316]" }, "Loyal")
          )
        )
        , React.createElement('div', { className: "flex items-center gap-3" }
          , React.createElement('button', {
            onClick: () => {
              if (setShowNotifications) setShowNotifications(true);
              if (fetchNotifications) fetchNotifications();
            },
            className: "relative w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-[#64748B]"
          }
            , React.createElement(Bell, { className: "h-5.5 w-5.5" })
            , unreadCount > 0 && (
                React.createElement('span', { className: "absolute top-0.5 right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center leading-none shadow-sm" }
                  , String(unreadCount)
                )
              )
          )
          , React.createElement(Link, {
              to: "/dashboard/business/profile",
              className: "bg-[#6D5DD3] text-white text-sm font-bold shadow-sm cursor-pointer active:scale-95 transition-transform",
              style: { borderRadius: "50%", width: "36px", height: "36px", minWidth: "36px", minHeight: "36px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }
            }
            , _optionalChain([user, 'optionalAccess', _ => _.name, 'optionalAccess', _a => _a[0], 'optionalAccess', _b => _b.toUpperCase, 'optionalCall', _c => _c()])
          )
        )
      )

      /* Desktop Header (unchanged) */
      , React.createElement('div', { className: "hidden md:flex items-center justify-between gap-3" }
        , React.createElement('div', { className: "flex items-center gap-4" }
          , React.createElement('div', {
            onClick: () => logoInputRef.current?.click(),
            className: "relative group w-14 h-14 shrink-0 rounded-full border-2 border-border shadow-md overflow-hidden bg-slate-50 flex items-center justify-center cursor-pointer"
          }
            , logoUploading
              ? React.createElement(Loader2, { className: "h-6 w-6 animate-spin text-primary" })
              : React.createElement(React.Fragment, null
                , business?.logoUrl
                  ? React.createElement('img', { src: getImageUrl(business.logoUrl), alt: business?.name || "Logo", className: "w-full h-full object-cover group-hover:opacity-60 transition-opacity" })
                  : React.createElement('span', { className: "text-xl font-black bg-gradient-to-tr from-primary to-orange-600 bg-clip-text text-transparent" }, (business?.name?.[0]?.toUpperCase() || "B"))
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
            , React.createElement(Scan, { className: "mr-2 h-5 w-5" }), "Scan & Redeem"
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

        /* C. Hero Banner — shows ads carousel if uploaded, else fallback orange card */
        , adBanners.length > 0
          ? React.createElement('div', { className: "rounded-3xl overflow-hidden relative border border-zinc-200/50 shadow-sm bg-white" }
              , React.createElement('div', { 
                  className: "w-full overflow-hidden relative",
                  style: { aspectRatio: "4/1", minHeight: "140px", maxHeight: "220px" }
                }
                , adBanners.map((banner, index) => 
                    React.createElement('img', {
                      key: index,
                      src: banner,
                      alt: "Advertisement Banner " + (index + 1),
                      className: cn(
                        "w-full h-full object-cover absolute inset-0 transition-opacity duration-700 ease-in-out",
                        index === currentAdIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                      )
                    })
                  )
              )
              /* Dots indicator */
              , adBanners.length > 1 && React.createElement('div', { className: "absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-20 bg-black/20 px-2.5 py-1 rounded-full backdrop-blur-sm" }
                  , adBanners.map((_, index) => 
                      React.createElement('div', {
                        key: index,
                        onClick: () => setCurrentAdIndex(index),
                        className: cn(
                          "w-1.5 h-1.5 rounded-full cursor-pointer transition-all duration-300",
                          index === currentAdIndex ? "bg-white w-3" : "bg-white/50 hover:bg-white/85"
                        )
                      })
                    )
                )
            )
          : React.createElement('div', { className: "rounded-3xl overflow-hidden relative", style: { background: "linear-gradient(135deg, #FF8A3D 0%, #F0350C 100%)" } }
              , React.createElement('div', { className: "px-6 py-5 relative z-10 min-h-[180px]" }
                , React.createElement('div', { className: "w-3/5" })
              )
            )

        /* D. Stats Grid — single card, 4 equal columns */
        , React.createElement('div', { className: "bg-white rounded-3xl shadow-sm p-4" }
          , React.createElement('div', { className: "grid grid-cols-4 gap-2" }
            /* Customers */
            , React.createElement('div', { className: "flex flex-col items-center text-center gap-1.5" }
              , React.createElement('div', { className: "w-12 h-12 rounded-full flex items-center justify-center", style: { background: "#EDE9FF" } }
                , React.createElement(Users, { className: "h-6.5 w-6.5", style: { color: "#6D5DD3" } })
              )
              , React.createElement('span', { className: "text-lg font-bold text-[#0F172A] leading-none" }, (_optionalChain([analytics, 'optionalAccess', _ => _.totalCustomers]) ?? 0).toLocaleString())
              , React.createElement('span', { className: "text-[9px] text-[#64748B] font-medium leading-tight" }, "Customers")
              , React.createElement('span', { className: "text-[9px] font-semibold text-[#22C55E]" }, "↗ 18% this month")
            )
            /* Check-ins */
            , React.createElement('div', { className: "flex flex-col items-center text-center gap-1.5" }
              , React.createElement('div', { className: "w-12 h-12 rounded-full flex items-center justify-center", style: { background: "#DCFCE7" } }
                , React.createElement(ShieldCheck, { className: "h-6.5 w-6.5", style: { color: "#22C55E" } })
              )
              , React.createElement('span', { className: "text-lg font-bold text-[#0F172A] leading-none" }, (_optionalChain([analytics, 'optionalAccess', _2 => _2.totalCheckIns]) ?? 0).toLocaleString())
              , React.createElement('span', { className: "text-[9px] text-[#64748B] font-medium leading-tight" }, "Check-ins")
              , React.createElement('span', { className: "text-[9px] font-semibold text-[#22C55E]" }, "↗ 25% this week")
            )
            /* Rewards Redeemed */
            , React.createElement('div', { className: "flex flex-col items-center text-center gap-1.5" }
              , React.createElement('div', { className: "w-12 h-12 rounded-full flex items-center justify-center", style: { background: "#FEF3E2" } }
                , React.createElement(Gift, { className: "h-6.5 w-6.5", style: { color: "#F97316" } })
              )
              , React.createElement('span', { className: "text-lg font-bold text-[#0F172A] leading-none" }, (redemptions?.length ?? 0).toLocaleString())
              , React.createElement('span', { className: "text-[9px] text-[#64748B] font-medium leading-tight" }, "Rewards")
              , React.createElement('span', { className: "text-[9px] font-semibold text-[#22C55E]" }, "↗ 12% this week")
            )
            /* Active Coupons */
            , React.createElement('div', { className: "flex flex-col items-center text-center gap-1.5" }
              , React.createElement('div', { className: "w-12 h-12 rounded-full flex items-center justify-center", style: { background: "#DBEAFE" } }
                , React.createElement(Tag, { className: "h-6.5 w-6.5", style: { color: "#3B82F6" } })
              )
              , React.createElement('span', { className: "text-lg font-bold text-[#0F172A] leading-none" }, (_optionalChain([analytics, 'optionalAccess', _3 => _3.activeCoupons]) ?? 0).toLocaleString())
              , React.createElement('span', { className: "text-[9px] text-[#64748B] font-medium leading-tight" }, "Coupons")
              , React.createElement('span', { className: "text-[9px] font-semibold text-[#F97316]" }, "🕐 expiring soon")
            )
          )
        )

        /* E. Quick Actions */
        , React.createElement('div', { className: "bg-white rounded-3xl shadow-sm p-5" }
          , React.createElement('div', { className: "flex items-center justify-between mb-4" }
            , React.createElement('span', { className: "text-base font-extrabold text-[#0F172A]" }, "Quick Actions")
          )
          , React.createElement('div', { className: "grid grid-cols-3 gap-3" }
            /* Create Coupon */
            , React.createElement('a', { href: "/dashboard/business/coupons", className: "flex flex-col items-center gap-2 active:scale-95 transition-transform" }
               , React.createElement('div', { className: "w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm", style: { background: "#FEF3E2" } }
                 , React.createElement(Ticket, { className: "h-7 w-7", style: { color: "#F97316" } })
               )
               , React.createElement('span', { className: "text-[11px] text-[#0F172A] font-bold text-center leading-tight" }, "Create Coupon")
            )
            /* Add Reward */
            , React.createElement('a', { href: "/dashboard/business/loyalty-config", className: "flex flex-col items-center gap-2 active:scale-95 transition-transform" }
               , React.createElement('div', { className: "w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm", style: { background: "#FDE8F0" } }
                 , React.createElement(Gift, { className: "h-7 w-7", style: { color: "#EC4899" } })
               )
               , React.createElement('span', { className: "text-[11px] text-[#0F172A] font-bold text-center leading-tight" }, "Add Reward")
            )
            /* Review Settings Quick Action */
            , React.createElement('button', {
                type: "button",
                onClick: (e) => {
                  e.preventDefault();
                  setIsEditingReview(true);
                  const isMobile = window.innerWidth < 768;
                  const targetId = isMobile ? "review-settings-card" : "review-settings-desktop-card";
                  document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
                },
                className: "flex flex-col items-center gap-2 active:scale-95 transition-transform bg-transparent border-0 outline-none"
              }
               , React.createElement('div', { className: "w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm", style: { background: "#FEF3E2" } }
                 , React.createElement(Star, { className: "h-7 w-7", style: { color: "#F97316" } })
               )
               , React.createElement('span', { className: "text-[11px] text-[#0F172A] font-bold text-center leading-tight" }, "Review Settings")
            )
          )
        )

        /* F. Check-in Overview */
        , React.createElement('div', { className: "bg-white rounded-3xl shadow-sm p-4" }
          , React.createElement('div', { className: "flex items-center justify-between mb-3" }
            , React.createElement('div', { className: "flex items-center gap-1.5" }
              , React.createElement(TrendingUp, { className: "h-5.5 w-5.5", style: { color: "#6D5DD3" } })
              , React.createElement('span', { className: "text-sm font-bold text-[#0F172A]" }, "Check-in Overview")
            )
            , React.createElement('div', { className: "flex items-center gap-1" }
              , ["Last Week", "Last Month", "Last 3 Months", "Custom Date"].map(range =>
                React.createElement('button', {
                  key: range,
                  onClick: () => setChartTimeRange(range),
                  className: "text-[9px] px-2 py-1 rounded-full font-bold transition-all duration-200",
                  style: chartTimeRange === range
                    ? { background: "#6D5DD3", color: "white" }
                    : { background: "#F1F5F9", color: "#64748B" }
                }, range === "Last Week" ? "1W" : range === "Last Month" ? "1M" : range === "Last 3 Months" ? "3M" : "📅")
              )
            )
          )
          , chartTimeRange === "Custom Date" && React.createElement('div', { className: "flex items-center gap-2 mb-3 bg-slate-50 p-2 rounded-2xl border border-slate-100/70" }
              , React.createElement('div', { className: "flex-1 flex flex-col gap-0.5" }
                  , React.createElement('span', { className: "text-[9px] text-[#64748B] font-bold" }, "Start Date")
                  , React.createElement('input', {
                      type: "date",
                      value: startDate,
                      onChange: (e) => setStartDate(e.target.value),
                      className: "w-full text-xs font-bold bg-white border border-slate-200/50 rounded-lg p-1.5 outline-none"
                    })
                )
              , React.createElement('div', { className: "flex-1 flex flex-col gap-0.5" }
                  , React.createElement('span', { className: "text-[9px] text-[#64748B] font-bold" }, "End Date")
                  , React.createElement('input', {
                      type: "date",
                      value: endDate,
                      onChange: (e) => setEndDate(e.target.value),
                      className: "w-full text-xs font-bold bg-white border border-slate-200/50 rounded-lg p-1.5 outline-none"
                    })
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
              , React.createElement(Star, { className: "h-5.5 w-5.5", style: { color: "#6D5DD3" } })
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
          /* Google — full-width highlighted row */
          , React.createElement('a', {
              href: revGoogleUrl || undefined,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "flex items-center gap-3 p-3 rounded-2xl mb-2 border-2 transition-all duration-200",
              style: {
                background: revGoogleUrl ? "linear-gradient(135deg, #FFF8F4 0%, #FFF3EA 100%)" : "#F8FAFC",
                borderColor: revGoogleUrl ? "#F97316" : "#E2E8F0",
                boxShadow: revGoogleUrl ? "0 4px 16px rgba(249, 115, 22, 0.15)" : "none",
                textDecoration: "none"
              }
            }
            , React.createElement('div', { className: "relative shrink-0" }
              , React.createElement('img', { src: "/google-reviews-logo.png", alt: "Google", className: "w-10 h-10 object-contain rounded-full shadow-sm bg-white" })
              , revGoogleUrl && React.createElement('div', {
                  className: "absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center"
                }
                , React.createElement('span', { className: "text-white text-[7px] font-black" }, "✓")
              )
            )
            , React.createElement('div', { className: "flex-1 min-w-0" }
              , React.createElement('div', { className: "flex items-center gap-2" }
                , React.createElement('span', { className: "text-[11px] font-extrabold text-[#0F172A]" }, "Google Reviews")
                , React.createElement('span', { className: "text-[8px] font-black px-1.5 py-0.5 rounded-full", style: { background: "#F97316", color: "white" } }, "POPULAR")
              )
              , React.createElement('span', { className: "text-[9px] font-semibold", style: { color: revGoogleUrl ? "#22C55E" : "#94A3B8" } }
                , revGoogleUrl ? "✓ Connected — Tap to open" : "Not set — Click Manage to connect"
              )
            )
            , revGoogleUrl && React.createElement(ExternalLink, { className: "h-3.5 w-3.5 shrink-0", style: { color: "#F97316" } })
          )
          /* Instagram + Facebook — 2-col grid */
          , React.createElement('div', { className: "grid grid-cols-2 gap-2" }
            , React.createElement(revInstagramUrl ? 'a' : 'div', {
                href: revInstagramUrl || undefined,
                target: revInstagramUrl ? "_blank" : undefined,
                rel: revInstagramUrl ? "noopener noreferrer" : undefined,
                className: cn("flex items-center gap-2 p-2.5 rounded-2xl border transition-all duration-200", revInstagramUrl ? "hover:scale-[1.02] active:scale-98" : ""),
                style: { background: revInstagramUrl ? "#FDE8F5" : "#F8FAFC", borderColor: revInstagramUrl ? "#E1306C" : "#E2E8F0", textDecoration: "none", cursor: revInstagramUrl ? "pointer" : "default" }
              }
              , React.createElement('img', { src: "/Instagram_icon.png", alt: "Instagram", className: "w-8 h-8 object-contain rounded-full shadow-sm shrink-0" })
              , React.createElement('div', { className: "min-w-0" }
                , React.createElement('p', { className: "text-[10px] font-bold text-[#0F172A] truncate" }, "Instagram")
                , React.createElement('p', { className: "text-[9px] font-semibold", style: { color: revInstagramUrl ? "#E1306C" : "#94A3B8" } }, revInstagramUrl ? "✓ Set" : "Not set")
              )
            )
            , React.createElement(revFacebookUrl ? 'a' : 'div', {
                href: revFacebookUrl || undefined,
                target: revFacebookUrl ? "_blank" : undefined,
                rel: revFacebookUrl ? "noopener noreferrer" : undefined,
                className: cn("flex items-center gap-2 p-2.5 rounded-2xl border transition-all duration-200", revFacebookUrl ? "hover:scale-[1.02] active:scale-98" : ""),
                style: { background: revFacebookUrl ? "#E7F0FD" : "#F8FAFC", borderColor: revFacebookUrl ? "#1877F2" : "#E2E8F0", textDecoration: "none", cursor: revFacebookUrl ? "pointer" : "default" }
              }
              , React.createElement('img', { src: "/Facebook_f_logo_(2021).svg.webp", alt: "Facebook", className: "w-8 h-8 object-contain rounded-full shadow-sm shrink-0" })
              , React.createElement('div', { className: "min-w-0" }
                , React.createElement('p', { className: "text-[10px] font-bold text-[#0F172A] truncate" }, "Facebook")
                , React.createElement('p', { className: "text-[9px] font-semibold", style: { color: revFacebookUrl ? "#1877F2" : "#94A3B8" } }, revFacebookUrl ? "✓ Set" : "Not set")
              )
            )
          )
        )

        /* QR Code Card (mobile) */
        , primaryBranch && React.createElement('div', { className: "bg-white rounded-3xl shadow-sm p-4" }
          , React.createElement('div', { className: "flex items-center gap-2 mb-3" }
            , React.createElement(QrCode, { className: "h-5.5 w-5.5", style: { color: "#F97316" } })
            , React.createElement('span', { className: "text-sm font-bold text-[#0F172A]" }, "Customer Check-in QR Code")
          )
          , React.createElement('div', { className: "flex flex-col items-center gap-3" }
            , React.createElement('div', {
                className: "rounded-2xl border-2 border-dashed p-3 flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-all",
                style: { borderColor: "#FED7AA" },
                onClick: () => setShowQrModal(true)
              }
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
        , React.createElement('div', { id: "review-settings-card", className: "bg-white rounded-3xl shadow-sm p-4" }
          , React.createElement('div', { className: "flex items-center justify-between mb-3" }
            , React.createElement('span', { className: "text-sm font-bold text-[#0F172A]" }, "⭐ AI Review Settings")
          )
          , !isEditingReview && (bizType || revGoogleUrl)
            ? React.createElement('div', { className: "grid grid-cols-2 gap-2 text-xs" }
              , React.createElement('div', { className: "p-3 rounded-2xl", style: { background: "#F8FAFC" } }
                , React.createElement('p', { className: "text-[9px] text-[#94A3B8] uppercase tracking-wider font-bold mb-1" }, "Business Type")
                , React.createElement('p', { className: "font-bold text-[#0F172A]" }, bizType || "—")
              )
              , React.createElement('div', { className: "p-3 rounded-2xl", style: { background: "#F8FAFC" } }
                , React.createElement('p', { className: "text-[9px] text-[#94A3B8] uppercase tracking-wider font-bold mb-1" }, "Google Review")
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

        /* F. Check-in Overview (Desktop) */
        , React.createElement(Card, { className: "border-border shadow-sm rounded-xl overflow-hidden" }
          , React.createElement(CardHeader, { className: "p-6 pb-2 border-b border-slate-100 flex flex-row items-center justify-between" }
            , React.createElement('div', null
              , React.createElement(CardTitle, { className: "text-base font-bold text-[#0F172A] flex items-center gap-2" }
                , React.createElement(TrendingUp, { className: "h-4 w-4", style: { color: "#6D5DD3" } })
                , "Check-in Overview"
              )
              , React.createElement(CardDescription, { className: "text-xs text-muted-foreground mt-1" }, "Check-in velocity and active engagement tracking")
            )
            , React.createElement('div', { className: "flex items-center gap-2" }
              , chartTimeRange === "Custom Date" && React.createElement('div', { className: "flex items-center gap-2 text-xs" }
                  , React.createElement('input', {
                      type: "date",
                      value: startDate,
                      onChange: (e) => setStartDate(e.target.value),
                      className: "text-xs font-bold border border-slate-200 rounded-lg p-1.5 outline-none bg-white"
                    })
                  , React.createElement('span', { className: "text-slate-400 font-bold" }, "to")
                  , React.createElement('input', {
                      type: "date",
                      value: endDate,
                      onChange: (e) => setEndDate(e.target.value),
                      className: "text-xs font-bold border border-slate-200 rounded-lg p-1.5 outline-none bg-white"
                    })
                )
              , React.createElement('div', { className: "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-[#64748B] font-bold border border-slate-200 bg-white shadow-sm relative cursor-pointer hover:bg-slate-50 transition-colors" }
                , React.createElement('select', {
                    value: chartTimeRange,
                    onChange: (e) => setChartTimeRange(e.target.value),
                    className: "bg-transparent outline-none cursor-pointer pr-4 font-bold text-[#64748B] appearance-none focus:outline-none"
                  }
                  , React.createElement('option', { value: "Last Week" }, "Last Week")
                  , React.createElement('option', { value: "Last Month" }, "Last Month")
                  , React.createElement('option', { value: "Last 3 Months" }, "Last 3 Months")
                  , React.createElement('option', { value: "Custom Date" }, "Custom Date")
                )
                , React.createElement(ChevronDown, { className: "h-3.5 w-3.5 absolute right-2 pointer-events-none text-slate-400" })
              )
            )
          )
          , React.createElement(CardContent, { className: "p-6" }
            , React.createElement('div', { style: { height: "240px" } }
              , React.createElement(ResponsiveContainer, { width: "100%", height: "100%" }
                , React.createElement(AreaChart, { data: chartData, margin: { top: 10, right: 10, bottom: 0, left: -20 } }
                  , React.createElement('defs', null
                    , React.createElement('linearGradient', { id: "checkinGradDesktop", x1: "0", y1: "0", x2: "0", y2: "1" }
                      , React.createElement('stop', { offset: "5%", stopColor: "#6D5DD3", stopOpacity: 0.3 })
                      , React.createElement('stop', { offset: "95%", stopColor: "#6D5DD3", stopOpacity: 0 })
                    )
                  )
                  , React.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: "#F1F5F9", vertical: false })
                  , React.createElement(XAxis, { dataKey: "day", tick: { fill: "#64748B", fontSize: 11, fontWeight: 500 }, axisLine: false, tickLine: false, dy: 10 })
                  , React.createElement(YAxis, { tick: { fill: "#64748B", fontSize: 11, fontWeight: 500 }, axisLine: false, tickLine: false, ticks: [0, 25, 50, 75, 100] })
                  , React.createElement(Tooltip, { contentStyle: { background: "white", border: "1px solid #E2E8F0", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", fontSize: "12px", fontWeight: "bold", color: "#0F172A" }, itemStyle: { color: "#6D5DD3", fontWeight: "bold" }, cursor: { fill: "#F8FAFC" } })
                  , React.createElement(Area, { type: "monotone", dataKey: "value", stroke: "#6D5DD3", strokeWidth: 3, fill: "url(#checkinGradDesktop)", dot: { fill: "white", r: 4, stroke: "#6D5DD3", strokeWidth: 2 }, activeDot: { r: 6, fill: "#6D5DD3", stroke: "white", strokeWidth: 2 } })
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
                    ? React.createElement('div', { 
                        onClick: () => setShowQrModal(true),
                        className: "relative flex items-center justify-center bg-white cursor-pointer" 
                      }
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
            , React.createElement(Card, { id: "review-settings-desktop-card", className: "glass" }
              , !isEditingReview && (bizType || revGoogleUrl || revInstagramUrl || revFacebookUrl)
                ? React.createElement(React.Fragment, null
                  , React.createElement(CardHeader, { className: "pb-4 border-b border-slate-100/50 flex flex-row items-center justify-between space-y-0" }
                    , React.createElement('div', null
                      , React.createElement(CardTitle, { className: "text-base font-bold text-foreground flex items-center gap-2" }, "⭐ AI Review Settings")
                      , React.createElement(CardDescription, { className: "text-[10px] text-muted-foreground mt-0.5" }, "Currently active AI review generation settings")
                    )
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

      /* QR Viewer Modal */
      , showQrModal && primaryBranch && (
        React.createElement(Dialog, { open: showQrModal, onOpenChange: (open) => !open && setShowQrModal(false) }
          , React.createElement(DialogContent, { className: "max-w-[440px] bg-white border border-border" }
            , React.createElement(DialogHeader, { className: "text-center" }
              , React.createElement(DialogTitle, { className: "text-lg font-bold" }, primaryBranch.name)
              , React.createElement(DialogDescription, { className: "text-xs" }, "Permanent Counter Check-in QR Code")
            )
            , React.createElement('div', { className: "flex flex-col items-center justify-center p-4 space-y-4" }
              , React.createElement('div', { className: "rounded-xl bg-white p-3 border border-white/10 shadow-2xl" }
                , primaryBranch.qrImage ? (
                  React.createElement('div', { className: "relative flex items-center justify-center bg-white" }
                    , React.createElement('img', { src: primaryBranch.qrImage, alt: "Branch QR Code", className: "h-80 w-80 rounded-xl" })
                    , React.createElement('div', { className: "absolute w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-md border border-[#FF6A00]/25" }
                      , React.createElement('span', { className: "text-base font-black tracking-tight bg-gradient-to-tr from-[#FF6A00] to-[#800020] bg-clip-text text-transparent" }, "LS")
                    )
                  )
                ) : (
                  React.createElement('div', { className: "h-80 w-80 flex items-center justify-center" }
                    , React.createElement(Loader2, { className: "h-8 w-8 animate-spin text-zinc-500" })
                  )
                )
              )
              , React.createElement('p', { className: "text-[10px] text-zinc-500 text-center max-w-xs" }, "Stick this permanent QR code inside your shop. Customers scan this to verify their location and check in.")
              , primaryBranch.qrPayload && (
                React.createElement('div', { className: "w-full space-y-1 text-center bg-slate-50 border border-border/60 rounded-lg p-2.5" }
                  , React.createElement('span', { className: "text-[9px] font-bold text-muted-foreground uppercase tracking-wider block" }, "Testing QR Link (Copy & Paste):")
                  , React.createElement('a', { href: primaryBranch.qrPayload, target: "_blank", rel: "noreferrer", className: "text-[10px] text-primary hover:underline break-all block font-mono select-all" }, primaryBranch.qrPayload)
                )
              )
            )
            , React.createElement(DialogFooter, { className: "flex gap-2" }
              , React.createElement(Button, {
                  variant: "outline",
                  className: "flex-1 text-xs",
                  onClick: handleDownloadPdf,
                  disabled: pdfLoading || !primaryBranch.qrImage
                }
                , pdfLoading ? React.createElement(Loader2, { className: "mr-1.5 h-3.5 w-3.5 animate-spin" }) : null
                , "Download PDF"
              )
              , React.createElement(Button, {
                  className: "flex-1 text-xs bg-primary text-white hover:bg-primary/95",
                  onClick: handleDownloadQr,
                  disabled: !primaryBranch.qrImage
                }
                , "Download PNG"
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

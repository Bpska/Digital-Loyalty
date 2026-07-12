const _jsxFileName = "src\\pages\\(customer)\\dashboard\\page.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }"use client";

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getImageUrl } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Gift, Coffee, Star, Stamp, MapPin, Award, CheckCircle2, Loader2,
  ChevronRight, QrCode, Tag, Percent, Banknote, Clock, Zap, CalendarDays, RefreshCcw,
  Scissors, Hotel, Store, Sparkles, Bell, LayoutDashboard, Wallet, ChevronLeft, Building2, Utensils, User, History, Scan, Search
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

// Lazy-load SubscriberMap to prevent SSR/compilation window reference errors
const SubscriberMap = React.lazy(() => import("@/components/SubscriberMap"));

// Helper to calculate distance in km
const getDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 99999;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

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

function formatDiscount(coupon) {
  if (coupon.discountType === "PERCENTAGE") {
    return `${Number(coupon.discountValue)}% OFF`;
  }
  return `₹${Number(coupon.discountValue)} OFF`;
}

function daysLeft(validTo) {
  const diff = Math.ceil((new Date(validTo) - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return "Expires today";
  if (diff === 1) return "1 day left";
  return `${diff} days left`;
}

function getCategoryIcon(category) {
  const norm = (category || "").toLowerCase().trim();
  if (norm.includes("salon") || norm.includes("spa") || norm.includes("beauty") || norm.includes("hair")) {
    return Scissors;
  }
  if (norm.includes("cafe") || norm.includes("coffee") || norm.includes("restaurant") || norm.includes("food") || norm.includes("bakery")) {
    return Coffee;
  }
  if (norm.includes("hotel") || norm.includes("resort") || norm.includes("stay") || norm.includes("hostel")) {
    return Hotel;
  }
  return Store;
}

function getCategoryStampIcon(category) {
  const norm = (category || "").toLowerCase().trim();
  if (norm.includes("salon") || norm.includes("spa") || norm.includes("beauty") || norm.includes("hair")) {
    return Star;
  }
  if (norm.includes("hotel") || norm.includes("resort") || norm.includes("stay") || norm.includes("hostel")) {
    return Hotel;
  }
  return Coffee;
}

// ─── Nearby places data ───────────────────────────────────────────────────────
const NEARBY_PLACES = [
  {
    id: "nearby-1",
    name: "Brew Club Cafe",
    category: "Cafes",
    rating: "4.5",
    distance: "0.8 km",
    isOpen: true,
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&auto=format&fit=crop&q=60"
  },
  {
    id: "nearby-2",
    name: "Hotel Vinayak Residency",
    category: "Hotels",
    rating: "4.2",
    distance: "1.2 km",
    isOpen: true,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=150&auto=format&fit=crop&q=60"
  },
  {
    id: "nearby-3",
    name: "Royal Tandoor Restaurant",
    category: "Restaurants",
    rating: "4.7",
    distance: "0.5 km",
    isOpen: true,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&auto=format&fit=crop&q=60"
  },
  {
    id: "nearby-4",
    name: "Styliss Salon & Spa",
    category: "Salons",
    rating: "4.6",
    distance: "1.5 km",
    isOpen: true,
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=150&auto=format&fit=crop&q=60"
  },
  {
    id: "nearby-5",
    name: "The Daily Roast Cafe",
    category: "Cafes",
    rating: "4.4",
    distance: "1.1 km",
    isOpen: false,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=150&auto=format&fit=crop&q=60"
  }
];

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["customerDashboard"],
    queryFn: () => api.get("/customer/dashboard").then((res) => res.data),
  });

  const { data: rewardsData } = useQuery({
    queryKey: ["customerRewards"],
    queryFn: () => api.get("/customer/rewards").then((res) => res.data),
  });

  const [selectedReward, setSelectedReward] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [lastData, setLastData] = useState(null);
  const [redemptionSuccessPlace, setRedemptionSuccessPlace] = useState(null);

  const [cardIndex, setCardIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Map Modal States
  const [showMapModal, setShowMapModal] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapRenderDelay, setMapRenderDelay] = useState(false);

  const { data: nearbyBranchesData } = useQuery({
    queryKey: ["nearbyBranches"],
    queryFn: () => api.get("/customer/nearby-branches").then((res) => res.data),
  });
  const branches = nearbyBranchesData?.data || [];

  const handleOpenMap = () => {
    setShowMapModal(true);
    setMapLoading(true);
    setMapRenderDelay(false);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setMapLoading(false);
          setTimeout(() => setMapRenderDelay(true), 350);
        },
        (err) => {
          console.warn("Could not retrieve current location, using default", err);
          setUserCoords({ lat: 20.271, lng: 85.833 }); // Default to Bhubaneswar
          setMapLoading(false);
          setTimeout(() => setMapRenderDelay(true), 350);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setUserCoords({ lat: 20.271, lng: 85.833 });
      setMapLoading(false);
      setTimeout(() => setMapRenderDelay(true), 350);
    }
  };

  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.clientWidth;
    if (width > 0) {
      const index = Math.round(scrollLeft / width);
      setCardIndex(index);
    }
  };

  useEffect(() => {
    const intervalTime = selectedReward ? 2000 : 15000;
    const id = setInterval(refetch, intervalTime);
    return () => clearInterval(id);
  }, [refetch, selectedReward]);

  useEffect(() => {
    if (data && lastData && selectedReward) {
      const isRewardActive = data.unlockedRewards?.some(r => r.id === selectedReward.id) ||
        data.claimedCoupons?.some(c => c.id === selectedReward.id);

      const wasRewardActive = lastData.unlockedRewards?.some(r => r.id === selectedReward.id) ||
        lastData.claimedCoupons?.some(c => c.id === selectedReward.id);

      if (wasRewardActive && !isRewardActive) {
        const biz = selectedReward.reward?.business || selectedReward.coupon?.business;
        const discountType = selectedReward.coupon?.discountType;
        const discountValue = selectedReward.coupon?.discountValue;
        setRedemptionSuccessPlace({
          businessName: biz?.name || "the business",
          googleReviewUrl: biz?.googleReviewUrl || null,
          title: selectedReward.reward?.title || selectedReward.coupon?.offerTitle || selectedReward.coupon?.title,
          discountText: discountValue ? (discountType === 'PERCENTAGE' ? `${parseFloat(discountValue)}% OFF` : `₹${parseFloat(discountValue)} OFF`) : null
        });
        setSelectedReward(null);
      }
    }
    if (data && data !== lastData) {
      setLastData(data);
    }
  }, [data, lastData, selectedReward]);

  const [claimingId, setClaimingId] = useState(null);
  const claimCouponMutation = useMutation({
    mutationFn: (couponId) => { setClaimingId(couponId); return api.post(`/coupons/${couponId}/claim`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customerDashboard"] });
      setClaimingId(null);
      alert("Coupon claimed! It is now in your vouchers — tap 'Redeem Now' at the counter.");
    },
    onError: (err) => { setClaimingId(null); alert(err.message || "Failed to claim coupon"); },
  });

  if (isLoading) {
    return React.createElement("div", { className: "space-y-4 animate-pulse p-4" }
      , React.createElement("div", { className: "h-12 w-3/4 bg-slate-200 rounded-2xl" })
      , React.createElement("div", { className: "h-40 w-full bg-slate-200 rounded-3xl" })
      , React.createElement("div", { className: "h-48 w-full bg-slate-200 rounded-3xl" })
    );
  }

  const {
    loyaltyCards = [],
    unlockedRewards = [],
    activeCampaigns = [],
    activeEventCoupons = [],
    claimedCoupons = []
  } = data || {};

  const totalPoints = (rewardsData?.totalPointsEarned ?? rewardsData?.data?.totalPointsEarned ?? loyaltyCards.reduce((sum, card) => sum + (card.totalPoints || 0), 0)) || 0;

  // Filter loyalty cards by search query
  const filteredLoyaltyCards = loyaltyCards.filter(card => 
    card.business?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter nearby places
  const filteredPlaces = (activeFilter === "All"
    ? NEARBY_PLACES
    : NEARBY_PLACES.filter(p => p.category === activeFilter)
  ).filter(place => 
    place.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter nearby active branches that have planId (purchased plan) and within 2 km
  const nearbyBranches = branches.filter((b) => {
    if (!b.business?.planId) return false;
    if (!userCoords) return true;
    const dist = getDistance(userCoords.lat, userCoords.lng, parseFloat(b.latitude), parseFloat(b.longitude));
    return dist <= 2.0; // 2km radius
  });

  const displayBranches = nearbyBranches.length > 0 
    ? nearbyBranches 
    : branches.filter(b => b.business?.planId);

  const isTestingFallback = nearbyBranches.length === 0 && displayBranches.length > 0;

  return (
    React.createElement('div', { className: "space-y-6 pb-12" }

      /* B. Greeting row */
      , React.createElement('div', { className: "flex items-center justify-between gap-3" }
        , React.createElement('div', null
          , React.createElement('h2', { className: "text-[22px] font-black text-[#0F172A] leading-tight" }, `Namaste ${user?.name?.split(" ")?.[0] || ""}! 👋`)
          , React.createElement('p', { className: "text-xs text-[#64748B] mt-0.5" }, "Keep exploring, keep earning")
        )
        , React.createElement(Link, { to: "/loyalty-history", className: "bg-white border border-slate-200 rounded-full px-3.5 py-1.5 flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-colors shrink-0" }
          , React.createElement(Star, { className: "h-4 w-4 text-amber-500 fill-amber-500 shrink-0" })
          , React.createElement('div', { className: "text-left leading-none" }
            , React.createElement('span', { className: "text-sm font-black text-[#0F172A]" }, totalPoints)
            , React.createElement('span', { className: "block text-[8px] text-[#64748B] font-bold mt-0.5" }, "Total Points")
          )
          , React.createElement(ChevronRight, { className: "h-3.5 w-3.5 text-[#64748B]" })
        )
      )

      /* Search Option */
      , React.createElement('div', { className: "px-1" }
        , React.createElement('div', { className: "relative flex items-center bg-white border border-slate-200 rounded-2xl shadow-sm px-3.5 py-1.5 focus-within:border-primary transition-colors" }
          , React.createElement(Search, { className: "h-4 w-4 text-[#94A3B8] mr-2.5 shrink-0" })
          , React.createElement('input', {
              type: "text",
              placeholder: "Search shop name...",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              className: "w-full bg-transparent text-xs py-1 focus:outline-none text-[#0F172A] placeholder-slate-400 font-semibold"
            })
        )
      )

      /* C. Dark promo hero card */
      , React.createElement('div', { className: "bg-[#0F172A] rounded-3xl p-6 text-white shadow-sm relative overflow-hidden flex justify-between items-center" }
        , React.createElement('div', { className: "space-y-4 z-10 w-3/5" }
          , React.createElement('div', { className: "space-y-1" }
            , React.createElement('h3', { className: "text-xl font-bold text-white tracking-tight" }, "Scan. Earn. Enjoy!")
            , React.createElement('p', { className: "text-xs text-white/95 leading-relaxed" }
              , "Keep loyalty points at your "
              , React.createElement('span', { className: "text-[#F97316] font-bold" }, "favourite places")
            )
          )
          , React.createElement(Link, { to: "/checkin", className: "inline-flex items-center gap-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-sm transition-transform active:scale-95" }
            , React.createElement(MapPin, { className: "h-3.5 w-3.5" })
            , "Find Nearby Places"
          )
        )
        , React.createElement('div', { className: "absolute right-0 top-0 h-full w-2/5 pointer-events-none select-none flex items-center justify-end pr-4" }
          , React.createElement("svg", { viewBox: "0 0 120 120", className: "h-24 w-24 opacity-95", fill: "none" }
            /* Store building */
            , React.createElement("rect", { x: 30, y: 55, width: 60, height: 45, rx: 6, fill: "#F8FAFC" })
            /* Awning stripes */
            , React.createElement("path", { d: "M 26 55 L 94 55 L 86 42 L 34 42 Z", fill: "#F97316" })
            , React.createElement("path", { d: "M 34 42 L 44 42 L 38 55 L 28 55 Z", fill: "#FFFFFF" })
            , React.createElement("path", { d: "M 54 42 L 64 42 L 58 55 L 48 55 Z", fill: "#FFFFFF" })
            , React.createElement("path", { d: "M 74 42 L 84 42 L 78 55 L 68 55 Z", fill: "#FFFFFF" })
            /* Floating Map Pin */
            , React.createElement("path", { d: "M 60 10 C 50 10 42 18 42 28 C 42 40 60 52 60 52 C 60 52 78 40 78 28 C 78 18 70 10 60 10 Z", fill: "#F97316" })
            , React.createElement("circle", { cx: 60, cy: 26, r: 6, fill: "#FFFFFF" })
            /* Overlapping QR code card */
            , React.createElement("rect", { x: 70, y: 75, width: 35, height: 35, rx: 6, fill: "#FFFFFF", stroke: "#E2E8F0", strokeWidth: "1.5" })
            , React.createElement("rect", { x: 76, y: 81, width: 8, height: 8, fill: "#0F172A" })
            , React.createElement("rect", { x: 91, y: 81, width: 8, height: 8, fill: "#0F172A" })
            , React.createElement("rect", { x: 76, y: 96, width: 8, height: 8, fill: "#0F172A" })
            , React.createElement("rect", { x: 88, y: 92, width: 11, height: 11, fill: "#F97316", rx: 1 })
          )
        )
      )

      /* Vouchers Ready to Redeem (Unlocked Rewards / Claimed Coupons) */
      , (unlockedRewards.length > 0 || claimedCoupons.length > 0) && React.createElement('div', { className: "space-y-3" }
        , React.createElement('div', { className: "flex items-center justify-between" }
          , React.createElement('h3', { className: "font-black text-sm text-[#0F172A] tracking-tight uppercase" }, `Vouchers Ready (${unlockedRewards.length + claimedCoupons.length})`)
          , React.createElement(Link, { to: "/history", className: "text-xs font-bold text-[#F97316]" }, "History")
        )
        , React.createElement('div', { className: "flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none -mx-4 px-4" }
          , unlockedRewards.map(reward =>
              React.createElement(Card, {
                key: reward.id,
                className: "w-72 shrink-0 snap-center border-[#DCFCE7] bg-[#F0FDF4]/60 hover:bg-[#F0FDF4] transition-all cursor-pointer shadow-sm rounded-3xl p-4 space-y-3",
                onClick: () => setSelectedReward(reward)
              }
                , React.createElement('div', { className: "flex justify-between items-start" }
                  , React.createElement('span', { className: "text-[9px] bg-[#DCFCE7] text-[#16A34A] font-extrabold px-2.5 py-0.5 rounded-full border border-[#BBF7D0]" }, "Unlocked")
                  , React.createElement(Award, { className: "h-4.5 w-4.5 text-[#16A34A]" })
                )
                , React.createElement('div', { className: "space-y-1" }
                  , React.createElement('h4', { className: "text-sm font-black text-[#0F172A] leading-snug" }, reward.reward.title)
                  , React.createElement('p', { className: "text-[10px] text-[#64748B] line-clamp-1" }, reward.reward.description || "Show to staff to redeem your gift")
                )
                , React.createElement('div', { className: "flex items-center justify-between gap-2 pt-2 border-t border-[#DCFCE7]" }
                  , React.createElement('div', { className: "min-w-0" }
                    , React.createElement('p', { className: "text-[9px] text-[#64748B] uppercase font-bold" }, reward.reward?.business?.name)
                    , React.createElement('code', { className: "text-[10px] font-mono font-bold text-[#16A34A]" }, reward.redemptionCode.toUpperCase())
                  )
                  , React.createElement(Button, { size: "xs", className: "bg-[#16A34A] hover:bg-[#15803D] text-white font-bold rounded-full px-3 py-1.5 text-[10px]" }, "Redeem Now")
                )
              )
            )
          , claimedCoupons.map(claim =>
              React.createElement(Card, {
                key: claim.id,
                className: "w-72 shrink-0 snap-center border-[#FFEDD5] bg-[#FFF8F2]/60 hover:bg-[#FFF8F2] transition-all cursor-pointer shadow-sm rounded-3xl p-4 space-y-3",
                onClick: () => setSelectedReward(claim)
              }
                , React.createElement('div', { className: "flex justify-between items-start" }
                  , React.createElement('div', { className: "flex gap-1" }
                    , React.createElement('span', { className: "text-[9px] bg-[#FFEDD5] text-[#F97316] font-extrabold px-2.5 py-0.5 rounded-full border border-[#FFE3E3]" }, "Claimed")
                    , claim.coupon?.discountValue && React.createElement('span', { className: "text-[9px] bg-[#DCFCE7] text-[#16A34A] font-extrabold px-2 py-0.5 rounded-full border border-[#BBF7D0]" }
                        , claim.coupon.discountType === 'PERCENTAGE' ? `${parseFloat(claim.coupon.discountValue)}% OFF` : `₹${parseFloat(claim.coupon.discountValue)} OFF`
                      )
                  )
                  , React.createElement(Tag, { className: "h-4.5 w-4.5 text-[#F97316]" })
                )
                , React.createElement('div', { className: "space-y-1" }
                  , React.createElement('h4', { className: "text-sm font-black text-[#0F172A] leading-snug" }, claim.coupon.offerTitle || claim.coupon.title)
                  , React.createElement('p', { className: "text-[10px] text-[#64748B] line-clamp-1" }, claim.coupon.offerDescription || claim.coupon.description || "Show QR to cashier to redeem at counter")
                )
                , React.createElement('div', { className: "flex items-center justify-between gap-2 pt-2 border-t border-[#FFEDD5]" }
                  , React.createElement('div', { className: "min-w-0" }
                    , React.createElement('p', { className: "text-[9px] text-[#64748B] uppercase font-bold" }, claim.coupon?.business?.name)
                    , React.createElement('code', { className: "text-[10px] font-mono font-bold text-[#F97316]" }, claim.redemptionCode.toUpperCase())
                  )
                  , React.createElement(Button, { size: "xs", className: "bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-full px-3 py-1.5 text-[10px]" }, "Redeem Now")
                )
              )
            )
        )
      )

      /* D. "Your Loyalty Cards" section */
      , React.createElement('div', { className: "space-y-4" }
        , React.createElement('div', { className: "flex items-center justify-between" }
          , React.createElement('h3', { className: "font-black text-base text-[#0F172A] tracking-tight" }, "Your Loyalty Cards")
          , React.createElement(Link, { to: "/loyalty-history", className: "text-xs font-bold text-[#F97316]" }, "View All")
        )

        , loyaltyCards.length === 0 ? (
            React.createElement(Card, { className: "border-dashed border-slate-200 bg-slate-50/50 py-10 text-center rounded-3xl" }
              , React.createElement(CardContent, { className: "flex flex-col items-center justify-center space-y-3" }
                , React.createElement('div', { className: "w-12 h-12 rounded-full bg-[#FFEDD5] flex items-center justify-center" }
                    , React.createElement(Coffee, { className: "h-6 w-6 text-[#F97316]" })
                  )
                , React.createElement('p', { className: "text-sm text-[#0F172A] font-bold" }, "No loyalty cards yet")
                , React.createElement('p', { className: "text-xs text-[#64748B] max-w-xs" }, "Scan a business QR code to sign up and start earning stamps!")
                , React.createElement(Link, { to: "/checkin", className: "mt-2 bg-[#F97316] text-white font-bold rounded-full text-xs px-5 py-2.5 flex items-center gap-1 hover:bg-[#EA580C] active:scale-95 transition-all shadow-sm" }
                    , React.createElement(Scan, { className: "h-4 w-4" }), "Scan Merchant QR"
                  )
              )
            )
          ) : filteredLoyaltyCards.length === 0 ? (
            React.createElement(Card, { className: "border-dashed border-slate-200 bg-slate-50/50 py-8 text-center rounded-3xl" }
              , React.createElement(CardContent, { className: "text-xs text-muted-foreground" }, "No matching shops found.")
            )
          ) : (
            React.createElement(React.Fragment, null
              /* Horizontal swipeable container */
              , React.createElement('div', {
                  onScroll: handleScroll,
                  className: "flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-4 px-4 pb-2"
                }
                , filteredLoyaltyCards.map((card, idx) => {
                    const business = card.business;
                    const stamps = card.wallet?.currentStamps || 0;
                    const required = card.settings?.requiredStamps || 7;
                    const iconName = business.category === "Hotels" ? "hotel" : business.category === "Cafes" ? "coffee" : "store";
                    const StampIcon = getCategoryStampIcon(business.category);

                    return React.createElement('div', {
                      key: card.id,
                      onClick: () => setSelectedBusiness(card),
                      className: "w-[calc(100vw-2.5rem)] shrink-0 snap-center bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between space-y-4"
                    }
                      /* Top row */
                      , React.createElement('div', { className: "flex items-start justify-between gap-3" }
                        , React.createElement('div', { className: "flex items-center gap-3" }
                          , React.createElement('div', { className: "w-11 h-11 bg-[#F97316] rounded-2xl flex items-center justify-center shrink-0 shadow-sm" }
                            , React.createElement(BrandIcon, {
                                iconName: business.brandAsset?.loyaltyIcon,
                                customUrl: business.brandAsset?.logoUrl || business.logoUrl,
                                defaultIcon: getCategoryIcon(business.category),
                                className: "h-5 w-5 text-white"
                              })
                          )
                          , React.createElement('div', { className: "space-y-0.5" }
                            , React.createElement('h4', { className: "font-black text-sm text-[#0F172A] truncate max-w-[140px]" }, business.name)
                            , React.createElement('div', { className: "flex items-center gap-1.5" }
                              , React.createElement('span', { className: "text-[9px] bg-[#DCFCE7] text-[#22C55E] font-extrabold px-1.5 py-0.5 rounded-full" }, "Active")
                              , React.createElement('span', { className: "text-[9px] text-[#64748B] font-bold" }, business.category || "Hotels")
                            )
                          )
                        )
                        , React.createElement('div', { className: "bg-[#FFEDD5] text-[#F97316] font-black text-[10px] px-2.5 py-1 rounded-full shrink-0" }
                          , `${card.totalVisits || 1} Visit${(card.totalVisits || 1) > 1 ? "s" : ""}`
                        )
                      )

                      /* Stamp Progress info */
                      , React.createElement('div', { className: "space-y-3" }
                        , React.createElement('div', { className: "flex items-center justify-between text-xs" }
                          , React.createElement('span', { className: "font-bold text-[#64748B]" }, "Stamp Progress")
                          , React.createElement('span', { className: "font-black text-[#F97316]" }, `${stamps} / ${required}`)
                        )

                        /* Row of stamp circles */
                        , React.createElement('div', { className: "flex flex-wrap gap-2 pt-0.5" }
                          , Array.from({ length: required }).map((_, i) => {
                              const active = i < stamps;
                              const isNext = i === stamps;
                              return React.createElement('div', {
                                key: i,
                                className: cn("w-10 h-10 rounded-full flex items-center justify-center transition-all"
                                  , active ? "bg-[#F97316] text-white shadow-sm scale-105"
                                  : isNext ? "border-2 border-[#F97316] text-[#F97316] bg-white animate-pulse"
                                  : "border-2 border-dashed border-slate-200 text-slate-300 bg-white"
                                )
                              }
                                , React.createElement(StampIcon, { className: cn("h-4.5 w-4.5", active ? "text-white" : isNext ? "text-[#F97316]" : "text-slate-300") })
                              );
                            })
                        )

                        /* Progress line */
                        , React.createElement('div', { className: "w-full h-1.5 bg-slate-100 rounded-full overflow-hidden" }
                          , React.createElement('div', {
                              style: { width: `${(stamps / required) * 100}%` },
                              className: "h-full bg-[#F97316] rounded-full transition-all duration-500"
                            })
                        )
                      )

                      /* Reward callout box */
                      , React.createElement('div', { className: "bg-[#F0FDF4] rounded-2xl p-3 flex items-center justify-between gap-3 border border-[#DCFCE7]" }
                        , React.createElement('div', { className: "flex items-start gap-2.5" }
                          , React.createElement(Star, { className: "h-4.5 w-4.5 text-amber-500 fill-amber-500 shrink-0 mt-0.5" })
                          , React.createElement('div', null
                            , React.createElement('p', { className: "text-[10px] text-[#64748B] font-semibold" }, `Collect ${required} stamps to get:`)
                            , React.createElement('p', { className: "text-xs font-black text-[#16A34A] leading-tight" }, card.settings?.rewardName || "Free Gift Upgrade")
                          )
                        )
                        , React.createElement('div', { className: "w-8 h-8 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0" }
                          , React.createElement(Gift, { className: "h-4 w-4 text-[#16A34A]" })
                        )
                      )
                    );
                  })
              )

              /* Carousel indicators */
              , React.createElement('div', { className: "flex items-center justify-center gap-1.5 pt-1" }
                , filteredLoyaltyCards.map((_, idx) =>
                    React.createElement('div', {
                      key: idx,
                      className: cn("h-2 rounded-full transition-all"
                        , idx === cardIndex ? "w-5 bg-[#F97316]" : "w-2 bg-slate-200"
                      )
                    })
                  )
              )
            )
          )
      )

      /* E. "Nearby Places" section */
      , React.createElement('div', { className: "space-y-4" }
        , React.createElement('div', { className: "flex items-center justify-between" }
          , React.createElement('h3', { className: "font-black text-base text-[#0F172A] tracking-tight" }, "Nearby Places")
          , React.createElement('button', {
              onClick: handleOpenMap,
              className: "text-xs font-bold text-[#F97316] bg-transparent border-0 outline-none flex items-center gap-1 hover:underline cursor-pointer"
            }
              , React.createElement(MapPin, { className: "h-3.5 w-3.5" })
              , "View Map"
            )
        )

        /* Filter chip row */
        , React.createElement('div', { className: "flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none" }
          , ["All", "Cafes", "Hotels", "Restaurants", "Salons"].map((filter) => {
              const active = activeFilter === filter;
              const Icon = filter === "Cafes" ? Coffee : filter === "Hotels" ? Building2 : filter === "Restaurants" ? Utensils : filter === "Salons" ? Scissors : MapPin;
              return React.createElement('button', {
                key: filter,
                onClick: () => setActiveFilter(filter),
                className: cn("px-4 py-2 rounded-full text-xs font-bold border transition-colors flex items-center gap-1.5 shrink-0"
                  , active ? "border-[#F97316] bg-[#FFEDD5]/60 text-[#F97316]" : "border-slate-200 text-[#64748B] hover:text-[#0F172A] bg-white"
                )
              }
                , filter !== "All" && React.createElement(Icon, { className: "h-3.5 w-3.5 shrink-0" })
                , filter
              );
            })
        )

        /* Places list */
        , React.createElement('div', { className: "space-y-5" }
          , filteredPlaces.map((place) => React.createElement('div', { key: place.id, className: "relative bg-white rounded-3xl border border-slate-100 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex gap-4" }
              , React.createElement('img', { src: place.image, alt: place.name, className: "w-20 h-20 rounded-2xl object-cover shrink-0 bg-slate-50" })
              , React.createElement('div', { className: "flex-1 min-w-0 space-y-1.5" }
                , React.createElement('div', { className: "flex justify-between items-start gap-2" }
                  , React.createElement('h4', { className: "font-black text-sm text-[#0F172A] truncate" }, place.name)
                  , React.createElement('span', { className: "text-[10px] bg-[#DCFCE7] text-[#16A34A] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-0.5" }
                    , `★ ${place.rating}`
                  )
                )
                , React.createElement('p', { className: "text-[10px] text-[#64748B] font-medium" }, `${place.category} · ${place.distance}`)
                , React.createElement('p', { className: cn("text-[10px] font-bold", place.isOpen ? "text-[#16A34A]" : "text-red-500") }
                  , place.isOpen ? "Open Now" : "Closed"
                )
              )
            ))
        )
      )

      /* Business Details Modal */
      , selectedBusiness && React.createElement(BusinessDetailsModal, {
          card: selectedBusiness,
          unlockedRewards,
          setSelectedReward,
          onClose: () => setSelectedBusiness(null)
        })

      /* Redemption QR modal */
      , selectedReward && React.createElement(
          Dialog, { open: !!selectedReward, onOpenChange: (open) => !open && setSelectedReward(null) },
          React.createElement(DialogContent, { className: "max-w-[340px] bg-white border border-border p-6 rounded-3xl flex flex-col items-center text-slate-800" },
            React.createElement(DialogHeader, { className: "flex flex-col items-center justify-center text-center w-full" },
              React.createElement(DialogTitle, { className: "text-lg font-black text-foreground text-center" }, selectedReward.reward?.title || selectedReward.coupon?.offerTitle || selectedReward.coupon?.title),
              React.createElement(DialogDescription, { className: "text-[10px] mt-1 text-muted-foreground text-center" },
                selectedReward.reward?.description || selectedReward.coupon?.offerDescription || selectedReward.coupon?.description || "Show this QR code to the cashier/staff to claim your reward"
              )
            ),
            React.createElement("div", { className: "flex flex-col items-center justify-center py-2 space-y-4 w-full" },
              React.createElement("div", { className: "rounded-2xl border border-border bg-white p-3 shadow-md" },
                React.createElement("img", {
                  src: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=0f172a&data=${encodeURIComponent(
                    JSON.stringify({
                      redemptionCode: selectedReward.redemptionCode,
                      customerName: user?.name || "Customer",
                      customerPhone: user?.phone || ""
                    })
                  )}`,
                  alt: "Redemption QR Code",
                  className: "h-44 w-44"
                })
              ),
              React.createElement("div", { className: "text-center space-y-1.5 w-full" },
                React.createElement("span", { className: "text-[9px] text-muted-foreground uppercase tracking-widest block font-bold" }, "Redemption Code"),
                React.createElement("span", {
                  className: `font-mono font-black text-foreground select-all bg-slate-50 px-3 py-1.5 rounded-xl border border-border block break-all text-center ${selectedReward.redemptionCode.length > 12
                      ? "text-xs tracking-normal"
                      : "text-base tracking-widest text-[#F97316]"
                    }`
                },
                  selectedReward.redemptionCode.toUpperCase()
                )
              )
            ),
            React.createElement("div", { className: "rounded-2xl bg-emerald-50 border border-emerald-100 p-3 text-[10px] text-center text-emerald-700 font-medium w-full" },
              "Cashier will scan this QR code or type in the code above to verify and complete the reward."
            )
          )
        )

      /* Post-Redemption Success & Google Review Prompt Modal */
      , redemptionSuccessPlace && React.createElement(
          Dialog, { open: !!redemptionSuccessPlace, onOpenChange: (open) => !open && setRedemptionSuccessPlace(null) },
          React.createElement(DialogContent, { className: "max-w-[360px] bg-white border border-border p-6 rounded-3xl flex flex-col items-center text-center text-slate-800" },
            React.createElement("div", { className: "w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 shadow-sm" },
              React.createElement(CheckCircle2, { className: "h-6 w-6" })
            ),
            React.createElement(DialogHeader, { className: "flex flex-col items-center justify-center text-center w-full" },
              React.createElement(DialogTitle, { className: "text-base font-extrabold text-foreground" }, "Redemption Successful! 🎉"),
              React.createElement(DialogDescription, { className: "text-xs mt-1 text-muted-foreground" },
                `Your voucher "${redemptionSuccessPlace.title}" has been successfully redeemed at ${redemptionSuccessPlace.businessName}.`,
                redemptionSuccessPlace.discountText && React.createElement("div", { className: "mt-3 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 font-extrabold text-sm rounded-2xl animate-pulse" },
                  `Verification Successful! You got a discount of ${redemptionSuccessPlace.discountText}.`
                )
              )
            ),
            redemptionSuccessPlace.googleReviewUrl ? React.createElement('div', { className: "w-full bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 rounded-2xl p-4 mt-4 space-y-3" },
              React.createElement('div', { className: "flex justify-center" },
                React.createElement(Star, { className: "h-8 w-8 text-amber-500 fill-amber-500 animate-bounce" })
              ),
              React.createElement('div', { className: "space-y-1" },
                React.createElement('p', { className: "text-xs font-bold text-slate-800" }, "Help us grow on Google!"),
                React.createElement('p', { className: "text-[10px] text-slate-600 leading-relaxed" },
                  `Please take 10 seconds to share your experience at ${redemptionSuccessPlace.businessName}. Your review helps other customers find us.`
                )
              ),
              React.createElement(Button, {
                onClick: () => {
                  window.open(
                    redemptionSuccessPlace.googleReviewUrl.startsWith("http")
                      ? redemptionSuccessPlace.googleReviewUrl
                      : `https://${redemptionSuccessPlace.googleReviewUrl}`,
                    "_blank",
                    "noopener,noreferrer"
                  );
                  setRedemptionSuccessPlace(null);
                },
                className: "w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-full py-2.5 shadow-sm border-0 transition-all duration-300"
              }, "Write Google Review ⭐")
            ) : React.createElement('div', { className: "w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 mt-4" },
              React.createElement('p', { className: "text-xs text-slate-600 font-medium" }, "Thank you for using our digital loyalty program!")
            ),
            React.createElement(Button, {
              variant: "ghost",
              onClick: () => setRedemptionSuccessPlace(null),
              className: "w-full text-xs text-muted-foreground font-semibold rounded-full mt-2"
            }, "Close")
          )
        )

      /* 2km Nearby Subscriber Map Modal */
      , showMapModal && React.createElement(
          Dialog, { open: showMapModal, onOpenChange: (open) => !open && setShowMapModal(false) },
          React.createElement(DialogContent, { className: "max-w-[420px] bg-white border border-border p-6 rounded-3xl text-slate-800" },
            React.createElement(DialogHeader, { className: "flex flex-col space-y-1.5 w-full pb-2 border-b border-slate-100" },
              React.createElement(DialogTitle, { className: "text-base font-black text-foreground flex items-center gap-2" },
                React.createElement(MapPin, { className: "h-5 w-5 text-primary" }),
                "Subscriber Stores Map"
              ),
              React.createElement(DialogDescription, { className: "text-[10px] text-muted-foreground flex flex-col gap-1" },
                "Showing partner stores who purchased our plan within 2 km of your location",
                isTestingFallback && React.createElement("span", { className: "text-amber-700 font-bold bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 mt-1 block text-[9px] w-fit" },
                  "⚠️ No partner stores within 2 km. Showing all active registered stores for testing."
                )
              )
            ),
            React.createElement("div", { className: "w-full py-4 relative z-0 flex flex-col items-center justify-center min-h-[350px]" },
              mapLoading ? React.createElement("div", { className: "flex flex-col items-center justify-center space-y-2 text-xs text-muted-foreground" },
                React.createElement(Loader2, { className: "h-6 w-6 animate-spin text-primary" }),
                React.createElement("span", null, "Retrieving your GPS location...")
              ) : userCoords && mapRenderDelay ? React.createElement(React.Suspense, {
                  fallback: React.createElement("div", { className: "h-[350px] w-full rounded-2xl bg-slate-50 border border-dashed border-border flex flex-col items-center justify-center text-xs text-muted-foreground gap-2" }
                    , React.createElement(Loader2, { className: "h-5 w-5 animate-spin text-primary" })
                    , React.createElement("span", null, "Loading map assets...")
                  )
                }
                  , React.createElement(SubscriberMap, { userCoords, nearbyBranches: displayBranches })
                ) : React.createElement("div", { className: "text-xs text-muted-foreground" }, "Map initialization delayed...")
            ),
            React.createElement(Button, {
              className: "w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full",
              onClick: () => setShowMapModal(false)
            }, "Close Map")
          )
        )
    )
  );
}

// ─── Business Details Modal ────────────────────────────────────────────────────
function BusinessDetailsModal({ card, unlockedRewards, setSelectedReward, onClose }) {
  const business = card.business;
  const activeCoupons = business.coupons || [];

  return React.createElement(
    Dialog, { open: true, onOpenChange: (open) => !open && onClose() },
    React.createElement(DialogContent, { className: "max-w-[460px] w-[95vw] max-h-[85vh] overflow-y-auto bg-white border border-border rounded-3xl p-0" },

      // Banner Cover Image (if present)
      business.coverUrl && React.createElement("div", {
        className: "w-full h-32 relative overflow-hidden border-b border-white/40 shrink-0"
      },
        React.createElement("img", {
          src: getImageUrl(business.coverUrl),
          alt: "Cover",
          className: "w-full h-full object-cover"
        })
      ),

      // Header
      React.createElement("div", { className: `bg-gradient-to-br from-primary/10 to-indigo-100 p-6 flex items-center gap-4 ${business.coverUrl ? '' : 'rounded-t-3xl'}` },
        business.logoUrl
          ? React.createElement("img", { src: getImageUrl(business.logoUrl), alt: business.name, className: "h-14 w-14 rounded-xl object-cover border-2 border-white shadow-md flex-shrink-0" })
          : React.createElement("div", { className: "h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white shadow-md border-2 border-white flex-shrink-0" }
              , React.createElement(getCategoryIcon(business.category), { className: "h-6 w-6 stroke-[2.5]" })
            ),
        React.createElement("div", { className: "min-w-0" },
          React.createElement("h2", { className: "text-lg font-extrabold text-foreground truncate" }, business.name),
          business.category && React.createElement("span", { className: "text-[10px] text-muted-foreground bg-white/60 border border-border px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1" }
            , React.createElement(getCategoryIcon(business.category), { className: "h-3 w-3 text-muted-foreground" })
            , business.category
          ),
          React.createElement("p", { className: "text-[11px] text-muted-foreground mt-1 flex items-center gap-1" },
            React.createElement(MapPin, { className: "h-3 w-3" }),
            card.wallet?.expiresAt && new Date() > new Date(card.wallet.expiresAt) ? "Expired" : "Active Loyalty Program"
          )
        )
      ),

      // Body
      React.createElement("div", { className: "p-5 space-y-5" },

        // Hybrid loyalty block
        card.settings && React.createElement(HybridProgramBlock, {
          settings: card.settings,
          wallet: card.wallet || { currentPoints: 0, currentStamps: 0 },
          businessId: business.id,
          brandAsset: business.brandAsset,
        }),


        // Outlets & GPS check-in rules block
        business.branches && business.branches.length > 0 && React.createElement("div", { className: "space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100/75" },
          React.createElement("p", { className: "text-[10px] font-bold uppercase tracking-widest text-[#F97316] flex items-center gap-1.5" },
            React.createElement(MapPin, { className: "h-3.5 w-3.5" }),
            "Check-in Outlets & GPS Rules"
          ),
          React.createElement("div", { className: "space-y-2.5 mt-2" },
            business.branches.map(branch => 
              React.createElement("div", { key: branch.id, className: "text-xs border-b border-slate-200/50 pb-2 last:border-0 last:pb-0" },
                React.createElement("p", { className: "font-bold text-slate-800" }, branch.name),
                branch.address && React.createElement("p", { className: "text-[10px] text-muted-foreground mt-0.5" }, branch.address),
                React.createElement("div", { className: "flex justify-between items-center mt-1.5 text-[10px]" },
                  React.createElement("span", { className: "text-muted-foreground font-semibold" }, "GPS Check-in Radius"),
                  React.createElement("span", { className: "font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full" }, `${branch.radiusMeters} meters`)
                )
              )
            )
          )
        ),
        card.settings && activeCoupons.length > 0 &&
          React.createElement("div", { className: "border-t border-dashed border-border" }),

        // Active coupons
        activeCoupons.length > 0 && React.createElement("div", { className: "space-y-2" },
          React.createElement("p", { className: "text-[10px] font-bold uppercase tracking-widest text-amber-700 flex items-center gap-1" },
            React.createElement(Tag, { className: "h-3 w-3" }),
            "Active Discount Coupons"
          ),
          activeCoupons.map(coupon =>
            React.createElement(CouponChip, { 
              key: coupon.id, 
              coupon,
              onClick: (e) => {
                e.stopPropagation();
                setSelectedReward({
                  coupon: coupon,
                  redemptionCode: coupon.code,
                });
              }
            })
          )
        ),

        // Social links
        React.createElement(SocialLinks, { business }),

        // Write AI Review button
        React.createElement("div", { className: "pt-1" },
            React.createElement(Link, {
              to: `/review?businessId=${business.id}`,
              className: "w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF8E3C] text-white py-2.5 px-4 text-xs font-extrabold shadow-sm active:scale-95 transition-transform"
            },
              React.createElement(Sparkles, { className: "h-4 w-4 text-white animate-pulse" }),
              "Generate Review suggestions"
            )
          ),

        // Book Stay
        business.category === "Hotels" && business.bookingUrl && React.createElement(
          "div", { className: "pt-1" },
          React.createElement("a", {
            href: business.bookingUrl.startsWith("http") ? business.bookingUrl : `https://${business.bookingUrl}`,
            target: "_blank", rel: "noopener noreferrer",
            className: "w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F97316] to-[#FF8E3C] text-white py-2.5 px-4 text-xs font-bold shadow-md"
          },
            React.createElement(CalendarDays, { className: "h-4 w-4" }),
            "Book Stay"
          )
        )
      )
    )
  );
}

// ─── Coupon chip ──────────────────────────────────────────────────────────────
function CouponChip({ coupon, onClick }) {
  const isPercent = coupon.discountType === "PERCENTAGE";
  return React.createElement(
    "div", { 
      onClick: onClick,
      className: "flex items-center justify-between rounded-xl border border-dashed border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-2.5 gap-3 cursor-pointer hover:bg-amber-100/60 active:scale-[0.99] transition-all" 
    },
    React.createElement("div", { className: "flex items-center gap-2.5 min-w-0" },
      React.createElement("div", { className: "flex-shrink-0 h-9 w-9 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center" },
        React.createElement(BrandIcon, {
          iconName: coupon.business?.brandAsset?.couponIcon,
          customUrl: coupon.business?.brandAsset?.couponIcon,
          defaultIcon: isPercent ? Percent : Banknote,
          className: "h-4 w-4 text-amber-600"
        })
      ),
      React.createElement("div", { className: "min-w-0" },
        React.createElement("p", { className: "text-xs font-bold text-amber-900 truncate" }, coupon.title),
        coupon.description && React.createElement("p", { className: "text-[10px] text-amber-700/70 truncate" }, coupon.description),
        React.createElement("div", { className: "flex items-center gap-1.5 mt-1" },
          React.createElement("code", { className: "text-[10px] font-mono font-bold bg-white border border-amber-200 text-amber-800 px-1.5 py-0.5 rounded" }, coupon.code),
          React.createElement("span", { className: "text-[10px] text-amber-600 flex items-center gap-0.5" },
            React.createElement(Clock, { className: "h-2.5 w-2.5" }),
            daysLeft(coupon.validTo)
          )
        )
      )
    ),
    React.createElement("span", { className: "flex-shrink-0 text-sm font-extrabold text-white bg-amber-500 px-2.5 py-1.5 rounded-lg shadow-sm whitespace-nowrap" },
      formatDiscount(coupon)
    )
  );
}

// ─── Hybrid Program Block ────────────────────────────────────────────────────
function HybridProgramBlock({ settings, wallet, businessId, brandAsset }) {
  const queryClient = useQueryClient();
  const redeemMutation = useMutation({
    mutationFn: () => api.post(`/loyalty-approval/redeem-wallet-reward/${businessId}`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["customerDashboard"] });
      alert(res.data?.message || `Successfully redeemed stamps for ${settings.rewardName}!`);
    },
    onError: (err) => alert(err.message || "Failed to redeem reward"),
  });

  const requiredStamps = settings.requiredStamps || 7;
  const currentStamps = wallet.currentStamps || 0;
  const pointsPerStamp = settings.pointsPerStamp || 50;
  const currentPoints = wallet.currentPoints || 0;
  const pointsRemaining = pointsPerStamp - currentPoints;
  const progressPercent = Math.min(100, Math.round((currentPoints / pointsPerStamp) * 100));
  const isRedeemable = currentStamps >= requiredStamps;

  const startDateStr = wallet.startedAt ? new Date(wallet.startedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : '';

  const expiryDateStr = wallet.expiresAt ? new Date(wallet.expiresAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : '';

  return React.createElement(
    "div", { className: "space-y-4 pt-2" },

    // Header / Program Name
    React.createElement("div", { className: "flex items-center justify-between" },
      React.createElement("div", { className: "flex items-center gap-1.5" },
        React.createElement(BrandIcon, { iconName: brandAsset?.loyaltyIcon, customUrl: brandAsset?.loyaltyIcon, defaultIcon: Coffee, className: "h-4 w-4 text-[#F97316]" }),
        React.createElement("span", { className: "text-sm font-extrabold text-[#F97316]" }, settings.programName)
      ),
      React.createElement("span", { className: "text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border font-medium flex items-center gap-1" },
        React.createElement(BrandIcon, { iconName: brandAsset?.rewardIcon, customUrl: brandAsset?.rewardIcon, defaultIcon: Gift, className: "h-2.5 w-2.5 text-slate-500" }),
        settings.rewardName
      )
    ),

    // Start / Expiry dates
    wallet.startedAt && wallet.expiresAt && React.createElement(
      "div", { className: "flex justify-between items-center text-[10px] text-muted-foreground bg-slate-50 px-2.5 py-1 rounded-md" },
      React.createElement("span", null, `Started: ${startDateStr}`),
      React.createElement("span", { className: "font-medium text-amber-700 flex items-center gap-1" },
        React.createElement(Clock, { className: "h-3 w-3" }),
        `Expires: ${expiryDateStr} (${daysLeft(wallet.expiresAt)})`
      )
    ),

    // Stamps display
    React.createElement("div", { className: "space-y-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100" },
      React.createElement("div", { className: "flex justify-between items-center text-xs" },
        React.createElement("span", { className: "text-slate-600 font-medium" },
          "Stamps: ",
          React.createElement("strong", { className: "text-primary text-sm font-bold" }, currentStamps),
          " / ", requiredStamps
        ),
        isRedeemable && React.createElement("span", { className: "text-xs text-emerald-600 font-bold" }, "Reward Available! 🎉")
      ),
      React.createElement("div", { className: "flex flex-wrap gap-2 pt-1" },
        Array.from({ length: requiredStamps }).map((_, i) => {
          const stamped = i < currentStamps;
          return React.createElement("div", {
            key: i,
            className: `h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${stamped
                ? "bg-[#F97316] border-[#F97316] text-white shadow-md scale-105"
                : "bg-white border-dashed border-[#CBD5E1] text-[#CBD5E1]"
              }`
          },
            React.createElement(BrandIcon, {
              iconName: brandAsset?.stampIcon,
              customUrl: brandAsset?.stampIcon,
              defaultIcon: Stamp,
              className: stamped ? "h-5 w-5 fill-white text-white stroke-none" : "h-5 w-5 opacity-35"
            }));
        })
      )
    ),

    // Points progress to next stamp
    React.createElement("div", { className: "space-y-1.5" },
      React.createElement("div", { className: "flex justify-between items-center text-xs" },
        React.createElement("span", { className: "text-muted-foreground" },
          "Points: ",
          React.createElement("strong", { className: "text-slate-800" }, currentPoints),
          " / ", pointsPerStamp
        ),
        React.createElement("span", { className: "text-[10px] text-muted-foreground font-semibold" },
          pointsRemaining, " Points Remaining to Next Stamp"
        )
      ),
      React.createElement("div", { className: "w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-border" },
        React.createElement("div", {
          className: "bg-gradient-to-r from-[#F97316] to-[#FF8E3C] h-full rounded-full transition-all duration-700 ease-out",
          style: { width: `${progressPercent}%` }
        })
      )
    ),

    // Detailed Stats List
    React.createElement("div", { className: "mt-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-2 text-slate-700 font-medium" },
      React.createElement("div", { className: "flex justify-between border-b border-dashed border-slate-200 pb-1.5" },
        React.createElement("span", { className: "text-slate-500 font-semibold" }, "Loyalty Status:"),
        React.createElement("span", { className: "font-bold text-emerald-600" }, wallet.expiresAt && new Date() > new Date(wallet.expiresAt) ? "Expired" : "Active")
      ),
      React.createElement("div", { className: "flex justify-between border-b border-dashed border-slate-200 pb-1.5" },
        React.createElement("span", { className: "text-slate-500 font-semibold" }, "Stamps:"),
        React.createElement("span", { className: "font-bold text-slate-800" }, `${currentStamps} / ${requiredStamps}`)
      ),
      React.createElement("div", { className: "flex justify-between border-b border-dashed border-slate-200 pb-1.5" },
        React.createElement("span", { className: "text-slate-500 font-semibold" }, "Total Points Earned:"),
        React.createElement("span", { className: "font-bold text-slate-800" }, `${currentPoints} pts`)
      ),
      React.createElement("div", { className: "flex justify-between border-b border-dashed border-slate-200 pb-1.5 bg-amber-50/40 px-2 py-0.5 rounded" },
        React.createElement("span", { className: "text-slate-500 font-semibold flex items-center gap-1" },
          React.createElement(Award, { className: "h-3.5 w-3.5 text-amber-500" }),
          "Extra Points Balance:"
        ),
        React.createElement("span", { className: "font-black text-amber-600" }, `${wallet.pointsBalance ?? 0} pts`)
      ),
      React.createElement("div", { className: "flex justify-between border-b border-dashed border-slate-200 pb-1.5" },
        React.createElement("span", { className: "text-slate-500 font-semibold" }, "Reward:"),
        React.createElement("span", { className: "font-bold text-slate-800" }, settings.rewardName)
      ),
      wallet.expiresAt && React.createElement(React.Fragment, null,
        React.createElement("div", { className: "flex justify-between border-b border-dashed border-slate-200 pb-1.5" },
          React.createElement("span", { className: "text-slate-500 font-semibold" }, "Expiry Date:"),
          React.createElement("span", { className: "font-semibold text-slate-800" }, expiryDateStr)
        ),
        React.createElement("div", { className: "flex justify-between" },
          React.createElement("span", { className: "text-slate-500 font-semibold" }, "Expires In:"),
          React.createElement("span", { className: "font-bold text-amber-700" }, daysLeft(wallet.expiresAt))
        )
      )
    ),

    // Redeem reward button
    React.createElement("div", { className: "pt-1" },
      React.createElement(Button, {
        onClick: () => redeemMutation.mutate(),
        disabled: !isRedeemable || redeemMutation.isPending,
        className: `w-full font-bold text-xs py-2.5 rounded-full transition-all ${isRedeemable
            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:scale-[1.01] active:scale-[0.99]"
            : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
          }`
      },
        redeemMutation.isPending ? "Redeeming..." : isRedeemable ? "Redeem Reward" : `Earn ${requiredStamps - currentStamps} more stamp${requiredStamps - currentStamps > 1 ? "s" : ""} to redeem`
      )
    )
  );
}

// ─── Social Links ─────────────────────────────────────────────────────────────
function SocialLinks({ business }) {
  const has = business.instagramUrl || business.facebookUrl || business.whatsappUrl || business.googleReviewUrl;
  if (!has) return null;

  return React.createElement(
    "div", { className: "border-t border-dashed border-border mt-3 pt-3 flex items-center justify-between" },
    React.createElement("span", { className: "text-[10px] text-muted-foreground font-semibold uppercase tracking-wider" }, "Connect"),
    React.createElement("div", { className: "flex items-center space-x-2" },

      business.instagramUrl && React.createElement("a", {
        href: business.instagramUrl.startsWith("http") ? business.instagramUrl : `https://${business.instagramUrl}`,
        target: "_blank", rel: "noopener noreferrer", title: "Instagram",
        className: "w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-sm"
      }, React.createElement("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" },
        React.createElement("rect", { x: "2", y: "2", width: "20", height: "20", rx: "5", ry: "5" }),
        React.createElement("path", { d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" }),
        React.createElement("line", { x1: "17.5", y1: "6.5", x2: "17.51", y2: "6.5" })
      )),

      business.facebookUrl && React.createElement("a", {
        href: business.facebookUrl.startsWith("http") ? business.facebookUrl : `https://${business.facebookUrl}`,
        target: "_blank", rel: "noopener noreferrer", title: "Facebook",
        className: "w-7 h-7 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-sm"
      }, React.createElement("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" },
        React.createElement("path", { d: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" })
      )),

      business.whatsappUrl && React.createElement("a", {
        href: business.whatsappUrl.startsWith("http") ? business.whatsappUrl : `https://wa.me/${business.whatsappUrl.replace(/[^0-9]/g, "")}`,
        target: "_blank", rel: "noopener noreferrer", title: "WhatsApp",
        className: "w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-sm"
      }, React.createElement("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" },
        React.createElement("path", { d: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" })
      )),

      business.googleReviewUrl && React.createElement("a", {
        href: business.googleReviewUrl.startsWith("http") ? business.googleReviewUrl : `https://${business.googleReviewUrl}`,
        target: "_blank", rel: "noopener noreferrer", title: "Google Review",
        className: "w-7 h-7 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm ring-1 ring-slate-200"
      }, React.createElement("svg", { className: "w-4 h-4", viewBox: "0 0 24 24" },
        React.createElement("path", { d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z", fill: "#4285F4" }),
        React.createElement("path", { d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z", fill: "#34A853" }),
        React.createElement("path", { d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z", fill: "#FBBC05" }),
        React.createElement("path", { d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z", fill: "#EA4335" })
      ))
    )
  );
}

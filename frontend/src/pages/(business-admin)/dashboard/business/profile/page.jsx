import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { api, getImageUrl } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Loader2, User, Mail, Phone, MapPin, Calendar, 
  Building, CreditCard, ShieldCheck, LogOut, Sparkles, 
  Clock, ArrowUpRight, Globe, AlertCircle, RefreshCcw,
  Palette, Upload, RotateCcw, Check, Coffee, Gift, 
  Percent, Star, Wallet, Utensils, Store, Scissors, Hotel, 
  Award, Tag, Share2, Users, Bell, LayoutDashboard, CheckSquare,
  ChevronRight, Camera, KeyRound, ChevronLeft
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import BusinessBottomNav from "@/components/BusinessBottomNav";

// Curated built-in icon map
const BUILTIN_ICONS = {
  coffee: Coffee,
  gift: Gift,
  coupon: Percent,
  star: Star,
  wallet: Wallet,
  food: Utensils,
  restaurant: Store,
  salon: Scissors,
  hotel: Hotel,
  membership: Award,
  discount: Tag,
  referral: Share2,
  customer: Users,
  notification: Bell,
  dashboard: LayoutDashboard
};

// Render Icon helper
function BrandIcon({ iconName, customUrl, defaultIcon: DefaultIcon, className = "h-5 w-5" }) {
  if (customUrl) {
    return React.createElement("img", {
      src: getImageUrl(customUrl),
      alt: "custom-icon",
      className: `${className} object-contain`,
      loading: "lazy"
    });
  }
  const IconComponent = BUILTIN_ICONS[iconName];
  if (IconComponent) {
    return React.createElement(IconComponent, { className });
  }
  return React.createElement(DefaultIcon, { className });
}

export default function BusinessProfilePage() {
  const { setShowNotifications, unreadCount, fetchNotifications } = useOutletContext() || {};
  const { user, logout } = useAuthStore();
  const businessId = user?.businessId;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileInputRefs = useRef({});

  // Unified Page main tab system: "profile" or "branding"
  const [activeSettingsTab, setActiveSettingsTab] = useState("profile");
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // --- Profile Page States ---
  const [isEditing, setIsEditing] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profileCategory, setProfileCategory] = useState("Cafe");
  const [profileBookingUrl, setProfileBookingUrl] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerSaving, setOwnerSaving] = useState(false);

  // --- Branding Page States ---
  const [savingBrand, setSavingBrand] = useState(false);
  const [activeBrandTab, setActiveBrandTab] = useState("library"); // library or upload
  const [selectedBrandField, setSelectedBrandField] = useState("loyaltyIcon");

  // Local state for all fields
  const [brandForm, setBrandForm] = useState({
    logoUrl: "",
    loyaltyIcon: "",
    rewardIcon: "",
    couponIcon: "",
    walletIcon: "",
    giftIcon: "",
    offerIcon: "",
    notificationIcon: "",
    membershipIcon: "",
    dashboardIcon: "",
    qrCheckInIcon: "",
    stampIcon: "",
    pointIcon: "",
    customerIcon: "",
    referralIcon: "",
    redemptionIcon: ""
  });

  const [customUrls, setCustomUrls] = useState({});

  // Fetch business profile data
  const { data: business, refetch: refetchProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["businessProfile", businessId],
    queryFn: () => api.get(`/businesses/${businessId}`).then((res) => res.data),
    enabled: !!businessId && businessId !== "null" && businessId !== "undefined",
  });

  // Fetch current brand settings
  const { data: brandData, isLoading: isBrandLoading } = useQuery({
    queryKey: ["businessBrand", businessId],
    queryFn: () => api.get(`/businesses/${businessId}/brand`).then((res) => res.data),
    enabled: !!businessId,
  });

  // Fetch business analytics for customers stats
  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ["businessAnalytics", businessId],
    queryFn: () => api.get(`/analytics/business/${businessId}`).then((res) => res.data),
    enabled: !!businessId && businessId !== "null" && businessId !== "undefined",
  });

  useEffect(() => {
    if (business) {
      setProfileName(business.name || "");
      setProfilePhone(business.phone || "");
      setProfileAddress(business.address || "");
      setProfileCategory(business.category || "Cafe");
      setProfileBookingUrl(business.bookingUrl || "");

      setOwnerName(business.owner?.name || "");
      setOwnerEmail(business.owner?.email || "");
      setOwnerPhone(business.owner?.phone || "");
    }
  }, [business]);

  const handleUpdateOwnerDetails = async (e) => {
    e.preventDefault();
    if (!ownerName.trim()) {
      setMessage({ type: "error", text: "Owner Name cannot be empty." });
      return;
    }
    if (!ownerEmail.trim()) {
      setMessage({ type: "error", text: "Owner Email cannot be empty." });
      return;
    }
    setOwnerSaving(true);
    setMessage(null);
    try {
      await api.patch('/auth/profile', {
        name: ownerName,
        email: ownerEmail,
        phone: ownerPhone || null,
      });
      await refetchProfile();
      setIsEditingOwner(false);
      setMessage({ type: "success", text: "Owner profile details updated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || err.message || "Failed to update owner profile details." });
    } finally {
      setOwnerSaving(false);
    }
  };

  useEffect(() => {
    if (brandData) {
      const updatedForm = {};
      const updatedCustoms = {};
      Object.keys(brandForm).forEach((key) => {
        const val = brandData[key] || "";
        if (val && (val.startsWith("/") || val.startsWith("http"))) {
          updatedCustoms[key] = val;
          updatedForm[key] = "";
        } else {
          updatedForm[key] = val;
        }
      });
      setBrandForm((prev) => ({ ...prev, ...updatedForm }));
      setCustomUrls(updatedCustoms);
    }
  }, [brandData]);

  // Brand Update mutation
  const saveBrandMutation = useMutation({
    mutationFn: (data) => api.post(`/businesses/${businessId}/brand`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessBrand", businessId] });
      queryClient.invalidateQueries({ queryKey: ["businessProfile", businessId] });
      setMessage({ type: "success", text: "Brand customizations saved successfully!" });
    },
    onError: (err) => {
      setMessage({ type: "error", text: err.message || "Failed to save branding configurations." });
    }
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setMessage({ type: "error", text: "Business Name cannot be empty." });
      return;
    }
    setProfileSaving(true);
    setMessage(null);
    try {
      await api.patch(`/businesses/${businessId}`, {
        name: profileName,
        phone: profilePhone || null,
        address: profileAddress || null,
        category: profileCategory || null,
        bookingUrl: profileCategory === "Hotels" ? profileBookingUrl : null,
      });
      await refetchProfile();
      setIsEditing(false);
      setMessage({ type: "success", text: "Business profile updated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to update business profile." });
    } finally {
      setProfileSaving(false);
    }
  };

  // Branding action handlers
  const handleFileUpload = async (field, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    setSavingBrand(true);
    setMessage(null);
    try {
      if (field === "logoUrl") {
        formData.append("logo", file);
        const res = await api.post(`/businesses/${businessId}/logo`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        const uploadedUrl = res.data.logoUrl;
        setCustomUrls((prev) => ({ ...prev, [field]: uploadedUrl }));
        await refetchProfile();
        queryClient.invalidateQueries({ queryKey: ["businessProfile", businessId] });
      } else {
        formData.append("icon", file);
        const res = await api.post(`/businesses/${businessId}/brand/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        const uploadedUrl = res.data.iconUrl;
        setCustomUrls((prev) => ({ ...prev, [field]: uploadedUrl }));
        setBrandForm((prev) => ({ ...prev, [field]: "" }));
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "File upload failed." });
    } finally {
      setSavingBrand(false);
    }
  };

  const handleSelectLibraryIcon = (field, iconKey) => {
    setBrandForm((prev) => ({ ...prev, [field]: iconKey }));
    setCustomUrls((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const handleResetToDefault = (field) => {
    setBrandForm((prev) => ({ ...prev, [field]: "" }));
    setCustomUrls((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const handleSaveBrandAll = (e) => {
    e.preventDefault();
    const payload = {};
    Object.keys(brandForm).forEach((key) => {
      payload[key] = customUrls[key] || brandForm[key] || null;
    });
    saveBrandMutation.mutate(payload);
  };

  if (isProfileLoading || isBrandLoading || isAnalyticsLoading || !business) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 rounded bg-slate-100" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 rounded-2xl bg-slate-100" />
            <div className="h-48 rounded-2xl bg-slate-100" />
          </div>
          <div className="h-80 rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  const initials = (business?.name || "B").substring(0, 2).toUpperCase();

  const customizableFields = [
    { key: "loyaltyIcon", label: "Loyalty Program", defaultIcon: Coffee },
    { key: "rewardIcon", label: "Rewards", defaultIcon: Gift },
    { key: "couponIcon", label: "Coupons", defaultIcon: Percent },
    { key: "walletIcon", label: "Wallet", defaultIcon: Wallet },
    { key: "giftIcon", label: "Gift Rewards", defaultIcon: Gift },
    { key: "offerIcon", label: "Offers", defaultIcon: Tag },
    { key: "notificationIcon", label: "Notifications", defaultIcon: Bell },
    { key: "membershipIcon", label: "Membership/Tier", defaultIcon: Award },
    { key: "dashboardIcon", label: "Dashboard Main", defaultIcon: LayoutDashboard },
    { key: "qrCheckInIcon", label: "QR Check-in", defaultIcon: Star },
    { key: "stampIcon", label: "Stamp Graphic", defaultIcon: Coffee },
    { key: "pointIcon", label: "Point Symbol", defaultIcon: Star },
    { key: "customerIcon", label: "Customer", defaultIcon: Users },
    { key: "referralIcon", label: "Referrals", defaultIcon: Share2 },
    { key: "redemptionIcon", label: "Redemptions", defaultIcon: CheckSquare }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] -m-4 md:-m-8 md:m-0 md:bg-transparent pb-16">
      
      {/* Hidden file input for mobile profile photo upload */}
      <input
        type="file"
        ref={(el) => (fileInputRefs.current["logoUrl"] = el)}
        onChange={(e) => handleFileUpload("logoUrl", e)}
        accept="image/*"
        className="hidden"
      />

      {/* ── MOBILE VIEW LAYOUT (hidden on desktop) ── */}
      <div className="md:hidden space-y-6">
        
        {/* A. Curved Gradient Header */}
        <div className="relative bg-gradient-to-br from-[#FFF8F4] to-[#FFEBE0] border-b border-[#FFD8C2] pt-6 pb-20 px-5 rounded-b-[40px] shadow-sm overflow-hidden">
          
          {/* Subtle faint dot grid decorative pattern */}
          <div className="absolute right-0 top-0 w-1/2 h-full opacity-5 pointer-events-none select-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dotGrid" width="12" height="12" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="#F97316" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dotGrid)" />
            </svg>
          </div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate("/dashboard/business")} 
                className="w-9 h-9 rounded-full bg-slate-500/10 flex items-center justify-center text-[#0F172A] active:scale-95 transition-transform"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-lg font-black text-[#0F172A] leading-none">Business Portal</h1>
                <p className="text-[10px] text-[#64748B] mt-0.5 font-medium">Manage your account & settings</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5">
              <button 
                onClick={() => {
                  if (setShowNotifications) setShowNotifications(true);
                  if (fetchNotifications) fetchNotifications();
                }}
                className="relative w-9 h-9 rounded-full bg-slate-500/10 flex items-center justify-center text-[#0F172A]"
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center leading-none shadow-sm">{unreadCount}</span>
                )}
              </button>
              <div className="w-9 h-9 rounded-full bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20 flex items-center justify-center text-sm font-black shadow-sm">
                {initials}
              </div>
            </div>
          </div>
        </div>

        {/* B. Profile Summary Card (Overlaps Header) */}
        <div className="px-4 -mt-14 relative z-20">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#F1F5F9] space-y-4">
            
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                {/* Large circular avatar with camera upload badge */}
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shadow-inner">
                    {business?.logoUrl || customUrls["logoUrl"] ? (
                      <img
                        src={getImageUrl(customUrls["logoUrl"] || business.logoUrl)}
                        alt={business.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-black text-[#F97316]">
                        {initials}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRefs.current["logoUrl"]?.click()}
                    className="absolute -bottom-1 -right-1 bg-[#F97316] text-white shadow-md active:scale-90 transition-transform border-2 border-white"
                    style={{ borderRadius: "50%", width: "28px", height: "28px", minWidth: "28px", minHeight: "28px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-black text-[#0F172A]">{business?.name || "My Business"}</h2>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-[#DCFCE7] text-[#22C55E] border border-emerald-100 uppercase tracking-wider">
                      ACTIVE
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#64748B] font-bold">
                    <Coffee className="h-3.5 w-3.5 text-[#F97316]" />
                    <span>{business?.category || "Cafe"}</span>
                    <span className="text-slate-300 mx-0.5">•</span>
                    <span>since {business?.createdAt ? formatDate(business.createdAt) : "N/A"}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#F97316] border border-[#FFD8C2] bg-orange-50/30 px-3 py-1.5 rounded-full hover:bg-orange-50 active:scale-95 transition-transform"
              >
                <Palette className="h-3 w-3" /> Edit
              </button>
            </div>

            {/* Sub-row tag pills */}
            <div className="flex flex-wrap gap-2 pt-1 border-t border-[#F8FAFC]">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#64748B] bg-[#F8FAFC] border border-[#F1F5F9] px-3 py-1.5 rounded-full">
                <MapPin className="h-3.5 w-3.5 text-[#7C3AED]" />
                <span>{business?.address || "Main Branch"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#64748B] bg-[#F8FAFC] border border-[#F1F5F9] px-3 py-1.5 rounded-full font-mono">
                <Phone className="h-3.5 w-3.5 text-[#3B82F6]" />
                <span>{business?.phone || "—"}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Message Alert Banner */}
        {message && (
          <div className="px-4">
            <div className={`rounded-2xl p-3.5 text-xs font-bold border ${
              message.type === "success" 
                ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                : "bg-red-50 border-red-200 text-red-700"
            }`}>
              {message.text}
            </div>
          </div>
        )}

        {/* C. Quick Actions Row (4 tiles) */}
        <div className="px-4">
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: "My Profile", sub: "View & edit", action: () => { setActiveSettingsTab("profile"); setIsEditing(true); }, icon: User, color: "text-[#7C3AED] bg-[#EDE9FE]", borderColor: "border-[#7C3AED]/20 hover:border-[#7C3AED]" },
              { label: "Brand & Look", sub: "Customize", action: () => setActiveSettingsTab("branding"), icon: Palette, color: "text-[#22C55E] bg-[#DCFCE7]", borderColor: "border-[#22C55E]/20 hover:border-[#22C55E]" },
              { label: "Notifications", sub: "Send broadcast", action: () => navigate("/dashboard/business/notifications"), icon: Bell, color: "text-[#EF4444] bg-[#FEE2E2]", borderColor: "border-[#EF4444]/20 hover:border-[#EF4444]" },
              { label: "Security & Privacy", sub: "Privacy policy", action: () => setShowPrivacyModal(true), icon: ShieldCheck, color: "text-[#F59E0B] bg-[#FEF3C7]", borderColor: "border-[#F59E0B]/20 hover:border-[#F59E0B]" }
            ].map((tile, i) => (
              <button 
                key={i} 
                onClick={tile.action}
                className={cn("bg-white rounded-2xl border p-2 flex flex-col items-center text-center gap-1 active:scale-95 transition-all shadow-sm w-full", tile.borderColor)}
              >
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", tile.color)}>
                  <tile.icon className="h-4 w-4" />
                </div>
                <span className="text-[8px] font-black text-[#0F172A] leading-tight block truncate w-full">{tile.label}</span>
                <span className="text-[7px] text-[#64748B] font-semibold leading-tight block truncate w-full">{tile.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Conditional Tab Rendering for Mobile Content */}
        {activeSettingsTab === "profile" ? (
          <div className="px-4 space-y-5 pb-24">
            
            {/* Collapsible Edit Business Profile dropdown card */}
            {isEditing && (
              <div className="bg-[#FFF9F5] border border-orange-100 rounded-3xl p-5 shadow-sm space-y-4 animate-fade-in">
                <div className="flex justify-between items-center pb-2 border-b border-orange-100/50">
                  <span className="font-extrabold text-sm text-[#0F172A]">Edit Business Profile</span>
                  <button onClick={() => setIsEditing(false)} className="text-xs font-bold text-slate-400">Cancel</button>
                </div>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="mob-biz-name" className="text-xs font-bold text-slate-500">Business Name</Label>
                    <Input id="mob-biz-name" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="bg-white border-slate-200 rounded-xl text-xs h-10" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mob-biz-phone" className="text-xs font-bold text-slate-500">Contact Phone</Label>
                    <Input id="mob-biz-phone" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} className="bg-white border-slate-200 rounded-xl text-xs h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mob-biz-address" className="text-xs font-bold text-slate-500">Address</Label>
                    <Input id="mob-biz-address" value={profileAddress} onChange={(e) => setProfileAddress(e.target.value)} className="bg-white border-slate-200 rounded-xl text-xs h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mob-biz-category" className="text-xs font-bold text-slate-500">Category</Label>
                    <select id="mob-biz-category" value={profileCategory} onChange={(e) => setProfileCategory(e.target.value)} className="w-full h-10 border border-slate-200 rounded-xl bg-white text-xs px-2.5 outline-none text-slate-800">
                      <option value="Cafe">Café</option>
                      <option value="Restaurant">Restaurant</option>
                      <option value="Salon">Salon</option>
                      <option value="Retail">Retail</option>
                      <option value="Bakery">Bakery</option>
                      <option value="Hotels">Hotels</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="flex gap-2.5 pt-2">
                    <Button type="button" variant="outline" className="flex-1 rounded-xl text-xs h-10" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button type="submit" className="flex-1 bg-[#F97316] text-white font-bold rounded-xl text-xs h-10" disabled={profileSaving}>
                      {profileSaving ? "Saving..." : "Save Details"}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* E. Owner Details Card */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#F1F5F9] space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#F8FAFC]">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#DBEAFE] flex items-center justify-center">
                      <User className="h-4 w-4 text-[#3B82F6]" />
                    </div>
                    <span className="font-black text-sm text-[#0F172A]">Owner Details</span>
                  </div>
                </div>
                {!isEditingOwner && (
                  <button 
                    onClick={() => setIsEditingOwner(true)} 
                    className="text-xs font-bold text-[#3B82F6] flex items-center gap-1 border border-blue-200 px-2.5 py-1 rounded-full bg-blue-50/20"
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditingOwner ? (
                <form onSubmit={handleUpdateOwnerDetails} className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <Label htmlFor="mob-owner-name" className="text-xs font-bold text-slate-500">Owner Name</Label>
                    <Input id="mob-owner-name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="bg-slate-50 border-[#F1F5F9] rounded-xl text-xs h-10" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mob-owner-email" className="text-xs font-bold text-slate-500">Owner Email</Label>
                    <Input id="mob-owner-email" type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} className="bg-slate-50 border-[#F1F5F9] rounded-xl text-xs h-10" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mob-owner-phone" className="text-xs font-bold text-slate-500">Contact Number</Label>
                    <Input id="mob-owner-phone" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} className="bg-slate-50 border-[#F1F5F9] rounded-xl text-xs h-10" />
                  </div>
                  <div className="flex gap-2.5 pt-2">
                    <Button type="button" variant="outline" className="flex-1 rounded-xl text-xs h-10" onClick={() => setIsEditingOwner(false)}>Cancel</Button>
                    <Button type="submit" className="flex-1 bg-[#3B82F6] text-white font-bold rounded-xl text-xs h-10" disabled={ownerSaving}>
                      {ownerSaving ? "Saving..." : "Save Details"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-100 bg-[#F8FAFC]">
                    <User className="h-4.5 w-4.5 text-[#3B82F6] shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[8px] text-[#64748B] font-bold uppercase tracking-wider block">Owner Name</span>
                      <span className="text-xs font-extrabold text-[#0F172A] block truncate">{business?.owner?.name || "—"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-100 bg-[#F8FAFC]">
                    <Mail className="h-4.5 w-4.5 text-[#22C55E] shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[8px] text-[#64748B] font-bold uppercase tracking-wider block">Owner Email</span>
                      <span className="text-xs font-extrabold text-[#0F172A] block truncate">{business?.owner?.email || "—"}</span>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center gap-2.5 p-3 rounded-2xl border border-slate-100 bg-[#F8FAFC]">
                    <Phone className="h-4.5 w-4.5 text-[#EC4899] shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[8px] text-[#64748B] font-bold uppercase tracking-wider block">Contact Number</span>
                      <span className="text-xs font-extrabold text-[#0F172A] block truncate font-mono">{business?.owner?.phone || "—"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* F. Plan & Subscription Card */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#F1F5F9] space-y-4">
              
              <div className="flex justify-between items-center pb-2 border-b border-[#F8FAFC]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#FFF0E6] flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-[#F97316]" />
                  </div>
                  <div>
                    <span className="font-black text-sm text-[#0F172A] block">Plan & Subscription</span>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveSettingsTab("profile")} 
                  className="text-xs font-black text-[#22C55E] flex items-center gap-0.5 hover:underline"
                >
                  View Plan <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Highlighted bordered box */}
              <div className="border border-orange-100 rounded-2xl p-4 bg-[#FFF9F5]/40 space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  
                  {/* Current Plan */}
                  <div className="space-y-1 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#FFF0E6] flex items-center justify-center">
                      <Award className="h-4 w-4 text-[#F97316]" />
                    </div>
                    <span className="text-[8px] text-[#F97316] font-bold uppercase tracking-wider block">Current Plan</span>
                    <span className="text-[10px] font-black text-slate-800 leading-tight uppercase">{business?.plan?.name || "LAUNCH YEAR SPECIAL"}</span>
                    <span className="text-[8px] bg-orange-100 text-[#F97316] px-1.5 py-0.5 rounded-md font-bold mt-1 inline-block">
                      ₹{parseInt(business?.plan?.priceMonthly || "999")}/mo
                    </span>
                  </div>

                  {/* Status */}
                  <div className="space-y-1 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#DCFCE7] flex items-center justify-center">
                      <Check className="h-4 w-4 text-[#22C55E]" />
                    </div>
                    <span className="text-[8px] text-[#64748B] font-bold uppercase tracking-wider block">Status</span>
                    <span className="text-[10px] bg-[#DCFCE7] text-[#22C55E] px-2 py-0.5 rounded-full font-black mt-1 inline-block">
                      ACTIVE
                    </span>
                  </div>

                  {/* Next Billing */}
                  <div className="space-y-1 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#DBEAFE] flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-[#3B82F6]" />
                    </div>
                    <span className="text-[8px] text-[#64748B] font-bold uppercase tracking-wider block">Next Billing</span>
                    <span className="text-[9px] font-extrabold text-[#0F172A] leading-tight">
                      {business?.subscription?.currentPeriodEnd ? formatDate(business.subscription.currentPeriodEnd) : "N/A"}
                    </span>
                  </div>

                </div>

                <div className="h-px bg-orange-100/50" />

                {/* Progress stacked bars */}
                <div className="space-y-3">
                  <p className="text-[9px] font-black text-[#64748B] uppercase tracking-wider">Usage Overview</p>
                  
                  {/* Branches progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-[#64748B] flex items-center gap-1">
                        <Building className="h-3.5 w-3.5 text-[#F97316]" /> Branches Installed
                      </span>
                      <span className="text-[#0F172A]">{business?._count?.branches || 1} / {business?.plan?.maxBranches || 1}</span>
                    </div>
                    {(() => {
                      const pct = Math.round(((business?._count?.branches || 1) / (business?.plan?.maxBranches || 1)) * 100);
                      return (
                        <>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-[#F97316] h-full rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[8px] font-semibold text-slate-400">{pct}% Used</span>
                        </>
                      );
                    })()}
                  </div>

                  {/* Customers progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-[#64748B] flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-[#7C3AED]" /> Customers Limit
                      </span>
                      <span className="text-[#0F172A]">{(analytics?.totalCustomers ?? 0).toLocaleString()} / {business?.plan?.maxCustomers || 8000}</span>
                    </div>
                    {(() => {
                      const pct = Math.round(((analytics?.totalCustomers ?? 0) / (business?.plan?.maxCustomers || 8000)) * 100) || 0;
                      return (
                        <>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-[#7C3AED] h-full rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[8px] font-semibold text-slate-400">{pct}% Used</span>
                        </>
                      );
                    })()}
                  </div>

                </div>

              </div>

            </div>

            {/* G. Sign Out Row */}
            <button 
              onClick={logout}
              className="w-full bg-[#FEE2E2]/60 rounded-3xl p-4 flex items-center justify-between active:scale-98 transition-all border-0 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FEE2E2] text-red-600 flex items-center justify-center">
                  <LogOut className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-red-600">Sign Out</p>
                  <p className="text-[9px] text-[#64748B] mt-0.5">Sign out from your account securely</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-red-300" />
            </button>

          </div>
        ) : (
          <div className="px-4 space-y-5 pb-24">
            
            {/* Mobile Branding Customizer details */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#F1F5F9] space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-[#0F172A]">Appearance & Icons</h3>
                <p className="text-[10px] text-[#64748B]">Click any icon to custom-configure its asset graphic details.</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {customizableFields.map((field) => {
                  const isActive = selectedBrandField === field.key;
                  return (
                    <button
                      key={field.key}
                      onClick={() => setSelectedBrandField(field.key)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-[11px] font-bold transition-all"
                        , isActive ? "bg-orange-50/50 border-[#F97316] text-[#F97316]" : "bg-white border-slate-100 text-slate-700"
                      )}
                    >
                      <BrandIcon
                        iconName={brandForm[field.key]}
                        customUrl={customUrls[field.key]}
                        defaultIcon={field.defaultIcon}
                        className="h-4 w-4 shrink-0 text-[#F97316]"
                      />
                      <span className="truncate">{field.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Editor controls for selected field */}
              <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-slate-100 space-y-3.5">
                <p className="text-xs font-black text-[#0F172A]">
                  Edit: {customizableFields.find(f => f.key === selectedBrandField)?.label}
                </p>

                <div className="flex bg-slate-200/50 p-1 rounded-xl">
                  <button onClick={() => setActiveBrandTab("library")} className={cn("flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all", activeBrandTab === "library" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500")}>
                    Library
                  </button>
                  <button onClick={() => setActiveBrandTab("upload")} className={cn("flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all", activeBrandTab === "upload" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500")}>
                    Upload
                  </button>
                </div>

                {activeBrandTab === "library" ? (
                  <div className="grid grid-cols-5 gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {Object.keys(BUILTIN_ICONS).map((iconKey) => {
                      const IconComponent = BUILTIN_ICONS[iconKey];
                      return (
                        <button
                          key={iconKey}
                          onClick={() => handleSelectLibraryIcon(selectedBrandField, iconKey)}
                          className={cn(
                            "flex items-center justify-center p-2 rounded-lg border aspect-square relative"
                            , brandForm[selectedBrandField] === iconKey && !customUrls[selectedBrandField] ? "border-[#F97316] bg-orange-50/20" : "border-slate-100 bg-white"
                          )}
                        >
                          <IconComponent className="h-5 w-5 text-slate-600" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-200 p-4 rounded-xl flex flex-col items-center gap-2 bg-white">
                    <Upload className="h-5 w-5 text-slate-400" />
                    <button onClick={() => fileInputRefs.current[selectedBrandField]?.click()} className="text-[10px] font-bold text-[#F97316] hover:underline">
                      Choose file
                    </button>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(selectedBrandField, e)} ref={(el) => (fileInputRefs.current[selectedBrandField] = el)} className="hidden" />
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button size="xs" variant="outline" className="flex-1 text-[10px] rounded-lg" onClick={() => handleResetToDefault(selectedBrandField)}>
                    Reset Default
                  </Button>
                  <Button size="xs" className="flex-1 bg-[#F97316] text-white font-bold text-[10px] rounded-lg" onClick={handleSaveBrandAll} disabled={saveBrandMutation.isPending || savingBrand}>
                    Save Brand
                  </Button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* H. Bottom Navigation Bar */}
        <BusinessBottomNav variant="flat" />

      </div>

      {/* ── DESKTOP VIEW LAYOUT (hidden on mobile) ── */}
      <div className="hidden md:block space-y-8 animate-fade-in max-w-7xl mx-auto px-6 py-6">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="relative group w-20 h-20 shrink-0 rounded-full border-2 border-border shadow-md overflow-hidden bg-slate-50 flex items-center justify-center">
              {business?.logoUrl ? (
                <img
                  src={getImageUrl(business.logoUrl)}
                  alt={business.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-black bg-gradient-to-tr from-primary to-orange-600 bg-clip-text text-transparent">
                  {initials}
                </span>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{business?.name || "My Business"}</h1>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                  business?.status === 'ACTIVE' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {business?.status || "PENDING"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5" />
                {business?.category} · Registered since {business?.createdAt ? formatDate(business.createdAt) : "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={logout} variant="outline" size="sm" className="text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200 font-bold rounded-xl">
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>

        {/* Tabs Selector */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-md">
          <button
            onClick={() => { setActiveSettingsTab("profile"); setMessage(null); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeSettingsTab === "profile" ? "bg-white text-slate-800 shadow-md" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <User className="h-4 w-4" /> Profile & Account
          </button>
          <button
            onClick={() => { setActiveSettingsTab("branding"); setMessage(null); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeSettingsTab === "branding" ? "bg-white text-slate-800 shadow-md" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Palette className="h-4 w-4" /> Brand & Appearance
          </button>
        </div>

        {message && (
          <div className={`rounded-xl p-4 text-xs font-semibold border ${
            message.type === "success" 
              ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
              : "bg-red-50 border-red-200 text-red-700"
          }`}>
            {message.text}
          </div>
        )}

        {/* Dynamic Tab Render (Desktop) */}
        {activeSettingsTab === "profile" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Owner Credentials */}
              <Card className="glass" glass>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Owner Details
                      </CardTitle>
                      <CardDescription>Primary administrative account information</CardDescription>
                    </div>
                    <Button onClick={() => setIsEditingOwner(!isEditingOwner)} variant="outline" size="xs" className="border-primary/20 text-primary hover:bg-primary/5 font-bold h-8 rounded-lg">
                      {isEditingOwner ? "Cancel" : "Edit Details"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditingOwner ? (
                    <form onSubmit={handleUpdateOwnerDetails} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="dk-owner-name">Owner Name</Label>
                        <Input id="dk-owner-name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="bg-white border-border" required />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="dk-owner-email">Owner Email</Label>
                          <Input id="dk-owner-email" type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} className="bg-white border-border" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dk-owner-phone">Contact Number</Label>
                          <Input id="dk-owner-phone" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} className="bg-white border-border" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => setIsEditingOwner(false)}>Cancel</Button>
                        <Button type="submit" className="bg-primary text-white font-bold" disabled={ownerSaving}>
                          {ownerSaving ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                        <User className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div>
                          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">Owner Name</span>
                          <span className="text-sm font-semibold text-slate-800">{business?.owner?.name || "—"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                        <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">Owner Email</span>
                          <span className="text-sm font-semibold text-slate-800 truncate block">{business?.owner?.email || "—"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                        <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div>
                          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">Contact Number</span>
                          <span className="text-sm font-semibold text-slate-800 font-mono">{business?.owner?.phone || "—"}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column (Desktop Billing) */}
            <div className="space-y-6">
              <Card className="glass border-primary/20 bg-gradient-to-br from-primary/5 to-white" glass>
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Plan & Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">Current Plan</span>
                      <span className="text-base font-extrabold text-slate-800 uppercase tracking-wider">{business?.plan?.name || "LAUNCH YEAR SPECIAL"}</span>
                    </div>
                    <span className="text-xs font-bold text-primary bg-white px-3 py-1 rounded-full border border-primary/20 shadow-sm">
                      ₹{parseInt(business?.plan?.priceMonthly || "999").toLocaleString("en-IN")}/mo
                    </span>
                  </div>
                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between items-center py-1.5 border-b border-dashed border-slate-100">
                      <span className="text-muted-foreground">Subscription Status</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">ACTIVE</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Branding (Desktop) */
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" /> Brand Customizations
                </h2>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveBrandAll} className="bg-primary text-white font-bold rounded-xl">Save Brand Settings</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-6">
                <Card className="glass" glass>
                  <CardContent className="grid grid-cols-3 gap-2 p-4">
                    {customizableFields.map((f) => (
                      <button key={f.key} onClick={() => setSelectedBrandField(f.key)} className={cn("flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left text-xs font-bold transition-all", selectedBrandField === f.key ? "bg-primary/5 border-primary text-primary" : "bg-white border-slate-200")}>
                        <BrandIcon iconName={brandForm[f.key]} customUrl={customUrls[f.key]} defaultIcon={f.defaultIcon} className="h-4.5 w-4.5 text-slate-500" />
                        <span>{f.label}</span>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Privacy Policy Popup Dialog */}
      {showPrivacyModal && (
        <Dialog open={showPrivacyModal} onOpenChange={(open) => !open && setShowPrivacyModal(false)}>
          <DialogContent className="max-w-[600px] w-[95vw] bg-white border border-border p-6 rounded-3xl text-slate-800 flex flex-col max-h-[85vh]">
            <DialogHeader className="pb-3 border-b border-border/60">
              <DialogTitle className="text-lg font-extrabold text-[#2B201A] flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Privacy Policy & Addendum
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Last Updated: June 23, 2026
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto py-4 space-y-6 text-xs text-slate-600 leading-relaxed scrollbar-none pr-1">
              <section className="space-y-2">
                <h4 className="text-sm font-extrabold text-[#2B201A]">1. Data Collected</h4>
                <p>The Smart Loyalty Solution collects the following user information to manage loyalty campaigns:</p>
                <ul className="list-disc pl-5 space-y-1 mt-1 font-medium text-slate-800">
                  <li>Customer Name</li>
                  <li>Mobile Number</li>
                  <li>Email Address</li>
                  <li>Visit History</li>
                  <li>Reward Points</li>
                  <li>Redemption History</li>
                  <li>Business Account Information</li>
                  <li>Store Information</li>
                  <li>Device Information</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="text-sm font-extrabold text-[#2B201A]">2. Purpose</h4>
                <p>Information collected is strictly utilized for the following functional purposes:</p>
                <ul className="list-disc pl-5 space-y-1 mt-1 font-medium text-slate-800">
                  <li>Loyalty Program Management</li>
                  <li>Reward Tracking</li>
                  <li>QR Code Validation</li>
                  <li>Customer Engagement</li>
                  <li>Analytics</li>
                  <li>Fraud Prevention</li>
                </ul>
              </section>

              <section className="space-y-2 bg-slate-50 border border-slate-200/60 rounded-xl p-3.5">
                <h4 className="text-xs font-black text-primary uppercase tracking-wider">Google OAuth User Data disclosures</h4>
                <p className="mt-1">To facilitate frictionless account creation and secure customer/merchant login, ScanLoyal allows authentication using Google Sign-In. By utilizing this integration, we retrieve your Google Profile details (Name, Email, and Profile Avatar picture).</p>
                <p className="mt-1">Our use and transfer of information received from Google APIs to any other app will adhere to the Google API Services User Data Policy, including the Limited Use requirements. We do not sell or share Google OAuth credentials or profile information with third parties for commercial marketing.</p>
              </section>

              <section className="space-y-1">
                <h4 className="text-sm font-extrabold text-[#2B201A]">3. Merchant Data Ownership</h4>
                <p>Business owners remain the absolute owners of any customer data entered into the platform. Logisaar acts solely as a service provider (data processor) for processing such information under the instructions of the respective merchant.</p>
              </section>

              <section className="space-y-1">
                <h4 className="text-sm font-extrabold text-[#2B201A]">4. Marketing Communications</h4>
                <p>Merchants are solely responsible for obtaining explicit customer consent before sending marketing communications, promotional updates, SMS alerts, or emails via platform channels.</p>
              </section>

              <div className="pt-4 border-t border-dashed border-slate-200 text-[10px] text-slate-500 font-bold">
                This Product Privacy Policy supplements the Master Policies of Logisaar Technologies Private Limited. In the event of a conflict, the product-specific terms shall prevail for the Smart Loyalty Solution.
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border/60">
              <Button type="button" onClick={() => setShowPrivacyModal(false)} className="w-full rounded-xl text-xs font-bold bg-primary text-white">
                Close Policy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

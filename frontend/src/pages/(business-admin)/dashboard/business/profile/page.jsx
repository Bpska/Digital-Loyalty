import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { api, getImageUrl } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Loader2, User, Mail, Phone, MapPin, Calendar, 
  Building, CreditCard, ShieldCheck, LogOut, Sparkles, 
  Clock, ArrowUpRight, Globe, AlertCircle, RefreshCcw,
  Palette, Upload, RotateCcw, Check, Coffee, Gift, 
  Percent, Star, Wallet, Utensils, Store, Scissors, Hotel, 
  Award, Tag, Share2, Users, Bell, LayoutDashboard, CheckSquare
} from "lucide-react";
import { formatDate } from "@/lib/utils";

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
  const { user, logout } = useAuthStore();
  const businessId = user?.businessId;
  const queryClient = useQueryClient();
  const fileInputRefs = useRef({});

  // Unified Page main tab system: "profile" or "branding"
  const [activeSettingsTab, setActiveSettingsTab] = useState("profile");

  // --- Profile Page States ---
  const [isEditing, setIsEditing] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profileCategory, setProfileCategory] = useState("Cafe");
  const [profileBookingUrl, setProfileBookingUrl] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [message, setMessage] = useState(null);

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

  useEffect(() => {
    if (business) {
      setProfileName(business.name || "");
      setProfilePhone(business.phone || "");
      setProfileAddress(business.address || "");
      setProfileCategory(business.category || "Cafe");
      setProfileBookingUrl(business.bookingUrl || "");
    }
  }, [business]);

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
    formData.append("icon", file);

    setSavingBrand(true);
    setMessage(null);
    try {
      const res = await api.post(`/businesses/${businessId}/brand/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const uploadedUrl = res.data.iconUrl;
      setCustomUrls((prev) => ({ ...prev, [field]: uploadedUrl }));
      setBrandForm((prev) => ({ ...prev, [field]: "" }));
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

  if (isProfileLoading || isBrandLoading) {
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
    <div className="space-y-8 animate-fade-in">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="relative group w-20 h-20 shrink-0 rounded-2xl border-2 border-border shadow-md overflow-hidden bg-slate-50 flex items-center justify-center">
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

      {/* Dynamic Tab Render */}
      {activeSettingsTab === "profile" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Business Details Form / Display */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass" glass>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Building className="h-5 w-5 text-primary" />
                      Business Details
                    </CardTitle>
                    <CardDescription>
                      {isEditing ? "Modify your brand profile information below" : "Overview of your current business details"}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant="outline"
                    size="xs"
                    className="border-primary/20 text-primary hover:bg-primary/5 font-bold h-8 rounded-lg"
                  >
                    {isEditing ? "Cancel" : "Edit Settings"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="biz-name">Business Name</Label>
                      <Input
                        id="biz-name"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="bg-white border-border"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="biz-phone">Business Contact Phone</Label>
                        <Input
                          id="biz-phone"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          className="bg-white border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="biz-category">Category</Label>
                        <select
                          id="biz-category"
                          value={profileCategory}
                          onChange={(e) => setProfileCategory(e.target.value)}
                          className="w-full h-9 border border-border rounded-md bg-white text-xs px-2.5 outline-none focus:ring-1 focus:ring-primary text-slate-800"
                        >
                          <option value="Cafe">Café</option>
                          <option value="Restaurant">Restaurant</option>
                          <option value="Salon">Salon</option>
                          <option value="Retail">Retail</option>
                          <option value="Bakery">Bakery</option>
                          <option value="Hotels">Hotels</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="biz-address">Address</Label>
                      <Input
                        id="biz-address"
                        value={profileAddress}
                        onChange={(e) => setProfileAddress(e.target.value)}
                        className="bg-white border-border"
                      />
                    </div>

                    {profileCategory === "Hotels" && (
                      <div className="space-y-2">
                        <Label htmlFor="biz-booking-url">Booking Website URL</Label>
                        <Input
                          id="biz-booking-url"
                          type="url"
                          value={profileBookingUrl}
                          onChange={(e) => setProfileBookingUrl(e.target.value)}
                          className="bg-white border-border"
                          placeholder="https://yourhotel.com/book"
                          required
                        />
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-primary text-white font-bold" disabled={profileSaving}>
                        {profileSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Save Profile Changes
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Business Name</span>
                        <span className="text-sm font-semibold text-slate-800">{business?.name || "—"}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Contact Phone</span>
                        <span className="text-sm font-semibold text-slate-800 font-mono">{business?.phone || "—"}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Location Address</span>
                      <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                        {business?.address || "No address specified"}
                      </span>
                    </div>

                    {business?.category === "Hotels" && business?.bookingUrl && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Booking URL</span>
                        <span className="text-sm font-semibold text-primary flex items-center gap-1.5 truncate">
                          <Globe className="h-4 w-4 text-primary shrink-0" />
                          <a href={business.bookingUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                            {business.bookingUrl} <ArrowUpRight className="h-3 w-3" />
                          </a>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Owner Details Card */}
            <Card className="glass" glass>
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Account Credentials
                </CardTitle>
                <CardDescription>Primary administrative account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                    <User className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">Owner Name</span>
                      <span className="text-xs font-semibold text-slate-800">{business?.owner?.name || "—"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                    <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="space-y-0.5 max-w-[190px] md:max-w-none">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">Owner Email</span>
                      <span className="text-xs font-semibold text-slate-800 truncate block">{business?.owner?.email || "—"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Subscription & Plan */}
          <div className="space-y-6">
            <Card className="glass border-primary/20 bg-gradient-to-br from-primary/5 to-white" glass>
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Plan & Subscription
                </CardTitle>
                <CardDescription>Manage billing cycles and capacity bounds</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Active Plan Detail */}
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">Current Plan</span>
                    <span className="text-base font-extrabold text-slate-800 uppercase tracking-wider">{business?.plan?.name || "No Plan"}</span>
                  </div>
                  <span className="text-xs font-bold text-primary bg-white px-3 py-1 rounded-full border border-primary/20 shadow-sm">
                    ₹{parseInt(business?.plan?.priceMonthly || "0").toLocaleString("en-IN")}/mo
                  </span>
                </div>

                {/* Status information */}
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-dashed border-slate-100">
                    <span className="text-muted-foreground">Subscription Status</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                      business?.subscription?.status === 'ACTIVE' || business?.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {business?.subscription?.status || (business?.status === 'ACTIVE' ? 'ACTIVE' : 'TRIAL')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-dashed border-slate-100">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Start Date</span>
                    <span className="font-semibold text-slate-700">
                      {business?.createdAt ? formatDate(business.createdAt) : "—"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-dashed border-slate-100">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="h-4 w-4" /> Expiry / Billing Date</span>
                    <span className="font-semibold text-slate-700">
                      {business?.subscription?.currentPeriodEnd 
                        ? formatDate(business.subscription.currentPeriodEnd) 
                        : "—"}
                    </span>
                  </div>
                </div>

                {/* Usage Information Limits */}
                <div className="space-y-4 pt-2">
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block">Usage Limits</span>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Branches Installed</span>
                      <span className="text-foreground">{business?._count?.branches || 0} / {business?.plan?.maxBranches || 0}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full transition-all" 
                        style={{ width: `${Math.min(100, ((business?._count?.branches || 0) / (business?.plan?.maxBranches || 1)) * 100)}%` }} 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Customers Limit</span>
                      <span className="text-foreground">{business?.plan?.maxCustomers || 0} max</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Branding Customization Tab UI (Imported from branding/page.js) */
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" /> Icon & Graphic Customizer
              </h2>
              <p className="text-xs text-muted-foreground">Personalize your loyalty application icons, stamp graphics, and point logos.</p>
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm("Reset all appearance settings?")) {
                    const defaults = {};
                    customizableFields.forEach(f => defaults[f.key] = null);
                    saveBrandMutation.mutate(defaults);
                  }
                }}
                className="border-slate-200 text-slate-700 font-bold rounded-xl"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Reset All Default
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveBrandAll}
                disabled={saveBrandMutation.isPending || savingBrand}
                className="bg-primary hover:bg-primary/95 text-white font-bold rounded-xl"
              >
                {saveBrandMutation.isPending ? "Saving..." : "Save Brand Settings"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Controls Span 7 */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Asset Select Grid */}
              <Card className="glass" glass>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">Select Component Graphic</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {customizableFields.map((field) => {
                    const isActive = selectedBrandField === field.key;
                    return (
                      <button
                        key={field.key}
                        type="button"
                        onClick={() => setSelectedBrandField(field.key)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left text-xs font-bold transition-all ${
                          isActive
                            ? "bg-primary/5 border-primary text-primary"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <BrandIcon
                          iconName={brandForm[field.key]}
                          customUrl={customUrls[field.key]}
                          defaultIcon={field.defaultIcon}
                          className="h-4.5 w-4.5 shrink-0 text-slate-500"
                        />
                        {field.label}
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Editor Workspace */}
              <Card className="glass" glass>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-slate-800">
                    Customize: {customizableFields.find(f => f.key === selectedBrandField)?.label}
                  </CardTitle>
                  <CardDescription>Select from our default library or upload your custom logo/icon file.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Library or Upload Tabs */}
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setActiveBrandTab("library")}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        activeBrandTab === "library" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
                      }`}
                    >
                      Library Icons
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveBrandTab("upload")}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        activeBrandTab === "upload" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
                      }`}
                    >
                      Upload Custom (.png / .svg)
                    </button>
                  </div>

                  {activeBrandTab === "library" ? (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
                      {Object.keys(BUILTIN_ICONS).map((iconKey) => {
                        const IconComponent = BUILTIN_ICONS[iconKey];
                        const isSelected = brandForm[selectedBrandField] === iconKey && !customUrls[selectedBrandField];
                        return (
                          <button
                            key={iconKey}
                            type="button"
                            onClick={() => handleSelectLibraryIcon(selectedBrandField, iconKey)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border aspect-square transition-all relative ${
                              isSelected
                                ? "bg-primary/5 border-primary text-primary"
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                            }`}
                          >
                            <IconComponent className="h-6 w-6" />
                            <span className="text-[9px] font-bold capitalize mt-1.5">{iconKey}</span>
                            {isSelected && (
                              <span className="absolute top-1 right-1 bg-primary text-white p-0.5 rounded-full">
                                <Check className="h-2 w-2" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 border border-dashed border-slate-200 p-6 rounded-2xl bg-slate-50/50 justify-center flex-col">
                      <Upload className="h-8 w-8 text-slate-400" />
                      <div className="text-center space-y-1">
                        <p className="text-xs font-bold text-slate-700">Drag and drop or click to browse</p>
                        <p className="text-[10px] text-slate-400">Supports SVG, PNG, JPG, WEBP. Max 2MB.</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(selectedBrandField, e)}
                        ref={(el) => (fileInputRefs.current[selectedBrandField] = el)}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRefs.current[selectedBrandField]?.click()}
                        className="h-9 border-slate-200 font-bold text-xs rounded-xl"
                      >
                        Choose Image File
                      </Button>
                    </div>
                  )}

                  {/* Active Preview block */}
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                        <BrandIcon
                          iconName={brandForm[selectedBrandField]}
                          customUrl={customUrls[selectedBrandField]}
                          defaultIcon={customizableFields.find(f => f.key === selectedBrandField)?.defaultIcon || Coffee}
                          className="h-5 w-5 text-slate-600"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Previewing selected state</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          {customUrls[selectedBrandField] ? "Custom Image Upload" : brandForm[selectedBrandField] ? `Library: ${brandForm[selectedBrandField]}` : "Using System Defaults"}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleResetToDefault(selectedBrandField)}
                      className="text-xs text-red-500 hover:text-red-600 font-bold"
                    >
                      Reset Default
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Dashboard Previews Span 5 */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Live Component Previews</span>
              
              {/* Customer Loyalty Card Mockup */}
              <Card className="border border-slate-200 shadow-md rounded-2xl overflow-hidden bg-white max-w-sm">
                <div className="bg-[#800020] px-4 py-3 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BrandIcon
                      iconName={brandForm.loyaltyIcon}
                      customUrl={customUrls.loyaltyIcon}
                      defaultIcon={Coffee}
                      className="h-5 w-5 text-white animate-pulse-subtle"
                    />
                    <span className="text-xs font-black">Brew Club Loyalty</span>
                  </div>
                  <div className="bg-white/10 px-2.5 py-0.5 rounded-full text-[9px] flex items-center gap-1 font-bold">
                    <BrandIcon
                      iconName={brandForm.membershipIcon}
                      customUrl={customUrls.membershipIcon}
                      defaultIcon={Award}
                      className="h-3 w-3"
                    />
                    VIP Tier
                  </div>
                </div>
                <CardContent className="p-4 space-y-4">
                  {/* Stamp count preview */}
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <BrandIcon
                        iconName={brandForm.stampIcon}
                        customUrl={customUrls.stampIcon}
                        defaultIcon={Coffee}
                        className="h-5 w-5 text-[#800020]"
                      />
                      <span className="text-xs font-semibold text-slate-700">Accumulated Stamps:</span>
                    </div>
                    <span className="text-sm font-black text-slate-800">4 / 7</span>
                  </div>

                  {/* Points count preview */}
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <BrandIcon
                        iconName={brandForm.pointIcon}
                        customUrl={customUrls.pointIcon}
                        defaultIcon={Star}
                        className="h-5 w-5 text-amber-500"
                      />
                      <span className="text-xs font-semibold text-slate-700">Total Points Balance:</span>
                    </div>
                    <span className="text-sm font-black text-slate-800">320 pts</span>
                  </div>

                  {/* Claim Reward item */}
                  <div className="border border-dashed border-[#FF6A00]/25 bg-[#FF6A00]/5 p-3 rounded-xl flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <BrandIcon
                        iconName={brandForm.rewardIcon}
                        customUrl={customUrls.rewardIcon}
                        defaultIcon={Gift}
                        className="h-5 w-5 text-[#FF6A00]"
                      />
                      <span className="text-xs font-bold text-slate-800">Free Cappuccino Voucher</span>
                    </div>
                    <div className="bg-[#FF6A00] text-white p-1 rounded-lg">
                      <BrandIcon
                        iconName={brandForm.redemptionIcon}
                        customUrl={customUrls.redemptionIcon}
                        defaultIcon={CheckSquare}
                        className="h-3.5 w-3.5 text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dashboard stats preview */}
              <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden max-w-sm">
                <CardHeader className="pb-2 bg-slate-50 border-b border-slate-100">
                  <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <BrandIcon
                      iconName={brandForm.dashboardIcon}
                      customUrl={customUrls.dashboardIcon}
                      defaultIcon={LayoutDashboard}
                      className="h-3.5 w-3.5"
                    />
                    Live Dashboard View
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-xs">
                    <div className="flex items-center gap-2">
                      <BrandIcon
                        iconName={brandForm.customerIcon}
                        customUrl={customUrls.customerIcon}
                        defaultIcon={Users}
                        className="h-4.5 w-4.5 text-slate-600"
                      />
                      <span className="font-semibold text-slate-700">Total Customers:</span>
                    </div>
                    <span className="font-bold text-slate-800">1,250</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <BrandIcon
                        iconName={brandForm.offerIcon}
                        customUrl={customUrls.offerIcon}
                        defaultIcon={Tag}
                        className="h-4.5 w-4.5 text-slate-600"
                      />
                      <span className="font-semibold text-slate-700">Campaign Offers:</span>
                    </div>
                    <span className="font-bold text-slate-800">4 Active</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

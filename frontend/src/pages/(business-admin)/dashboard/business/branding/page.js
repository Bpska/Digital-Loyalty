import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getImageUrl } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Loader2, Sparkles, Upload, RotateCcw, Check,
  Coffee, Gift, Percent, Star, Wallet, Utensils,
  Store, Scissors, Hotel, Award, Tag, Share2,
  Users, Bell, LayoutDashboard, Shield, ShieldAlert,
  Calendar, CheckSquare
} from "lucide-react";

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
export function BrandIcon({ iconName, customUrl, defaultIcon: DefaultIcon, className = "h-5 w-5" }) {
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

export default function BrandCustomizationPage() {
  const { user } = useAuthStore();
  const businessId = user?.businessId;
  const queryClient = useQueryClient();
  const fileInputRefs = useRef({});

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("library"); // library or upload
  const [selectedField, setSelectedField] = useState("loyaltyIcon");

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

  // Fetch current brand settings
  const { data: brandData, isLoading } = useQuery({
    queryKey: ["businessBrand", businessId],
    queryFn: () => api.get(`/businesses/${businessId}/brand`).then((res) => res.data),
    enabled: !!businessId,
  });

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

  // Update mutation
  const saveMutation = useMutation({
    mutationFn: (data) => api.post(`/businesses/${businessId}/brand`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessBrand", businessId] });
      queryClient.invalidateQueries({ queryKey: ["businessProfile", businessId] });
      alert("Appearance settings saved successfully!");
    },
    onError: (err) => {
      alert(err.message || "Failed to save branding configurations.");
    }
  });

  // Handle uploading custom icons/logo
  const handleFileUpload = async (field, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("icon", file);

    setSaving(true);
    try {
      const res = await api.post(`/businesses/${businessId}/brand/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const uploadedUrl = res.data.iconUrl;

      // Update custom urls and clear key value
      setCustomUrls((prev) => ({ ...prev, [field]: uploadedUrl }));
      setBrandForm((prev) => ({ ...prev, [field]: "" }));
    } catch (err) {
      alert(err.message || "File upload failed.");
    } finally {
      setSaving(false);
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

  const handleSaveAll = (e) => {
    e.preventDefault();
    const payload = {};
    Object.keys(brandForm).forEach((key) => {
      payload[key] = customUrls[key] || brandForm[key] || null;
    });
    saveMutation.mutate(payload);
  };

  if (isLoading) {
    return React.createElement(
      "div",
      { className: "flex min-h-[400px] items-center justify-center" },
      React.createElement(Loader2, { className: "h-8 w-8 animate-spin text-primary" })
    );
  }

  // Categories list to customize
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

  return React.createElement(
    "div",
    { className: "space-y-8 max-w-6xl mx-auto" },

    // Header
    React.createElement(
      "div",
      { className: "flex flex-col md:flex-row md:items-center justify-between gap-4" },
      React.createElement(
        "div",
        null,
        React.createElement(
          "h1",
          { className: "text-2xl font-black text-slate-800 flex items-center gap-2" },
          React.createElement(Sparkles, { className: "h-6 w-6 text-primary" }),
          "Brand & Appearance Settings"
        ),
        React.createElement(
          "p",
          { className: "text-sm text-slate-500 mt-1" },
          "Personalize your loyalty program icons, stamps, and layout templates to match your company branding."
        )
      ),
      React.createElement(
        "div",
        { className: "flex gap-2" },
        React.createElement(
          Button,
          {
            type: "button",
            variant: "outline",
            onClick: () => {
              if (confirm("Reset all appearance settings?")) {
                const defaults = {};
                customizableFields.forEach(f => defaults[f.key] = null);
                saveMutation.mutate(defaults);
              }
            },
            className: "border-slate-200 text-slate-700 font-bold"
          },
          React.createElement(RotateCcw, { className: "mr-2 h-4 w-4" }),
          "Reset All"
        ),
        React.createElement(
          Button,
          {
            type: "button",
            onClick: handleSaveAll,
            disabled: saveMutation.isPending || saving,
            className: "bg-primary text-white font-bold"
          },
          saveMutation.isPending ? "Saving..." : "Save Customizations"
        )
      )
    ),

    // Main layout grid
    React.createElement(
      "div",
      { className: "grid grid-cols-1 lg:grid-cols-12 gap-8" },

      // Left Column (Controls) - Span 7
      React.createElement(
        "div",
        { className: "lg:col-span-7 space-y-6" },

        // Category Selector List
        React.createElement(
          Card,
          { className: "border border-slate-100 shadow-sm" },
          React.createElement(
            CardHeader,
            { className: "pb-3" },
            React.createElement(CardTitle, { className: "text-base font-bold" }, "Select Asset to Customize")
          ),
          React.createElement(
            CardContent,
            { className: "grid grid-cols-2 sm:grid-cols-3 gap-2" },
            customizableFields.map((field) => {
              const isActive = selectedField === field.key;
              return React.createElement(
                "button",
                {
                  key: field.key,
                  type: "button",
                  onClick: () => setSelectedField(field.key),
                  className: `flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left text-xs font-bold transition-all ${
                    isActive
                      ? "bg-primary/5 border-primary text-primary"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  }`
                },
                React.createElement(BrandIcon, {
                  iconName: brandForm[field.key],
                  customUrl: customUrls[field.key],
                  defaultIcon: field.defaultIcon,
                  className: "h-4 w-4 shrink-0"
                }),
                field.label
              );
            })
          )
        ),

        // Editor Form
        React.createElement(
          Card,
          { className: "border border-slate-100 shadow-sm" },
          React.createElement(
            CardHeader,
            { className: "pb-3" },
            React.createElement(
              CardTitle,
              { className: "text-base font-black text-slate-800" },
              `Customize: ${customizableFields.find(f => f.key === selectedField)?.label}`
            ),
            React.createElement(CardDescription, null, "Select from our library or upload your own high-resolution transparent PNG/SVG asset.")
          ),
          React.createElement(
            CardContent,
            { className: "space-y-6" },

            // Source Switch Tabs
            React.createElement(
              "div",
              { className: "flex bg-slate-100 p-1 rounded-xl" },
              React.createElement(
                "button",
                {
                  type: "button",
                  onClick: () => setActiveTab("library"),
                  className: `flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    activeTab === "library" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
                  }`
                },
                "Built-in Library"
              ),
              React.createElement(
                "button",
                {
                  type: "button",
                  onClick: () => setActiveTab("upload"),
                  className: `flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    activeTab === "upload" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
                  }`
                },
                "Upload Custom Asset"
              )
            ),

            // Tab contents
            activeTab === "library"
              ? React.createElement(
                  "div",
                  { className: "grid grid-cols-4 sm:grid-cols-6 gap-2" },
                  Object.keys(BUILTIN_ICONS).map((iconKey) => {
                    const IconComponent = BUILTIN_ICONS[iconKey];
                    const isSelected = brandForm[selectedField] === iconKey && !customUrls[selectedField];
                    return React.createElement(
                      "button",
                      {
                        key: iconKey,
                        type: "button",
                        onClick: () => handleSelectLibraryIcon(selectedField, iconKey),
                        className: `flex flex-col items-center justify-center p-3 rounded-xl border aspect-square transition-all relative ${
                          isSelected
                            ? "bg-primary/5 border-primary text-primary"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                        }`
                      },
                      React.createElement(IconComponent, { className: "h-6 w-6" }),
                      React.createElement("span", { className: "text-[9px] font-bold capitalize mt-2" }, iconKey),
                      isSelected && React.createElement(
                        "span",
                        { className: "absolute top-1 right-1 bg-primary text-white p-0.5 rounded-full" },
                        React.createElement(Check, { className: "h-2 w-2" })
                      )
                    );
                  })
                )
              : React.createElement(
                  "div",
                  { className: "space-y-4" },
                  React.createElement(
                    "div",
                    { className: "flex items-center gap-4 border border-dashed border-slate-200 p-6 rounded-2xl bg-slate-50/50 justify-center flex-col" },
                    React.createElement(Upload, { className: "h-8 w-8 text-slate-400" }),
                    React.createElement(
                      "div",
                      { className: "text-center space-y-1" },
                      React.createElement("p", { className: "text-xs font-bold text-slate-700" }, "Drag and drop or click to browse"),
                      React.createElement("p", { className: "text-[10px] text-slate-400" }, "Supports SVG, PNG, JPG, WEBP. Max 2MB.")
                    ),
                    React.createElement(Input, {
                      type: "file",
                      accept: "image/*",
                      onChange: (e) => handleFileUpload(selectedField, e),
                      ref: (el) => (fileInputRefs.current[selectedField] = el),
                      className: "hidden"
                    }),
                    React.createElement(
                      Button,
                      {
                        type: "button",
                        variant: "outline",
                        onClick: () => fileInputRefs.current[selectedField]?.click(),
                        className: "h-9 border-slate-200 font-bold text-xs"
                      },
                      "Choose Image File"
                    )
                  )
                ),

            // Field Preview Panel
            React.createElement(
              "div",
              { className: "bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between" },
              React.createElement(
                "div",
                { className: "flex items-center gap-3" },
                React.createElement(
                  "div",
                  { className: "h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm" },
                  React.createElement(BrandIcon, {
                    iconName: brandForm[selectedField],
                    customUrl: customUrls[selectedField],
                    defaultIcon: customizableFields.find(f => f.key === selectedField)?.defaultIcon || Coffee,
                    className: "h-5 w-5"
                  })
                ),
                React.createElement(
                  "div",
                  null,
                  React.createElement("p", { className: "text-xs font-bold text-slate-800" }, "Active Custom Asset Preview"),
                  React.createElement(
                    "p",
                    { className: "text-[10px] text-slate-400 mt-0.5" },
                    customUrls[selectedField] ? "Uploaded Custom Graphic File" : brandForm[selectedField] ? `Library Icon: ${brandForm[selectedField]}` : "Using System Default Icon"
                  )
                )
              ),
              React.createElement(
                Button,
                {
                  type: "button",
                  variant: "ghost",
                  onClick: () => handleResetToDefault(selectedField),
                  className: "text-xs text-red-500 hover:text-red-600 font-bold"
                },
                "Reset to Default"
              )
            )
          )
        )
      ),

      // Right Column (Dashboard Previews) - Span 5
      React.createElement(
        "div",
        { className: "lg:col-span-5 space-y-6" },

        React.createElement("p", { className: "text-xs font-black text-slate-400 uppercase tracking-widest" }, "Live Preview Previews"),

        // Customer Card Mockup
        React.createElement(
          Card,
          { className: "border border-slate-200 shadow-md rounded-2xl overflow-hidden bg-white max-w-sm mx-auto" },
          React.createElement(
            "div",
            { className: "bg-[#800020] px-4 py-3 text-white flex items-center justify-between" },
            React.createElement(
              "div",
              { className: "flex items-center gap-2" },
              React.createElement(BrandIcon, {
                iconName: brandForm.loyaltyIcon,
                customUrl: customUrls.loyaltyIcon,
                defaultIcon: Coffee,
                className: "h-5 w-5 text-white"
              }),
              React.createElement("span", { className: "text-xs font-black" }, "Brew Club Loyalty")
            ),
            React.createElement(
              "div",
              { className: "bg-white/10 px-2 py-0.5 rounded-full text-[9px] flex items-center gap-1 font-bold" },
              React.createElement(BrandIcon, {
                iconName: brandForm.membershipIcon,
                customUrl: customUrls.membershipIcon,
                defaultIcon: Award,
                className: "h-3 w-3"
              }),
              "VIP Tier"
            )
          ),
          React.createElement(
            CardContent,
            { className: "p-4 space-y-4" },

            // Stamp preview
            React.createElement(
              "div",
              { className: "bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between" },
              React.createElement(
                "div",
                { className: "flex items-center gap-2" },
                React.createElement(BrandIcon, {
                  iconName: brandForm.stampIcon,
                  customUrl: customUrls.stampIcon,
                  defaultIcon: Coffee,
                  className: "h-5 w-5 text-[#800020]"
                }),
                React.createElement("span", { className: "text-xs font-semibold text-slate-700" }, "Accumulated Stamps:")
              ),
              React.createElement("span", { className: "text-sm font-black text-slate-800" }, "4 / 7")
            ),

            // Points preview
            React.createElement(
              "div",
              { className: "bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between" },
              React.createElement(
                "div",
                { className: "flex items-center gap-2" },
                React.createElement(BrandIcon, {
                  iconName: brandForm.pointIcon,
                  customUrl: customUrls.pointIcon,
                  defaultIcon: Star,
                  className: "h-5 w-5 text-amber-500"
                }),
                React.createElement("span", { className: "text-xs font-semibold text-slate-700" }, "Total Points Balance:")
              ),
              React.createElement("span", { className: "text-sm font-black text-slate-800" }, "320 pts")
            ),

            // Claim Reward Section
            React.createElement(
              "div",
              { className: "border border-dashed border-[#FF6A00]/20 bg-[#FF6A00]/5 p-3 rounded-xl flex items-center justify-between" },
              React.createElement(
                "div",
                { className: "flex items-center gap-2" },
                React.createElement(BrandIcon, {
                  iconName: brandForm.rewardIcon,
                  customUrl: customUrls.rewardIcon,
                  defaultIcon: Gift,
                  className: "h-5 w-5 text-[#FF6A00]"
                }),
                React.createElement("span", { className: "text-xs font-bold text-slate-800" }, "Free Cappuccino Reward")
              ),
              React.createElement(
                "div",
                { className: "bg-[#FF6A00] text-white p-1 rounded-lg" },
                React.createElement(BrandIcon, {
                  iconName: brandForm.redemptionIcon,
                  customUrl: customUrls.redemptionIcon,
                  defaultIcon: CheckSquare,
                  className: "h-3.5 w-3.5 text-white"
                })
              )
            ),

            // Coupon list item preview
            React.createElement(
              "div",
              { className: "border border-slate-100 p-3 rounded-xl flex items-center justify-between" },
              React.createElement(
                "div",
                { className: "flex items-center gap-2" },
                React.createElement(BrandIcon, {
                  iconName: brandForm.couponIcon,
                  customUrl: customUrls.couponIcon,
                  defaultIcon: Percent,
                  className: "h-5 w-5 text-indigo-500"
                }),
                React.createElement("span", { className: "text-xs font-semibold text-slate-700" }, "Happy Hour 15% OFF")
              ),
              React.createElement(
                "div",
                { className: "text-[9px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full font-bold" },
                "Active"
              )
            )
          )
        ),

        // Admin Dashboard Card Mockup
        React.createElement(
          Card,
          { className: "border border-slate-200 shadow-sm rounded-xl overflow-hidden max-w-sm mx-auto" },
          React.createElement(
            CardHeader,
            { className: "pb-2 bg-slate-50 border-b border-slate-100" },
            React.createElement(
              CardTitle,
              { className: "text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5" },
              React.createElement(BrandIcon, {
                iconName: brandForm.dashboardIcon,
                customUrl: customUrls.dashboardIcon,
                defaultIcon: LayoutDashboard,
                className: "h-3.5 w-3.5"
              }),
              "Merchant Dashboard Card"
            )
          ),
          React.createElement(
            CardContent,
            { className: "p-4 space-y-3" },
            React.createElement(
              "div",
              { className: "flex items-center justify-between border-b border-slate-100 pb-2 text-xs" },
              React.createElement(
                "div",
                { className: "flex items-center gap-2" },
                React.createElement(BrandIcon, {
                  iconName: brandForm.customerIcon,
                  customUrl: customUrls.customerIcon,
                  defaultIcon: Users,
                  className: "h-4.5 w-4.5 text-slate-600"
                }),
                React.createElement("span", { className: "font-semibold text-slate-700" }, "Total Customers:")
              ),
              React.createElement("span", { className: "font-bold text-slate-800" }, "1,250")
            ),
            React.createElement(
              "div",
              { className: "flex items-center justify-between border-b border-slate-100 pb-2 text-xs" },
              React.createElement(
                "div",
                { className: "flex items-center gap-2" },
                React.createElement(BrandIcon, {
                  iconName: brandForm.offerIcon,
                  customUrl: customUrls.offerIcon,
                  defaultIcon: Tag,
                  className: "h-4.5 w-4.5 text-slate-600"
                }),
                React.createElement("span", { className: "font-semibold text-slate-700" }, "Campaign Offers:")
              ),
              React.createElement("span", { className: "font-bold text-slate-800" }, "4 Active")
            ),
            React.createElement(
              "div",
              { className: "flex items-center justify-between text-xs" },
              React.createElement(
                "div",
                { className: "flex items-center gap-2" },
                React.createElement(BrandIcon, {
                  iconName: brandForm.notificationIcon,
                  customUrl: customUrls.notificationIcon,
                  defaultIcon: Bell,
                  className: "h-4.5 w-4.5 text-slate-600"
                }),
                React.createElement("span", { className: "font-semibold text-slate-700" }, "Alerts Sent:")
              ),
              React.createElement("span", { className: "font-bold text-slate-800" }, "12 Today")
            )
          )
        )
      )
    )
  );
}

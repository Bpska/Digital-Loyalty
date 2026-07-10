const _jsxFileName = "src\\pages\\(super-admin)\\dashboard\\super\\businesses\\page.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } "use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building2, Plus, Loader2, ToggleLeft, ToggleRight, Star, ExternalLink, MessageSquareText, BarChart3, Settings2, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
export default function BusinessesManagementPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("businesses");

  // Search and status filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Notification form states
  const [notifTargetType, setNotifTargetType] = useState("user_phone");
  const [notifTargetValue, setNotifTargetValue] = useState("");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [notifSuccess, setNotifSuccess] = useState(null);
  const [notifError, setNotifError] = useState(null);
  const [notifLoading, setNotifLoading] = useState(false);

  // Plan creation modal
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // New Plan form states
  const [planName, setPlanName] = useState("Launch Year Special");
  const [priceMonthly, setPriceMonthly] = useState("");
  const [maxBranches, setMaxBranches] = useState("");
  const [maxCustomers, setMaxCustomers] = useState("");
  const [analyticsAccess, setAnalyticsAccess] = useState(false);
  const [customBranding, setCustomBranding] = useState(false);
  const [csvExport, setCsvExport] = useState(false);
  const [apiAccess, setApiAccess] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Editing plan state
  const [editingPlan, setEditingPlan] = useState(null);

  // Editing points per rupee business state
  const [editingPointsBusiness, setEditingPointsBusiness] = useState(null);
  const [editPointsVal, setEditPointsVal] = useState("");

  // Editing business description state
  const [editingDescriptionBusiness, setEditingDescriptionBusiness] = useState(null);
  const [editDescriptionVal, setEditDescriptionVal] = useState("");

  // AI Review settings editor state
  const [editingReviewBusiness, setEditingReviewBusiness] = useState(null);
  const [reviewSettingsForm, setReviewSettingsForm] = useState({
    businessType: "",
    googleReviewUrl: "",
    instagramUrl: "",
    facebookUrl: "",
    googleBusinessName: "",
    googlePlaceId: "",
  });
  const [reviewSettingsLoading, setReviewSettingsLoading] = useState(false);
  const [reviewSettingsFetchLoading, setReviewSettingsFetchLoading] = useState(false);

  // Business Create/Edit modal state
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [editingBusiness, setEditingBusiness_state] = useState(null);
  const [businessToDelete, setBusinessToDelete] = useState(null);
  const [businessForm, setBusinessForm] = useState({
    name: "",
    phone: "",
    address: "",
    timezone: "Asia/Kolkata",
    category: "",
    bookingUrl: "",
    description: "",
    planId: "",
    ownerId: "",
    instagramUrl: "",
    facebookUrl: "",
    whatsappUrl: "",
    googleReviewUrl: "",
  });

  // Fetch users list (for owner selection)
  const { data: users = [] } = useQuery({
    queryKey: ["adminUsersList"],
    queryFn: () => api.get("/admin/users").then((res) => res.data || []),
  });

  // Create business mutation
  const createBusinessMutation = useMutation({
    mutationFn: (data) => api.post("/businesses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superBusinessesList"] });
      setShowBusinessModal(false);
      alert("Merchant registered successfully!");
    },
    onError: (err) => {
      alert(err.message || "Failed to register merchant.");
    }
  });

  // Update business mutation
  const updateBusinessMutation = useMutation({
    mutationFn: ({ id, data }) => api.patch(`/businesses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superBusinessesList"] });
      setShowBusinessModal(false);
      alert("Merchant details updated successfully!");
    },
    onError: (err) => {
      alert(err.message || "Failed to update merchant.");
    }
  });

  const openCreateBusinessModal = () => {
    setEditingBusiness_state(null);
    setBusinessForm({
      name: "",
      phone: "",
      address: "",
      timezone: "Asia/Kolkata",
      category: "",
      bookingUrl: "",
      description: "",
      planId: "",
      ownerId: "",
      instagramUrl: "",
      facebookUrl: "",
      whatsappUrl: "",
      googleReviewUrl: "",
    });
    setShowBusinessModal(true);
  };

  const openEditBusinessModal = (business) => {
    setEditingBusiness_state(business);
    setBusinessForm({
      name: business.name || "",
      phone: business.phone || "",
      address: business.address || "",
      timezone: business.timezone || "Asia/Kolkata",
      category: business.category || "",
      bookingUrl: business.bookingUrl || "",
      description: business.description || "",
      planId: business.planId || "",
      ownerId: business.ownerId || "",
      instagramUrl: business.instagramUrl || "",
      facebookUrl: business.facebookUrl || "",
      whatsappUrl: business.whatsappUrl || "",
      googleReviewUrl: business.googleReviewUrl || "",
    });
    setShowBusinessModal(true);
  };

  const handleSubmitBusiness = (e) => {
    e.preventDefault();
    const payload = {
      name: businessForm.name,
      phone: businessForm.phone || undefined,
      address: businessForm.address || undefined,
      timezone: businessForm.timezone,
      category: businessForm.category || null,
      bookingUrl: businessForm.bookingUrl || null,
      description: businessForm.description || null,
      planId: businessForm.planId || undefined,
      instagramUrl: businessForm.instagramUrl || null,
      facebookUrl: businessForm.facebookUrl || null,
      whatsappUrl: businessForm.whatsappUrl || null,
      googleReviewUrl: businessForm.googleReviewUrl || null,
    };

    if (editingBusiness) {
      updateBusinessMutation.mutate({ id: editingBusiness.id, data: payload });
    } else {
      if (!businessForm.ownerId) {
        alert("Please select an owner user.");
        return;
      }
      createBusinessMutation.mutate({ ...payload, ownerId: businessForm.ownerId });
    }
  };

  // Platform pricing settings state
  const [platformFee, setPlatformFee] = useState("");
  const [gstPercent, setGstPercent] = useState("");
  const [promoLimit, setPromoLimit] = useState("");
  const [promoPrice, setPromoPrice] = useState("");
  const [gatewayPercent, setGatewayPercent] = useState("");
  const [pointsPerRupee, setPointsPerRupee] = useState("");
  const [pointsPerStamp, setPointsPerStamp] = useState("");
  const [mockBusinessCount, setMockBusinessCount] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState(null);
  const [settingsError, setSettingsError] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Fetch platform settings
  const { data: settingsData, refetch: refetchSettings } = useQuery({
    queryKey: ["superSettings"],
    queryFn: () => api.get("/admin/settings").then((res) => res.data),
    enabled: activeTab === "settings",
  });

  // Fetch AI review analytics
  const { data: reviewAnalytics, isLoading: reviewAnalyticsLoading, refetch: refetchReviewAnalytics } = useQuery({
    queryKey: ["superReviewAnalytics"],
    queryFn: () => api.get("/admin/reviews/analytics").then((res) => res.data),
    enabled: activeTab === "ai-reviews",
  });

  const openReviewSettings = async (business) => {
    setEditingReviewBusiness(business);
    setReviewSettingsFetchLoading(true);
    try {
      const res = await api.get(`/admin/reviews/settings/${business.id}`);
      const d = res.data;
      setReviewSettingsForm({
        businessType: d.businessType || "",
        googleReviewUrl: d.googleReviewUrl || "",
        instagramUrl: d.instagramUrl || "",
        facebookUrl: d.facebookUrl || "",
        googleBusinessName: d.googleBusinessName || "",
        googlePlaceId: d.googlePlaceId || "",
      });
    } catch {
      setReviewSettingsForm({ businessType: "", googleReviewUrl: "", instagramUrl: "", facebookUrl: "", googleBusinessName: "", googlePlaceId: "" });
    } finally {
      setReviewSettingsFetchLoading(false);
    }
  };

  const handleSaveReviewSettings = async (e) => {
    e.preventDefault();
    if (!editingReviewBusiness) return;
    setReviewSettingsLoading(true);
    try {
      await api.patch(`/admin/reviews/settings/${editingReviewBusiness.id}`, reviewSettingsForm);
      setEditingReviewBusiness(null);
      refetchReviewAnalytics();
      alert("AI Review settings saved successfully!");
    } catch (err) {
      alert(err.message || "Failed to save review settings.");
    } finally {
      setReviewSettingsLoading(false);
    }
  };

  // Sync settings when loaded
  React.useEffect(() => {
    if (settingsData) {
      setPlatformFee(settingsData.platform_fee || "999");
      setGstPercent(settingsData.gst_percent || "5");
      setPromoLimit(settingsData.promo_limit || "20");
      setPromoPrice(settingsData.promo_price || "999");
      setGatewayPercent(settingsData.gateway_percent || "2.3");
      setPointsPerRupee(settingsData.points_per_rupee || "0.1");
      setPointsPerStamp(settingsData.points_per_stamp || "50");
      setMockBusinessCount(settingsData.mock_business_count || "50");
    }
  }, [settingsData]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsSuccess(null);
    setSettingsError(null);
    try {
      await api.put("/admin/settings", {
        platform_fee: parseFloat(platformFee),
        gst_percent: parseFloat(gstPercent),
        promo_limit: parseInt(promoLimit),
        promo_price: parseFloat(promoPrice),
        gateway_percent: parseFloat(gatewayPercent),
        points_per_rupee: parseFloat(pointsPerRupee),
        points_per_stamp: parseInt(pointsPerStamp),
        mock_business_count: parseInt(mockBusinessCount),
      });
      setSettingsSuccess("Settings saved successfully!");
      refetchSettings();
    } catch (err) {
      setSettingsError(err.message || "Failed to save settings.");
    } finally {
      setSettingsLoading(false);
    }
  };

  // 1. Fetch platform statistics for Tenant stats overview
  const { data: statsData } = useQuery({
    queryKey: ["superDashboardStats"],
    queryFn: () => api.get("/admin/dashboard").then((res) => res.data),
    enabled: activeTab === "businesses",
  });

  // 2. Fetch businesses with search & status filters (retrieve up to 100 businesses)
  const { data: businessesData, isLoading: bizLoading } = useQuery({
    queryKey: ["superBusinessesList", searchTerm, statusFilter],
    queryFn: () => {
      let url = "/admin/businesses?limit=100&";
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
      if (statusFilter !== "ALL") url += `status=${statusFilter}&`;
      return api.get(url).then((res) => res.data);
    },
    enabled: activeTab === "businesses",
  });

  // 2. Fetch plans
  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ["superPlansList"],
    queryFn: () => api.get("/admin/plans").then((res) => res.data),
    enabled: activeTab === "plans",
  });

  // 3. Toggle business status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }) =>
      api.patch(`/admin/businesses/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superBusinessesList"] });
    }
  });

  // Update business point rate mutation
  const updatePointsMutation = useMutation({
    mutationFn: ({ id, pointsPerRupee }) =>
      api.patch(`/admin/businesses/${id}/loyalty-settings`, { pointsPerRupee }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superBusinessesList"] });
      setEditingPointsBusiness(null);
      alert("Business loyalty point rate updated successfully!");
    },
    onError: (err) => {
      alert(err.message || "Failed to update point rate");
    }
  });

  // Update business description mutation
  const updateDescriptionMutation = useMutation({
    mutationFn: ({ id, description }) =>
      api.patch(`/admin/businesses/${id}/description`, { description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superBusinessesList"] });
      setEditingDescriptionBusiness(null);
      alert("Business description updated successfully!");
    },
    onError: (err) => {
      alert(err.message || "Failed to update description");
    }
  });

  // Delete business mutation
  const deleteBusinessMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/businesses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superBusinessesList"] });
    },
    onError: (err) => {
      alert(err.message || "Failed to delete business.");
    }
  });

  // 4. Create Plan mutation
  const createPlanMutation = useMutation({
    mutationFn: (data) => api.post("/admin/plans", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superPlansList"] });
      setShowAddPlanModal(false);
      resetPlanForm();
    },
    onError: (err) => {
      setErrorMsg(err.message || "Failed to create plan.");
    }
  });

  // 5. Update Plan mutation
  const updatePlanMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/admin/plans/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superPlansList"] });
      setEditingPlan(null);
      resetPlanForm();
    },
    onError: (err) => {
      setErrorMsg(err.message || "Failed to update plan.");
    }
  });

  // 6. Delete Plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/plans/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superPlansList"] });
    },
    onError: (err) => {
      alert(err.message || "Failed to delete plan.");
    }
  });

  const handleCreatePlan = (e) => {
    e.preventDefault();
    setErrorMsg(null);
    createPlanMutation.mutate({
      name: planName,
      priceMonthly: parseFloat(priceMonthly),
      maxBranches: parseInt(maxBranches),
      maxCustomers: parseInt(maxCustomers),
      features: {
        analyticsAccess,
        customBranding,
        csvExport,
        apiAccess,
      },
      isActive,
    });
  };

  const handleUpdatePlan = (e) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!editingPlan) return;
    updatePlanMutation.mutate({
      id: editingPlan.id,
      name: planName,
      priceMonthly: parseFloat(priceMonthly),
      maxBranches: parseInt(maxBranches),
      maxCustomers: parseInt(maxCustomers),
      features: {
        analyticsAccess,
        customBranding,
        csvExport,
        apiAccess,
      },
      isActive,
    });
  };

  const resetPlanForm = () => {
    setPlanName("Launch Year Special");
    setPriceMonthly("");
    setMaxBranches("");
    setMaxCustomers("");
    setAnalyticsAccess(false);
    setCustomBranding(false);
    setCsvExport(false);
    setApiAccess(false);
    setIsActive(true);
    setErrorMsg(null);
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setNotifLoading(true);
    setNotifSuccess(null);
    setNotifError(null);
    try {
      await api.post("/admin/notifications", {
        targetType: notifTargetType,
        targetValue: notifTargetValue,
        title: notifTitle,
        body: notifBody,
      });
      setNotifSuccess("Alert sent successfully!");
      setNotifTargetValue("");
      setNotifTitle("");
      setNotifBody("");
    } catch (err) {
      setNotifError(err.message || "Failed to send alert. Check target value.");
    } finally {
      setNotifLoading(false);
    }
  };

  const businesses = businessesData || [];
  const plans = plansData || [];

  return (
    React.createElement('div', { className: "space-y-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 144 } }
      /* Header */
      , React.createElement('div', { className: "flex items-center justify-between", __self: this, __source: { fileName: _jsxFileName, lineNumber: 146 } }
        , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 147 } }
          , React.createElement('h1', { className: "text-3xl font-extrabold text-foreground tracking-tight", __self: this, __source: { fileName: _jsxFileName, lineNumber: 148 } }, "Merchants & Subscriptions")
          , React.createElement('p', { className: "text-xs text-muted-foreground mt-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 149 } }, "Supervise business accounts, suspend/reactivate tenants and deploy SaaS subscription plan tiers"

          )
        )
        , activeTab === "businesses" && (
          React.createElement(Button, { onClick: () => openCreateBusinessModal(), className: "bg-primary hover:bg-primary/90 text-primary-foreground" }
            , React.createElement(Plus, { className: "mr-2 h-4 w-4" }), " Register Merchant"
          )
        )
        , activeTab === "plans" && (
          React.createElement(Button, { onClick: () => { setShowAddPlanModal(true); resetPlanForm(); }, className: "bg-primary hover:bg-primary/90 text-primary-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 154 } }
            , React.createElement(Plus, { className: "mr-2 h-4 w-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 155 } }), " Create Plan"
          )
        )
      )

      , React.createElement(Tabs, { defaultValue: "businesses", className: "w-full", onValueChange: (val) => { setActiveTab(val); resetPlanForm(); setNotifSuccess(null); setNotifError(null); setSettingsSuccess(null); setSettingsError(null); }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 160 } }
        , React.createElement(TabsList, { className: "grid w-full grid-cols-5 mb-6" }
          , React.createElement(TabsTrigger, { value: "businesses" }, "Tenants")
          , React.createElement(TabsTrigger, { value: "plans" }, "Pricing Plans")
          , React.createElement(TabsTrigger, { value: "notifications" }, "Send Alerts")
          , React.createElement(TabsTrigger, { value: "ai-reviews" }
            , React.createElement(MessageSquareText, { className: "h-3.5 w-3.5 mr-1.5" })
            , "AI Reviews"
          )
          , React.createElement(TabsTrigger, { value: "settings" }, "Platform Settings")
        )

        /* Tenants Tab */
        , React.createElement(TabsContent, { value: "businesses", className: "space-y-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 207 } }
          /* Platform stats metrics row */
          , React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-4 gap-4" }
            , React.createElement(Card, { className: "bg-slate-50/50 border border-border/40" }
              , React.createElement(CardContent, { className: "p-4 flex items-center justify-between" }
                , React.createElement('div', null
                  , React.createElement('p', { className: "text-[10px] font-bold text-muted-foreground uppercase tracking-wider" }, "Total Registered")
                  , React.createElement('h3', { className: "text-2xl font-black text-foreground mt-1" }, statsData?.totalBusinesses ?? 0)
                )
                , React.createElement(Building2, { className: "h-8 w-8 text-primary/70" })
              )
            )
            , React.createElement(Card, { className: "bg-emerald-50/25 border border-emerald-100/60" }
              , React.createElement(CardContent, { className: "p-4 flex items-center justify-between" }
                , React.createElement('div', null
                  , React.createElement('p', { className: "text-[10px] font-bold text-emerald-800 uppercase tracking-wider" }, "Active Storefronts")
                  , React.createElement('h3', { className: "text-2xl font-black text-emerald-950 mt-1" }, statsData?.activeBusinesses ?? 0)
                )
                , React.createElement(Building2, { className: "h-8 w-8 text-emerald-600/70" })
              )
            )
            , React.createElement(Card, { className: "bg-indigo-50/25 border border-indigo-100/60" }
              , React.createElement(CardContent, { className: "p-4 flex items-center justify-between" }
                , React.createElement('div', null
                  , React.createElement('p', { className: "text-[10px] font-bold text-indigo-800 uppercase tracking-wider" }, "Active Subscriptions")
                  , React.createElement('h3', { className: "text-2xl font-black text-indigo-950 mt-1" }, statsData?.activeSubscriptions ?? 0)
                )
                , React.createElement(Building2, { className: "h-8 w-8 text-indigo-650/70" })
              )
            )
            , React.createElement(Card, { className: "bg-purple-50/25 border border-purple-100/60" }
              , React.createElement(CardContent, { className: "p-4 flex items-center justify-between" }
                , React.createElement('div', null
                  , React.createElement('p', { className: "text-[10px] font-bold text-purple-800 uppercase tracking-wider" }, "Platform Customers")
                  , React.createElement('h3', { className: "text-2xl font-black text-purple-955 mt-1" }, statsData?.totalCustomers ?? 0)
                )
                , React.createElement(Building2, { className: "h-8 w-8 text-purple-600/70" })
              )
            )
          )
          , React.createElement('div', { className: "flex flex-col sm:flex-row gap-4 items-center bg-slate-50 border border-border/60 rounded-xl p-4" }
            , React.createElement('div', { className: "w-full sm:flex-1 space-y-1" }
              , React.createElement(Label, { htmlFor: "search-input", className: "text-xs font-semibold text-muted-foreground" }, "Search Business Name / Phone")
              , React.createElement(Input, {
                id: "search-input",
                placeholder: "e.g. Brews or Ramesh",
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value),
                className: "bg-white border-border text-xs"
              })
            )
            , React.createElement('div', { className: "w-full sm:w-48 space-y-1" }
              , React.createElement(Label, { htmlFor: "status-filter", className: "text-xs font-semibold text-muted-foreground" }, "Status Filter")
              , React.createElement('select', {
                id: "status-filter",
                value: statusFilter,
                onChange: (e) => setStatusFilter(e.target.value),
                className: "w-full h-10 border border-border rounded-md bg-white text-xs px-3 outline-none"
              },
                React.createElement('option', { value: "ALL" }, "All Statuses"),
                React.createElement('option', { value: "ACTIVE" }, "ACTIVE"),
                React.createElement('option', { value: "PENDING" }, "PENDING"),
                React.createElement('option', { value: "SUSPENDED" }, "SUSPENDED")
              )
            )
          )
          , bizLoading ? (
            React.createElement('div', { className: "flex justify-center py-12", __self: this, __source: { fileName: _jsxFileName, lineNumber: 169 } }
              , React.createElement(Loader2, { className: "h-8 w-8 animate-spin text-primary", __self: this, __source: { fileName: _jsxFileName, lineNumber: 170 } })
            )
          ) : businesses.length === 0 ? (
            React.createElement(Card, { className: "border-dashed border-border bg-slate-50/50 py-12 text-center", glass: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 173 } }
              , React.createElement(CardContent, { className: "flex flex-col items-center justify-center space-y-3", __self: this, __source: { fileName: _jsxFileName, lineNumber: 174 } }
                , React.createElement(Building2, { className: "h-10 w-10 text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 175 } })
                , React.createElement('p', { className: "text-sm text-muted-foreground font-medium", __self: this, __source: { fileName: _jsxFileName, lineNumber: 176 } }, "No registered merchant accounts")
              )
            )
          ) : (
            React.createElement('div', { className: "grid grid-cols-1 gap-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 180 } }
              , businesses.map((business) => (
                React.createElement(Card, { key: business.id, className: "glass", glass: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 182 } }
                  , React.createElement(CardContent, { className: "p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-center", __self: this, __source: { fileName: _jsxFileName, lineNumber: 183 } }
                    /* Merchant Info */
                    , React.createElement('div', { className: "space-y-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 185 } }
                       , React.createElement('h3', { className: "text-base font-bold text-foreground flex items-center flex-wrap gap-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 186 } }
                        , business.name
                        , React.createElement('span', {
                          className: `text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${business.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : business.status === "PENDING"
                              ? "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                              : "bg-red-50 text-red-700 border border-red-200"
                            }`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 188 }
                        }
                          , business.status
                        )
                        , business.category && React.createElement('span', { className: "text-[9px] font-extrabold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase" }, business.category)
                      )
                      , React.createElement('p', { className: "text-xs text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 198 } }, "Created: ", formatDate(business.createdAt))
                      , React.createElement('p', { className: "text-[10px] text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 199 } }, "ID: ", business.id)
                      , business.address && React.createElement('p', { className: "text-[10px] text-muted-foreground italic truncate max-w-[200px] mt-0.5" }, "Address: ", business.address)
                      , React.createElement('p', { className: "text-[9px] text-muted-foreground/80 mt-0.5" }, "Timezone: ", business.timezone)
                      , React.createElement('p', { className: "text-[10px] text-slate-700 mt-1 line-clamp-2 italic max-w-[200px]" }
                          , "Description: ", business.description || "No description set"
                        )
                      , React.createElement('div', { className: "flex gap-3 items-center mt-1" }
                        , React.createElement('button', {
                            type: "button",
                            onClick: () => openEditBusinessModal(business),
                            className: "text-[10px] text-[#FF6A00] hover:underline font-bold"
                          }
                            , "Edit Profile"
                          )
                        , React.createElement('button', {
                            type: "button",
                            onClick: () => {
                              setEditingDescriptionBusiness(business);
                              setEditDescriptionVal(business.description || "");
                            },
                            className: "text-[9px] text-slate-500 hover:underline font-semibold"
                          }
                            , "Edit Description"
                          )
                      )
                      , business.category?.toLowerCase() === "hotels" && business.bookingUrl && React.createElement('p', { className: "text-[10px] text-indigo-700 font-bold mt-1" }
                          , "Booking: "
                          , React.createElement('a', { href: business.bookingUrl.startsWith("http") ? business.bookingUrl : `https://${business.bookingUrl}`, target: "_blank", rel: "noopener noreferrer", className: "underline hover:text-indigo-900" }, "Link ↗")
                        )
                    )

                    /* Owner Details */
                    , React.createElement('div', { className: "space-y-0.5 text-xs text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 203 } }
                      , React.createElement('span', { className: "text-[10px] text-muted-foreground uppercase tracking-widest block font-bold", __self: this, __source: { fileName: _jsxFileName, lineNumber: 204 } }, "Owner")
                      , React.createElement('p', { className: "font-semibold text-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 205 } }, business.owner.name)
                      , React.createElement('p', { className: "font-mono text-[10px]", __self: this, __source: { fileName: _jsxFileName, lineNumber: 206 } }, business.owner.phone)
                      , business.owner.email && React.createElement('p', { className: "text-[10px]", __self: this, __source: { fileName: _jsxFileName, lineNumber: 207 } }, business.owner.email)
                    )

                    /* Subscription Info */
                    , React.createElement('div', { className: "space-y-0.5 text-xs text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 211 } }
                      , React.createElement('span', { className: "text-[10px] text-muted-foreground uppercase tracking-widest block font-bold", __self: this, __source: { fileName: _jsxFileName, lineNumber: 212 } }, "Subscription")
                      , React.createElement('p', { className: "font-semibold text-foreground uppercase", __self: this, __source: { fileName: _jsxFileName, lineNumber: 213 } }, "Plan: "
                        , _optionalChain([business, 'access', _ => _.plan, 'optionalAccess', _2 => _2.name]) || "Trial"
                      )
                      , React.createElement('p', { className: "text-[10px] text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 216 } }, "Status: "
                        , React.createElement('strong', { className: "text-primary font-semibold", __self: this, __source: { fileName: _jsxFileName, lineNumber: 217 } }, _optionalChain([business, 'access', _3 => _3.subscription, 'optionalAccess', _4 => _4.status]) || "None")
                      )
                      , _optionalChain([business, 'access', _5 => _5.subscription, 'optionalAccess', _6 => _6.currentPeriodEnd]) && (
                        React.createElement('p', { className: "text-[9px] text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 220 } }, "Expires: ", formatDate(business.subscription.currentPeriodEnd))
                      )
                      , React.createElement('div', { className: "pt-1 mt-1 border-t border-dashed border-border/50 text-[10px]", __self: this, __source: { fileName: _jsxFileName, lineNumber: 222 } }
                        , React.createElement('p', { className: "text-slate-800 font-semibold", __self: this, __source: { fileName: _jsxFileName, lineNumber: 223 } }
                          , "Point Rate: "
                          , React.createElement('span', { className: "font-bold text-primary", __self: this, __source: { fileName: _jsxFileName, lineNumber: 224 } }, _optionalChain([business, 'access', _b => _b.loyaltyProgramSettings, 'optionalAccess', _s => _s.pointsPerRupee]) ?? "0.1")
                          , " pts/₹"
                        )
                        , React.createElement('button', {
                            type: "button",
                            onClick: () => {
                              setEditingPointsBusiness(business);
                              setEditPointsVal(String(_optionalChain([business, 'access', _b => _b.loyaltyProgramSettings, 'optionalAccess', _s => _s.pointsPerRupee]) ?? "0.1"));
                            },
                            className: "text-[9px] text-indigo-650 hover:underline font-bold mt-0.5 block",
                            __self: this,
                            __source: { fileName: _jsxFileName, lineNumber: 226 }
                          }
                          , "Edit Point Rate"
                        )
                      )
                    )

                    /* Suspend / Reactive Toggles */
                    , React.createElement('div', { className: "text-right flex md:flex-col justify-end items-end gap-2 md:gap-0", __self: this, __source: { fileName: _jsxFileName, lineNumber: 225 } }
                      , React.createElement('div', { className: "text-[10px] text-muted-foreground mb-1.5 hidden md:block", __self: this, __source: { fileName: _jsxFileName, lineNumber: 226 } }
                        , business._count.branches, " branches • ", business._count.staff, " staff"
                      )

                      , business.status === "PENDING" ? (
                        React.createElement(Button, {
                          variant: "default",
                          size: "sm",
                          className: "text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm flex items-center gap-1.5",
                          onClick: () => toggleStatusMutation.mutate({ id: business.id, status: "ACTIVE" }),
                          disabled: toggleStatusMutation.isPending, __self: this, __source: { fileName: _jsxFileName, lineNumber: 231 }
                        }

                          , toggleStatusMutation.isPending && _optionalChain([toggleStatusMutation, 'access', _7 => _7.variables, 'optionalAccess', _8 => _8.id]) === business.id ? (
                            React.createElement(Loader2, { className: "h-3.5 w-3.5 animate-spin", __self: this, __source: { fileName: _jsxFileName, lineNumber: 239 } })
                          ) : (
                            React.createElement(Plus, { className: "h-3.5 w-3.5", __self: this, __source: { fileName: _jsxFileName, lineNumber: 241 } })
                          ), "Approve Request"

                        )
                      ) : business.status === "ACTIVE" ? (
                        React.createElement(Button, {
                          variant: "ghost",
                          size: "sm",
                          className: "text-xs text-muted-foreground hover:text-red-600 hover:bg-red-50/50",
                          onClick: () => toggleStatusMutation.mutate({ id: business.id, status: "SUSPENDED" }), __self: this, __source: { fileName: _jsxFileName, lineNumber: 246 }
                        }

                          , React.createElement(ToggleRight, { className: "mr-1.5 h-4.5 w-4.5 text-primary", __self: this, __source: { fileName: _jsxFileName, lineNumber: 252 } }), " Suspend Merchant"
                        )
                      ) : (
                        React.createElement(Button, {
                          variant: "ghost",
                          size: "sm",
                          className: "text-xs text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50/50",
                          onClick: () => toggleStatusMutation.mutate({ id: business.id, status: "ACTIVE" }), __self: this, __source: { fileName: _jsxFileName, lineNumber: 255 }
                        }

                          , React.createElement(ToggleLeft, { className: "mr-1.5 h-4.5 w-4.5 text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 261 } }), " Reactivate Merchant"
                        )
                      )
                      , React.createElement(Button, {
                        variant: "ghost",
                        size: "sm",
                        className: "text-xs text-red-500 hover:text-red-750 hover:bg-red-50/50 mt-1 flex items-center justify-center",
                        onClick: () => {
                          setBusinessToDelete(business);
                        },
                        disabled: deleteBusinessMutation.isPending && _optionalChain([deleteBusinessMutation, 'access', _x => _x.variables]) === business.id
                      }
                        , "Delete Business"
                      )
                    )
                  )
                )
              ))
            )
          )
        )

        /* Pricing Plans Tab */
        , React.createElement(TabsContent, { value: "plans", className: "space-y-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 273 } }
          , plansLoading ? (
            React.createElement('div', { className: "flex justify-center py-12", __self: this, __source: { fileName: _jsxFileName, lineNumber: 276 } }
              , React.createElement(Loader2, { className: "h-8 w-8 animate-spin text-primary", __self: this, __source: { fileName: _jsxFileName, lineNumber: 277 } })
            )
          ) : plans.length === 0 ? (
            React.createElement('div', { className: "text-center py-12 text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 279 } }, "No subscription plans defined. Add one above."
            )
          ) : (
            React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 283 } }
              , plans.map((plan) => (
                React.createElement(Card, {
                  key: plan.id,
                  className: `flex flex-col justify-between transition-all duration-300 ${plan.isActive ? "border-2 border-[#FF6A00] shadow-[0_0_20px_rgba(255,106,0,0.1)] bg-white" : "glass opacity-70"}`
                }
                  , React.createElement(CardHeader, { className: "p-6" }
                    , React.createElement('div', { className: "flex justify-between items-start" }
                      , React.createElement(CardTitle, { className: "text-lg font-bold text-[#07122A] uppercase tracking-wider" }
                        , plan.name
                      )
                      , React.createElement('span', { className: `text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${plan.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-zinc-100 text-zinc-500 border-zinc-200"}` }
                        , plan.isActive ? "Active Launch Plan" : "Inactive"
                      )
                    )
                    , React.createElement(CardDescription, { className: "text-2xl font-black text-primary mt-2" }
                      , "₹", parseInt(plan.priceMonthly).toLocaleString("en-IN"), "/yr"
                    )
                  )
                  , React.createElement(CardContent, { className: "p-6 pt-0 space-y-4 flex-1" }
                    , React.createElement('div', { className: "space-y-2 text-xs text-muted-foreground" }
                      , React.createElement('div', { className: "flex justify-between border-b border-border/50 pb-1.5" }
                        , React.createElement('span', null, "Max Branches")
                        , React.createElement('strong', { className: "text-foreground" }, plan.maxBranches)
                      )
                      , React.createElement('div', { className: "flex justify-between border-b border-border/50 pb-1.5" }
                        , React.createElement('span', null, "Max Customers")
                        , React.createElement('strong', { className: "text-foreground" }, plan.maxCustomers)
                      )
                    )

                    , React.createElement('div', { className: "space-y-1.5 pt-2" }
                      , React.createElement('span', { className: "text-[10px] text-muted-foreground uppercase tracking-widest block font-bold" }, "Included Features")
                      , React.createElement('div', { className: "flex flex-wrap gap-1.5" }
                        , plan.features.analyticsAccess && (
                          React.createElement('span', { className: "text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200" }, "Analytics Access"
                          )
                        )
                        , plan.features.customBranding && (
                          React.createElement('span', { className: "text-[9px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200" }, "Custom Branding"
                          )
                        )
                        , plan.features.csvExport && (
                          React.createElement('span', { className: "text-[9px] bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full border border-pink-200" }, "CSV Export"
                          )
                        )
                        , plan.features.apiAccess && (
                          React.createElement('span', { className: "text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200" }, "Developer API"
                          )
                        )
                      )
                    )
                  )
                  , React.createElement('div', { className: "p-6 pt-0 mt-auto border-t border-border/30 pt-4 flex gap-2 justify-end" }
                    , React.createElement(Button, {
                      size: "sm",
                      variant: "outline",
                      onClick: () => {
                        setEditingPlan(plan);
                        setPlanName(plan.name);
                        setPriceMonthly(String(plan.priceMonthly));
                        setMaxBranches(String(plan.maxBranches));
                        setMaxCustomers(String(plan.maxCustomers));
                        setAnalyticsAccess(plan.features.analyticsAccess);
                        setCustomBranding(plan.features.customBranding);
                        setCsvExport(plan.features.csvExport);
                        setApiAccess(plan.features.apiAccess);
                        setIsActive(plan.isActive);
                      }
                    }, "Edit")
                    , React.createElement(Button, {
                      size: "sm",
                      variant: "ghost",
                      className: "text-red-500 hover:text-red-700 hover:bg-red-50/50",
                      onClick: () => {
                        if (window.confirm(`Are you sure you want to delete the plan "${plan.name}"?`)) {
                          deletePlanMutation.mutate(plan.id);
                        }
                      }
                    }, "Delete")
                  )
                )
              ))
            )
          )
        )

        /* Send Alerts Tab */
        , React.createElement(TabsContent, { value: "notifications", className: "space-y-4" }
          , React.createElement(Card, { className: "glass max-w-md mx-auto", glass: true }
            , React.createElement(CardHeader, null
              , React.createElement(CardTitle, { className: "text-lg font-bold" }, "Send Direct Notification")
              , React.createElement(CardDescription, { className: "text-xs" }, "Push message notifications directly to user phones or business owners.")
            )
            , React.createElement(CardContent, null
              , notifSuccess && React.createElement('div', { className: "mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg p-3 text-center font-medium animate-fade-in" }, notifSuccess)
              , notifError && React.createElement('div', { className: "mb-4 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg p-3 text-center font-medium animate-fade-in" }, notifError)
              , React.createElement('form', { onSubmit: handleSendNotification, className: "space-y-4" }
                , React.createElement('div', { className: "space-y-1.5" }
                  , React.createElement(Label, { htmlFor: "notif-target" }, "Target Type")
                  , React.createElement('select', {
                    id: "notif-target",
                    value: notifTargetType,
                    onChange: (e) => { setNotifTargetType(e.target.value); setNotifTargetValue(""); },
                    className: "w-full h-10 border border-border rounded-md bg-white text-xs px-3 outline-none"
                  },
                    React.createElement('option', { value: "user_phone" }, "Direct User Phone (e.g. +91XXXXXXXXXX)"),
                    React.createElement('option', { value: "user_id" }, "Direct User ID (CUID)"),
                    React.createElement('option', { value: "business_id" }, "Business Owner (Business ID)")
                  )
                )
                , React.createElement('div', { className: "space-y-1" }
                  , React.createElement(Label, { htmlFor: "notif-value" }, "Target Value Identifier")
                  , React.createElement(Input, {
                    id: "notif-value",
                    placeholder: notifTargetType === "user_phone" ? "e.g. +919937012345" : notifTargetType === "user_id" ? "e.g. clabc123..." : "e.g. seed-business-cafe",
                    value: notifTargetValue,
                    onChange: (e) => setNotifTargetValue(e.target.value),
                    required: true,
                    className: "text-xs"
                  })
                )
                , React.createElement('div', { className: "space-y-1" }
                  , React.createElement(Label, { htmlFor: "notif-title" }, "Alert Title")
                  , React.createElement(Input, {
                    id: "notif-title",
                    placeholder: "e.g. Reward Ready! or System Update",
                    value: notifTitle,
                    onChange: (e) => setNotifTitle(e.target.value),
                    required: true,
                    className: "text-xs"
                  })
                )
                , React.createElement('div', { className: "space-y-1" }
                  , React.createElement(Label, { htmlFor: "notif-body" }, "Alert Body Message")
                  , React.createElement('textarea', {
                    id: "notif-body",
                    placeholder: "Enter details of the push notification alert...",
                    value: notifBody,
                    onChange: (e) => setNotifBody(e.target.value),
                    required: true,
                    className: "w-full min-h-[90px] text-xs border border-border rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground"
                  })
                )
                , React.createElement(Button, { type: "submit", className: "w-full bg-primary text-primary-foreground", disabled: notifLoading }
                  , notifLoading ? React.createElement(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null
                  , "Send Push Notification"
                )
              )
            )
          )
        )
        /* ── AI Reviews Tab ─────────────────────────────────── */
        , React.createElement(TabsContent, { value: "ai-reviews", className: "space-y-6" }

          /* Platform KPI row */
          , reviewAnalyticsLoading ? (
            React.createElement('div', { className: "flex justify-center py-16" }
              , React.createElement(Loader2, { className: "h-8 w-8 animate-spin text-primary" })
            )
          ) : (
            React.createElement(React.Fragment, null

              /* KPI Cards */
              , React.createElement('div', { className: "grid grid-cols-2 sm:grid-cols-4 gap-4" }
                , React.createElement(Card, { className: "bg-indigo-50/40 border border-indigo-100" }
                  , React.createElement(CardContent, { className: "p-4" }
                    , React.createElement('p', { className: "text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1" }, "Total Generations")
                    , React.createElement('h3', { className: "text-2xl font-black text-indigo-950" }, reviewAnalytics?.totalGenerations ?? 0)
                    , React.createElement('p', { className: "text-[9px] text-indigo-500 mt-0.5" }, "AI review sessions")
                  )
                )
                , React.createElement(Card, { className: "bg-emerald-50/40 border border-emerald-100" }
                  , React.createElement(CardContent, { className: "p-4" }
                    , React.createElement('p', { className: "text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1" }, "Selection Rate")
                    , React.createElement('h3', { className: "text-2xl font-black text-emerald-950" }, reviewAnalytics?.selectionRate ?? 0, "%")
                    , React.createElement('p', { className: "text-[9px] text-emerald-500 mt-0.5" }, "customers picked a review")
                  )
                )
                , React.createElement(Card, { className: "bg-amber-50/40 border border-amber-100" }
                  , React.createElement(CardContent, { className: "p-4" }
                    , React.createElement('p', { className: "text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1" }, "Click-Through Rate")
                    , React.createElement('h3', { className: "text-2xl font-black text-amber-950" }, reviewAnalytics?.clickThroughRate ?? 0, "%")
                    , React.createElement('p', { className: "text-[9px] text-amber-500 mt-0.5" }, "opened Google review link")
                  )
                )
                , React.createElement(Card, { className: "bg-purple-50/40 border border-purple-100" }
                  , React.createElement(CardContent, { className: "p-4" }
                    , React.createElement('p', { className: "text-[10px] font-bold text-purple-700 uppercase tracking-wider mb-1" }, "With Selection")
                    , React.createElement('h3', { className: "text-2xl font-black text-purple-950" }, reviewAnalytics?.totalWithSelection ?? 0)
                    , React.createElement('p', { className: "text-[9px] text-purple-500 mt-0.5" }, "reviews copied by customers")
                  )
                )
              )

              /* Rating Breakdown + Per-Business Activity */
              , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6" }

                /* Rating Distribution */
                , React.createElement(Card, { className: "glass" }
                  , React.createElement(CardHeader, { className: "pb-2" }
                    , React.createElement(CardTitle, { className: "text-sm font-bold flex items-center gap-2" }
                      , React.createElement(BarChart3, { className: "h-4 w-4 text-primary" })
                      , "Rating Distribution"
                    )
                    , React.createElement(CardDescription, { className: "text-[10px]" }, "How customers are rating businesses before generating reviews")
                  )
                  , React.createElement(CardContent, { className: "space-y-2" }
                    , [5, 4, 3, 2, 1].map((star) => {
                      const entry = (reviewAnalytics?.ratingBreakdown || []).find(r => r.rating === star);
                      const count = entry?._count?.id ?? 0;
                      const total = reviewAnalytics?.totalGenerations || 1;
                      const pct = Math.round((count / total) * 100);
                      return React.createElement('div', { key: star, className: "flex items-center gap-3" }
                        , React.createElement('div', { className: "flex items-center gap-0.5 w-14 shrink-0" }
                          , React.createElement('span', { className: "text-xs font-bold text-slate-700" }, star)
                          , React.createElement(Star, { className: "h-3 w-3 text-amber-400 fill-amber-400" })
                        )
                        , React.createElement('div', { className: "flex-1 h-2 rounded-full bg-slate-100 overflow-hidden" }
                          , React.createElement('div', {
                            className: "h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500",
                            style: { width: `${pct}%` }
                          })
                        )
                        , React.createElement('span', { className: "text-[10px] font-semibold text-slate-500 w-12 text-right" }, count, " (" , pct, "%)")
                      );
                    })
                  )
                )

                /* Recent 10 Generations */
                , React.createElement(Card, { className: "glass" }
                  , React.createElement(CardHeader, { className: "pb-2" }
                    , React.createElement(CardTitle, { className: "text-sm font-bold flex items-center gap-2" }
                      , React.createElement(MessageSquareText, { className: "h-4 w-4 text-primary" })
                      , "Recent AI Generations"
                    )
                    , React.createElement(CardDescription, { className: "text-[10px]" }, "Latest 10 review generation sessions across all tenants")
                  )
                  , React.createElement(CardContent, { className: "space-y-2 max-h-72 overflow-y-auto pr-1" }
                    , (reviewAnalytics?.recentGenerations || []).length === 0 ? (
                      React.createElement('p', { className: "text-xs text-muted-foreground text-center py-6" }, "No review generations yet")
                    ) : (
                      (reviewAnalytics?.recentGenerations || []).map((gen) =>
                        React.createElement('div', { key: gen.id, className: "flex items-start justify-between gap-2 py-2 border-b border-border/40 last:border-0" }
                          , React.createElement('div', { className: "flex-1 min-w-0" }
                            , React.createElement('p', { className: "text-[10px] font-bold text-foreground truncate" }, gen.business?.name || "Unknown Business")
                            , React.createElement('p', { className: "text-[9px] text-muted-foreground truncate" }, gen.user?.name || "Anonymous", " • ", gen.user?.phone || "")
                            , gen.selectedReview && React.createElement('p', { className: "text-[9px] text-slate-600 italic line-clamp-1 mt-0.5" }, "\"" , gen.selectedReview, "\"")
                          )
                          , React.createElement('div', { className: "flex flex-col items-end gap-1 shrink-0" }
                            , React.createElement('div', { className: "flex items-center gap-0.5" }
                              , Array.from({ length: gen.rating }).map((_, i) => React.createElement(Star, { key: i, className: "h-2.5 w-2.5 text-amber-400 fill-amber-400" }))
                            )
                            , React.createElement('div', { className: "flex items-center gap-1" }
                              , gen.selectedReview
                                ? React.createElement(CheckCircle2, { className: "h-3 w-3 text-emerald-500" })
                                : React.createElement(XCircle, { className: "h-3 w-3 text-slate-300" })
                              , gen.reviewLinkClicked
                                ? React.createElement(ExternalLink, { className: "h-3 w-3 text-indigo-500" })
                                : React.createElement(ExternalLink, { className: "h-3 w-3 text-slate-200" })
                            )
                          )
                        )
                      )
                    )
                  )
                )
              )

              /* Per-Business Activity Table */
              , React.createElement(Card, { className: "glass" }
                , React.createElement(CardHeader, { className: "pb-3" }
                  , React.createElement(CardTitle, { className: "text-sm font-bold flex items-center gap-2" }
                    , React.createElement(Settings2, { className: "h-4 w-4 text-primary" })
                    , "Business Review Setup & Activity"
                  )
                  , React.createElement(CardDescription, { className: "text-[10px]" }, "Manage AI review settings per merchant — Google Review URL, business type, and generation counts")
                )
                , React.createElement(CardContent, null
                  , (reviewAnalytics?.businessBreakdown || []).length === 0 ? (
                    React.createElement('div', { className: "text-center py-12 text-muted-foreground" }
                      , React.createElement(MessageSquareText, { className: "h-10 w-10 mx-auto mb-2 text-muted-foreground/30" })
                      , React.createElement('p', { className: "text-xs" }, "No review activity yet across any merchants")
                    )
                  ) : (
                    React.createElement('div', { className: "space-y-2" }
                      , (reviewAnalytics?.businessBreakdown || []).map((entry) =>
                        React.createElement('div', {
                          key: entry.businessId,
                          className: "flex flex-col sm:flex-row sm:items-center gap-3 py-3 px-3 rounded-xl border border-border/50 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                        }
                          , React.createElement('div', { className: "flex-1 min-w-0" }
                            , React.createElement('div', { className: "flex items-center gap-2 flex-wrap" }
                              , React.createElement('p', { className: "text-xs font-bold text-foreground" }, entry.business?.name || entry.businessId)
                              , entry.business?.category && React.createElement('span', { className: "text-[8px] font-extrabold bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-full uppercase" }, entry.business.category)
                              , entry.business?.reviewSettings?.businessType && React.createElement('span', { className: "text-[8px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 px-1.5 py-0.5 rounded-full" }, entry.business.reviewSettings.businessType)
                            )
                            , React.createElement('div', { className: "flex items-center gap-3 mt-1" }
                              , React.createElement('span', { className: "text-[10px] text-muted-foreground" }
                                , React.createElement('strong', { className: "text-primary" }, entry.count)
                                , " review generations"
                              )
                              , entry.business?.reviewSettings?.googleReviewUrl ? (
                                React.createElement('a', {
                                  href: entry.business.reviewSettings.googleReviewUrl,
                                  target: "_blank",
                                  rel: "noopener noreferrer",
                                  className: "text-[9px] text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 font-semibold"
                                }
                                  , React.createElement(ExternalLink, { className: "h-2.5 w-2.5" })
                                  , "Google Review Link"
                                )
                              ) : (
                                React.createElement('span', { className: "text-[9px] text-red-400 font-semibold" }, "⚠ No Google Review URL")
                              )
                              , entry.business?.reviewSettings?.googlePlaceId ? (
                                React.createElement('span', { className: "text-[9px] text-emerald-600 font-semibold" }, "✓ Place ID set")
                              ) : null
                            )
                          )
                          , React.createElement(Button, {
                            size: "sm",
                            variant: "outline",
                            className: "text-[10px] h-7 px-2.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50 shrink-0",
                            onClick: () => openReviewSettings({ id: entry.businessId, name: entry.business?.name || entry.businessId })
                          }
                            , React.createElement(Settings2, { className: "h-3 w-3 mr-1" })
                            , "Edit AI Settings"
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        )

        , activeTab === "settings" && (
          React.createElement(TabsContent, { value: "settings", className: "space-y-4" }
            , React.createElement(Card, { className: "glass max-w-md mx-auto", glass: true }
              , React.createElement(CardHeader, null
                , React.createElement(CardTitle, { className: "text-lg font-bold text-foreground" }, "Configure Platform Pricing")
                , React.createElement(CardDescription, { className: "text-xs text-muted-foreground" }, "Manage default subscription fees, GST rates, and early-bird promo targets.")
              )
              , React.createElement(CardContent, null
                , settingsSuccess && React.createElement('div', { className: "mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg p-3 text-center font-medium animate-fade-in" }, settingsSuccess)
                , settingsError && React.createElement('div', { className: "mb-4 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg p-3 text-center font-medium animate-fade-in" }, settingsError)
                , React.createElement('form', { onSubmit: handleSaveSettings, className: "space-y-4" }
                  , React.createElement('div', { className: "space-y-1.5" }
                    , React.createElement(Label, { htmlFor: "platform-fee", className: "text-xs font-semibold text-muted-foreground" }, "Standard Platform Fee (INR / Year)")
                    , React.createElement(Input, {
                      id: "platform-fee",
                      type: "number",
                      value: platformFee,
                      onChange: (e) => setPlatformFee(e.target.value),
                      required: true,
                      className: "text-xs border-border bg-white"
                    })
                  )
                  , React.createElement('div', { className: "space-y-1.5" }
                    , React.createElement(Label, { htmlFor: "gst-percent", className: "text-xs font-semibold text-muted-foreground" }, "GST Percentage (%)")
                    , React.createElement(Input, {
                      id: "gst-percent",
                      type: "number",
                      value: gstPercent,
                      onChange: (e) => setGstPercent(e.target.value),
                      required: true,
                      className: "text-xs border-border bg-white"
                    })
                  )
                  , React.createElement('div', { className: "space-y-1.5" }
                    , React.createElement(Label, { htmlFor: "promo-limit", className: "text-xs font-semibold text-muted-foreground" }, "Promotional Limit (First N Businesses)")
                    , React.createElement(Input, {
                      id: "promo-limit",
                      type: "number",
                      value: promoLimit,
                      onChange: (e) => setPromoLimit(e.target.value),
                      required: true,
                      className: "text-xs border-border bg-white"
                    })
                  )
                  , React.createElement('div', { className: "space-y-1.5" }
                    , React.createElement(Label, { htmlFor: "promo-price", className: "text-xs font-semibold text-muted-foreground" }, "Promotional Yearly Price (INR)")
                    , React.createElement(Input, {
                      id: "promo-price",
                      type: "number",
                      value: promoPrice,
                      onChange: (e) => setPromoPrice(e.target.value),
                      required: true,
                      className: "text-xs border-border bg-white"
                    })
                  )
                  , React.createElement('div', { className: "space-y-1.5" }
                    , React.createElement(Label, { htmlFor: "gateway-percent", className: "text-xs font-semibold text-muted-foreground" }, "Gateway Charges (%)")
                    , React.createElement(Input, {
                      id: "gateway-percent",
                      type: "number",
                      step: "0.01",
                      value: gatewayPercent,
                      onChange: (e) => setGatewayPercent(e.target.value),
                      required: true,
                      className: "text-xs border-border bg-white"
                    })
                  )
                  , React.createElement('div', { className: "space-y-1.5" }
                    , React.createElement(Label, { htmlFor: "points-per-rupee", className: "text-xs font-semibold text-muted-foreground" }, "Points Per Rupee (₹1 value in points)")
                    , React.createElement(Input, {
                      id: "points-per-rupee",
                      type: "number",
                      step: "0.001",
                      value: pointsPerRupee,
                      onChange: (e) => setPointsPerRupee(e.target.value),
                      required: true,
                      className: "text-xs border-border bg-white"
                    })
                  )
                  , React.createElement('div', { className: "space-y-1.5" }
                    , React.createElement(Label, { htmlFor: "points-per-stamp", className: "text-xs font-semibold text-muted-foreground" }, "Points Per Stamp (Stamps Conversion)")
                    , React.createElement(Input, {
                      id: "points-per-stamp",
                      type: "number",
                      step: "1",
                      value: pointsPerStamp,
                      onChange: (e) => setPointsPerStamp(e.target.value),
                      required: true,
                      className: "text-xs border-border bg-white"
                    })
                  )
                  , React.createElement('div', { className: "space-y-1.5" }
                    , React.createElement(Label, { htmlFor: "mock-business-count", className: "text-xs font-semibold text-muted-foreground" }, "Mock Registered Businesses Count Offset")
                    , React.createElement(Input, {
                      id: "mock-business-count",
                      type: "number",
                      step: "1",
                      value: mockBusinessCount,
                      onChange: (e) => setMockBusinessCount(e.target.value),
                      required: true,
                      className: "text-xs border-border bg-white"
                    })
                  )
                  , React.createElement(Button, { type: "submit", className: "w-full bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm font-semibold", disabled: settingsLoading }
                    , settingsLoading ? React.createElement(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null
                    , "Save Platform Settings"
                  )
                )
              )
            )
          )
        )
      )

      /* Deploy/Edit Plan Modal */
      , (showAddPlanModal || !!editingPlan) && (
        React.createElement(Dialog, {
          open: showAddPlanModal || !!editingPlan,
          onOpenChange: (open) => {
            if (!open) {
              setShowAddPlanModal(false);
              setEditingPlan(null);
              resetPlanForm();
            }
          }
        }
          , React.createElement(DialogContent, { className: "max-w-[420px] bg-white border border-border" }
            , React.createElement(DialogHeader, null
              , React.createElement(DialogTitle, null, !!editingPlan ? "Modify Pricing Plan" : "Deploy Pricing Plan")
              , React.createElement(DialogDescription, { className: "text-xs text-muted-foreground" }, "Configure quota parameters and pricing for a SaaS plan tier."
              )
            )

            , errorMsg && (
              React.createElement('div', { className: "bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-xs text-destructive text-center animate-fade-in" }
                , errorMsg
              )
            )

            , React.createElement('form', { onSubmit: !!editingPlan ? handleUpdatePlan : handleCreatePlan, className: "space-y-4 py-2" }
              , React.createElement('div', { className: "space-y-1.5" }
                , React.createElement(Label, { htmlFor: "plan-name" }, "Plan Name")
                , React.createElement(Input, {
                  id: "plan-name",
                  placeholder: "e.g. Launch Year Special",
                  value: planName,
                  onChange: (e) => setPlanName(e.target.value),
                  required: true,
                  className: "text-xs border-border bg-white"
                })
              )

              , React.createElement('div', { className: "space-y-1" }
                , React.createElement(Label, { htmlFor: "plan-price" }, "Yearly Price (INR)")
                , React.createElement(Input, {
                  id: "plan-price",
                  type: "number",
                  placeholder: "e.g. 999",
                  value: priceMonthly,
                  onChange: (e) => setPriceMonthly(e.target.value),
                  required: true,
                  className: "text-xs"
                }
                )
              )

              , React.createElement('div', { className: "grid grid-cols-2 gap-4" }
                , React.createElement('div', { className: "space-y-1" }
                  , React.createElement(Label, { htmlFor: "plan-branches" }, "Max Branches")
                  , React.createElement(Input, {
                    id: "plan-branches",
                    type: "number",
                    placeholder: "e.g. 5",
                    value: maxBranches,
                    onChange: (e) => setMaxBranches(e.target.value),
                    required: true,
                    className: "text-xs"
                  }
                  )
                )
                , React.createElement('div', { className: "space-y-1" }
                  , React.createElement(Label, { htmlFor: "plan-customers" }, "Max Customers")
                  , React.createElement(Input, {
                    id: "plan-customers",
                    type: "number",
                    placeholder: "e.g. 1000",
                    value: maxCustomers,
                    onChange: (e) => setMaxCustomers(e.target.value),
                    required: true,
                    className: "text-xs"
                  }
                  )
                )
              )

              , React.createElement('div', { className: "space-y-2 border border-border rounded-xl bg-slate-50 p-4" }
                , React.createElement('span', { className: "text-[10px] text-muted-foreground uppercase tracking-widest block font-bold mb-2" }, "Feature Entitlements")

                , React.createElement('div', { className: "flex items-center justify-between py-1.5 border-b border-border/55" }
                  , React.createElement(Label, { htmlFor: "feat-analytics", className: "text-xs text-foreground" }, "Analytics Ledger Access")
                  , React.createElement(Switch, { id: "feat-analytics", checked: analyticsAccess, onCheckedChange: setAnalyticsAccess })
                )

                , React.createElement('div', { className: "flex items-center justify-between py-1.5 border-b border-border/55" }
                  , React.createElement(Label, { htmlFor: "feat-branding", className: "text-xs text-foreground" }, "White-label Custom Branding")
                  , React.createElement(Switch, { id: "feat-branding", checked: customBranding, onCheckedChange: setCustomBranding })
                )

                , React.createElement('div', { className: "flex items-center justify-between py-1.5 border-b border-border/55" }
                  , React.createElement(Label, { htmlFor: "feat-csv", className: "text-xs text-foreground" }, "CSV/Excel History Exports")
                  , React.createElement(Switch, { id: "feat-csv", checked: csvExport, onCheckedChange: setCsvExport })
                )

                , React.createElement('div', { className: "flex items-center justify-between py-1.5 border-b border-border/55" }
                  , React.createElement(Label, { htmlFor: "feat-api", className: "text-xs text-foreground" }, "Merchant Developer Web APIs")
                  , React.createElement(Switch, { id: "feat-api", checked: apiAccess, onCheckedChange: setApiAccess })
                )

                , React.createElement('div', { className: "flex items-center justify-between py-1.5" }
                  , React.createElement(Label, { htmlFor: "plan-active", className: "text-xs text-[#07122A] font-semibold" }, "Is Plan Active")
                  , React.createElement(Switch, { id: "plan-active", checked: isActive, onCheckedChange: setIsActive })
                )
              )

              , React.createElement(DialogFooter, { className: "pt-2" }
                , React.createElement(Button, {
                  type: "button",
                  variant: "outline",
                  onClick: () => {
                    setShowAddPlanModal(false);
                    setEditingPlan(null);
                    resetPlanForm();
                  }
                }, "Cancel"
                )
                , React.createElement(Button, { type: "submit", className: "bg-primary text-primary-foreground", disabled: createPlanMutation.isPending || updatePlanMutation.isPending }
                  , (createPlanMutation.isPending || updatePlanMutation.isPending)
                    ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin" })
                    : (!!editingPlan ? "Save Changes" : "Deploy Plan Tier")
                )
              )
          )
        )
      )
      /* Edit Point Rate Dialog */
      , !!editingPointsBusiness && (
        React.createElement(Dialog, {
          open: !!editingPointsBusiness,
          onOpenChange: (open) => !open && setEditingPointsBusiness(null),
          __self: this,
          __source: { fileName: _jsxFileName, lineNumber: 918 }
        }
          , React.createElement(DialogContent, { className: "max-w-[420px] bg-white border border-border" }
            , React.createElement(DialogHeader, null
              , React.createElement(DialogTitle, null, "Edit Point Earning Rate")
              , React.createElement(DialogDescription, { className: "text-xs text-muted-foreground" }
                , `Configure the points per rupee conversion rate for "${editingPointsBusiness.name}".`
              )
            )
            , React.createElement('form', {
                onSubmit: (e) => {
                  e.preventDefault();
                  const val = parseFloat(editPointsVal);
                  if (isNaN(val) || val <= 0) {
                    alert("Please enter a valid positive decimal number.");
                    return;
                  }
                  updatePointsMutation.mutate({ id: editingPointsBusiness.id, pointsPerRupee: val });
                },
                className: "space-y-4 py-2"
              }
              , React.createElement('div', { className: "space-y-1.5" }
                , React.createElement(Label, { htmlFor: "points-per-rupee-input" }, "Points Per Rupee (e.g. 0.1)")
                , React.createElement(Input, {
                    id: "points-per-rupee-input",
                    type: "number",
                    step: "0.001",
                    min: "0.001",
                    value: editPointsVal,
                    onChange: (e) => setEditPointsVal(e.target.value),
                    required: true,
                    className: "text-xs border-border bg-white text-slate-800"
                  })
              )
              , React.createElement(DialogFooter, { className: "pt-2" }
                , React.createElement(Button, {
                    type: "button",
                    variant: "outline",
                    onClick: () => setEditingPointsBusiness(null)
                  }
                  , "Cancel"
                )
                , React.createElement(Button, {
                    type: "submit",
                    className: "bg-primary text-primary-foreground font-bold",
                    disabled: updatePointsMutation.isPending
                  }
                  , updatePointsMutation.isPending
                    ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin" })
                    : "Save Point Rate"
                )
              )
            )
          )
        )
      )
      /* Edit Description Dialog */
      , !!editingDescriptionBusiness && (
        React.createElement(Dialog, {
          open: !!editingDescriptionBusiness,
          onOpenChange: (open) => !open && setEditingDescriptionBusiness(null),
        }
          , React.createElement(DialogContent, { className: "max-w-[420px] bg-white border border-border" }
            , React.createElement(DialogHeader, null
              , React.createElement(DialogTitle, null, "Edit Business Description")
              , React.createElement(DialogDescription, { className: "text-xs text-muted-foreground" }
                , `Modify the business description for "${editingDescriptionBusiness.name}". This will be shown on voucher cards and used in AI review generation.`
              )
            )
            , React.createElement('form', {
                onSubmit: (e) => {
                  e.preventDefault();
                  updateDescriptionMutation.mutate({ id: editingDescriptionBusiness.id, description: editDescriptionVal });
                },
                className: "space-y-4 py-2"
              }
              , React.createElement('div', { className: "space-y-1.5" }
                , React.createElement(Label, { htmlFor: "business-description-input" }, "Business Description")
                , React.createElement('textarea', {
                    id: "business-description-input",
                    value: editDescriptionVal,
                    onChange: (e) => setEditDescriptionVal(e.target.value),
                    placeholder: "Enter details about the business...",
                    className: "w-full min-h-[100px] text-xs border border-border rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground"
                  })
              )
              , React.createElement(DialogFooter, { className: "pt-2" }
                , React.createElement(Button, {
                    type: "button",
                    variant: "outline",
                    onClick: () => setEditingDescriptionBusiness(null)
                  }
                  , "Cancel"
                )
                , React.createElement(Button, {
                    type: "submit",
                    className: "bg-primary text-primary-foreground font-bold",
                    disabled: updateDescriptionMutation.isPending
                  }
                  , updateDescriptionMutation.isPending
                    ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin" })
                    : "Save Description"
                )
              )
            )
          )
        )
      )
      
      /* Delete Business Confirmation Dialog */
      , !!businessToDelete && (
        React.createElement(Dialog, {
          open: !!businessToDelete,
          onOpenChange: (open) => !open && setBusinessToDelete(null),
        }
          , React.createElement(DialogContent, { className: "max-w-[400px] bg-white border border-border" }
            , React.createElement(DialogHeader, null
              , React.createElement(DialogTitle, { className: "text-red-600 flex items-center gap-2" }
                , React.createElement(Trash2, { className: "h-5 w-5" })
                , "Confirm Deletion"
              )
              , React.createElement(DialogDescription, { className: "text-sm text-slate-600 mt-2" }
                , "Are you sure you want to delete the business "
                , React.createElement("strong", { className: "text-foreground" }, businessToDelete.name)
                , "? This will soft-delete the business and its owner will no longer be able to log in."
              )
            )
            , React.createElement(DialogFooter, { className: "pt-4" }
              , React.createElement(Button, {
                  type: "button",
                  variant: "outline",
                  onClick: () => setBusinessToDelete(null)
                }
                , "No, Cancel"
              )
              , React.createElement(Button, {
                  type: "button",
                  className: "bg-red-600 hover:bg-red-700 text-white font-bold",
                  onClick: () => {
                    deleteBusinessMutation.mutate(businessToDelete.id);
                    setBusinessToDelete(null);
                  },
                  disabled: deleteBusinessMutation.isPending
                }
                , deleteBusinessMutation.isPending
                  ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin" })
                  : "Yes, Delete"
              )
            )
          )
        )
      )

      /* AI Review Settings Dialog */
      , !!editingReviewBusiness && (
        React.createElement(Dialog, {
          open: !!editingReviewBusiness,
          onOpenChange: (open) => !open && setEditingReviewBusiness(null),
        }
          , React.createElement(DialogContent, { className: "max-w-[500px] bg-white border border-border" }
            , React.createElement(DialogHeader, null
              , React.createElement(DialogTitle, { className: "flex items-center gap-2" }
                , React.createElement(Settings2, { className: "h-4 w-4 text-primary" })
                , "AI Review Settings"
              )
              , React.createElement(DialogDescription, { className: "text-xs text-muted-foreground" }
                , `Configure AI review generation for "${editingReviewBusiness.name}". The Google Review URL and business type directly affect the quality of AI-generated reviews.`
              )
            )
            , reviewSettingsFetchLoading ? (
              React.createElement('div', { className: "flex justify-center py-8" }
                , React.createElement(Loader2, { className: "h-6 w-6 animate-spin text-primary" })
              )
            ) : (
              React.createElement('form', { onSubmit: handleSaveReviewSettings, className: "space-y-4 py-2" }

                , React.createElement('div', { className: "grid grid-cols-2 gap-3" }
                  , React.createElement('div', { className: "space-y-1.5" }
                    , React.createElement(Label, { htmlFor: "rs-type", className: "text-xs font-semibold" }, "Business Type / Category")
                    , React.createElement(Input, {
                      id: "rs-type",
                      placeholder: "e.g. Cafe, Restaurant, Salon",
                      value: reviewSettingsForm.businessType,
                      onChange: (e) => setReviewSettingsForm(f => ({ ...f, businessType: e.target.value })),
                      className: "text-xs border-border bg-white h-9"
                    })
                  )
                  , React.createElement('div', { className: "space-y-1.5" }
                    , React.createElement(Label, { htmlFor: "rs-bname", className: "text-xs font-semibold" }, "Google Business Name")
                    , React.createElement(Input, {
                      id: "rs-bname",
                      placeholder: "e.g. Cyber Bakery - Baneswar",
                      value: reviewSettingsForm.googleBusinessName,
                      onChange: (e) => setReviewSettingsForm(f => ({ ...f, googleBusinessName: e.target.value })),
                      className: "text-xs border-border bg-white h-9"
                    })
                  )
                )

                , React.createElement('div', { className: "space-y-1.5" }
                  , React.createElement(Label, { htmlFor: "rs-placeid", className: "text-xs font-semibold" }, "Google Place ID")
                  , React.createElement(Input, {
                    id: "rs-placeid",
                    placeholder: "e.g. ChIJN1t_tDeuEmsRUsoyG83frY4 (auto-fills Review URL)",
                    value: reviewSettingsForm.googlePlaceId,
                    onChange: (e) => setReviewSettingsForm(f => ({ ...f, googlePlaceId: e.target.value })),
                    className: "text-xs border-border bg-white h-9"
                  })
                  , React.createElement('p', { className: "text-[9px] text-muted-foreground" }, "If set, Google Review URL is auto-generated from Place ID")
                )

                , React.createElement('div', { className: "space-y-1.5" }
                  , React.createElement(Label, { htmlFor: "rs-gurl", className: "text-xs font-semibold" }, "Google Review URL")
                  , React.createElement(Input, {
                    id: "rs-gurl",
                    type: "url",
                    placeholder: "https://search.google.com/local/writereview?placeid=...",
                    value: reviewSettingsForm.googleReviewUrl,
                    onChange: (e) => setReviewSettingsForm(f => ({ ...f, googleReviewUrl: e.target.value })),
                    className: "text-xs border-border bg-white h-9"
                  })
                )

                , React.createElement('div', { className: "grid grid-cols-2 gap-3" }
                  , React.createElement('div', { className: "space-y-1.5" }
                    , React.createElement(Label, { htmlFor: "rs-insta", className: "text-xs font-semibold" }, "Instagram URL")
                    , React.createElement(Input, {
                      id: "rs-insta",
                      type: "url",
                      placeholder: "https://instagram.com/...",
                      value: reviewSettingsForm.instagramUrl,
                      onChange: (e) => setReviewSettingsForm(f => ({ ...f, instagramUrl: e.target.value })),
                      className: "text-xs border-border bg-white h-9"
                    })
                  )
                  , React.createElement('div', { className: "space-y-1.5" }
                    , React.createElement(Label, { htmlFor: "rs-fb", className: "text-xs font-semibold" }, "Facebook URL")
                    , React.createElement(Input, {
                      id: "rs-fb",
                      type: "url",
                      placeholder: "https://facebook.com/...",
                      value: reviewSettingsForm.facebookUrl,
                      onChange: (e) => setReviewSettingsForm(f => ({ ...f, facebookUrl: e.target.value })),
                      className: "text-xs border-border bg-white h-9"
                    })
                  )
                )

                , React.createElement('div', { className: "bg-amber-50 border border-amber-200 rounded-lg p-3 text-[10px] text-amber-800" }
                  , React.createElement('strong', { className: "block mb-1" }, "ℹ How AI Reviews Work")
                  , "The AI (Ollama) uses the business name, category, description, and locality to generate realistic Google reviews. Setting a proper business type and description improves AI output quality significantly."
                )

                , React.createElement(DialogFooter, { className: "pt-2" }
                  , React.createElement(Button, {
                    type: "button",
                    variant: "outline",
                    onClick: () => setEditingReviewBusiness(null)
                  }, "Cancel")
                  , React.createElement(Button, {
                    type: "submit",
                    className: "bg-primary text-primary-foreground font-bold",
                    disabled: reviewSettingsLoading
                  }
                    , reviewSettingsLoading
                      ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin" })
                      : "Save AI Settings"
                  )
                )
              )
            )
            )
          )
        )
      )
      /* Create / Edit Business Dialog */
      , showBusinessModal && (
        React.createElement(Dialog, {
          open: showBusinessModal,
          onOpenChange: (open) => !open && setShowBusinessModal(false),
        }
          , React.createElement(DialogContent, { className: "max-w-[550px] bg-white border border-border max-h-[90vh] overflow-y-auto" }
            , React.createElement(DialogHeader, null
              , React.createElement(DialogTitle, null, editingBusiness ? "Edit Merchant Details" : "Register New Merchant")
              , React.createElement(DialogDescription, { className: "text-xs text-muted-foreground" }
                , editingBusiness ? `Modify properties for "${editingBusiness.name}".` : "Configure details to register a new tenant storefront."
              )
            )
            , React.createElement('form', { onSubmit: handleSubmitBusiness, className: "space-y-4 py-2" }
              
              /* Name & Category */
              , React.createElement('div', { className: "grid grid-cols-2 gap-3" }
                , React.createElement('div', { className: "space-y-1.5" }
                  , React.createElement(Label, { htmlFor: "biz-name", className: "text-xs font-semibold" }, "Business Name")
                  , React.createElement(Input, {
                      id: "biz-name",
                      placeholder: "e.g. Cyber Bakery",
                      value: businessForm.name,
                      onChange: (e) => setBusinessForm(f => ({ ...f, name: e.target.value })),
                      required: true,
                      className: "text-xs border-border bg-white h-9"
                    })
                )
                , React.createElement('div', { className: "space-y-1.5" }
                  , React.createElement(Label, { htmlFor: "biz-category", className: "text-xs font-semibold" }, "Category")
                  , React.createElement(Input, {
                      id: "biz-category",
                      placeholder: "e.g. Bakery, Cafe, Hotels",
                      value: businessForm.category,
                      onChange: (e) => setBusinessForm(f => ({ ...f, category: e.target.value })),
                      className: "text-xs border-border bg-white h-9"
                    })
                )
              )

              /* Contact Phone & Timezone */
              , React.createElement('div', { className: "grid grid-cols-2 gap-3" }
                , React.createElement('div', { className: "space-y-1.5" }
                  , React.createElement(Label, { htmlFor: "biz-phone", className: "text-xs font-semibold" }, "Business Phone")
                  , React.createElement(Input, {
                      id: "biz-phone",
                      placeholder: "e.g. +91XXXXXXXXXX",
                      value: businessForm.phone,
                      onChange: (e) => setBusinessForm(f => ({ ...f, phone: e.target.value })),
                      className: "text-xs border-border bg-white h-9"
                    })
                )
                , React.createElement('div', { className: "space-y-1.5" }
                  , React.createElement(Label, { htmlFor: "biz-timezone", className: "text-xs font-semibold" }, "Timezone")
                  , React.createElement(Input, {
                      id: "biz-timezone",
                      placeholder: "e.g. Asia/Kolkata",
                      value: businessForm.timezone,
                      onChange: (e) => setBusinessForm(f => ({ ...f, timezone: e.target.value })),
                      required: true,
                      className: "text-xs border-border bg-white h-9"
                    })
                )
              )

              /* Address & Booking URL */
              , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-3" }
                , React.createElement('div', { className: "space-y-1.5" }
                  , React.createElement(Label, { htmlFor: "biz-address", className: "text-xs font-semibold" }, "Address")
                  , React.createElement(Input, {
                      id: "biz-address",
                      placeholder: "e.g. Baneswar",
                      value: businessForm.address,
                      onChange: (e) => setBusinessForm(f => ({ ...f, address: e.target.value })),
                      className: "text-xs border-border bg-white h-9"
                    })
                )
                , React.createElement('div', { className: "space-y-1.5" }
                  , React.createElement(Label, { htmlFor: "biz-booking", className: "text-xs font-semibold" }, "Booking URL (Hotels only)")
                  , React.createElement(Input, {
                      id: "biz-booking",
                      placeholder: "e.g. booking.com/example",
                      value: businessForm.bookingUrl,
                      onChange: (e) => setBusinessForm(f => ({ ...f, bookingUrl: e.target.value })),
                      className: "text-xs border-border bg-white h-9"
                    })
                )
              )

              /* Plan & Owner Select (Disabled on Edit) */
              , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-3" }
                , React.createElement('div', { className: "space-y-1.5" }
                  , React.createElement(Label, { htmlFor: "biz-plan", className: "text-xs font-semibold" }, "SaaS Subscription Plan")
                  , React.createElement('select', {
                      id: "biz-plan",
                      value: businessForm.planId,
                      onChange: (e) => setBusinessForm(f => ({ ...f, planId: e.target.value })),
                      className: "w-full h-9 border border-zinc-200 rounded-md bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6A00] text-slate-800"
                    },
                      React.createElement('option', { value: "" }, "No Plan (Trial)"),
                      plans.map(p =>
                        React.createElement('option', { key: p.id, value: p.id }, `${p.name} (₹${parseInt(p.priceMonthly).toLocaleString("en-IN")}/mo)`)
                      )
                    )
                )
                , React.createElement('div', { className: "space-y-1.5" }
                  , React.createElement(Label, { htmlFor: "biz-owner", className: "text-xs font-semibold" }, "Owner User")
                  , React.createElement('select', {
                      id: "biz-owner",
                      value: businessForm.ownerId,
                      onChange: (e) => setBusinessForm(f => ({ ...f, ownerId: e.target.value })),
                      className: "w-full h-9 border border-zinc-200 rounded-md bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6A00] text-slate-800",
                      required: !editingBusiness,
                      disabled: !!editingBusiness
                    },
                      React.createElement('option', { value: "" }, "Select Owner..."),
                      users.map(u =>
                        React.createElement('option', { key: u.id, value: u.id }, `${u.name} [${u.role}] (${u.phone || u.email || "No Contact"})`)
                      )
                    )
                )
              )

              /* Description */
              , React.createElement('div', { className: "space-y-1.5" }
                , React.createElement(Label, { htmlFor: "biz-desc", className: "text-xs font-semibold" }, "Description")
                , React.createElement('textarea', {
                    id: "biz-desc",
                    value: businessForm.description,
                    onChange: (e) => setBusinessForm(f => ({ ...f, description: e.target.value })),
                    placeholder: "Business details and review context...",
                    className: "w-full min-h-[60px] text-xs border border-border rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground"
                  })
              )

              /* Social Links Group */
              , React.createElement('div', { className: "space-y-2 border border-border rounded-xl bg-slate-50 p-4" }
                , React.createElement('span', { className: "text-[10px] text-muted-foreground uppercase tracking-widest block font-bold" }, "Social URLs")
                , React.createElement('div', { className: "grid grid-cols-2 gap-3" }
                  , React.createElement('div', { className: "space-y-1" }
                    , React.createElement(Label, { htmlFor: "biz-insta-url", className: "text-[10px] font-bold text-muted-foreground" }, "Instagram URL")
                    , React.createElement(Input, {
                        id: "biz-insta-url",
                        type: "url",
                        placeholder: "https://instagram.com/...",
                        value: businessForm.instagramUrl,
                        onChange: (e) => setBusinessForm(f => ({ ...f, instagramUrl: e.target.value })),
                        className: "text-xs h-8"
                      })
                  )
                  , React.createElement('div', { className: "space-y-1" }
                    , React.createElement(Label, { htmlFor: "biz-fb-url", className: "text-[10px] font-bold text-muted-foreground" }, "Facebook URL")
                    , React.createElement(Input, {
                        id: "biz-fb-url",
                        type: "url",
                        placeholder: "https://facebook.com/...",
                        value: businessForm.facebookUrl,
                        onChange: (e) => setBusinessForm(f => ({ ...f, facebookUrl: e.target.value })),
                        className: "text-xs h-8"
                      })
                  )
                )
                , React.createElement('div', { className: "grid grid-cols-2 gap-3 mt-2" }
                  , React.createElement('div', { className: "space-y-1" }
                    , React.createElement(Label, { htmlFor: "biz-wa-url", className: "text-[10px] font-bold text-muted-foreground" }, "WhatsApp URL")
                    , React.createElement(Input, {
                        id: "biz-wa-url",
                        type: "url",
                        placeholder: "https://wa.me/...",
                        value: businessForm.whatsappUrl,
                        onChange: (e) => setBusinessForm(f => ({ ...f, whatsappUrl: e.target.value })),
                        className: "text-xs h-8"
                      })
                  )
                  , React.createElement('div', { className: "space-y-1" }
                    , React.createElement(Label, { htmlFor: "biz-review-url", className: "text-[10px] font-bold text-muted-foreground" }, "Google Review URL")
                    , React.createElement(Input, {
                        id: "biz-review-url",
                        type: "url",
                        placeholder: "https://search.google.com/...",
                        value: businessForm.googleReviewUrl,
                        onChange: (e) => setBusinessForm(f => ({ ...f, googleReviewUrl: e.target.value })),
                        className: "text-xs h-8"
                      })
                  )
                )
              )

              , React.createElement(DialogFooter, { className: "pt-2" }
                , React.createElement(Button, {
                    type: "button",
                    variant: "outline",
                    onClick: () => setShowBusinessModal(false)
                  }, "Cancel")
                , React.createElement(Button, {
                    type: "submit",
                    className: "bg-primary text-primary-foreground font-bold",
                    disabled: createBusinessMutation.isPending || updateBusinessMutation.isPending
                  }
                    , (createBusinessMutation.isPending || updateBusinessMutation.isPending)
                      ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin" })
                      : "Save Merchant"
                  )
              )
            )
          )
        )
      )
    )
  );
}

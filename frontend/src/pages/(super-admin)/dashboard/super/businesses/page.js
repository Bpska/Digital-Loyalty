const _jsxFileName = "src\\pages\\(super-admin)\\dashboard\\super\\businesses\\page.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }"use client";

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
import { Building2, Plus, Loader2, ToggleLeft, ToggleRight, } from "lucide-react";
import { formatDate } from "@/lib/utils";









































export default function BusinessesManagementPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("businesses");

  // Plan creation modal
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // New Plan form states
  const [planName, setPlanName] = useState("STARTER");
  const [priceMonthly, setPriceMonthly] = useState("");
  const [maxBranches, setMaxBranches] = useState("");
  const [maxCustomers, setMaxCustomers] = useState("");
  const [analyticsAccess, setAnalyticsAccess] = useState(false);
  const [customBranding, setCustomBranding] = useState(false);
  const [csvExport, setCsvExport] = useState(false);
  const [apiAccess, setApiAccess] = useState(false);

  // 1. Fetch businesses
  const { data: businessesData, isLoading: bizLoading } = useQuery({
    queryKey: ["superBusinessesList"],
    queryFn: () => api.get("/admin/businesses").then((res) => res.data),
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
      }
    });
  };

  const resetPlanForm = () => {
    setPlanName("STARTER");
    setPriceMonthly("");
    setMaxBranches("");
    setMaxCustomers("");
    setAnalyticsAccess(false);
    setCustomBranding(false);
    setCsvExport(false);
    setApiAccess(false);
    setErrorMsg(null);
  };

  const businesses = businessesData || [];
  const plans = plansData || [];

  return (
    React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 144}}
      /* Header */
      , React.createElement('div', { className: "flex items-center justify-between"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 146}}
        , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 147}}
          , React.createElement('h1', { className: "text-3xl font-extrabold text-foreground tracking-tight"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 148}}, "Merchants & Subscriptions"  )
          , React.createElement('p', { className: "text-xs text-muted-foreground mt-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 149}}, "Supervise business accounts, suspend/reactivate tenants and deploy SaaS subscription plan tiers"

          )
        )
        , activeTab === "plans" && (
          React.createElement(Button, { onClick: () => { setShowAddPlanModal(true); resetPlanForm(); }, className: "bg-primary hover:bg-primary/90 text-primary-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 154}}
            , React.createElement(Plus, { className: "mr-2 h-4 w-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 155}} ), " Create Plan"
          )
        )
      )

      , React.createElement(Tabs, { defaultValue: "businesses", className: "w-full", onValueChange: setActiveTab, __self: this, __source: {fileName: _jsxFileName, lineNumber: 160}}
        , React.createElement(TabsList, { className: "grid w-64 grid-cols-2 mb-6"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 161}}
          , React.createElement(TabsTrigger, { value: "businesses", __self: this, __source: {fileName: _jsxFileName, lineNumber: 162}}, "Tenants")
          , React.createElement(TabsTrigger, { value: "plans", __self: this, __source: {fileName: _jsxFileName, lineNumber: 163}}, "Pricing Plans" )
        )

        /* Tenants Tab */
        , React.createElement(TabsContent, { value: "businesses", className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 167}}
          , bizLoading ? (
            React.createElement('div', { className: "flex justify-center py-12"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 169}}
              , React.createElement(Loader2, { className: "h-8 w-8 animate-spin text-primary"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 170}} )
            )
          ) : businesses.length === 0 ? (
            React.createElement(Card, { className: "border-dashed border-border bg-slate-50/50 py-12 text-center"    , glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 173}}
              , React.createElement(CardContent, { className: "flex flex-col items-center justify-center space-y-3"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 174}}
                , React.createElement(Building2, { className: "h-10 w-10 text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 175}} )
                , React.createElement('p', { className: "text-sm text-muted-foreground font-medium"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 176}}, "No registered merchant accounts"   )
              )
            )
          ) : (
            React.createElement('div', { className: "grid grid-cols-1 gap-6"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 180}}
              , businesses.map((business) => (
                React.createElement(Card, { key: business.id, className: "glass", glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 182}}
                  , React.createElement(CardContent, { className: "p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-center"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 183}}
                    /* Merchant Info */
                    , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 185}}
                      , React.createElement('h3', { className: "text-base font-bold text-foreground flex items-center gap-2"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 186}}
                        , business.name
                        , React.createElement('span', { className: `text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          business.status === "ACTIVE" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                            : business.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 188}}
                          , business.status
                        )
                      )
                      , React.createElement('p', { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 198}}, "Created: " , formatDate(business.createdAt))
                      , React.createElement('p', { className: "text-[10px] text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 199}}, "ID: " , business.id)
                    )

                    /* Owner Details */
                    , React.createElement('div', { className: "space-y-0.5 text-xs text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 203}}
                      , React.createElement('span', { className: "text-[10px] text-muted-foreground uppercase tracking-widest block font-bold"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 204}}, "Owner")
                      , React.createElement('p', { className: "font-semibold text-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 205}}, business.owner.name)
                      , React.createElement('p', { className: "font-mono text-[10px]" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 206}}, business.owner.phone)
                      , business.owner.email && React.createElement('p', { className: "text-[10px]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 207}}, business.owner.email)
                    )

                    /* Subscription Info */
                    , React.createElement('div', { className: "space-y-0.5 text-xs text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 211}}
                      , React.createElement('span', { className: "text-[10px] text-muted-foreground uppercase tracking-widest block font-bold"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 212}}, "Subscription")
                      , React.createElement('p', { className: "font-semibold text-foreground uppercase"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 213}}, "Plan: "
                         , _optionalChain([business, 'access', _ => _.plan, 'optionalAccess', _2 => _2.name]) || "Trial"
                      )
                      , React.createElement('p', { className: "text-[10px] text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 216}}, "Status: "
                         , React.createElement('strong', { className: "text-primary font-semibold" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 217}}, _optionalChain([business, 'access', _3 => _3.subscription, 'optionalAccess', _4 => _4.status]) || "None")
                      )
                      , _optionalChain([business, 'access', _5 => _5.subscription, 'optionalAccess', _6 => _6.currentPeriodEnd]) && (
                        React.createElement('p', { className: "text-[9px] text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 220}}, "Expires: " , formatDate(business.subscription.currentPeriodEnd))
                      )
                    )

                    /* Suspend / Reactive Toggles */
                    , React.createElement('div', { className: "text-right flex md:flex-col justify-end items-end gap-2 md:gap-0"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 225}}
                      , React.createElement('div', { className: "text-[10px] text-muted-foreground mb-1.5 hidden md:block"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 226}}
                        , business._count.branches, " branches • "   , business._count.staff, " staff"
                      )

                      , business.status === "PENDING" ? (
                        React.createElement(Button, { 
                          variant: "default", 
                          size: "sm",
                          className: "text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm flex items-center gap-1.5"        ,
                          onClick: () => toggleStatusMutation.mutate({ id: business.id, status: "ACTIVE" }),
                          disabled: toggleStatusMutation.isPending, __self: this, __source: {fileName: _jsxFileName, lineNumber: 231}}

                          , toggleStatusMutation.isPending && _optionalChain([toggleStatusMutation, 'access', _7 => _7.variables, 'optionalAccess', _8 => _8.id]) === business.id ? (
                            React.createElement(Loader2, { className: "h-3.5 w-3.5 animate-spin"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 239}} )
                          ) : (
                            React.createElement(Plus, { className: "h-3.5 w-3.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 241}} )
                          ), "Approve Request"

                        )
                      ) : business.status === "ACTIVE" ? (
                        React.createElement(Button, { 
                          variant: "ghost", 
                          size: "sm",
                          className: "text-xs text-muted-foreground hover:text-red-600 hover:bg-red-50/50"   ,
                          onClick: () => toggleStatusMutation.mutate({ id: business.id, status: "SUSPENDED" }), __self: this, __source: {fileName: _jsxFileName, lineNumber: 246}}

                          , React.createElement(ToggleRight, { className: "mr-1.5 h-4.5 w-4.5 text-primary"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 252}} ), " Suspend Merchant"
                        )
                      ) : (
                        React.createElement(Button, { 
                          variant: "ghost", 
                          size: "sm",
                          className: "text-xs text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50/50"   ,
                          onClick: () => toggleStatusMutation.mutate({ id: business.id, status: "ACTIVE" }), __self: this, __source: {fileName: _jsxFileName, lineNumber: 255}}

                          , React.createElement(ToggleLeft, { className: "mr-1.5 h-4.5 w-4.5 text-muted-foreground"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 261}} ), " Reactivate Merchant"
                        )
                      )
                    )
                  )
                )
              ))
            )
          )
        )

        /* Pricing Plans Tab */
        , React.createElement(TabsContent, { value: "plans", className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 273}}
          , plansLoading ? (
            React.createElement('div', { className: "flex justify-center py-12"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 275}}
              , React.createElement(Loader2, { className: "h-8 w-8 animate-spin text-primary"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 276}} )
            )
          ) : plans.length === 0 ? (
            React.createElement('div', { className: "text-center py-12 text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 279}}, "No subscription plans defined. Add one above."

            )
          ) : (
            React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-6"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 283}}
              , plans.map((plan) => (
                React.createElement(Card, { key: plan.id, className: "glass flex flex-col justify-between"   , glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 285}}
                  , React.createElement(CardHeader, { className: "p-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 286}}
                    , React.createElement(CardTitle, { className: "text-lg font-bold text-foreground uppercase tracking-wider"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 287}}
                      , plan.name
                    )
                    , React.createElement(CardDescription, { className: "text-2xl font-black text-primary mt-2"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 290}}, "₹"
                      , parseInt(plan.priceMonthly).toLocaleString("en-IN"), "/mo"
                    )
                  )
                  , React.createElement(CardContent, { className: "p-6 pt-0 space-y-4 flex-1"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 294}}
                    , React.createElement('div', { className: "space-y-2 text-xs text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 295}}
                      , React.createElement('div', { className: "flex justify-between border-b border-border/50 pb-1.5"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 296}}
                        , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 297}}, "Max Branches" )
                        , React.createElement('strong', { className: "text-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 298}}, plan.maxBranches)
                      )
                      , React.createElement('div', { className: "flex justify-between border-b border-border/50 pb-1.5"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 300}}
                        , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 301}}, "Max Customers" )
                        , React.createElement('strong', { className: "text-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 302}}, plan.maxCustomers)
                      )
                    )

                    , React.createElement('div', { className: "space-y-1.5 pt-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 306}}
                      , React.createElement('span', { className: "text-[10px] text-muted-foreground uppercase tracking-widest block font-bold"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 307}}, "Included Features" )
                      , React.createElement('div', { className: "flex flex-wrap gap-1.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 308}}
                        , plan.features.analyticsAccess && (
                          React.createElement('span', { className: "text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 310}}, "Analytics Access"

                          )
                        )
                        , plan.features.customBranding && (
                          React.createElement('span', { className: "text-[9px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 315}}, "Custom Branding"

                          )
                        )
                        , plan.features.csvExport && (
                          React.createElement('span', { className: "text-[9px] bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full border border-pink-200"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 320}}, "CSV Export"

                          )
                        )
                        , plan.features.apiAccess && (
                          React.createElement('span', { className: "text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 325}}, "Developer API"

                          )
                        )
                      )
                    )
                  )
                )
              ))
            )
          )
        )
      )

      /* Add Plan Modal */
      , showAddPlanModal && (
        React.createElement(Dialog, { open: showAddPlanModal, onOpenChange: (open) => !open && setShowAddPlanModal(false), __self: this, __source: {fileName: _jsxFileName, lineNumber: 341}}
          , React.createElement(DialogContent, { className: "max-w-[420px]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 342}}
            , React.createElement(DialogHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 343}}
              , React.createElement(DialogTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 344}}, "Deploy Pricing Plan"  )
              , React.createElement(DialogDescription, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 345}}, "Configure quota parameters and pricing for a SaaS plan tier."

              )
            )

            , errorMsg && (
              React.createElement('div', { className: "bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-xs text-destructive text-center"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 351}}
                , errorMsg
              )
            )

            , React.createElement('form', { onSubmit: handleCreatePlan, className: "space-y-4 py-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 356}}
              , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 357}}
                , React.createElement(Label, { htmlFor: "plan-name", __self: this, __source: {fileName: _jsxFileName, lineNumber: 358}}, "Plan Tier Level"  )
                , React.createElement(Select, { onValueChange: (val) => setPlanName(val), defaultValue: planName, __self: this, __source: {fileName: _jsxFileName, lineNumber: 359}}
                  , React.createElement(SelectTrigger, { className: "w-full bg-background border-border"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 360}}
                    , React.createElement(SelectValue, { placeholder: "Select plan level"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 361}} )
                  )
                  , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 363}}
                    , React.createElement(SelectItem, { value: "STARTER", __self: this, __source: {fileName: _jsxFileName, lineNumber: 364}}, "STARTER")
                    , React.createElement(SelectItem, { value: "GROWTH", __self: this, __source: {fileName: _jsxFileName, lineNumber: 365}}, "GROWTH")
                    , React.createElement(SelectItem, { value: "ENTERPRISE", __self: this, __source: {fileName: _jsxFileName, lineNumber: 366}}, "ENTERPRISE")
                  )
                )
              )

              , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 371}}
                , React.createElement(Label, { htmlFor: "plan-price", __self: this, __source: {fileName: _jsxFileName, lineNumber: 372}}, "Monthly Price (INR)"  )
                , React.createElement(Input, { 
                  id: "plan-price", 
                  type: "number",
                  placeholder: "e.g. 999" , 
                  value: priceMonthly,
                  onChange: (e) => setPriceMonthly(e.target.value),
                  required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 373}} 
                )
              )

              , React.createElement('div', { className: "grid grid-cols-2 gap-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 383}}
                , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 384}}
                  , React.createElement(Label, { htmlFor: "plan-branches", __self: this, __source: {fileName: _jsxFileName, lineNumber: 385}}, "Max Branches" )
                  , React.createElement(Input, { 
                    id: "plan-branches", 
                    type: "number",
                    placeholder: "e.g. 5" , 
                    value: maxBranches,
                    onChange: (e) => setMaxBranches(e.target.value),
                    required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 386}} 
                  )
                )
                , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 395}}
                  , React.createElement(Label, { htmlFor: "plan-customers", __self: this, __source: {fileName: _jsxFileName, lineNumber: 396}}, "Max Customers" )
                  , React.createElement(Input, { 
                    id: "plan-customers", 
                    type: "number",
                    placeholder: "e.g. 1000" , 
                    value: maxCustomers,
                    onChange: (e) => setMaxCustomers(e.target.value),
                    required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 397}} 
                  )
                )
              )

              , React.createElement('div', { className: "space-y-2 border border-border rounded-xl bg-slate-50 p-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 408}}
                , React.createElement('span', { className: "text-[10px] text-muted-foreground uppercase tracking-widest block font-bold mb-2"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 409}}, "Feature Entitlements" )

                , React.createElement('div', { className: "flex items-center justify-between py-1.5 border-b border-border/55"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 411}}
                  , React.createElement(Label, { htmlFor: "feat-analytics", className: "text-xs text-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 412}}, "Analytics Ledger Access"  )
                  , React.createElement(Switch, { id: "feat-analytics", checked: analyticsAccess, onCheckedChange: setAnalyticsAccess, __self: this, __source: {fileName: _jsxFileName, lineNumber: 413}} )
                )

                , React.createElement('div', { className: "flex items-center justify-between py-1.5 border-b border-border/55"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 416}}
                  , React.createElement(Label, { htmlFor: "feat-branding", className: "text-xs text-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 417}}, "White-label Custom Branding"  )
                  , React.createElement(Switch, { id: "feat-branding", checked: customBranding, onCheckedChange: setCustomBranding, __self: this, __source: {fileName: _jsxFileName, lineNumber: 418}} )
                )

                , React.createElement('div', { className: "flex items-center justify-between py-1.5 border-b border-border/55"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 421}}
                  , React.createElement(Label, { htmlFor: "feat-csv", className: "text-xs text-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 422}}, "CSV/Excel History Exports"  )
                  , React.createElement(Switch, { id: "feat-csv", checked: csvExport, onCheckedChange: setCsvExport, __self: this, __source: {fileName: _jsxFileName, lineNumber: 423}} )
                )

                , React.createElement('div', { className: "flex items-center justify-between py-1.5"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 426}}
                  , React.createElement(Label, { htmlFor: "feat-api", className: "text-xs text-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 427}}, "Merchant Developer Web APIs"   )
                  , React.createElement(Switch, { id: "feat-api", checked: apiAccess, onCheckedChange: setApiAccess, __self: this, __source: {fileName: _jsxFileName, lineNumber: 428}} )
                )
              )

              , React.createElement(DialogFooter, { className: "pt-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 432}}
                , React.createElement(Button, { type: "button", variant: "outline", onClick: () => setShowAddPlanModal(false), __self: this, __source: {fileName: _jsxFileName, lineNumber: 433}}, "Cancel"

                )
                , React.createElement(Button, { type: "submit", className: "bg-primary text-primary-foreground" , disabled: createPlanMutation.isPending, __self: this, __source: {fileName: _jsxFileName, lineNumber: 436}}
                  , createPlanMutation.isPending ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 437}} ) : "Deploy Plan Tier"
                )
              )
            )
          )
        )
      )
    )
  );
}

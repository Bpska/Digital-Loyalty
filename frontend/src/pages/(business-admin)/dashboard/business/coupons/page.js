const _jsxFileName = "src\\pages\\(business-admin)\\dashboard\\business\\coupons\\page.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Percent, Plus, Loader2, Tag, ToggleLeft, ToggleRight } from "lucide-react";
import { formatDate } from "@/lib/utils";















export default function CouponsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const businessId = _optionalChain([user, 'optionalAccess', _ => _.businessId]);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Form states
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [usageLimit, setUsageLimit] = useState("");

  // 1. Fetch coupons list
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["businessCoupons", businessId],
    queryFn: () => api.get(`/coupons/business/${businessId}`).then((res) => res.data),
    enabled: !!businessId && businessId !== "null" && businessId !== "undefined",
  });

  // 2. Create coupon mutation
  const createMutation = useMutation({
    mutationFn: (data) => api.post("/coupons", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessCoupons", businessId] });
      setShowAddModal(false);
      resetForm();
    },
    onError: (err) => {
      setErrorMsg(err.message || "Failed to create coupon.");
    }
  });

  // 3. Update coupon mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.patch(`/coupons/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessCoupons", businessId] });
      setShowEditModal(false);
      resetForm();
    },
    onError: (err) => {
      setErrorMsg(err.message || "Failed to update coupon.");
    }
  });

  // 4. Delete coupon mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/coupons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessCoupons", businessId] });
    },
    onError: (err) => {
      setErrorMsg(err.message || "Failed to delete coupon.");
    }
  });

  // 5. Toggle active/inactive mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => api.patch(`/coupons/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessCoupons", businessId] });
    }
  });

  const handleCreateCoupon = (e) => {
    e.preventDefault();
    setErrorMsg(null);

    createMutation.mutate({
      businessId,
      code: code.toUpperCase(),
      title,
      description: description || undefined,
      discountType,
      discountValue: parseFloat(discountValue),
      validFrom: new Date(validFrom).toISOString(),
      validTo: new Date(validTo).toISOString(),
      usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
    });
  };

  const handleEditCoupon = (e) => {
    e.preventDefault();
    if (!selectedCoupon) return;
    setErrorMsg(null);

    updateMutation.mutate({
      id: selectedCoupon.id,
      data: {
        code: code.toUpperCase(),
        title,
        description: description || undefined,
        discountType,
        discountValue: parseFloat(discountValue),
        validFrom: new Date(validFrom).toISOString(),
        validTo: new Date(validTo).toISOString(),
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
      }
    });
  };

  const handleOpenEdit = (coupon) => {
    setSelectedCoupon(coupon);
    setCode(coupon.code);
    setTitle(coupon.title);
    setDescription(coupon.description || "");
    setDiscountType(coupon.discountType);
    setDiscountValue(coupon.discountValue.toString());
    setValidFrom(new Date(coupon.validFrom).toISOString().split("T")[0]);
    setValidTo(new Date(coupon.validTo).toISOString().split("T")[0]);
    setUsageLimit(coupon.usageLimit ? coupon.usageLimit.toString() : "");
    setShowEditModal(true);
  };

  const resetForm = () => {
    setCode("");
    setTitle("");
    setDescription("");
    setDiscountType("PERCENTAGE");
    setDiscountValue("");
    setValidFrom("");
    setValidTo("");
    setUsageLimit("");
    setSelectedCoupon(null);
    setErrorMsg(null);
  };

  if (isLoading) {
    return (
      React.createElement('div', { className: "space-y-4 animate-pulse" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 108}}
        , React.createElement('div', { className: "h-10 w-48 rounded bg-slate-100"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 109}} )
        , React.createElement('div', { className: "h-36 w-full rounded-xl bg-slate-100"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 110}} )
        , React.createElement('div', { className: "h-36 w-full rounded-xl bg-slate-100"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 111}} )
      )
    );
  }

  return (
    React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 117}}
      /* Header */
      , React.createElement('div', { className: "flex items-center justify-between"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 119}}
        , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 120}}
          , React.createElement('h1', { className: "text-3xl font-extrabold text-foreground tracking-tight"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 121}}, "Discount Coupons" )
          , React.createElement('p', { className: "text-xs text-muted-foreground mt-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 122}}, "Setup standalone promo codes (PERCENTAGE or FIXED INR) for customer acquisitions"

          )
        )
        , React.createElement(Button, { onClick: () => { setShowAddModal(true); resetForm(); }, className: "bg-primary hover:bg-primary/90 text-primary-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 126}}
          , React.createElement(Plus, { className: "mr-2 h-4 w-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 127}} ), " Create Coupon"
        )
      )

      /* Grid of Coupons */
      , React.createElement('div', { className: "grid grid-cols-1 gap-6"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 132}}
        , coupons.length === 0 ? (
          React.createElement(Card, { className: "border-dashed border-border bg-slate-50/50 py-12 text-center"    , glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 134}}
            , React.createElement(CardContent, { className: "flex flex-col items-center justify-center space-y-3"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 135}}
              , React.createElement(Tag, { className: "h-10 w-10 text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 136}} )
              , React.createElement('p', { className: "text-sm text-muted-foreground font-medium"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 137}}, "No coupons set up yet"    )
              , React.createElement('p', { className: "text-xs text-muted-foreground max-w-sm"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 138}}, "Create coupon discount campaigns to attract new customers and drive repeat business sales!"

              )
              , React.createElement(Button, { size: "sm", onClick: () => setShowAddModal(true), className: "mt-2 text-primary-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 141}}, "Setup Coupon"

              )
            )
          )
        ) : (
          React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 147}}
            , coupons.map((coupon) => {
              const isPercent = coupon.discountType === "PERCENTAGE";
              const discountSymbol = isPercent ? "%" : " ₹";
              const isExpired = new Date(coupon.validTo) < new Date();

              return (
                React.createElement(Card, { key: coupon.id, className: `glass ${
                  (!coupon.isActive || isExpired) && "opacity-65"
                }`, glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 154}}
                  , React.createElement(CardHeader, { className: "p-6 pb-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 157}}
                    , React.createElement('div', { className: "flex justify-between items-start"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 158}}
                      , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 159}}
                        , React.createElement(CardTitle, { className: "text-lg font-bold text-foreground flex items-center gap-2"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 160}}
                          , React.createElement('span', { className: "font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 161}}
                            , coupon.code
                          )
                          , React.createElement('span', { className: `text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                            coupon.isActive && !isExpired ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-600 border-slate-200"
                          }`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 164}}
                            , isExpired ? "Expired" : coupon.isActive ? "Active" : "Disabled"
                          )
                        )
                        , React.createElement(CardDescription, { className: "text-xs mt-2 text-foreground font-semibold"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 170}}
                          , coupon.title
                        )
                      )
                      , React.createElement(Percent, { className: "h-6 w-6 text-primary shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 174}} )
                    )
                  )
                  , React.createElement(CardContent, { className: "p-6 space-y-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 177}}
                    /* Discount specifications */
                    , React.createElement('div', { className: "grid grid-cols-2 gap-4 text-xs"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 179}}
                      , React.createElement('div', { className: "bg-slate-50 p-3 rounded-lg border border-border"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 180}}
                        , React.createElement('span', { className: "text-muted-foreground block uppercase tracking-wider text-[9px]"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 181}}, "Discount value" )
                        , React.createElement('span', { className: "text-foreground font-extrabold text-sm"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 182}}
                          , isPercent ? `${coupon.discountValue}% Off` : `₹${parseFloat(coupon.discountValue).toLocaleString("en-IN")} Off`
                        )
                      )
                      , React.createElement('div', { className: "bg-slate-50 p-3 rounded-lg border border-border"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 186}}
                        , React.createElement('span', { className: "text-muted-foreground block uppercase tracking-wider text-[9px]"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 187}}, "Usage metrics" )
                        , React.createElement('span', { className: "text-foreground font-extrabold text-sm"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 188}}
                          , coupon.totalUsed, " " , coupon.usageLimit ? `/ ${coupon.usageLimit}` : "Used"
                        )
                      )
                    )

                    , React.createElement('div', { className: "flex justify-between items-center text-[10px] text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 194}}
                      , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 195}}, "Valid from: "  , React.createElement('strong', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 195}}, formatDate(coupon.validFrom)))
                      , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 196}}, "Expires: " , React.createElement('strong', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 196}}, formatDate(coupon.validTo)))
                    )

                    /* Description if present */
                    , coupon.description && (
                      React.createElement('p', { className: "text-[11px] text-muted-foreground italic"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 201}}, "“"
                        , coupon.description, "”"
                      )
                    )

                    /* Actions */
                    , React.createElement('div', { className: "flex gap-2 pt-2 border-t border-border justify-between w-full"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 207}}
                      , React.createElement(Button, { 
                        variant: "ghost", 
                        size: "sm", 
                        className: "text-xs text-muted-foreground hover:text-foreground"  ,
                        onClick: () => handleOpenEdit(coupon), __self: this, __source: {fileName: _jsxFileName, lineNumber: 208}}
                        , "Configure Details"
                      )
                      , React.createElement(Button, { 
                        variant: "ghost", 
                        size: "sm", 
                        className: "text-xs text-destructive hover:text-destructive hover:bg-destructive/10"  ,
                        onClick: () => {
                          if (window.confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) {
                            deleteMutation.mutate(coupon.id);
                          }
                        }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 208}}
                        , "Delete"
                      )
                      , React.createElement(Button, { 
                        variant: "ghost", 
                        size: "sm", 
                        className: "text-xs text-muted-foreground hover:text-foreground"  ,
                        onClick: () => toggleActiveMutation.mutate({ id: coupon.id, isActive: !coupon.isActive }),
                        disabled: isExpired, __self: this, __source: {fileName: _jsxFileName, lineNumber: 209}}

                        , coupon.isActive ? (
                          React.createElement(React.Fragment, null, React.createElement(ToggleRight, { className: "mr-1.5 h-4.5 w-4.5 text-primary"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 217}} ), " Active" )
                        ) : (
                          React.createElement(React.Fragment, null, React.createElement(ToggleLeft, { className: "mr-1.5 h-4.5 w-4.5 text-muted-foreground"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 219}} ), " Inactive" )
                        )
                      )
                    )
                  )
                )
              );
            })
          )
        )
      )

      /* Add Coupon Modal */
      , showAddModal && (
        React.createElement(Dialog, { open: showAddModal, onOpenChange: (open) => !open && setShowAddModal(false), __self: this, __source: {fileName: _jsxFileName, lineNumber: 233}}
          , React.createElement(DialogContent, { className: "max-w-[420px]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 234}}
            , React.createElement(DialogHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 235}}
              , React.createElement(DialogTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 236}}, "Create Discount Coupon"  )
              , React.createElement(DialogDescription, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 237}}, "Configure standalone promotion code campaigns."

              )
            )

            , errorMsg && (
              React.createElement('div', { className: "bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-xs text-destructive text-center"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 243}}
                , errorMsg
              )
            )

            , React.createElement('form', { onSubmit: handleCreateCoupon, className: "space-y-4 py-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 248}}
              , React.createElement('div', { className: "grid grid-cols-2 gap-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 249}}
                , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 250}}
                  , React.createElement(Label, { htmlFor: "coupon-code", __self: this, __source: {fileName: _jsxFileName, lineNumber: 251}}, "Promo Code" )
                  , React.createElement(Input, { 
                    id: "coupon-code", 
                    placeholder: "e.g. MONSOON30" , 
                    value: code,
                    onChange: (e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")),
                    required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 252}} 
                  )
                )
                , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 260}}
                  , React.createElement(Label, { htmlFor: "coupon-title", __self: this, __source: {fileName: _jsxFileName, lineNumber: 261}}, "Campaign Title" )
                  , React.createElement(Input, { 
                    id: "coupon-title", 
                    placeholder: "e.g. 30% Off Monsoon Promo"    , 
                    value: title,
                    onChange: (e) => setTitle(e.target.value),
                    required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 262}} 
                  )
                )
              )

              , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 272}}
                , React.createElement(Label, { htmlFor: "coupon-desc", __self: this, __source: {fileName: _jsxFileName, lineNumber: 273}}, "Campaign Description" )
                , React.createElement(Input, { 
                  id: "coupon-desc", 
                  placeholder: "e.g. Limit 1 usage per user. Valid on all outlets."         , 
                  value: description,
                  onChange: (e) => setDescription(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 274}}
                )
              )

              , React.createElement('div', { className: "grid grid-cols-2 gap-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 282}}
                , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 283}}
                  , React.createElement(Label, { htmlFor: "discount-type", __self: this, __source: {fileName: _jsxFileName, lineNumber: 284}}, "Discount Type" )
                  , React.createElement(Select, { onValueChange: (val) => setDiscountType(val), defaultValue: discountType, __self: this, __source: {fileName: _jsxFileName, lineNumber: 285}}
                    , React.createElement(SelectTrigger, { className: "w-full bg-background border-border"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 286}}
                      , React.createElement(SelectValue, { placeholder: "Select type" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 287}} )
                    )
                    , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 289}}
                      , React.createElement(SelectItem, { value: "PERCENTAGE", __self: this, __source: {fileName: _jsxFileName, lineNumber: 290}}, "PERCENTAGE (%)" )
                      , React.createElement(SelectItem, { value: "FIXED_AMOUNT", __self: this, __source: {fileName: _jsxFileName, lineNumber: 291}}, "FIXED VALUE (INR)"  )
                    )
                  )
                )
                , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 295}}
                  , React.createElement(Label, { htmlFor: "discount-value", __self: this, __source: {fileName: _jsxFileName, lineNumber: 296}}, "Value")
                  , React.createElement(Input, { 
                    id: "discount-value", 
                    type: "number",
                    placeholder: discountType === "PERCENTAGE" ? "e.g. 30" : "e.g. 150", 
                    value: discountValue,
                    onChange: (e) => setDiscountValue(e.target.value),
                    required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 297}} 
                  )
                )
              )

              , React.createElement('div', { className: "grid grid-cols-2 gap-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 308}}
                , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 309}}
                  , React.createElement(Label, { htmlFor: "valid-from", __self: this, __source: {fileName: _jsxFileName, lineNumber: 310}}, "Valid From" )
                  , React.createElement(Input, { 
                    id: "valid-from", 
                    type: "date",
                    value: validFrom,
                    onChange: (e) => setValidFrom(e.target.value),
                    required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 311}} 
                  )
                )
                , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 319}}
                  , React.createElement(Label, { htmlFor: "valid-to", __self: this, __source: {fileName: _jsxFileName, lineNumber: 320}}, "Valid To (Expiry)"  )
                  , React.createElement(Input, { 
                    id: "valid-to", 
                    type: "date",
                    value: validTo,
                    onChange: (e) => setValidTo(e.target.value),
                    required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 321}} 
                  )
                )
              )

              , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 331}}
                , React.createElement(Label, { htmlFor: "usage-limit", __self: this, __source: {fileName: _jsxFileName, lineNumber: 332}}, "Global Usage Limit (Optional)"   )
                , React.createElement(Input, { 
                  id: "usage-limit", 
                  type: "number",
                  placeholder: "e.g. 100 times maximum"   , 
                  value: usageLimit,
                  onChange: (e) => setUsageLimit(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 333}}
                )
              )

              , React.createElement(DialogFooter, { className: "pt-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 342}}
                , React.createElement(Button, { type: "button", variant: "outline", onClick: () => setShowAddModal(false), __self: this, __source: {fileName: _jsxFileName, lineNumber: 343}}, "Cancel"

                )
                , React.createElement(Button, { type: "submit", className: "bg-primary", disabled: createMutation.isPending, __self: this, __source: {fileName: _jsxFileName, lineNumber: 346}}
                  , createMutation.isPending ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 347}} ) : "Publish Coupon"
                )
              )
            )
          )
        )
      )
      /* Edit Coupon Modal */
      , showEditModal && (
        React.createElement(Dialog, { open: showEditModal, onOpenChange: (open) => !open && setShowEditModal(false), __self: this, __source: {fileName: _jsxFileName, lineNumber: 233}}
          , React.createElement(DialogContent, { className: "max-w-[420px]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 234}}
            , React.createElement(DialogHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 235}}
              , React.createElement(DialogTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 236}}, "Configure Coupon Campaign"  )
              , React.createElement(DialogDescription, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 237}}, "Modify coupon code, discount configurations, or validity dates."
              )
            )

            , errorMsg && (
              React.createElement('div', { className: "bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-xs text-destructive text-center"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 243}}
                , errorMsg
              )
            )

            , React.createElement('form', { onSubmit: handleEditCoupon, className: "space-y-4 py-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 248}}
              , React.createElement('div', { className: "grid grid-cols-2 gap-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 249}}
                , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 250}}
                  , React.createElement(Label, { htmlFor: "edit-coupon-code", __self: this, __source: {fileName: _jsxFileName, lineNumber: 251}}, "Promo Code" )
                  , React.createElement(Input, { 
                    id: "edit-coupon-code", 
                    placeholder: "e.g. MONSOON30" , 
                    value: code,
                    onChange: (e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")),
                    required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 252}} 
                  )
                )
                , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 260}}
                  , React.createElement(Label, { htmlFor: "edit-coupon-title", __self: this, __source: {fileName: _jsxFileName, lineNumber: 261}}, "Campaign Title" )
                  , React.createElement(Input, { 
                    id: "edit-coupon-title", 
                    placeholder: "e.g. 30% Off Monsoon Promo"    , 
                    value: title,
                    onChange: (e) => setTitle(e.target.value),
                    required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 262}} 
                  )
                )
              )

              , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 272}}
                , React.createElement(Label, { htmlFor: "edit-coupon-desc", __self: this, __source: {fileName: _jsxFileName, lineNumber: 273}}, "Campaign Description" )
                , React.createElement(Input, { 
                   id: "edit-coupon-desc", 
                   placeholder: "e.g. Limit 1 usage per user. Valid on all outlets."         , 
                   value: description,
                   onChange: (e) => setDescription(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 274}}
                )
              )

              , React.createElement('div', { className: "grid grid-cols-2 gap-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 282}}
                , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 283}}
                  , React.createElement(Label, { htmlFor: "edit-discount-type", __self: this, __source: {fileName: _jsxFileName, lineNumber: 284}}, "Discount Type" )
                  , React.createElement(Select, { onValueChange: (val) => setDiscountType(val), defaultValue: discountType, value: discountType, __self: this, __source: {fileName: _jsxFileName, lineNumber: 285}}
                    , React.createElement(SelectTrigger, { className: "w-full bg-background border-border"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 286}}
                      , React.createElement(SelectValue, { placeholder: "Select type" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 287}} )
                    )
                    , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 289}}
                      , React.createElement(SelectItem, { value: "PERCENTAGE", __self: this, __source: {fileName: _jsxFileName, lineNumber: 290}}, "PERCENTAGE (%)" )
                      , React.createElement(SelectItem, { value: "FIXED_AMOUNT", __self: this, __source: {fileName: _jsxFileName, lineNumber: 291}}, "FIXED VALUE (INR)"  )
                    )
                  )
                )
                , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 295}}
                  , React.createElement(Label, { htmlFor: "edit-discount-value", __self: this, __source: {fileName: _jsxFileName, lineNumber: 296}}, "Value")
                  , React.createElement(Input, { 
                    id: "edit-discount-value", 
                    type: "number",
                    placeholder: discountType === "PERCENTAGE" ? "e.g. 30" : "e.g. 150", 
                    value: discountValue,
                    onChange: (e) => setDiscountValue(e.target.value),
                    required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 297}} 
                  )
                )
              )

              , React.createElement('div', { className: "grid grid-cols-2 gap-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 308}}
                , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 309}}
                  , React.createElement(Label, { htmlFor: "edit-valid-from", __self: this, __source: {fileName: _jsxFileName, lineNumber: 310}}, "Valid From" )
                  , React.createElement(Input, { 
                    id: "edit-valid-from", 
                    type: "date",
                    value: validFrom,
                    onChange: (e) => setValidFrom(e.target.value),
                    required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 311}} 
                  )
                )
                , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 319}}
                  , React.createElement(Label, { htmlFor: "edit-valid-to", __self: this, __source: {fileName: _jsxFileName, lineNumber: 320}}, "Valid To (Expiry)"  )
                  , React.createElement(Input, { 
                    id: "edit-valid-to", 
                    type: "date",
                    value: validTo,
                    onChange: (e) => setValidTo(e.target.value),
                    required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 321}} 
                  )
                )
              )

              , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 331}}
                , React.createElement(Label, { htmlFor: "edit-usage-limit", __self: this, __source: {fileName: _jsxFileName, lineNumber: 332}}, "Global Usage Limit (Optional)"   )
                , React.createElement(Input, { 
                  id: "edit-usage-limit", 
                  type: "number",
                  placeholder: "e.g. 100 times maximum"   , 
                  value: usageLimit,
                  onChange: (e) => setUsageLimit(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 333}}
                )
              )

              , React.createElement(DialogFooter, { className: "pt-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 342}}
                , React.createElement(Button, { type: "button", variant: "outline", onClick: () => setShowEditModal(false), __self: this, __source: {fileName: _jsxFileName, lineNumber: 343}}, "Cancel"
                )
                , React.createElement(Button, { type: "submit", className: "bg-primary", disabled: updateMutation.isPending, __self: this, __source: {fileName: _jsxFileName, lineNumber: 346}}
                  , updateMutation.isPending ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 347}} ) : "Save Changes"
                )
              )
            )
          )
        )
      )
    )
  );
}

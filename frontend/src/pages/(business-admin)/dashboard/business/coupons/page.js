const _jsxFileName = "src\\pages\\(business-admin)\\dashboard\\business\\coupons\\page.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }"use client";

import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Percent, Plus, Loader2, Tag, ToggleLeft, ToggleRight, MoreVertical,
  Pencil, Trash2, CheckCircle2, XCircle, BadgePercent, User,
  Phone, Mail, Clock, Stamp, Star, History
} from "lucide-react";
import { formatDate } from "@/lib/utils";

// ─── Overflow menu ─────────────────────────────────────────────────────────────
function CouponMenu({ coupon, onEdit, onDelete, onToggle, isExpired }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    React.createElement('div', { className: "relative", ref },
      React.createElement('button', {
        type: "button",
        onClick: () => setOpen(prev => !prev),
        className: "p-1.5 rounded-lg text-muted-foreground hover:bg-slate-100 hover:text-foreground transition-colors",
        title: "More options"
      }, React.createElement(MoreVertical, { className: "h-4 w-4" })),
      open && React.createElement('div', {
        className: "absolute right-0 top-8 z-50 min-w-[160px] bg-white border border-border rounded-xl shadow-lg py-1"
      },
        React.createElement('button', {
          type: "button", disabled: isExpired,
          onClick: () => { onToggle(); setOpen(false); },
          className: "w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        },
          coupon.isActive
            ? React.createElement(React.Fragment, null, React.createElement(ToggleRight, { className: "h-3.5 w-3.5 text-primary" }), " Deactivate")
            : React.createElement(React.Fragment, null, React.createElement(ToggleLeft, { className: "h-3.5 w-3.5 text-muted-foreground" }), " Activate")
        ),
        React.createElement('button', {
          type: "button",
          onClick: () => { onEdit(); setOpen(false); },
          className: "w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors"
        }, React.createElement(Pencil, { className: "h-3.5 w-3.5 text-muted-foreground" }), " Configure Details"),
        React.createElement('div', { className: "border-t border-border my-1" }),
        React.createElement('button', {
          type: "button",
          onClick: () => { onDelete(); setOpen(false); },
          className: "w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-red-50 text-red-600 transition-colors"
        }, React.createElement(Trash2, { className: "h-3.5 w-3.5" }), " Delete")
      )
    )
  );
}

// ─── Customer Info Card ────────────────────────────────────────────────────────
function CustomerInfoCard({ customer, coupon }) {
  const ls = customer.loyaltyStats;
  return (
    React.createElement('div', { className: "mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3" },
      /* Success header */
      React.createElement('div', { className: "flex items-center gap-2" },
        React.createElement(CheckCircle2, { className: "h-5 w-5 text-emerald-600 shrink-0" }),
        React.createElement('div', {},
          React.createElement('p', { className: "text-sm font-bold text-emerald-800" }, "Coupon Applied ✓"),
          React.createElement('p', { className: "text-xs text-emerald-700" },
            React.createElement('span', { className: "font-mono font-bold" }, coupon.code),
            " — ", coupon.title
          ),
          React.createElement('p', { className: "text-lg font-extrabold text-emerald-700 mt-0.5" },
            coupon.discountType === "PERCENTAGE"
              ? `${coupon.discountValue}% OFF`
              : `₹${parseFloat(coupon.discountValue).toLocaleString("en-IN")} OFF`
          )
        )
      ),

      /* Customer details */
      React.createElement('div', { className: "border-t border-emerald-200 pt-3" },
        React.createElement('p', { className: "text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2" }, "Customer Details"),
        React.createElement('div', { className: "grid grid-cols-1 gap-1.5" },
          React.createElement('div', { className: "flex items-center gap-2 text-xs" },
            React.createElement(User, { className: "h-3.5 w-3.5 text-emerald-600 shrink-0" }),
            React.createElement('span', { className: "text-emerald-900 font-semibold" }, customer.name)
          ),
          React.createElement('div', { className: "flex items-center gap-2 text-xs" },
            React.createElement(Phone, { className: "h-3.5 w-3.5 text-emerald-600 shrink-0" }),
            React.createElement('span', { className: "text-emerald-900" }, customer.phone)
          ),
          customer.email && React.createElement('div', { className: "flex items-center gap-2 text-xs" },
            React.createElement(Mail, { className: "h-3.5 w-3.5 text-emerald-600 shrink-0" }),
            React.createElement('span', { className: "text-emerald-900" }, customer.email)
          ),
          React.createElement('div', { className: "flex items-center gap-2 text-xs" },
            React.createElement(Clock, { className: "h-3.5 w-3.5 text-emerald-600 shrink-0" }),
            React.createElement('span', { className: "text-emerald-900" }, "Member since: ", React.createElement('strong', {}, formatDate(customer.createdAt)))
          )
        )
      ),

      /* Loyalty stats */
      ls && React.createElement('div', { className: "border-t border-emerald-200 pt-3" },
        React.createElement('p', { className: "text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2" }, "Loyalty Stats"),
        React.createElement('div', { className: "grid grid-cols-3 gap-2" },
          React.createElement('div', { className: "bg-white/70 rounded-lg p-2 text-center" },
            React.createElement('p', { className: "text-base font-extrabold text-emerald-700" }, ls.stamps),
            React.createElement('p', { className: "text-[9px] text-emerald-600 uppercase tracking-wide mt-0.5" }, "Stamps")
          ),
          React.createElement('div', { className: "bg-white/70 rounded-lg p-2 text-center" },
            React.createElement('p', { className: "text-base font-extrabold text-emerald-700" }, ls.pointsBalance),
            React.createElement('p', { className: "text-[9px] text-emerald-600 uppercase tracking-wide mt-0.5" }, "Points")
          ),
          React.createElement('div', { className: "bg-white/70 rounded-lg p-2 text-center" },
            React.createElement('p', { className: "text-base font-extrabold text-emerald-700" }, ls.totalVisits),
            React.createElement('p', { className: "text-[9px] text-emerald-600 uppercase tracking-wide mt-0.5" }, "Visits")
          )
        )
      )
    )
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function CouponsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const businessId = _optionalChain([user, 'optionalAccess', _ => _.businessId]);

  // UI tabs for approval panel
  const [approvalTab, setApprovalTab] = useState("apply"); // "apply" | "history"

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Approval panel
  const [approvalCode, setApprovalCode] = useState("");
  const [approvalPhone, setApprovalPhone] = useState("");
  const [approvalResult, setApprovalResult] = useState(null);
  const [approvalLoading, setApprovalLoading] = useState(false);

  // Form states
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [offerTitle, setOfferTitle] = useState("");
  const [offerDescription, setOfferDescription] = useState("");

  // 1. Fetch coupons list
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["businessCoupons", businessId],
    queryFn: () => api.get(`/coupons/business/${businessId}`).then((res) => res.data),
    enabled: !!businessId && businessId !== "null" && businessId !== "undefined",
  });

  // 2. Fetch usage history
  const { data: usageHistory = [], isLoading: historyLoading, refetch: refetchHistory } = useQuery({
    queryKey: ["couponUsageHistory", businessId],
    queryFn: () => api.get(`/coupons/usage-history/${businessId}`).then((res) => res.data),
    enabled: !!businessId && businessId !== "null" && businessId !== "undefined" && approvalTab === "history",
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => api.post("/coupons", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["businessCoupons", businessId] }); setShowAddModal(false); resetForm(); },
    onError: (err) => { setErrorMsg(err.message || "Failed to create coupon."); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.patch(`/coupons/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["businessCoupons", businessId] }); setShowEditModal(false); resetForm(); },
    onError: (err) => { setErrorMsg(err.message || "Failed to update coupon."); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/coupons/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["businessCoupons", businessId] }); },
    onError: (err) => { setErrorMsg(err.message || "Failed to delete coupon."); }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => api.patch(`/coupons/${id}`, { isActive }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["businessCoupons", businessId] }); }
  });

  const handleCreateCoupon = (e) => {
    e.preventDefault(); setErrorMsg(null);
    createMutation.mutate({
      businessId, code: code.toUpperCase(), title,
      description: description || undefined, discountType,
      discountValue: parseFloat(discountValue),
      validFrom: new Date(validFrom).toISOString(),
      validTo: new Date(validTo).toISOString(),
      usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
      eventDate: eventDate ? new Date(eventDate).toISOString() : null,
      offerTitle: offerTitle || null, offerDescription: offerDescription || null,
    });
  };

  const handleEditCoupon = (e) => {
    e.preventDefault();
    if (!selectedCoupon) return;
    setErrorMsg(null);
    updateMutation.mutate({
      id: selectedCoupon.id,
      data: {
        code: code.toUpperCase(), title, description: description || undefined,
        discountType, discountValue: parseFloat(discountValue),
        validFrom: new Date(validFrom).toISOString(),
        validTo: new Date(validTo).toISOString(),
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        eventDate: eventDate ? new Date(eventDate).toISOString() : null,
        offerTitle: offerTitle || null, offerDescription: offerDescription || null,
      }
    });
  };

  const handleOpenEdit = (coupon) => {
    setSelectedCoupon(coupon); setCode(coupon.code); setTitle(coupon.title);
    setDescription(coupon.description || ""); setDiscountType(coupon.discountType);
    setDiscountValue(coupon.discountValue.toString());
    setValidFrom(new Date(coupon.validFrom).toISOString().split("T")[0]);
    setValidTo(new Date(coupon.validTo).toISOString().split("T")[0]);
    setUsageLimit(coupon.usageLimit ? coupon.usageLimit.toString() : "");
    setEventDate(coupon.eventDate ? new Date(coupon.eventDate).toISOString().split("T")[0] : "");
    setOfferTitle(coupon.offerTitle || ""); setOfferDescription(coupon.offerDescription || "");
    setShowEditModal(true);
  };

  const resetForm = () => {
    setCode(""); setTitle(""); setDescription(""); setDiscountType("PERCENTAGE");
    setDiscountValue(""); setValidFrom(""); setValidTo(""); setUsageLimit("");
    setEventDate(""); setOfferTitle(""); setOfferDescription("");
    setSelectedCoupon(null); setErrorMsg(null);
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!approvalCode.trim()) return;
    setApprovalLoading(true);
    setApprovalResult(null);
    try {
      const res = await api.post("/coupons/admin-apply", {
        code: approvalCode.trim().toUpperCase(),
        businessId,
        customerPhone: approvalPhone.trim() || undefined,
      });
      setApprovalResult({ applied: true, coupon: res.data.coupon, customer: res.data.customer });
      queryClient.invalidateQueries({ queryKey: ["couponUsageHistory", businessId] });
      queryClient.invalidateQueries({ queryKey: ["businessCoupons", businessId] });
    } catch (err) {
      setApprovalResult({ applied: false, error: err.message || "Coupon not found or expired." });
    } finally {
      setApprovalLoading(false);
    }
  };

  const resetApproval = () => {
    setApprovalCode(""); setApprovalPhone(""); setApprovalResult(null);
  };

  if (isLoading) {
    return (
      React.createElement('div', { className: "space-y-4 animate-pulse" },
        React.createElement('div', { className: "h-10 w-48 rounded bg-slate-100" }),
        React.createElement('div', { className: "h-36 w-full rounded-xl bg-slate-100" }),
        React.createElement('div', { className: "h-36 w-full rounded-xl bg-slate-100" })
      )
    );
  }

  return (
    React.createElement('div', { className: "space-y-6 max-w-2xl mx-auto w-full" },

      /* ── Coupon Approval Panel ─────────────────────────────────────────── */
      React.createElement(Card, { className: "glass border-primary/20" },
        React.createElement(CardHeader, { className: "p-4 pb-0" },
          React.createElement('div', { className: "flex items-center gap-2 mb-3" },
            React.createElement(BadgePercent, { className: "h-5 w-5 text-primary" }),
            React.createElement(CardTitle, { className: "text-base font-bold" }, "Coupon Approval")
          ),
          /* Tabs */
          React.createElement('div', { className: "flex gap-1 bg-slate-100 rounded-lg p-0.5" },
            React.createElement('button', {
              type: "button",
              onClick: () => setApprovalTab("apply"),
              className: `flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${approvalTab === "apply" ? "bg-white shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`
            }, "Apply Code"),
            React.createElement('button', {
              type: "button",
              onClick: () => { setApprovalTab("history"); refetchHistory(); },
              className: `flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1 ${approvalTab === "history" ? "bg-white shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`
            }, React.createElement(History, { className: "h-3 w-3" }), " Usage History")
          )
        ),

        React.createElement(CardContent, { className: "p-4 pt-3" },

          /* ── Apply tab ── */
          approvalTab === "apply" && React.createElement('div', {},
            React.createElement('p', { className: "text-xs text-muted-foreground mb-3" },
              "Customer verbally tells their code → enter it + phone → click Apply."
            ),
            React.createElement('form', { onSubmit: handleApplyCoupon, className: "space-y-3" },
              React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" },
                React.createElement('div', { className: "space-y-1" },
                  React.createElement(Label, { htmlFor: "approval-code", className: "text-xs font-semibold" }, "Coupon Code *"),
                  React.createElement(Input, {
                    id: "approval-code",
                    placeholder: "e.g. MONSOON30",
                    value: approvalCode,
                    onChange: (e) => { setApprovalCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")); setApprovalResult(null); },
                    className: "font-mono tracking-widest h-10 text-sm",
                    required: true
                  })
                ),
                React.createElement('div', { className: "space-y-1" },
                  React.createElement(Label, { htmlFor: "approval-phone", className: "text-xs font-semibold" }, "Customer Phone *"),
                  React.createElement(Input, {
                    id: "approval-phone",
                    type: "tel",
                    placeholder: "e.g. 9876543210",
                    value: approvalPhone,
                    onChange: (e) => { setApprovalPhone(e.target.value.replace(/[^0-9+\-\s]/g, "")); setApprovalResult(null); },
                    className: "h-10 text-sm",
                    required: true
                  })
                )
              ),
              React.createElement(Button, {
                type: "submit",
                className: "w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold",
                disabled: approvalLoading || !approvalCode.trim()
              },
                approvalLoading
                  ? React.createElement(React.Fragment, null, React.createElement(Loader2, { className: "h-4 w-4 animate-spin mr-2" }), "Validating...")
                  : "Apply Coupon & Show Customer Details"
              )
            ),

            /* Result */
            approvalResult && (
              approvalResult.applied
                ? React.createElement('div', {},
                    approvalResult.customer
                      ? React.createElement(CustomerInfoCard, { customer: approvalResult.customer, coupon: approvalResult.coupon })
                      : React.createElement('div', { className: "mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1" },
                          React.createElement('div', { className: "flex items-center gap-2" },
                            React.createElement(CheckCircle2, { className: "h-5 w-5 text-emerald-600 shrink-0" }),
                            React.createElement('div', {},
                              React.createElement('p', { className: "text-sm font-bold text-emerald-800" }, "Coupon Applied ✓"),
                              React.createElement('p', { className: "text-xs text-emerald-700" }, React.createElement('span', { className: "font-mono font-bold" }, approvalResult.coupon.code), " — ", approvalResult.coupon.title),
                              React.createElement('p', { className: "text-lg font-extrabold text-emerald-700 mt-0.5" },
                                approvalResult.coupon.discountType === "PERCENTAGE"
                                  ? `${approvalResult.coupon.discountValue}% OFF`
                                  : `₹${parseFloat(approvalResult.coupon.discountValue).toLocaleString("en-IN")} OFF`
                              ),
                              React.createElement('p', { className: "text-[11px] text-emerald-600 mt-1" }, "Walk-in customer (no phone provided — usage recorded without customer link)")
                            )
                          )
                        ),
                    React.createElement(Button, {
                      type: "button", variant: "outline", size: "sm",
                      className: "mt-2 w-full text-xs h-8",
                      onClick: resetApproval
                    }, "Apply Another Coupon")
                  )
                : React.createElement('div', { className: "mt-3 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4" },
                    React.createElement(XCircle, { className: "h-5 w-5 text-red-500 shrink-0" }),
                    React.createElement('p', { className: "text-xs text-red-700 font-semibold" }, approvalResult.error)
                  )
            )
          ),

          /* ── History tab ── */
          approvalTab === "history" && React.createElement('div', {},
            historyLoading
              ? React.createElement('div', { className: "space-y-2 animate-pulse mt-2" },
                  [1,2,3].map(i => React.createElement('div', { key: i, className: "h-16 rounded-lg bg-slate-100" }))
                )
              : usageHistory.length === 0
                ? React.createElement('div', { className: "text-center py-8 text-muted-foreground" },
                    React.createElement(History, { className: "h-8 w-8 mx-auto mb-2 opacity-40" }),
                    React.createElement('p', { className: "text-sm" }, "No coupon usages yet")
                  )
                : React.createElement('div', { className: "space-y-2 mt-2 max-h-[400px] overflow-y-auto pr-1" },
                    usageHistory.map((u) =>
                      React.createElement('div', {
                        key: u.id,
                        className: "flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-slate-50 rounded-xl border border-border"
                      },
                        /* Coupon badge */
                        React.createElement('span', { className: "font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20 shrink-0 self-start" },
                          u.coupon.code
                        ),
                        /* Customer info */
                        React.createElement('div', { className: "flex-1 min-w-0" },
                          u.customer
                            ? React.createElement('div', {},
                                React.createElement('p', { className: "text-xs font-semibold text-foreground truncate" }, u.customer.name),
                                React.createElement('p', { className: "text-[11px] text-muted-foreground" }, u.customer.phone),
                              )
                            : React.createElement('p', { className: "text-xs text-muted-foreground italic" }, "Walk-in customer")
                        ),
                        /* Discount + date */
                        React.createElement('div', { className: "text-right shrink-0" },
                          React.createElement('p', { className: "text-xs font-bold text-foreground" },
                            u.coupon.discountType === "PERCENTAGE"
                              ? `${u.coupon.discountValue}% off`
                              : `₹${parseFloat(u.coupon.discountValue).toLocaleString("en-IN")} off`
                          ),
                          React.createElement('p', { className: "text-[10px] text-muted-foreground" },
                            new Date(u.usedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                          )
                        )
                      )
                    )
                  )
          )
        )
      ),

      /* ── Header ──────────────────────────────────────────────────────────── */
      React.createElement('div', { className: "flex items-center justify-between gap-3" },
        React.createElement('div', {},
          React.createElement('h1', { className: "text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight" }, "Discount Coupons"),
          React.createElement('p', { className: "text-xs text-muted-foreground mt-1" }, "Setup promo codes for customer acquisitions")
        ),
        React.createElement(Button, {
          onClick: () => { setShowAddModal(true); resetForm(); },
          className: "bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
        },
          React.createElement(Plus, { className: "mr-2 h-4 w-4" }), "Create"
        )
      ),

      /* ── Coupons Grid ────────────────────────────────────────────────────── */
      coupons.length === 0 ? (
        React.createElement(Card, { className: "border-dashed border-border bg-slate-50/50 py-12 text-center", glass: true },
          React.createElement(CardContent, { className: "flex flex-col items-center justify-center space-y-3" },
            React.createElement(Tag, { className: "h-10 w-10 text-muted-foreground" }),
            React.createElement('p', { className: "text-sm text-muted-foreground font-medium" }, "No coupons set up yet"),
            React.createElement(Button, { size: "sm", onClick: () => setShowAddModal(true), className: "mt-2 text-primary-foreground" }, "Setup Coupon")
          )
        )
      ) : (
        React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
          coupons.map((coupon) => {
            const isPercent = coupon.discountType === "PERCENTAGE";
            const isExpired = new Date(coupon.validTo) < new Date();
            return (
              React.createElement(Card, { key: coupon.id, className: `glass ${(!coupon.isActive || isExpired) && "opacity-60"}`, glass: true },
                React.createElement(CardHeader, { className: "p-4 pb-2" },
                  React.createElement('div', { className: "flex justify-between items-start" },
                    React.createElement('div', { className: "flex-1 min-w-0 pr-2" },
                      React.createElement('div', { className: "flex flex-wrap items-center gap-2" },
                        React.createElement('span', { className: "font-mono text-sm text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20" }, coupon.code),
                        React.createElement('span', { className: `text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${coupon.isActive && !isExpired ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-600 border-slate-200"}` },
                          isExpired ? "Expired" : coupon.isActive ? "Active" : "Disabled"
                        )
                      ),
                      React.createElement('p', { className: "text-xs font-semibold text-foreground mt-1 truncate" }, coupon.title)
                    ),
                    React.createElement(CouponMenu, {
                      coupon,
                      onEdit: () => handleOpenEdit(coupon),
                      onDelete: () => { if (window.confirm(`Delete coupon "${coupon.code}"?`)) deleteMutation.mutate(coupon.id); },
                      onToggle: () => toggleActiveMutation.mutate({ id: coupon.id, isActive: !coupon.isActive }),
                      isExpired
                    })
                  )
                ),
                React.createElement(CardContent, { className: "p-4 pt-2 space-y-3" },
                  React.createElement('div', { className: "grid grid-cols-2 gap-3 text-xs" },
                    React.createElement('div', { className: "bg-slate-50 p-2.5 rounded-lg border border-border" },
                      React.createElement('span', { className: "text-muted-foreground block text-[9px] uppercase tracking-wide" }, "Discount"),
                      React.createElement('span', { className: "text-foreground font-extrabold text-sm" },
                        isPercent ? `${coupon.discountValue}% Off` : `₹${parseFloat(coupon.discountValue).toLocaleString("en-IN")} Off`
                      )
                    ),
                    React.createElement('div', { className: "bg-slate-50 p-2.5 rounded-lg border border-border" },
                      React.createElement('span', { className: "text-muted-foreground block text-[9px] uppercase tracking-wide" }, "Used"),
                      React.createElement('span', { className: "text-foreground font-extrabold text-sm" },
                        coupon.totalUsed, coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""
                      )
                    )
                  ),
                  React.createElement('div', { className: "flex justify-between text-[10px] text-muted-foreground" },
                    React.createElement('span', {}, "From: ", React.createElement('strong', {}, formatDate(coupon.validFrom))),
                    React.createElement('span', {}, "To: ", React.createElement('strong', {}, formatDate(coupon.validTo)))
                  )
                )
              )
            );
          })
        )
      ),

      /* ── Add Modal ───────────────────────────────────────────────────────── */
      showAddModal && (
        React.createElement(Dialog, { open: showAddModal, onOpenChange: (open) => !open && setShowAddModal(false) },
          React.createElement(DialogContent, { className: "max-w-[420px] w-[95vw]" },
            React.createElement(DialogHeader, {},
              React.createElement(DialogTitle, {}, "Create Discount Coupon"),
              React.createElement(DialogDescription, {}, "Configure standalone promotion code campaigns.")
            ),
            errorMsg && React.createElement('div', { className: "bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-xs text-destructive text-center" }, errorMsg),
            React.createElement('form', { onSubmit: handleCreateCoupon, className: "space-y-4 py-2" },
              React.createElement('div', { className: "grid grid-cols-2 gap-3" },
                React.createElement('div', { className: "space-y-1" },
                  React.createElement(Label, { htmlFor: "coupon-code" }, "Promo Code"),
                  React.createElement(Input, { id: "coupon-code", placeholder: "e.g. MONSOON30", value: code, onChange: (e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")), required: true })
                ),
                React.createElement('div', { className: "space-y-1" },
                  React.createElement(Label, { htmlFor: "coupon-title" }, "Title"),
                  React.createElement(Input, { id: "coupon-title", placeholder: "e.g. 30% Off", value: title, onChange: (e) => setTitle(e.target.value), required: true })
                )
              ),
              React.createElement('div', { className: "space-y-1" },
                React.createElement(Label, { htmlFor: "coupon-desc" }, "Description"),
                React.createElement(Input, { id: "coupon-desc", placeholder: "Optional description", value: description, onChange: (e) => setDescription(e.target.value) })
              ),
              React.createElement('div', { className: "grid grid-cols-2 gap-3" },
                React.createElement('div', { className: "space-y-1.5" },
                  React.createElement(Label, { htmlFor: "discount-type" }, "Type"),
                  React.createElement(Select, { onValueChange: (val) => setDiscountType(val), defaultValue: discountType },
                    React.createElement(SelectTrigger, { className: "w-full" }, React.createElement(SelectValue, {})),
                    React.createElement(SelectContent, {},
                      React.createElement(SelectItem, { value: "PERCENTAGE" }, "% Percentage"),
                      React.createElement(SelectItem, { value: "FIXED_AMOUNT" }, "₹ Fixed Amount")
                    )
                  )
                ),
                React.createElement('div', { className: "space-y-1" },
                  React.createElement(Label, { htmlFor: "discount-value" }, "Value"),
                  React.createElement(Input, { id: "discount-value", type: "number", placeholder: discountType === "PERCENTAGE" ? "30" : "150", value: discountValue, onChange: (e) => setDiscountValue(e.target.value), required: true })
                )
              ),
              React.createElement('div', { className: "grid grid-cols-2 gap-3" },
                React.createElement('div', { className: "space-y-1" },
                  React.createElement(Label, { htmlFor: "valid-from" }, "Valid From"),
                  React.createElement(Input, { id: "valid-from", type: "date", value: validFrom, onChange: (e) => setValidFrom(e.target.value), required: true })
                ),
                React.createElement('div', { className: "space-y-1" },
                  React.createElement(Label, { htmlFor: "valid-to" }, "Valid To"),
                  React.createElement(Input, { id: "valid-to", type: "date", value: validTo, onChange: (e) => setValidTo(e.target.value), required: true })
                )
              ),
              React.createElement('div', { className: "space-y-1" },
                React.createElement(Label, { htmlFor: "usage-limit" }, "Usage Limit * (max times this code can be used)"),
                React.createElement(Input, { id: "usage-limit", type: "number", min: "1", placeholder: "e.g. 100", value: usageLimit, onChange: (e) => setUsageLimit(e.target.value), required: true })
              ),
              React.createElement(DialogFooter, { className: "pt-2 gap-2" },
                React.createElement(Button, { type: "button", variant: "outline", onClick: () => setShowAddModal(false) }, "Cancel"),
                React.createElement(Button, { type: "submit", className: "bg-primary", disabled: createMutation.isPending },
                  createMutation.isPending ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin" }) : "Publish Coupon"
                )
              )
            )
          )
        )
      ),

      /* ── Edit Modal ──────────────────────────────────────────────────────── */
      showEditModal && (
        React.createElement(Dialog, { open: showEditModal, onOpenChange: (open) => !open && setShowEditModal(false) },
          React.createElement(DialogContent, { className: "max-w-[420px] w-[95vw]" },
            React.createElement(DialogHeader, {},
              React.createElement(DialogTitle, {}, "Configure Coupon"),
              React.createElement(DialogDescription, {}, "Modify coupon code, discount, or dates.")
            ),
            errorMsg && React.createElement('div', { className: "bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-xs text-destructive text-center" }, errorMsg),
            React.createElement('form', { onSubmit: handleEditCoupon, className: "space-y-4 py-2" },
              React.createElement('div', { className: "grid grid-cols-2 gap-3" },
                React.createElement('div', { className: "space-y-1" },
                  React.createElement(Label, { htmlFor: "edit-coupon-code" }, "Promo Code"),
                  React.createElement(Input, { id: "edit-coupon-code", placeholder: "e.g. MONSOON30", value: code, onChange: (e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")), required: true })
                ),
                React.createElement('div', { className: "space-y-1" },
                  React.createElement(Label, { htmlFor: "edit-coupon-title" }, "Title"),
                  React.createElement(Input, { id: "edit-coupon-title", placeholder: "e.g. 30% Off", value: title, onChange: (e) => setTitle(e.target.value), required: true })
                )
              ),
              React.createElement('div', { className: "space-y-1" },
                React.createElement(Label, { htmlFor: "edit-coupon-desc" }, "Description"),
                React.createElement(Input, { id: "edit-coupon-desc", placeholder: "Optional description", value: description, onChange: (e) => setDescription(e.target.value) })
              ),
              React.createElement('div', { className: "grid grid-cols-2 gap-3" },
                React.createElement('div', { className: "space-y-1.5" },
                  React.createElement(Label, { htmlFor: "edit-discount-type" }, "Type"),
                  React.createElement(Select, { onValueChange: (val) => setDiscountType(val), defaultValue: discountType, value: discountType },
                    React.createElement(SelectTrigger, { className: "w-full" }, React.createElement(SelectValue, {})),
                    React.createElement(SelectContent, {},
                      React.createElement(SelectItem, { value: "PERCENTAGE" }, "% Percentage"),
                      React.createElement(SelectItem, { value: "FIXED_AMOUNT" }, "₹ Fixed Amount")
                    )
                  )
                ),
                React.createElement('div', { className: "space-y-1" },
                  React.createElement(Label, { htmlFor: "edit-discount-value" }, "Value"),
                  React.createElement(Input, { id: "edit-discount-value", type: "number", placeholder: discountType === "PERCENTAGE" ? "30" : "150", value: discountValue, onChange: (e) => setDiscountValue(e.target.value), required: true })
                )
              ),
              React.createElement('div', { className: "grid grid-cols-2 gap-3" },
                React.createElement('div', { className: "space-y-1" },
                  React.createElement(Label, { htmlFor: "edit-valid-from" }, "Valid From"),
                  React.createElement(Input, { id: "edit-valid-from", type: "date", value: validFrom, onChange: (e) => setValidFrom(e.target.value), required: true })
                ),
                React.createElement('div', { className: "space-y-1" },
                  React.createElement(Label, { htmlFor: "edit-valid-to" }, "Valid To"),
                  React.createElement(Input, { id: "edit-valid-to", type: "date", value: validTo, onChange: (e) => setValidTo(e.target.value), required: true })
                )
              ),
              React.createElement('div', { className: "space-y-1" },
                React.createElement(Label, { htmlFor: "edit-usage-limit" }, "Usage Limit * (max times this code can be used)"),
                React.createElement(Input, { id: "edit-usage-limit", type: "number", min: "1", placeholder: "e.g. 100", value: usageLimit, onChange: (e) => setUsageLimit(e.target.value), required: true })
              ),
              React.createElement(DialogFooter, { className: "pt-2 gap-2" },
                React.createElement(Button, { type: "button", variant: "outline", onClick: () => setShowEditModal(false) }, "Cancel"),
                React.createElement(Button, { type: "submit", className: "bg-primary", disabled: updateMutation.isPending },
                  updateMutation.isPending ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin" }) : "Save Changes"
                )
              )
            )
          )
        )
      )
    )
  );
}

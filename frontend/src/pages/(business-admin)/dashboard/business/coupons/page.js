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
  Phone, Mail, Clock, Stamp, Star, History, Scan, Camera, Upload, Bell
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import BusinessBottomNav from "@/components/BusinessBottomNav";
import { cn } from "@/lib/utils";

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
    React.createElement('div', { className: "mt-3 bg-[#DCFCE7]/60 border border-emerald-200 rounded-2xl p-4 space-y-3" },
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
  const [scanningApply, setScanningApply] = useState(false);
  const [scanUploadLoading, setScanUploadLoading] = useState(false);
  const html5QrCodeApplyRef = useRef(null);
  const couponFileInputRef = useRef(null);

  const handleScanSuccess = (decodedText) => {
    let codeToApply = decodedText;
    let phoneToApply = "";
    if (typeof decodedText === "string" && decodedText.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(decodedText);
        if (parsed.redemptionCode) {
          codeToApply = parsed.redemptionCode;
        }
        if (parsed.customerPhone) {
          phoneToApply = parsed.customerPhone;
        }
      } catch (e) {
        // Fallback
      }
    }
    setApprovalCode(codeToApply.toUpperCase());
    setApprovalPhone(phoneToApply);
    
    // Automatically submit:
    setApprovalLoading(true);
    setApprovalResult(null);
    api.post("/coupons/admin-apply", {
      code: codeToApply.trim().toUpperCase(),
      businessId,
      customerPhone: phoneToApply.trim() || undefined,
    }).then(res => {
      setApprovalResult({ applied: true, coupon: res.data.coupon, customer: res.data.customer });
      queryClient.invalidateQueries({ queryKey: ["couponUsageHistory", businessId] });
      queryClient.invalidateQueries({ queryKey: ["businessCoupons", businessId] });
    }).catch(err => {
      setApprovalResult({ applied: false, error: err.response?.data?.message || err.message || "Coupon not found or expired." });
    }).finally(() => {
      setApprovalLoading(false);
    });
  };

  // Upload QR image file scanner (works without camera permission)
  const handleCouponFileUpload = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    setScanUploadLoading(true);
    setApprovalResult(null);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode("reader-coupon-hidden-mob");
      const decodedText = await html5QrCode.scanFile(file, true);
      handleScanSuccess(decodedText);
    } catch (err) {
      console.warn("Failed to parse QR from uploaded image:", err?.message || err);
      setApprovalResult({ applied: false, error: "Could not read a valid QR code from the image. Please try a clearer photo or enter the code manually." });
    } finally {
      setScanUploadLoading(false);
      if (couponFileInputRef.current) couponFileInputRef.current.value = "";
    }
  };

  // Camera scanner (optional — only works when camera permission is granted)
  useEffect(() => {
    let qrScanner = null;
    let isMounted = true;

    if (scanningApply) {
      const initScanner = async () => {
        try {
          const { Html5Qrcode } = await import("html5-qrcode");
          if (!isMounted) return;

          const scannerId = "reader-coupon-apply-mob";
          qrScanner = new Html5Qrcode(scannerId);
          html5QrCodeApplyRef.current = qrScanner;

          await qrScanner.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              if (isMounted) {
                qrScanner.stop().then(() => {
                  setScanningApply(false);
                  handleScanSuccess(decodedText);
                }).catch(err => {
                  setScanningApply(false);
                  handleScanSuccess(decodedText);
                });
              }
            },
            (_errorMessage) => {
              // ignore scan errors
            }
          );
        } catch (err) {
          console.warn("Camera unavailable, use image upload instead:", err?.message || err);
          if (isMounted) {
            setScanningApply(false);
          }
        }
      };

      const timer = setTimeout(initScanner, 100);
      return () => {
        clearTimeout(timer);
        isMounted = false;
        if (qrScanner && qrScanner.isScanning) {
          qrScanner.stop().catch(() => {});
        }
      };
    }
  }, [scanningApply]);

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
      setApprovalResult({ applied: false, error: err.response?.data?.message || err.message || "Coupon not found or expired." });
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
    React.createElement('div', { className: "min-h-screen bg-[#F8FAFC] -m-4 md:-m-8 md:m-0 md:bg-transparent" }

      /* ─── MOBILE VIEW LAYOUT ─── */
      , React.createElement('div', { className: "md:hidden space-y-5 pb-24" }
        /* A. Header bar */
        , React.createElement('div', { className: "flex items-center justify-between px-5 pt-4 pb-2 bg-white" }
          , React.createElement('h2', { className: "text-lg font-bold text-[#0F172A]" }, "Business Portal")
          , React.createElement('div', { className: "flex items-center gap-3" }
            , React.createElement('button', { className: "relative w-9 h-9 rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#64748B]" }
              , React.createElement(Bell, { className: "h-4.5 w-4.5" })
              , React.createElement('span', { className: "absolute top-0.5 right-0.5 w-4 h-4 bg-[#F97316] text-white text-[8px] font-black rounded-full flex items-center justify-center leading-none" }, "3")
            )
            , React.createElement('div', { className: "w-9 h-9 rounded-full bg-[#FFEDD5] border border-[#FED7AA] flex items-center justify-center text-[#F97316] text-sm font-bold shadow-sm" }
              , (user?.name?.[0]?.toUpperCase() || "B")
            )
          )
        )

        /* B. Hero banner */
        , React.createElement('div', { className: "px-4" }
          , React.createElement('div', { className: "bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-3xl p-5 text-white shadow-sm relative overflow-hidden flex justify-between items-center" }
            , React.createElement('div', { className: "space-y-1.5 z-10 w-2/3" }
              , React.createElement('div', { className: "flex items-center gap-2" }
                , React.createElement('div', { className: "w-8 h-8 rounded-full border border-white/50 flex items-center justify-center shrink-0" }
                  , React.createElement(Percent, { className: "h-4 w-4 text-white" })
                )
                , React.createElement('h3', { className: "text-base font-bold text-white tracking-tight" }, "Coupon Management")
              )
              , React.createElement('p', { className: "text-xs text-white/90 leading-relaxed" }, "Create, manage and apply coupons to reward your customers.")
            )
            , React.createElement('div', { className: "absolute right-2 top-0 h-full w-1/3 pointer-events-none select-none flex items-center justify-end" }
              , React.createElement("svg", { viewBox: "0 0 100 100", className: "h-16 w-16 opacity-90", fill: "none" }
                , React.createElement("rect", { x: 20, y: 30, width: 40, height: 40, rx: 6, fill: "#FCE7F3", transform: "rotate(-15 40 50)" })
                , React.createElement("text", { x: 30, y: 55, fill: "#EC4899", fontSize: 18, fontWeight: "bold", transform: "rotate(-15 40 50)" }, "%")
                , React.createElement("rect", { x: 50, y: 40, width: 35, height: 35, rx: 4, fill: "#FFEDD5" })
                , React.createElement("rect", { x: 48, y: 48, width: 39, height: 6, fill: "#F97316" })
                , React.createElement("path", { d: "M 67.5 40 Q 60 30 67.5 25 Q 75 30 67.5 40", fill: "#F97316" })
              )
            )
          )
        )

        /* C. Apply Coupon card */
        , React.createElement('div', { className: "px-4" }
          , React.createElement('div', { className: "bg-white rounded-3xl p-5 shadow-sm border border-[#F1F5F9] space-y-4" }
            , React.createElement('div', { className: "flex items-start gap-3 pb-2 border-b border-[#F8FAFC]" }
              , React.createElement('div', { className: "w-8 h-8 rounded-full bg-[#FFF0E6] flex items-center justify-center shrink-0" }
                , React.createElement(Scan, { className: "h-4 w-4 text-[#F97316]" })
              )
              , React.createElement('div', null
                , React.createElement('h4', { className: "font-black text-sm text-[#0F172A]" }, "Apply Coupon")
                , React.createElement('p', { className: "text-[10px] text-[#64748B]" }, "Upload or enter the coupon code to apply for a customer")
              )
            )

            /* Tab toggle */
            , React.createElement('div', { className: "flex gap-1 bg-[#F1F5F9] rounded-xl p-1" }
              , React.createElement('button', {
                  type: "button",
                  onClick: () => setApprovalTab("apply"),
                  className: cn("flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
                    , approvalTab === "apply" ? "bg-white text-[#F97316] shadow-sm" : "text-[#64748B] hover:text-[#0F172A]"
                  )
                }
                , React.createElement(Scan, { className: "h-3.5 w-3.5" })
                , "Apply Code"
              )
              , React.createElement('button', {
                  type: "button",
                  onClick: () => { setApprovalTab("history"); refetchHistory(); },
                  className: cn("flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
                    , approvalTab === "history" ? "bg-white text-[#F97316] shadow-sm" : "text-[#64748B] hover:text-[#0F172A]"
                  )
                }
                , React.createElement(History, { className: "h-3.5 w-3.5" })
                , "Usage History"
              )
            )

            /* Apply Code tab panel */
            , approvalTab === "apply" && React.createElement('div', { className: "space-y-4" }
              /* Hidden element for file-based QR scanning */
              , React.createElement('div', {
                  id: "reader-coupon-hidden-mob",
                  style: { position: 'absolute', left: '-9999px', top: '-9999px', width: '1px', height: '1px', overflow: 'hidden' },
                })
              , scanningApply ? React.createElement('div', { className: "space-y-3" }
                  , React.createElement('div', { className: "relative w-full aspect-square max-w-[240px] mx-auto rounded-2xl overflow-hidden border-2 border-primary/40 bg-black flex items-center justify-center" }
                    , React.createElement('div', { id: "reader-coupon-apply-mob", className: "absolute inset-0 w-full h-full" })
                    , React.createElement('div', { className: "absolute inset-x-4 top-1/2 h-[2px] bg-primary animate-pulse z-10" })
                  )
                  , React.createElement(Button, {
                      type: "button",
                      variant: "outline",
                      onClick: () => setScanningApply(false),
                      className: "w-full text-xs rounded-xl"
                    }, "Cancel Scanning")
                )
              : React.createElement(React.Fragment, null
                  /* Upload Box */
                  , React.createElement('div', null
                    , React.createElement('input', {
                        ref: couponFileInputRef,
                        type: "file",
                        capture: "environment",
                        accept: "image/*",
                        onChange: handleCouponFileUpload,
                        className: "hidden",
                        id: "coupon-qr-file-input-mob"
                      })
                    , React.createElement('button', {
                        type: "button",
                        disabled: scanUploadLoading,
                        onClick: () => { if (couponFileInputRef.current) couponFileInputRef.current.click(); },
                        className: "w-full py-6 rounded-2xl border-2 border-dashed border-[#FDBA74] bg-[#FFEDD5]/20 hover:bg-[#FFEDD5]/40 flex flex-col items-center justify-center gap-1.5 transition-colors"
                      }
                      , scanUploadLoading
                        ? React.createElement(Loader2, { className: "h-6 w-6 animate-spin text-[#F97316]" })
                        : React.createElement('div', { className: "w-10 h-10 rounded-full bg-[#FFEDD5] flex items-center justify-center" }
                            , React.createElement(Camera, { className: "h-5 w-5 text-[#F97316]" })
                          )
                      , React.createElement('span', { className: "text-xs font-bold text-[#0F172A]" }, "Upload / Take Photo of Coupon QR")
                      , React.createElement('span', { className: "text-[10px] text-[#64748B]" }, "Tap to upload or use camera")
                    )
                  )

                  /* OR divider */
                  , React.createElement('div', { className: "flex items-center justify-center gap-3 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider py-1" }
                    , React.createElement('div', { className: "h-px flex-1 bg-[#F1F5F9]" })
                    , "— OR —"
                    , React.createElement('div', { className: "h-px flex-1 bg-[#F1F5F9]" })
                  )

                  /* Standalone live scanner row */
                  , React.createElement('button', {
                      type: "button",
                      onClick: () => { setApprovalResult(null); setScanningApply(true); },
                      className: "w-full bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl px-4 py-3 flex items-center justify-between text-left active:scale-95 transition-transform"
                    }
                    , React.createElement('div', { className: "flex items-center gap-2.5" }
                      , React.createElement(Camera, { className: "h-4 w-4 text-[#F97316]" })
                      , React.createElement('span', { className: "text-xs font-bold text-[#0F172A]" }, "Use Live Camera Scanner")
                    )
                    , React.createElement('span', { className: "text-[#64748B] text-xs" }, "→")
                  )

                  /* Form Fields */
                  , React.createElement('form', { onSubmit: handleApplyCoupon, className: "space-y-3.5 pt-2" }
                    , React.createElement('div', { className: "space-y-1.5" }
                      , React.createElement(Label, { htmlFor: "mob-app-code", className: "text-xs font-bold text-[#64748B]" }, "Coupon Code *")
                      , React.createElement('div', { className: "relative" }
                        , React.createElement(Input, {
                            id: "mob-app-code",
                            placeholder: "e.g. MONSOON30",
                            value: approvalCode,
                            onChange: (e) => { setApprovalCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")); setApprovalResult(null); },
                            className: "font-mono tracking-widest h-10 text-xs bg-[#F8FAFC] border-[#F1F5F9] rounded-xl pr-9",
                            required: true
                          })
                        , React.createElement(Tag, { className: "absolute right-3 top-3 h-4 w-4 text-[#94A3B8]" })
                      )
                    )
                    , React.createElement('div', { className: "space-y-1.5" }
                      , React.createElement(Label, { htmlFor: "mob-app-phone", className: "text-xs font-bold text-[#64748B]" }, "Customer Phone *")
                      , React.createElement('div', { className: "relative" }
                        , React.createElement(Input, {
                            id: "mob-app-phone",
                            type: "tel",
                            placeholder: "e.g. 9876543210",
                            value: approvalPhone,
                            onChange: (e) => { setApprovalPhone(e.target.value.replace(/[^0-9+\-\s]/g, "")); setApprovalResult(null); },
                            className: "h-10 text-xs bg-[#F8FAFC] border-[#F1F5F9] rounded-xl pr-9",
                            required: true
                          })
                        , React.createElement(Phone, { className: "absolute right-3 top-3 h-4 w-4 text-[#94A3B8]" })
                      )
                    )
                    , React.createElement(Button, {
                        type: "submit",
                        className: "w-full h-11 bg-[#F97316] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                        , disabled: approvalLoading || !approvalCode.trim() || !approvalPhone.trim()
                      }
                      , approvalLoading
                        ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin mr-2" })
                        : React.createElement(React.Fragment, null, "Apply Coupon & Show Customer Details", React.createElement('span', null, "→"))
                    )
                  )
                )

              /* Result alerts */
              , approvalResult && (
                  approvalResult.applied
                    ? React.createElement(CustomerInfoCard, { customer: approvalResult.customer, coupon: approvalResult.coupon })
                    : React.createElement('div', { className: "flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4" }
                        , React.createElement(XCircle, { className: "h-5 w-5 text-red-500 shrink-0" })
                        , React.createElement('p', { className: "text-xs text-red-700 font-semibold" }, approvalResult.error)
                      )
                )
            )

            /* Usage History tab panel */
            , approvalTab === "history" && React.createElement('div', { className: "space-y-3 max-h-[300px] overflow-y-auto" }
              , historyLoading ? React.createElement(Loader2, { className: "h-5 w-5 animate-spin mx-auto text-[#F97316]" })
              : usageHistory.length === 0 ? React.createElement('p', { className: "text-xs text-center text-[#64748B] py-6" }, "No usage history yet.")
              : usageHistory.map((u) => React.createElement('div', { key: u.id, className: "flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] border border-[#F1F5F9] text-xs" }
                  , React.createElement('div', { className: "space-y-0.5" }
                    , React.createElement('div', { className: "flex items-center gap-1.5" }
                      , React.createElement('span', { className: "font-mono font-bold text-[#F97316]" }, u.coupon.code)
                      , React.createElement('span', { className: "text-[10px] text-[#64748B]" }, "·")
                      , React.createElement('span', { className: "font-bold text-[#0F172A]" }, u.customer?.name || "Walk-in")
                    )
                    , React.createElement('p', { className: "text-[10px] text-[#64748B]" }, u.customer?.phone || "—")
                  )
                  , React.createElement('div', { className: "text-right" }
                    , React.createElement('p', { className: "font-bold text-[#0F172A]" }
                      , u.coupon.discountType === "PERCENTAGE" ? `${u.coupon.discountValue}% OFF` : `₹${u.coupon.discountValue} OFF`
                    )
                    , React.createElement('p', { className: "text-[9px] text-[#64748B]" }, new Date(u.usedAt).toLocaleDateString())
                  )
                ))
            )
          )
        )

        /* D. Your Active Coupons Section */
        , React.createElement('div', { className: "px-4 space-y-4" }
          , React.createElement('div', { className: "flex items-center justify-between" }
            , React.createElement('div', null
              , React.createElement('h3', { className: "font-black text-base text-[#0F172A]" }, "Your Active Coupons")
              , React.createElement('p', { className: "text-[10px] text-[#64748B]" }, "Manage and monitor your active coupons")
            )
            , React.createElement('button', {
                onClick: () => { setShowAddModal(true); resetForm(); },
                className: "bg-[#F97316] text-white font-bold rounded-xl text-xs px-3.5 py-2 flex items-center gap-1 hover:bg-[#EA580C] active:scale-95 transition-transform shadow-sm"
              }
              , React.createElement(Plus, { className: "h-3.5 w-3.5" }), "Create"
            )
          )

          /* Stats Row */
          , React.createElement('div', { className: "grid grid-cols-3 gap-2" }
            , [
                { title: "Active Coupons", value: coupons.filter(c => c.isActive && new Date(c.validTo) >= new Date()).length, label: "Live", color: "text-[#22C55E] bg-[#DCFCE7]" }
                , { title: "Total Used", value: coupons.reduce((sum, c) => sum + (c.totalUsed || 0), 0), label: "This Month", color: "text-[#F59E0B] bg-[#FEF3C7]" }
                , { title: "Customers", value: coupons.reduce((sum, c) => sum + (c.totalUsed ? 1 : 0), 0) + 12, label: "Benefited", color: "text-[#7C3AED] bg-[#EDE9FE]" }
              ].map((stat, i) => React.createElement('div', { key: i, className: "bg-white rounded-2xl p-3 border border-[#F1F5F9] shadow-sm flex flex-col justify-between" }
                  , React.createElement('div', { className: "flex items-center gap-1" }
                    , React.createElement('span', { className: "text-[9px] font-bold text-[#64748B] tracking-tight truncate" }, stat.title)
                  )
                  , React.createElement('div', { className: "my-1.5" }
                    , React.createElement('span', { className: "text-xl font-extrabold text-[#0F172A]" }, stat.value)
                  )
                  , React.createElement('div', { className: "flex items-center gap-1" }
                    , stat.label === "Live" && React.createElement('span', { className: "w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" })
                    , React.createElement('span', { className: cn("text-[9px] font-bold", stat.label === "Live" ? "text-[#22C55E]" : "text-[#64748B]") }, stat.label)
                  )
                ))
          )

          /* Recent Coupons Header */
          , React.createElement('div', { className: "flex items-center justify-between pt-2" }
            , React.createElement('span', { className: "text-xs font-bold text-[#0F172A]" }, "Recent Coupons")
            , React.createElement('button', { className: "text-xs font-bold text-[#F97316]" }, "View All")
          )

          /* Coupons List */
          , React.createElement('div', { className: "space-y-3" }
            , coupons.map((coupon) => {
                const isPercent = coupon.discountType === "PERCENTAGE";
                const isExpired = new Date(coupon.validTo) < new Date();
                return React.createElement('div', { key: coupon.id, className: cn("bg-white rounded-3xl p-4 border border-[#F1F5F9] shadow-sm flex items-center justify-between gap-3", (!coupon.isActive || isExpired) && "opacity-60") }
                  , React.createElement('div', { className: "flex items-center gap-3 min-w-0 flex-1" }
                    /* Highlight tile */
                    , React.createElement('div', { className: "w-12 h-12 rounded-2xl bg-[#FFEDD5] flex flex-col items-center justify-center shrink-0" }
                      , React.createElement('span', { className: "text-xs font-black text-[#F97316] leading-none" }, isPercent ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`)
                      , React.createElement('span', { className: "text-[7px] font-bold text-[#F97316] uppercase mt-0.5" }, "OFF")
                    )
                    /* Middle details */
                    , React.createElement('div', { className: "min-w-0 flex-1 space-y-0.5" }
                      , React.createElement('div', { className: "flex items-center gap-1.5" }
                        , React.createElement('span', { className: "font-mono font-bold text-xs text-[#0F172A]" }, coupon.code)
                        , React.createElement('span', { className: cn("text-[8px] font-bold px-1.5 py-0.5 rounded-full border"
                            , coupon.isActive && !isExpired ? "bg-[#DCFCE7] text-[#22C55E] border-[#DCFCE7]" : "bg-slate-100 text-slate-600 border-slate-200"
                          ) }, isExpired ? "Expired" : coupon.isActive ? "Active" : "Disabled")
                      )
                      , React.createElement('p', { className: "text-[10px] text-[#64748B] truncate" }, coupon.title)
                      , React.createElement('p', { className: "text-[9px] text-[#64748B]" }
                        , `Valid till ${new Date(coupon.validTo).toLocaleDateString()} · Usage: ${coupon.totalUsed}`
                      )
                    )
                  )
                  /* Right side usage & menu */
                  , React.createElement('div', { className: "flex items-center gap-2 shrink-0" }
                    , React.createElement('div', { className: "text-right" }
                      , React.createElement('p', { className: "font-black text-xs text-[#0F172A] leading-none" }, coupon.totalUsed)
                      , React.createElement('p', { className: "text-[8px] text-[#64748B]" }, "Used")
                    )
                    , React.createElement(CouponMenu, {
                        coupon,
                        onEdit: () => handleOpenEdit(coupon),
                        onDelete: () => { if (window.confirm(`Delete coupon "${coupon.code}"?`)) deleteMutation.mutate(coupon.id); },
                        onToggle: () => toggleActiveMutation.mutate({ id: coupon.id, isActive: !coupon.isActive }),
                        isExpired
                      })
                  )
                );
              })
          )
        )

        /* Bottom Nav */
        , React.createElement(BusinessBottomNav, { variant: "flat", pendingCount: 12 })
      )

      /* ─── DESKTOP VIEW LAYOUT ─── */
      , React.createElement('div', { className: "hidden md:block space-y-6 max-w-7xl mx-auto px-6 py-6" }
        , React.createElement('div', { className: "flex items-center justify-between gap-3" }
          , React.createElement('div', null
            , React.createElement('h1', { className: "text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight" }, "Discount Coupons")
            , React.createElement('p', { className: "text-xs text-muted-foreground mt-1" }, "Setup promo codes for customer acquisitions")
          )
          , React.createElement(Button, {
              onClick: () => { setShowAddModal(true); resetForm(); },
              className: "bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
            }
            , React.createElement(Plus, { className: "mr-2 h-4 w-4" }), "Create"
          )
        )

        /* ── Coupons Grid ── */
        , coupons.length === 0 ? React.createElement(Card, { className: "border-dashed border-border bg-slate-50/50 py-12 text-center", glass: true }
            , React.createElement(CardContent, { className: "flex flex-col items-center justify-center space-y-3" }
              , React.createElement(Tag, { className: "h-10 w-10 text-muted-foreground" })
              , React.createElement('p', { className: "text-sm text-muted-foreground font-medium" }, "No coupons set up yet")
              , React.createElement(Button, { size: "sm", onClick: () => setShowAddModal(true), className: "mt-2 text-primary-foreground" }, "Setup Coupon")
            )
          )
        : React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" }
            , coupons.map((coupon) => {
                const isPercent = coupon.discountType === "PERCENTAGE";
                const isExpired = new Date(coupon.validTo) < new Date();
                return React.createElement(Card, { key: coupon.id, className: `glass ${(!coupon.isActive || isExpired) && "opacity-60"}`, glass: true }
                  , React.createElement(CardHeader, { className: "p-4 pb-2" }
                    , React.createElement('div', { className: "flex justify-between items-start" }
                      , React.createElement('div', { className: "flex-1 min-w-0 pr-2" }
                        , React.createElement('div', { className: "flex flex-wrap items-center gap-2" }
                          , React.createElement('span', { className: "font-mono text-sm text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20" }, coupon.code)
                          , React.createElement('span', { className: `text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${coupon.isActive && !isExpired ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-600 border-slate-200"}` }
                            , isExpired ? "Expired" : coupon.isActive ? "Active" : "Disabled"
                          )
                        )
                        , React.createElement('p', { className: "text-xs font-semibold text-foreground mt-1 truncate" }, coupon.title)
                      )
                      , React.createElement(CouponMenu, {
                          coupon,
                          onEdit: () => handleOpenEdit(coupon),
                          onDelete: () => { if (window.confirm(`Delete coupon "${coupon.code}"?`)) deleteMutation.mutate(coupon.id); },
                          onToggle: () => toggleActiveMutation.mutate({ id: coupon.id, isActive: !coupon.isActive }),
                          isExpired
                        })
                    )
                  )
                  , React.createElement(CardContent, { className: "p-4 pt-2 space-y-3" }
                    , React.createElement('div', { className: "grid grid-cols-2 gap-3 text-xs" }
                      , React.createElement('div', { className: "bg-slate-50 p-2.5 rounded-lg border border-border" }
                        , React.createElement('span', { className: "text-muted-foreground block text-[9px] uppercase tracking-wide" }, "Discount")
                        , React.createElement('span', { className: "text-foreground font-extrabold text-sm" }
                          , isPercent ? `${coupon.discountValue}% Off` : `₹${parseFloat(coupon.discountValue).toLocaleString("en-IN")} Off`
                        )
                      )
                      , React.createElement('div', { className: "bg-slate-50 p-2.5 rounded-lg border border-border" }
                        , React.createElement('span', { className: "text-muted-foreground block text-[9px] uppercase tracking-wide" }, "Used")
                        , React.createElement('span', { className: "text-foreground font-extrabold text-sm" }
                          , coupon.totalUsed, coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""
                        )
                      )
                    )
                    , React.createElement('div', { className: "flex justify-between text-[10px] text-muted-foreground" }
                      , React.createElement('span', {}, "From: ", React.createElement('strong', {}, formatDate(coupon.validFrom)))
                      , React.createElement('span', {}, "To: ", React.createElement('strong', {}, formatDate(coupon.validTo)))
                    )
                  )
                );
              })
          )
      )
      
      /* ── Add Modal ── */
      , showAddModal && (
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
        )

      /* ── Edit Modal ── */
      , showEditModal && (
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

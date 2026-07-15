import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getImageUrl } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  Loader2, CheckCircle2, XCircle, Award, Clock, User,
  Phone, Settings2, RefreshCw, Users, MapPin, TrendingUp,
  ChevronDown, Eye, Bell, QrCode, Ticket, Home, ClipboardCheck,
  Settings, Info, ShieldCheck, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import BusinessBottomNav from "@/components/BusinessBottomNav";

function formatTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

export default function BusinessApprovalsPage() {
  const { setShowNotifications, unreadCount, fetchNotifications, fetchPendingApprovals } = useOutletContext() || {};
  const { user } = useAuthStore();
  const businessId = user?.businessId;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [editingRequestId, setEditingRequestId] = useState(null);
  const [deletingRequestId, setDeletingRequestId] = useState(null);
  const [expandedRequestId, setExpandedRequestId] = useState(null);

  // Points-to-stamps purchase amount entry state
  const [selectedAmounts, setSelectedAmounts] = useState({});
  const [customAmounts, setCustomAmounts] = useState({});
  const [showCustomInput, setShowCustomInput] = useState({});

  // Fetch analytics
  const { data: analytics, isLoading: isAnalyticsLoading, isFetching: isAnalyticsFetching } = useQuery({
    queryKey: ["loyaltyApprovalAnalytics", businessId],
    queryFn: () => api.get(`/loyalty-approval/analytics/${businessId}`).then(r => r.data),
    enabled: !!businessId && businessId !== "null" && businessId !== "undefined",
    refetchInterval: 30000,
  });

  // Fetch settings
  const { data: settings, isLoading: isSettingsLoading } = useQuery({
    queryKey: ["loyaltySettings", businessId],
    queryFn: () => api.get(`/loyalty-approval/settings/${businessId}`).then(r => r.data),
    enabled: !!businessId && businessId !== "null" && businessId !== "undefined",
  });

  // Fetch requests
  const { data: requestsData, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["loyaltyRequests", businessId, statusFilter],
    queryFn: () =>
      api.get(`/loyalty-approval/requests/${businessId}?status=${statusFilter}&limit=50`).then(r => r),
    enabled: !!businessId && businessId !== "null" && businessId !== "undefined",
    refetchInterval: statusFilter === "PENDING" ? 20000 : false,
  });

  const requests = requestsData?.data || [];

  const approveWalletMutation = useMutation({
    mutationFn: ({ requestId, purchaseValue }) =>
      api.post(`/loyalty-approval/approve-wallet/${requestId}`, { purchaseValue }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyaltyRequests", businessId] });
      queryClient.invalidateQueries({ queryKey: ["loyaltyApprovalAnalytics", businessId] });
      queryClient.invalidateQueries({ queryKey: ["customerDashboard"] });
      if (fetchPendingApprovals) fetchPendingApprovals();
    },
    onError: (err) => alert(err.message || "Failed to approve request"),
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId) => api.post(`/loyalty-approval/reject/${requestId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyaltyRequests", businessId] });
      queryClient.invalidateQueries({ queryKey: ["loyaltyApprovalAnalytics", businessId] });
      if (fetchPendingApprovals) fetchPendingApprovals();
    },
    onError: (err) => alert(err.message || "Failed to reject request"),
  });

  const undoApproveMutation = useMutation({
    mutationFn: (requestId) => api.delete(`/loyalty-approval/approve-wallet/${requestId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyaltyRequests", businessId] });
      queryClient.invalidateQueries({ queryKey: ["loyaltyApprovalAnalytics", businessId] });
      queryClient.invalidateQueries({ queryKey: ["customerDashboard"] });
      if (fetchPendingApprovals) fetchPendingApprovals();
    },
    onError: (err) => alert(err.message || "Failed to undo approval"),
  });

  async function handleDeleteApproval(requestId) {
    if (!window.confirm("Are you sure you want to undo this approval? The customer will lose these points/stamps.")) return;
    setDeletingRequestId(requestId);
    try {
      await undoApproveMutation.mutateAsync(requestId);
    } finally {
      setDeletingRequestId(null);
    }
  }

  async function handleUpdateApproval(requestId, currentStatus) {
    const customAmt = customAmounts[requestId];
    const selectedAmt = selectedAmounts[requestId];
    const isCustom = showCustomInput[requestId];
    
    let purchaseValue = null;
    if (isCustom) {
      purchaseValue = parseFloat(customAmt);
    } else {
      purchaseValue = selectedAmt;
    }

    if (!purchaseValue || isNaN(purchaseValue) || purchaseValue <= 0) {
      alert("Please select or enter a valid purchase amount.");
      return;
    }

    setApprovingId(requestId);
    try {
      if (currentStatus === "APPROVED") {
        await undoApproveMutation.mutateAsync(requestId);
      }
      await approveWalletMutation.mutateAsync({ requestId, purchaseValue });
      setEditingRequestId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setApprovingId(null);
    }
  }

  async function handleApproveWallet(requestId) {
    const customAmt = customAmounts[requestId];
    const selectedAmt = selectedAmounts[requestId];
    const isCustom = showCustomInput[requestId];
    
    let purchaseValue = null;
    if (isCustom) {
      purchaseValue = parseFloat(customAmt);
    } else {
      purchaseValue = selectedAmt;
    }

    if (!purchaseValue || isNaN(purchaseValue) || purchaseValue <= 0) {
      alert("Please select or enter a valid purchase amount.");
      return;
    }

    setApprovingId(requestId);
    try {
      await approveWalletMutation.mutateAsync({ requestId, purchaseValue });
    } finally {
      setApprovingId(null);
    }
  }

  function selectAmount(requestId, amount) {
    setSelectedAmounts(prev => ({ ...prev, [requestId]: amount }));
    setShowCustomInput(prev => ({ ...prev, [requestId]: false }));
  }

  function selectCustom(requestId) {
    setSelectedAmounts(prev => ({ ...prev, [requestId]: null }));
    setShowCustomInput(prev => ({ ...prev, [requestId]: true }));
  }

  async function handleReject(requestId) {
    if (!window.confirm("Are you sure you want to reject this loyalty request?")) return;
    setRejectingId(requestId);
    try {
      await rejectMutation.mutateAsync(requestId);
    } finally {
      setRejectingId(null);
    }
  }

  if (isLoading || isAnalyticsLoading || isSettingsLoading) {
    return (
      React.createElement("div", { className: "flex min-h-[400px] items-center justify-center" },
        React.createElement(Loader2, { className: "h-8 w-8 animate-spin text-primary" })
      )
    );
  }

  if (!settings || !settings.programName) {
    return (
      React.createElement("div", { className: "max-w-xl" },
        React.createElement("h1", { className: "text-2xl font-bold text-foreground mb-2" }, "Loyalty Approvals"),
        React.createElement(Card, { className: "border-2 border-dashed border-border/60 text-center p-8" },
          React.createElement(Award, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }),
          React.createElement("h2", { className: "text-base font-semibold text-foreground mb-2" }, "Set Up Loyalty Settings First"),
          React.createElement("p", { className: "text-sm text-muted-foreground mb-6" },
            "Before you can approve customer requests, you need to configure your loyalty program settings (Required Stamps, Reward Name, etc.)."
          ),
          React.createElement(Button, { 
            className: "bg-primary text-primary-foreground",
            onClick: () => navigate("/dashboard/business/loyalty-config")
          },
            React.createElement(Settings2, { className: "mr-2 h-4 w-4" }), "Configure Loyalty Settings"
          )
        )
      )
    );
  }

  const getCategoryInfo = (progName) => {
    const name = progName?.toLowerCase() || "";
    if (name.includes("beauty") || name.includes("salon")) {
      return { label: "Beauty Rewards", emoji: "✨", color: "#7C3AED", bg: "#EDE9FE" };
    }
    if (name.includes("food") || name.includes("cafe") || name.includes("restaurant") || name.includes("burger")) {
      return { label: "Food Rewards", emoji: "🍔", color: "#F97316", bg: "#FFEDD5" };
    }
    return { label: "Coffee Rewards", emoji: "☕", color: "#7C3AED", bg: "#EDE9FE" };
  };

  const category = getCategoryInfo(settings?.programName);
  const pendingCount = analytics?.pendingCount ?? 0;
  const approvedToday = analytics?.approvedToday ?? 0;
  const rejectedToday = requests.filter(r => r.status === 'REJECTED').length;
  const totalProcessed = (analytics?.approvedToday ?? 0) + (analytics?.rejectedToday ?? 0) + (analytics?.pendingCount ?? 0);

  return (
    React.createElement("div", { className: "min-h-screen bg-[#F8FAFC] -m-4 md:-m-8 md:m-0 md:bg-transparent" }

      /* A. Mobile Header Bar */
      , React.createElement("div", { className: "flex items-center justify-between px-5 pt-4 pb-2 md:hidden" }
        , React.createElement("div", { className: "flex items-center gap-1.5" }
          , React.createElement("span", { className: "text-lg font-bold tracking-tight" }
            , React.createElement("span", { className: "text-[#0F172A]" }, "Business")
            , React.createElement("span", { className: "text-[#F97316] ml-1" }, "Portal")
          )
        )
        , React.createElement("div", { className: "flex items-center gap-3" }
          , React.createElement("button", {
              onClick: () => {
                if (setShowNotifications) setShowNotifications(true);
                if (fetchNotifications) fetchNotifications();
              },
              className: "relative w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-[#64748B]"
            }
            , React.createElement(Bell, { className: "h-4.5 w-4.5" })
            , unreadCount > 0 && (
                React.createElement('span', { className: "absolute top-0.5 right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center leading-none shadow-sm" }, String(unreadCount))
              )
          )
          , React.createElement("div", { className: "w-9 h-9 rounded-full bg-[#FFEDD5] border border-[#FED7AA] flex items-center justify-center text-[#F97316] text-sm font-bold shadow-sm" }
            , (user?.name?.[0]?.toUpperCase() || "B")
          )
        )
      )

      /* D. Mobile Filter Tabs Row (Now at the top of mobile view) */
      , React.createElement("div", { className: "md:hidden px-4 pt-4" }
        , React.createElement("div", { className: "bg-white rounded-2xl p-1.5 border border-[#F1F5F9] shadow-sm flex gap-1 items-center justify-between" }
          , [
              { key: "ALL", label: "All", badge: pendingCount + approvedToday, badgeBg: "bg-slate-100 text-slate-600", activeBg: "bg-[#F97316] text-white" },
              { key: "PENDING", label: "Pending", badge: pendingCount, badgeBg: "bg-[#FFEDD5] text-[#F97316]", activeBg: "bg-[#F97316] text-white" },
              { key: "APPROVED", label: "Approved", badge: approvedToday, badgeBg: "bg-[#DCFCE7] text-[#22C55E]", activeBg: "bg-[#F97316] text-white" }
            ].map(tab => {
              const isActive = statusFilter === tab.key;
              return React.createElement("button", {
                key: tab.key,
                onClick: () => {
                  setStatusFilter(tab.key);
                },
                className: cn(
                  "flex-1 flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-bold transition-all"
                  , isActive ? "bg-[#F97316] text-white shadow-sm" : "text-[#64748B] hover:text-[#0F172A]"
                )
              }
                , tab.label
                , React.createElement("span", {
                    className: cn("text-[9px] px-1.5 py-0.5 rounded-full font-extrabold"
                      , isActive ? "bg-white text-[#F97316]" : tab.badgeBg
                    )
                  }
                  , tab.badge
                )
              );
            })
          )
      )

      /* E. Mobile Approval Requests List (repeating cards) */
      , React.createElement("div", { className: "md:hidden px-4 mt-4 space-y-4 pb-28" }
        , isLoading && React.createElement("div", { className: "flex justify-center py-12" }
            , React.createElement(Loader2, { className: "h-6 w-6 animate-spin text-[#F97316]" })
          )
        , !isLoading && requests.length === 0 && React.createElement("div", { className: "bg-white rounded-3xl p-8 border border-[#F1F5F9] text-center space-y-3" }
            , React.createElement(Clock, { className: "h-8 w-8 text-[#64748B] mx-auto opacity-40" })
            , React.createElement("p", { className: "text-sm font-bold text-[#0F172A]" }, "No Requests Found")
            , React.createElement("p", { className: "text-xs text-[#64748B]" }, "There are currently no requests in this status category.")
          )
        , !isLoading && requests.map(request => {
            const isApproving = approvingId === request.id;
            const isRejecting = rejectingId === request.id;
            const isExpanded = expandedRequestId === request.id;

            const statusStyles = {
              PENDING: "border-2 border-amber-300 bg-gradient-to-br from-white to-[#FFFBF7] shadow-[0_8px_24px_rgba(249,115,22,0.12)]",
              APPROVED: "border-2 border-emerald-300 bg-gradient-to-br from-white to-[#F0FDF4]/20 shadow-[0_8px_24px_rgba(34,197,94,0.08)]",
              REJECTED: "border-2 border-red-300 bg-gradient-to-br from-white to-[#FEF2F2]/20 shadow-[0_8px_24px_rgba(239,68,68,0.08)]"
            }[request.status] || "border border-[#F1F5F9] bg-white shadow-sm";

            return React.createElement("div", { key: request.id, className: cn("rounded-3xl p-5 border space-y-4 relative transition-all", statusStyles) }
              /* Top Row */
              , React.createElement("div", { className: "flex justify-between items-start" }
                , React.createElement("div", { className: "flex gap-3" }
                  , React.createElement("div", { className: "w-12 h-12 rounded-full bg-[#FFEDD5] border border-[#FED7AA] flex items-center justify-center text-[#F97316] font-bold text-sm overflow-hidden" }
                    , request.customer?.avatarUrl ? (
                        React.createElement("img", { src: getImageUrl(request.customer.avatarUrl), alt: request.customer.name, className: "w-full h-full object-cover" })
                      ) : (
                        (request.customer?.name || "C")[0].toUpperCase()
                      )
                  )
                  , React.createElement("div", { className: "space-y-1" }
                    , React.createElement("p", { className: "font-bold text-sm text-[#0F172A] leading-none" }, request.customer?.name || "Unknown Customer")
                    , React.createElement("div", { className: "flex items-center gap-1 text-[11px] text-[#64748B]" }
                      , React.createElement(Phone, { className: "h-3 w-3" })
                      , request.customer?.phone || "—"
                    )
                  )
                )
                , React.createElement("div", { className: "flex flex-col items-end gap-1.5" }
                  , React.createElement("div", { className: "flex gap-1 items-center" }
                    , React.createElement("span", { className: "text-[9px] font-bold text-[#22C55E]" }, "✓ GPS Verified")
                    , React.createElement("span", { className: "text-[9px] bg-[#DCFCE7] text-[#22C55E] px-1.5 py-0.5 rounded-full font-bold" }, "25m Verified")
                  )
                  , React.createElement("span", { className: "text-[9px] text-[#64748B] flex items-center gap-1 font-medium" }
                    , React.createElement(Clock, { className: "h-3 w-3" })
                    , formatTime(request.createdAt)
                  )
                )
              )

              /* Category Tag & Branch */
              , React.createElement("div", { className: "flex items-center gap-2 flex-wrap" }
                , React.createElement("div", { className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold", style: { backgroundColor: category.bg, color: category.color } }
                  , category.emoji, " ", category.label
                )
                , React.createElement("div", { className: "inline-flex items-center gap-1 text-[10px] text-[#64748B] font-bold bg-[#F8FAFC] border border-[#F1F5F9] px-2 py-1 rounded-full" }
                  , React.createElement(MapPin, { className: "h-3 w-3" }), " Bhubaneswar Branch"
                )
              )

              /* Purchase Amount Box */
              , (request.status === "PENDING" || editingRequestId === request.id)
                ? React.createElement("div", { className: "space-y-3 pt-1" }
                    , React.createElement("div", { className: "border border-[#F1F5F9] rounded-2xl p-4 bg-white space-y-3" }
                      , React.createElement("p", { className: "text-[10px] font-bold text-[#64748B] uppercase tracking-wider" }, "Select Purchase Value:")
                      , React.createElement("div", { className: "flex flex-wrap gap-2" }
                        , [50, 100, 200, 300, 500].map(amt => {
                            const isSelected = selectedAmounts[request.id] === amt && !showCustomInput[request.id];
                            return React.createElement("button", {
                              key: amt,
                              onClick: () => selectAmount(request.id, amt),
                              className: cn(
                                "h-8 px-3 text-xs font-bold rounded-xl border transition-all"
                                , isSelected ? "bg-[#F97316] text-white border-[#F97316] shadow-sm" : "border-[#F1F5F9] text-[#64748B] hover:bg-slate-50"
                              )
                            }, `₹${amt}`);
                          })
                        , React.createElement("button", {
                            onClick: () => selectCustom(request.id),
                            className: cn(
                              "h-8 px-3 text-xs font-bold rounded-xl border transition-all"
                              , showCustomInput[request.id] ? "bg-[#F97316] text-white border-[#F97316] shadow-sm" : "border-[#F1F5F9] text-[#64748B] hover:bg-slate-50"
                            )
                          }, "Custom Amount")
                      )

                      , showCustomInput[request.id] && React.createElement("div", { className: "pt-1" }
                          , React.createElement(Input, {
                              type: "number",
                              min: "1",
                              placeholder: "Enter custom amount in ₹",
                              value: customAmounts[request.id] || "",
                              onChange: (e) => setCustomAmounts(prev => ({ ...prev, [request.id]: e.target.value })),
                              className: "max-w-[200px] h-9 text-xs border-border bg-[#F8FAFC] text-slate-800 rounded-xl"
                            })
                        )

                      , ((showCustomInput[request.id] ? parseFloat(customAmounts[request.id]) : selectedAmounts[request.id]) > 0) && (
                          (() => {
                            const amt = showCustomInput[request.id] ? parseFloat(customAmounts[request.id]) : selectedAmounts[request.id];
                            const ppr = settings?.pointsPerRupee || 0.1;
                            const pps = settings?.pointsPerStamp || 50;
                            const spendPerStamp = Math.max(1, Math.round(pps / ppr));

                            let stampsEarned = 0;
                            let extraPoints = 0;

                            if (amt < spendPerStamp) {
                              stampsEarned = 1;
                              extraPoints = 0;
                            } else {
                              stampsEarned = Math.floor(amt / spendPerStamp);
                              const leftoverRupees = amt % spendPerStamp;
                              extraPoints = Math.floor(leftoverRupees * ppr);
                            }

                            const pointsEarned = Math.floor(amt * ppr);

                            return React.createElement("div", { className: "flex items-center gap-2 text-[10px] text-[#22C55E] bg-[#DCFCE7]/40 border border-[#DCFCE7] rounded-xl px-3 py-2 font-bold" }
                              , React.createElement(CheckCircle2, { className: "h-3.5 w-3.5 shrink-0 text-[#22C55E]" })
                              , `Earns +${pointsEarned} total pts → +${stampsEarned} Stamp(s) and +${extraPoints} extra pts.`
                            );
                          })()
                        )
                    )
                  )
                : React.createElement("div", { className: "border border-[#F1F5F9] rounded-2xl px-4 py-3 bg-[#F8FAFC] flex justify-between items-center text-xs" }
                    , React.createElement("span", { className: "text-[#64748B] font-bold" }, "Purchase Amount")
                    , React.createElement("span", { className: "font-extrabold text-[#0F172A] text-sm" }, `₹${request.spendAmount ?? "0"}`)
                  )

              /* Loyalty Progress Box */
              , React.createElement("div", { className: "bg-[#FFF7ED] rounded-3xl p-4 space-y-3" }
                , React.createElement("div", { className: "flex justify-between items-center" }
                  , React.createElement("span", { className: "text-[10px] font-bold text-[#64748B] uppercase tracking-wider" }, "Loyalty Progress")
                  , React.createElement("div", { className: "text-right" }
                    , React.createElement("p", { className: "text-[#F97316] font-black text-sm leading-none" }, `${request.customerWalletStamps ?? 0} / ${settings?.requiredStamps || 7}`)
                    , React.createElement("p", { className: "text-[9px] text-[#64748B] mt-0.5" }, "Stamps Collected")
                  )
                )
                /* Stamp icons row */
                , React.createElement("div", { className: "flex flex-wrap gap-1.5" }
                  , Array.from({ length: settings?.requiredStamps || 7 }).map((_, i) => {
                      const filled = i < (request.customerWalletStamps ?? 0);
                      return React.createElement("div", {
                        key: i,
                        className: cn(
                          "w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all"
                          , filled ? "bg-[#F97316] border-[#F97316] text-white shadow-md scale-105" : "border-dashed border-slate-300 bg-white text-slate-400"
                        )
                      }
                        , filled
                          ? React.createElement("span", { className: "text-xs font-bold leading-none animate-bounce" }, category.emoji)
                          : React.createElement("span", { className: "text-xs font-bold leading-none text-slate-300" }, i + 1)
                      );
                    })
                )
              )

              /* Action Buttons Row */
              , React.createElement("div", { className: "flex gap-2.5 pt-1" }
                , (request.status === "PENDING" || editingRequestId === request.id)
                  ? React.createElement("div", { className: "flex gap-2 w-full" }
                      , React.createElement("button", {
                          onClick: () => editingRequestId === request.id ? handleUpdateApproval(request.id, request.status) : handleApproveWallet(request.id),
                          disabled: !(showCustomInput[request.id] ? parseFloat(customAmounts[request.id]) : selectedAmounts[request.id]) || isApproving,
                          className: "flex-1 bg-[#22C55E] text-white font-bold rounded-xl text-xs py-2.5 h-10 flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                        }
                        , isApproving ? React.createElement(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : React.createElement(CheckCircle2, { className: "h-3.5 w-3.5" })
                        , isApproving ? "Processing..." : "Approve"
                      )
                      , editingRequestId === request.id && React.createElement("button", {
                          onClick: () => setEditingRequestId(null),
                          className: "px-4 bg-slate-100 text-[#0F172A] font-bold rounded-xl text-xs py-2.5 h-10 flex items-center justify-center active:scale-95 transition-transform"
                        }
                        , "Cancel"
                      )
                    )
                  : React.createElement(React.Fragment, null
                      , React.createElement("button", {
                          onClick: () => {
                            if (isExpanded) {
                              setExpandedRequestId(null);
                            } else {
                              setExpandedRequestId(request.id);
                            }
                          },
                          className: "flex-1 bg-white border border-[#F1F5F9] text-[#64748B] font-bold rounded-xl text-xs py-2.5 h-10 flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                        }
                        , React.createElement(Eye, { className: "h-3.5 w-3.5" })
                        , isExpanded ? "Hide Details" : "View Details"
                      )
                      , request.status === "APPROVED" && editingRequestId !== request.id && React.createElement("button", {
                          onClick: () => {
                            setEditingRequestId(request.id);
                            selectCustom(request.id);
                            setCustomAmounts(prev => ({ ...prev, [request.id]: request.spendAmount || "" }));
                          },
                          disabled: deletingRequestId === request.id,
                          className: "px-4 bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-bold rounded-xl text-xs py-2.5 h-10 active:scale-95 transition-transform"
                        }
                        , "Edit"
                      )
                    )
              )

              /* Expanded View Details */
              , isExpanded && React.createElement("div", { className: "border-t border-[#F1F5F9] pt-3 mt-3 text-xs space-y-2 text-[#64748B] bg-slate-50 -mx-5 -mb-5 p-5 rounded-b-3xl" }
                  , React.createElement("div", { className: "flex justify-between" }
                    , React.createElement("span", null, "Wallet Points Balance:")
                    , React.createElement("span", { className: "font-bold text-[#0F172A]" }, `${request.customerWalletPoints ?? 0} pts`)
                  )
                  , React.createElement("div", { className: "flex justify-between" }
                    , React.createElement("span", null, "Total Registered Visits:")
                    , React.createElement("span", { className: "font-bold text-[#0F172A]" }, `${request.customerTotalVisits ?? 0} visits`)
                  )
                  , request.loyaltyTransaction && React.createElement("div", { className: "flex justify-between" }
                    , React.createElement("span", null, "Points Issued:")
                    , React.createElement("span", { className: "font-bold text-[#22C55E]" }, `+${request.loyaltyTransaction.points} pts`)
                  )
                  , React.createElement("div", { className: "flex justify-between" }
                    , React.createElement("span", null, "Request ID:")
                    , React.createElement("span", { className: "font-mono text-[10px]" }, request.id)
                  )
                )
            );
          })
      )

      

      /* ── DESKTOP VIEW LAYOUT (hidden on mobile) ── */
      , React.createElement("div", { className: "hidden md:block space-y-6 max-w-7xl mx-auto px-6 py-6" }
        /* Header */
        , React.createElement("div", { className: "flex items-center justify-between" }
          , React.createElement("div", null
            , React.createElement("h1", { className: "text-2xl font-bold text-foreground" }, "Loyalty Approvals")
            , React.createElement("p", { className: "text-sm text-muted-foreground mt-0.5" }, "Review and approve customer loyalty requests.")
          )
          , React.createElement("div", { className: "flex items-center gap-2" }
            , React.createElement(Button, { variant: "outline", size: "sm", onClick: () => navigate("/dashboard/business/redemptions") }
              , React.createElement(Award, { className: "mr-2 h-4 w-4 text-[#FF6A00]" }), "Completed Cycles"
            )
            , React.createElement(Button, { variant: "outline", size: "sm", onClick: () => navigate("/dashboard/business/loyalty-config") }
              , React.createElement(Settings2, { className: "mr-2 h-4 w-4" }), "Settings"
            )
            , React.createElement(Button, {
                variant: "outline",
                size: "sm",
                onClick: () => {
                  refetch();
                  queryClient.invalidateQueries({ queryKey: ["loyaltyApprovalAnalytics", businessId] });
                },
                disabled: isFetching || isAnalyticsFetching
              }
              , React.createElement(RefreshCw, { className: cn("h-4 w-4", (isFetching || isAnalyticsFetching) && "animate-spin") })
            )
          )
        )

        /* Analytics cards */
        , React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3" }
          , React.createElement(Card, { className: "border-border/70 bg-white" }
            , React.createElement(CardContent, { className: "p-4" }
              , React.createElement("p", { className: "text-xs text-muted-foreground font-medium uppercase tracking-wider" }, "Pending Requests")
              , React.createElement("p", { className: "text-2xl font-black text-amber-600 mt-1" }, pendingCount)
              , React.createElement("p", { className: "text-[10px] text-muted-foreground mt-0.5" }, "awaiting review")
            )
          )
          , React.createElement(Card, { className: "border-border/70 bg-white" }
            , React.createElement(CardContent, { className: "p-4" }
              , React.createElement("p", { className: "text-xs text-muted-foreground font-medium uppercase tracking-wider" }, "Approved Today")
              , React.createElement("p", { className: "text-2xl font-black text-emerald-600 mt-1" }, approvedToday)
              , React.createElement("p", { className: "text-[10px] text-muted-foreground mt-0.5" }, "customers rewarded")
            )
          )
        )

        /* Status Tabs */
        , React.createElement("div", { className: "flex items-center gap-2 border-b border-border pb-1" }
          , ["ALL", "PENDING", "APPROVED"].map(s => React.createElement("button", {
              key: s,
              onClick: () => setStatusFilter(s),
              className: cn(
                "px-4 py-1.5 rounded-full text-xs font-bold transition-colors"
                , statusFilter === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )
            }, s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()))
        )

        /* Desktop List */
        , !isLoading && requests.length === 0 && React.createElement("div", { className: "flex flex-col items-center justify-center py-16 text-center space-y-3" }
            , React.createElement("div", { className: "h-16 w-16 rounded-full bg-muted flex items-center justify-center" }
              , React.createElement(Clock, { className: "h-8 w-8 text-muted-foreground" })
            )
            , React.createElement("h3", { className: "text-base font-semibold text-[#0F172A]" }, "No Requests")
            , React.createElement("p", { className: "text-sm text-muted-foreground max-w-sm" }, "Processed and pending requests will show here.")
          )
        , !isLoading && requests.length > 0 && React.createElement("div", { className: "space-y-4" }
            , requests.map(request => {
                const isApproving = approvingId === request.id;
                const isRejecting = rejectingId === request.id;

                return React.createElement(Card, {
                  key: request.id,
                  className: cn(
                    "border-2 transition-all bg-white shadow-md"
                    , request.status === "PENDING" ? "border-amber-300 bg-amber-50/5 shadow-[0_8px_24px_rgba(245,158,11,0.08)]" : request.status === "APPROVED" ? "border-emerald-300 bg-emerald-50/5 shadow-[0_8px_24px_rgba(34,197,94,0.06)]" : "border-red-300 bg-red-50/5 shadow-[0_8px_24px_rgba(239,68,68,0.06)]"
                  )
                }
                  , React.createElement(CardContent, { className: "p-5 space-y-4" }
                    , React.createElement("div", { className: "flex items-start justify-between gap-4" }
                      , React.createElement("div", { className: "flex items-center gap-3 min-w-0" }
                        , React.createElement("div", { className: "h-10 w-10 rounded-full bg-primary/10 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden" }
                          , request.customer?.avatarUrl ? (
                              React.createElement("img", { src: getImageUrl(request.customer.avatarUrl), alt: request.customer.name, className: "w-full h-full object-cover" })
                            ) : (
                              React.createElement(User, { className: "h-5 w-5 text-primary" })
                            )
                        )
                        , React.createElement("div", { className: "min-w-0" }
                          , React.createElement("p", { className: "font-bold text-sm text-foreground truncate" }, request.customer?.name || "Unknown")
                          , React.createElement("div", { className: "flex items-center gap-1 text-xs text-muted-foreground" }
                            , React.createElement(Phone, { className: "h-3 w-3" }), request.customer?.phone
                          )
                        )
                      )
                      , React.createElement("div", { className: "text-right shrink-0" }
                        , React.createElement("div", {
                            className: cn(
                              "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full inline-block"
                              , request.status === "PENDING" ? "bg-amber-100 text-amber-700" : request.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                            )
                          }, request.status)
                        , React.createElement("p", { className: "text-[10px] text-muted-foreground mt-1" }, formatTime(request.createdAt))
                      )
                    )

                    , React.createElement("div", { className: "flex items-center justify-between gap-3 bg-muted/40 rounded-lg px-3 py-2.5 text-xs" }
                      , React.createElement("div", { className: "flex flex-wrap items-center gap-3" }
                        , React.createElement("div", { className: "flex flex-col" }
                          , React.createElement("p", { className: "text-muted-foreground" }, "Stamps")
                          , React.createElement("p", { className: "font-bold text-foreground" }, `${request.customerWalletStamps ?? 0} / ${settings?.requiredStamps || 7}`)
                        )
                        , React.createElement("div", { className: "h-4 w-px bg-border" })
                        , React.createElement("div", { className: "flex flex-col" }
                          , React.createElement("p", { className: "text-muted-foreground" }, "Points")
                          , React.createElement("p", { className: "font-bold text-foreground" }, request.customerWalletPoints ?? 0)
                        )
                        , React.createElement("div", { className: "h-4 w-px bg-border" })
                        , React.createElement("div", { className: "flex flex-col" }
                          , React.createElement("p", { className: "text-muted-foreground" }, "Total Visits")
                          , React.createElement("p", { className: "font-bold text-foreground" }, request.customerTotalVisits ?? 0)
                        )
                        , request.status === "APPROVED" && request.spendAmount !== null && React.createElement(React.Fragment, null
                            , React.createElement("div", { className: "h-4 w-px bg-border" })
                            , React.createElement("div", { className: "flex flex-col" }
                              , React.createElement("p", { className: "text-muted-foreground" }, "Purchase")
                              , React.createElement("p", { className: "font-bold text-emerald-700" }, `₹${request.spendAmount}`)
                            )
                          )
                      )
                      , request.status === "APPROVED" && editingRequestId !== request.id && React.createElement(Button, {
                          variant: "outline",
                          size: "sm",
                          className: "h-8 bg-white border-border shrink-0",
                          onClick: () => {
                            setEditingRequestId(request.id);
                            selectCustom(request.id);
                            setCustomAmounts(prev => ({ ...prev, [request.id]: request.spendAmount || "" }));
                          },
                          disabled: deletingRequestId === request.id
                        }, "Edit")
                    )

                    , (request.status === "PENDING" || editingRequestId === request.id) && React.createElement("div", { className: "space-y-3 pt-2 border-t border-border/50 mt-2" }
                        , React.createElement("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider" }, "Select Purchase Value:")
                        , React.createElement("div", { className: "flex flex-wrap gap-2" }
                          , [50, 100, 200, 300, 500].map(amt => {
                              const isSelected = selectedAmounts[request.id] === amt && !showCustomInput[request.id];
                              return React.createElement(Button, {
                                key: amt,
                                type: "button",
                                variant: isSelected ? "default" : "outline",
                                className: cn("h-8 text-xs font-bold rounded-xl", isSelected ? "bg-primary text-primary-foreground" : "border-border text-muted-foreground"),
                                onClick: () => selectAmount(request.id, amt)
                              }, `₹${amt}`);
                            })
                          , React.createElement(Button, {
                              type: "button",
                              variant: showCustomInput[request.id] ? "default" : "outline",
                              className: cn("h-8 text-xs font-bold rounded-xl", showCustomInput[request.id] ? "bg-primary text-primary-foreground" : "border-border text-muted-foreground"),
                              onClick: () => selectCustom(request.id)
                            }, "Custom")
                        )
                        , showCustomInput[request.id] && React.createElement("div", { className: "pt-1" }
                            , React.createElement(Input, {
                                type: "number",
                                min: "1",
                                placeholder: "Enter amount",
                                value: customAmounts[request.id] || "",
                                onChange: (e) => setCustomAmounts(prev => ({ ...prev, [request.id]: e.target.value })),
                                className: "max-w-[200px] h-9 text-xs border-border bg-white"
                              })
                          )
                        , React.createElement("div", { className: "flex items-center gap-3 pt-1" }
                          , React.createElement(Button, {
                              className: "flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs rounded-xl",
                              onClick: () => editingRequestId === request.id ? handleUpdateApproval(request.id, request.status) : handleApproveWallet(request.id),
                              disabled: !(showCustomInput[request.id] ? parseFloat(customAmounts[request.id]) : selectedAmounts[request.id]) || isApproving
                            }
                            , isApproving ? "Processing..." : "Approve"
                          )
                          , editingRequestId === request.id && React.createElement(Button, {
                              variant: "outline",
                              className: "border-slate-200 text-slate-700 hover:bg-slate-100 h-9 text-xs rounded-xl",
                              onClick: () => setEditingRequestId(null)
                            }
                            , "Cancel"
                          )
                        )
                      )
                  )
                );
              })
          )
      )
    )
  );
}

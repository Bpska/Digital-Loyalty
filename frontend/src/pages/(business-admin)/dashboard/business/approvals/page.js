import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  Loader2, CheckCircle2, XCircle, Award, Clock, User,
  Phone, Settings2, RefreshCw
} from "lucide-react";

function formatTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

export default function BusinessApprovalsPage() {
  const { user } = useAuthStore();
  const businessId = user?.businessId;
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [editingRequestId, setEditingRequestId] = useState(null);
  const [deletingRequestId, setDeletingRequestId] = useState(null);

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
    },
    onError: (err) => alert(err.message || "Failed to approve request"),
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId) => api.post(`/loyalty-approval/reject/${requestId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyaltyRequests", businessId] });
      queryClient.invalidateQueries({ queryKey: ["loyaltyApprovalAnalytics", businessId] });
    },
    onError: (err) => alert(err.message || "Failed to reject request"),
  });

  const undoApproveMutation = useMutation({
    mutationFn: (requestId) => api.delete(`/loyalty-approval/approve-wallet/${requestId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyaltyRequests", businessId] });
      queryClient.invalidateQueries({ queryKey: ["loyaltyApprovalAnalytics", businessId] });
      queryClient.invalidateQueries({ queryKey: ["customerDashboard"] });
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

  async function handleUpdateApproval(requestId) {
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
      await undoApproveMutation.mutateAsync(requestId);
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
          React.createElement(Link, { to: "/dashboard/business/loyalty-config" },
            React.createElement(Button, { className: "bg-primary text-primary-foreground" },
              React.createElement(Settings2, { className: "mr-2 h-4 w-4" }), "Configure Loyalty Settings"
            )
          )
        )
      )
    );
  }

  return (
    React.createElement("div", { className: "space-y-6" },

      /* Header */
      React.createElement("div", { className: "flex items-center justify-between" },
        React.createElement("div", null,
          React.createElement("h1", { className: "text-2xl font-bold text-foreground" }, "Loyalty Approvals"),
          React.createElement("p", { className: "text-sm text-muted-foreground mt-0.5" },
            "Review and approve customer loyalty requests."
          )
        ),
        React.createElement("div", { className: "flex items-center gap-2" },
          React.createElement(Link, { to: "/dashboard/business/loyalty-config" },
            React.createElement(Button, { variant: "outline", size: "sm" },
              React.createElement(Settings2, { className: "mr-2 h-4 w-4" }), "Settings"
            )
          ),
          React.createElement(Button, { 
            variant: "outline", 
            size: "sm", 
            onClick: () => {
              refetch();
              queryClient.invalidateQueries({ queryKey: ["loyaltyApprovalAnalytics", businessId] });
            },
            disabled: isFetching || isAnalyticsFetching
          },
            React.createElement(RefreshCw, { className: `h-4 w-4 ${isFetching || isAnalyticsFetching ? "animate-spin" : ""}` })
          )
        )
      ),

      /* Analytics Strip */
      React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3" },
        React.createElement(Card, { className: "border-border/70" },
          React.createElement(CardContent, { className: "p-4" },
            React.createElement("p", { className: "text-xs text-muted-foreground font-medium uppercase tracking-wider" }, "Pending Requests"),
            React.createElement("p", { className: "text-2xl font-black text-amber-600 mt-1" }, analytics?.pendingCount ?? "—"),
            React.createElement("p", { className: "text-[10px] text-muted-foreground mt-0.5" }, "awaiting review")
          )
        ),
        React.createElement(Card, { className: "border-border/70" },
          React.createElement(CardContent, { className: "p-4" },
            React.createElement("p", { className: "text-xs text-muted-foreground font-medium uppercase tracking-wider" }, "Approved Today"),
            React.createElement("p", { className: "text-2xl font-black text-emerald-600 mt-1" }, analytics?.approvedToday ?? "—"),
            React.createElement("p", { className: "text-[10px] text-muted-foreground mt-0.5" }, "customers rewarded")
          )
        )
      ),

      /* Status Filter Tabs */
      React.createElement("div", { className: "flex items-center gap-2 border-b border-border pb-1" },
        ["PENDING", "APPROVED", "REJECTED"].map(s =>
          React.createElement("button", {
            key: s,
            className: `px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
              statusFilter === s
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`,
            onClick: () => setStatusFilter(s),
          }, s.charAt(0) + s.slice(1).toLowerCase())
        )
      ),

      /* Requests List */
      !isLoading && requests.length === 0 && (
        React.createElement("div", { className: "flex flex-col items-center justify-center py-16 text-center space-y-3" },
          React.createElement("div", { className: "h-16 w-16 rounded-full bg-muted flex items-center justify-center" },
            React.createElement(Clock, { className: "h-8 w-8 text-muted-foreground" })
          ),
          React.createElement("h3", { className: "text-base font-semibold text-foreground" },
            statusFilter === "PENDING" ? "No Pending Requests" :
            statusFilter === "APPROVED" ? "No Approved Requests Yet" : "No Rejected Requests"
          ),
          React.createElement("p", { className: "text-sm text-muted-foreground max-w-sm" },
            statusFilter === "PENDING"
              ? "When customers scan your QR code and submit a loyalty request, they will appear here."
              : "Requests that have been processed will show here."
          )
        )
      ),

      !isLoading && requests.length > 0 && (
        React.createElement("div", { className: "space-y-4" },
          requests.map((request) => {
            const isApproving = approvingId === request.id;
            const isRejecting = rejectingId === request.id;

            return React.createElement(Card, {
              key: request.id,
              className: `border transition-all ${
                request.status === "PENDING" ? "border-amber-200 bg-amber-50/20" :
                request.status === "APPROVED" ? "border-emerald-200 bg-emerald-50/10" :
                "border-red-200 bg-red-50/10"
              }`,
            },
              React.createElement(CardContent, { className: "p-5 space-y-4" },

                /* Customer Info Row */
                React.createElement("div", { className: "flex items-start justify-between gap-4" },
                  React.createElement("div", { className: "flex items-center gap-3 min-w-0" },
                    React.createElement("div", { className: "h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0" },
                      React.createElement(User, { className: "h-5 w-5 text-primary" })
                    ),
                    React.createElement("div", { className: "min-w-0" },
                      React.createElement("p", { className: "font-bold text-sm text-foreground truncate" },
                        request.customer?.name || "Unknown"
                      ),
                      React.createElement("div", { className: "flex items-center gap-1 text-xs text-muted-foreground" },
                        React.createElement(Phone, { className: "h-3 w-3" }),
                        request.customer?.phone || "—"
                      )
                    )
                  ),
                  React.createElement("div", { className: "text-right shrink-0" },
                    React.createElement("div", { className: `text-[10px] font-bold uppercase px-2 py-0.5 rounded-full inline-block ${
                      request.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                      request.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" :
                      "bg-red-100 text-red-700"
                    }` }, request.status),
                    React.createElement("p", { className: "text-[10px] text-muted-foreground mt-1" },
                      formatTime(request.status === "PENDING" ? request.createdAt : (request.updatedAt || request.createdAt))
                    )
                  )
                ),

                /* Stats Row — uses actual wallet data for accuracy */
                React.createElement("div", { className: "flex flex-wrap items-center gap-3 bg-muted/40 rounded-lg px-3 py-2.5 text-xs" },

                  // Stamps — from UserWallet (real stamp count)
                  React.createElement("div", { className: "flex flex-col" },
                    React.createElement("p", { className: "text-muted-foreground" }, "Stamps"),
                    React.createElement("p", { className: "font-bold text-foreground" },
                      `${request.customerWalletStamps ?? 0} / ${settings?.requiredStamps || 7}`
                    )
                  ),

                  React.createElement("div", { className: "h-4 w-px bg-border" }),

                  // Points — from UserWallet (points toward next stamp)
                  React.createElement("div", { className: "flex flex-col" },
                    React.createElement("p", { className: "text-muted-foreground" }, "Points"),
                    React.createElement("p", { className: "font-bold text-foreground" }, request.customerWalletPoints ?? 0)
                  ),

                  React.createElement("div", { className: "h-4 w-px bg-border" }),

                  // Total Visits
                  React.createElement("div", { className: "flex flex-col" },
                    React.createElement("p", { className: "text-muted-foreground" }, "Total Visits"),
                    React.createElement("p", { className: "font-bold text-foreground" }, request.customerTotalVisits ?? 0)
                  ),

                  // Show transaction details for APPROVED requests
                  request.status === "APPROVED" && request.spendAmount !== null && (
                    React.createElement("div", { className: "flex flex-wrap items-center gap-3 w-full" },
                      React.createElement("div", { className: "h-4 w-px bg-border hidden sm:block" }),
                      React.createElement("div", { className: "flex flex-col" },
                        React.createElement("p", { className: "text-muted-foreground" }, "Purchase"),
                        React.createElement("p", { className: "font-bold text-emerald-700" }, `₹${request.spendAmount}`)
                      ),
                      React.createElement("div", { className: "h-4 w-px bg-border" }),
                      React.createElement("div", { className: "flex flex-col" },
                        React.createElement("p", { className: "text-muted-foreground" }, "Pts Earned"),
                        React.createElement("p", { className: "font-bold text-emerald-700" },
                          `+${request.loyaltyTransaction?.points ?? 0} pts`
                        )
                      ),
                      React.createElement("div", { className: "h-4 w-px bg-border" }),
                      React.createElement("div", { className: "flex flex-col" },
                        React.createElement("p", { className: "text-muted-foreground" }, "Stamps"),
                        React.createElement("p", { className: "font-bold text-emerald-700" },
                          `+${Math.floor((request.loyaltyTransaction?.points ?? 0) / (settings?.pointsPerStamp || 50))} stamp(s)`
                        )
                      ),
                      // Action buttons for APPROVED
                      editingRequestId !== request.id && (
                        React.createElement("div", { className: "flex items-center gap-2 ml-auto" },
                          React.createElement(Button, {
                            variant: "outline",
                            size: "sm",
                            className: "h-7 text-xs font-medium text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
                            onClick: () => {
                              setEditingRequestId(request.id);
                              selectCustom(request.id);
                              setCustomAmounts(prev => ({ ...prev, [request.id]: request.spendAmount }));
                            },
                            disabled: deletingRequestId === request.id
                          }, "Edit"),
                          React.createElement(Button, {
                            variant: "outline",
                            size: "sm",
                            className: "h-7 text-xs font-medium text-red-600 bg-red-50 border-red-200 hover:bg-red-100",
                            onClick: () => handleDeleteApproval(request.id),
                            disabled: deletingRequestId === request.id
                          }, 
                            deletingRequestId === request.id ? React.createElement(Loader2, { className: "h-3 w-3 animate-spin mr-1" }) : null,
                            "Undo"
                          )
                        )
                      )
                    )
                  )
                ),

                /* Input Entry + Actions (PENDING or EDITING) */
                (request.status === "PENDING" || editingRequestId === request.id) && (
                  React.createElement("div", { className: "space-y-3 pt-2 border-t border-border/50 mt-2" },
                    React.createElement("div", { className: "space-y-3" },
                      React.createElement("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider" }, "Select Purchase Value:"),
                      
                      /* Amount Buttons */
                      React.createElement("div", { className: "flex flex-wrap gap-2" },
                        [50, 100, 200, 300, 500].map(amt => {
                          const isSelected = selectedAmounts[request.id] === amt && !showCustomInput[request.id];
                          return React.createElement(Button, {
                            key: amt,
                            type: "button",
                            variant: isSelected ? "default" : "outline",
                            className: `h-8 text-xs font-bold rounded-xl ${isSelected ? "bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-muted"}`,
                            onClick: () => selectAmount(request.id, amt),
                          }, `₹${amt}`);
                        }),
                        React.createElement(Button, {
                          type: "button",
                          variant: showCustomInput[request.id] ? "default" : "outline",
                          className: `h-8 text-xs font-bold rounded-xl ${showCustomInput[request.id] ? "bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-muted"}`,
                          onClick: () => selectCustom(request.id),
                        }, "Custom Amount")
                      ),

                      /* Custom Input */
                      showCustomInput[request.id] && React.createElement("div", { className: "pt-1" },
                        React.createElement(Input, {
                          type: "number",
                          min: "1",
                          placeholder: "Enter custom amount in ₹",
                          value: customAmounts[request.id] || "",
                          onChange: (e) => setCustomAmounts(prev => ({ ...prev, [request.id]: e.target.value })),
                          className: "max-w-[200px] h-9 text-xs border-border bg-white text-slate-800"
                        })
                      ),

                      /* Auto Calculation Stamps Preview */
                      ((showCustomInput[request.id] ? parseFloat(customAmounts[request.id]) : selectedAmounts[request.id]) > 0) && (
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

                          return React.createElement("div", { className: "space-y-1.5" },
                            React.createElement("div", { className: "flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 font-medium" },
                              React.createElement(CheckCircle2, { className: "h-3.5 w-3.5 shrink-0" }),
                              `This purchase earns +${pointsEarned} total pts → +${stampsEarned} Stamp(s) and +${extraPoints} extra pts.`
                            )
                          );
                        })()
                      ),

                      /* Action Buttons */
                      React.createElement("div", { className: "flex items-center gap-3 pt-1" },
                        React.createElement(Button, {
                          className: "flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs rounded-xl",
                          onClick: () => editingRequestId === request.id ? handleUpdateApproval(request.id) : handleApproveWallet(request.id),
                          disabled: !(showCustomInput[request.id] ? parseFloat(customAmounts[request.id]) : selectedAmounts[request.id]) || isApproving || isRejecting,
                        },
                          isApproving
                            ? React.createElement(Loader2, { className: "mr-2 h-4 w-4 animate-spin" })
                            : React.createElement(CheckCircle2, { className: "mr-2 h-4 w-4" }),
                          isApproving ? (editingRequestId === request.id ? "Updating..." : "Approving...") : (editingRequestId === request.id ? "Update" : "Approve")
                        ),
                        React.createElement(Button, {
                          variant: "outline",
                          className: "border-red-300 text-red-600 hover:bg-red-50 h-9 text-xs rounded-xl flex-1",
                          onClick: () => editingRequestId === request.id ? setEditingRequestId(null) : handleReject(request.id),
                          disabled: isApproving || isRejecting,
                        },
                          isRejecting && editingRequestId !== request.id
                            ? React.createElement(Loader2, { className: "mr-2 h-4 w-4 animate-spin" })
                            : React.createElement(XCircle, { className: "mr-2 h-4 w-4" }),
                          editingRequestId === request.id ? "Cancel Edit" : "Reject"
                        )
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
  );
}

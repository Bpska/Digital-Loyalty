import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Loader2, CheckCircle2, XCircle, Award, Clock, User,
  Phone, Star, TrendingUp, Settings2, RefreshCw, ChevronDown
} from "lucide-react";

function formatTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function getLevelColor(name) {
  const n = name?.toLowerCase();
  if (n?.includes("bronze")) return { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-300", dot: "#CD7F32" };
  if (n?.includes("silver")) return { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300", dot: "#94a3b8" };
  if (n?.includes("gold")) return { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300", dot: "#EAB308" };
  if (n?.includes("platinum")) return { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-300", dot: "#818cf8" };
  return { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30", dot: "#6366f1" };
}

export default function BusinessApprovalsPage() {
  const { user } = useAuthStore();
  const businessId = user?.businessId;
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [approvingId, setApprovingId] = useState(null);
  const [selectedLevels, setSelectedLevels] = useState({});
  const [rejectingId, setRejectingId] = useState(null);

  // Fetch analytics
  const { data: analytics } = useQuery({
    queryKey: ["loyaltyApprovalAnalytics", businessId],
    queryFn: () => api.get(`/loyalty-approval/analytics/${businessId}`).then(r => r.data),
    enabled: !!businessId,
    refetchInterval: 30000,
  });

  // Fetch requests
  const { data: requestsData, isLoading, refetch } = useQuery({
    queryKey: ["loyaltyRequests", businessId, statusFilter],
    queryFn: () =>
      api.get(`/loyalty-approval/requests/${businessId}?status=${statusFilter}&limit=50`).then(r => r),
    enabled: !!businessId,
    refetchInterval: statusFilter === "PENDING" ? 20000 : false,
  });

  const requests = requestsData?.data || [];
  const levels = analytics?.levels || [];

  const approveMutation = useMutation({
    mutationFn: ({ requestId, levelId }) =>
      api.post(`/loyalty-approval/approve/${requestId}`, { levelId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyaltyRequests", businessId] });
      queryClient.invalidateQueries({ queryKey: ["loyaltyApprovalAnalytics", businessId] });
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

  async function handleApprove(request) {
    const levelId = selectedLevels[request.id];
    if (!levelId) {
      alert("Please select a loyalty level before approving.");
      return;
    }
    setApprovingId(request.id);
    try {
      await approveMutation.mutateAsync({ requestId: request.id, levelId });
    } finally {
      setApprovingId(null);
    }
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

  function selectLevel(requestId, levelId) {
    setSelectedLevels(prev => ({ ...prev, [requestId]: levelId }));
  }

  if (levels.length === 0 && !isLoading) {
    return (
      React.createElement("div", { className: "max-w-xl" },
        React.createElement("h1", { className: "text-2xl font-bold text-foreground mb-2" }, "Loyalty Approvals"),
        React.createElement(Card, { className: "border-2 border-dashed border-border/60 text-center p-8" },
          React.createElement(Award, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }),
          React.createElement("h2", { className: "text-base font-semibold text-foreground mb-2" }, "Set Up Loyalty Levels First"),
          React.createElement("p", { className: "text-sm text-muted-foreground mb-6" },
            "Before you can approve customer requests, you need to configure your loyalty levels (e.g. Bronze, Gold, Platinum) with their point values."
          ),
          React.createElement(Link, { to: "/dashboard/business/loyalty-config" },
            React.createElement(Button, { className: "bg-primary text-primary-foreground" },
              React.createElement(Settings2, { className: "mr-2 h-4 w-4" }), "Configure Loyalty Levels"
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
              React.createElement(Settings2, { className: "mr-2 h-4 w-4" }), "Levels"
            )
          ),
          React.createElement(Button, { variant: "outline", size: "sm", onClick: () => refetch() },
            React.createElement(RefreshCw, { className: "h-4 w-4" })
          )
        )
      ),

      /* Analytics Strip */
      React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3" },
        React.createElement(Card, { className: "border-border/70" },
          React.createElement(CardContent, { className: "p-4" },
            React.createElement("p", { className: "text-xs text-muted-foreground font-medium uppercase tracking-wider" }, "Pending"),
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
        ),
        React.createElement(Card, { className: "border-border/70" },
          React.createElement(CardContent, { className: "p-4" },
            React.createElement("p", { className: "text-xs text-muted-foreground font-medium uppercase tracking-wider" }, "Points Issued Today"),
            React.createElement("p", { className: "text-2xl font-black text-primary mt-1" }, analytics?.pointsIssuedToday ?? "—"),
            React.createElement("p", { className: "text-[10px] text-muted-foreground mt-0.5" }, "total points given")
          )
        ),
        React.createElement(Card, { className: "border-border/70" },
          React.createElement(CardContent, { className: "p-4" },
            React.createElement("p", { className: "text-xs text-muted-foreground font-medium uppercase tracking-wider" }, "Top Level Today"),
            React.createElement("p", { className: "text-sm font-black text-foreground mt-1 truncate" },
              analytics?.mostUsedLevel?.name ?? "—"
            ),
            React.createElement("p", { className: "text-[10px] text-muted-foreground mt-0.5" },
              analytics?.mostUsedLevel ? `+${analytics.mostUsedLevel.points} pts` : "no data yet"
            )
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

      /* Loading */
      isLoading && (
        React.createElement("div", { className: "flex items-center justify-center py-12" },
          React.createElement(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" })
        )
      ),

      /* Empty State */
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

      /* Requests List */
      !isLoading && requests.length > 0 && (
        React.createElement("div", { className: "space-y-4" },
          requests.map((request) => {
            const isApproving = approvingId === request.id;
            const isRejecting = rejectingId === request.id;
            const selectedLevelId = selectedLevels[request.id];
            const selectedLevel = levels.find(l => l.id === selectedLevelId);

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
                      formatTime(request.createdAt)
                    )
                  )
                ),

                /* Stats Row */
                React.createElement("div", { className: "flex items-center gap-4 bg-muted/40 rounded-lg px-3 py-2 text-xs" },
                  React.createElement("div", null,
                    React.createElement("p", { className: "text-muted-foreground" }, "Current Points"),
                    React.createElement("p", { className: "font-bold text-foreground" }, request.customerCurrentPoints ?? 0)
                  ),
                  React.createElement("div", { className: "h-4 w-px bg-border" }),
                  React.createElement("div", null,
                    React.createElement("p", { className: "text-muted-foreground" }, "Total Visits"),
                    React.createElement("p", { className: "font-bold text-foreground" }, request.customerTotalVisits ?? 0)
                  ),
                  request.status === "APPROVED" && request.level && (
                    React.createElement(React.Fragment, null,
                      React.createElement("div", { className: "h-4 w-px bg-border" }),
                      React.createElement("div", null,
                        React.createElement("p", { className: "text-muted-foreground" }, "Level Awarded"),
                        React.createElement("p", { className: "font-bold text-emerald-700" }, `${request.level.name} (+${request.level.points} pts)`)
                      )
                    )
                  )
                ),

                /* Level Selection + Actions (only for PENDING) */
                request.status === "PENDING" && (
                  React.createElement("div", { className: "space-y-3" },
                    React.createElement("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider" }, "Select Loyalty Level:"),

                    /* Level Buttons */
                    React.createElement("div", { className: "flex flex-wrap gap-2" },
                      levels.map((level) => {
                        const colors = getLevelColor(level.name);
                        const isSelected = selectedLevelId === level.id;
                        return React.createElement("button", {
                          key: level.id,
                          className: `flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
                            isSelected
                              ? `${colors.bg} ${colors.text} ${colors.border} shadow-sm ring-2 ring-offset-1 ring-current`
                              : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-muted/60"
                          }`,
                          onClick: () => selectLevel(request.id, level.id),
                        },
                          React.createElement(Star, { className: "h-3 w-3" }),
                          `${level.name} (+${level.points} pt${level.points !== 1 ? "s" : ""})`
                        );
                      })
                    ),

                    /* Selected level preview */
                    selectedLevel && (
                      React.createElement("div", { className: "flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2" },
                        React.createElement(CheckCircle2, { className: "h-3.5 w-3.5 shrink-0" }),
                        `Approving will add ${selectedLevel.points} point${selectedLevel.points !== 1 ? "s" : ""} to ${request.customer?.name?.split(" ")[0] || "customer"}'s balance.`
                      )
                    ),

                    /* Action Buttons */
                    React.createElement("div", { className: "flex items-center gap-3 pt-1" },
                      React.createElement(Button, {
                        className: "flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold",
                        onClick: () => handleApprove(request),
                        disabled: !selectedLevelId || isApproving || isRejecting,
                      },
                        isApproving
                          ? React.createElement(Loader2, { className: "mr-2 h-4 w-4 animate-spin" })
                          : React.createElement(CheckCircle2, { className: "mr-2 h-4 w-4" }),
                        isApproving ? "Approving..." : "Approve"
                      ),
                      React.createElement(Button, {
                        variant: "outline",
                        className: "border-red-300 text-red-600 hover:bg-red-50",
                        onClick: () => handleReject(request.id),
                        disabled: isApproving || isRejecting,
                      },
                        isRejecting
                          ? React.createElement(Loader2, { className: "mr-2 h-4 w-4 animate-spin" })
                          : React.createElement(XCircle, { className: "mr-2 h-4 w-4" }),
                        "Reject"
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

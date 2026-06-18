import { Link } from "react-router-dom";
"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  UserCheck,
  XCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
  RefreshCcw,
  Search,
  Calendar,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminCheckinsPage() {
  const { user } = useAuthStore();
  const businessId = user?.businessId;
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const limit = 20;

  const {
    data: checkinsResponse,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["adminCheckins", businessId, page],
    queryFn: () =>
      api
        .get(`/checkins/business/${businessId}?page=${page}&limit=${limit}`)
        .then((res) => res),
    enabled: !!businessId,
    keepPreviousData: true,
  });

  const checkins = checkinsResponse?.data || [];
  const pagination = checkinsResponse?.pagination;

  const handleCancelConfirm = async (checkInId) => {
    setCancellingId(checkInId);
    setConfirmId(null);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const result = await api.post(`/checkins/${checkInId}/cancel`);
      setSuccessMsg(result?.data?.message || "Check-in cancelled successfully. Points deducted.");
      queryClient.invalidateQueries({ queryKey: ["adminCheckins"] });
      queryClient.invalidateQueries({ queryKey: ["businessAnalytics"] });
      queryClient.invalidateQueries({ queryKey: ["businessCheckins"] });
      refetch();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err.message || "Failed to cancel check-in.");
    } finally {
      setCancellingId(null);
    }
  };

  const statusBadge = (status) => {
    const styles = {
      VALID: "bg-emerald-50 text-emerald-700 border-emerald-200",
      REJECTED: "bg-red-50 text-red-700 border-red-200",
      SUSPICIOUS: "bg-amber-50 text-amber-700 border-amber-200",
    };
    const icons = {
      VALID: React.createElement(CheckCircle, { className: "h-3 w-3 mr-1" }),
      REJECTED: React.createElement(XCircle, { className: "h-3 w-3 mr-1" }),
      SUSPICIOUS: React.createElement(AlertTriangle, { className: "h-3 w-3 mr-1" }),
    };
    return React.createElement(
      "span",
      {
        className: `inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${
          styles[status] || "bg-slate-50 text-slate-600 border-slate-200"
        }`,
      },
      icons[status] || null,
      status
    );
  };

  return React.createElement(
    "div",
    { className: "space-y-6" },

    /* ── Header ── */
    React.createElement(
      "div",
      { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4" },
      React.createElement(
        "div",
        { className: "flex items-center gap-3" },
        React.createElement(
          Link,
          { to: "/dashboard/business" },
          React.createElement(
            Button,
            { variant: "ghost", size: "sm", className: "p-2" },
            React.createElement(ArrowLeft, { className: "h-4 w-4" })
          )
        ),
        React.createElement(
          "div",
          null,
          React.createElement(
            "h1",
            { className: "text-2xl font-extrabold text-foreground tracking-tight" },
            "Customer Check-ins"
          ),
          React.createElement(
            "p",
            { className: "text-xs text-muted-foreground mt-0.5" },
            "View and manage all loyalty check-ins. Cancel check-ins to revoke points."
          )
        )
      ),
      React.createElement(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: () => refetch(),
          disabled: isFetching,
        },
        React.createElement(RefreshCcw, {
          className: `mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`,
        }),
        isFetching ? "Refreshing..." : "Refresh"
      )
    ),

    /* ── Success / Error Banner ── */
    successMsg &&
      React.createElement(
        "div",
        {
          className:
            "flex items-center gap-2 text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-4 py-3",
        },
        React.createElement(CheckCircle, { className: "h-4 w-4 shrink-0" }),
        successMsg,
        React.createElement(
          "button",
          { className: "ml-auto text-emerald-500 hover:text-emerald-700", onClick: () => setSuccessMsg(null) },
          "✕"
        )
      ),

    errorMsg &&
      React.createElement(
        "div",
        {
          className:
            "flex items-center gap-2 text-sm bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3",
        },
        React.createElement(AlertTriangle, { className: "h-4 w-4 shrink-0" }),
        errorMsg,
        React.createElement(
          "button",
          { className: "ml-auto text-red-400 hover:text-red-700", onClick: () => setErrorMsg(null) },
          "✕"
        )
      ),

    /* ── Confirmation Dialog ── */
    confirmId &&
      React.createElement(
        "div",
        {
          className: "fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4",
          onClick: () => setConfirmId(null),
        },
        React.createElement(
          "div",
          {
            className:
              "bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4 animate-fade-in",
            onClick: (e) => e.stopPropagation(),
          },
          React.createElement(
            "div",
            { className: "flex items-center gap-3" },
            React.createElement(
              "div",
              { className: "h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0" },
              React.createElement(XCircle, { className: "h-5 w-5 text-red-600" })
            ),
            React.createElement(
              "div",
              null,
              React.createElement(
                "h3",
                { className: "text-base font-bold text-foreground" },
                "Cancel Check-in?"
              ),
              React.createElement(
                "p",
                { className: "text-xs text-muted-foreground mt-0.5" },
                "This will revoke loyalty points from the customer and cannot be undone."
              )
            )
          ),
          React.createElement(
            "div",
            { className: "flex gap-3" },
            React.createElement(
              Button,
              {
                variant: "outline",
                className: "flex-1",
                onClick: () => setConfirmId(null),
              },
              "Keep It"
            ),
            React.createElement(
              Button,
              {
                className: "flex-1 bg-red-600 hover:bg-red-700 text-white",
                onClick: () => handleCancelConfirm(confirmId),
              },
              "Yes, Cancel & Deduct Points"
            )
          )
        )
      ),

    /* ── Check-ins Table ── */
    React.createElement(
      Card,
      { className: "glass" },
      React.createElement(
        CardHeader,
        { className: "p-6 pb-4" },
        React.createElement(
          "div",
          { className: "flex items-center justify-between" },
          React.createElement(
            "div",
            null,
            React.createElement(
              CardTitle,
              { className: "text-base font-bold text-foreground flex items-center gap-2" },
              React.createElement(UserCheck, { className: "h-4 w-4 text-primary" }),
              "All Check-ins"
            ),
            React.createElement(
              CardDescription,
              { className: "text-xs text-muted-foreground mt-0.5" },
              pagination
                ? `${pagination.total} total check-ins`
                : "Loading..."
            )
          )
        )
      ),
      React.createElement(
        CardContent,
        { className: "p-0" },
        isLoading
          ? React.createElement(
              "div",
              { className: "flex items-center justify-center py-16" },
              React.createElement(Loader2, { className: "h-8 w-8 animate-spin text-primary" })
            )
          : checkins.length === 0
          ? React.createElement(
              "div",
              {
                className:
                  "flex flex-col items-center justify-center py-16 text-center text-muted-foreground",
              },
              React.createElement(Calendar, { className: "h-10 w-10 mb-3 opacity-40" }),
              React.createElement("p", { className: "text-sm font-semibold" }, "No check-ins yet"),
              React.createElement(
                "p",
                { className: "text-xs mt-1" },
                "Check-ins will appear here once customers scan your QR codes."
              )
            )
          : React.createElement(
              "div",
              { className: "overflow-x-auto" },
              React.createElement(
                "table",
                { className: "w-full text-left text-xs border-collapse" },
                React.createElement(
                  "thead",
                  null,
                  React.createElement(
                    "tr",
                    {
                      className:
                        "border-b border-border text-muted-foreground font-bold bg-slate-50/60",
                    },
                    React.createElement("th", { className: "px-6 py-3" }, "Customer"),
                    React.createElement("th", { className: "px-6 py-3" }, "Branch"),
                    React.createElement("th", { className: "px-6 py-3" }, "Date & Time"),
                    React.createElement("th", { className: "px-6 py-3 text-center" }, "Status"),
                    React.createElement("th", { className: "px-6 py-3 text-right" }, "Action")
                  )
                ),
                React.createElement(
                  "tbody",
                  { className: "divide-y divide-border/60" },
                  checkins.map((log) =>
                    React.createElement(
                      "tr",
                      {
                        key: log.id,
                        className: `hover:bg-slate-50/60 transition-colors ${
                          log.status === "REJECTED" ? "opacity-60" : ""
                        }`,
                      },
                      /* Customer */
                      React.createElement(
                        "td",
                        { className: "px-6 py-3.5" },
                        React.createElement(
                          "div",
                          { className: "font-semibold text-foreground" },
                          log.customer?.name || "Unknown"
                        ),
                        React.createElement(
                          "div",
                          { className: "text-[10px] text-muted-foreground font-mono mt-0.5" },
                          log.customer?.phone || "—"
                        )
                      ),
                      /* Branch */
                      React.createElement(
                        "td",
                        { className: "px-6 py-3.5 text-slate-700 font-medium" },
                        log.branch?.name || "—"
                      ),
                      /* Date */
                      React.createElement(
                        "td",
                        { className: "px-6 py-3.5 text-muted-foreground" },
                        React.createElement(
                          "div",
                          { className: "flex items-center gap-1" },
                          React.createElement(Clock, { className: "h-3 w-3 shrink-0" }),
                          formatDate(log.createdAt)
                        )
                      ),
                      /* Status */
                      React.createElement(
                        "td",
                        { className: "px-6 py-3.5 text-center" },
                        statusBadge(log.status)
                      ),
                      /* Action */
                      React.createElement(
                        "td",
                        { className: "px-6 py-3.5 text-right" },
                        log.status === "VALID"
                          ? cancellingId === log.id
                            ? React.createElement(Loader2, {
                                className: "h-4 w-4 animate-spin text-muted-foreground ml-auto",
                              })
                            : React.createElement(
                                Button,
                                {
                                  variant: "outline",
                                  size: "sm",
                                  className:
                                    "text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 text-[11px] h-7 px-2.5",
                                  onClick: () => setConfirmId(log.id),
                                  disabled: !!cancellingId,
                                },
                                React.createElement(XCircle, { className: "h-3.5 w-3.5 mr-1" }),
                                "Cancel Points"
                              )
                          : React.createElement(
                              "span",
                              { className: "text-[10px] text-muted-foreground italic" },
                              log.status === "REJECTED" ? "Cancelled" : "—"
                            )
                      )
                    )
                  )
                )
              )
            )
      )
    ),

    /* ── Pagination ── */
    pagination && pagination.totalPages > 1 &&
      React.createElement(
        "div",
        { className: "flex items-center justify-between text-xs text-muted-foreground" },
        React.createElement(
          "span",
          null,
          `Page ${pagination.page} of ${pagination.totalPages}`
        ),
        React.createElement(
          "div",
          { className: "flex gap-2" },
          React.createElement(
            Button,
            {
              variant: "outline",
              size: "sm",
              disabled: page <= 1 || isFetching,
              onClick: () => setPage((p) => p - 1),
            },
            "← Previous"
          ),
          React.createElement(
            Button,
            {
              variant: "outline",
              size: "sm",
              disabled: page >= pagination.totalPages || isFetching,
              onClick: () => setPage((p) => p + 1),
            },
            "Next →"
          )
        )
      )
  );
}

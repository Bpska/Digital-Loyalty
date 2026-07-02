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
  Award,
  Clock,
  Loader2,
  RefreshCcw,
  Tag
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function CompletedCyclesPage() {
  const { user } = useAuthStore();
  const businessId = user?.businessId;
  const queryClient = useQueryClient();

  const [undoingId, setUndoingId] = useState(null);

  // Fetch completed cycles / redemptions
  const { data: redemptionsData, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["businessRedemptions", businessId],
    queryFn: () => api.get(`/businesses/${businessId}/redemptions`).then((res) => res.data),
    enabled: !!businessId && businessId !== "null" && businessId !== "undefined",
  });

  const redemptions = redemptionsData || [];

  const handleUndoRedemption = async (id) => {
    if (!confirm("Are you sure you want to undo this redemption? The customer's voucher will become ready to redeem again.")) return;
    setUndoingId(id);
    try {
      await api.post(`/businesses/${businessId}/redemptions/${id}/undo`);
      queryClient.invalidateQueries(["customerDashboard"]);
      queryClient.invalidateQueries(["businessRedemptions", businessId]);
      refetch();
      alert("Redemption undone successfully!");
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to undo redemption");
    } finally {
      setUndoingId(null);
    }
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
            "Completed Cycles & Redemptions"
          ),
          React.createElement(
            "p",
            { className: "text-xs text-muted-foreground mt-0.5" },
            "View and manage customer reward claims, completed stamp cycles, and discount coupons."
          )
        )
      ),
      React.createElement(
        "div",
        { className: "flex items-center gap-2" },
        React.createElement(
          Link,
          { to: "/dashboard/business/loyalty-config" },
          React.createElement(
            Button,
            {
              className: "bg-gradient-to-r from-[#FF6A00] to-[#FF8E3C] hover:from-[#FF6A00] hover:to-[#FF8E3C] text-white font-semibold text-xs shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all",
              size: "sm",
            },
            "⚙️ Change Reward Policy"
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
      )
    ),

    /* ── Completed Cycles & Redeemed Items Table ── */
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
              React.createElement(Award, { className: "h-4 w-4 text-primary" }),
              "All Completed Cycles & Redemptions"
            ),
            React.createElement(
              CardDescription,
              { className: "text-xs text-muted-foreground mt-0.5" },
              `${redemptions.length} total redemptions recorded`
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
          : redemptions.length === 0
          ? React.createElement(
              "div",
              {
                className:
                  "flex flex-col items-center justify-center py-16 text-center text-muted-foreground",
              },
              React.createElement(Award, { className: "h-10 w-10 mb-3 opacity-40" }),
              React.createElement("p", { className: "text-sm font-semibold" }, "No redemptions found"),
              React.createElement(
                "p",
                { className: "text-xs mt-1" },
                "Vouchers and coupons redeemed by customers will appear here."
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
                    React.createElement("th", { className: "px-6 py-3" }, "Item / Reward Title"),
                    React.createElement("th", { className: "px-6 py-3" }, "Type"),
                    React.createElement("th", { className: "px-6 py-3" }, "Redeemed Code"),
                    React.createElement("th", { className: "px-6 py-3" }, "Redemption Date"),
                    React.createElement("th", { className: "px-6 py-3 text-right" }, "Action")
                  )
                ),
                React.createElement(
                  "tbody",
                  { className: "divide-y divide-border/60" },
                  redemptions.map((item) =>
                    React.createElement(
                      "tr",
                      {
                        key: item.id,
                        className: "hover:bg-slate-50/60 transition-colors",
                      },
                      /* Customer */
                      React.createElement(
                        "td",
                        { className: "px-6 py-3.5" },
                        React.createElement(
                          "div",
                          { className: "font-semibold text-slate-800" },
                          item.customerName
                        ),
                        React.createElement(
                          "div",
                          { className: "text-[10px] text-muted-foreground font-mono mt-0.5" },
                          item.customerPhone || "—"
                        )
                      ),
                      /* Item */
                      React.createElement(
                        "td",
                        { className: "px-6 py-3.5 font-medium text-slate-700" },
                        item.title
                      ),
                      /* Type */
                      React.createElement(
                        "td",
                        { className: "px-6 py-3.5" },
                        React.createElement(
                          "span",
                          {
                            className: `inline-block text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              item.type === "REWARD"
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                : "bg-amber-50 text-amber-700 border border-amber-100"
                            }`,
                          },
                          item.type
                        )
                      ),
                      /* Redeemed Code */
                      React.createElement(
                        "td",
                        { className: "px-6 py-3.5 font-mono text-[10px] text-slate-600" },
                        item.code?.toUpperCase()
                      ),
                      /* Date */
                      React.createElement(
                        "td",
                        { className: "px-6 py-3.5 text-muted-foreground" },
                        formatDate(item.redeemedAt)
                      ),
                      /* Action */
                      React.createElement(
                        "td",
                        { className: "px-6 py-3.5 text-right" },
                        React.createElement(
                          Button,
                          {
                            size: "xs",
                            variant: "outline",
                            disabled: undoingId === item.id,
                            onClick: () => handleUndoRedemption(item.id),
                            className: "text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200",
                          },
                          undoingId === item.id ? "Undoing..." : "Undo Redemption"
                        )
                      )
                    )
                  )
                )
              )
            )
      )
    )
  );
}

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Star, Loader2, History, Building2 } from "lucide-react";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function getLevelColors(name) {
  const n = name?.toLowerCase();
  if (n?.includes("bronze")) return { bg: "from-amber-500 to-amber-700", badge: "bg-amber-100 text-amber-800 border-amber-300" };
  if (n?.includes("silver")) return { bg: "from-slate-400 to-slate-600", badge: "bg-slate-100 text-slate-700 border-slate-300" };
  if (n?.includes("gold")) return { bg: "from-yellow-400 to-amber-500", badge: "bg-yellow-100 text-yellow-800 border-yellow-300" };
  if (n?.includes("platinum")) return { bg: "from-indigo-400 to-indigo-600", badge: "bg-indigo-100 text-indigo-800 border-indigo-300" };
  return { bg: "from-primary to-primary/70", badge: "bg-primary/10 text-primary border-primary/30" };
}

// Group transactions by date label
function groupByDate(transactions) {
  const groups = {};
  for (const tx of transactions) {
    const label = formatDate(tx.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(tx);
  }
  return Object.entries(groups);
}

export default function CustomerLoyaltyHistoryPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["loyaltyHistory"],
    queryFn: () => api.get("/loyalty-approval/history?limit=100").then(r => r),
    refetchInterval: 60000,
  });

  const transactions = data?.data || [];
  const total = data?.meta?.total ?? transactions.length;
  const grouped = groupByDate(transactions);

  // Calculate totals
  const totalPoints = transactions.reduce((sum, tx) => sum + tx.points, 0);
  const uniqueBusinesses = new Set(transactions.map(tx => tx.businessId)).size;

  return (
    React.createElement("div", { className: "space-y-4" },

      /* Header */
      React.createElement("div", { className: "space-y-0.5" },
        React.createElement("h2", { className: "text-xl font-extrabold text-foreground" }, "Loyalty History"),
        React.createElement("p", { className: "text-xs text-muted-foreground" },
          "Points you have earned from businesses."
        )
      ),

      /* Summary Card */
      React.createElement(Card, { className: "bg-gradient-to-br from-primary to-primary/80 border-0 text-white shadow-lg" },
        React.createElement(CardContent, { className: "p-5 flex items-center justify-between" },
          React.createElement("div", null,
            React.createElement("p", { className: "text-xs font-semibold uppercase tracking-wider opacity-80" }, "Total Points Earned"),
            React.createElement("p", { className: "text-4xl font-black mt-1" }, totalPoints),
            React.createElement("p", { className: "text-xs opacity-70 mt-0.5" },
              `From ${uniqueBusinesses} business${uniqueBusinesses !== 1 ? "es" : ""}`
            )
          ),
          React.createElement("div", { className: "h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center" },
            React.createElement(Award, { className: "h-8 w-8 text-white" })
          )
        )
      ),

      /* Loading */
      isLoading && (
        React.createElement("div", { className: "flex items-center justify-center py-12" },
          React.createElement(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" })
        )
      ),

      /* Error */
      error && (
        React.createElement("div", { className: "rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 text-center" },
          "Failed to load loyalty history. Please try again."
        )
      ),

      /* Empty State */
      !isLoading && !error && transactions.length === 0 && (
        React.createElement("div", { className: "flex flex-col items-center justify-center py-16 text-center space-y-3" },
          React.createElement("div", { className: "h-16 w-16 rounded-full bg-muted flex items-center justify-center" },
            React.createElement(History, { className: "h-8 w-8 text-muted-foreground" })
          ),
          React.createElement("h3", { className: "text-base font-bold text-foreground" }, "No Points Earned Yet"),
          React.createElement("p", { className: "text-sm text-muted-foreground max-w-xs" },
            "Visit a business, scan their QR code, and wait for the owner to approve your loyalty points."
          )
        )
      ),

      /* Transaction List grouped by date */
      !isLoading && !error && grouped.length > 0 && (
        React.createElement("div", { className: "space-y-5" },
          grouped.map(([dateLabel, txns]) =>
            React.createElement("div", { key: dateLabel, className: "space-y-2" },

              /* Date header */
              React.createElement("p", { className: "text-xs font-bold text-muted-foreground uppercase tracking-wider px-1" },
                dateLabel
              ),

              /* Transactions for this date */
              txns.map((tx) => {
                const level = tx.level;
                const colors = getLevelColors(level?.name);
                return React.createElement(Card, {
                  key: tx.id,
                  className: "border border-border/70 overflow-hidden hover:border-border transition-colors",
                },
                  React.createElement(CardContent, { className: "p-0" },
                    React.createElement("div", { className: "flex items-stretch" },

                      /* Left color stripe with icon */
                      React.createElement("div", {
                        className: `w-1.5 shrink-0 bg-gradient-to-b ${colors.bg}`,
                      }),

                      /* Content */
                      React.createElement("div", { className: "flex-1 flex items-center justify-between gap-3 p-4" },
                        React.createElement("div", { className: "min-w-0 space-y-1" },

                          /* Business name */
                          React.createElement("div", { className: "flex items-center gap-1.5" },
                            React.createElement(Building2, { className: "h-3.5 w-3.5 text-muted-foreground shrink-0" }),
                            React.createElement("p", { className: "font-bold text-sm text-foreground truncate" },
                              tx.business?.name || "Business"
                            )
                          ),

                          /* Level badge */
                          level && (
                            React.createElement("div", { className: "flex items-center gap-1.5" },
                              React.createElement("span", {
                                className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold ${colors.badge}`,
                              },
                                React.createElement(Star, { className: "h-2.5 w-2.5" }),
                                level.name
                              )
                            )
                          ),

                          /* Time */
                          React.createElement("p", { className: "text-[10px] text-muted-foreground" },
                            formatTime(tx.createdAt)
                          )
                        ),

                        /* Points */
                        React.createElement("div", { className: "text-right shrink-0" },
                          React.createElement("p", { className: "text-xl font-black text-primary" },
                            `+${tx.points}`
                          ),
                          React.createElement("p", { className: "text-[10px] text-muted-foreground" }, "points")
                        )
                      )
                    )
                  )
                );
              })
            )
          ),

          /* Footer count */
          total > transactions.length && (
            React.createElement("p", { className: "text-xs text-center text-muted-foreground" },
              `Showing ${transactions.length} of ${total} transactions`
            )
          )
        )
      )
    )
  );
}

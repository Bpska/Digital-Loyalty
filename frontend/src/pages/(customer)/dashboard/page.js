import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, getImageUrl } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Gift, Coffee, Star, Stamp, MapPin, Award, CheckCircle2,
  ChevronRight, QrCode, Tag, Percent, Banknote, Clock, Zap
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDiscount(coupon) {
  if (coupon.discountType === "PERCENTAGE") {
    return `${Number(coupon.discountValue)}% OFF`;
  }
  return `₹${Number(coupon.discountValue)} OFF`;
}

function daysLeft(validTo) {
  const diff = Math.ceil((new Date(validTo) - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return "Expires today";
  if (diff === 1) return "1 day left";
  return `${diff} days left`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return React.createElement(
    "div", { className: "space-y-4 animate-pulse" },
    React.createElement("div", { className: "h-10 w-48 rounded-lg bg-slate-200" }),
    React.createElement("div", { className: "h-8 w-36 rounded-lg bg-slate-200 mt-6" }),
    React.createElement("div", { className: "space-y-3" },
      React.createElement("div", { className: "h-52 w-full rounded-xl bg-slate-200" }),
      React.createElement("div", { className: "h-52 w-full rounded-xl bg-slate-200" }),
    )
  );
}

// ─── Social Links ─────────────────────────────────────────────────────────────
function SocialLinks({ business }) {
  const has = business.instagramUrl || business.facebookUrl || business.whatsappUrl || business.googleReviewUrl;
  if (!has) return null;

  return React.createElement(
    "div", { className: "border-t border-dashed border-border mt-3 pt-3 flex items-center justify-between" },
    React.createElement("span", { className: "text-[10px] text-muted-foreground font-semibold uppercase tracking-wider" }, "Connect"),
    React.createElement("div", { className: "flex items-center space-x-2" },

      business.instagramUrl && React.createElement("a", {
        href: business.instagramUrl.startsWith("http") ? business.instagramUrl : `https://${business.instagramUrl}`,
        target: "_blank", rel: "noopener noreferrer", title: "Instagram",
        className: "w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-sm"
      }, React.createElement("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" },
        React.createElement("rect", { x: "2", y: "2", width: "20", height: "20", rx: "5", ry: "5" }),
        React.createElement("path", { d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" }),
        React.createElement("line", { x1: "17.5", y1: "6.5", x2: "17.51", y2: "6.5" })
      )),

      business.facebookUrl && React.createElement("a", {
        href: business.facebookUrl.startsWith("http") ? business.facebookUrl : `https://${business.facebookUrl}`,
        target: "_blank", rel: "noopener noreferrer", title: "Facebook",
        className: "w-7 h-7 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-sm"
      }, React.createElement("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" },
        React.createElement("path", { d: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" })
      )),

      business.whatsappUrl && React.createElement("a", {
        href: business.whatsappUrl.startsWith("http") ? business.whatsappUrl : `https://wa.me/${business.whatsappUrl.replace(/[^0-9]/g, "")}`,
        target: "_blank", rel: "noopener noreferrer", title: "WhatsApp",
        className: "w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-sm"
      }, React.createElement("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" },
        React.createElement("path", { d: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" })
      )),

      business.googleReviewUrl && React.createElement("a", {
        href: business.googleReviewUrl.startsWith("http") ? business.googleReviewUrl : `https://${business.googleReviewUrl}`,
        target: "_blank", rel: "noopener noreferrer", title: "Google Review",
        className: "w-7 h-7 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 p-0.5 flex items-center justify-center hover:scale-110 transition-transform shadow-sm ring-1 ring-yellow-400/40"
      }, React.createElement("div", { className: "w-full h-full rounded-full bg-white flex items-center justify-center" },
        React.createElement("svg", { className: "w-3.5 h-3.5", viewBox: "0 0 24 24", fill: "#EA4335" },
          React.createElement("polygon", { points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" })
        )
      ))
    )
  );
}

// ─── Coupon chip ──────────────────────────────────────────────────────────────
function CouponChip({ coupon }) {
  const isPercent = coupon.discountType === "PERCENTAGE";
  return React.createElement(
    "div", { className: "flex items-center justify-between rounded-xl border border-dashed border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-2.5 gap-3" },
    React.createElement("div", { className: "flex items-center gap-2.5 min-w-0" },
      React.createElement("div", { className: "flex-shrink-0 h-9 w-9 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center" },
        isPercent
          ? React.createElement(Percent, { className: "h-4 w-4 text-amber-600" })
          : React.createElement(Banknote, { className: "h-4 w-4 text-amber-600" })
      ),
      React.createElement("div", { className: "min-w-0" },
        React.createElement("p", { className: "text-xs font-bold text-amber-900 truncate" }, coupon.title),
        coupon.description && React.createElement("p", { className: "text-[10px] text-amber-700/70 truncate" }, coupon.description),
        React.createElement("div", { className: "flex items-center gap-1.5 mt-1" },
          React.createElement("code", { className: "text-[10px] font-mono font-bold bg-white border border-amber-200 text-amber-800 px-1.5 py-0.5 rounded" }, coupon.code),
          React.createElement("span", { className: "text-[10px] text-amber-600 flex items-center gap-0.5" },
            React.createElement(Clock, { className: "h-2.5 w-2.5" }),
            daysLeft(coupon.validTo)
          )
        )
      )
    ),
    React.createElement("span", { className: "flex-shrink-0 text-sm font-extrabold text-white bg-amber-500 px-2.5 py-1.5 rounded-lg shadow-sm whitespace-nowrap" },
      formatDiscount(coupon)
    )
  );
}

// ─── Program progress block ───────────────────────────────────────────────────
function ProgramBlock({ program, card, isFirst }) {
  const isVisitBased = program.type === "VISIT_BASED";
  const threshold = program.threshold;
  const rewardTitle = program.reward?.title || "Reward";

  return React.createElement(
    "div", {
      className: `space-y-3 ${!isFirst ? "border-t border-dashed border-border pt-4" : ""}`
    },

    // Program type badge + reward label
    React.createElement("div", { className: "flex items-center justify-between" },
      React.createElement("div", { className: "flex items-center gap-1.5" },
        isVisitBased
          ? React.createElement(Star, { className: "h-3.5 w-3.5 text-amber-500" })
          : React.createElement(Zap, { className: "h-3.5 w-3.5 text-primary" }),
        React.createElement("span", { className: "text-[11px] font-bold text-foreground uppercase tracking-wide" },
          isVisitBased ? "Stamp Card" : "Points Program"
        )
      ),
      React.createElement("span", { className: "text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border font-medium flex items-center gap-1" },
        React.createElement(Gift, { className: "h-2.5 w-2.5" }),
        rewardTitle
      )
    ),

    // VISIT_BASED: Stamp grid
    isVisitBased ? React.createElement("div", { className: "space-y-2" },
      React.createElement("div", { className: "flex justify-between items-center text-xs" },
        React.createElement("span", { className: "text-muted-foreground" },
          "Stamps: ",
          React.createElement("strong", { className: "text-primary" }, card.visitStreak),
          " / ", threshold
        ),
        React.createElement("span", { className: "text-[10px] text-muted-foreground" },
          card.totalVisits, " lifetime visits"
        )
      ),
      React.createElement("div", { className: "flex flex-wrap gap-2 pt-0.5" },
        Array.from({ length: Math.min(threshold, 20) }).map((_, i) => {
          const stamped = i < card.visitStreak;
          return React.createElement("div", {
            key: i,
            className: `h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
              stamped
                ? "bg-gradient-to-tr from-[#FF6A00]/90 to-[#800020]/90 backdrop-blur-sm border-[#FF6A00] text-white shadow-md shadow-[#FF6A00]/20 scale-105"
                : "bg-white/40 backdrop-blur-sm border-dashed border-[#CBD5E1] text-[#CBD5E1]"
            }`
          },
          React.createElement(Stamp, {
            className: stamped ? "h-4 w-4 fill-white text-white stroke-none" : "h-4 w-4 opacity-30"
          }));
        })
      ),
      // Goal summary
      card.visitStreak >= threshold
        ? React.createElement("div", { className: "flex items-center gap-1.5 text-xs text-emerald-600 font-semibold" },
            React.createElement(CheckCircle2, { className: "h-3.5 w-3.5" }),
            "Target reached! Your reward is unlocked."
          )
        : React.createElement("p", { className: "text-[11px] text-muted-foreground" },
            `${threshold - card.visitStreak} more visit${threshold - card.visitStreak === 1 ? "" : "s"} to earn "${rewardTitle}"`
          )
    )

    // POINTS_BASED: Progress bar
    : React.createElement("div", { className: "space-y-2" },
      React.createElement("div", { className: "flex justify-between items-center text-xs" },
        React.createElement("span", { className: "text-muted-foreground" },
          "Points: ",
          React.createElement("strong", { className: "text-primary" }, card.totalPoints),
          " / ", threshold
        ),
        React.createElement("span", { className: "text-[10px] text-muted-foreground" },
          "+", program.pointsPerVisit, " pts / visit"
        )
      ),
      React.createElement("div", { className: "w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-border" },
        React.createElement("div", {
          className: "bg-gradient-to-r from-primary to-indigo-400 h-full rounded-full transition-all duration-700 ease-out",
          style: { width: `${Math.min(100, Math.round((card.totalPoints / threshold) * 100))}%` }
        })
      ),
      React.createElement("div", { className: "flex justify-between items-center text-[10px] text-muted-foreground" },
        React.createElement("span", null, Math.min(100, Math.round((card.totalPoints / threshold) * 100)), "% complete"),
        card.totalPoints >= threshold
          ? React.createElement("span", { className: "text-emerald-600 flex items-center gap-0.5 font-semibold" },
              React.createElement(CheckCircle2, { className: "h-3 w-3" }),
              "Reward unlocked!"
            )
          : React.createElement("span", null, `${threshold - card.totalPoints} pts to earn "${rewardTitle}"`)
      )
    )
  );
}

// ─── Business card ────────────────────────────────────────────────────────────
function BusinessCard({ card }) {
  const business = card.business;

  // Only programs where BOTH the program AND its linked reward are active
  const activePrograms = (business.loyaltyPrograms || []).filter(
    p => p.reward && p.reward.isActive !== false
  );
  const activeCoupons = business.coupons || [];

  // Hide card completely if nothing active
  if (activePrograms.length === 0 && activeCoupons.length === 0) return null;

  return React.createElement(
    Card, { className: "border-border bg-white overflow-hidden shadow-sm rounded-xl" },

    // Header
    React.createElement(
      CardHeader, { className: "p-4 pb-3 flex flex-row items-center space-x-3 space-y-0 border-b border-border bg-slate-50/60" },
      business.logoUrl
        ? React.createElement("img", { src: getImageUrl(business.logoUrl), alt: business.name, className: "h-10 w-10 rounded-full object-cover border border-border flex-shrink-0" })
        : React.createElement("div", { className: "h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-indigo-100 flex items-center justify-center font-bold text-primary border border-border flex-shrink-0 text-sm" }, business.name[0]),

      React.createElement("div", { className: "flex-1 min-w-0" },
        React.createElement(CardTitle, { className: "text-sm font-bold truncate text-foreground" }, business.name),
        React.createElement("div", { className: "flex items-center gap-1.5 mt-0.5 flex-wrap" },
          activePrograms.length > 0 && React.createElement("span", { className: "text-[9px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full uppercase" },
            "● Active"
          ),
          activePrograms.map(p =>
            React.createElement("span", { key: p.id, className: "text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full border border-border" },
              p.type === "VISIT_BASED" ? "Stamp Card" : "Points"
            )
          ),
          activeCoupons.length > 0 && React.createElement("span", { className: "text-[9px] font-bold bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full uppercase" },
            `${activeCoupons.length} Deal${activeCoupons.length > 1 ? "s" : ""}`
          )
        )
      ),

      React.createElement(Link, { to: `/history?businessId=${business.id}` },
        React.createElement(ChevronRight, { className: "h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" })
      )
    ),

    // Body
    React.createElement(CardContent, { className: "p-4 pt-3 space-y-4" },

      // All active loyalty programs
      activePrograms.map((prog, idx) =>
        React.createElement(ProgramBlock, { key: prog.id, program: prog, card, isFirst: idx === 0 })
      ),

      // Divider between programs and coupons
      activePrograms.length > 0 && activeCoupons.length > 0 &&
        React.createElement("div", { className: "border-t border-border" }),

      // Active coupons
      activeCoupons.length > 0 && React.createElement("div", { className: "space-y-2" },
        React.createElement("p", { className: "text-[10px] font-bold uppercase tracking-widest text-amber-700 flex items-center gap-1 mb-2" },
          React.createElement(Tag, { className: "h-3 w-3" }),
          "Active Discount Coupons"
        ),
        activeCoupons.map(coupon =>
          React.createElement(CouponChip, { key: coupon.id, coupon })
        )
      ),

      // Social links
      React.createElement(SocialLinks, { business })
    )
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function CustomerDashboard() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["customerDashboard"],
    queryFn: () => api.get("/customer/dashboard").then((res) => res.data),
  });

  const [selectedReward, setSelectedReward] = useState(null);

  useEffect(() => {
    const id = setInterval(refetch, 15000);
    return () => clearInterval(id);
  }, [refetch]);

  if (isLoading) return React.createElement(DashboardSkeleton, null);

  const { loyaltyCards = [], unlockedRewards = [] } = data || {};

  // Only cards with active program OR active coupon
  const visibleCards = loyaltyCards.filter(card => {
    const hasProgram = (card.business.loyaltyPrograms || []).length > 0;
    const hasCoupon  = (card.business.coupons || []).length > 0;
    return hasProgram || hasCoupon;
  });

  return React.createElement("div", { className: "space-y-6" },

    // Top bar
    React.createElement("div", { className: "flex items-center justify-between" },
      React.createElement("div", null,
        React.createElement("h2", { className: "text-xl font-extrabold text-foreground" }, "Namaste 👋"),
        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Your active programs & deals")
      ),
      React.createElement(Link, { to: "/checkin" },
        React.createElement(Button, { size: "sm", className: "bg-primary hover:bg-primary/95 text-primary-foreground shadow-sm" },
          React.createElement(QrCode, { className: "mr-2 h-4 w-4" }),
          "Check In"
        )
      )
    ),

    // Unlocked reward vouchers carousel
    unlockedRewards.length > 0 && React.createElement("div", { className: "space-y-3" },
      React.createElement("h3", { className: "text-sm font-semibold tracking-wider text-muted-foreground uppercase flex items-center" },
        React.createElement(Gift, { className: "mr-2 h-4 w-4 text-primary" }),
        "Vouchers Ready to Redeem (", unlockedRewards.length, ")"
      ),
      React.createElement("div", { className: "flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x" },
        unlockedRewards.map(reward =>
          React.createElement(Card, {
            key: reward.id,
            className: "w-72 shrink-0 snap-center border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 transition-all cursor-pointer shadow-sm rounded-xl",
            onClick: () => setSelectedReward(reward)
          },
          React.createElement(CardHeader, { className: "p-4 pb-2" },
            React.createElement("div", { className: "flex justify-between items-start" },
              React.createElement("span", { className: "text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full uppercase" }, "Unlocked"),
              React.createElement(Award, { className: "h-5 w-5 text-indigo-600" })
            ),
            React.createElement(CardTitle, { className: "text-base mt-2 text-foreground font-bold" }, reward.reward.title),
            React.createElement(CardDescription, { className: "text-xs text-muted-foreground line-clamp-1" },
              reward.reward.description || "Show to staff to redeem your gift"
            )
          ),
          React.createElement(CardContent, { className: "p-4 pt-0 flex justify-between items-center" },
            React.createElement("span", { className: "text-[11px] text-muted-foreground font-mono" },
              "Code: ", reward.redemptionCode.slice(0, 8), "…"
            ),
            React.createElement(Button, { size: "sm", variant: "outline", className: "h-8 text-xs font-semibold bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50" }, "Redeem Now")
          ))
        )
      )
    ),

    // Active programs & deals section
    React.createElement("div", { className: "space-y-4" },
      React.createElement("h3", { className: "text-sm font-semibold tracking-wider text-muted-foreground uppercase" },
        "Active Programs & Deals"
      ),

      visibleCards.length === 0
        ? React.createElement(Card, { className: "border-dashed border-border bg-muted/20 py-8 text-center" },
            React.createElement(CardContent, { className: "flex flex-col items-center justify-center space-y-3" },
              React.createElement("div", { className: "rounded-full bg-muted p-3" },
                React.createElement(Coffee, { className: "h-6 w-6 text-muted-foreground" })
              ),
              React.createElement("p", { className: "text-sm text-foreground font-medium" }, "No active programs right now"),
              React.createElement("p", { className: "text-xs text-muted-foreground max-w-xs" },
                "Visit a business and scan their QR code to start earning rewards!"
              ),
              React.createElement(Link, { to: "/checkin" },
                React.createElement(Button, { size: "sm", variant: "outline", className: "mt-2" }, "Scan QR to Start")
              )
            )
          )
        : React.createElement("div", { className: "space-y-4" },
            visibleCards.map(card =>
              React.createElement(BusinessCard, { key: card.id, card })
            )
          )
    ),

    // Redemption QR modal
    selectedReward && React.createElement(
      Dialog, { open: !!selectedReward, onOpenChange: (open) => !open && setSelectedReward(null) },
      React.createElement(DialogContent, { className: "max-w-[340px] bg-white border border-border" },
        React.createElement(DialogHeader, { className: "text-center" },
          React.createElement(DialogTitle, { className: "text-xl font-bold text-foreground" }, selectedReward.reward.title),
          React.createElement(DialogDescription, { className: "text-xs mt-1 text-muted-foreground" },
            selectedReward.reward.description || "Show this QR code to the cashier/staff to claim your reward"
          )
        ),
        React.createElement("div", { className: "flex flex-col items-center justify-center p-4 space-y-4" },
          React.createElement("div", { className: "rounded-xl border border-border bg-white p-3 shadow-md" },
            React.createElement("img", {
              src: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=0f172a&data=${selectedReward.redemptionCode}`,
              alt: "Redemption QR Code",
              className: "h-44 w-44"
            })
          ),
          React.createElement("div", { className: "text-center space-y-1.5 w-full" },
            React.createElement("span", { className: "text-[10px] text-muted-foreground uppercase tracking-widest block font-semibold" }, "Redemption Code"),
            React.createElement("span", { className: "text-lg font-mono font-bold text-foreground tracking-widest select-all bg-slate-50 px-3 py-1.5 rounded-md border border-border block" },
              selectedReward.redemptionCode.toUpperCase()
            )
          )
        ),
        React.createElement("div", { className: "rounded-lg bg-indigo-50 border border-indigo-100 p-3 text-[11px] text-center text-indigo-700 font-medium" },
          "Cashier will scan this QR code or type in the code above to verify and complete the reward."
        )
      )
    )
  );
}

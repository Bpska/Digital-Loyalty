import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getImageUrl } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Gift, Coffee, Star, Stamp, MapPin, Award, CheckCircle2,
  ChevronRight, QrCode, Tag, Percent, Banknote, Clock, Zap, CalendarDays, RefreshCcw,
  Scissors, Hotel, Store, Sparkles
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

function getCategoryIcon(category) {
  const norm = (category || "").toLowerCase().trim();
  if (norm.includes("salon") || norm.includes("spa") || norm.includes("beauty") || norm.includes("hair")) {
    return Scissors;
  }
  if (norm.includes("cafe") || norm.includes("coffee") || norm.includes("restaurant") || norm.includes("food") || norm.includes("bakery")) {
    return Coffee;
  }
  if (norm.includes("hotel") || norm.includes("resort") || norm.includes("stay") || norm.includes("hostel")) {
    return Hotel;
  }
  return Store;
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
function CouponChip({ coupon, onClick }) {
  const isPercent = coupon.discountType === "PERCENTAGE";
  return React.createElement(
    "div", { 
      onClick: onClick,
      className: "flex items-center justify-between rounded-xl border border-dashed border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-2.5 gap-3 cursor-pointer hover:bg-amber-100/60 active:scale-[0.99] transition-all" 
    },
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
          React.createElement("code", { className: "text-[10px] font-mono font-bold bg-white border border-amber-200 text-amber-800 px-1.5 py-0.5 rounded animate-pulse" }, coupon.code),
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

// ─── Campaign Coupon Card (shows business details) ────────────────────────────
function CampaignCouponCard({ coupon, onClaim, isClaiming }) {
  const isPercent = coupon.discountType === "PERCENTAGE";
  const business = coupon.business;
  const isEventCoupon = !!coupon.eventDate;

  return React.createElement(
    "div", { className: "flex items-center justify-between rounded-2xl border border-dashed border-amber-200 bg-gradient-to-r from-amber-50/60 to-orange-50/60 p-4 gap-3 shadow-sm hover:shadow-md transition-all duration-300 min-w-0" },

    // Left & Middle Info
    React.createElement("div", { className: "flex items-center gap-3 flex-1 min-w-0" },

      // Business Logo
      business.logoUrl
        ? React.createElement("img", {
          src: getImageUrl(business.logoUrl),
          alt: business.name,
          className: "h-11 w-11 rounded-xl object-cover border border-amber-100/80 flex-shrink-0 bg-white shadow-sm"
        })
        : React.createElement("div", {
          className: "h-11 w-11 rounded-xl bg-amber-100/80 border border-amber-200/50 flex items-center justify-center font-bold text-amber-700 flex-shrink-0 text-sm shadow-sm"
        }, business.name[0].toUpperCase()),

      // Coupon Meta Info
      React.createElement("div", { className: "flex-1 min-w-0 space-y-1" },
        React.createElement("h4", { className: "text-sm font-extrabold text-slate-800 truncate leading-snug" }, coupon.title),
        React.createElement("p", { className: "text-[10px] text-amber-800 font-semibold truncate tracking-wide" }, `at ${business.name}`),

        // Badges row
        React.createElement("div", { className: "flex flex-wrap items-center gap-1.5 pt-0.5" },
          isEventCoupon
            ? React.createElement("span", { className: "text-[9px] font-bold bg-[#E0F2FE] text-[#0369A1] px-1.5 py-0.5 rounded border border-[#BAE6FD]" }, "Event Offer")
            : React.createElement("code", { className: "text-[9px] font-mono font-bold bg-white/80 border border-amber-200 text-amber-800 px-1.5 py-0.5 rounded shadow-sm shrink-0" }, coupon.code),

          React.createElement("span", { className: "text-[9px] font-medium text-slate-600 bg-slate-100/80 px-1.5 py-0.5 rounded border border-slate-200/50 flex items-center gap-1 shrink-0" },
            React.createElement(Clock, { className: "h-2.5 w-2.5 text-slate-500" }),
            isEventCoupon
              ? `Event: ${new Date(coupon.eventDate).toLocaleDateString('en-IN')}`
              : daysLeft(coupon.validTo)
          )
        )
      )
    ),

    // Right Section: Discount Badge & Action
    React.createElement("div", { className: "flex flex-col items-end justify-center gap-2 shrink-0 border-l border-dashed border-amber-200/60 pl-4 h-full" },
      React.createElement("span", { className: "text-xs font-black text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg shadow-sm whitespace-nowrap uppercase tracking-wider" },
        formatDiscount(coupon)
      ),
      isEventCoupon && React.createElement(Button, {
        size: "xs",
        className: "h-7 text-[10px] px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-full shadow-sm border-0 transition-all duration-300",
        onClick: (e) => {
          e.stopPropagation();
          onClaim(coupon.id);
        },
        disabled: isClaiming
      }, isClaiming ? "Claiming..." : "Claim Offer")
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
          isVisitBased ? "Stamp Card" : program.type === "SPEND_BASED" ? "Spend Program" : "Points Program"
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
            className: `h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${stamped
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
            program.type === "SPEND_BASED"
              ? `${program.pointsPerSpendUnit} pt${program.pointsPerSpendUnit !== 1 ? 's' : ''} / ₹ spent`
              : `+${program.pointsPerVisit} pts / visit`
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

// ─── Hybrid Program Block ────────────────────────────────────────────────────
function HybridProgramBlock({ settings, wallet, businessId }) {
  const queryClient = useQueryClient();
  const redeemMutation = useMutation({
    mutationFn: () => api.post(`/loyalty-approval/redeem-wallet-reward/${businessId}`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["customerDashboard"] });
      alert(res.data?.message || `Successfully redeemed stamps for ${settings.rewardName}!`);
    },
    onError: (err) => alert(err.message || "Failed to redeem reward"),
  });

  const requiredStamps = settings.requiredStamps || 7;
  const currentStamps = wallet.currentStamps || 0;
  const pointsPerStamp = settings.pointsPerStamp || 50;
  const currentPoints = wallet.currentPoints || 0;
  const pointsRemaining = pointsPerStamp - currentPoints;
  const progressPercent = Math.min(100, Math.round((currentPoints / pointsPerStamp) * 100));
  const isRedeemable = currentStamps >= requiredStamps;

  const startDateStr = wallet.startedAt ? new Date(wallet.startedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : '';

  const expiryDateStr = wallet.expiresAt ? new Date(wallet.expiresAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : '';

  return React.createElement(
    "div", { className: "space-y-4 pt-2" },

    // Header / Program Name
    React.createElement("div", { className: "flex items-center justify-between" },
      React.createElement("div", { className: "flex items-center gap-1.5" },
        React.createElement(Coffee, { className: "h-4 w-4 text-[#800020]" }),
        React.createElement("span", { className: "text-sm font-extrabold text-[#800020]" }, settings.programName)
      ),
      React.createElement("span", { className: "text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border font-medium flex items-center gap-1" },
        React.createElement(Gift, { className: "h-2.5 w-2.5" }),
        settings.rewardName
      )
    ),

    // Start / Expiry dates
    wallet.startedAt && wallet.expiresAt && React.createElement(
      "div", { className: "flex justify-between items-center text-[10px] text-muted-foreground bg-slate-50 px-2.5 py-1 rounded-md" },
      React.createElement("span", null, `Started: ${startDateStr}`),
      React.createElement("span", { className: "font-medium text-amber-700 flex items-center gap-1" },
        React.createElement(Clock, { className: "h-3 w-3" }),
        `Expires: ${expiryDateStr} (${daysLeft(wallet.expiresAt)})`
      )
    ),

    // Stamps display
    React.createElement("div", { className: "space-y-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100" },
      React.createElement("div", { className: "flex justify-between items-center text-xs" },
        React.createElement("span", { className: "text-slate-600 font-medium" },
          "Stamps: ",
          React.createElement("strong", { className: "text-primary text-sm font-bold" }, currentStamps),
          " / ", requiredStamps
        ),
        isRedeemable && React.createElement("span", { className: "text-xs text-emerald-600 font-bold animate-pulse" }, "Reward Available! 🎉")
      ),
      React.createElement("div", { className: "flex flex-wrap gap-2 pt-1" },
        Array.from({ length: requiredStamps }).map((_, i) => {
          const stamped = i < currentStamps;
          return React.createElement("div", {
            key: i,
            className: `h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${stamped
                ? "bg-gradient-to-tr from-[#FF6A00]/90 to-[#800020]/90 border-[#FF6A00] text-white shadow-md shadow-[#FF6A00]/20 scale-105"
                : "bg-white border-dashed border-[#CBD5E1] text-[#CBD5E1]"
              }`
          },
            React.createElement(Stamp, {
              className: stamped ? "h-5 w-5 fill-white text-white stroke-none" : "h-5 w-5 opacity-35"
            }));
        })
      )
    ),

    // Points progress to next stamp
    React.createElement("div", { className: "space-y-1.5" },
      React.createElement("div", { className: "flex justify-between items-center text-xs" },
        React.createElement("span", { className: "text-muted-foreground" },
          "Points: ",
          React.createElement("strong", { className: "text-slate-800" }, currentPoints),
          " / ", pointsPerStamp
        ),
        React.createElement("span", { className: "text-[10px] text-muted-foreground font-semibold" },
          pointsRemaining, " Points Remaining to Next Stamp"
        )
      ),
      React.createElement("div", { className: "w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-border" },
        React.createElement("div", {
          className: "bg-gradient-to-r from-primary to-indigo-400 h-full rounded-full transition-all duration-700 ease-out",
          style: { width: `${progressPercent}%` }
        })
      )
    ),

    // Detailed Stats List
    React.createElement("div", { className: "mt-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-2 text-slate-700 font-medium" },
      React.createElement("div", { className: "flex justify-between border-b border-dashed border-slate-200 pb-1.5" },
        React.createElement("span", { className: "text-slate-500 font-semibold" }, "Loyalty Status:"),
        React.createElement("span", { className: "font-bold text-emerald-600" }, wallet.expiresAt && new Date() > new Date(wallet.expiresAt) ? "Expired" : "Active")
      ),
      React.createElement("div", { className: "flex justify-between border-b border-dashed border-slate-200 pb-1.5" },
        React.createElement("span", { className: "text-slate-500 font-semibold" }, "Stamps:"),
        React.createElement("span", { className: "font-bold text-slate-800" }, `${currentStamps} / ${requiredStamps}`)
      ),
      React.createElement("div", { className: "flex justify-between border-b border-dashed border-slate-200 pb-1.5" },
        React.createElement("span", { className: "text-slate-500 font-semibold" }, "Total Points Earned:"),
        React.createElement("span", { className: "font-bold text-slate-800" }, `${currentPoints} pts`)
      ),
      React.createElement("div", { className: "flex justify-between border-b border-dashed border-slate-200 pb-1.5 bg-amber-50/40 px-2 py-0.5 rounded" },
        React.createElement("span", { className: "text-slate-500 font-semibold flex items-center gap-1" },
          React.createElement(Award, { className: "h-3.5 w-3.5 text-amber-500" }),
          "Extra Points Balance:"
        ),
        React.createElement("span", { className: "font-black text-amber-600" }, `${wallet.pointsBalance ?? 0} pts`)
      ),
      React.createElement("div", { className: "flex justify-between border-b border-dashed border-slate-200 pb-1.5" },
        React.createElement("span", { className: "text-slate-500 font-semibold" }, "Reward:"),
        React.createElement("span", { className: "font-bold text-slate-800" }, settings.rewardName)
      ),
      wallet.expiresAt && React.createElement(React.Fragment, null,
        React.createElement("div", { className: "flex justify-between border-b border-dashed border-slate-200 pb-1.5" },
          React.createElement("span", { className: "text-slate-500 font-semibold" }, "Expiry Date:"),
          React.createElement("span", { className: "font-semibold text-slate-800" }, expiryDateStr)
        ),
        React.createElement("div", { className: "flex justify-between" },
          React.createElement("span", { className: "text-slate-500 font-semibold" }, "Expires In:"),
          React.createElement("span", { className: "font-bold text-amber-700" }, daysLeft(wallet.expiresAt))
        )
      )
    ),

    // Redeem reward button
    React.createElement("div", { className: "pt-1" },
      React.createElement(Button, {
        onClick: () => redeemMutation.mutate(),
        disabled: !isRedeemable || redeemMutation.isPending,
        className: `w-full font-bold text-xs py-2.5 rounded-full transition-all ${isRedeemable
            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:scale-[1.01] active:scale-[0.99]"
            : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
          }`
      },
        redeemMutation.isPending ? "Redeeming..." : isRedeemable ? "Redeem Reward" : `Earn ${requiredStamps - currentStamps} more stamp${requiredStamps - currentStamps > 1 ? "s" : ""} to redeem`
      )
    )
  );
}

// ─── Visit-Based Stamp Card Block ───────────────────────────────────────────
function VisitStampCardBlock({ settings, wallet, businessId, unlockedRewards, setSelectedReward }) {
  const requiredStamps = settings.requiredStamps || 7;
  const currentStamps = wallet.currentStamps || 0;
  const isRedeemable = wallet.status === "REWARD_AVAILABLE";

  const startDateStr = wallet.startedAt ? new Date(wallet.startedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : '';

  const expiryDateStr = wallet.expiresAt ? new Date(wallet.expiresAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : '';

  // Find corresponding unlocked reward for this business
  const correspondingReward = unlockedRewards?.find(
    r => r.reward.businessId === businessId && r.status === "UNLOCKED"
  );

  const handleRedeemClick = () => {
    if (correspondingReward) {
      setSelectedReward(correspondingReward);
    } else {
      alert("Please check the Vouchers section above or refresh the page to redeem.");
    }
  };

  return React.createElement(
    "div", { className: "space-y-4 pt-2 border-t border-dashed border-border" },

    // Header / Program Name
    React.createElement("div", { className: "flex items-center justify-between" },
      React.createElement("div", { className: "flex items-center gap-1.5" },
        React.createElement(Star, { className: "h-4 w-4 text-emerald-600" }),
        React.createElement("span", { className: "text-sm font-extrabold text-emerald-800" }, `${settings.programName} (Stamps)`)
      ),
      React.createElement("span", { className: "text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border font-medium flex items-center gap-1" },
        React.createElement(Gift, { className: "h-2.5 w-2.5" }),
        settings.rewardName
      )
    ),

    // Start / Expiry dates
    React.createElement("div", { className: "flex justify-between items-center text-[10px] text-muted-foreground bg-slate-50 px-2.5 py-1 rounded-md" },
      React.createElement("span", null, `Started: ${startDateStr}`),
      React.createElement("span", { className: "font-medium text-amber-700" }, `Expires: ${expiryDateStr}`)
    ),

    // Stamps display
    React.createElement("div", { className: "space-y-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100" },
      React.createElement("div", { className: "flex justify-between items-center text-xs" },
        React.createElement("span", { className: "text-slate-600 font-medium" },
          "Stamps collected: ",
          React.createElement("strong", { className: "text-primary text-sm font-bold" }, currentStamps),
          " / ", requiredStamps
        ),
        isRedeemable && React.createElement("span", { className: "text-xs text-emerald-600 font-bold animate-pulse" }, "Reward Unlocked! 🎉")
      ),
      React.createElement("div", { className: "flex flex-wrap gap-2 pt-1" },
        Array.from({ length: requiredStamps }).map((_, i) => {
          const stamped = i < currentStamps;
          return React.createElement("div", {
            key: i,
            className: `h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${stamped
                ? "bg-gradient-to-tr from-[#10B981]/90 to-[#047857]/90 border-[#10B981] text-white shadow-md shadow-[#10B981]/20 scale-105"
                : "bg-white border-dashed border-[#CBD5E1] text-[#CBD5E1]"
              }`
          },
            React.createElement(Stamp, {
              className: stamped ? "h-5 w-5 fill-white text-white stroke-none" : "h-5 w-5 opacity-35"
            }));
        })
      )
    ),

    // Redeem reward button
    React.createElement("div", { className: "pt-1" },
      React.createElement(Button, {
        onClick: handleRedeemClick,
        disabled: !isRedeemable,
        className: `w-full font-bold text-xs py-2.5 rounded-full transition-all ${isRedeemable
            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:scale-[1.01] active:scale-[0.99]"
            : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
          }`
      },
        isRedeemable ? "Redeem Reward" : `Collect ${requiredStamps - currentStamps} more stamp${requiredStamps - currentStamps > 1 ? "s" : ""} to unlock reward`
      )
    )
  );
}

// ─── Business card (compact swipeable tile with Liquid Glass UI) ───────────────
function BusinessCard({ card, onClick }) {
  const business = card.business;
  const activeCoupons = business.coupons || [];
  const hasHybrid = !!card.settings;
  const stamps = card.wallet?.currentStamps || 0;
  const required = card.settings?.requiredStamps || 0;

  if (activeCoupons.length === 0 && !hasHybrid) return null;

  return React.createElement(
    "div", {
      onClick,
      className: "w-[calc(100vw-3rem)] sm:w-[600px] flex-shrink-0 snap-center rounded-3xl border border-white/60 bg-white/50 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 ease-out cursor-pointer overflow-hidden relative flex flex-col justify-between min-h-[420px] p-5"
    },

    // Cover Image header (if present)
    business.coverUrl && React.createElement("div", {
      className: "w-[calc(100%+2.5rem)] -mx-5 -mt-5 h-28 relative overflow-hidden mb-4 border-b border-white/40 shrink-0"
    },
      React.createElement("img", {
        src: getImageUrl(business.coverUrl),
        alt: "Cover",
        className: "w-full h-full object-cover"
      }),
      React.createElement("div", {
        className: "absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
      })
    ),

    // Liquid Glass background elements (glowing gradient blobs behind translucent card content)
    React.createElement("div", { className: "absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-primary/25 via-pink-500/15 to-transparent rounded-full blur-3xl pointer-events-none" }),
    React.createElement("div", { className: "absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-indigo-500/20 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" }),

    // Top section: brand logo and title
    React.createElement("div", { className: "relative z-10 flex items-center gap-4" },
      business.logoUrl
        ? React.createElement("img", { src: getImageUrl(business.logoUrl), alt: business.name, className: "h-14 w-14 rounded-2xl object-cover border-2 border-white/80 shadow-md flex-shrink-0" })
        : React.createElement("div", { className: "h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white shadow-md border-2 border-white/80 flex-shrink-0" }
            , React.createElement(getCategoryIcon(business.category), { className: "h-6 w-6 stroke-[2.5]" })
          ),
      React.createElement("div", { className: "min-w-0 flex-1" },
        React.createElement("p", { className: "text-base font-black text-foreground truncate tracking-tight" }, business.name),
        React.createElement("div", { className: "flex items-center gap-1.5 mt-1 flex-wrap" },
          hasHybrid && React.createElement("span", { className: "text-[9px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider" }, "Active"),
          business.category && React.createElement("span", { className: "text-[9px] bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/15 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1" }
            , React.createElement(getCategoryIcon(business.category), { className: "h-2.5 w-2.5" })
            , business.category
          ),
          React.createElement("span", { className: "text-[9px] bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider" }, `${card.totalVisits || 0} Visits`)
        )
      )
    ),

    // Business description (limit to 2 lines)
    business.description && React.createElement("p", {
      className: "text-[11px] text-muted-foreground mt-2 leading-relaxed line-clamp-2 px-1 relative z-10"
    }, business.description),

    // Content section: progress bars and active deals
    React.createElement("div", { className: "relative z-10 space-y-4 my-3 flex-1 flex flex-col justify-center" },
      hasHybrid && required > 0 && React.createElement("div", { className: "space-y-3 bg-white/40 backdrop-blur-sm border border-white/50 p-3.5 rounded-2xl shadow-inner-white" },
        React.createElement("div", { className: "flex justify-between text-xs text-muted-foreground font-semibold" },
          React.createElement("span", null, "Loyalty Stamp Progress"),
          React.createElement("span", { className: "font-black text-primary" }, `${stamps} / ${required}`)
        ),
        React.createElement("div", { className: "w-full bg-slate-100/60 rounded-full h-2 overflow-hidden border border-slate-200/50" },
          React.createElement("div", {
            className: "bg-gradient-to-r from-primary via-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-700 ease-out",
            style: { width: `${Math.min(100, Math.round((stamps / required) * 100))}%` }
          })
        ),
        // Visual Stamp Circles
        React.createElement("div", { className: "flex flex-wrap gap-1.5 pt-1.5 justify-start" },
          Array.from({ length: required }).map((_, i) => {
            const stamped = i < stamps;
            return React.createElement("div", {
              key: i,
              className: `h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${stamped
                ? "bg-gradient-to-tr from-primary to-indigo-600 border-primary text-white shadow-sm scale-105"
                : "bg-white/60 border-dashed border-slate-300 text-slate-300"
              }`
            },
              React.createElement(Stamp, {
                className: stamped ? "h-5 w-5 fill-white text-white stroke-none" : "h-5 w-5 opacity-40"
              })
            );
          })
        )
      ),

      // Deals rendered inside the card
      activeCoupons.length > 0 && React.createElement("div", { className: "space-y-2" },
        React.createElement("p", { className: "text-[10px] font-bold uppercase tracking-widest text-amber-700 flex items-center gap-1" },
          React.createElement(Tag, { className: "h-3 w-3" }),
          "Available Deals"
        ),
        React.createElement("div", { className: "space-y-2 max-h-[120px] overflow-y-auto pr-1 scrollbar-thin" },
          activeCoupons.slice(0, 2).map(coupon =>
            React.createElement(CouponChip, { 
              key: coupon.id, 
              coupon,
              onClick: (e) => {
                e.stopPropagation();
                setSelectedReward({
                  coupon: coupon,
                  redemptionCode: coupon.code,
                });
              }
            })
          ),
          activeCoupons.length > 2 && React.createElement("p", { className: "text-[10px] text-muted-foreground text-center font-semibold" },
            `+ ${activeCoupons.length - 2} more deal${activeCoupons.length > 3 ? "s" : ""} available`
          )
        )
      )
    ),

    // Footer actions
    React.createElement("div", { className: "relative z-10 flex items-center justify-between pt-2 border-t border-dashed border-slate-200/60" },
      React.createElement("div", { className: "flex items-center gap-2" },
        hasHybrid && React.createElement("span", { className: "text-[10px] bg-indigo-500/10 text-indigo-700 font-extrabold px-2.5 py-1 rounded-xl border border-indigo-500/5" }, "STAMPS"),
        activeCoupons.length > 0 && React.createElement("span", { className: "text-[10px] bg-amber-500/10 text-amber-700 font-extrabold px-2.5 py-1 rounded-xl border border-amber-500/5" }, `${activeCoupons.length} DEALS`),
        React.createElement(Link, {
          to: `/review?businessId=${business.id}`,
          onClick: (e) => e.stopPropagation(),
          className: "text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 font-extrabold px-2.5 py-1 rounded-xl flex items-center gap-1 transition-colors border border-amber-500/10"
        },
          React.createElement(Sparkles, { className: "h-3 w-3 text-amber-600 fill-amber-600/30" }),
          "AI Review"
        )
      ),
      React.createElement("span", { className: "text-[10px] text-primary font-bold flex items-center gap-1 hover:translate-x-0.5 transition-transform" },
        "Details", React.createElement(ChevronRight, { className: "h-3 w-3" })
      )
    )
  );
}

// ─── Shuffle Card Stack (Smooth 3D stacked layout with swipe/shuffle animation) ──
function ShuffleCardStack({ cards, onCardClick }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [shufflingId, setShufflingId] = React.useState(null);

  const handleShuffle = (e) => {
    e.stopPropagation();
    if (cards.length <= 1 || shufflingId !== null) return;
    
    // Set shuffling state to animate fly-out
    setShufflingId(cards[currentIndex].id);
    
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
      setShufflingId(null);
    }, 450); // Match CSS transition duration
  };

  if (!cards || cards.length === 0) return null;

  return React.createElement("div", { className: "relative w-full max-w-[600px] h-[480px] mx-auto flex flex-col items-center justify-start mt-4 select-none" },
    React.createElement("div", { className: "relative w-full h-[420px]" },
      cards.map((card, idx) => {
        const total = cards.length;
        const offset = (idx - currentIndex + total) % total;
        const isTop = offset === 0;
        const isSecond = offset === 1;
        const isThird = offset === 2;
        const isFlyOut = shufflingId === card.id;

        let transform = "translate3d(0, 24px, -30px) scale(0.92) rotate(-1deg)";
        let opacity = 0;
        let zIndex = 0;

        if (isFlyOut) {
          transform = "translate3d(120%, -10px, 0) scale(0.95) rotate(12deg)";
          opacity = 0;
          zIndex = 40;
        } else if (isTop) {
          transform = "translate3d(0, 0, 0) scale(1) rotate(0deg)";
          opacity = 1;
          zIndex = 30;
        } else if (isSecond) {
          transform = "translate3d(0, 12px, -15px) scale(0.96) rotate(1.5deg)";
          opacity = 0.95;
          zIndex = 20;
        } else if (isThird) {
          transform = "translate3d(0, 24px, -30px) scale(0.92) rotate(-1.5deg)";
          opacity = 0.85;
          zIndex = 10;
        } else {
          transform = "translate3d(0, 36px, -45px) scale(0.88) rotate(0deg)";
          opacity = 0;
          zIndex = 0;
        }

        return React.createElement("div", {
          key: card.id,
          onClick: () => isTop && onCardClick(card),
          style: {
            transform,
            opacity,
            zIndex,
            perspective: "1000px"
          },
          className: "absolute top-0 left-0 w-full flex justify-center transition-all duration-500 ease-out cursor-pointer origin-bottom"
        },
          React.createElement(BusinessCard, { card, onClick: () => isTop && onCardClick(card) })
        );
      })
    ),
    /* Shuffle control buttons */
    cards.length > 1 && React.createElement("div", { className: "flex items-center gap-4 mt-2 z-50" },
      React.createElement(Button, {
        size: "sm",
        variant: "outline",
        onClick: handleShuffle,
        className: "rounded-full px-5 py-2.5 border-amber-200 text-amber-800 bg-amber-50 hover:bg-amber-100 font-extrabold text-xs shadow-sm flex items-center gap-1.5 transition-transform active:scale-95"
      },
        React.createElement(RefreshCcw, { className: "h-3.5 w-3.5" }),
        "Shuffle Card"
      ),
      React.createElement("span", { className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-slate-100/80 px-2.5 py-1 rounded-full border border-slate-200/50" },
        `${currentIndex + 1} / ${cards.length}`
      )
    )
  );
}

// ─── Business Details Modal ────────────────────────────────────────────────────
function BusinessDetailsModal({ card, unlockedRewards, setSelectedReward, onClose }) {
  const business = card.business;
  const activeCoupons = business.coupons || [];

  return React.createElement(
    Dialog, { open: true, onOpenChange: (open) => !open && onClose() },
    React.createElement(DialogContent, { className: "max-w-[460px] w-[95vw] max-h-[85vh] overflow-y-auto bg-white border border-border rounded-3xl p-0" },

      // Banner Cover Image (if present)
      business.coverUrl && React.createElement("div", {
        className: "w-full h-32 relative overflow-hidden border-b border-white/40 shrink-0"
      },
        React.createElement("img", {
          src: getImageUrl(business.coverUrl),
          alt: "Cover",
          className: "w-full h-full object-cover"
        })
      ),

      // Header
      React.createElement("div", { className: `bg-gradient-to-br from-primary/10 to-indigo-100 p-6 flex items-center gap-4 ${business.coverUrl ? '' : 'rounded-t-3xl'}` },
        business.logoUrl
          ? React.createElement("img", { src: getImageUrl(business.logoUrl), alt: business.name, className: "h-14 w-14 rounded-xl object-cover border-2 border-white shadow-md flex-shrink-0" })
          : React.createElement("div", { className: "h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white shadow-md border-2 border-white flex-shrink-0" }
              , React.createElement(getCategoryIcon(business.category), { className: "h-6 w-6 stroke-[2.5]" })
            ),
        React.createElement("div", { className: "min-w-0" },
          React.createElement("h2", { className: "text-lg font-extrabold text-foreground truncate" }, business.name),
          business.category && React.createElement("span", { className: "text-[10px] text-muted-foreground bg-white/60 border border-border px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1" }
            , React.createElement(getCategoryIcon(business.category), { className: "h-3 w-3 text-muted-foreground" })
            , business.category
          ),
          React.createElement("p", { className: "text-[11px] text-muted-foreground mt-1 flex items-center gap-1" },
            React.createElement(MapPin, { className: "h-3 w-3" }),
            card.wallet?.expiresAt && new Date() > new Date(card.wallet.expiresAt) ? "Expired" : "Active Loyalty Program"
          )
        )
      ),

      // Body
      React.createElement("div", { className: "p-5 space-y-5" },

        // Hybrid loyalty block
        card.settings && React.createElement(HybridProgramBlock, {
          settings: card.settings,
          wallet: card.wallet || { currentPoints: 0, currentStamps: 0 },
          businessId: business.id,
        }),


        // Outlets & GPS check-in rules block
        business.branches && business.branches.length > 0 && React.createElement("div", { className: "space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100/75" },
          React.createElement("p", { className: "text-[10px] font-bold uppercase tracking-widest text-[#FF6A00] flex items-center gap-1.5" },
            React.createElement(MapPin, { className: "h-3.5 w-3.5" }),
            "Check-in Outlets & GPS Rules"
          ),
          React.createElement("div", { className: "space-y-2.5 mt-2" },
            business.branches.map(branch => 
              React.createElement("div", { key: branch.id, className: "text-xs border-b border-slate-200/50 pb-2 last:border-0 last:pb-0" },
                React.createElement("p", { className: "font-bold text-slate-800" }, branch.name),
                branch.address && React.createElement("p", { className: "text-[10px] text-muted-foreground mt-0.5" }, branch.address),
                React.createElement("div", { className: "flex justify-between items-center mt-1.5 text-[10px]" },
                  React.createElement("span", { className: "text-muted-foreground font-semibold" }, "GPS Check-in Radius"),
                  React.createElement("span", { className: "font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full" }, `${branch.radiusMeters} meters`)
                )
              )
            )
          )
        ),
        card.settings && activeCoupons.length > 0 &&
          React.createElement("div", { className: "border-t border-dashed border-border" }),

        // Active coupons
        activeCoupons.length > 0 && React.createElement("div", { className: "space-y-2" },
          React.createElement("p", { className: "text-[10px] font-bold uppercase tracking-widest text-amber-700 flex items-center gap-1" },
            React.createElement(Tag, { className: "h-3 w-3" }),
            "Active Discount Coupons"
          ),
          activeCoupons.map(coupon =>
            React.createElement(CouponChip, { 
              key: coupon.id, 
              coupon,
              onClick: (e) => {
                e.stopPropagation();
                setSelectedReward({
                  coupon: coupon,
                  redemptionCode: coupon.code,
                });
              }
            })
          )
        ),

        // Social links
        React.createElement(SocialLinks, { business }),

        // Book Stay
        business.category === "Hotels" && business.bookingUrl && React.createElement(
          "div", { className: "pt-1" },
          React.createElement("a", {
            href: business.bookingUrl.startsWith("http") ? business.bookingUrl : `https://${business.bookingUrl}`,
            target: "_blank", rel: "noopener noreferrer",
            className: "w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF8E3C] text-white py-2.5 px-4 text-xs font-bold shadow-md"
          },
            React.createElement(CalendarDays, { className: "h-4 w-4" }),
            "Book Stay"
          )
        )
      )
    )
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function CustomerDashboard() {
  const { user } = useAuthStore();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["customerDashboard"],
    queryFn: () => api.get("/customer/dashboard").then((res) => res.data),
  });

  const [selectedReward, setSelectedReward] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [lastData, setLastData] = useState(null);
  const [redemptionSuccessPlace, setRedemptionSuccessPlace] = useState(null);

  useEffect(() => {
    const intervalTime = selectedReward ? 2000 : 15000;
    const id = setInterval(refetch, intervalTime);
    return () => clearInterval(id);
  }, [refetch, selectedReward]);

  useEffect(() => {
    if (data && lastData && selectedReward) {
      const isRewardActive = data.unlockedRewards?.some(r => r.id === selectedReward.id) ||
        data.claimedCoupons?.some(c => c.id === selectedReward.id);

      const wasRewardActive = lastData.unlockedRewards?.some(r => r.id === selectedReward.id) ||
        lastData.claimedCoupons?.some(c => c.id === selectedReward.id);

      if (wasRewardActive && !isRewardActive) {
        const biz = selectedReward.reward?.business || selectedReward.coupon?.business;
        setRedemptionSuccessPlace({
          businessName: biz?.name || "the business",
          googleReviewUrl: biz?.googleReviewUrl || null,
          title: selectedReward.reward?.title || selectedReward.coupon?.offerTitle || selectedReward.coupon?.title
        });
        setSelectedReward(null);
      }
    }
    if (data && data !== lastData) {
      setLastData(data);
    }
  }, [data, lastData, selectedReward]);

  const queryClient = useQueryClient();
  const [claimingId, setClaimingId] = useState(null);
  const claimCouponMutation = useMutation({
    mutationFn: (couponId) => { setClaimingId(couponId); return api.post(`/coupons/${couponId}/claim`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customerDashboard"] });
      setClaimingId(null);
      alert("Coupon claimed! It is now in your vouchers — tap 'Redeem Now' at the counter.");
    },
    onError: (err) => { setClaimingId(null); alert(err.message || "Failed to claim coupon"); },
  });

  if (isLoading) return React.createElement(DashboardSkeleton, null);

  const {
    loyaltyCards = [],
    unlockedRewards = [],
    activeCampaigns = [],
    activeEventCoupons = [],
    claimedCoupons = [],
    redeemedRewards = [],
    redeemedCoupons = []
  } = data || {};

  // Only cards with active coupon OR hybrid settings
  const visibleCards = loyaltyCards.filter(card => {
    const hasCoupon = (card.business.coupons || []).length > 0;
    const hasHybrid = !!card.settings;
    return hasCoupon || hasHybrid;
  });

  return React.createElement("div", { className: "space-y-6" },

    // Top bar
    React.createElement("div", { className: "flex items-center justify-between" },
      React.createElement("div", null,
        React.createElement("h2", { className: "text-xl font-extrabold text-foreground" }, `Namaste ${user?.name || ""} 👋`),
        React.createElement("p", { className: "text-xs text-muted-foreground" }, "Your active programs & deals")
      )
    ),

    // Unlocked reward vouchers & claimed event coupons carousel
    (unlockedRewards.length > 0 || claimedCoupons.length > 0) && React.createElement("div", { className: "space-y-3" },
      React.createElement("h3", { className: "text-sm font-semibold tracking-wider text-muted-foreground uppercase flex items-center" },
        React.createElement(Gift, { className: "mr-2 h-4 w-4 text-primary" }),
        `Vouchers Ready to Redeem (${unlockedRewards.length + claimedCoupons.length})`
      ),
      React.createElement("div", { className: "flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth scrollbar-none -mx-4 px-6" },
        unlockedRewards.map(reward =>
          React.createElement(Card, {
            key: reward.id,
            className: "w-[calc(100vw-4rem)] sm:w-72 shrink-0 snap-center border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 transition-all cursor-pointer shadow-sm rounded-xl",
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
              ),
              reward.reward?.business?.name && React.createElement("p", { className: "text-[10px] font-semibold text-indigo-800 mt-1 flex items-center gap-1" },
                React.createElement(MapPin, { className: "h-2.5 w-2.5" }),
                reward.reward.business.name
              )
            ),
            React.createElement(CardContent, { className: "p-4 pt-0 flex justify-between items-center gap-2" }
              , React.createElement("div", { className: "flex items-center gap-1 min-w-0" }
                , React.createElement("span", { className: "text-[10px] text-muted-foreground uppercase font-bold shrink-0" }, "Code: ")
                , React.createElement("span", { className: "text-xs font-mono font-bold text-indigo-950 bg-indigo-100/70 border border-indigo-200/50 px-2 py-0.5 rounded truncate" }
                  , reward.redemptionCode.length > 12 ? `${reward.redemptionCode.slice(0, 8).toUpperCase()}...` : reward.redemptionCode.toUpperCase()
                )
              )
              , React.createElement(Button, { size: "sm", variant: "outline", className: "h-8 text-xs font-semibold bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-full shrink-0" }, "Redeem Now")
            ))
        ),
        claimedCoupons.map(claim =>
          React.createElement(Card, {
            key: claim.id,
            className: "w-[calc(100vw-4rem)] sm:w-72 shrink-0 snap-center border-amber-100 bg-amber-50/40 hover:bg-amber-50 transition-all cursor-pointer shadow-sm rounded-xl",
            onClick: () => setSelectedReward(claim)
          },
            React.createElement(CardHeader, { className: "p-4 pb-2" },
              React.createElement("div", { className: "flex justify-between items-start" },
                React.createElement("span", { className: "text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full uppercase" }, "Claimed"),
                React.createElement(Tag, { className: "h-5 w-5 text-amber-600" })
              ),
              React.createElement(CardTitle, { className: "text-base mt-2 text-foreground font-bold" }, claim.coupon.offerTitle || claim.coupon.title),
              React.createElement(CardDescription, { className: "text-xs text-muted-foreground line-clamp-1" },
                claim.coupon.offerDescription || claim.coupon.description || "Show to staff to redeem at counter"
              ),
              claim.coupon?.business?.name && React.createElement("p", { className: "text-[10px] font-semibold text-amber-800 mt-1 flex items-center gap-1" },
                React.createElement(MapPin, { className: "h-2.5 w-2.5" }),
                claim.coupon.business.name
              )
            ),
            React.createElement(CardContent, { className: "p-4 pt-0 flex justify-between items-center gap-2" }
              , React.createElement("div", { className: "flex items-center gap-1 min-w-0" }
                , React.createElement("span", { className: "text-[10px] text-muted-foreground uppercase font-bold shrink-0" }, "Code: ")
                , React.createElement("span", { className: "text-xs font-mono font-bold text-amber-950 bg-amber-100/70 border border-amber-200/50 px-2 py-0.5 rounded truncate" }
                  , claim.redemptionCode.length > 12 ? `${claim.redemptionCode.slice(0, 8).toUpperCase()}...` : claim.redemptionCode.toUpperCase()
                )
              )
              , React.createElement(Button, { size: "sm", variant: "outline", className: "h-8 text-xs font-semibold bg-white border-amber-200 text-amber-700 hover:bg-amber-50 rounded-full shrink-0" }, "Redeem Now")
            ))
        )
      )
    ),



    // Active programs & deals section — horizontal swipeable cards
    React.createElement("div", { className: "space-y-3" },
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
              React.createElement(Button, { size: "sm", variant: "outline", className: "mt-2 rounded-full" }, "Scan QR to Start")
            )
          )
        )
        : React.createElement(ShuffleCardStack, {
            cards: visibleCards,
            onCardClick: (card) => setSelectedBusiness(card)
          })
    ),

    // Completed / Redeemed Vouchers Section
    (redeemedRewards.length > 0 || redeemedCoupons.length > 0) && React.createElement("div", { className: "space-y-3" },
      React.createElement("h3", { className: "text-sm font-semibold tracking-wider text-muted-foreground uppercase flex items-center" },
        React.createElement(CheckCircle2, { className: "mr-2 h-4 w-4 text-emerald-600" }),
        `Completed Vouchers (${redeemedRewards.length + redeemedCoupons.length})`
      ),
      React.createElement("div", { className: "flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth scrollbar-none -mx-4 px-6" },
        redeemedRewards.map(reward =>
          React.createElement(Card, {
            key: reward.id,
            className: "w-[calc(100vw-4rem)] sm:w-72 shrink-0 snap-center border-emerald-100 bg-emerald-50/20 hover:bg-emerald-50/30 transition-all shadow-sm rounded-xl",
          },
            React.createElement(CardHeader, { className: "p-4 pb-2" },
              React.createElement("div", { className: "flex justify-between items-start" },
                React.createElement("span", { className: "text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full uppercase" }, "Redeemed"),
                React.createElement(CheckCircle2, { className: "h-5 w-5 text-emerald-600" })
              ),
              React.createElement(CardTitle, { className: "text-base mt-2 text-foreground font-bold line-through text-muted-foreground" }, reward.reward.title),
              React.createElement(CardDescription, { className: "text-xs text-muted-foreground line-clamp-1" },
                reward.reward.description || "Reward completed"
              ),
              reward.reward?.business?.name && React.createElement("p", { className: "text-[10px] font-semibold text-emerald-800 mt-1 flex items-center gap-1" },
                React.createElement(MapPin, { className: "h-2.5 w-2.5" }),
                reward.reward.business.name
              )
            ),
            React.createElement(CardContent, { className: "p-4 pt-0 flex justify-between items-center gap-2" },
              React.createElement("div", { className: "flex items-center gap-1 min-w-0" },
                React.createElement("span", { className: "text-[10px] text-muted-foreground uppercase font-bold shrink-0" }, "Code: "),
                React.createElement("span", { className: "text-xs font-mono font-bold text-slate-500 bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded truncate" },
                  reward.redemptionCode.length > 12 ? `${reward.redemptionCode.slice(0, 8).toUpperCase()}...` : reward.redemptionCode.toUpperCase()
                )
              ),
              reward.redeemedAt && React.createElement("span", { className: "text-[10px] text-muted-foreground font-medium" },
                new Date(reward.redeemedAt).toLocaleDateString('en-IN')
              )
            )
          )
        ),
        redeemedCoupons.map(claim =>
          React.createElement(Card, {
            key: claim.id,
            className: "w-[calc(100vw-4rem)] sm:w-72 shrink-0 snap-center border-emerald-100 bg-emerald-50/20 hover:bg-emerald-50/30 transition-all shadow-sm rounded-xl",
          },
            React.createElement(CardHeader, { className: "p-4 pb-2" },
              React.createElement("div", { className: "flex justify-between items-start" },
                React.createElement("span", { className: "text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full uppercase" }, "Redeemed"),
                React.createElement(CheckCircle2, { className: "h-5 w-5 text-emerald-600" })
              ),
              React.createElement(CardTitle, { className: "text-base mt-2 text-foreground font-bold line-through text-muted-foreground" }, claim.coupon.offerTitle || claim.coupon.title),
              React.createElement(CardDescription, { className: "text-xs text-muted-foreground line-clamp-1" },
                claim.coupon.offerDescription || claim.coupon.description || "Coupon redeemed"
              ),
              claim.coupon?.business?.name && React.createElement("p", { className: "text-[10px] font-semibold text-emerald-800 mt-1 flex items-center gap-1" },
                React.createElement(MapPin, { className: "h-2.5 w-2.5" }),
                claim.coupon.business.name
              )
            ),
            React.createElement(CardContent, { className: "p-4 pt-0 flex justify-between items-center gap-2" },
              React.createElement("div", { className: "flex items-center gap-1 min-w-0" },
                React.createElement("span", { className: "text-[10px] text-muted-foreground uppercase font-bold shrink-0" }, "Code: "),
                React.createElement("span", { className: "text-xs font-mono font-bold text-slate-500 bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded truncate" },
                  claim.redemptionCode.length > 12 ? `${claim.redemptionCode.slice(0, 8).toUpperCase()}...` : claim.redemptionCode.toUpperCase()
                )
              ),
              claim.redeemedAt && React.createElement("span", { className: "text-[10px] text-muted-foreground font-medium" },
                new Date(claim.redeemedAt).toLocaleDateString('en-IN')
              )
            )
          )
        )
      )
    ),

    // Business Details Modal
    selectedBusiness && React.createElement(BusinessDetailsModal, {
      card: selectedBusiness,
      unlockedRewards,
      setSelectedReward,
      onClose: () => setSelectedBusiness(null)
    }),

    // Redemption QR modal
    selectedReward && React.createElement(
      Dialog, { open: !!selectedReward, onOpenChange: (open) => !open && setSelectedReward(null) },
      React.createElement(DialogContent, { className: "max-w-[340px] bg-white border border-border p-6 rounded-2xl flex flex-col items-center text-slate-800" },
        React.createElement(DialogHeader, { className: "flex flex-col items-center justify-center text-center w-full" },
          React.createElement(DialogTitle, { className: "text-xl font-bold text-foreground text-center" }, selectedReward.reward?.title || selectedReward.coupon?.offerTitle || selectedReward.coupon?.title),
          React.createElement(DialogDescription, { className: "text-xs mt-1 text-muted-foreground text-center" },
            selectedReward.reward?.description || selectedReward.coupon?.offerDescription || selectedReward.coupon?.description || "Show this QR code to the cashier/staff to claim your reward"
          )
        ),
        React.createElement("div", { className: "flex flex-col items-center justify-center py-2 space-y-4 w-full" },
          React.createElement("div", { className: "rounded-xl border border-border bg-white p-3 shadow-md" },
            React.createElement("img", {
              src: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=0f172a&data=${encodeURIComponent(
                JSON.stringify({
                  redemptionCode: selectedReward.redemptionCode,
                  customerName: user?.name || "Customer",
                  customerPhone: user?.phone || ""
                })
              )}`,
              alt: "Redemption QR Code",
              className: "h-44 w-44"
            })
          ),
          React.createElement("div", { className: "text-center space-y-1.5 w-full" },
            React.createElement("span", { className: "text-[10px] text-muted-foreground uppercase tracking-widest block font-semibold" }, "Redemption Code"),
            React.createElement("span", {
              className: `font-mono font-bold text-foreground select-all bg-slate-50 px-3 py-1.5 rounded-md border border-border block break-all text-center ${selectedReward.redemptionCode.length > 12
                  ? "text-xs tracking-normal"
                  : "text-lg tracking-widest"
                }`
            },
              selectedReward.redemptionCode.toUpperCase()
            )
          )
        ),
        React.createElement("div", { className: "rounded-lg bg-indigo-50 border border-indigo-100 p-3 text-[11px] text-center text-indigo-700 font-medium w-full" },
          "Cashier will scan this QR code or type in the code above to verify and complete the reward."
        )
      )
    )

    // Post-Redemption Success & Google Review Prompt Modal
    , redemptionSuccessPlace && React.createElement(
      Dialog, { open: !!redemptionSuccessPlace, onOpenChange: (open) => !open && setRedemptionSuccessPlace(null) },
      React.createElement(DialogContent, { className: "max-w-[360px] bg-white border border-border p-6 rounded-3xl flex flex-col items-center text-center text-slate-800" },
        React.createElement("div", { className: "w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 shadow-sm" },
          React.createElement(CheckCircle2, { className: "h-6 w-6" })
        ),
        React.createElement(DialogHeader, { className: "flex flex-col items-center justify-center text-center w-full" },
          React.createElement(DialogTitle, { className: "text-lg font-extrabold text-foreground" }, "Redemption Successful! 🎉"),
          React.createElement(DialogDescription, { className: "text-xs mt-1 text-muted-foreground" },
            `Your voucher "${redemptionSuccessPlace.title}" has been successfully redeemed at ${redemptionSuccessPlace.businessName}.`
          )
        ),
        redemptionSuccessPlace.googleReviewUrl ? React.createElement('div', { className: "w-full bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 rounded-2xl p-4 mt-4 space-y-3" },
          React.createElement('div', { className: "flex justify-center" },
            React.createElement(Star, { className: "h-8 w-8 text-amber-500 fill-amber-500 animate-bounce" })
          ),
          React.createElement('div', { className: "space-y-1" },
            React.createElement('p', { className: "text-xs font-bold text-slate-800" }, "Help us grow on Google!"),
            React.createElement('p', { className: "text-[10px] text-slate-600 leading-relaxed" },
              `Please take 10 seconds to share your experience at ${redemptionSuccessPlace.businessName}. Your review helps other customers find us.`
            )
          ),
          React.createElement(Button, {
            onClick: () => {
              window.open(
                redemptionSuccessPlace.googleReviewUrl.startsWith("http")
                  ? redemptionSuccessPlace.googleReviewUrl
                  : `https://${redemptionSuccessPlace.googleReviewUrl}`,
                "_blank",
                "noopener,noreferrer"
              );
              setRedemptionSuccessPlace(null);
            },
            className: "w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-full py-2.5 shadow-sm border-0 transition-all duration-300"
          }, "Write Google Review ⭐")
        ) : React.createElement('div', { className: "w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 mt-4" },
          React.createElement('p', { className: "text-xs text-slate-600 font-medium" }, "Thank you for using our digital loyalty program!")
        ),
        React.createElement(Button, {
          variant: "ghost",
          onClick: () => setRedemptionSuccessPlace(null),
          className: "w-full text-xs text-muted-foreground font-semibold rounded-full mt-2"
        }, "Close")
      )
    )
  );
}

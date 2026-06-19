import { Link } from "react-router-dom";
const _jsxFileName = "src\\pages\\(customer)\\dashboard\\page.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Gift, Coffee, Star, MapPin, Award, CheckCircle2, ChevronRight, QrCode } from "lucide-react";




































export default function CustomerDashboard() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["customerDashboard"],
    queryFn: () => api.get("/customer/dashboard").then((res) => res.data),
  });

  const [selectedReward, setSelectedReward] = useState(null);

  // Poll dashboard data occasionally in case of updates
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 15000);
    return () => clearInterval(interval);
  }, [refetch]);

  if (isLoading) {
    return (
      React.createElement('div', { className: "space-y-4 animate-pulse" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 64}}
        , React.createElement('div', { className: "h-10 w-48 rounded bg-zinc-800"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 65}} )
        , React.createElement('div', { className: "h-32 w-full rounded-xl bg-zinc-800"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 66}} )
        , React.createElement('div', { className: "h-8 w-36 rounded bg-zinc-800 mt-6"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 67}} )
        , React.createElement('div', { className: "space-y-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 68}}
          , React.createElement('div', { className: "h-44 w-full rounded-xl bg-zinc-800"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 69}} )
          , React.createElement('div', { className: "h-44 w-full rounded-xl bg-zinc-800"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 70}} )
        )
      )
    );
  }

  const { loyaltyCards = [], unlockedRewards = [] } = data || {};

  return (
    React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 79}}
      /* Welcome Banner */
      , React.createElement('div', { className: "flex items-center justify-between"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 81}}
        , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 82}}
          , React.createElement('h2', { className: "text-xl font-extrabold text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 83}}, "Namaste, 👋"

          )
          , React.createElement('p', { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 86}}, "Here are your active loyalty cards"     )
        )
        , React.createElement(Link, { to: "/checkin", __self: this, __source: {fileName: _jsxFileName, lineNumber: 88}}
          , React.createElement(Button, { size: "sm", className: "bg-primary hover:bg-primary/95 text-primary-foreground shadow-sm"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 89}}
            , React.createElement(QrCode, { className: "mr-2 h-4 w-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 90}} ), " Check In"
          )
        )
      )

      /* Unlocked / Ready to Redeem Vouchers */
      , unlockedRewards.length > 0 && (
        React.createElement('div', { className: "space-y-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 97}}
          , React.createElement('h3', { className: "text-sm font-semibold tracking-wider text-muted-foreground uppercase flex items-center"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 98}}
            , React.createElement(Gift, { className: "mr-2 h-4 w-4 text-primary"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 99}} ), " Vouchers Ready to Redeem ("     , unlockedRewards.length, ")"
          )
          , React.createElement('div', { className: "flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 101}}
            , unlockedRewards.map((reward) => (
              React.createElement(Card, {
                key: reward.id,
                className: "w-72 shrink-0 snap-center border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 transition-all cursor-pointer shadow-sm rounded-xl"         ,
                onClick: () => setSelectedReward(reward), __self: this, __source: {fileName: _jsxFileName, lineNumber: 103}}

                , React.createElement(CardHeader, { className: "p-4 pb-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 108}}
                  , React.createElement('div', { className: "flex justify-between items-start"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 109}}
                    , React.createElement('span', { className: "text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full uppercase"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 110}}, "Unlocked"

                    )
                    , React.createElement(Award, { className: "h-5 w-5 text-indigo-600"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 113}} )
                  )
                  , React.createElement(CardTitle, { className: "text-base mt-2 text-foreground font-bold"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 115}}, reward.reward.title)
                  , React.createElement(CardDescription, { className: "text-xs text-muted-foreground line-clamp-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 116}}
                    , reward.reward.description || "Show to staff to redeem your gift"
                  )
                )
                , React.createElement(CardContent, { className: "p-4 pt-0 flex justify-between items-center"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 120}}
                  , React.createElement('span', { className: "text-[11px] text-muted-foreground font-mono"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 121}}, "Code: " , reward.redemptionCode.slice(0, 8), "...")
                  , React.createElement(Button, { size: "sm", variant: "outline", className: "h-8 text-xs font-semibold bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 122}}, "Redeem Now"

                  )
                )
              )
            ))
          )
        )
      )

      /* Active Loyalty Programs */
      , React.createElement('div', { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 133}}
        , React.createElement('h3', { className: "text-sm font-semibold tracking-wider text-muted-foreground uppercase"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 134}}, "My Active Stamps & Points"

        )

        , loyaltyCards.length === 0 ? (
          React.createElement(Card, { className: "border-dashed border-border bg-muted/20 py-8 text-center"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 139}}
            , React.createElement(CardContent, { className: "flex flex-col items-center justify-center space-y-3"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 140}}
              , React.createElement('div', { className: "rounded-full bg-muted p-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 141}}
                , React.createElement(Coffee, { className: "h-6 w-6 text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 142}} )
              )
              , React.createElement('p', { className: "text-sm text-foreground font-medium"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 144}}, "No loyalty cards active yet"    )
              , React.createElement('p', { className: "text-xs text-muted-foreground max-w-xs"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 145}}, "Visit a local partner business and scan their counter QR code to start earning points or visits!"

              )
              , React.createElement(Link, { to: "/checkin", __self: this, __source: {fileName: _jsxFileName, lineNumber: 148}}
                , React.createElement(Button, { size: "sm", variant: "outline", className: "mt-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 149}}, "Scan QR to Start"

                )
              )
            )
          )
        ) : (
          React.createElement('div', { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 156}}
            , loyaltyCards.map((card) => {
              // A business can have multiple loyalty programs. We render them.
              const activeProgram = _optionalChain([card, 'access', _2 => _2.business, 'access', _3 => _3.loyaltyPrograms, 'optionalAccess', _4 => _4[0]]);
              if (!activeProgram) return null;

              const isVisitBased = activeProgram.type === "VISIT_BASED";
              const threshold = activeProgram.threshold;
              const hasSocialLinks = card.business.instagramUrl || card.business.facebookUrl || card.business.whatsappUrl || card.business.googleReviewUrl;

              return (
                React.createElement(Card, { key: card.id, className: "border-border bg-white overflow-hidden shadow-sm"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 166}}
                  , React.createElement(CardHeader, { className: "p-4 pb-3 flex flex-row items-center space-x-3 space-y-0 border-b border-border bg-slate-50/55"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 167}}
                    , card.business.logoUrl ? (
                      React.createElement('img', {
                        src: card.business.logoUrl,
                        alt: card.business.name,
                        className: "h-10 w-10 rounded-full object-cover border border-border"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 169}}
                      )
                    ) : (
                      React.createElement('div', { className: "h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-foreground border border-border"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 175}}
                        , card.business.name[0]
                      )
                    )
                    , React.createElement('div', { className: "flex-1 min-w-0" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 179}}
                      , React.createElement(CardTitle, { className: "text-sm font-bold truncate text-foreground"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 180}}
                        , card.business.name
                      )
                      , React.createElement(CardDescription, { className: "text-[11px] text-muted-foreground flex items-center"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 183}}
                        , React.createElement(MapPin, { className: "h-3 w-3 mr-1 text-muted-foreground"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 184}} ), " Active Loyalty Program"
                      )
                    )
                    , React.createElement(Link, { to: `/history?businessId=${card.business.id}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 187}}
                      , React.createElement(ChevronRight, { className: "h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 188}} )
                    )
                  )

                  , React.createElement(CardContent, { className: "p-4 pt-3" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 192}}
                    , isVisitBased ? (
                      /* VISIT_BASED: Render Stamps Grid */
                      React.createElement('div', { className: "space-y-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 195}}
                        , React.createElement('div', { className: "flex justify-between items-center text-xs"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 196}}
                          , React.createElement('span', { className: "text-muted-foreground font-medium" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 197}}, "Stamps: "
                             , React.createElement('strong', { className: "text-primary text-sm" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 198}}, card.visitStreak), " / "  , threshold
                          )
                          , React.createElement('span', { className: "text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-semibold border border-border"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 200}}
                            , card.totalVisits, " Lifetime Visits"
                          )
                        )

                        /* Stamp Grid */
                        , React.createElement('div', { className: "flex flex-wrap gap-3 pt-1"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 206}}
                          , Array.from({ length: threshold }).map((_, i) => {
                            const isStamped = i < card.visitStreak;
                            return (
                              React.createElement('div', {
                                key: i,
                                className: `h-11 w-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                  isStamped
                                    ? "bg-[#FF6A00] border-[#FF6A00] text-white shadow-md shadow-[#FF6A00]/20 scale-105"
                                    : "bg-[#F8FAFC] border-dashed border-[#E8EDF3] text-[#94A3B8]"
                                }`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 210}}

                                , isStamped ? (
                                  React.createElement(Star, { className: "h-5 w-5 fill-white text-white stroke-none"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 219}} )
                                ) : (
                                  React.createElement(Star, { className: "h-4.5 w-4.5 opacity-60"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 221}} )
                                )
                              )
                            );
                          })
                        )
                      )
                    ) : (
                      /* POINTS_BASED: Render Progress Bar */
                      React.createElement('div', { className: "space-y-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 230}}
                        , React.createElement('div', { className: "flex justify-between items-center text-xs"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 231}}
                          , React.createElement('span', { className: "text-muted-foreground font-medium" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 232}}, "Points Balance: "
                              , React.createElement('strong', { className: "text-primary text-sm" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 233}}, card.totalPoints)
                          )
                          , React.createElement('span', { className: "text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-semibold border border-border"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 235}}, "Target: "
                             , threshold, " pts"
                          )
                        )

                        /* Progress Bar */
                        , React.createElement('div', { className: "w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-border"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 241}}
                          , React.createElement('div', {
                            className: "bg-primary h-full rounded-full transition-all duration-500"    ,
                            style: { width: `${Math.min(100, (card.totalPoints / threshold) * 100)}%` }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 242}}
                          )
                        )

                        , React.createElement('div', { className: "flex justify-between items-center text-[10px] text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 248}}
                          , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 249}}, "Progress: " , Math.round((card.totalPoints / threshold) * 100), "%")
                          , card.totalPoints >= threshold ? (
                            React.createElement('span', { className: "text-success flex items-center font-semibold"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 251}}
                              , React.createElement(CheckCircle2, { className: "h-3 w-3 mr-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 252}} ), " Reward unlocked!"
                            )
                          ) : (
                            React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 255}}, threshold - card.totalPoints, " points needed for next reward"     )
                          )
                        )
                      )
                    )
                    , hasSocialLinks && React.createElement('div', { className: "border-t border-dashed border-border mt-4 pt-3 flex items-center justify-between", __self: this, __source: {fileName: _jsxFileName, lineNumber: 260} }
                      , React.createElement('span', { className: "text-[10px] text-muted-foreground font-semibold uppercase tracking-wider", __self: this, __source: {fileName: _jsxFileName, lineNumber: 261} }, "Connect with us")
                      , React.createElement('div', { className: "flex items-center space-x-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 262} }
                        , card.business.instagramUrl && React.createElement('a', {
                            href: card.business.instagramUrl.startsWith('http') ? card.business.instagramUrl : `https://${card.business.instagramUrl}`,
                            target: "_blank",
                            rel: "noopener noreferrer",
                            className: "w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-sm",
                            title: "Instagram",
                            __self: this, __source: {fileName: _jsxFileName, lineNumber: 263}
                          }
                          , React.createElement('svg', {
                              className: "w-5 h-5",
                              viewBox: "0 0 24 24",
                              fill: "none",
                              stroke: "currentColor",
                              strokeWidth: "2.5",
                              strokeLinecap: "round",
                              strokeLinejoin: "round",
                              __self: this, __source: {fileName: _jsxFileName, lineNumber: 264}
                            }
                            , React.createElement('rect', { x: "2", y: "2", width: "20", height: "20", rx: "5", ry: "5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 265} })
                            , React.createElement('path', { d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z", __self: this, __source: {fileName: _jsxFileName, lineNumber: 266} })
                            , React.createElement('line', { x1: "17.5", y1: "6.5", x2: "17.51", y2: "6.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 267} })
                          )
                        )
                        , card.business.facebookUrl && React.createElement('a', {
                            href: card.business.facebookUrl.startsWith('http') ? card.business.facebookUrl : `https://${card.business.facebookUrl}`,
                            target: "_blank",
                            rel: "noopener noreferrer",
                            className: "w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-sm",
                            title: "Facebook",
                            __self: this, __source: {fileName: _jsxFileName, lineNumber: 268}
                          }
                          , React.createElement('svg', {
                              className: "w-5 h-5",
                              viewBox: "0 0 24 24",
                              fill: "none",
                              stroke: "currentColor",
                              strokeWidth: "2.5",
                              strokeLinecap: "round",
                              strokeLinejoin: "round",
                              __self: this, __source: {fileName: _jsxFileName, lineNumber: 269}
                            }
                            , React.createElement('path', { d: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z", __self: this, __source: {fileName: _jsxFileName, lineNumber: 270} })
                          )
                        )
                        , card.business.whatsappUrl && React.createElement('a', {
                            href: card.business.whatsappUrl.startsWith('http') ? card.business.whatsappUrl : `https://wa.me/${card.business.whatsappUrl.replace(/[^0-9]/g, '')}`,
                            target: "_blank",
                            rel: "noopener noreferrer",
                            className: "w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-sm",
                            title: "WhatsApp",
                            __self: this, __source: {fileName: _jsxFileName, lineNumber: 271}
                          }
                          , React.createElement('svg', {
                              className: "w-5 h-5",
                              viewBox: "0 0 24 24",
                              fill: "none",
                              stroke: "currentColor",
                              strokeWidth: "2.5",
                              strokeLinecap: "round",
                              strokeLinejoin: "round",
                              __self: this, __source: {fileName: _jsxFileName, lineNumber: 272}
                            }
                            , React.createElement('path', { d: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z", __self: this, __source: {fileName: _jsxFileName, lineNumber: 273} })
                          )
                        )
                        , card.business.googleReviewUrl && React.createElement('a', {
                            href: card.business.googleReviewUrl.startsWith('http') ? card.business.googleReviewUrl : `https://${card.business.googleReviewUrl}`,
                            target: "_blank",
                            rel: "noopener noreferrer",
                            className: "w-8 h-8 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 p-0.5 flex items-center justify-center hover:scale-115 transition-transform shadow-md animate-pulse ring-2 ring-yellow-400/50",
                            title: "Google Review",
                            __self: this, __source: {fileName: _jsxFileName, lineNumber: 274}
                          }
                          , React.createElement('div', { className: "w-full h-full rounded-full bg-white flex items-center justify-center" }
                            , React.createElement('svg', {
                                className: "w-4 h-4 fill-[#EA4335] text-[#EA4335]",
                                viewBox: "0 0 24 24",
                                fill: "currentColor",
                                stroke: "currentColor",
                                strokeWidth: "1",
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                __self: this, __source: {fileName: _jsxFileName, lineNumber: 275}
                              }
                              , React.createElement('polygon', { points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 276} })
                            )
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

      /* Redemption Code / QR Modal */
      , selectedReward && (
        React.createElement(Dialog, { open: !!selectedReward, onOpenChange: (open) => !open && setSelectedReward(null), __self: this, __source: {fileName: _jsxFileName, lineNumber: 270}}
          , React.createElement(DialogContent, { className: "max-w-[340px] bg-white border border-border"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 271}}
            , React.createElement(DialogHeader, { className: "text-center", __self: this, __source: {fileName: _jsxFileName, lineNumber: 272}}
              , React.createElement(DialogTitle, { className: "text-xl font-bold text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 273}}, selectedReward.reward.title)
              , React.createElement(DialogDescription, { className: "text-xs mt-1 text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 274}}
                , selectedReward.reward.description || "Show this QR code to the cashier/staff to claim your reward"
              )
            )
            , React.createElement('div', { className: "flex flex-col items-center justify-center p-4 space-y-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 278}}
              , React.createElement('div', { className: "rounded-xl border border-border bg-white p-3 shadow-md"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 279}}
                /* Generate high quality QR code using free online engine */
                , React.createElement('img', {
                  src: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=0f172a&data=${selectedReward.redemptionCode}`,
                  alt: "Redemption QR Code"  ,
                  className: "h-44 w-44" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 281}}
                )
              )
              , React.createElement('div', { className: "text-center space-y-1.5 w-full"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 287}}
                , React.createElement('span', { className: "text-[10px] text-muted-foreground uppercase tracking-widest block font-semibold"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 288}}, "Redemption Code" )
                , React.createElement('span', { className: "text-lg font-mono font-bold text-foreground tracking-widest select-all bg-slate-50 px-3 py-1.5 rounded-md border border-border block"            , __self: this, __source: {fileName: _jsxFileName, lineNumber: 289}}
                  , selectedReward.redemptionCode.toUpperCase()
                )
              )
            )
            , React.createElement('div', { className: "rounded-lg bg-indigo-50 border border-indigo-100 p-3 text-[11px] text-center text-indigo-700 font-medium"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 294}}, "Cashier will scan this QR code or type in the code above to verify and complete the reward."

            )
          )
        )
      )
    )
  );
}

import { useNavigate, Link } from "react-router-dom";
const _jsxFileName = "src\\pages\\page.tsx";"use client";

import React, { useState, } from "react";

import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Sparkles, 
  QrCode, 
  Award,
 
  MapPin,
 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Gift, 
  Smartphone,
  Star,
  Activity,

  HelpCircle
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuthStore();
  const [stampsCount, setStampsCount] = useState(3);
  const [pricingPeriod, setPricingPeriod] = useState("monthly");

  // Local interactive stamp simulator
  const maxStamps = 6;
  const toggleStamp = (index) => {
    if (index < stampsCount) {
      setStampsCount(index);
    } else {
      setStampsCount(index + 1);
    }
  };

  return (
    React.createElement('div', { className: "min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-primary/20 selection:text-slate-900"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 44}}

      /* 1. Global Navigation Bar */
      , React.createElement('header', { className: "sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 47}}
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 h-16 flex items-center justify-between"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 48}}
          , React.createElement('div', { className: "flex items-center space-x-2.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 49}}
            , React.createElement('div', { className: "h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-indigo-400 flex items-center justify-center shadow-sm"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 50}}
              , React.createElement(Sparkles, { className: "h-4.5 w-4.5 text-white"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 51}} )
            )
            , React.createElement('span', { className: "text-lg font-extrabold tracking-tight text-slate-900"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 53}}, "ScanLoyal")
          )

          , React.createElement('nav', { className: "hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 56}}
            , React.createElement('a', { href: "#features", className: "hover:text-primary transition-colors" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 57}}, "Features")
            , React.createElement('a', { href: "#how-it-works", className: "hover:text-primary transition-colors" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 58}}, "Product Flow" )
            , React.createElement('a', { href: "#interactive-preview", className: "hover:text-primary transition-colors" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 59}}, "Demo")
            , React.createElement('a', { href: "#pricing", className: "hover:text-primary transition-colors" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 60}}, "Pricing")
          )

          , React.createElement('div', { className: "flex items-center space-x-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 63}}
            , loading ? (
              React.createElement('div', { className: "h-8 w-20 rounded bg-slate-100 animate-pulse"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 65}} )
            ) : user ? (
              React.createElement(Link, { to: 
                user.role === "SUPER_ADMIN" ? "/dashboard/super" :
                user.role === "BUSINESS_ADMIN" ? "/dashboard/business" : "/dashboard"
              , __self: this, __source: {fileName: _jsxFileName, lineNumber: 67}}
                , React.createElement(Button, { size: "sm", className: "bg-primary hover:bg-primary/95 text-white shadow-sm flex items-center gap-1.5"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 71}}, "Go to Dashboard "
                     , React.createElement(ArrowRight, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 72}} )
                )
              )
            ) : (
              React.createElement(React.Fragment, null
                , React.createElement(Link, { to: "/login", __self: this, __source: {fileName: _jsxFileName, lineNumber: 77}}
                  , React.createElement(Button, { variant: "ghost", size: "sm", className: "text-slate-600 hover:text-slate-900 font-semibold"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 78}}, "Sign In"

                  )
                )
                , React.createElement(Link, { to: "/login?signup=true", __self: this, __source: {fileName: _jsxFileName, lineNumber: 82}}
                  , React.createElement(Button, { size: "sm", className: "bg-primary hover:bg-primary/95 text-white shadow-sm"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 83}}, "Get Started"

                  )
                )
              )
            )
          )
        )
      )

      /* 2. Hero Section */
      , React.createElement('section', { className: "relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 bg-gradient-to-b from-white to-[#F8FAFC]"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 94}}
        /* Soft atmospheric gradient background blurs */
        , React.createElement('div', { className: "absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 96}} )
        , React.createElement('div', { className: "absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 97}} )

        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 99}}
          , React.createElement('div', { className: "lg:col-span-6 space-y-6 text-left"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 100}}
            , React.createElement('div', { className: "inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[11px] font-bold text-primary uppercase tracking-wider animate-pulse"              , __self: this, __source: {fileName: _jsxFileName, lineNumber: 101}}
              , React.createElement(Sparkles, { className: "h-3.5 w-3.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 102}} )
              , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 103}}, "Next-Gen Customer Retention"  )
            )

            , React.createElement('h1', { className: "text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 106}}, "Transform Store Visits into "
                  , React.createElement('span', { className: "text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 107}}, "Loyal Customers" )
            )

            , React.createElement('p', { className: "text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 110}}, "Replace paper cards with modern QR check-ins. Create custom loyalty stamp cards, issue digital vouchers, and track retention analytics through our lightweight customer PWA."

            )

            , React.createElement('div', { className: "flex flex-col sm:flex-row gap-3 pt-2"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 114}}
              , React.createElement(Link, { to: "/login?signup=true", __self: this, __source: {fileName: _jsxFileName, lineNumber: 115}}
                , React.createElement(Button, { size: "lg", className: "w-full sm:w-auto bg-primary hover:bg-primary/95 text-white shadow-md shadow-indigo-500/10 px-8 text-sm"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 116}}, "Launch Your Loyalty Program "
                      , React.createElement(ArrowRight, { className: "ml-2 h-4 w-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 117}} )
                )
              )
              , React.createElement('a', { href: "#interactive-preview", __self: this, __source: {fileName: _jsxFileName, lineNumber: 120}}
                , React.createElement(Button, { variant: "outline", size: "lg", className: "w-full sm:w-auto border-slate-200 text-slate-700 hover:bg-slate-50 px-8 text-sm bg-white"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 121}}, "Try Live Simulator"

                )
              )
            )

            /* Quick Metrics */
            , React.createElement('div', { className: "grid grid-cols-3 gap-6 pt-8 border-t border-slate-200/80 max-w-md"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 128}}
              , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 129}}
                , React.createElement('span', { className: "block text-2xl font-black text-slate-900"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 130}}, "50m")
                , React.createElement('span', { className: "text-[10px] text-muted-foreground uppercase tracking-widest font-semibold"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 131}}, "GPS Radius check"  )
              )
              , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 133}}
                , React.createElement('span', { className: "block text-2xl font-black text-slate-900"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 134}}, "100%")
                , React.createElement('span', { className: "text-[10px] text-muted-foreground uppercase tracking-widest font-semibold"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 135}}, "Digital PWA" )
              )
              , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 137}}
                , React.createElement('span', { className: "block text-2xl font-black text-slate-900"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 138}}, "0s")
                , React.createElement('span', { className: "text-[10px] text-muted-foreground uppercase tracking-widest font-semibold"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 139}}, "App Store Install"  )
              )
            )
          )

          /* Interactive Card Mockup Preview */
          , React.createElement('div', { className: "lg:col-span-6 flex justify-center"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 145}}
            , React.createElement('div', { className: "relative w-full max-w-[420px] p-6 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100/60"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 146}}
              , React.createElement('div', { className: "absolute -top-3 -right-3 h-10 w-10 bg-indigo-50 rounded-full border border-indigo-100 flex items-center justify-center text-primary shadow-sm animate-bounce"              , __self: this, __source: {fileName: _jsxFileName, lineNumber: 147}}
                , React.createElement(Gift, { className: "h-5 w-5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 148}} )
              )

              , React.createElement('div', { className: "flex justify-between items-center pb-4 border-b border-slate-100"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 151}}
                , React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 152}}
                  , React.createElement('div', { className: "h-7 w-7 rounded bg-indigo-50 flex items-center justify-center text-primary text-[10px] font-black"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 153}}, "SL")
                  , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 154}}
                    , React.createElement('h3', { className: "text-xs font-bold text-slate-900"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 155}}, "ScanLoyal Premium Store"  )
                    , React.createElement('p', { className: "text-[9px] text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 156}}, "MG Road Outlet"  )
                  )
                )
                , React.createElement('span', { className: "text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-bold"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 159}}, "Verified Scan"

                )
              )

              , React.createElement('div', { className: "py-6 space-y-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 164}}
                , React.createElement('div', { className: "flex justify-between items-center"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 165}}
                  , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 166}}
                    , React.createElement('span', { className: "text-[9px] text-muted-foreground uppercase tracking-wider block font-bold"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 167}}, "Loyalty stamps card"  )
                    , React.createElement('span', { className: "text-sm font-black text-slate-950"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 168}}, "Earn 1 stamp per check-in"    )
                  )
                  , React.createElement('span', { className: "text-xs font-bold text-primary bg-indigo-50 px-2.5 py-1 rounded-lg"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 170}}
                    , stampsCount, " / "  , maxStamps, " Stamps"
                  )
                )

                , React.createElement('div', { className: "grid grid-cols-6 gap-2 pt-2"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 175}}
                  , Array.from({ length: maxStamps }).map((_, i) => {
                    const active = i < stampsCount;
                    return (
                      React.createElement('div', { 
                        key: i, 
                        onClick: () => toggleStamp(i),
                        className: `h-11 rounded-lg border flex items-center justify-center cursor-pointer transition-all duration-300 ${
                          active 
                            ? "bg-primary border-primary text-white scale-105 shadow-sm" 
                            : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
                        }`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 179}}

                        , active ? React.createElement(Star, { className: "h-5 w-5 fill-white text-white"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 188}} ) : React.createElement(Star, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 188}} )
                      )
                    );
                  })
                )
              )

              , React.createElement('div', { className: "bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2 text-left text-xs"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 195}}
                , React.createElement('div', { className: "flex items-center space-x-2 font-bold text-slate-900 text-[10px] uppercase tracking-wider"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 196}}
                  , React.createElement(Award, { className: "h-4 w-4 text-primary"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 197}} ), " Reward parameters"
                )
                , React.createElement('p', { className: "text-[11px] text-slate-600 leading-normal"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 199}}, "Unlock a "
                    , React.createElement('strong', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 200}}, "₹250 Gift Voucher"  ), " automatically upon completing all 6 stars stamps. Check-in restricted to 1 scan per day."
                )
              )
            )
          )
        )
      )

      /* 3. Features Section */
      , React.createElement('section', { id: "features", className: "py-20 md:py-28 border-t border-slate-200/60 bg-white"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 209}}
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 text-center space-y-12"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 210}}
          , React.createElement('div', { className: "max-w-2xl mx-auto space-y-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 211}}
            , React.createElement('span', { className: "text-xs font-bold text-primary uppercase tracking-wider block"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 212}}, "Comprehensive SaaS Features"  )
            , React.createElement('h2', { className: "text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 213}}, "Designed to Grow Store Customer Retention"

            )
            , React.createElement('p', { className: "text-sm sm:text-base text-slate-500 leading-relaxed"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 216}}, "We provide merchants with the tools to create premium digital loyalty stamp programs and verify scans using location guardrails."

            )
          )

          , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-8 pt-4"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 221}}

            /* Feature 1 */
            , React.createElement(Card, { className: "border-slate-200 bg-slate-50/50 hover:bg-white transition-all duration-300 hover:shadow-lg hover:shadow-slate-100/80"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 224}}
              , React.createElement(CardHeader, { className: "text-left space-y-3" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 225}}
                , React.createElement('div', { className: "h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-primary"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 226}}
                  , React.createElement(QrCode, { className: "h-5.5 w-5.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 227}} )
                )
                , React.createElement(CardTitle, { className: "text-lg font-bold text-slate-900"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 229}}, "Permanent QR Codes"  )
                , React.createElement(CardDescription, { className: "text-xs leading-normal" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 230}}, "Create a single permanent QR code for your reception desks, salon counters, or tables. Download as high-quality PNG or PDF to print."

                )
              )
            )

            /* Feature 2 */
            , React.createElement(Card, { className: "border-slate-200 bg-slate-50/50 hover:bg-white transition-all duration-300 hover:shadow-lg hover:shadow-slate-100/80"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 237}}
              , React.createElement(CardHeader, { className: "text-left space-y-3" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 238}}
                , React.createElement('div', { className: "h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 239}}
                  , React.createElement(MapPin, { className: "h-5.5 w-5.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 240}} )
                )
                , React.createElement(CardTitle, { className: "text-lg font-bold text-slate-900"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 242}}, "GPS Location Guardrail"  )
                , React.createElement(CardDescription, { className: "text-xs leading-normal" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 243}}, "Ensure authenticity. Our verification system cross-references customer coordinates with outlet coordinates to block out-of-store check-in attempts."

                )
              )
            )

            /* Feature 3 */
            , React.createElement(Card, { className: "border-slate-200 bg-slate-50/50 hover:bg-white transition-all duration-300 hover:shadow-lg hover:shadow-slate-100/80"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 250}}
              , React.createElement(CardHeader, { className: "text-left space-y-3" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 251}}
                , React.createElement('div', { className: "h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 252}}
                  , React.createElement(Smartphone, { className: "h-5.5 w-5.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 253}} )
                )
                , React.createElement(CardTitle, { className: "text-lg font-bold text-slate-900"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 255}}, "Lightweight Customer PWA"  )
                , React.createElement(CardDescription, { className: "text-xs leading-normal" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 256}}, "No app download barrier. Customers scan a QR code, receive a quick OTP, and immediately see their stamp cards and unlocked vouchers."

                )
              )
            )

            /* Feature 4 */
            , React.createElement(Card, { className: "border-slate-200 bg-slate-50/50 hover:bg-white transition-all duration-300 hover:shadow-lg hover:shadow-slate-100/80"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 263}}
              , React.createElement(CardHeader, { className: "text-left space-y-3" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 264}}
                , React.createElement('div', { className: "h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-primary"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 265}}
                  , React.createElement(Award, { className: "h-5.5 w-5.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 266}} )
                )
                , React.createElement(CardTitle, { className: "text-lg font-bold text-slate-900"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 268}}, "Automated Voucher Issuance"  )
                , React.createElement(CardDescription, { className: "text-xs leading-normal" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 269}}, "Vouchers trigger immediately upon stamp card completion. Cache redemption codes are saved in the client's wallet for cashier checkout validation."

                )
              )
            )

            /* Feature 5 */
            , React.createElement(Card, { className: "border-slate-200 bg-slate-50/50 hover:bg-white transition-all duration-300 hover:shadow-lg hover:shadow-slate-100/80"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 276}}
              , React.createElement(CardHeader, { className: "text-left space-y-3" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 277}}
                , React.createElement('div', { className: "h-10 w-10 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 278}}
                  , React.createElement(Activity, { className: "h-5.5 w-5.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 279}} )
                )
                , React.createElement(CardTitle, { className: "text-lg font-bold text-slate-900"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 281}}, "Real-time Retail Analytics"  )
                , React.createElement(CardDescription, { className: "text-xs leading-normal" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 282}}, "Monitor repeat customer check-in rates, active branches metrics, rewards redemption split, and analyze cohort customer retention rates."

                )
              )
            )

            /* Feature 6 */
            , React.createElement(Card, { className: "border-slate-200 bg-slate-50/50 hover:bg-white transition-all duration-300 hover:shadow-lg hover:shadow-slate-100/80"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 289}}
              , React.createElement(CardHeader, { className: "text-left space-y-3" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 290}}
                , React.createElement('div', { className: "h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 291}}
                  , React.createElement(ShieldCheck, { className: "h-5.5 w-5.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 292}} )
                )
                , React.createElement(CardTitle, { className: "text-lg font-bold text-slate-900"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 294}}, "Audit & Fraud Protection"   )
                , React.createElement(CardDescription, { className: "text-xs leading-normal" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 295}}, "Track suspicious geolocation scans, spoofed IPs, or impossible coordinate leaps. Secure tokens prevent QR duplication or sharing."

                )
              )
            )

          )
        )
      )

      /* 4. Product Flow Timeline */
      , React.createElement('section', { id: "how-it-works", className: "py-20 md:py-28 border-t border-slate-200/60 bg-[#F8FAFC]"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 306}}
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 text-center space-y-12"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 307}}
          , React.createElement('div', { className: "max-w-2xl mx-auto space-y-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 308}}
            , React.createElement('span', { className: "text-xs font-bold text-primary uppercase tracking-wider block"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 309}}, "Seamless Operation" )
            , React.createElement('h2', { className: "text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 310}}, "A 4-Step Checkout Flow"

            )
            , React.createElement('p', { className: "text-sm sm:text-base text-slate-500 leading-relaxed"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 313}}, "We make the experience smooth for both the business owner and the customer visiting the store."

            )
          )

          , React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 text-left"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 318}}
            , React.createElement('div', { className: "bg-white p-6 rounded-2xl border border-slate-200 relative overflow-hidden shadow-sm"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 319}}
              , React.createElement('span', { className: "text-4xl font-black text-slate-100 absolute right-4 top-2 select-none"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 320}}, "01")
              , React.createElement('div', { className: "h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-primary font-bold text-sm mb-4 relative z-10"            , __self: this, __source: {fileName: _jsxFileName, lineNumber: 321}}, "1")
              , React.createElement('h3', { className: "text-sm font-bold text-slate-900 mb-1.5"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 322}}, "Create & Print QR"   )
              , React.createElement('p', { className: "text-xs text-slate-500 leading-normal"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 323}}, "Businesses generate permanent QR codes and display them inside their storefronts (billing counters, cafe tables, hotels)."

              )
            )

            , React.createElement('div', { className: "bg-white p-6 rounded-2xl border border-slate-200 relative overflow-hidden shadow-sm"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 328}}
              , React.createElement('span', { className: "text-4xl font-black text-slate-100 absolute right-4 top-2 select-none"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 329}}, "02")
              , React.createElement('div', { className: "h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-primary font-bold text-sm mb-4 relative z-10"            , __self: this, __source: {fileName: _jsxFileName, lineNumber: 330}}, "2")
              , React.createElement('h3', { className: "text-sm font-bold text-slate-900 mb-1.5"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 331}}, "Scan & Verify Location"   )
              , React.createElement('p', { className: "text-xs text-slate-500 leading-normal"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 332}}, "Customers scan the printed code with their smartphones. The PWA opens and verifies their GPS location coordinate parameters."

              )
            )

            , React.createElement('div', { className: "bg-white p-6 rounded-2xl border border-slate-200 relative overflow-hidden shadow-sm"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 337}}
              , React.createElement('span', { className: "text-4xl font-black text-slate-100 absolute right-4 top-2 select-none"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 338}}, "03")
              , React.createElement('div', { className: "h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-primary font-bold text-sm mb-4 relative z-10"            , __self: this, __source: {fileName: _jsxFileName, lineNumber: 339}}, "3")
              , React.createElement('h3', { className: "text-sm font-bold text-slate-900 mb-1.5"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 340}}, "Earn Digital Stamps"  )
              , React.createElement('p', { className: "text-xs text-slate-500 leading-normal"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 341}}, "Customers receive digital check-in stamps. Their streak and totals are calculated instantly in their mobile client wallets."

              )
            )

            , React.createElement('div', { className: "bg-white p-6 rounded-2xl border border-slate-200 relative overflow-hidden shadow-sm"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 346}}
              , React.createElement('span', { className: "text-4xl font-black text-slate-100 absolute right-4 top-2 select-none"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 347}}, "04")
              , React.createElement('div', { className: "h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-primary font-bold text-sm mb-4 relative z-10"            , __self: this, __source: {fileName: _jsxFileName, lineNumber: 348}}, "4")
              , React.createElement('h3', { className: "text-sm font-bold text-slate-900 mb-1.5"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 349}}, "Claim Reward Voucher"  )
              , React.createElement('p', { className: "text-xs text-slate-500 leading-normal"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 350}}, "Upon stamp card completion, rewards unlock automatically. The cashier reviews the claim code and applies the discount at checkout."

              )
            )
          )
        )
      )

      /* 5. Interactive Demo Section */
      , React.createElement('section', { id: "interactive-preview", className: "py-20 md:py-28 border-t border-slate-200/60 bg-white"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 359}}
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 360}}
          , React.createElement('div', { className: "lg:col-span-5 space-y-6 text-left"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 361}}
            , React.createElement('span', { className: "text-xs font-bold text-primary uppercase tracking-wider block"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 362}}, "Interactive Playground" )
            , React.createElement('h2', { className: "text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 363}}, "Test Our Stamp Simulator Live"

            )
            , React.createElement('p', { className: "text-sm sm:text-base text-slate-500 leading-relaxed"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 366}}, "Experience the PWA interface layout that your customers will see on their smartphones. Click on any star stamp block to simulate scanning a verification QR code at checkout!"

            )
            , React.createElement('div', { className: "p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2 text-xs text-slate-650"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 369}}
              , React.createElement('div', { className: "font-bold flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-900"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 370}}
                , React.createElement(Check, { className: "h-4 w-4 text-emerald-600"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 371}} ), " Interactive Mechanics"
              )
              , React.createElement('p', { className: "leading-normal", __self: this, __source: {fileName: _jsxFileName, lineNumber: 373}}, "Clicking stamps toggles their status. Complete all "
                       , maxStamps, " stars to unlock the success mock badge dialog."
              )
            )
          )

          , React.createElement('div', { className: "lg:col-span-7 flex justify-center"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 379}}
            , React.createElement('div', { className: "w-full max-w-[440px] p-6 bg-slate-50 border border-slate-200 rounded-3xl relative shadow-md"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 380}}
              , React.createElement('div', { className: "bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-6"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 381}}

                /* Simulated PWA Header */
                , React.createElement('div', { className: "flex justify-between items-center pb-3 border-b border-slate-100"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 384}}
                  , React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 385}}
                    , React.createElement('div', { className: "h-8 w-8 rounded-full bg-indigo-50 text-primary flex items-center justify-center text-xs font-bold shadow-sm"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 386}}, "S"

                    )
                    , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 389}}
                      , React.createElement('h4', { className: "text-xs font-bold text-slate-950"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 390}}, "ScanLoyal PWA Demo"  )
                      , React.createElement('p', { className: "text-[8px] text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 391}}, "Coordinates: 20.2961, 85.8245"  )
                    )
                  )
                  , React.createElement('span', { className: "text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-semibold"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 394}}, "Live Demo"

                  )
                )

                /* Stamp Board */
                , React.createElement('div', { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 400}}
                  , React.createElement('div', { className: "flex justify-between items-center"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 401}}
                    , React.createElement('span', { className: "text-xs font-bold text-slate-800"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 402}}, "Your stamps card:"  )
                    , React.createElement('span', { className: "text-xs text-primary font-mono font-bold"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 403}}
                      , stampsCount, " / "  , maxStamps, " Completed"
                    )
                  )

                  , React.createElement('div', { className: "grid grid-cols-3 gap-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 408}}
                    , Array.from({ length: maxStamps }).map((_, idx) => {
                      const active = idx < stampsCount;
                      return (
                        React.createElement('button', {
                          key: idx,
                          onClick: () => toggleStamp(idx),
                          className: `h-16 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                            active 
                              ? "bg-primary border-primary text-white scale-105 shadow-md shadow-indigo-500/10" 
                              : "bg-white border-slate-200 text-slate-350 hover:border-slate-350 hover:bg-slate-50/50"
                          }`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 412}}

                          , React.createElement(Star, { className: `h-6 w-6 ${active ? "fill-white text-white" : ""}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 421}} )
                          , React.createElement('span', { className: "text-[9px]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 422}}, active ? "Stamped" : `Star ${idx + 1}`)
                        )
                      );
                    })
                  )
                )

                /* Simulated Success dialog card */
                , stampsCount === maxStamps ? (
                  React.createElement('div', { className: "bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-3 animate-fade-in"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 431}}
                    , React.createElement('div', { className: "h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 432}}
                      , React.createElement(Check, { className: "h-6 w-6" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 433}} )
                    )
                    , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 435}}
                      , React.createElement('h5', { className: "text-xs font-black text-emerald-800"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 436}}, "Voucher Unlocked! 🎉"  )
                      , React.createElement('p', { className: "text-[10px] text-emerald-700" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 437}}, "Code: " , React.createElement('code', { className: "bg-emerald-100 font-mono px-1 py-0.5 rounded font-bold text-emerald-900"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 437}}, "DEMO-STAMP-100"))
                    )
                  )
                ) : (
                  React.createElement('div', { className: "bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center space-x-3 text-left"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 441}}
                    , React.createElement(HelpCircle, { className: "h-5 w-5 text-indigo-400 shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 442}} )
                    , React.createElement('p', { className: "text-[10px] text-slate-500 leading-snug"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 443}}, "Tap the remaining gray stars to complete the stamp card and simulate reward validation!"

                    )
                  )
                )
              )
            )
          )
        )
      )

      /* 6. Pricing Plans */
      , React.createElement('section', { id: "pricing", className: "py-20 md:py-28 border-t border-slate-200/60 bg-[#F8FAFC]"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 455}}
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 text-center space-y-12"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 456}}
          , React.createElement('div', { className: "max-w-2xl mx-auto space-y-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 457}}
            , React.createElement('span', { className: "text-xs font-bold text-primary uppercase tracking-wider block"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 458}}, "Simple SaaS Plans"  )
            , React.createElement('h2', { className: "text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 459}}, "Flexible Tiers for Every Storefront"

            )
            , React.createElement('p', { className: "text-sm sm:text-base text-slate-500 leading-relaxed"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 462}}, "No hidden fees. Choose a subscription package to scale customer check-ins and reward configurations."

            )

            /* Toggle */
            , React.createElement('div', { className: "inline-flex items-center bg-slate-200/60 p-1.5 rounded-full border border-slate-200/30 mt-2"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 467}}
              , React.createElement('button', { 
                onClick: () => setPricingPeriod("monthly"),
                className: `px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  pricingPeriod === "monthly" ? "bg-white text-slate-950 shadow-sm" : "text-slate-650 hover:text-slate-950"
                }`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 468}}
, "Bill Monthly"

              )
              , React.createElement('button', { 
                onClick: () => setPricingPeriod("yearly"),
                className: `px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  pricingPeriod === "yearly" ? "bg-white text-slate-950 shadow-sm" : "text-slate-650 hover:text-slate-950"
                }`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 476}}
, "Bill Yearly "
                  , React.createElement('span', { className: "bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-100"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 482}}, "Save 20%" )
              )
            )
          )

          , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 items-stretch max-w-5xl mx-auto"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 487}}

            /* Starter Plan */
            , React.createElement('div', { className: "bg-white p-8 rounded-3xl border border-slate-200/80 flex flex-col justify-between shadow-sm relative"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 490}}
              , React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 491}}
                , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 492}}
                  , React.createElement('span', { className: "text-xs font-bold text-muted-foreground uppercase tracking-wider block"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 493}}, "Starter Tier" )
                  , React.createElement('h4', { className: "text-xl font-bold text-slate-950 mt-1"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 494}}, "STARTER")
                )

                , React.createElement('div', { className: "flex items-baseline space-x-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 497}}
                  , React.createElement('span', { className: "text-4xl font-black text-slate-900"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 498}}, "₹"
                    , pricingPeriod === "monthly" ? "999" : "799"
                  )
                  , React.createElement('span', { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 501}}, "/ month" )
                )

                , React.createElement('p', { className: "text-xs text-slate-500 leading-relaxed"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 504}}, "Perfect for local cafes, bakeries or salon shops launching their first loyalty cards."

                )

                , React.createElement('div', { className: "h-px bg-slate-100 w-full"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 508}} )

                , React.createElement('ul', { className: "space-y-3 text-xs text-slate-650 text-left"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 510}}
                  , React.createElement('li', { className: "flex items-center space-x-2.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 511}}
                    , React.createElement(Check, { className: "h-4 w-4 text-primary shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 512}} )
                    , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 513}}, "Max " , React.createElement('strong', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 513}}, "1 Branch" ), " Outlet" )
                  )
                  , React.createElement('li', { className: "flex items-center space-x-2.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 515}}
                    , React.createElement(Check, { className: "h-4 w-4 text-primary shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 516}} )
                    , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 517}}, "Max " , React.createElement('strong', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 517}}, "500 Customers" ))
                  )
                  , React.createElement('li', { className: "flex items-center space-x-2.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 519}}
                    , React.createElement(Check, { className: "h-4 w-4 text-primary shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 520}} )
                    , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 521}}, "Download QR as PDF/PNG"   )
                  )
                  , React.createElement('li', { className: "flex items-center space-x-2.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 523}}
                    , React.createElement(Check, { className: "h-4 w-4 text-primary shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 524}} )
                    , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 525}}, "Standard Analytics" )
                  )
                )
              )

              , React.createElement('div', { className: "pt-8 w-full" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 530}}
                , React.createElement(Link, { to: "/login?signup=true", className: "w-full", __self: this, __source: {fileName: _jsxFileName, lineNumber: 531}}
                  , React.createElement(Button, { variant: "outline", className: "w-full text-xs font-semibold h-11 bg-white border-slate-200 text-slate-800 hover:bg-slate-50"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 532}}, "Start Starter Trial"

                  )
                )
              )
            )

            /* Growth Plan */
            , React.createElement('div', { className: "bg-white p-8 rounded-3xl border-2 border-primary flex flex-col justify-between shadow-md relative scale-105"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 540}}
              , React.createElement('span', { className: "absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-400"              , __self: this, __source: {fileName: _jsxFileName, lineNumber: 541}}, "Most Popular"

              )

              , React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 545}}
                , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 546}}
                  , React.createElement('span', { className: "text-xs font-bold text-primary uppercase tracking-wider block"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 547}}, "Growth Tier" )
                  , React.createElement('h4', { className: "text-xl font-bold text-slate-950 mt-1"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 548}}, "GROWTH")
                )

                , React.createElement('div', { className: "flex items-baseline space-x-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 551}}
                  , React.createElement('span', { className: "text-4xl font-black text-slate-900"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 552}}, "₹"
                    , pricingPeriod === "monthly" ? "2,499" : "1,999"
                  )
                  , React.createElement('span', { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 555}}, "/ month" )
                )

                , React.createElement('p', { className: "text-xs text-slate-500 leading-relaxed"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 558}}, "Best choice for retail chains, gyms, or restaurant brands scaling customer stamps."

                )

                , React.createElement('div', { className: "h-px bg-slate-100 w-full"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 562}} )

                , React.createElement('ul', { className: "space-y-3 text-xs text-slate-650 text-left"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 564}}
                  , React.createElement('li', { className: "flex items-center space-x-2.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 565}}
                    , React.createElement(Check, { className: "h-4 w-4 text-primary shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 566}} )
                    , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 567}}, "Max " , React.createElement('strong', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 567}}, "5 Branch" ), " Outlets" )
                  )
                  , React.createElement('li', { className: "flex items-center space-x-2.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 569}}
                    , React.createElement(Check, { className: "h-4 w-4 text-primary shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 570}} )
                    , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 571}}, "Max " , React.createElement('strong', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 571}}, "3,000 Customers" ))
                  )
                  , React.createElement('li', { className: "flex items-center space-x-2.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 573}}
                    , React.createElement(Check, { className: "h-4 w-4 text-primary shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 574}} )
                    , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 575}}, "Advanced Analytics Ledger"  )
                  )
                  , React.createElement('li', { className: "flex items-center space-x-2.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 577}}
                    , React.createElement(Check, { className: "h-4 w-4 text-primary shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 578}} )
                    , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 579}}, "White-label Custom Branding"  )
                  )
                  , React.createElement('li', { className: "flex items-center space-x-2.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 581}}
                    , React.createElement(Check, { className: "h-4 w-4 text-primary shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 582}} )
                    , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 583}}, "CSV/Excel Data Export"  )
                  )
                )
              )

              , React.createElement('div', { className: "pt-8 w-full" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 588}}
                , React.createElement(Link, { to: "/login?signup=true", className: "w-full", __self: this, __source: {fileName: _jsxFileName, lineNumber: 589}}
                  , React.createElement(Button, { className: "w-full text-xs font-semibold h-11 bg-primary text-white hover:bg-primary/95 shadow-sm"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 590}}, "Start Growth Trial"

                  )
                )
              )
            )

            /* Enterprise Plan */
            , React.createElement('div', { className: "bg-white p-8 rounded-3xl border border-slate-200/80 flex flex-col justify-between shadow-sm relative"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 598}}
              , React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 599}}
                , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 600}}
                  , React.createElement('span', { className: "text-xs font-bold text-muted-foreground uppercase tracking-wider block"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 601}}, "Enterprise Tier" )
                  , React.createElement('h4', { className: "text-xl font-bold text-slate-950 mt-1"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 602}}, "ENTERPRISE")
                )

                , React.createElement('div', { className: "flex items-baseline space-x-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 605}}
                  , React.createElement('span', { className: "text-4xl font-black text-slate-900"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 606}}, "₹"
                    , pricingPeriod === "monthly" ? "5,999" : "4,799"
                  )
                  , React.createElement('span', { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 609}}, "/ month" )
                )

                , React.createElement('p', { className: "text-xs text-slate-500 leading-relaxed"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 612}}, "Built for hyper-growth enterprises requiring developer API access and dedicated support."

                )

                , React.createElement('div', { className: "h-px bg-slate-100 w-full"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 616}} )

                , React.createElement('ul', { className: "space-y-3 text-xs text-slate-650 text-left"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 618}}
                  , React.createElement('li', { className: "flex items-center space-x-2.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 619}}
                    , React.createElement(Check, { className: "h-4 w-4 text-primary shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 620}} )
                    , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 621}}, React.createElement('strong', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 621}}, "Unlimited"), " Branches" )
                  )
                  , React.createElement('li', { className: "flex items-center space-x-2.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 623}}
                    , React.createElement(Check, { className: "h-4 w-4 text-primary shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 624}} )
                    , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 625}}, React.createElement('strong', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 625}}, "Unlimited"), " Customers" )
                  )
                  , React.createElement('li', { className: "flex items-center space-x-2.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 627}}
                    , React.createElement(Check, { className: "h-4 w-4 text-primary shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 628}} )
                    , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 629}}, "Custom White-label Branding"  )
                  )
                  , React.createElement('li', { className: "flex items-center space-x-2.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 631}}
                    , React.createElement(Check, { className: "h-4 w-4 text-primary shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 632}} )
                    , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 633}}, "Developer REST APIs Access"   )
                  )
                  , React.createElement('li', { className: "flex items-center space-x-2.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 635}}
                    , React.createElement(Check, { className: "h-4 w-4 text-primary shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 636}} )
                    , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 637}}, "24/7 Dedicated Support"  )
                  )
                )
              )

              , React.createElement('div', { className: "pt-8 w-full" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 642}}
                , React.createElement(Link, { to: "/login?signup=true", className: "w-full", __self: this, __source: {fileName: _jsxFileName, lineNumber: 643}}
                  , React.createElement(Button, { variant: "outline", className: "w-full text-xs font-semibold h-11 bg-white border-slate-200 text-slate-800 hover:bg-slate-50"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 644}}, "Contact Enterprise Sales"

                  )
                )
              )
            )

          )
        )
      )

      /* 7. CTA Section */
      , React.createElement('section', { className: "py-20 md:py-24 bg-white border-t border-slate-200/60 relative overflow-hidden"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 656}}
        , React.createElement('div', { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 657}} )

        , React.createElement('div', { className: "max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 659}}
          , React.createElement('h2', { className: "text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 660}}, "Ready to Upgrade Your Customer Loyalty?"

          )
          , React.createElement('p', { className: "text-sm sm:text-base text-slate-500 leading-relaxed max-w-xl mx-auto"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 663}}, "Join other growing storefronts that trust ScanLoyal to incentivize return visits, prevent check-in fraud, and manage discount vouchers easily."

          )
          , React.createElement('div', { className: "pt-2 flex flex-col sm:flex-row gap-3 justify-center"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 666}}
            , React.createElement(Link, { to: "/login?signup=true", __self: this, __source: {fileName: _jsxFileName, lineNumber: 667}}
              , React.createElement(Button, { size: "lg", className: "bg-primary hover:bg-primary/95 text-white shadow-md shadow-indigo-500/10 px-8"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 668}}, "Create Free Owner Account"

              )
            )
            , React.createElement(Link, { to: "/login", __self: this, __source: {fileName: _jsxFileName, lineNumber: 672}}
              , React.createElement(Button, { variant: "outline", size: "lg", className: "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 px-8"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 673}}, "Login to Console"

              )
            )
          )
        )
      )

      /* 8. Global Footer */
      , React.createElement('footer', { className: "bg-slate-900 text-slate-400 py-12 border-t border-slate-800"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 682}}
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 683}}
          , React.createElement('div', { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 684}}
            , React.createElement('div', { className: "flex items-center space-x-2.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 685}}
              , React.createElement('div', { className: "h-7 w-7 rounded bg-gradient-to-tr from-primary to-indigo-400 flex items-center justify-center"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 686}}
                , React.createElement(Sparkles, { className: "h-4 w-4 text-white"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 687}} )
              )
              , React.createElement('span', { className: "text-base font-extrabold text-white"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 689}}, "ScanLoyal")
            )
            , React.createElement('p', { className: "text-xs leading-relaxed max-w-xs"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 691}}, "Modern digital stamp cards and GPS location verification for storefront customer retention."

            )
          )

          , React.createElement('div', { className: "space-y-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 696}}
            , React.createElement('h5', { className: "text-xs font-bold text-white uppercase tracking-wider"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 697}}, "Product")
            , React.createElement('ul', { className: "space-y-2 text-xs" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 698}}
              , React.createElement('li', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 699}}, React.createElement('a', { href: "#features", className: "hover:text-white transition-colors" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 699}}, "Features"))
              , React.createElement('li', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 700}}, React.createElement('a', { href: "#how-it-works", className: "hover:text-white transition-colors" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 700}}, "Product Flow" ))
              , React.createElement('li', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 701}}, React.createElement('a', { href: "#pricing", className: "hover:text-white transition-colors" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 701}}, "Pricing Options" ))
            )
          )

          , React.createElement('div', { className: "space-y-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 705}}
            , React.createElement('h5', { className: "text-xs font-bold text-white uppercase tracking-wider"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 706}}, "Security")
            , React.createElement('ul', { className: "space-y-2 text-xs" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 707}}
              , React.createElement('li', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 708}}, React.createElement('span', { className: "text-slate-500", __self: this, __source: {fileName: _jsxFileName, lineNumber: 708}}, "GPS Validation" ))
              , React.createElement('li', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 709}}, React.createElement('span', { className: "text-slate-500", __self: this, __source: {fileName: _jsxFileName, lineNumber: 709}}, "Secure Tokens" ))
              , React.createElement('li', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 710}}, React.createElement('span', { className: "text-slate-500", __self: this, __source: {fileName: _jsxFileName, lineNumber: 710}}, "Anti-Spoofing Logs" ))
            )
          )

          , React.createElement('div', { className: "space-y-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 714}}
            , React.createElement('h5', { className: "text-xs font-bold text-white uppercase tracking-wider"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 715}}, "Legal")
            , React.createElement('ul', { className: "space-y-2 text-xs" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 716}}
              , React.createElement('li', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 717}}, React.createElement('span', { className: "text-slate-500", __self: this, __source: {fileName: _jsxFileName, lineNumber: 717}}, "Privacy Policy" ))
              , React.createElement('li', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 718}}, React.createElement('span', { className: "text-slate-500", __self: this, __source: {fileName: _jsxFileName, lineNumber: 718}}, "Terms of Service"  ))
              , React.createElement('li', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 719}}, React.createElement('span', { className: "text-slate-500", __self: this, __source: {fileName: _jsxFileName, lineNumber: 719}}, "Support Desk" ))
            )
          )
        )

        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 pt-8 mt-8 border-t border-slate-800/80 flex flex-col md:flex-row justify-between items-center text-xs"            , __self: this, __source: {fileName: _jsxFileName, lineNumber: 724}}
          , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 725}}, "© " , new Date().getFullYear(), " ScanLoyal SaaS. All rights reserved."     )
          , React.createElement('span', { className: "text-[10px] text-slate-500 mt-2 md:mt-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 726}}, "Made for retail store retention in India"      )
        )
      )

    )
  );
}

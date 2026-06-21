import { useNavigate, Link } from "react-router-dom";
const _jsxFileName = "src\\pages\\page.tsx";"use client";

import React, { useState, useEffect } from "react";

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
  Stamp,
  Activity,

  HelpCircle
} from "lucide-react";


export default function LandingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuthStore();
  const [stampsCount, setStampsCount] = useState(3);
  const [totalScans, setTotalScans] = useState(847);

  useEffect(() => {
    const fetchTotalScans = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";
        const response = await fetch(`${apiUrl}/checkins/public/count`);
        if (response.ok) {
          const resData = await response.json();
          if (resData.success && typeof resData.data.count === 'number') {
            setTotalScans(resData.data.count);
          }
        }
      } catch (err) {
        console.error("Failed to fetch public scan count:", err);
      }
    };

    fetchTotalScans();
    const interval = setInterval(fetchTotalScans, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

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
    React.createElement('div', { className: "min-h-screen bg-white text-[#2B201A] font-sans selection:bg-[#FF6A00]/10 selection:text-[#2B201A] bg-dots"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 44}}

      /* 1. Global Navigation Bar */
      , React.createElement('header', { className: "sticky top-0 z-50 w-full border-b border-[#EAE3DF]/50 bg-white/75 backdrop-blur-md"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 47}}
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 h-16 flex items-center justify-between"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 48}}
          , React.createElement('div', { className: "flex items-center space-x-3" }
            , React.createElement('img', { src: "/image.png", alt: "LogiSaar Logo", className: "h-8 w-auto object-contain" })
            , React.createElement('div', { className: "flex flex-col justify-center" }
              , React.createElement('span', { className: "text-sm font-extrabold tracking-tight text-[#2B201A] leading-tight" }, "LogiSaar")
              , React.createElement('span', { className: "text-[9px] font-black text-[#FF6A00] uppercase tracking-wider leading-none" }, "ScanLoyal")
            )
          )

          , React.createElement('nav', { className: "hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider text-[#5A4E46]"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 56}}
            , React.createElement('a', { href: "#features", className: "hover:text-[#FF6A00] transition-colors" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 57}}, "Features")
            , React.createElement('a', { href: "#how-it-works", className: "hover:text-[#FF6A00] transition-colors" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 58}}, "Product Flow" )
            , React.createElement('a', { href: "#interactive-preview", className: "hover:text-[#FF6A00] transition-colors" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 59}}, "Demo")
            , React.createElement('a', { href: "#pricing", className: "hover:text-[#FF6A00] transition-colors" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 60}}, "Pricing")
          )

          , React.createElement('div', { className: "flex items-center space-x-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 63}}
            , loading ? (
              React.createElement('div', { className: "h-8 w-20 rounded-xl bg-[#F2ECE9] animate-pulse"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 65}} )
            ) : user ? (
              React.createElement(Link, { to: 
                user.role === "SUPER_ADMIN" ? "/dashboard/super" :
                user.role === "BUSINESS_ADMIN" ? "/dashboard/business" : "/dashboard"
              , __self: this, __source: {fileName: _jsxFileName, lineNumber: 67}}
                , React.createElement(Button, { size: "sm", className: "bg-[#FF6A00] hover:bg-[#E05E00] text-white shadow-md shadow-[#FF6A00]/10 rounded-xl flex items-center gap-1.5 font-bold"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 71}}, "Go to Dashboard "
                     , React.createElement(ArrowRight, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 72}} )
                )
              )
            ) : (
              React.createElement(React.Fragment, null
                , React.createElement(Link, { to: "/login", __self: this, __source: {fileName: _jsxFileName, lineNumber: 77}}
                  , React.createElement(Button, { variant: "ghost", size: "sm", className: "text-[#5A4E46] hover:text-[#2B201A] font-bold text-xs uppercase tracking-wider"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 78}}, "Sign In"

                  )
                )
                , React.createElement(Link, { to: "/login?signup=true", __self: this, __source: {fileName: _jsxFileName, lineNumber: 82}}
                  , React.createElement(Button, { size: "sm", className: "bg-[#FF6A00] hover:bg-[#E05E00] text-white shadow-md shadow-[#FF6A00]/15 rounded-xl font-bold text-xs"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 83}}, "Get Started"

                  )
                )
              )
            )
          )
        )
      )

      /* 2. Hero Section — New Centered Split Layout */
      , React.createElement('section', { className: "relative overflow-hidden bg-[#FAF8F6] border-b border-[#EAE3DF]/40" }

        /* Background blobs */
        , React.createElement('div', { className: "absolute -top-32 left-1/3 w-[700px] h-[700px] bg-[#FF6A00]/8 rounded-full blur-3xl pointer-events-none" })
        , React.createElement('div', { className: "absolute bottom-0 left-0 w-80 h-80 bg-[#800020]/10 rounded-full blur-3xl pointer-events-none" })
        , React.createElement('div', { className: "absolute top-1/2 right-0 w-72 h-72 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" })

        /* Dot grid overlay */
        , React.createElement('div', { className: "absolute inset-0 bg-dots opacity-60 pointer-events-none" })

        /* ── TOP: Centered headline block ── */
        , React.createElement('div', { className: "relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-10 text-center" }



          /* Main headline */
          , React.createElement('h1', { className: "text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#2B201A] leading-[1.05] mb-5" }
            , "Turn Every Visit Into a "
            , React.createElement('br', null)
            , React.createElement('span', { style: { background: "linear-gradient(135deg, #FF6A00 0%, #800020 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" } }
              , "Loyal Customer"
            )
          )

          /* Sub-description */
          , React.createElement('p', { className: "text-base sm:text-lg text-[#5A4E46] leading-relaxed max-w-2xl mx-auto mb-8" }
            , "Replace paper punch cards with modern QR check-ins. Design custom stamp cards, issue digital vouchers, and track retention — all without an app download."
          )

          /* CTA Buttons — centered row */
          , React.createElement('div', { className: "flex flex-col sm:flex-row items-center justify-center gap-4 mb-12" }
            , React.createElement(Link, { to: "/login?signup=true" }
              , React.createElement(Button, { size: "lg", className: "bg-[#FF6A00] hover:bg-[#E05E00] text-white shadow-lg shadow-[#FF6A00]/20 px-10 h-13 rounded-2xl text-sm font-bold transition-all hover:scale-[1.03] duration-200 flex items-center gap-2" }
                , "Launch Your Program"
                , React.createElement(ArrowRight, { className: "h-4 w-4" })
              )
            )
            , React.createElement('a', { href: "#interactive-preview" }
              , React.createElement(Button, { variant: "outline", size: "lg", className: "border-[#FF6A00]/30 text-[#5A4E46] hover:bg-white hover:text-[#2B201A] hover:border-[#FF6A00]/50 px-8 h-13 rounded-2xl text-sm font-bold transition-all duration-200 bg-white/60 backdrop-blur-sm" }
                , "Try Live Demo"
              )
            )
          )

          /* Floating stat pills row */
          , React.createElement('div', { className: "flex flex-wrap items-center justify-center gap-3 mb-14" }
            , React.createElement('div', { className: "flex items-center gap-2 bg-white/60 backdrop-blur-md border border-[#FF6A00]/15 rounded-full px-4 py-2 shadow-sm" }
              , React.createElement(MapPin, { className: "h-3.5 w-3.5 text-[#FF6A00]" })
              , React.createElement('span', { className: "text-[11px] font-black text-[#2B201A]" }, "50m GPS Guard")
            )
            , React.createElement('div', { className: "flex items-center gap-2 bg-white/60 backdrop-blur-md border border-[#FF6A00]/15 rounded-full px-4 py-2 shadow-sm" }
              , React.createElement(Smartphone, { className: "h-3.5 w-3.5 text-[#FF6A00]" })
              , React.createElement('span', { className: "text-[11px] font-black text-[#2B201A]" }, "100% Digital PWA")
            )
            , React.createElement('div', { className: "flex items-center gap-2 bg-white/60 backdrop-blur-md border border-[#FF6A00]/15 rounded-full px-4 py-2 shadow-sm" }
              , React.createElement(ShieldCheck, { className: "h-3.5 w-3.5 text-[#FF6A00]" })
              , React.createElement('span', { className: "text-[11px] font-black text-[#2B201A]" }, "Zero App Install")
            )
            , React.createElement('div', { className: "flex items-center gap-2 bg-white/60 backdrop-blur-md border border-[#FF6A00]/15 rounded-full px-4 py-2 shadow-sm" }
              , React.createElement(Activity, { className: "h-3.5 w-3.5 text-[#FF6A00]" })
              , React.createElement('span', { className: "text-[11px] font-black text-[#2B201A]" }, "Live Analytics")
            )
          )
        )

        /* ── BOTTOM: Two floating cards side by side ── */
        , React.createElement('div', { className: "relative z-10 max-w-6xl mx-auto px-6 pb-0" }
          , React.createElement('div', { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 items-end" }

            /* LEFT CARD — stamp card mockup (tilted slightly) */
            , React.createElement('div', { className: "transform lg:-rotate-2 lg:translate-y-4 transition-transform duration-300 hover:rotate-0 hover:translate-y-0" }
              , React.createElement('div', { className: "relative bg-white rounded-[28px] border border-[#EAE3DF] shadow-2xl shadow-[#8C6553]/12 p-7" }

                /* Top bar: store info */
                , React.createElement('div', { className: "flex justify-between items-center pb-4 border-b border-[#FAF7F5] mb-5" }
                  , React.createElement('div', { className: "flex items-center gap-3" }
                    , React.createElement('div', { className: "h-9 w-9 rounded-xl bg-gradient-to-tr from-[#FF6A00] to-[#800020] flex items-center justify-center text-white text-[11px] font-black shadow-sm" }, "SL")
                    , React.createElement('div', null
                      , React.createElement('p', { className: "text-xs font-black text-[#2B201A]" }, "ScanLoyal Premium Store")
                      , React.createElement('p', { className: "text-[10px] text-[#8C6553]" }, "MG Road Outlet")
                    )
                  )
                  , React.createElement('span', { className: "text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wide whitespace-nowrap flex-shrink-0" }, "✓ Verified")
                )

                /* Stamps grid label */
                , React.createElement('div', { className: "flex justify-between items-center mb-3" }
                  , React.createElement('div', null
                    , React.createElement('p', { className: "text-[9px] text-[#8C6553] uppercase tracking-widest font-bold" }, "Loyalty Stamp Card")
                    , React.createElement('p', { className: "text-sm font-extrabold text-[#2B201A]" }, "Earn 1 stamp per visit")
                  )
                  , React.createElement('span', { className: "text-xs font-black text-[#FF6A00] bg-[#FF6A00]/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[#FF6A00]/25" }
                    , stampsCount, " / ", maxStamps, " Stamps"
                  )
                )

                /* Interactive stamp grid */
                , React.createElement('div', { className: "grid grid-cols-3 gap-3 mb-5" }
                  , Array.from({ length: maxStamps }).map((_, i) => {
                    const active = i < stampsCount;
                    return React.createElement('div', {
                      key: i,
                      onClick: () => toggleStamp(i),
                      className: `h-16 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${active ? "bg-gradient-to-tr from-[#FF6A00] to-[#800020] border-[#FF6A00] text-white shadow-lg shadow-[#FF6A00]/25 scale-[1.03]" : "bg-white/40 backdrop-blur-sm border-dashed border-[#FF6A00]/25 hover:border-[#FF6A00]/50 hover:bg-white text-[#FF6A00]/40"}`
                    }
                      , active
                        ? React.createElement(React.Fragment, null
                            , React.createElement(Stamp, { className: "h-5 w-5 fill-white text-white" })
                            , React.createElement('span', { className: "text-[9px] font-black mt-0.5 opacity-80" }, `#${i+1}`)
                          )
                        : React.createElement('span', { className: "text-xs font-bold" }, `${i+1}`)
                    );
                  })
                )

                /* Reward info strip */
                , React.createElement('div', { className: "bg-gradient-to-r from-[#FAF7F5] to-[#F5EDE8] border border-[#E5D5CD] rounded-2xl p-3.5 flex items-center gap-3" }
                  , React.createElement('div', { className: "h-9 w-9 rounded-xl bg-[#FF6A00]/10 backdrop-blur-sm border border-[#FF6A00]/20 flex items-center justify-center flex-shrink-0" }
                    , React.createElement(Gift, { className: "h-4 w-4 text-[#FF6A00]" })
                  )
                  , React.createElement('div', null
                    , React.createElement('p', { className: "text-[10px] font-black text-[#FF6A00] uppercase tracking-widest" }, "Reward on Completion")
                    , React.createElement('p', { className: "text-xs font-bold text-[#2B201A]" }, "₹250 Gift Voucher — auto-issued")
                  )
                )
              )
            )

            /* RIGHT CARD — QR scan preview + analytics pill */
            , React.createElement('div', { className: "transform lg:rotate-2 transition-transform duration-300 hover:rotate-0" }
              , React.createElement('div', { className: "relative bg-white rounded-[28px] border border-[#EAE3DF] shadow-2xl shadow-[#8C6553]/12 p-7" }

                /* Floating achievement badge */
                , React.createElement('div', { className: "absolute -top-4 -right-4 bg-gradient-to-r from-[#FF6A00] to-[#800020] border border-white/20 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wide animate-bounce" }
                  , "🎉 Reward Unlocked!"
                )

                /* QR Code visual */
                , React.createElement('div', { className: "flex flex-col items-center gap-4 mb-6" }
                  , React.createElement('div', { className: "relative h-32 w-32 rounded-2xl bg-white border border-[#EAE3DF] flex items-center justify-center shadow-xl p-2" }
                    , React.createElement(QrCode, { className: "h-22 w-22 text-[#2B201A]" })
                    , React.createElement('div', { className: "absolute w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-md border border-[#FF6A00]/25" }
                      , React.createElement('span', { className: "text-[10px] font-black tracking-tight bg-gradient-to-tr from-[#FF6A00] to-[#800020] bg-clip-text text-transparent" }, "LS")
                    )
                    , React.createElement('div', { className: "absolute bottom-0 right-0 h-8 w-8 bg-[#FF6A00] rounded-br-2xl rounded-tl-2xl flex items-center justify-center" }
                      , React.createElement(ShieldCheck, { className: "h-4 w-4 text-white" })
                    )
                    /* Laser scan animation */
                    , React.createElement('div', { className: "absolute inset-x-2 h-px bg-[#FF6A00]/80 shadow-[0_0_6px_#FF6A00] animate-scan-laser" })
                  )
                  , React.createElement('div', { className: "text-center" }
                    , React.createElement('p', { className: "text-xs font-black text-[#2B201A] uppercase tracking-widest" }, "Scan to Check-In")
                    , React.createElement('p', { className: "text-[10px] text-[#8C6553] mt-0.5" }, "GPS verified · 50m radius")
                  )
                )

                /* Analytics mini-strip */
                , React.createElement('div', { className: "grid grid-cols-3 gap-3 border-t border-[#EAE3DF] pt-5" }
                  , React.createElement('div', { className: "text-center" }
                    , React.createElement('p', { className: "text-xl font-black text-[#2B201A] font-mono" }, totalScans)
                    , React.createElement('p', { className: "text-[9px] text-[#8C6553] uppercase tracking-widest font-bold mt-0.5" }, "Scans")
                  )
                  , React.createElement('div', { className: "text-center border-x border-[#EAE3DF]" }
                    , React.createElement('p', { className: "text-xl font-black text-[#FF6A00] font-mono" }, "80%")
                    , React.createElement('p', { className: "text-[9px] text-[#8C6553] uppercase tracking-widest font-bold mt-0.5" }, "Return Rate")
                  )
                  , React.createElement('div', { className: "text-center" }
                    , React.createElement('p', { className: "text-xl font-black text-[#2B201A] font-mono" }, "₹12k")
                    , React.createElement('p', { className: "text-[9px] text-[#8C6553] uppercase tracking-widest font-bold mt-0.5" }, "Revenue")
                  )
                )
              )
            )
          )
        )

        /* ── Bottom fade into next section ── */
        , React.createElement('div', { className: "absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#FAF8F6] to-transparent pointer-events-none" })
      )

      /* 3. Features Section */
      , React.createElement('section', { id: "features", className: "py-24 md:py-32 border-t border-[#EAE3DF]/30 bg-[#FAF8F6] bg-dots"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 209}}
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 text-center space-y-12"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 210}}
          , React.createElement('div', { className: "max-w-2xl mx-auto space-y-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 211}}
            , React.createElement('span', { className: "text-xs font-black text-[#FF6A00] uppercase tracking-widest block mb-2"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 212}}, "Comprehensive SaaS Features"  )
            , React.createElement('h2', { className: "text-4xl sm:text-5xl font-extrabold text-[#2B201A] tracking-tight"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 213}}, "Designed to Grow Store Customer Retention"

            )
            , React.createElement('p', { className: "text-sm sm:text-base text-[#5A4E46] leading-relaxed"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 216}}, "We provide merchants with the tools to create premium digital loyalty stamp programs and verify scans using location guardrails."

            )
          )

          , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-8 pt-4"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 221}}

            /* Feature 1 */
            , React.createElement(Card, { className: "border border-[#EAE3DF] bg-white rounded-[28px] p-8 hover:shadow-xl hover:shadow-[#FF6A00]/5 hover:-translate-y-1.5 transition-all duration-300 text-left space-y-4 relative overflow-hidden"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 224}}
              , React.createElement(CardHeader, { className: "text-left space-y-4 p-0" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 225}}
                , React.createElement('div', { className: "h-12 w-12 rounded-xl bg-[#FF6A00]/10 backdrop-blur-sm flex items-center justify-center text-[#FF6A00] border border-[#FF6A00]/15 shadow-sm"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 226}}
                  , React.createElement(QrCode, { className: "h-5.5 w-5.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 227}} )
                )
                , React.createElement(CardTitle, { className: "text-lg font-extrabold text-[#2B201A]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 229}}, "Permanent QR Codes"  )
                , React.createElement(CardDescription, { className: "text-xs leading-relaxed text-[#5A4E46] p-0" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 230}}, "Create a single permanent QR code for your reception desks, salon counters, or tables. Download as high-quality PNG or PDF to print."

                )
              )
            )

            /* Feature 2 */
            , React.createElement(Card, { className: "border border-[#EAE3DF] bg-white rounded-[28px] p-8 hover:shadow-xl hover:shadow-[#FF6A00]/5 hover:-translate-y-1.5 transition-all duration-300 text-left space-y-4 relative overflow-hidden"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 237}}
              , React.createElement(CardHeader, { className: "text-left space-y-4 p-0" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 238}}
                , React.createElement('div', { className: "h-12 w-12 rounded-xl bg-[#FF6A00]/10 backdrop-blur-sm flex items-center justify-center text-[#FF6A00] border border-[#FF6A00]/15 shadow-sm"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 239}}
                  , React.createElement(MapPin, { className: "h-5.5 w-5.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 240}} )
                )
                , React.createElement(CardTitle, { className: "text-lg font-extrabold text-[#2B201A]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 242}}, "GPS Location Guardrail"  )
                , React.createElement(CardDescription, { className: "text-xs leading-relaxed text-[#5A4E46]" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 243}}, "Ensure authenticity. Our verification system cross-references customer coordinates with outlet coordinates to block out-of-store check-in attempts."

                )
              )
            )

            /* Feature 3 */
            , React.createElement(Card, { className: "border border-[#EAE3DF] bg-white rounded-[28px] p-8 hover:shadow-xl hover:shadow-[#FF6A00]/5 hover:-translate-y-1.5 transition-all duration-300 text-left space-y-4 relative overflow-hidden"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 250}}
              , React.createElement(CardHeader, { className: "text-left space-y-4 p-0" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 251}}
                , React.createElement('div', { className: "h-12 w-12 rounded-xl bg-[#FF6A00]/10 backdrop-blur-sm flex items-center justify-center text-[#FF6A00] border border-[#FF6A00]/15 shadow-sm"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 252}}
                  , React.createElement(Smartphone, { className: "h-5.5 w-5.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 253}} )
                )
                , React.createElement(CardTitle, { className: "text-lg font-extrabold text-[#2B201A]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 255}}, "Lightweight Customer PWA"  )
                , React.createElement(CardDescription, { className: "text-xs leading-relaxed text-[#5A4E46]" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 256}}, "No app download barrier. Customers scan a QR code, receive a quick OTP, and immediately see their stamp cards and unlocked vouchers."

                )
              )
            )

            /* Feature 4 */
            , React.createElement(Card, { className: "border border-[#EAE3DF] bg-white rounded-[28px] p-8 hover:shadow-xl hover:shadow-[#FF6A00]/5 hover:-translate-y-1.5 transition-all duration-300 text-left space-y-4 relative overflow-hidden"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 263}}
              , React.createElement(CardHeader, { className: "text-left space-y-4 p-0" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 264}}
                , React.createElement('div', { className: "h-12 w-12 rounded-xl bg-[#FF6A00]/10 backdrop-blur-sm flex items-center justify-center text-[#FF6A00] border border-[#FF6A00]/15 shadow-sm"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 265}}
                  , React.createElement(Award, { className: "h-5.5 w-5.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 266}} )
                )
                , React.createElement(CardTitle, { className: "text-lg font-extrabold text-[#2B201A]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 268}}, "Automated Voucher Issuance"  )
                , React.createElement(CardDescription, { className: "text-xs leading-relaxed text-[#5A4E46]" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 269}}, "Vouchers trigger immediately upon stamp card completion. Cache redemption codes are saved in the client's wallet for cashier checkout validation."

                )
              )
            )

            /* Feature 5 */
            , React.createElement(Card, { className: "border border-[#EAE3DF] bg-white rounded-[28px] p-8 hover:shadow-xl hover:shadow-[#FF6A00]/5 hover:-translate-y-1.5 transition-all duration-300 text-left space-y-4 relative overflow-hidden"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 276}}
              , React.createElement(CardHeader, { className: "text-left space-y-4 p-0" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 277}}
                , React.createElement('div', { className: "h-12 w-12 rounded-xl bg-[#FF6A00]/10 backdrop-blur-sm flex items-center justify-center text-[#FF6A00] border border-[#FF6A00]/15 shadow-sm"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 278}}
                  , React.createElement(Activity, { className: "h-5.5 w-5.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 279}} )
                )
                , React.createElement(CardTitle, { className: "text-lg font-extrabold text-[#2B201A]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 281}}, "Real-time Retail Analytics"  )
                , React.createElement(CardDescription, { className: "text-xs leading-relaxed text-[#5A4E46]" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 282}}, "Monitor repeat customer check-in rates, active branches metrics, rewards redemption split, and analyze cohort customer retention rates."

                )
              )
            )

            /* Feature 6 */
            , React.createElement(Card, { className: "border border-[#EAE3DF] bg-white rounded-[28px] p-8 hover:shadow-xl hover:shadow-[#FF6A00]/5 hover:-translate-y-1.5 transition-all duration-300 text-left space-y-4 relative overflow-hidden"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 289}}
              , React.createElement(CardHeader, { className: "text-left space-y-4 p-0" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 290}}
                , React.createElement('div', { className: "h-12 w-12 rounded-xl bg-[#FF6A00]/10 backdrop-blur-sm flex items-center justify-center text-[#FF6A00] border border-[#FF6A00]/15 shadow-sm"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 291}}
                  , React.createElement(ShieldCheck, { className: "h-5.5 w-5.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 292}} )
                )
                , React.createElement(CardTitle, { className: "text-lg font-extrabold text-[#2B201A]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 294}}, "Audit & Fraud Protection"   )
                , React.createElement(CardDescription, { className: "text-xs leading-relaxed text-[#5A4E46]" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 295}}, "Track suspicious geolocation scans, spoofed IPs, or impossible coordinate leaps. Secure tokens prevent QR duplication or sharing."

                )
              )
            )

          )
        )
      )

      /* 4. Product Flow Timeline */
      , React.createElement('section', { id: "how-it-works", className: "py-24 md:py-32 border-t border-[#EAE3DF]/30 bg-white"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 306}}
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 text-center space-y-12"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 307}}
          , React.createElement('div', { className: "max-w-2xl mx-auto space-y-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 308}}
            , React.createElement('span', { className: "text-xs font-black text-[#FF6A00] uppercase tracking-widest block mb-2"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 309}}, "Seamless Operation" )
            , React.createElement('h2', { className: "text-4xl sm:text-5xl font-extrabold text-[#2B201A] tracking-tight"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 310}}, "A 4-Step Checkout Flow"

            )
            , React.createElement('p', { className: "text-sm sm:text-base text-[#5A4E46] leading-relaxed"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 313}}, "We make the experience smooth for both the business owner and the customer visiting the store."

            )
          )

          , React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 text-left"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 318}}
            , React.createElement('div', { className: "bg-[#FAF8F7] p-8 rounded-[28px] border border-[#EAE3DF] relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#FF6A00]/5"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 319}}
              , React.createElement('span', { className: "text-8xl font-black text-[#EAE3DF]/30 absolute right-4 -top-2 select-none pointer-events-none font-mono"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 320}}, "01")
              , React.createElement('div', { className: "h-8 w-8 rounded-xl bg-gradient-to-tr from-[#FF6A00] to-[#800020] text-white font-black flex items-center justify-center text-sm mb-6 shadow-sm shadow-[#FF6A00]/10"            , __self: this, __source: {fileName: _jsxFileName, lineNumber: 321}}, "1")
              , React.createElement('h3', { className: "text-base font-extrabold text-[#2B201A] mb-2"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 322}}, "Create & Print QR"   )
              , React.createElement('p', { className: "text-xs text-[#5A4E46] leading-relaxed"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 323}}, "Businesses generate permanent QR codes and display them inside their storefronts (billing counters, cafe tables, hotels)."

              )
            )

            , React.createElement('div', { className: "bg-[#FAF8F7] p-8 rounded-[28px] border border-[#EAE3DF] relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#FF6A00]/5"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 328}}
              , React.createElement('span', { className: "text-8xl font-black text-[#EAE3DF]/30 absolute right-4 -top-2 select-none pointer-events-none font-mono"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 329}}, "02")
              , React.createElement('div', { className: "h-8 w-8 rounded-xl bg-gradient-to-tr from-[#FF6A00] to-[#800020] text-white font-black flex items-center justify-center text-sm mb-6 shadow-sm shadow-[#FF6A00]/10"            , __self: this, __source: {fileName: _jsxFileName, lineNumber: 330}}, "2")
              , React.createElement('h3', { className: "text-base font-extrabold text-[#2B201A] mb-2"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 331}}, "Scan & Verify Location"   )
              , React.createElement('p', { className: "text-xs text-[#5A4E46] leading-relaxed"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 332}}, "Customers scan the printed code with their smartphones. The PWA opens and verifies their GPS location coordinate parameters."

              )
            )

            , React.createElement('div', { className: "bg-[#FAF8F7] p-8 rounded-[28px] border border-[#EAE3DF] relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#FF6A00]/5"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 337}}
              , React.createElement('span', { className: "text-8xl font-black text-[#EAE3DF]/30 absolute right-4 -top-2 select-none pointer-events-none font-mono"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 338}}, "03")
              , React.createElement('div', { className: "h-8 w-8 rounded-xl bg-gradient-to-tr from-[#FF6A00] to-[#800020] text-white font-black flex items-center justify-center text-sm mb-6 shadow-sm shadow-[#FF6A00]/10"            , __self: this, __source: {fileName: _jsxFileName, lineNumber: 339}}, "3")
              , React.createElement('h3', { className: "text-base font-extrabold text-[#2B201A] mb-2"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 340}}, "Earn Digital Stamps"  )
              , React.createElement('p', { className: "text-xs text-[#5A4E46] leading-relaxed"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 341}}, "Customers receive digital check-in stamps. Their streak and totals are calculated instantly in their mobile client wallets."

              )
            )

            , React.createElement('div', { className: "bg-[#FAF8F7] p-8 rounded-[28px] border border-[#EAE3DF] relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#FF6A00]/5"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 346}}
              , React.createElement('span', { className: "text-8xl font-black text-[#EAE3DF]/30 absolute right-4 -top-2 select-none pointer-events-none font-mono"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 347}}, "04")
              , React.createElement('div', { className: "h-8 w-8 rounded-xl bg-gradient-to-tr from-[#FF6A00] to-[#800020] text-white font-black flex items-center justify-center text-sm mb-6 shadow-sm shadow-[#FF6A00]/10"            , __self: this, __source: {fileName: _jsxFileName, lineNumber: 348}}, "4")
              , React.createElement('h3', { className: "text-base font-extrabold text-[#2B201A] mb-2"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 349}}, "Claim Reward Voucher"  )
              , React.createElement('p', { className: "text-xs text-[#5A4E46] leading-relaxed"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 350}}, "Upon stamp card completion, rewards unlock automatically. The cashier reviews the claim code and applies the discount at checkout."

              )
            )
          )
        )
      )

      /* 5. Interactive Demo Section */
      , React.createElement('section', { id: "interactive-preview", className: "py-24 md:py-32 border-t border-[#EAE3DF]/30 bg-[#FAF8F6] bg-dots"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 359}}
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 360}}
          , React.createElement('div', { className: "lg:col-span-5 space-y-6 text-left"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 361}}
            , React.createElement('span', { className: "text-xs font-black text-[#FF6A00] uppercase tracking-widest block mb-2"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 362}}, "Interactive Playground" )
            , React.createElement('h2', { className: "text-4xl font-extrabold text-[#2B201A] tracking-tight leading-tight"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 363}}, "Test Our Stamp Simulator Live"

            )
            , React.createElement('p', { className: "text-sm sm:text-base text-[#5A4E46] leading-relaxed"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 366}}, "Experience the PWA interface layout that your customers will see on their smartphones. Click on any stamp block to simulate scanning a verification QR code at checkout!"

            )
            , React.createElement('div', { className: "p-5 bg-white/60 backdrop-blur-md border border-[#FF6A00]/15 rounded-[20px] space-y-3 text-xs text-[#5A4E46] shadow-sm"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 369}}
              , React.createElement('div', { className: "font-black flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#2B201A]"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 370}}
                , React.createElement(Check, { className: "h-4 w-4 text-emerald-600 font-extrabold"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 371}} ), " Interactive Mechanics"
              )
              , React.createElement('p', { className: "leading-relaxed text-[11px]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 373}}, "Clicking stamps toggles their status. Complete all "
                       , maxStamps, " stamps to unlock the success mock badge dialog."
              )
            )
          )

          , React.createElement('div', { className: "lg:col-span-7 flex justify-center"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 379}}
            , React.createElement('div', { className: "w-full max-w-[440px] p-6 bg-white/70 backdrop-blur-lg border border-[#FF6A00]/25 rounded-[44px] relative shadow-2xl shadow-[#FF6A00]/10"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 380}}
              , React.createElement('div', { className: "bg-white border border-[#EAE3DF] rounded-[32px] p-6 shadow-sm space-y-6 relative overflow-hidden"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 381}}

                /* Simulated PWA Header */
                , React.createElement('div', { className: "flex justify-between items-center pb-3 border-b border-[#FAF7F5]"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 384}}
                  , React.createElement('div', { className: "flex items-center gap-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 385}}
                    , React.createElement('div', { className: "h-8 w-8 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/20 text-[#FF6A00] flex items-center justify-center text-xs font-black shadow-sm"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 386}}, "S"

                    )
                    , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 389}}
                      , React.createElement('h4', { className: "text-xs font-black text-[#2B201A]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 390}}, "ScanLoyal PWA Demo"  )
                      , React.createElement('p', { className: "text-[8px] text-[#800020] font-semibold" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 391}}, "Coordinates: 20.2961, 85.8245"  )
                    )
                  )
                  , React.createElement('span', { className: "text-[9px] bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 394}}, "Live Demo"

                  )
                )

                /* Stamp Board */
                , React.createElement('div', { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 400}}
                  , React.createElement('div', { className: "flex justify-between items-center"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 401}}
                    , React.createElement('span', { className: "text-xs font-extrabold text-[#5A4E46]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 402}}, "Your stamps card:"  )
                    , React.createElement('span', { className: "text-xs text-[#FF6A00] font-mono font-black"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 403}}
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
                          className: `h-16 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                            active 
                              ? "bg-gradient-to-tr from-[#FF6A00] to-[#800020] border-solid border-transparent text-white scale-105 shadow-md shadow-[#FF6A00]/25" 
                              : "bg-white/40 backdrop-blur-sm border-2 border-dashed border-[#FF6A00]/20 text-[#FF6A00]/40 hover:border-[#FF6A00]/50 hover:bg-white"
                          }`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 412}}

                          , React.createElement(Stamp, { className: `h-6 w-6 ${active ? "text-white" : ""}`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 421}} )
                          , React.createElement('span', { className: "text-[9px] font-bold", __self: this, __source: {fileName: _jsxFileName, lineNumber: 422}}, active ? "Stamped" : `Stamp ${idx + 1}`)
                        )
                      );
                    })
                  )
                )

                /* Simulated Success dialog card */
                , stampsCount === maxStamps ? (
                  React.createElement('div', { className: "bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-3 animate-fade-in"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 431}}
                    , React.createElement('div', { className: "h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 432}}
                       , React.createElement(Check, { className: "h-6 w-6" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 433}} )
                    )
                    , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 435}}
                      , React.createElement('h5', { className: "text-xs font-black text-emerald-800 uppercase tracking-wide"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 436}}, "Voucher Unlocked! 🎉"  )
                      , React.createElement('p', { className: "text-[10px] text-emerald-700" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 437}}, "Code: " , React.createElement('code', { className: "bg-emerald-100 font-mono px-2 py-0.5 rounded-lg font-bold text-emerald-900"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 437}}, "DEMO-STAMP-100"))
                    )
                  )
                ) : (
                  React.createElement('div', { className: "bg-white/40 backdrop-blur-sm border border-[#FF6A00]/20 rounded-xl p-3 flex items-center space-x-3 text-left"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 441}}
                    , React.createElement(HelpCircle, { className: "h-5 w-5 text-[#800020] shrink-0"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 442}} )
                    , React.createElement('p', { className: "text-[10px] text-[#5A4E46] leading-relaxed font-medium"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 443}}, "Tap the remaining gray stamps to complete the stamp card and simulate reward validation!"

                    )
                  )
                )
              )
            )
          )
        )
      )

      /* 6. Pricing Plans */
      , React.createElement('section', { id: "pricing", className: "py-24 md:py-32 border-t border-[#EAE3DF]/30 bg-white" }
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 text-center space-y-12" }
          , React.createElement('div', { className: "max-w-2xl mx-auto space-y-4" }
            , React.createElement('span', { className: "text-xs font-black text-[#FF6A00] uppercase tracking-widest block mb-2" }, "Simple Yearly Plan" )
            , React.createElement('h2', { className: "text-4xl sm:text-5xl font-extrabold text-[#07122A] tracking-tight" }, "Launch Special Pricing" )
            , React.createElement('p', { className: "text-sm sm:text-base text-[#5A4E46] leading-relaxed" }, "No hidden surprises. Simple, transparent pricing for premium customer loyalty features." )
          )

          , React.createElement('div', { className: "max-w-md mx-auto pt-4 relative z-10" }
            , React.createElement('div', { className: "bg-white/70 backdrop-blur-lg p-8 rounded-[32px] border border-[#FF6A00]/40 flex flex-col justify-between shadow-2xl shadow-[#FF6A00]/10 relative animate-fade-in" }
              , React.createElement('span', { className: "absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FF6A00] to-[#800020] text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md" }, "Launch Offer" )

              , React.createElement('div', { className: "space-y-6" }
                , React.createElement('div', null
                  , React.createElement('span', { className: "text-xs font-black text-[#FF6A00] uppercase tracking-wider block" }, "All-in-One Plan")
                  , React.createElement('h4', { className: "text-xl font-bold text-[#07122A] mt-1" }, "LAUNCH YEAR SPECIAL")
                )

                , React.createElement('div', { className: "flex items-baseline justify-center space-x-2" }
                  , React.createElement('span', { className: "text-2xl font-semibold text-slate-400 line-through mr-1" }, "₹3,500")
                  , React.createElement('span', { className: "text-5xl font-black text-[#07122A]" }, "₹999")
                  , React.createElement('span', { className: "text-xs text-[#5A4E46]" }, "/ year")
                )

                , React.createElement('p', { className: "text-xs text-[#5A4E46] leading-relaxed" }, "Perfect for local cafes, bakeries, salons, or retail shops launching customer loyalty cards." )

                , React.createElement('div', { className: "h-px bg-[#FF6A00]/10 w-full" } )

                , React.createElement('div', { className: "bg-white/60 backdrop-blur-lg border border-[#FF6A00]/30 rounded-2xl p-4 space-y-2 text-xs text-[#5A4E46] text-left shadow-inner" }
                  , React.createElement('p', { className: "text-[10px] font-black text-[#FF6A00] uppercase tracking-wider mb-3" }, "Checkout Breakdown")
                  , React.createElement('div', { className: "flex justify-between" }
                    , React.createElement('span', null, "Base Plan Price:")
                    , React.createElement('span', { className: "font-semibold text-[#07122A]" }, "₹999.00")
                  )
                  , React.createElement('div', { className: "flex justify-between border-t border-[#FFD8B8] pt-2 font-black text-sm text-[#07122A]" }
                    , React.createElement('span', null, "Total Payable:")
                    , React.createElement('span', { className: "text-[#FF6A00]" }, "₹1,071.93")
                  )
                )

                , React.createElement('ul', { className: "space-y-3 text-xs text-[#5A4E46] text-left pt-2" }
                  , React.createElement('li', { className: "flex items-center space-x-2.5" }
                    , React.createElement(Check, { className: "h-4 w-4 text-[#FF6A00] shrink-0 font-extrabold" } )
                    , React.createElement('span', null, "Up to ", React.createElement('strong', { className: "text-[#07122A]" }, "5 Branches"), " Outlets" )
                  )
                  , React.createElement('li', { className: "flex items-center space-x-2.5" }
                    , React.createElement(Check, { className: "h-4 w-4 text-[#FF6A00] shrink-0 font-extrabold" } )
                    , React.createElement('span', null, "Up to ", React.createElement('strong', { className: "text-[#07122A]" }, "8,000 Customers" ))
                  )
                  , React.createElement('li', { className: "flex items-center space-x-2.5" }
                    , React.createElement(Check, { className: "h-4 w-4 text-[#FF6A00] shrink-0 font-extrabold" } )
                    , React.createElement('span', null, "Permanent QR Codes PDF/PNG" )
                  )
                  , React.createElement('li', { className: "flex items-center space-x-2.5" }
                    , React.createElement(Check, { className: "h-4 w-4 text-[#FF6A00] shrink-0 font-extrabold" } )
                    , React.createElement('span', null, "Advanced Analytics Dashboard" )
                  )
                  , React.createElement('li', { className: "flex items-center space-x-2.5" }
                    , React.createElement(Check, { className: "h-4 w-4 text-[#FF6A00] shrink-0 font-extrabold" } )
                    , React.createElement('span', null, "Custom Branding & Details" )
                  )
                )
              )

              , React.createElement('div', { className: "pt-8 w-full" }
                , React.createElement(Link, { to: "/login?signup=true", className: "w-full" }
                  , React.createElement(Button, { className: "w-full text-xs font-bold h-11 bg-gradient-to-r from-[#FF7A00] to-[#FF4D00] hover:from-[#FF6A00] hover:to-[#E31B00] text-white shadow-md shadow-[#FF6A00]/20 rounded-xl" }
                    , "Get Access Now →"
                  )
                )
              )
            )
          )
        )
      )

      /* 7. CTA Section */
      , React.createElement('section', { className: "py-24 bg-[#2B201A] text-white relative overflow-hidden border-t border-[#EAE3DF]/30 bg-dots"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 656}}
        , React.createElement('div', { className: "absolute -top-32 left-1/4 w-[500px] h-[500px] bg-[#FF6A00]/8 rounded-full blur-3xl pointer-events-none" })
        , React.createElement('div', { className: "absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#800020]/10 rounded-full blur-3xl pointer-events-none" })
        , React.createElement('div', { className: "absolute top-1/2 right-10 w-[300px] h-[300px] bg-emerald-500/6 rounded-full blur-3xl pointer-events-none" })

        , React.createElement('div', { className: "max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 659}}
          , React.createElement('h2', { className: "text-4xl sm:text-5xl font-black text-white tracking-tight leading-none"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 660}}, "Ready to Upgrade Your Customer Loyalty?"

          )
          , React.createElement('p', { className: "text-sm sm:text-base text-[#FAF7F5]/80 leading-relaxed max-w-xl mx-auto"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 663}}, "Join other growing storefronts that trust ScanLoyal to incentivize return visits, prevent check-in fraud, and manage discount vouchers easily."

          )
          , React.createElement('div', { className: "pt-2 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 666}}
            , React.createElement(Link, { to: "/login?signup=true", __self: this, __source: {fileName: _jsxFileName, lineNumber: 667}}
              , React.createElement(Button, { size: "lg", className: "bg-[#FF6A00] hover:bg-[#E05E00] text-white shadow-xl shadow-[#FF6A00]/20 px-8 h-12 rounded-xl text-sm font-semibold transition-all hover:scale-105 duration-200"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 668}}, "Create Free Owner Account"

              )
            )
            , React.createElement(Link, { to: "/login", __self: this, __source: {fileName: _jsxFileName, lineNumber: 672}}
              , React.createElement(Button, { variant: "outline", size: "lg", className: "border border-white/20 text-white hover:bg-white/10 hover:text-white px-8 h-12 rounded-xl text-sm font-semibold transition-all duration-200 bg-transparent"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 673}}, "Login to Console"

              )
            )
          )
        )
      )

      /* 8. Global Footer */
      , React.createElement('footer', { className: "bg-[#FAF7F5] text-[#5A4E46] py-16 border-t border-[#EAE3DF]"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 682}}
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 683}}
          , React.createElement('div', { className: "space-y-5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 684}}
            , React.createElement('div', { className: "flex items-center space-x-2.5" }
              , React.createElement('img', { src: "/image.png", alt: "LogiSaar Logo", className: "h-8 w-auto object-contain" })
              , React.createElement('div', { className: "flex flex-col justify-center" }
                , React.createElement('span', { className: "text-sm font-black tracking-tight text-[#2B201A] leading-tight" }, "LogiSaar")
                , React.createElement('span', { className: "text-[9px] font-bold text-[#FF6A00] uppercase tracking-wider leading-none" }, "ScanLoyal")
              )
            )
            , React.createElement('p', { className: "text-xs leading-relaxed max-w-xs text-[#8C6553] font-medium"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 691}}, "Modern digital stamp cards and GPS location verification for storefront customer retention."

            )
          )

          , React.createElement('div', { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 696}}
            , React.createElement('h5', { className: "text-[11px] font-bold text-[#2B201A] uppercase tracking-wider"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 697}}, "Product")
            , React.createElement('ul', { className: "space-y-3 text-xs" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 698}}
              , React.createElement('li', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 699}}, React.createElement('a', { href: "#features", className: "hover:text-[#FF6A00] transition-colors font-medium" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 699}}, "Features"))
              , React.createElement('li', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 700}}, React.createElement('a', { href: "#how-it-works", className: "hover:text-[#FF6A00] transition-colors font-medium" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 700}}, "Product Flow" ))
              , React.createElement('li', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 701}}, React.createElement('a', { href: "#pricing", className: "hover:text-[#FF6A00] transition-colors font-medium" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 701}}, "Pricing Options" ))
            )
          )

          , React.createElement('div', { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 705}}
            , React.createElement('h5', { className: "text-[11px] font-bold text-[#2B201A] uppercase tracking-wider"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 706}}, "Security")
            , React.createElement('ul', { className: "space-y-3 text-xs font-medium" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 707}}
              , React.createElement('li', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 708}}, React.createElement('span', { className: "text-[#5A4E46]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 708}}, "GPS Validation" ))
              , React.createElement('li', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 709}}, React.createElement('span', { className: "text-[#5A4E46]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 709}}, "Secure Tokens" ))
              , React.createElement('li', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 710}}, React.createElement('span', { className: "text-[#5A4E46]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 710}}, "Anti-Spoofing Logs" ))
            )
          )

          , React.createElement('div', { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 714}}
            , React.createElement('h5', { className: "text-[11px] font-bold text-[#2B201A] uppercase tracking-wider"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 715}}, "Legal")
            , React.createElement('ul', { className: "space-y-3 text-xs font-medium" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 716}}
              , React.createElement('li', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 717}}, React.createElement('span', { className: "text-[#5A4E46]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 717}}, "Privacy Policy" ))
              , React.createElement('li', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 718}}, React.createElement('span', { className: "text-[#5A4E46]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 718}}, "Terms of Service"  ))
              , React.createElement('li', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 719}}, React.createElement('span', { className: "text-[#5A4E46]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 719}}, "Support Desk" ))
            )
          )
        )

        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 pt-8 mt-8 border-t border-[#EAE3DF]/50 flex flex-col md:flex-row justify-between items-center text-xs font-medium"            , __self: this, __source: {fileName: _jsxFileName, lineNumber: 724}}
          , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 725}}, "© " , new Date().getFullYear(), " ScanLoyal SaaS. All rights reserved."     )
          , React.createElement('span', { className: "text-[10px] text-[#8C6553] mt-2 md:mt-0 font-bold"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 726}}, "Made for retail store retention in India"      )
        )
      )

    )
  );
}

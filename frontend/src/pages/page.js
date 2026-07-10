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
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  Building2
} from "lucide-react";


export default function LandingPage() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuthStore();
  const [stampsCount, setStampsCount] = useState(3);
  const [totalScans, setTotalScans] = useState(847);
  const [totalBusinesses, setTotalBusinesses] = useState(50);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Animated business count state
  const [animatedBusinesses, setAnimatedBusinesses] = useState(50);

  useEffect(() => {
    let start = animatedBusinesses;
    const end = totalBusinesses;
    if (start === end) return;

    const duration = 1500;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing out quadratic
      const easeProgress = progress * (2 - progress);
      const currentVal = Math.floor(start + easeProgress * (end - start));
      
      setAnimatedBusinesses(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [totalBusinesses]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  useEffect(() => {
    // Dynamic SEO Configuration
    document.title = "Scanloyal - Loyalty Program Software India | QR Loyalty Card App for Cafes & Restaurants";
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'Scanloyal is the #1 QR loyalty program software in India. Enhance customer retention with digital stamp card apps for cafes, salons, and learn how to get more Google reviews for restaurants.');

    let metaKeys = document.querySelector('meta[name="keywords"]');
    if (!metaKeys) {
      metaKeys = document.createElement('meta');
      metaKeys.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeys);
    }
    metaKeys.setAttribute('content', 'Scanloyal, loyalty program software India, QR loyalty card app for cafes, how to get more Google reviews for restaurant, customer retention app small business, customer loyalty India');

    // Add JSON-LD Schema markup
    const schemaData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Product",
          "name": "Scanloyal Loyalty Platform",
          "description": "QR-based loyalty program software in India featuring digital stamp cards, customer retention tools, and Google review automation.",
          "brand": {
            "@type": "Brand",
            "name": "Scanloyal"
          },
          "offers": {
            "@type": "Offer",
            "price": "999.00",
            "priceCurrency": "INR",
            "priceValidUntil": "2027-12-31",
            "url": window.location.href,
            "availability": "https://schema.org/InStock"
          }
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What is the GPS Location Guardrail and how does it prevent fraud?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "To prevent customers from checking in outside your shop, our system verifies coordinates against your outlet coordinates at scan time. Stamps are blocked if scanned further than 50 meters away."
              }
            },
            {
              "@type": "Question",
              "name": "How does the coupon redemption work?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Once a stamp card is completed, a reward voucher is automatically unlocked and saved in the customer's wallet. The customer shows this voucher to the cashier, who redeems the code to apply the discount."
              }
            }
          ]
        }
      ]
    };

    let scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schemaData);
  }, []);

  useEffect(() => {
    const fetchTotalScans = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";
        const response = await fetch(`${apiUrl}/checkins/public/count`);
        if (response.ok) {
          const resData = await response.json();
          if (resData.success) {
            if (typeof resData.data.count === 'number') {
              setTotalScans(resData.data.count);
            }
            if (typeof resData.data.businessCount === 'number') {
              setTotalBusinesses(resData.data.businessCount);
            }
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
      , React.createElement('header', { className: "sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md" }
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 h-20 flex items-center justify-between" }
          /* Left Logo */
          , React.createElement('div', { className: "flex items-center space-x-2.5" }
            , React.createElement('div', { className: "w-9 h-9 bg-black rounded-lg flex items-center justify-center font-bold text-white text-sm" }, "SL")
            , React.createElement('span', { className: "text-lg font-bold text-[#0F172A] tracking-tight" }, "Scanloyal")
          )
          /* Middle Links (Hidden on mobile) */
          , React.createElement('nav', { className: "hidden md:flex items-center space-x-8 text-xs font-semibold text-[#64748B]" }
            , React.createElement('a', { href: "#features", className: "hover:text-[#F97316] transition-colors" }, "Features")
            , React.createElement('a', { href: "#how-it-works", className: "hover:text-[#F97316] transition-colors" }, "How It Works")
            , React.createElement('a', { href: "#pricing", className: "hover:text-[#F97316] transition-colors" }, "Pricing")
            , React.createElement('a', { href: "#", className: "hover:text-[#F97316] transition-colors" }, "Company")
            , React.createElement('a', { href: "#", className: "hover:text-[#F97316] transition-colors" }, "Resources")
          )
          /* Right Actions */
          , React.createElement('div', { className: "flex items-center space-x-4" }
            , React.createElement(Link, { to: "/login", className: "text-xs font-bold text-[#64748B] hover:text-[#0F172A] transition-colors" }, "Log in")
            , React.createElement(Link, { to: "/login?signup=true", className: "bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition-all" }, "Start Free Trial")
            /* Mobile menu button */
            , React.createElement('button', { className: "md:hidden text-[#0F172A] hover:text-[#F97316]" }
              , React.createElement('svg', { className: "w-6 h-6", fill: "none", stroke: "currentColor", strokeWidth: "2", viewBox: "0 0 24 24" }
                , React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M4 6h16M4 12h16M4 18h16" })
              )
            )
          )
        )
      )

      /* 2. Hero Section */
      , React.createElement('section', { id: "hero", className: "relative overflow-hidden bg-white" }
        /* Hero Content Grid */
        , React.createElement('div', { className: "relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pt-12 pb-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center" }
          
          /* Left Column (span 7) */
          , React.createElement('div', { className: "lg:col-span-7 space-y-6 text-left" }


            /* Headline */
            , React.createElement('h1', { className: "text-4xl sm:text-5xl md:text-[56px] font-black tracking-tight text-[#0F172A] leading-[1.08]" }
              , "Turn Every Visit"
              , React.createElement('br', null)
              , "Into a "
              , React.createElement('span', { className: "text-[#F97316]" }, "Loyal")
              , React.createElement('br', null)
              , React.createElement('span', { className: "text-[#F97316]" }, "Customer")
            )

            /* Description */
            , React.createElement('p', { className: "text-sm sm:text-base text-[#64748B] leading-relaxed max-w-xl" }
              , "Scanloyal is a QR-based loyalty and Google review automation platform that helps local stores build customer retention."
            )



            /* CTA Buttons */
            , React.createElement('div', { className: "flex flex-wrap items-center gap-4 pt-2" }
              , React.createElement(Link, { to: "/login?signup=true", className: "bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-extrabold px-6 py-3.5 rounded-full flex items-center gap-2 transition-all shadow-md shadow-[#F97316]/20 active:scale-95" }
                , "Start Free Trial →"
              )
              , React.createElement('button', { className: "border border-slate-200 hover:border-slate-300 text-xs font-extrabold px-6 py-3.5 rounded-full flex items-center gap-2 transition-all bg-white text-[#0F172A]" }
                , React.createElement('span', { className: "text-[#F97316] text-[10px]" }, "▶")
                , "Watch Demo"
              )
            )

            /* Rating */
            , React.createElement('div', { className: "flex items-center gap-3 pt-2" }
              , React.createElement('span', { className: "text-[#F97316] font-black text-lg" }, "G")
              , React.createElement('div', { className: "flex text-amber-400 text-sm" }
                , Array.from({ length: 5 }).map((_, i) => React.createElement('span', { key: i }, "★"))
              )
              , React.createElement('span', { className: "text-xs font-bold text-[#64748B]" }, "4.9/5 from 500+ Google Reviews")
            )

            /* Live Business Counter */
            , React.createElement('div', { className: "flex items-center gap-3 pt-4 animate-fade-in" }
              , React.createElement('div', { className: "flex -space-x-3" }
                , React.createElement('div', { className: "w-9 h-9 rounded-full border-[3px] border-white bg-blue-100 shadow-sm flex items-center justify-center text-[10px] font-bold text-blue-600 z-30" }, "C")
                , React.createElement('div', { className: "w-9 h-9 rounded-full border-[3px] border-white bg-emerald-100 shadow-sm flex items-center justify-center text-[10px] font-bold text-emerald-600 z-20" }, "B")
                , React.createElement('div', { className: "w-9 h-9 rounded-full border-[3px] border-white bg-purple-100 shadow-sm flex items-center justify-center text-[10px] font-bold text-purple-600 z-10" }, "R")
              )
              , React.createElement('div', { className: "text-xs font-semibold text-[#64748B] flex items-center gap-1.5" }
                , "Join "
                , React.createElement('span', { className: "text-[#0F172A] font-black text-base flex items-center gap-1" }
                  , animatedBusinesses, "+"
                )
                , "businesses registered"
              )
            )
          )

          /* Right Column (span 5) */
          , React.createElement('div', { className: "lg:col-span-5 relative flex items-center justify-center" }
            , React.createElement('div', { className: "absolute w-[350px] h-[350px] bg-[#FFF3EB] rounded-full blur-3xl opacity-60 pointer-events-none" })
            , React.createElement('img', {
                src: "/hero.png",
                alt: "LoyaltySaar QR Digital Stamps app screens and standee mockup",
                className: "relative z-10 w-full max-w-[480px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.06)]"
              })
          )
        )

        /* Footer trusted category row & statistics */
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 lg:px-10 py-10 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6" }
          /* Left: Trusted Categories */
          , React.createElement('div', { className: "lg:col-span-7 space-y-4 text-left" }
            , React.createElement('p', { className: "text-xs font-bold text-[#64748B]" }, "Trusted by 500+ businesses across India")
            , React.createElement('div', { className: "flex flex-wrap items-center gap-3.5" }
              , [
                  { label: "Restaurant" },
                  { label: "Café" },
                  { label: "Salon" },
                  { label: "Gym" },
                  { label: "Boutique" },
                  { label: "Grocery" },
                  { label: "Retail Store" },
                  { label: "And More" }
                ].map((item, i) =>
                  React.createElement('span', { key: i, className: "text-[11px] font-bold text-[#0F172A] bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-full" }
                    , item.label
                  )
                )
            )
          )

        )
      )



      /* 3. Features Section */
      , React.createElement('section', { id: "features", className: "py-24 md:py-32 border-t border-[#EAE3DF]/30 bg-[#FAF8F6] bg-dots" }
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 text-center space-y-12" }
          , React.createElement('div', { className: "max-w-2xl mx-auto space-y-4" }
            , React.createElement('span', { className: "text-xs font-black text-[#FF6A00] uppercase tracking-widest block mb-2" }, "Comprehensive SaaS Features" )
            , React.createElement('h2', { className: "text-4xl sm:text-5xl font-extrabold text-[#2B201A] tracking-tight" }, "Designed to Grow Store Customer Retention"
            )
            , React.createElement('p', { className: "text-sm sm:text-base text-[#5A4E46] leading-relaxed" }, "We provide merchants with the tools to create premium digital loyalty stamp programs and verify scans using location guardrails."
            )
          )

          , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-8 pt-4" }

            /* Feature 1 */
            , React.createElement('div', { className: "glass-card rounded-[28px] p-8 text-left space-y-4 relative overflow-hidden" }
              , React.createElement('div', { className: "text-left space-y-4 p-0" }
                , React.createElement('div', { className: "h-12 w-12 rounded-xl bg-[#FF6A00]/10 backdrop-blur-sm flex items-center justify-center text-[#FF6A00] border border-[#FF6A00]/15 shadow-sm" }
                  , React.createElement(QrCode, { className: "h-5.5 w-5.5" } )
                )
                , React.createElement('h3', { className: "text-lg font-extrabold text-[#2B201A]" }, "Premium Printed QR Codes" )
                , React.createElement('p', { className: "text-xs leading-relaxed text-[#5A4E46] p-0" }, "We provide and deliver a premium, ready-to-use printed QR code stand directly to your business location within 4 to 7 days." )
              )
            )

            /* Feature 2 */
            , React.createElement('div', { className: "glass-card rounded-[28px] p-8 text-left space-y-4 relative overflow-hidden" }
              , React.createElement('div', { className: "text-left space-y-4 p-0" }
                , React.createElement('div', { className: "h-12 w-12 rounded-xl bg-[#FF6A00]/10 backdrop-blur-sm flex items-center justify-center text-[#FF6A00] border border-[#FF6A00]/15 shadow-sm" }
                  , React.createElement(MapPin, { className: "h-5.5 w-5.5" } )
                )
                , React.createElement('h3', { className: "text-lg font-extrabold text-[#2B201A]" }, "In-Store GPS Protection" )
                , React.createElement('p', { className: "text-xs leading-relaxed text-[#5A4E46]" }, "Stop fake check-ins. Customers must be physically present at your shop to earn stamps. They cannot cheat or scan the code from their home." )
              )
            )

            /* Feature 3 */
            , React.createElement('div', { className: "glass-card rounded-[28px] p-8 text-left space-y-4 relative overflow-hidden" }
              , React.createElement('div', { className: "text-left space-y-4 p-0" }
                , React.createElement('div', { className: "h-12 w-12 rounded-xl bg-[#FF6A00]/10 backdrop-blur-sm flex items-center justify-center text-[#FF6A00] border border-[#FF6A00]/15 shadow-sm" }
                  , React.createElement(Smartphone, { className: "h-5.5 w-5.5" } )
                )
                , React.createElement('h3', { className: "text-lg font-extrabold text-[#2B201A]" }, "Zero App Downloads" )
                , React.createElement('p', { className: "text-xs leading-relaxed text-[#5A4E46]" }, "Customers don't need to install any heavy apps. They just scan the QR code using their phone camera, verify in seconds, and collect stamps." )
              )
            )

            /* Feature 4 */
            , React.createElement('div', { className: "glass-card rounded-[28px] p-8 text-left space-y-4 relative overflow-hidden" }
              , React.createElement('div', { className: "text-left space-y-4 p-0" }
                , React.createElement('div', { className: "h-12 w-12 rounded-xl bg-[#FF6A00]/10 backdrop-blur-sm flex items-center justify-center text-[#FF6A00] border border-[#FF6A00]/15 shadow-sm" }
                  , React.createElement(Award, { className: "h-5.5 w-5.5" } )
                )
                , React.createElement('h3', { className: "text-lg font-extrabold text-[#2B201A]" }, "Automatic Rewards Vouchers" )
                , React.createElement('p', { className: "text-xs leading-relaxed text-[#5A4E46]" }, "Vouchers are generated instantly in the customer's digital wallet once they complete a stamp card. They show it to your cashier to redeem." )
              )
            )

            /* Feature 5 */
            , React.createElement('div', { className: "glass-card rounded-[28px] p-8 text-left space-y-4 relative overflow-hidden" }
              , React.createElement('div', { className: "text-left space-y-4 p-0" }
                , React.createElement('div', { className: "h-12 w-12 rounded-xl bg-[#FF6A00]/10 backdrop-blur-sm flex items-center justify-center text-[#FF6A00] border border-[#FF6A00]/15 shadow-sm" }
                  , React.createElement(Activity, { className: "h-5.5 w-5.5" } )
                )
                , React.createElement('h3', { className: "text-lg font-extrabold text-[#2B201A]" }, "Easy Store Dashboard" )
                , React.createElement('p', { className: "text-xs leading-relaxed text-[#5A4E46]" }, "Keep track of your regular customers, see how many stamps are collected daily, and monitor your repeat business growth from one simple dashboard." )
              )
            )

            /* Feature 6 */
            , React.createElement('div', { className: "glass-card rounded-[28px] p-8 text-left space-y-4 relative overflow-hidden" }
              , React.createElement('div', { className: "text-left space-y-4 p-0" }
                , React.createElement('div', { className: "h-12 w-12 rounded-xl bg-[#FF6A00]/10 backdrop-blur-sm flex items-center justify-center text-[#FF6A00] border border-[#FF6A00]/15 shadow-sm" }
                  , React.createElement(ShieldCheck, { className: "h-5.5 w-5.5" } )
                )
                , React.createElement('h3', { className: "text-lg font-extrabold text-[#2B201A]" }, "Double-Check Protection" )
                , React.createElement('p', { className: "text-xs leading-relaxed text-[#5A4E46]" }, "Our smart system prevents double check-ins and detects fake scans automatically, so you can run your rewards program with absolute peace of mind." )
              )
            )
          )
        )
      )

      /* 4. Product Flow Timeline */
      , React.createElement('section', { id: "how-it-works", className: "py-24 md:py-32 border-t border-[#EAE3DF]/30 bg-white"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 306}}
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 text-center space-y-12"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 307}}
          , React.createElement('div', { className: "max-w-2xl mx-auto space-y-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 308}}
            , React.createElement('h2', { className: "text-4xl sm:text-5xl font-extrabold text-[#2B201A] tracking-tight"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 310}}, "4-Step Checkout Flow"

            )
            , React.createElement('p', { className: "text-sm sm:text-base text-[#5A4E46] leading-relaxed"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 313}}, "We make the experience smooth for both the business owner and the customer visiting the store."

            )
          )

          , React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 text-left"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 318}}
            , React.createElement('div', { className: "bg-[#FAF8F7] p-8 pt-12 rounded-[28px] border border-[#EAE3DF] relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#FF6A00]/5" }
              , React.createElement('span', { className: "text-7xl font-black text-[#FF6A00]/25 absolute right-6 top-6 select-none pointer-events-none font-mono" }, "01")
              , React.createElement('h3', { className: "text-base font-extrabold text-[#2B201A] mb-2 mt-4" }, "Create & Print QR" )
              , React.createElement('p', { className: "text-xs text-[#5A4E46] leading-relaxed" }, "We provide the Printed QR code. Delivered to your business location within 4 to 7 days." )
            )

            , React.createElement('div', { className: "bg-[#FAF8F7] p-8 pt-12 rounded-[28px] border border-[#EAE3DF] relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#FF6A00]/5" }
              , React.createElement('span', { className: "text-7xl font-black text-[#FF6A00]/25 absolute right-6 top-6 select-none pointer-events-none font-mono" }, "02")
              , React.createElement('h3', { className: "text-base font-extrabold text-[#2B201A] mb-2 mt-4" }, "Scan & Verify Location" )
              , React.createElement('p', { className: "text-xs text-[#5A4E46] leading-relaxed" }, "Customers scan the printed code with their smartphones. The system verifies they are physically present at your store location." )
            )

            , React.createElement('div', { className: "bg-[#FAF8F7] p-8 pt-12 rounded-[28px] border border-[#EAE3DF] relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#FF6A00]/5" }
              , React.createElement('span', { className: "text-7xl font-black text-[#FF6A00]/25 absolute right-6 top-6 select-none pointer-events-none font-mono" }, "03")
              , React.createElement('h3', { className: "text-base font-extrabold text-[#2B201A] mb-2 mt-4" }, "Earn Digital Stamps" )
              , React.createElement('p', { className: "text-xs text-[#5A4E46] leading-relaxed" }, "Customers receive digital check-in stamps. Their total stamps are calculated instantly in their mobile client wallets." )
            )

            , React.createElement('div', { className: "bg-[#FAF8F7] p-8 pt-12 rounded-[28px] border border-[#EAE3DF] relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#FF6A00]/5" }
              , React.createElement('span', { className: "text-7xl font-black text-[#FF6A00]/25 absolute right-6 top-6 select-none pointer-events-none font-mono" }, "04")
              , React.createElement('h3', { className: "text-base font-extrabold text-[#2B201A] mb-2 mt-4" }, "Claim Reward Voucher" )
              , React.createElement('p', { className: "text-xs text-[#5A4E46] leading-relaxed" }, "Upon stamp card completion, rewards unlock automatically. The cashier reviews the claim code and applies the discount at checkout." )
            )
          )
        )
      )

      /* 5. Interactive Demo Section */
      , React.createElement('section', { id: "interactive-preview", className: "py-24 md:py-32 border-t border-[#EAE3DF]/30 bg-[#FAF8F6] bg-dots" }
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center" }
          , React.createElement('div', { className: "lg:col-span-5 space-y-6 text-left" }
            , React.createElement('span', { className: "text-xs font-black text-[#FF6A00] uppercase tracking-widest block mb-2" }, "Try the Customer View" )
            , React.createElement('h2', { className: "text-4xl font-extrabold text-[#2B201A] tracking-tight leading-tight" }, "Test the Stamp Card Live" )
            , React.createElement('p', { className: "text-sm sm:text-base text-[#5A4E46] leading-relaxed" }, "This is exactly what your customers see on their phone screen when they scan your QR code. Tap the stamp circles to see how simple it is to collect stamps!" )
            , React.createElement('div', { className: "p-5 bg-white/60 backdrop-blur-md border border-[#FF6A00]/15 rounded-[20px] space-y-3 text-xs text-[#5A4E46] shadow-sm" }
              , React.createElement('div', { className: "font-black flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#2B201A]" }
                , React.createElement(Check, { className: "h-4 w-4 text-emerald-600 font-extrabold" } ), " Interactive Preview"
              )
              , React.createElement('p', { className: "leading-relaxed text-[11px]" }, "Click the stamps to toggle them. Complete all "
                       , maxStamps, " stamps to see how the reward voucher unlocks instantly!"
              )
            )
          )

          , React.createElement('div', { className: "lg:col-span-7 flex justify-center pt-8" }
            , React.createElement('div', { className: "phone-frame shadow-2xl shadow-[#FF6A00]/10" }
              , React.createElement('div', { className: "phone-screen" }

                /* Simulated Mobile Header */
                , React.createElement('div', { className: "flex justify-between items-center pb-3 border-b border-[#FAF7F5] mb-6" }
                  , React.createElement('div', { className: "flex items-center gap-2" }
                    , React.createElement('div', { className: "h-8 w-8 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/20 text-[#FF6A00] flex items-center justify-center text-xs font-black shadow-sm" }, "S" )
                    , React.createElement('div', null
                      , React.createElement('h4', { className: "text-xs font-black text-[#2B201A]" }, "Scanloyal Live Demo" )
                      , React.createElement('p', { className: "text-[8px] text-[#800020] font-semibold" }, "Coordinates: 20.2961, 85.8245" )
                    )
                  )
                  , React.createElement('span', { className: "text-[9px] bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider" }, "Live Demo" )
                )

                /* Stamp Board */
                , React.createElement('div', { className: "space-y-4" }
                  , React.createElement('div', { className: "flex justify-between items-center" }
                    , React.createElement('span', { className: "text-xs font-extrabold text-[#5A4E46]" }, "Your stamps card:" )
                    , React.createElement('span', { className: "text-xs text-[#FF6A00] font-mono font-black" }
                      , stampsCount, " / ", maxStamps, " Completed"
                    )
                  )

                  , React.createElement('div', { className: "grid grid-cols-3 gap-3" }
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
                          }`
                        }

                        , React.createElement(Stamp, { className: `h-6 w-6 ${active ? "text-white" : ""}` } )
                        , React.createElement('span', { className: "text-[9px] font-bold" }, active ? "Stamped" : `Stamp ${idx + 1}`)
                        )
                      );
                    })
                  )
                )

                /* Simulated Success dialog card */
                , stampsCount === maxStamps ? (
                  React.createElement('div', { className: "bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-3 mt-6 animate-fade-in" }
                    , React.createElement('div', { className: "h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto" }
                       , React.createElement(Check, { className: "h-6 w-6" } )
                    )
                    , React.createElement('div', { className: "space-y-1" }
                      , React.createElement('h5', { className: "text-xs font-black text-emerald-800 uppercase tracking-wide" }, "Voucher Unlocked! 🎉" )
                      , React.createElement('p', { className: "text-[10px] text-emerald-700" }, "Code: ", React.createElement('code', { className: "bg-emerald-100 font-mono px-2 py-0.5 rounded-lg font-bold text-emerald-900" }, "Scanloyal-stamp-100"))
                    )
                  )
                ) : (
                  React.createElement('div', { className: "bg-white/40 backdrop-blur-sm border border-[#FF6A00]/20 rounded-xl p-3 flex items-center space-x-3 text-left mt-6" }
                    , React.createElement(HelpCircle, { className: "h-5 w-5 text-[#800020] shrink-0" } )
                    , React.createElement('p', { className: "text-[10px] text-[#5A4E46] leading-relaxed font-medium" }, "Tap the remaining gray stamps to complete the stamp card and simulate reward validation!" )
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

          , React.createElement('div', { className: "max-w-md mx-auto space-y-6 relative z-10" }
            , React.createElement('div', { className: "bg-gradient-to-r from-[#FF6A00] to-[#800020] text-white rounded-[24px] p-5 shadow-xl border border-white/10 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] text-left" }
              , React.createElement('div', { className: "absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl" })
              , React.createElement('div', { className: "absolute -left-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl" })
              , React.createElement('div', { className: "relative z-10 flex items-center gap-4" }
                , React.createElement('div', { className: "h-11 w-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/35 text-xl shadow-inner shrink-0" }, "✨")
                , React.createElement('div', null
                  , React.createElement('p', { className: "text-[9px] font-black uppercase tracking-widest text-[#FFB085]" }, "Limited-Time Launch Bonus")
                  , React.createElement('h4', { className: "text-xs font-black leading-snug text-white" }, "Register your business and get a free QR code counter standee!")
                  , React.createElement('p', { className: "text-[10px] text-white/90 mt-0.5 leading-relaxed" }, "We print, laminate, and ship your store's custom QR standee to your address for free.")
                )
              )
            )

            , React.createElement('div', { className: "bg-white/70 backdrop-blur-lg p-8 rounded-[32px] border-2 border-[#FF6A00] flex flex-col justify-between shadow-2xl shadow-[#FF6A00]/15 relative animate-fade-in text-center" }
              , React.createElement('span', { className: "absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FF6A00] to-[#800020] text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md whitespace-nowrap" }, "🔥 Launch Offer — First 500 Businesses Only!" )

              , React.createElement('div', { className: "space-y-6" }
                , React.createElement('div', { className: "text-center space-y-2" }
                  , React.createElement('span', { className: "text-xs font-black text-[#FF6A00] uppercase tracking-wider block" }, "All-in-One Plan")
                  , React.createElement('h4', { className: "text-xl font-bold text-[#07122A] mt-1" }, "LAUNCH YEAR SPECIAL")
                )

                , React.createElement('div', { className: "flex flex-col items-center justify-center space-y-1.5" }
                  , React.createElement('div', { className: "flex items-baseline space-x-2" }
                    , React.createElement('span', { className: "text-2xl font-semibold text-slate-400 line-through mr-1" }, "₹3,500")
                    , React.createElement('span', { className: "text-5xl font-black text-[#07122A]" }, "₹999")
                    , React.createElement('span', { className: "text-xs text-[#5A4E46]" }, "/ year")
                  )
                  , React.createElement('span', { className: "text-[10px] font-black text-[#FF6A00] bg-orange-50 border border-orange-200 px-3 py-1 rounded-full uppercase tracking-wider block" }, "⚡ ₹999 for first 500 signups!")
                )

                , React.createElement('p', { className: "text-xs text-[#5A4E46] leading-relaxed text-center" }, "Perfect for local cafes, bakeries, salons, or retail shops launching customer loyalty cards." )

                , React.createElement('div', { className: "h-px bg-[#FF6A00]/10 w-full" } )



                , React.createElement('ul', { className: "space-y-3 text-xs text-[#5A4E46] text-left pt-2" }
                  , React.createElement('li', { className: "flex items-center space-x-2.5" }
                    , React.createElement(Check, { className: "h-4 w-4 text-[#FF6A00] shrink-0 font-extrabold" } )
                    , React.createElement('span', null, React.createElement('strong', { className: "text-[#07122A]" }, "1 Branch"), " Outlet" )
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
                  , React.createElement(Button, { className: "w-full text-xs font-bold h-11 bg-gradient-to-r from-[#FF7A00] to-[#FF4D00] hover:from-[#FF6A00] hover:to-[#E31B00] text-white shadow-md shadow-[#FF6A00]/20 rounded-full" }
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
          , React.createElement('p', { className: "text-sm sm:text-base text-[#FAF7F5]/80 leading-relaxed max-w-xl mx-auto"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 663}}, "Join other growing storefronts that trust Scanloyal to incentivize return visits, prevent check-in fraud, and manage discount vouchers easily."

          )
          , React.createElement('div', { className: "pt-2 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 666}}
            , React.createElement(Link, { to: "/login?signup=true" }
              , React.createElement(Button, { size: "lg", className: "bg-gradient-to-r from-[#FF6A00] to-[#800020] hover:from-[#E05E00] hover:to-[#800020] text-white shadow-xl shadow-[#FF6A00]/25 px-8 h-12 rounded-full text-sm font-semibold transition-all hover:scale-105 duration-200 border-0" }, "Create Free Owner Account"
              )
            )
            , React.createElement(Link, { to: "/login", __self: this, __source: {fileName: _jsxFileName, lineNumber: 672}}
              , React.createElement(Button, { variant: "outline", size: "lg", className: "border border-white/20 text-white hover:bg-white/10 hover:text-white px-8 h-12 rounded-full text-sm font-semibold transition-all duration-200 bg-transparent"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 673}}, "Login to Console"
              )
            )
          )
        )
      )

      /* Cities Section */
      , React.createElement('section', { className: "py-20 bg-[#FAF8F6] border-t border-[#EAE3DF]/30" }
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 text-center space-y-10" }
          , React.createElement('div', { className: "space-y-3" }
            , React.createElement('span', { className: "text-xs font-black text-[#FF6A00] uppercase tracking-widest block" }, "National Network" )
            , React.createElement('h3', { className: "text-3xl font-extrabold text-[#2B201A]" }, "Serving Storefronts Across India 🇮🇳" )
            , React.createElement('p', { className: "text-xs text-[#5A4E46] max-w-md mx-auto leading-relaxed" }, "We are actively empowering local retail stores, bakeries, cafes, beauty salons, and hotels in major cities." )
          )
          , React.createElement('div', { className: "flex flex-wrap items-center justify-center gap-5 pt-4" }
            , ['Delhi', 'Bengaluru', 'Hyderabad', 'Bhubaneswar', 'Rourkela'].map((city) => (
                React.createElement('div', { key: city, className: "flex items-center gap-3 bg-white border border-[#FF6A00]/15 rounded-2xl px-6 py-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-[#FF6A00]/40 transition-all duration-300 relative overflow-hidden group min-w-[160px] justify-center" }
                  , React.createElement('div', { className: "absolute -right-2 -bottom-2 w-8 h-8 rounded-full bg-[#FF6A00]/5 group-hover:scale-150 transition-transform duration-300" })
                  , React.createElement(MapPin, { className: "h-5 w-5 text-[#FF6A00] shrink-0" })
                  , React.createElement('div', { className: "flex flex-col text-left" }
                    , React.createElement('span', { className: "text-xs font-black text-[#2B201A]" }, city)
                    , React.createElement('div', { className: "flex items-center gap-1.5 mt-0.5" }
                      , React.createElement('span', { className: "h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" })
                      , React.createElement('span', { className: "text-[9px] text-slate-400 font-bold uppercase tracking-wider" }, "Live Network")
                    )
                  )
                )
            ))
          )
        )
      )

      /* FAQ Section */
      , React.createElement('section', { className: "py-24 bg-white border-t border-[#EAE3DF]/30" }
        , React.createElement('div', { className: "max-w-4xl mx-auto px-6 space-y-12" }
          , React.createElement('div', { className: "text-center space-y-3" }
            , React.createElement('span', { className: "text-xs font-black text-[#FF6A00] uppercase tracking-widest block" }, "Frequently Asked Questions" )
            , React.createElement('h3', { className: "text-3xl font-extrabold text-[#2B201A]" }, "Everything You Need to Know" )
            , React.createElement('p', { className: "text-xs text-[#5A4E46]" }, "Have questions about digital stamp cards, location guardrails, or plans? We have answers." )
          )
          , React.createElement('div', { className: "space-y-4 pt-4" }
            , [
                {
                  q: "How do customers scan and claim digital stamps?",
                  a: "Customers simply scan your storefront QR code using their default mobile camera. It opens a lightweight web app layout instantly. They verify with their phone number via a quick OTP and see their stamps. No app store download is required!"
                },
                {
                  q: "What is the GPS Location Guardrail and how does it prevent fraud?",
                  a: "To prevent customers from checking in outside your shop (e.g. from home), our system checks the customer's coordinates against your outlet coordinates at scan time. If they are further than 50 meters away, the stamp is blocked."
                },
                {
                  q: "How does the cashback or coupon redemption work?",
                  a: "Once a stamp card is completed, a reward voucher is automatically unlocked and saved in the customer's wallet. The customer shows this voucher to the cashier at checkout. The cashier redeems the code, and applies the discount."
                },
                {
                  q: "Can I manage multiple branch locations on the platform?",
                  a: "Yes! Depending on your chosen subscription plan, you can add and manage multiple outlets from a single unified admin dashboard, each with its own location guardrail coordinates."
                },
                {
                  q: "What is the Launch Offer pricing?",
                  a: "We are currently running a special Launch Year Offer at just ₹999/year (down from ₹3,500) for the first 500 businesses. Register your storefront today to lock in this special rate permanently!"
                }
              ].map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  React.createElement('div', { key: idx, className: "border border-[#EAE3DF] rounded-2xl overflow-hidden transition-all duration-300 bg-white" }
                    , React.createElement('button', {
                        onClick: () => setOpenFaqIndex(isOpen ? null : idx),
                        className: "w-full flex justify-between items-center p-5 text-left font-bold text-xs text-[#2B201A] hover:bg-[#FAF8F6] transition-colors"
                      }
                      , React.createElement('span', null, faq.q)
                      , isOpen ? React.createElement(ChevronUp, { className: "h-4 w-4 text-[#FF6A00]" }) : React.createElement(ChevronDown, { className: "h-4 w-4 text-slate-400" })
                    )
                    , isOpen && React.createElement('div', { className: "p-5 pt-0 border-t border-[#FAF8F6] text-xs text-[#5A4E46] leading-relaxed bg-[#FAF8F6]/40" }
                      , React.createElement('p', null, faq.a)
                    )
                  )
                );
              })
          )
        )
      )

      /* Floating WhatsApp Support */
      , React.createElement('a', {
          href: "https://wa.me/919692919917",
          target: "_blank",
          rel: "noopener noreferrer",
          title: "Chat with us on WhatsApp",
          className: "fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20BA5A] text-white p-3.5 rounded-full shadow-2xl transition-transform hover:scale-110 duration-200 flex items-center justify-center border border-white/20 animate-whatsapp-ring"
        }
          , React.createElement('svg', { className: "h-6 w-6 fill-current", viewBox: "0 0 448 512" }
            , React.createElement('path', { d: "M92.1 254.6c0 24.9 7 49.2 20.2 70.1l-21.5 78.6 80.6-21.1c20 10.9 42.5 16.6 65.5 16.7h.1c77.8 0 141.2-63.5 141.2-141.3 0-37.7-14.7-73.1-41.3-99.7C309.8 102.7 274.4 88 236.7 88c-77.8 0-141.2 63.5-141.2 141.3zm177.9 71.9c-3.8-1.9-22.4-11-25.9-12.2-3.5-1.3-6.1-1.9-8.7 1.9-2.6 3.8-10.2 12.8-12.5 15.4-2.3 2.6-4.6 2.9-8.4 1-3.8-1.9-16.1-5.9-30.7-18.9-11.3-10.1-19-22.6-21.2-26.4-2.2-3.8-.2-5.9 1.7-7.8 1.7-1.7 3.8-4.5 5.7-6.7 1.9-2.2 2.6-3.8 3.8-6.4 1.3-2.6.6-4.8-.3-6.7-.9-1.9-8.7-20.9-11.9-28.7-3.1-7.5-6.3-6.5-8.7-6.6-2.2-.1-4.8-.1-7.4-.1-2.6 0-6.8 1-10.4 4.8-3.6 3.8-13.8 13.5-13.8 32.9s14.1 38.2 16.1 40.8c2 2.6 27.8 42.5 67.5 59.7 9.4 4.1 16.8 6.5 22.5 8.4 9.5 3 18.2 2.6 25 1.6 7.6-1.1 22.4-9.2 25.6-18 3.2-8.9 3.2-16.5 2.2-18-1-1.6-3.5-2.6-7.3-4.5z" })
          )
        )

      /* 8. Global Footer */
      , React.createElement('footer', { className: "bg-[#FAF7F5] text-[#5A4E46] py-16 border-t border-[#EAE3DF]"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 682}}
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 683}}
          , React.createElement('div', { className: "space-y-5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 684}}
            , React.createElement('div', { className: "flex items-center space-x-2.5" }
              , React.createElement('img', { src: "/new.png", alt: "Scanloyal Logo", className: "h-8 w-auto object-contain" })
              , React.createElement('div', { className: "flex flex-col justify-center" }
                , React.createElement('span', { className: "text-sm font-black tracking-tight text-[#2B201A] leading-tight" }, "Scanloyal")
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
              , React.createElement('li', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 717}}, React.createElement(Link, { to: "/privacy-policy", className: "text-[#5A4E46] hover:text-[#FF6A00] transition-colors" }, "Privacy Policy" ))
              , React.createElement('li', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 718}}, React.createElement(Link, { to: "/terms-of-service", className: "text-[#5A4E46] hover:text-[#FF6A00] transition-colors" }, "Terms of Service"  ))
              , React.createElement('li', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 719}}, React.createElement('span', { className: "text-[#5A4E46]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 719}}, "Support Desk" ))
            )
          )
        )

        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 pt-8 mt-8 border-t border-[#EAE3DF]/50 flex flex-col md:flex-row justify-between items-center text-xs font-medium"            , __self: this, __source: {fileName: _jsxFileName, lineNumber: 724}}
          , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 725}}
              , "© " , new Date().getFullYear(), " Scanloyal SaaS. Subsidiary of "
              , React.createElement('a', { href: "https://logisaar.in", target: "_blank", rel: "noopener noreferrer", className: "text-[#FF6A00] hover:underline font-bold" }, "Logisaar Technologies Private Limited")
              , ". All rights reserved."
            )
          , React.createElement('span', { className: "text-[10px] text-[#8C6553] mt-2 md:mt-0 font-bold"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 726}}, "Made for retail store retention in India"      )
        )
      )

      /* Floating Back to Top Button */
      , showBackToTop && (
        React.createElement('button', {
          onClick: () => {
            document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
          },
          className: "fixed bottom-24 right-6 z-50 p-3 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#800020] text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 ease-in-out animate-fade-in focus:outline-none"
        }
          , React.createElement(ArrowUp, { className: "h-5 w-5" })
        )
      )

    )
  );
}

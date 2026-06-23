import React from "react";
import { Link } from "react-router-dom";
import { Scale, ArrowLeft, ShieldAlert, Award, QrCode, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    React.createElement('div', { className: "min-h-screen bg-[#FAF8F6] text-[#2B201A] font-sans selection:bg-[#FF6A00]/10 bg-dots pb-12" }
      
      /* Global Header */
      , React.createElement('header', { className: "sticky top-0 z-50 w-full border-b border-[#EAE3DF]/50 bg-white/75 backdrop-blur-md" }
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 h-16 flex items-center justify-between" }
          , React.createElement(Link, { to: "/", className: "flex items-center space-x-3" }
            , React.createElement('img', { src: "/new.png", alt: "LogiSaar Logo", className: "h-8 w-auto object-contain" })
            , React.createElement('div', { className: "flex flex-col justify-center" }
              , React.createElement('span', { className: "text-sm font-black tracking-tight text-[#2B201A] leading-tight" }, "LogiSaar")
              , React.createElement('span', { className: "text-[9px] font-black text-[#FF6A00] uppercase tracking-wider leading-none" }, "ScanLoyal")
            )
          )
          , React.createElement(Link, { to: "/" }
            , React.createElement(Button, { variant: "ghost", size: "sm", className: "text-[#5A4E46] hover:text-[#2B201A] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5" }
              , React.createElement(ArrowLeft, { className: "h-3.5 w-3.5" })
              , "Back to home"
            )
          )
        )
      )

      /* Main container */
      , React.createElement('main', { className: "max-w-4xl mx-auto px-6 pt-12 relative z-10" }
        , React.createElement('div', { className: "space-y-8" }
          
          /* Title Section */
          , React.createElement('div', { className: "space-y-3 text-center md:text-left" }
            , React.createElement('div', { className: "inline-flex items-center gap-1.5 bg-[#FF6A00]/10 text-[#FF6A00] px-3.5 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest" }
              , React.createElement(Scale, { className: "h-3.5 w-3.5" })
              , "Terms & Conditions"
            )
            , React.createElement('h1', { className: "text-3xl md:text-5xl font-extrabold text-[#2B201A]" }, "Terms of Service")
            , React.createElement('p', { className: "text-sm text-[#8C6553] font-medium" }, "Last Updated: June 23, 2026")
          )

          /* Main Card */
          , React.createElement(Card, { className: "glass rounded-[32px] border-[#EAE3DF] overflow-hidden" }
            , React.createElement(CardHeader, { className: "p-8 border-b border-[#FAF7F5] bg-white/40" }
              , React.createElement(CardTitle, { className: "text-xl font-bold text-[#2B201A] flex items-center gap-2" }
                , React.createElement(Scale, { className: "h-5 w-5 text-[#FF6A00]" })
                , "Smart Loyalty Terms Addendum"
              )
              , React.createElement(CardDescription, { className: "text-xs text-[#8C6553] leading-relaxed" }
                , "Please read these terms carefully. By using our Smart Loyalty platform, you agree to comply with the merchant rules, point programs, and refund configurations outlined below."
              )
            )

            , React.createElement(CardContent, { className: "p-8 space-y-8 text-xs text-[#5A4E46] leading-relaxed" }
              
              /* Section 1: Merchant Responsibilities */
              , React.createElement('section', { className: "space-y-3" }
                , React.createElement('h3', { className: "text-sm font-extrabold text-[#2B201A] flex items-center gap-2" }
                  , React.createElement(ShieldAlert, { className: "h-4 w-4 text-[#FF6A00]" })
                  , "1. Merchant Responsibilities"
                )
                , React.createElement('p', null, "All merchants utilizing the ScanLoyal SaaS platform must adhere to the following responsibilities:")
                , React.createElement('ul', { className: "list-disc pl-5 space-y-1.5 mt-2 font-medium text-[#2B201A]" }
                  , React.createElement('li', null, "Provide accurate business information")
                  , React.createElement('li', null, "Comply with consumer laws")
                  , React.createElement('li', null, "Obtain customer consent")
                  , React.createElement('li', null, "Use platform lawfully")
                )
              )

              /* Section 2: Points and Rewards */
              , React.createElement('section', { className: "space-y-3" }
                , React.createElement('h3', { className: "text-sm font-extrabold text-[#2B201A] flex items-center gap-2" }
                  , React.createElement(Award, { className: "h-4 w-4 text-[#FF6A00]" })
                  , "2. Points and Rewards"
                )
                , React.createElement('p', null, "The merchant is solely and exclusively responsible for all configurations, redemptions, and legal disputes regarding:")
                , React.createElement('ul', { className: "list-disc pl-5 space-y-1.5 mt-2 font-medium text-[#2B201A]" }
                  , React.createElement('li', null, "Reward values")
                  , React.createElement('li', null, "Reward redemption")
                  , React.createElement('li', null, "Reward availability")
                  , React.createElement('li', null, "Promotional offers")
                )
                , React.createElement('p', { className: "mt-2 italic bg-[#FAF7F5] border border-[#EAE3DF] rounded-xl p-3 text-[#FF6A00] font-semibold" }
                  , "Logisaar Technologies Private Limited does not guarantee, underwrite, or assume liability for any rewards or promotional offers provided by merchants."
                )
              )

              /* Section 3: QR Scanning */
              , React.createElement('section', { className: "space-y-2" }
                , React.createElement('h3', { className: "text-sm font-extrabold text-[#2B201A] flex items-center gap-2" }
                  , React.createElement(QrCode, { className: "h-4 w-4 text-[#FF6A00]" })
                  , "3. QR Scanning Logs"
                )
                , React.createElement('p', null, "To protect physical stores from fraud and false scans, all QR scans and customer check-in actions may be logged for security auditing, fraud detection, and analytics purposes.")
              )

              /* Section 4: Service Availability */
              , React.createElement('section', { className: "space-y-2" }
                , React.createElement('h3', { className: "text-sm font-extrabold text-[#2B201A]" }, "4. Service Availability")
                , React.createElement('p', null, "We strive for maximum uptime, but the service may occasionally be unavailable due to routine maintenance, network issues, or infrastructure upgrades.")
              )

              /* Section 5: Smart Loyalty Refund Addendum */
              , React.createElement('section', { className: "space-y-3 bg-[#FAF7F5] border border-[#EAE3DF] rounded-2xl p-4" }
                , React.createElement('h3', { className: "text-sm font-extrabold text-[#2B201A] flex items-center gap-2" }
                  , React.createElement(DollarSign, { className: "h-4 w-4 text-[#FF6A00]" })
                  , "5. Smart Loyalty Refund Addendum"
                )
                , React.createElement('p', null, "Due to the Software-as-a-Service (SaaS) nature of our products, the following refund rules apply:")
                , React.createElement('table', { className: "w-full border-collapse border border-[#EAE3DF] mt-2 font-medium text-xs text-[#2B201A]" }
                  , React.createElement('thead', null
                    , React.createElement('tr', { className: "bg-white/40" }
                      , React.createElement('th', { className: "border border-[#EAE3DF] px-3 py-2 text-left" }, "Service Element")
                      , React.createElement('th', { className: "border border-[#EAE3DF] px-3 py-2 text-left" }, "Refund Status")
                    )
                  )
                  , React.createElement('tbody', null
                    , React.createElement('tr', null
                      , React.createElement('td', { className: "border border-[#EAE3DF] px-3 py-2" }, "Setup Fee")
                      , React.createElement('td', { className: "border border-[#EAE3DF] px-3 py-2 text-red font-semibold" }, "Non-refundable")
                    )
                    , React.createElement('tr', null
                      , React.createElement('td', { className: "border border-[#EAE3DF] px-3 py-2" }, "Subscription Fee")
                      , React.createElement('td', { className: "border border-[#EAE3DF] px-3 py-2 text-red font-semibold" }, "Non-refundable for current billing cycle")
                    )
                    , React.createElement('tr', null
                      , React.createElement('td', { className: "border border-[#EAE3DF] px-3 py-2" }, "Domain Cost")
                      , React.createElement('td', { className: "border border-[#EAE3DF] px-3 py-2 text-red font-semibold" }, "Non-refundable")
                    )
                    , React.createElement('tr', null
                      , React.createElement('td', { className: "border border-[#EAE3DF] px-3 py-2" }, "Hosting Cost")
                      , React.createElement('td', { className: "border border-[#EAE3DF] px-3 py-2 text-red font-semibold" }, "Non-refundable after activation")
                    )
                  )
                )
              )

              /* Product Page Legal Notice */
              , React.createElement('div', { className: "pt-6 border-t border-dashed border-[#EAE3DF] text-[11px] text-[#8C6553] font-bold" }
                , "This Product Privacy Policy and Terms of Service supplement the Master Policies of Logisaar Technologies Private Limited. In the event of a conflict, the product-specific terms shall prevail for the Smart Loyalty Solution."
              )
            )
          )

          /* Small Footer copyright */
          , React.createElement('div', { className: "text-center text-[10px] text-[#8C6553] pt-4" }
            , "© " , new Date().getFullYear(), " Logisaar Technologies Private Limited. All rights reserved."
          )
        )
      )
    )
  );
}

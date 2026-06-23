import React from "react";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft, Lock, Database, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
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
              , React.createElement(Shield, { className: "h-3.5 w-3.5" })
              , "Google OAuth Verified Policy"
            )
            , React.createElement('h1', { className: "text-3xl md:text-5xl font-extrabold text-[#2B201A]" }, "Privacy Policy & Addendum")
            , React.createElement('p', { className: "text-sm text-[#8C6553] font-medium" }, "Last Updated: June 23, 2026")
          )

          /* Main Card */
          , React.createElement(Card, { className: "glass rounded-[32px] border-[#EAE3DF] overflow-hidden" }
            , React.createElement(CardHeader, { className: "p-8 border-b border-[#FAF7F5] bg-white/40" }
              , React.createElement(CardTitle, { className: "text-xl font-bold text-[#2B201A] flex items-center gap-2" }
                , React.createElement(Lock, { className: "h-5 w-5 text-[#FF6A00]" })
                , "Smart Loyalty Privacy Addendum"
              )
              , React.createElement(CardDescription, { className: "text-xs text-[#8C6553] leading-relaxed" }
                , "Your privacy is important to us. This addendum details the data collected, purpose, and ownership controls for the Smart Loyalty Solution."
              )
            )

            , React.createElement(CardContent, { className: "p-8 space-y-8 text-xs text-[#5A4E46] leading-relaxed" }
              
              /* Section 1: Data Collected */
              , React.createElement('section', { className: "space-y-3" }
                , React.createElement('h3', { className: "text-sm font-extrabold text-[#2B201A] flex items-center gap-2" }
                  , React.createElement(Database, { className: "h-4 w-4 text-[#FF6A00]" })
                  , "1. Data Collected"
                )
                , React.createElement('p', null, "The Smart Loyalty Solution collects the following user information to manage loyalty campaigns:")
                , React.createElement('ul', { className: "list-disc pl-5 space-y-1.5 mt-2 font-medium text-[#2B201A]" }
                  , React.createElement('li', null, "Customer Name")
                  , React.createElement('li', null, "Mobile Number")
                  , React.createElement('li', null, "Email Address")
                  , React.createElement('li', null, "Visit History")
                  , React.createElement('li', null, "Reward Points")
                  , React.createElement('li', null, "Redemption History")
                  , React.createElement('li', null, "Business Account Information")
                  , React.createElement('li', null, "Store Information")
                  , React.createElement('li', null, "Device Information")
                )
              )

              /* Section 2: Purpose */
              , React.createElement('section', { className: "space-y-3" }
                , React.createElement('h3', { className: "text-sm font-extrabold text-[#2B201A] flex items-center gap-2" }
                  , React.createElement(Eye, { className: "h-4 w-4 text-[#FF6A00]" })
                  , "2. Purpose"
                )
                , React.createElement('p', null, "Information collected is strictly utilized for the following functional purposes:")
                , React.createElement('ul', { className: "list-disc pl-5 space-y-1.5 mt-2 font-medium text-[#2B201A]" }
                  , React.createElement('li', null, "Loyalty Program Management")
                  , React.createElement('li', null, "Reward Tracking")
                  , React.createElement('li', null, "QR Code Validation")
                  , React.createElement('li', null, "Customer Engagement")
                  , React.createElement('li', null, "Analytics")
                  , React.createElement('li', null, "Fraud Prevention")
                )
              )

              /* Section 3: Google Integration & OAuth Scopes */
              , React.createElement('section', { className: "space-y-3 bg-[#FAF7F5] border border-[#EAE3DF] rounded-2xl p-4" }
                , React.createElement('h3', { className: "text-xs font-black text-[#FF6A00] uppercase tracking-wider" }, "Google OAuth User Data disclosures")
                , React.createElement('p', null, "To facilitate frictionless account creation and secure customer/merchant login, ScanLoyal allows authentication using Google Sign-In. By utilizing this integration, we retrieve your Google Profile details (Name, Email, and Profile Avatar picture).")
                , React.createElement('p', null, "Our use and transfer of information received from Google APIs to any other app will adhere to the Google API Services User Data Policy, including the Limited Use requirements. We do not sell or share Google OAuth credentials or profile information with third parties for commercial marketing.")
              )

              /* Section 4: Merchant Data */
              , React.createElement('section', { className: "space-y-2" }
                , React.createElement('h3', { className: "text-sm font-extrabold text-[#2B201A]" }, "3. Merchant Data Ownership")
                , React.createElement('p', null, "Business owners remain the absolute owners of any customer data entered into the platform. Logisaar acts solely as a service provider (data processor) for processing such information under the instructions of the respective merchant.")
              )

              /* Section 5: Marketing */
              , React.createElement('section', { className: "space-y-2" }
                , React.createElement('h3', { className: "text-sm font-extrabold text-[#2B201A]" }, "4. Marketing Communications")
                , React.createElement('p', null, "Merchants are solely responsible for obtaining explicit customer consent before sending marketing communications, promotional updates, SMS alerts, or emails via platform channels.")
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

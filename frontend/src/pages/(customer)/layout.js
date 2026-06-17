import { useNavigate, useLocation, Outlet, Link } from "react-router-dom";
const _jsxFileName = "src\\pages\\(customer)\\layout.tsx";"use client";

import React, { useEffect, useState } from "react";

import { useAuthStore } from "@/store/authStore";
import { Home, Scan, History, User, LogOut, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export default function CustomerLayout({
  children,
}

) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, loading, logout } = useAuthStore();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "CUSTOMER") {
        if (typeof window !== "undefined") {
          const searchParams = new URLSearchParams(window.location.search);
          const businessId = searchParams.get("businessId");
          const branchId = searchParams.get("branchId");
          const token = searchParams.get("token");
          if (businessId && branchId && token) {
            sessionStorage.setItem("pendingCheckin", JSON.stringify({ businessId, branchId, token }));
          }
        }
        navigate("/login");
      } else {
        setAuthorized(true);
      }
    }
  }, [user, loading, navigate]);

  if (loading || !authorized) {
    return (
      React.createElement('div', { className: "flex min-h-screen items-center justify-center bg-background"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 41}}
        , React.createElement(Loader2, { className: "h-8 w-8 animate-spin text-primary"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 42}} )
      )
    );
  }

  const navItems = [
    { label: "Home", icon: Home, href: "/dashboard" },
    { label: "Check In", icon: Scan, href: "/checkin", highlight: true },
    { label: "History", icon: History, href: "/history" },
    { label: "Profile", icon: User, href: "/profile" },
  ];

  return (
    React.createElement('div', { className: "min-h-screen bg-[#f8fafc] safe-top safe-bottom text-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 55}}
      , React.createElement('div', { className: "mx-auto min-h-screen max-w-md bg-white border-x border-border shadow-sm relative flex flex-col pb-20"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 56}}

        /* Header Bar */
        , React.createElement('header', { className: "sticky top-0 z-30 flex items-center justify-between border-b border-border bg-white/80 p-4 backdrop-blur-md"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 59}}
          , React.createElement('div', { className: "flex items-center space-x-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 60}}
            , React.createElement('div', { className: "h-7 w-7 rounded-lg bg-gradient-to-tr from-primary to-indigo-400 flex items-center justify-center shadow-sm"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 61}}
              , React.createElement('span', { className: "text-xs font-bold text-white"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 62}}, "S")
            )
            , React.createElement('span', { className: "text-sm font-semibold tracking-tight text-foreground"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 64}}, "ScanLoyal")
          )
          , React.createElement('button', {
            onClick: logout,
            className: "rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors animate-pulse"      ,
            style: { animationDuration: '3s' }, __self: this, __source: {fileName: _jsxFileName, lineNumber: 66}}

            , React.createElement(LogOut, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 71}} )
          )
        )

        /* Core Content */
        , React.createElement('main', { className: "flex-1 p-4 overflow-y-auto"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 76}}
          , React.createElement(Outlet, null)
        )

        /* Bottom PWA Navbar */
        , React.createElement('nav', { className: "fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md border-t border-border bg-white/95 py-2 backdrop-blur-lg px-6 flex justify-between items-center shadow-md"                , __self: this, __source: {fileName: _jsxFileName, lineNumber: 81}}
          , navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            if (item.highlight) {
              return (
                React.createElement(Link, { key: item.href, to: item.href, className: "relative -top-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 88}}
                  , React.createElement('div', { className: "flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-90 transition-transform"             , __self: this, __source: {fileName: _jsxFileName, lineNumber: 89}}
                    , React.createElement(Icon, { className: "h-6 w-6" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 90}} )
                  )
                )
              );
            }

            return (
              React.createElement(Link, {
                key: item.href,
                to: item.href,
                className: cn(
                  "flex flex-col items-center space-y-1 text-muted-foreground hover:text-foreground transition-colors py-1 px-3 rounded-lg",
                  isActive && "text-primary font-medium"
                ), __self: this, __source: {fileName: _jsxFileName, lineNumber: 97}}

                , React.createElement(Icon, { className: "h-5 w-5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 105}} )
                , React.createElement('span', { className: "text-[10px]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 106}}, item.label)
              )
            );
          })
        )
      )
    )
  );
}

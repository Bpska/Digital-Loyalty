import { useNavigate, useLocation, Outlet, Link } from "react-router-dom";
const _jsxFileName = "src\\pages\\(super-admin)\\layout.tsx";"use client";

import React, { useEffect, useState } from "react";

import { useAuthStore } from "@/store/authStore";
import { 
  ShieldCheck, 
  Building2, 
  AlertTriangle, 
  LogOut, 
  Menu, 
  X, 
  Loader2,
  MessageSquare
} from "lucide-react";

import { cn } from "@/lib/utils";

export default function SuperAdminLayout({
  children,
}

) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, loading, logout } = useAuthStore();
  const [authorized, setAuthorized] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "SUPER_ADMIN") {
        navigate("/login");
      } else {
        setAuthorized(true);
      }
    }
  }, [user, loading, navigate]);

  if (loading || !authorized) {
    return (
      React.createElement('div', { className: "flex min-h-screen items-center justify-center bg-background"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 42}}
        , React.createElement(Loader2, { className: "h-8 w-8 animate-spin text-primary"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 43}} )
      )
    );
  }

  const menuItems = [
    { label: "Console Overview", icon: ShieldCheck, href: "/dashboard/super" },
    { label: "Businesses & Plans", icon: Building2, href: "/dashboard/super/businesses" },
    { label: "Fraud Monitor", icon: AlertTriangle, href: "/dashboard/super/fraud" },
    { label: "Support Messages", icon: MessageSquare, href: "/dashboard/super/support" },
  ];

  return (
    React.createElement('div', { className: "min-h-screen bg-background flex text-foreground"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 55}}
      /* Desktop Sidebar */
      , React.createElement('aside', { className: "w-64 border-r border-border bg-card hidden md:flex flex-col h-screen sticky top-0"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 57}}
        , React.createElement('div', { className: "p-6 border-b border-border flex items-center space-x-2"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 58}}
          , React.createElement('div', { className: "h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-indigo-400 flex items-center justify-center shadow-sm"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 59}}
            , React.createElement('span', { className: "text-sm font-bold text-white"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 60}}, "SA")
          )
          , React.createElement('span', { className: "text-base font-bold text-foreground tracking-tight"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 62}}, "Super Control" )
        )
        , React.createElement('nav', { className: "flex-1 p-4 space-y-1 overflow-y-auto"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 64}}
          , menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              React.createElement(Link, {
                key: item.href,
                to: item.href,
                className: cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground font-medium shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                ), __self: this, __source: {fileName: _jsxFileName, lineNumber: 69}}

                , React.createElement(Icon, { className: "h-4.5 w-4.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 79}} )
                , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 80}}, item.label)
              )
            );
          })
        )
        , React.createElement('div', { className: "p-4 border-t border-border"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 85}}
          , React.createElement('button', {
            onClick: logout,
            className: "flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 86}}

            , React.createElement(LogOut, { className: "h-4.5 w-4.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 90}} )
            , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 91}}, "Sign Out" )
          )
        )
      )

      /* Mobile Nav Overlay */
      , mobileOpen && (
        React.createElement('div', { 
          className: "fixed inset-0 bg-black/40 z-40 md:hidden"    ,
          onClick: () => setMobileOpen(false), __self: this, __source: {fileName: _jsxFileName, lineNumber: 98}}
        )
      )

      /* Mobile Sidebar */
      , React.createElement('aside', { className: cn(
        "fixed top-0 bottom-0 left-0 w-64 bg-card z-50 border-r border-border transition-transform duration-300 md:hidden flex flex-col",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      ), __self: this, __source: {fileName: _jsxFileName, lineNumber: 105}}
        , React.createElement('div', { className: "p-6 border-b border-border flex items-center justify-between"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 109}}
          , React.createElement('div', { className: "flex items-center space-x-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 110}}
            , React.createElement('div', { className: "h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-indigo-400 flex items-center justify-center"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 111}}
              , React.createElement('span', { className: "text-sm font-bold text-white"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 112}}, "SA")
            )
            , React.createElement('span', { className: "text-base font-bold text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 114}}, "Super Control" )
          )
          , React.createElement('button', { onClick: () => setMobileOpen(false), className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 116}}
            , React.createElement(X, { className: "h-5 w-5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 117}} )
          )
        )
        , React.createElement('nav', { className: "flex-1 p-4 space-y-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 120}}
          , menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              React.createElement(Link, {
                key: item.href,
                to: item.href,
                onClick: () => setMobileOpen(false),
                className: cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground font-medium" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                ), __self: this, __source: {fileName: _jsxFileName, lineNumber: 125}}

                , React.createElement(Icon, { className: "h-4.5 w-4.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 136}} )
                , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 137}}, item.label)
              )
            );
          })
        )
        , React.createElement('div', { className: "p-4 border-t border-border"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 142}}
          , React.createElement('button', {
            onClick: logout,
            className: "flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 143}}

            , React.createElement(LogOut, { className: "h-4.5 w-4.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 147}} )
            , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 148}}, "Sign Out" )
          )
        )
      )

      /* Main Container */
      , React.createElement('div', { className: "flex-1 flex flex-col min-w-0 bg-background"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 154}}
        /* Top Navbar */
        , React.createElement('header', { className: "h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 156}}
          , React.createElement('div', { className: "flex items-center space-x-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 157}}
            , React.createElement('button', { 
              className: "text-muted-foreground md:hidden p-1 rounded-lg hover:bg-muted"    , 
              onClick: () => setMobileOpen(true), __self: this, __source: {fileName: _jsxFileName, lineNumber: 158}}

              , React.createElement(Menu, { className: "h-5 w-5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 162}} )
            )
            , React.createElement('h2', { className: "text-sm font-semibold text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 164}}, "Super Admin Infrastructure Console"

            )
          )
          , React.createElement('div', { className: "flex items-center space-x-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 168}}
            , React.createElement('div', { className: "flex items-center space-x-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 169}}
              , React.createElement('div', { className: "h-8 w-8 rounded-full bg-red-50 border border-red-100 text-destructive font-bold flex items-center justify-center text-xs"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 170}}, "SA"

              )
              , React.createElement('span', { className: "text-xs text-foreground font-semibold hidden md:block"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 173}}, "Root Admin"

              )
            )
          )
        )

        /* Content Box */
        , React.createElement('main', { className: "flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 181}}
          , React.createElement(Outlet, null)
        )
      )
    )
  );
}

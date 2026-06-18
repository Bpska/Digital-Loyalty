import { useNavigate, useLocation, Outlet, Link } from "react-router-dom";
const _jsxFileName = "src\\pages\\(business-admin)\\layout.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }"use client";

import React, { useEffect, useState } from "react";

import { useAuthStore } from "@/store/authStore";
import { 
  LayoutDashboard, 
  MapPin,
 
  Settings, 
  Award, 
  Percent, 
  BarChart3,
 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Loader2 
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function BusinessAdminLayout({
  children,
}

) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, loading, logout } = useAuthStore();
  const [authorized, setAuthorized] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data || []);
      const countRes = await api.get("/notifications/unread-count");
      setUnreadCount(countRes.data?.count || 0);
    } catch (err) {
      console.error("Failed to fetch business notifications:", err);
    }
  };

  useEffect(() => {
    if (authorized) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [authorized]);

  const handleMarkAllRead = async () => {
    try {
      await api.post("/notifications/read-all");
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "BUSINESS_ADMIN") {
        navigate("/login");
      } else {
        setAuthorized(true);
      }
    }
  }, [user, loading, navigate]);

  if (loading || !authorized) {
    return (
      React.createElement('div', { className: "flex min-h-screen items-center justify-center bg-background"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 47}}
        , React.createElement(Loader2, { className: "h-8 w-8 animate-spin text-primary"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 48}} )
      )
    );
  }

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/business" },
    { label: "Branches", icon: MapPin, href: "/dashboard/business/branches" },
    { label: "Loyalty Programs", icon: Settings, href: "/dashboard/business/loyalty" },
    { label: "Rewards", icon: Award, href: "/dashboard/business/rewards" },
    { label: "Coupons", icon: Percent, href: "/dashboard/business/coupons" },
    { label: "Analytics", icon: BarChart3, href: "/dashboard/business/analytics" },
  ];

  return (
    React.createElement('div', { className: "min-h-screen bg-background flex text-foreground"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 63}}
      /* Desktop Sidebar */
      , React.createElement('aside', { className: "w-64 border-r border-border bg-card hidden md:flex flex-col h-screen sticky top-0"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 65}}
        , React.createElement('div', { className: "p-6 border-b border-border flex items-center space-x-2"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 66}}
          , React.createElement('img', { src: "/image.png", alt: "LogiSaar Logo", className: "h-7 w-auto object-contain" })
          , React.createElement('span', { className: "text-base font-bold text-foreground tracking-tight"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 70}}, "Business" )
        )
        , React.createElement('nav', { className: "flex-1 p-4 space-y-1 overflow-y-auto"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 72}}
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
                ), __self: this, __source: {fileName: _jsxFileName, lineNumber: 77}}

                , React.createElement(Icon, { className: "h-4.5 w-4.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 87}} )
                , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 88}}, item.label)
              )
            );
          })
        )
        , React.createElement('div', { className: "p-4 border-t border-border"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 93}}
          , React.createElement('button', {
            onClick: logout,
            className: "flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 94}}

            , React.createElement(LogOut, { className: "h-4.5 w-4.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 98}} )
            , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 99}}, "Sign Out" )
          )
        )
      )

      /* Mobile Nav Drawer Overlay */
      , mobileOpen && (
        React.createElement('div', { 
          className: "fixed inset-0 bg-black/40 z-40 md:hidden"    ,
          onClick: () => setMobileOpen(false), __self: this, __source: {fileName: _jsxFileName, lineNumber: 106}}
        )
      )

      /* Mobile Sidebar */
      , React.createElement('aside', { className: cn(
        "fixed top-0 bottom-0 left-0 w-64 bg-card z-50 border-r border-border transition-transform duration-300 md:hidden flex flex-col",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      ), __self: this, __source: {fileName: _jsxFileName, lineNumber: 113}}
        , React.createElement('div', { className: "p-6 border-b border-border flex items-center justify-between"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 117}}
          , React.createElement('div', { className: "flex items-center space-x-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 118}}
            , React.createElement('img', { src: "/image.png", alt: "LogiSaar Logo", className: "h-7 w-auto object-contain" })
            , React.createElement('span', { className: "text-base font-bold text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 122}}, "Business" )
          )
          , React.createElement('button', { onClick: () => setMobileOpen(false), className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 124}}
            , React.createElement(X, { className: "h-5 w-5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 125}} )
          )
        )
        , React.createElement('nav', { className: "flex-1 p-4 space-y-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 128}}
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
                ), __self: this, __source: {fileName: _jsxFileName, lineNumber: 133}}

                , React.createElement(Icon, { className: "h-4.5 w-4.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 144}} )
                , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 145}}, item.label)
              )
            );
          })
        )
        , React.createElement('div', { className: "p-4 border-t border-border"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 150}}
          , React.createElement('button', {
            onClick: logout,
            className: "flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 151}}

            , React.createElement(LogOut, { className: "h-4.5 w-4.5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 155}} )
            , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 156}}, "Sign Out" )
          )
        )
      )

      /* Main Container */
      , React.createElement('div', { className: "flex-1 flex flex-col min-w-0 bg-background bg-dots"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 162}}
        /* Top Navbar */
        , React.createElement('header', { className: "h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 164}}
          , React.createElement('div', { className: "flex items-center space-x-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 165}}
            , React.createElement('button', { 
              className: "text-muted-foreground md:hidden p-1 rounded-lg hover:bg-muted"    , 
              onClick: () => setMobileOpen(true), __self: this, __source: {fileName: _jsxFileName, lineNumber: 166}}

              , React.createElement(Menu, { className: "h-5 w-5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 170}} )
            )
            , React.createElement('h2', { className: "text-sm font-semibold text-muted-foreground hidden sm:block"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 172}}, "Business Portal"

            )
          )
          , React.createElement('div', { className: "flex items-center space-x-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 176}}
            /* Notifications */
            , React.createElement('button', {
                onClick: () => {
                  setShowNotifications(true);
                  fetchNotifications();
                },
                className: "relative p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
                __self: this,
                __source: {fileName: _jsxFileName, lineNumber: 178}
              }
              , React.createElement(Bell, { className: "h-4.5 w-4.5" })
              , unreadCount > 0 && (
                  React.createElement('span', { className: "absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary" })
                )
            )
            , React.createElement('div', { className: "h-px bg-border w-4 hidden sm:block"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 182}} )
            /* User avatar */
            , React.createElement('div', { className: "flex items-center space-x-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 184}}
              , React.createElement('div', { className: "h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 text-primary font-bold flex items-center justify-center text-xs"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 185}}
                , _optionalChain([user, 'optionalAccess', _ => _.name, 'optionalAccess', _2 => _2[0], 'optionalAccess', _3 => _3.toUpperCase, 'optionalCall', _4 => _4()])
              )
              , React.createElement('span', { className: "text-xs text-foreground font-semibold hidden md:block"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 188}}
                , _optionalChain([user, 'optionalAccess', _5 => _5.name])
              )
            )
          )
        )

        /* Content Box */
        , React.createElement('main', { className: "flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 196}}
          , React.createElement(Outlet, null)
        )
        /* Notifications Modal Dialog */
        , showNotifications && (
            React.createElement(Dialog, { open: showNotifications, onOpenChange: (open) => !open && setShowNotifications(false) }
              , React.createElement(DialogContent, { className: "max-w-[420px] bg-white border border-border" }
                , React.createElement(DialogHeader, { className: "flex flex-row justify-between items-center pb-2 border-b border-border/60" }
                  , React.createElement('div', null
                    , React.createElement(DialogTitle, { className: "text-base font-bold text-foreground" }, "System Notifications")
                    , React.createElement(DialogDescription, { className: "text-[10px] text-muted-foreground mt-0.5" }, "Alerts and messages sent by Super Admin")
                  )
                  , unreadCount > 0 && (
                      React.createElement(Button, { size: "sm", variant: "ghost", className: "text-[10px] h-7 text-primary hover:text-primary/80 font-bold px-2", onClick: handleMarkAllRead }, "Mark all read")
                    )
                )
                , React.createElement('div', { className: "max-h-[320px] overflow-y-auto space-y-3 py-2 scrollbar-none" }
                  , notifications.length === 0 ? (
                      React.createElement('div', { className: "text-center py-8 text-muted-foreground text-xs" }, "No notifications from administration.")
                    ) : (
                      notifications.map((notif) => (
                        React.createElement('div', { key: notif.id, className: `p-3 rounded-lg border text-xs transition-colors ${notif.isRead ? 'bg-slate-50/50 border-slate-100' : 'bg-primary/5 border-primary/10'}` }
                          , React.createElement('div', { className: "flex justify-between items-start mb-1" }
                            , React.createElement('span', { className: "font-bold text-foreground" }, notif.title)
                            , React.createElement('span', { className: "text-[9px] text-muted-foreground" }, formatDate(notif.createdAt))
                          )
                          , React.createElement('p', { className: "text-muted-foreground leading-relaxed text-[11px]" }, notif.body)
                        )
                      ))
                    )
                )
              )
            )
          )
      )
    )
  );
}

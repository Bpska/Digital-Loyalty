import { useNavigate, useLocation, Outlet, Link } from "react-router-dom";
const _jsxFileName = "src\\pages\\(customer)\\layout.tsx";"use client";

import React, { useEffect, useState } from "react";

import { useAuthStore } from "@/store/authStore";
import { Home, Scan, History, User, LogOut, Loader2, Bell } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

import { cn } from "@/lib/utils";

export default function CustomerLayout({
  children,
}

) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, loading, logout } = useAuthStore();
  const [authorized, setAuthorized] = useState(false);

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
      console.error("Failed to fetch customer notifications:", err);
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
    React.createElement('div', { className: "min-h-screen bg-[#f8fafc] bg-dots safe-top safe-bottom text-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 55}}
      , React.createElement('div', { className: "mx-auto min-h-screen max-w-md bg-white border-x border-border shadow-sm relative flex flex-col pb-20"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 56}}

        /* Header Bar */
        , React.createElement('header', { className: "sticky top-0 z-30 flex items-center justify-between border-b border-border bg-white/80 p-4 backdrop-blur-md"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 59}}
          , React.createElement('div', { className: "flex items-center space-x-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 60}}
            , React.createElement('span', { className: "text-sm font-semibold tracking-tight text-foreground" }, "ScanLoyal")
          )
          , React.createElement('div', { className: "flex items-center space-x-1" }
            , React.createElement('button', {
                onClick: () => {
                  setShowNotifications(true);
                  fetchNotifications();
                },
                className: "relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              }
              , React.createElement(Bell, { className: "h-4 w-4" })
              , unreadCount > 0 && (
                  React.createElement('span', { className: "absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary" })
                )
            )
            , React.createElement('button', {
                onClick: logout,
                className: "rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              }
              , React.createElement(LogOut, { className: "h-4 w-4" })
            )
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
        /* Notifications Modal Dialog */
        , showNotifications && (
            React.createElement(Dialog, { open: showNotifications, onOpenChange: (open) => !open && setShowNotifications(false) }
              , React.createElement(DialogContent, { className: "max-w-[360px] bg-white border border-border" }
                , React.createElement(DialogHeader, { className: "flex flex-row justify-between items-center pb-2 border-b border-border/60" }
                  , React.createElement('div', null
                    , React.createElement(DialogTitle, { className: "text-base font-bold text-foreground" }, "Notifications")
                    , React.createElement(DialogDescription, { className: "text-[10px] text-muted-foreground mt-0.5" }, "Alerts and updates from the platform")
                  )
                  , unreadCount > 0 && (
                      React.createElement(Button, { size: "sm", variant: "ghost", className: "text-[10px] h-7 text-primary hover:text-primary/80 font-bold px-2", onClick: handleMarkAllRead }, "Mark all read")
                    )
                )
                , React.createElement('div', { className: "max-h-[320px] overflow-y-auto space-y-3 py-2 scrollbar-none" }
                  , notifications.length === 0 ? (
                      React.createElement('div', { className: "text-center py-8 text-muted-foreground text-xs" }, "No notifications yet.")
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

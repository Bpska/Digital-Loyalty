import { useNavigate, useLocation, Outlet, Link } from "react-router-dom";
const _jsxFileName = "src\\pages\\(customer)\\layout.tsx";"use client";

import React, { useEffect, useState } from "react";

import { useAuthStore } from "@/store/authStore";
import { Home, Scan, History, User, LogOut, Loader2, Bell, Award } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

import { cn } from "@/lib/utils";
import { subscribeUserToPush } from "@/lib/pushSubscription";

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
  const [notifiedIds, setNotifiedIds] = useState(new Set());

  // Helper to trigger standard browser/mobile notification bar alert
  const triggerMobileNotification = (title, body) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "granted") {
      try {
        new Notification(title, {
          body,
          icon: "/new.png",
          vibrate: [200, 100, 200],
        });
      } catch (e) {
        // Fallback for mobile Chrome/Android where a Service Worker registration is required to show notification
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(title, {
              body,
              icon: "/new.png",
              vibrate: [200, 100, 200],
            });
          }).catch(err => console.error("SW notification error:", err));
        }
      }
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      const fetched = res.data || [];
      
      // Update local unread notifications matching native system bar
      if (notifiedIds.size === 0) {
        const initialIds = new Set(fetched.map(n => n.id));
        setNotifiedIds(initialIds);
      } else {
        const newUnread = fetched.filter(n => !n.isRead && !notifiedIds.has(n.id));
        if (newUnread.length > 0) {
          const updatedIds = new Set(notifiedIds);
          newUnread.forEach(n => {
            updatedIds.add(n.id);
            triggerMobileNotification("ScanLoyal Notification", n.message);
          });
          setNotifiedIds(updatedIds);
        }
      }

      setNotifications(fetched);
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

      // Auto subscribe user to Web Push notifications (VAPID)
      subscribeUserToPush();

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
    { label: "History", icon: History, href: "/history" },
    { label: "Points", icon: Award, href: "/loyalty-history" },
    { label: "Profile", icon: User, href: "/profile" },
  ];

  return (
    React.createElement('div', { className: "min-h-screen bg-[#f8fafc] bg-dots safe-top safe-bottom text-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 55}}
      , React.createElement('div', { className: "mx-auto min-h-screen max-w-md bg-white border-x border-border shadow-sm relative flex flex-col pb-28"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 56}}

        /* Header Bar */
        , React.createElement('header', { className: "sticky top-0 z-30 flex items-center justify-between border-b border-border bg-white/80 p-4 backdrop-blur-md"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 59}}
          , React.createElement('div', { className: "flex items-center space-x-2" }
            , React.createElement('img', { src: "/new.png", alt: "LogiSaar Logo", className: "h-6 w-auto object-contain" })
            , React.createElement('div', { className: "flex flex-col justify-center" }
              , React.createElement('span', { className: "text-xs font-extrabold tracking-tight text-foreground leading-tight" }, "LogiSaar")
              , React.createElement('span', { className: "text-[8px] font-black text-[#FF6A00] uppercase tracking-wider leading-none" }, "ScanLoyal")
            )
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

        /* Floating Scan QR Button - Right side, upper the navbar */
        , React.createElement('div', { className: "fixed bottom-24 left-4 right-4 z-40 mx-auto max-w-sm flex justify-end pointer-events-none pr-6" }
          , React.createElement(Link, {
              to: "/checkin",
              className: cn(
                "pointer-events-auto h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 shadow-[0_8px_32px_0_rgba(255,106,0,0.25)] border border-primary/35 backdrop-blur-md ring-4 ring-primary/20",
                pathname === "/checkin"
                  ? "bg-primary/85 text-white scale-105"
                  : "bg-white/65 text-primary hover:bg-white/80 hover:scale-110"
              )
            }
            , React.createElement(Scan, { className: "h-5 w-5" })
          )
        )

        /* Bottom PWA Navbar - Floating Pill Design */
        , React.createElement('nav', { className: "fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-sm border border-[#FF6A00]/25 bg-white/70 py-2.5 px-4 backdrop-blur-xl flex justify-between items-center shadow-[0_8px_32px_0_rgba(255,106,0,0.15)] rounded-full transition-all duration-300 hover:shadow-[0_12px_40px_0_rgba(255,106,0,0.25)]" }
          , navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              React.createElement(Link, {
                key: item.href,
                to: item.href,
                className: cn(
                  "flex flex-col items-center space-y-1 transition-all duration-300 py-1.5 px-3 rounded-full min-w-[62px] transform active:scale-95",
                  isActive 
                    ? "bg-gradient-to-r from-[#FF6A00] to-[#FF8E3C] text-white font-bold shadow-lg shadow-[#FF6A00]/25 scale-105 -translate-y-1" 
                    : "text-[#5A4E46] hover:text-[#FF6A00] hover:bg-white/40 hover:scale-105"
                )
              }
                , React.createElement(Icon, { className: "h-4 w-4" })
                , React.createElement('span', { className: "text-[9px] font-bold" }, item.label)
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

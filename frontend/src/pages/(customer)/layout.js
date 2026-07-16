import { useNavigate, useLocation, Outlet, Link } from "react-router-dom";
const _jsxFileName = "src\\pages\\(customer)\\layout.tsx";"use client";

import React, { useEffect, useState } from "react";

import { useAuthStore } from "@/store/authStore";
import { Home, Scan, History, User, LogOut, Loader2, Bell, Award, Star } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api, getImageUrl } from "@/lib/api";
import { formatDate } from "@/lib/utils";

import { cn } from "@/lib/utils";
import { subscribeUserToPush } from "@/lib/pushSubscription";
import Loader from "@/components/Loader";

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
        , React.createElement(Loader)
      )
    );
  }

  const navItems = [
    { label: "Home", icon: Home, href: "/dashboard" },
    { label: "History", icon: History, href: "/history" },
    { label: "Scan", icon: Scan, href: "/checkin", isCenter: true },
    { label: "Points", icon: Star, href: "/loyalty-history" },
    { label: "Profile", icon: User, href: "/profile" },
  ];

  const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "SL";

  const getActiveColor = (href) => {
    if (href === "/dashboard" || href === "/profile") return "text-[#16A34A]";
    return "text-[#F97316]";
  };

  const getSubtext = () => {
    if (pathname === "/history") return "Loyalty that rewards you";
    if (pathname === "/profile") return "Scan • Collect • Earn";
    return "Scan • Earn • Redeem";
  };

  return (
    React.createElement('div', { className: "min-h-screen bg-[#f8fafc] bg-dots safe-top safe-bottom text-foreground" }
      , React.createElement('div', { className: "mx-auto min-h-screen max-w-md bg-white border-x border-border shadow-sm relative flex flex-col pb-28" }

        /* Header Bar */
        , React.createElement('header', { className: "sticky top-0 z-30 flex items-center justify-between border-b border-border bg-white/80 p-4 backdrop-blur-md" }
          , React.createElement('div', { className: "flex items-center space-x-2.5" }
            , React.createElement('img', { src: "/new.png", alt: "Logo", className: "w-10 h-10 object-contain shrink-0" })
            , React.createElement('div', { className: "flex flex-col justify-center" }
              , React.createElement('div', { className: "flex items-baseline font-bold leading-none" }
                , React.createElement('span', { className: "text-[#0F172A] text-sm font-black" }, "Scan")
                , React.createElement('span', { className: "text-[#F97316] text-sm font-black" }, "Loyal")
              )
              , React.createElement('span', { className: "text-[8px] font-medium text-slate-500 tracking-wider mt-0.5" }, getSubtext())
            )
          )
          , React.createElement('div', { className: "flex items-center space-x-3" }
            , React.createElement('button', {
                onClick: () => {
                  setShowNotifications(true);
                  fetchNotifications();
                },
                className: "relative w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-[#0F172A] hover:bg-slate-100 transition-colors"
              }
              , React.createElement(Bell, { className: "h-4.5 w-4.5" })
              , unreadCount > 0 && React.createElement('span', {
                  className: "absolute -top-1 -right-1 bg-[#F97316] text-white text-[8px] font-black flex items-center justify-center border border-white shadow-sm",
                  style: { borderRadius: "50%", width: "16px", height: "16px", minWidth: "16px", minHeight: "16px", padding: 0 }
                }, unreadCount)
            )
             , React.createElement(Link, {
                to: "/profile",
                className: "w-9 h-9 rounded-full bg-[#FFEDD5] border border-[#FED7AA] flex items-center justify-center text-[#F97316] text-xs font-black shadow-sm transition-transform active:scale-95 overflow-hidden shrink-0",
                style: { borderRadius: "50%", width: "36px", height: "36px", minWidth: "36px", minHeight: "36px", padding: 0 }
              }
              , user?.avatarUrl ? (
                  React.createElement('img', { src: getImageUrl(user.avatarUrl), alt: user.name, className: "w-full h-full object-cover rounded-full" })
                ) : (
                  initials
                )
            )
          )
        )

        /* Core Content */
        , React.createElement('main', { className: "flex-1 p-4 overflow-y-auto" }
          , React.createElement(Outlet, null)
        )

        /* Bottom PWA Navbar - Floating Pill Design with Raised Scan button */
        , React.createElement('nav', { className: "fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-sm border border-[#DCFCE7] bg-[#F0FDF4]/90 py-2 px-3 backdrop-blur-xl flex justify-between items-center shadow-[0_8px_32px_0_rgba(22,163,74,0.08)] rounded-full transition-all duration-300 hover:shadow-[0_12px_40px_0_rgba(22,163,74,0.15)]" }
          , navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              if (item.isCenter) {
                return React.createElement(Link, {
                  key: item.href,
                  to: item.href,
                  className: "relative -translate-y-4 flex flex-col items-center z-50 shrink-0"
                }
                  , React.createElement('div', {
                      className: "w-12 h-12 rounded-full bg-[#F97316] hover:bg-[#EA580C] text-white flex items-center justify-center shadow-[0_8px_24px_0_rgba(249,115,22,0.35)] border-4 border-white transition-all transform active:scale-95"
                    }
                    , React.createElement(Scan, { className: "h-5 w-5 text-white" })
                  )
                  , React.createElement('span', { className: "text-[9px] font-bold text-slate-500 mt-0.5" }, item.label)
                );
              }

              return (
                React.createElement(Link, {
                  key: item.href,
                  to: item.href,
                  className: cn(
                    "flex flex-col items-center space-y-0.5 transition-all duration-300 py-1.5 rounded-xl min-w-[50px] transform active:scale-95",
                    isActive 
                      ? `${getActiveColor(item.href)} font-extrabold scale-105` 
                      : "text-[#64748B] hover:text-[#16A34A]"
                  )
                }
                  , React.createElement(Icon, { className: cn("h-4.5 w-4.5", isActive ? getActiveColor(item.href) : "text-[#64748B]") })
                  , React.createElement('span', { className: "text-[9px]" }, item.label)
                )
              );
            })
        )
        /* Notifications Modal Dialog */
        , showNotifications && (
            React.createElement(Dialog, { open: showNotifications, onOpenChange: (open) => !open && setShowNotifications(false) }
              , React.createElement(DialogContent, { className: "max-w-[360px] bg-white border border-border" }
                , React.createElement(DialogHeader, { className: "flex flex-row justify-between items-center pb-2 border-b border-border/60 pr-8" }
                  , React.createElement('div', null
                    , React.createElement(DialogTitle, { className: "text-base font-bold text-foreground" }, "Notifications")
                    , React.createElement(DialogDescription, { className: "text-[10px] text-muted-foreground mt-0.5" }, "Alerts and updates from the platform")
                  )
                  , notifications.length > 0 && (
                      React.createElement(Button, {
                        size: "sm",
                        variant: "ghost",
                        className: cn(
                          "text-[10px] h-7 font-bold px-2 transition-all",
                          unreadCount > 0
                            ? "text-[#F97316] hover:text-[#EA580C] hover:bg-orange-50 active:scale-95"
                            : "text-muted-foreground opacity-50 cursor-not-allowed"
                        ),
                        onClick: unreadCount > 0 ? handleMarkAllRead : undefined,
                        disabled: unreadCount === 0
                      }, "Mark all read")
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
                          , notif.business?.name && React.createElement('div', { className: "text-[10px] text-primary font-bold mb-1" }, notif.business.name)
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

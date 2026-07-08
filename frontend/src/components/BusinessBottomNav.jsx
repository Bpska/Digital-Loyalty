import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, ClipboardCheck, Percent, BarChart2, User, QrCode, Home, Ticket, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BusinessBottomNav({ variant = "flat", pendingCount = 0 }) {
  const location = useLocation();
  const currentPath = location.pathname;

  if (variant === "withScan") {
    // 5-items nav with raised center Scan button
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <div className="bg-white/95 backdrop-blur-xl border-t border-[#F1F5F9] shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
          <div className="flex justify-around items-end px-2 pt-2 pb-safe pb-2">
            <Link to="/dashboard/business" className="flex flex-col items-center gap-1 py-1 px-3 min-w-[56px]">
              <div className={cn(
                "flex items-center justify-center w-12 h-7 rounded-full transition-colors",
                currentPath === "/dashboard/business" ? "bg-[#FFF0E6]" : "bg-transparent"
              )}>
                <LayoutGrid className={cn("h-5 w-5", currentPath === "/dashboard/business" ? "text-[#F97316]" : "text-[#94A3B8]")} />
              </div>
              <span className={cn("text-[10px] font-semibold", currentPath === "/dashboard/business" ? "text-[#F97316]" : "text-[#94A3B8]")}>Dashboard</span>
            </Link>

            <Link to="/dashboard/business/approvals" className="flex flex-col items-center gap-1 py-1 px-3 min-w-[56px] relative">
              <div className={cn(
                "flex items-center justify-center w-12 h-7 rounded-full transition-colors",
                currentPath === "/dashboard/business/approvals" ? "bg-[#FFF0E6]" : "bg-transparent"
              )}>
                <ClipboardCheck className={cn("h-5 w-5", currentPath === "/dashboard/business/approvals" ? "text-[#F97316]" : "text-[#94A3B8]")} />
                {pendingCount > 0 && (
                  <span className="absolute top-0 right-1 bg-[#F97316] text-white text-[8px] font-black h-3.5 min-w-[14px] flex items-center justify-center px-1 rounded-full shadow-sm">
                    {pendingCount}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] font-semibold", currentPath === "/dashboard/business/approvals" ? "text-[#F97316]" : "text-[#94A3B8]")}>Approvals</span>
            </Link>

            <div className="flex flex-col items-center -mt-5">
              <Link to="/dashboard/business/branches" className="w-14 h-14 rounded-full bg-[#F97316] flex items-center justify-center shadow-lg shadow-[#F97316]/40 active:scale-95 transition-transform border-4 border-white">
                <QrCode className="h-6 w-6 text-white" />
              </Link>
              <span className="text-[10px] font-semibold text-[#94A3B8] mt-1">Scan</span>
            </div>

            <Link to="/dashboard/business/coupons" className="flex flex-col items-center gap-1 py-1 px-3 min-w-[56px]">
              <div className={cn(
                "flex items-center justify-center w-12 h-7 rounded-full transition-colors",
                currentPath === "/dashboard/business/coupons" ? "bg-[#FFF0E6]" : "bg-transparent"
              )}>
                <Ticket className={cn("h-5 w-5", currentPath === "/dashboard/business/coupons" ? "text-[#F97316]" : "text-[#94A3B8]")} />
              </div>
              <span className={cn("text-[10px] font-semibold", currentPath === "/dashboard/business/coupons" ? "text-[#F97316]" : "text-[#94A3B8]")}>Coupons</span>
            </Link>

            <Link to="/dashboard/business/profile" className="flex flex-col items-center gap-1 py-1 px-3 min-w-[56px]">
              <div className={cn(
                "flex items-center justify-center w-12 h-7 rounded-full transition-colors",
                currentPath === "/dashboard/business/profile" ? "bg-[#FFF0E6]" : "bg-transparent"
              )}>
                <User className={cn("h-5 w-5", currentPath === "/dashboard/business/profile" ? "text-[#F97316]" : "text-[#94A3B8]")} />
              </div>
              <span className={cn("text-[10px] font-semibold", currentPath === "/dashboard/business/profile" ? "text-[#F97316]" : "text-[#94A3B8]")}>Profile</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // flat layout variant (5 equal height items, active item gets layout/label highlight pill-shaped background)
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#F1F5F9] shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
      <div className="flex justify-around items-center h-16 px-2 pb-safe">
        {[
          { to: "/dashboard/business", label: "Dashboard", icon: LayoutGrid },
          { to: "/dashboard/business/approvals", label: "Approvals", icon: ClipboardCheck, badge: pendingCount },
          { to: "/dashboard/business/coupons", label: "Coupons", icon: Percent },
          { to: "/dashboard/business/analytics", label: "Analytics", icon: BarChart2 },
          { to: "/dashboard/business/profile", label: "Profile", icon: User }
        ].map((item) => {
          const isActive = currentPath === item.to;
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center justify-center gap-1.5 py-2 px-3 rounded-full transition-all relative",
                isActive ? "bg-[#FFF0E6] text-[#F97316]" : "text-[#94A3B8] hover:text-[#64748B]"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-[#F97316]" : "text-[#94A3B8]")} />
              {isActive && (
                <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
              )}
              {item.badge ? (
                <span className={cn(
                  "absolute top-1 right-2 text-white text-[8px] font-black h-3.5 min-w-[14px] flex items-center justify-center px-1 rounded-full shadow-sm",
                  isActive ? "bg-[#F97316]" : "bg-[#94A3B8]"
                )}>
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

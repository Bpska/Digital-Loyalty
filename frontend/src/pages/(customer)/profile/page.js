const _jsxFileName = "src\\pages\\(customer)\\profile\\page.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }"use client";

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getImageUrl } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Loader2, Phone, Mail, AlertTriangle, ShieldAlert, ChevronLeft, Sun, Moon, Monitor,
  Camera, ShieldCheck, Calendar, BarChart2, ChevronRight, Crown, Settings, Paintbrush,
  Headphones, FileText, Info, Power, User
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { logout, checkSession } = useAuthStore();
  const queryClient = useQueryClient();
  const fileInputRef = React.useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [editingField, setEditingField] = useState(null); // "name" | "email" | "phone" | null

  const [submitLoading, setSubmitLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDanger, setShowDanger] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // "support" | "privacy" | "terms" | "about" | null

  const [deleteConfirmPhone, setDeleteConfirmPhone] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    localStorage.setItem("theme", theme);
    window.dispatchEvent(new Event("theme-changed"));
  }, [theme]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size must be less than 2MB." });
      return;
    }

    setAvatarUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      await api.post("/customer/profile/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage({ type: "success", text: "Profile picture updated successfully!" });
      refetch();
      checkSession();
      queryClient.invalidateQueries({ queryKey: ["customerProfile"] });
    } catch (err) {
      console.error("Avatar upload failed:", err);
      const errMsg = err.response?.data?.message || err.message || "Failed to upload avatar.";
      setMessage({ type: "error", text: errMsg });
    } finally {
      setAvatarUploading(false);
    }
  };

  // Fetch customer profile
  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ["customerProfile"],
    queryFn: () => api.get("/customer/profile").then((res) => res.data),
  });

  // Fetch checkin history for total count
  const { data: checkinsData } = useQuery({
    queryKey: ["checkinHistory"],
    queryFn: () => api.get("/checkins/history").then((res) => res.data),
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  if (isLoading) {
    return (
      React.createElement('div', { className: "space-y-4 animate-pulse p-4" }
        , React.createElement('div', { className: "h-28 w-full rounded-3xl bg-slate-200" })
        , React.createElement('div', { className: "h-14 w-full rounded-2xl bg-slate-200" })
        , React.createElement('div', { className: "h-40 w-full rounded-3xl bg-slate-200" })
      )
    );
  }

  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();
    setSubmitLoading(true);
    setMessage(null);

    try {
      const response = await api.patch("/customer/profile", { name, email });
      if (response.success) {
        setMessage({ type: "success", text: "Profile details updated successfully!" });
        setIsEditing(false);
        setEditingField(null);
        refetch();
        checkSession(); // sync state
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Something went wrong" });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const expected = _optionalChain([profile, 'optionalAccess', _ => _.phone, 'access', _2 => _2.replace, 'call', _3 => _3("+91", ""), 'access', _4 => _4.trim, 'call', _5 => _5()]);
    if (deleteConfirmPhone !== expected && deleteConfirmPhone !== profile?.phone) {
      setMessage({ type: "error", text: "Phone number verification mismatch" });
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await api.delete("/customer/account");
      if (response.success) {
        setShowDeleteModal(false);
        logout();
      } else {
        throw new Error(response.message || "Failed to delete account");
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Deletion failed" });
      setDeleteLoading(false);
    }
  };

  const initials = profile?.name ? profile.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "SL";
  const memberSince = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : "5 Jul 2026";
  const totalVisits = checkinsData?.length ?? 0;

  return (
    React.createElement('div', { className: "space-y-6" }

      /* Message alert banners */
      , message && React.createElement('div', { className: cn("rounded-2xl p-3.5 text-xs text-center border font-bold"
          , message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"
        ) }
          , message.text
        )

      /* B. Profile summary hero card */
      , React.createElement('div', { className: "bg-gradient-to-br from-[#FFEDD5]/50 to-[#F97316]/10 rounded-3xl p-5 border border-[#FED7AA] relative overflow-hidden flex items-center justify-between shadow-sm" }
        /* Waves decorative overlay */
        , React.createElement('div', { className: "absolute inset-0 opacity-5 pointer-events-none" }
          , React.createElement('svg', { className: "w-full h-full", viewBox: "0 0 100 100", preserveAspectRatio: "none" }
            , React.createElement('path', { d: "M 0 50 Q 25 35 50 50 T 100 50 L 100 100 L 0 100 Z", fill: "#F97316" })
          )
        )

        , React.createElement('div', { className: "flex items-center gap-4 z-10 w-full" }
          /* Avatar with upload trigger */
          , React.createElement('div', { className: "relative shrink-0" }
            , React.createElement('div', { className: "w-20 h-20 rounded-full bg-[#FFEDD5] border-2 border-[#FDBA74] flex items-center justify-center text-[#F97316] text-2xl font-black shadow-sm overflow-hidden" }
              , avatarUploading ? (
                  React.createElement(Loader2, { className: "h-6 w-6 animate-spin text-[#F97316]" })
                ) : profile?.avatarUrl ? (
                  React.createElement('img', { src: getImageUrl(profile.avatarUrl), alt: profile.name || "Avatar", className: "w-full h-full object-cover" })
                ) : (
                  initials
                )
            )
            , React.createElement('button', {
                onClick: () => fileInputRef.current?.click(),
                className: "absolute bottom-0 right-0 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md",
                style: { borderRadius: "50%", backgroundColor: "#0F172A", width: "24px", height: "24px", minWidth: "24px", minHeight: "24px", padding: 0, border: "2px solid white" }
              }
              , React.createElement(Camera, { className: "h-3.5 w-3.5" })
            )
            , React.createElement('input', {
                type: "file",
                ref: fileInputRef,
                accept: "image/*",
                onChange: handleAvatarChange,
                style: { display: "none" }
              })
          )

          /* Name & details */
          , React.createElement('div', { className: "flex-1 min-w-0 space-y-1.5" }
            , React.createElement('div', { className: "flex items-center gap-2 flex-wrap" }
              , React.createElement('h3', { className: "font-black text-base text-[#0F172A] truncate" }, profile?.name || "Bipin")
              , React.createElement('span', { className: "text-[9px] bg-[#FFEDD5] text-[#F97316] font-extrabold px-2 py-0.5 rounded-full" }, "Member")
            )
            , React.createElement('div', { className: "flex items-center gap-1 text-xs font-bold text-[#F97316]" }
              , "Loyalty Member"
              , React.createElement(ShieldCheck, { className: "h-3.5 w-3.5 text-[#F97316]" })
            )

            /* Meta row divider */
            , React.createElement('div', { className: "flex items-center gap-3 pt-1 text-[10px] text-[#64748B] border-t border-slate-200/60" }
              , React.createElement('div', { className: "flex items-center gap-1" }
                , React.createElement(Calendar, { className: "h-3.5 w-3.5 text-[#F97316]" })
                , React.createElement('span', null, memberSince)
              )
              , React.createElement('div', { className: "h-3 w-px bg-slate-200" })
              , React.createElement('div', { className: "flex items-center gap-1" }
                , React.createElement(BarChart2, { className: "h-3.5 w-3.5 text-[#F97316]" })
                , React.createElement('span', { className: "font-bold text-[#0f172a]" }, `${totalVisits} Visits`)
              )
            )
          )

          /* Expand Profile Button */
          , React.createElement('button', {
              onClick: () => { setIsEditing(true); setEditingField("name"); },
              className: "w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#64748B] hover:text-[#0F172A] shadow-sm shrink-0 border border-slate-100 transition-transform active:scale-95"
            }
            , React.createElement(ChevronRight, { className: "h-4 w-4" })
          )
        )
      )

      /* C. Dark-to-orange promo banner */
      , React.createElement('div', { className: "bg-gradient-to-br from-[#0F172A] to-[#F97316] rounded-3xl p-5 text-white shadow-sm flex items-center justify-between gap-4" }
        , React.createElement('div', { className: "flex items-center gap-3" }
          , React.createElement('div', { className: "w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center shrink-0" }
            , React.createElement(Crown, { className: "h-5 w-5 text-white" })
          )
          , React.createElement('div', null
            , React.createElement('h4', { className: "font-black text-sm text-white" }, "You are doing great!")
            , React.createElement('p', { className: "text-[10px] text-white/90" }, "Keep scanning and unlock amazing rewards.")
          )
        )
        , React.createElement(Link, { to: "/loyalty-history", className: "bg-white text-[#F97316] font-bold text-[10px] px-3.5 py-2 rounded-full whitespace-nowrap active:scale-95 transition-transform flex items-center justify-center" }, "View Rewards")
      )

      /* D. Account Details section */
      , React.createElement('div', { className: "space-y-3" }
        , React.createElement('div', { className: "flex items-center gap-2 text-xs font-black text-[#0F172A] uppercase tracking-wider pl-1" }
          , React.createElement(User, { className: "h-4 w-4 text-[#F97316]" })
          , React.createElement('span', null, "Account Details")
        )
        , React.createElement('div', { className: "bg-white rounded-3xl border border-slate-100 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4" }
          /* Phone Row */
          , React.createElement('div', { className: "flex items-center justify-between gap-3" }
            , React.createElement('div', { className: "flex items-center gap-3 min-w-0" }
              , React.createElement('div', { className: "w-9 h-9 rounded-xl bg-[#FFF1E6] text-[#F97316] flex items-center justify-center shrink-0" }
                , React.createElement(Phone, { className: "h-4 w-4" })
              )
              , React.createElement('div', { className: "min-w-0" }
                , React.createElement('span', { className: "block text-[10px] text-[#64748B] font-semibold" }, "Phone Number")
                , React.createElement('span', { className: "text-xs font-bold text-[#0F172A] truncate block" }, profile?.phone || "+91 80186 40398")
              )
            )
          )
          , React.createElement('div', { className: "h-px bg-slate-100" })
          /* Email Row */
          , React.createElement('div', { className: "flex items-center justify-between gap-3" }
            , React.createElement('div', { className: "flex items-center gap-3 min-w-0" }
              , React.createElement('div', { className: "w-9 h-9 rounded-xl bg-[#FFF1E6] text-[#F97316] flex items-center justify-center shrink-0" }
                , React.createElement(Mail, { className: "h-4 w-4" })
              )
              , React.createElement('div', { className: "min-w-0" }
                , React.createElement('span', { className: "block text-[10px] text-[#64748B] font-semibold" }, "Email Address")
                , React.createElement('span', { className: "text-xs font-bold text-[#0F172A] truncate block" }, profile?.email || "bpskar2@gmail.com")
              )
            )
          )
        )
      )

      /* E. Preferences section */
      , React.createElement('div', { className: "space-y-3" }
        , React.createElement('div', { className: "flex items-center gap-2 text-xs font-black text-[#0F172A] uppercase tracking-wider pl-1" }
          , React.createElement(Settings, { className: "h-4 w-4 text-purple-600" })
          , React.createElement('span', null, "Preferences")
        )
        , React.createElement('div', { className: "bg-white rounded-3xl border border-slate-100 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4.5" }
          , React.createElement('div', { className: "flex items-start gap-3" }
            , React.createElement('div', { className: "w-9 h-9 rounded-xl bg-[#EDE9FE] text-purple-600 flex items-center justify-center shrink-0" }
              , React.createElement(Paintbrush, { className: "h-4.5 w-4.5" })
            )
            , React.createElement('div', null
              , React.createElement('h4', { className: "font-black text-sm text-[#0F172A]" }, "Appearance")
              , React.createElement('p', { className: "text-[10px] text-[#64748B]" }, "Choose how you want the app to look")
            )
          )

          /* 3-segment toggle row */
          , React.createElement('div', { className: "flex gap-1.5 bg-slate-100 rounded-xl p-1" }
            , [
                { id: "light", icon: Sun, label: "Light" },
                { id: "dark", icon: Moon, label: "Dark" }
              ].map((item) => {
                const active = theme === item.id;
                const ItemIcon = item.icon;
                return React.createElement('button', {
                  key: item.id,
                  type: "button",
                  onClick: () => setTheme(item.id),
                  className: cn("flex-1 py-2 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
                    , active ? "bg-white text-purple-600 shadow-sm border border-purple-100" : "text-[#64748B] hover:text-[#0F172A]"
                  )
                }
                  , React.createElement(ItemIcon, { className: "h-3.5 w-3.5" })
                  , item.label
                );
              })
          )
        )
      )

      /* F. Info/link grid (2x2 cards) */
      , React.createElement('div', { className: "grid grid-cols-2 gap-3" }
        , [
            { icon: Headphones, title: "Help & Support", desc: "Get help and support", color: "bg-[#DCFCE7] text-emerald-600", key: "support" },
            { icon: ShieldAlert, title: "Privacy & Security", desc: "Manage your privacy", color: "bg-[#EDE9FE] text-purple-600", key: "privacy" },
            { icon: FileText, title: "Terms & Conditions", desc: "Read our terms", color: "bg-[#FEF3C7] text-amber-500", key: "terms" },
            { icon: Info, title: "About ScanLoyal", desc: "App information", color: "bg-[#CCFBF1] text-teal-600", key: "about" }
          ].map((card, i) => {
            const CardIcon = card.icon;
            return React.createElement('div', { key: i, onClick: () => setActiveModal(card.key), className: "bg-white border border-slate-100 p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:scale-[1.01] transition-transform flex flex-col justify-between h-28 relative cursor-pointer" }
              , React.createElement('div', { className: "flex justify-between items-start" }
                , React.createElement('div', { className: cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", card.color) }
                  , React.createElement(CardIcon, { className: "h-4.5 w-4.5" })
                )
                , React.createElement(ChevronRight, { className: "h-4 w-4 text-slate-300" })
              )
              , React.createElement('div', null
                , React.createElement('h5', { className: "font-black text-xs text-[#0F172A] leading-tight" }, card.title)
                , React.createElement('p', { className: "text-[9px] text-[#64748B] mt-0.5" }, card.desc)
              )
            );
          })
      )

      /* G. Logout row */
      , React.createElement('button', {
          onClick: () => setShowLogoutConfirm(true),
          className: "w-full bg-[#FEE2E2]/60 hover:bg-[#FEE2E2] rounded-3xl p-4 flex items-center justify-between border border-transparent transition-colors text-left"
        }
        , React.createElement('div', { className: "flex items-center gap-3" }
          , React.createElement('div', { className: "w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0" }
            , React.createElement(Power, { className: "h-4.5 w-4.5" })
          )
          , React.createElement('div', null
            , React.createElement('h4', { className: "font-black text-xs text-red-600" }, "Logout")
            , React.createElement('p', { className: "text-[9px] text-[#64748B]" }, "Sign out from your account")
          )
        )
        , React.createElement(ChevronRight, { className: "h-4 w-4 text-red-400" })
      )

      /* Danger Zone — subtle, collapsed by default */
      , React.createElement('div', { className: "mt-2" },
        React.createElement('button', {
            type: "button",
            onClick: () => setShowDanger(prev => !prev),
            className: "w-full flex items-center justify-between text-left px-3 py-2.5 rounded-xl border border-red-100 bg-red-50/40 hover:bg-red-50/80 transition-colors group"
          },
          React.createElement('span', { className: "flex items-center gap-2 text-[10px] font-bold text-red-400 group-hover:text-red-600 transition-colors" },
            React.createElement(ShieldAlert, { className: "h-3.5 w-3.5 shrink-0" }),
            "Danger Zone"
          ),
          React.createElement('svg', {
              viewBox: "0 0 20 20", fill: "currentColor",
              className: `h-3.5 w-3.5 text-red-300 transition-transform duration-300 ${showDanger ? "rotate-180" : "rotate-0"}`
            },
            React.createElement('path', { fillRule: "evenodd", d: "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z", clipRule: "evenodd" })
          )
        ),

        showDanger && React.createElement('div', { className: "mt-2 border border-red-200/70 bg-red-50/30 rounded-xl p-4 space-y-3" },
          React.createElement('div', { className: "flex items-start gap-2" },
            React.createElement(AlertTriangle, { className: "h-4 w-4 text-red-500 shrink-0 mt-0.5" }),
            React.createElement('p', { className: "text-[10px] text-red-700/80 leading-relaxed" },
              "Deleting your account will erase all your active loyalty cards, visit history, and unredeemed vouchers. ",
              React.createElement('strong', null, "This action cannot be undone.")
            )
          ),
          React.createElement(Button, {
              variant: "outline",
              className: "w-full h-9 text-[10px] font-bold border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 hover:text-red-700 rounded-xl transition-all",
              onClick: () => setShowDeleteModal(true)
            },
            React.createElement(ShieldAlert, { className: "h-3.5 w-3.5 mr-1.5" }),
            "Request Account Deletion"
          )
        )
      )

      /* Edit Modal Dialog */
      , isEditing && React.createElement(
          Dialog, { open: isEditing, onOpenChange: setIsEditing },
          React.createElement(DialogContent, { className: "max-w-[340px] bg-white border border-border p-5 rounded-3xl" },
            React.createElement(DialogHeader, {},
              React.createElement(DialogTitle, { className: "text-sm font-black text-[#0F172A]" }, "Edit Profile"),
              React.createElement(DialogDescription, { className: "text-[10px]" }, "Modify your personal account details.")
            ),
            React.createElement('form', { onSubmit: handleUpdateProfile, className: "space-y-4 py-2" }
              , React.createElement('div', { className: "space-y-1.5" }
                , React.createElement(Label, { htmlFor: "edit-name", className: "text-xs font-bold text-[#64748B]" }, "Full Name")
                , React.createElement(Input, {
                    id: "edit-name",
                    value: name,
                    onChange: (e) => setName(e.target.value),
                    required: true,
                    className: "h-10 text-xs bg-slate-50 border-slate-100 rounded-xl"
                  })
              )
              , React.createElement('div', { className: "space-y-1.5" }
                , React.createElement(Label, { htmlFor: "edit-email", className: "text-xs font-bold text-[#64748B]" }, "Email Address")
                , React.createElement(Input, {
                    id: "edit-email",
                    type: "email",
                    value: email,
                    onChange: (e) => setEmail(e.target.value),
                    className: "h-10 text-xs bg-slate-50 border-slate-100 rounded-xl"
                  })
              )
              , React.createElement(DialogFooter, { className: "flex gap-2 pt-2" }
                , React.createElement(Button, { type: "button", variant: "outline", onClick: () => setIsEditing(false), className: "flex-1 rounded-xl text-xs" }, "Cancel")
                , React.createElement(Button, { type: "submit", className: "flex-1 bg-[#F97316] text-white font-bold rounded-xl text-xs", disabled: submitLoading }
                  , submitLoading ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin" }) : "Save"
                )
              )
            )
          )
        )

      /* Logout Confirmation Dialog */
      , showLogoutConfirm && React.createElement(
          Dialog, { open: showLogoutConfirm, onOpenChange: setShowLogoutConfirm },
          React.createElement(DialogContent, { className: "max-w-[340px] bg-white border border-border p-5 rounded-3xl text-center" },
            React.createElement(DialogHeader, { className: "flex flex-col items-center" }
              , React.createElement('div', { className: "w-11 h-11 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-2" }
                , React.createElement(Power, { className: "h-5 w-5" })
              )
              , React.createElement(DialogTitle, { className: "text-base font-black text-[#0F172A]" }, "Confirm Logout")
              , React.createElement(DialogDescription, { className: "text-[10px]" }, "Are you sure you want to sign out from your account?")
            )
            , React.createElement(DialogFooter, { className: "flex gap-2 pt-4" }
              , React.createElement(Button, { type: "button", variant: "outline", onClick: () => setShowLogoutConfirm(false), className: "flex-1 rounded-xl text-xs" }, "Cancel")
              , React.createElement(Button, {
                  type: "button",
                  onClick: () => { setShowLogoutConfirm(false); logout(); },
                  className: "flex-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs"
                }, "Logout")
            )
          )
        )

      /* Deletion Confirmation Dialog */
      , showDeleteModal && (
          React.createElement(Dialog, { open: showDeleteModal, onOpenChange: setShowDeleteModal }
            , React.createElement(DialogContent, { className: "max-w-[340px] bg-white border border-border p-5 rounded-3xl" }
              , React.createElement(DialogHeader, { className: "text-center" }
                , React.createElement(DialogTitle, { className: "text-base font-black text-foreground flex items-center justify-center gap-2" }
                  , React.createElement(AlertTriangle, { className: "h-5 w-5 text-red-600" }), "Are you sure?"
                )
                , React.createElement(DialogDescription, { className: "text-[10px] mt-1 text-muted-foreground" }, "This will delete your customer account and revoke all unlocked vouchers.")
              )
              , React.createElement('div', { className: "space-y-3 py-3" }
                , React.createElement(Label, { htmlFor: "confirmPhone", className: "text-[10px] text-foreground font-bold" }
                  , `To confirm, enter your phone number (e.g. ${profile?.phone || "8018640398"}):`
                )
                , React.createElement(Input, {
                    id: "confirmPhone",
                    type: "tel",
                    placeholder: "Confirm phone number",
                    value: deleteConfirmPhone,
                    onChange: (e) => setDeleteConfirmPhone(e.target.value.replace(/\D/g, "")),
                    required: true,
                    className: "h-10 text-xs bg-slate-50 border-slate-100 rounded-xl"
                  })
              )
              , React.createElement(DialogFooter, { className: "flex gap-2" }
                , React.createElement(Button, { variant: "outline", className: "flex-1 rounded-xl text-xs", onClick: () => setShowDeleteModal(false) }, "Cancel")
                , React.createElement(Button, { variant: "destructive", className: "flex-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs", onClick: handleDeleteAccount, disabled: deleteLoading }
                  , deleteLoading ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin" }) : "Delete Forever"
                )
              )
            )
          )
        )

      /* Help & Support Dialog */
      , activeModal === "support" && React.createElement(
          Dialog, { open: activeModal === "support", onOpenChange: (open) => !open && setActiveModal(null) },
          React.createElement(DialogContent, { className: "max-w-[340px] bg-white border border-border p-5 rounded-3xl" },
            React.createElement(DialogHeader, {},
              React.createElement(DialogTitle, { className: "text-sm font-black text-[#0F172A] flex items-center gap-2" },
                React.createElement(Headphones, { className: "h-5 w-5 text-emerald-600" }),
                "Help & Support"
              ),
              React.createElement(DialogDescription, { className: "text-[10px]" }, "Need assistance? Get in touch with our team.")
            ),
            React.createElement("div", { className: "space-y-4 py-3 text-xs text-[#5A4E46]" },
              React.createElement("p", { className: "leading-relaxed" }, "We are here to support your experience. You can reach out to us directly through any of the following channels:"),
              React.createElement("div", { className: "space-y-2.5" },
                React.createElement("a", { href: "mailto:support@logisaar.in", className: "flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors" },
                  React.createElement(Mail, { className: "h-4.5 w-4.5 text-emerald-600" }),
                  React.createElement("div", null,
                    React.createElement("span", { className: "block font-bold text-slate-800" }, "Email Support"),
                    React.createElement("span", { className: "text-[10px] text-muted-foreground" }, "support@logisaar.in")
                  )
                ),
                React.createElement("a", { href: "https://wa.me/918018640398", target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors" },
                  React.createElement(Phone, { className: "h-4.5 w-4.5 text-emerald-600" }),
                  React.createElement("div", null,
                    React.createElement("span", { className: "block font-bold text-slate-800" }, "WhatsApp Chat"),
                    React.createElement("span", { className: "text-[10px] text-muted-foreground" }, "Instant chat support")
                  )
                )
              )
            ),
            React.createElement(DialogFooter, {},
              React.createElement(Button, { onClick: () => setActiveModal(null), className: "w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs" }, "Close")
            )
          )
        )

      /* Privacy & Security Dialog */
      , activeModal === "privacy" && React.createElement(
          Dialog, { open: activeModal === "privacy", onOpenChange: (open) => !open && setActiveModal(null) },
          React.createElement(DialogContent, { className: "max-w-[400px] bg-white border border-border p-5 rounded-3xl" },
            React.createElement(DialogHeader, {},
              React.createElement(DialogTitle, { className: "text-sm font-black text-[#0F172A] flex items-center gap-2" },
                React.createElement(ShieldCheck, { className: "h-5 w-5 text-purple-600" }),
                "Privacy & Security"
              ),
              React.createElement(DialogDescription, { className: "text-[10px]" }, "Google OAuth Verified Policy")
            ),
            React.createElement("div", { className: "max-h-[300px] overflow-y-auto space-y-4 py-3 text-[11px] text-[#5A4E46] leading-relaxed border-y border-slate-100 my-2 pr-1" },
              React.createElement("div", { className: "space-y-1.5" },
                React.createElement("span", { className: "font-black text-[#0F172A] block text-xs" }, "1. Data Collected"),
                React.createElement("p", null, "The ScanLoyal solution collects Name, Mobile Number, Email Address, Visit/Redemption history, and device parameters to operate campaign check-ins and rewards.")
              ),
              React.createElement("div", { className: "space-y-1.5" },
                React.createElement("span", { className: "font-black text-[#0F172A] block text-xs" }, "2. Purpose"),
                React.createElement("p", null, "Information is strictly utilized for loyalty program management, reward validation, analytics, and store scan fraud prevention.")
              ),
              React.createElement("div", { className: "space-y-1.5" },
                React.createElement("span", { className: "font-black text-[#0F172A] block text-xs" }, "3. Google Integration & Disclosures"),
                React.createElement("p", null, "ScanLoyal implements Google Sign-in to enable secure OAuth logins. We retrieve your name, email, and avatar picture. We do not sell or trade this info.")
              )
            ),
            React.createElement(DialogFooter, {},
              React.createElement(Button, { onClick: () => setActiveModal(null), className: "w-full bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs" }, "Close")
            )
          )
        )

      /* Terms & Conditions Dialog */
      , activeModal === "terms" && React.createElement(
          Dialog, { open: activeModal === "terms", onOpenChange: (open) => !open && setActiveModal(null) },
          React.createElement(DialogContent, { className: "max-w-[400px] bg-white border border-border p-5 rounded-3xl" },
            React.createElement(DialogHeader, {},
              React.createElement(DialogTitle, { className: "text-sm font-black text-[#0F172A] flex items-center gap-2" },
                React.createElement(FileText, { className: "h-5 w-5 text-amber-500" }),
                "Terms & Conditions"
              ),
              React.createElement(DialogDescription, { className: "text-[10px]" }, "Smart Loyalty Terms Addendum")
            ),
            React.createElement("div", { className: "max-h-[300px] overflow-y-auto space-y-4 py-3 text-[11px] text-[#5A4E46] leading-relaxed border-y border-slate-100 my-2 pr-1" },
              React.createElement("div", { className: "space-y-1.5" },
                React.createElement("span", { className: "font-black text-[#0F172A] block text-xs" }, "1. Merchant Terms"),
                React.createElement("p", null, "Merchants are solely responsible for setting reward parameters, point rules, configurations, and fulfilling all redemptions.")
              ),
              React.createElement("div", { className: "space-y-1.5" },
                React.createElement("span", { className: "font-black text-[#0F172A] block text-xs" }, "2. Non-Refundable Addendum"),
                React.createElement("p", null, "Given the digital SaaS nature of our configurations, setup costs, subscription tiers, and domain activation charges remain fully non-refundable.")
              ),
              React.createElement("div", { className: "space-y-1.5" },
                React.createElement("span", { className: "font-black text-[#0F172A] block text-xs" }, "3. Liability Disclaimer"),
                React.createElement("p", null, "Logisaar Technologies Private Limited does not guarantee, underwrite, or assume liability for promotional offers provided by merchants.")
              )
            ),
            React.createElement(DialogFooter, {},
              React.createElement(Button, { onClick: () => setActiveModal(null), className: "w-full bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs" }, "Close")
            )
          )
        )

      /* About ScanLoyal Dialog */
      , activeModal === "about" && React.createElement(
          Dialog, { open: activeModal === "about", onOpenChange: (open) => !open && setActiveModal(null) },
          React.createElement(DialogContent, { className: "max-w-[340px] bg-white border border-border p-5 rounded-3xl text-center" },
            React.createElement(DialogHeader, { className: "flex flex-col items-center" },
              React.createElement("img", { src: "/new.png", alt: "Logo", className: "h-14 w-auto object-contain mb-3" }),
              React.createElement(DialogTitle, { className: "text-lg font-black text-[#0F172A]" }, "ScanLoyal"),
              React.createElement(DialogDescription, { className: "text-[10px] text-[#FF6A00] font-black uppercase tracking-widest" }, "Version 1.5.0")
            ),
            React.createElement("div", { className: "py-4 space-y-3 text-xs text-[#5A4E46]" },
              React.createElement("p", { className: "leading-relaxed" }, "A premium Digital Loyalty Voucher SaaS platform that powers check-ins, stamps, and automated reward redemptions."),
              React.createElement("div", { className: "pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-semibold" },
                React.createElement("p", null, "Powered by Logisaar Technologies"),
                React.createElement("p", null, "© 2026 Logisaar. All rights reserved.")
              )
            ),
            React.createElement(DialogFooter, {},
              React.createElement(Button, { onClick: () => setActiveModal(null), className: "w-full bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded-xl text-xs" }, "Dismiss")
            )
          )
        )
    )
  );
}

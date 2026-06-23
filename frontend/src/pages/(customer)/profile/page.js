import { Link } from "react-router-dom";
const _jsxFileName = "src\\pages\\(customer)\\profile\\page.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Phone, Mail, AlertTriangle, ShieldAlert, ChevronLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";










export default function ProfilePage() {
  const { logout, checkSession } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmPhone, setDeleteConfirmPhone] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [supportMsg, setSupportMsg] = useState("");
  const [supportLoading, setSupportLoading] = useState(false);

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ["customerProfile"],
    queryFn: () => api.get("/customer/profile").then((res) => res.data),
  });

  useEffect(() => {
    if (profile && !isEditing) {
      setName(profile.name);
      setEmail(profile.email || "");
    }
  }, [profile, isEditing]);

  if (isLoading) {
    return (
      React.createElement('div', { className: "space-y-4 animate-pulse" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 49}}
        , React.createElement('div', { className: "h-10 w-48 rounded bg-muted"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 50}} )
        , React.createElement('div', { className: "h-44 w-full rounded-xl bg-muted"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 51}} )
        , React.createElement('div', { className: "h-24 w-full rounded-xl bg-muted"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 52}} )
      )
    );
  }

  const handleSendSupport = async (e) => {
    e.preventDefault();
    if (!supportMsg.trim()) return;
    setSupportLoading(true);
    try {
      await api.post("/customer/support-message", { message: supportMsg });
      setMessage({ type: "success", text: "Support message sent successfully!" });
      setSupportMsg("");
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to send message." });
    } finally {
      setSupportLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setMessage(null);

    try {
      const response = await api.patch("/customer/profile", { name, email });
      if (response.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setIsEditing(false);
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
    if (deleteConfirmPhone !== _optionalChain([profile, 'optionalAccess', _ => _.phone, 'access', _2 => _2.replace, 'call', _3 => _3("+91", ""), 'access', _4 => _4.trim, 'call', _5 => _5()])) {
      setMessage({ type: "error", text: "Phone number verification mismatch" });
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await api.delete("/customer/account");
      if (response.success) {
        setShowDeleteModal(false);
        logout(); // logs out and redirects to login
      } else {
        throw new Error(response.message || "Failed to delete account");
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Deletion failed" });
      setDeleteLoading(false);
    }
  };

  return (
    React.createElement('div', { className: "space-y-6 animate-fade-in" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 101}}
      /* Header */
      , React.createElement('div', { className: "flex items-center space-x-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 103}}
        , React.createElement(Link, { to: "/dashboard", className: "rounded-lg p-2 text-muted-foreground hover:bg-slate-100 hover:text-foreground transition-colors"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 104}}
          , React.createElement(ChevronLeft, { className: "h-5 w-5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 105}} )
        )
        , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 107}}
          , React.createElement('h2', { className: "text-xl font-extrabold text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 108}}, "Profile Settings" )
          , React.createElement('p', { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 109}}, "Manage your credentials & privacy"    )
        )
      )

      , message && (
        React.createElement('div', { className: `rounded-lg p-3 text-xs text-center border ${
          message.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
            : "bg-destructive/10 border-destructive/20 text-destructive"
        }`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 114}}
          , message.text
        )
      )

      /* Main Profile Card */
      , React.createElement(Card, { className: "glass", glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 124}}
        , React.createElement(CardHeader, { className: "p-4 pb-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 125}}
          , React.createElement('div', { className: "flex items-center space-x-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 126}}
            , React.createElement('div', { className: "h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 127}}
              , _optionalChain([profile, 'optionalAccess', _6 => _6.name, 'access', _7 => _7[0], 'access', _8 => _8.toUpperCase, 'call', _9 => _9()])
            )
            , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 130}}
              , React.createElement(CardTitle, { className: "text-base font-bold text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 131}}, _optionalChain([profile, 'optionalAccess', _10 => _10.name]))
              , React.createElement(CardDescription, { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 132}}, "Registered: "
                 , profile ? formatDate(profile.createdAt) : ""
              )
            )
          )
        )
        , React.createElement(CardContent, { className: "p-4 pt-3 space-y-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 138}}
          , !isEditing ? (
            React.createElement('div', { className: "space-y-3", __self: this, __source: {fileName: _jsxFileName, lineNumber: 140}}
              , React.createElement('div', { className: "flex items-center space-x-3 text-xs bg-slate-50 p-3 rounded-lg border border-border/50"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 141}}
                , React.createElement(Phone, { className: "h-4 w-4 text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 142}} )
                , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 143}}
                  , React.createElement('span', { className: "text-muted-foreground block text-[10px]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 144}}, "Phone")
                  , React.createElement('span', { className: "text-foreground font-semibold" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 145}}, _optionalChain([profile, 'optionalAccess', _11 => _11.phone]))
                )
              )

              , React.createElement('div', { className: "flex items-center space-x-3 text-xs bg-slate-50 p-3 rounded-lg border border-border/50"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 149}}
                , React.createElement(Mail, { className: "h-4 w-4 text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 150}} )
                , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 151}}
                  , React.createElement('span', { className: "text-muted-foreground block text-[10px]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 152}}, "Email Address" )
                  , React.createElement('span', { className: "text-foreground font-semibold" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 153}}, _optionalChain([profile, 'optionalAccess', _12 => _12.email]) || "Not configured")
                )
              )

              , React.createElement(Button, { variant: "outline", className: "w-full text-xs font-semibold h-10 mt-2 rounded-full"    , onClick: () => setIsEditing(true), __self: this, __source: {fileName: _jsxFileName, lineNumber: 157}}, "Edit Profile Info"

              )
            )
          ) : (
            React.createElement('form', { onSubmit: handleUpdateProfile, className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 162}}
              , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 163}}
                , React.createElement(Label, { htmlFor: "name", __self: this, __source: {fileName: _jsxFileName, lineNumber: 164}}, "Full Name" )
                , React.createElement(Input, {
                  id: "name",
                  type: "text",
                  value: name,
                  onChange: (e) => setName(e.target.value),
                  placeholder: "Rahul Sharma" ,
                  required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 165}}
                )
              )

              , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 175}}
                , React.createElement(Label, { htmlFor: "email", __self: this, __source: {fileName: _jsxFileName, lineNumber: 176}}, "Email Address" )
                , React.createElement(Input, {
                  id: "email",
                  type: "email",
                  value: email,
                  onChange: (e) => setEmail(e.target.value),
                  placeholder: "rahul@domain.com", __self: this, __source: {fileName: _jsxFileName, lineNumber: 177}}
                )
              )

              , React.createElement('div', { className: "flex gap-2 pt-2"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 186}}
                , React.createElement(Button, { type: "button", variant: "outline", className: "flex-1 text-xs h-10 rounded-full"  , onClick: () => setIsEditing(false), __self: this, __source: {fileName: _jsxFileName, lineNumber: 187}}, "Cancel"

                )
                , React.createElement(Button, { type: "submit", className: "flex-1 text-xs h-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"     , disabled: submitLoading, __self: this, __source: {fileName: _jsxFileName, lineNumber: 190}}
                  , submitLoading ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 191}} ) : "Save Changes"
                )
              )
            )
          )
        )
      )

      /* Customer Support Card */
      , React.createElement(Card, { className: "glass", glass: true }
        , React.createElement(CardHeader, { className: "p-4 pb-2" }
          , React.createElement(CardTitle, { className: "text-base font-bold text-foreground" }, "Customer Support")
          , React.createElement(CardDescription, { className: "text-xs text-muted-foreground" }, "Submit a query or request assistance directly from platform admins.")
        )
        , React.createElement(CardContent, { className: "p-4 pt-3" }
          , React.createElement('form', { onSubmit: handleSendSupport, className: "space-y-4" }
            , React.createElement('div', { className: "space-y-1.5" }
              , React.createElement(Label, { htmlFor: "support-message", className: "text-xs font-semibold text-muted-foreground" }, "Your Message")
              , React.createElement('textarea', {
                  id: "support-message",
                  placeholder: "Describe your issue, ask for help, or submit feedback...",
                  value: supportMsg,
                  onChange: (e) => setSupportMsg(e.target.value),
                  required: true,
                  className: "w-full min-h-[80px] text-xs p-2 border border-border bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                })
            )
            , React.createElement(Button, { type: "submit", className: "w-full text-xs font-semibold h-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full", disabled: supportLoading }
              , supportLoading ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin" }) : "Send Support Message"
            )
          )
        )
      )

      /* Danger Zone */
      , React.createElement(Card, { className: "border-red-200 bg-red-50/20" , glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 200}}
        , React.createElement(CardHeader, { className: "p-4 pb-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 201}}
          , React.createElement(CardTitle, { className: "text-xs font-bold text-red-700 flex items-center uppercase tracking-wider"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 202}}
            , React.createElement(ShieldAlert, { className: "mr-2 h-4 w-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 203}} ), " Danger Zone"
          )
          , React.createElement(CardDescription, { className: "text-[11px] text-red-600/80" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 205}}, "Irreversible privacy actions"

          )
        )
        , React.createElement(CardContent, { className: "p-4 pt-0" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 209}}
          , React.createElement('p', { className: "text-[11px] text-red-700 mb-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 210}}, "Deleting your account will erase all your active loyalty cards, visit history, and unredeemed vouchers. This action cannot be undone."

          )
          , React.createElement(Button, { variant: "destructive", className: "w-full text-xs font-semibold h-10 bg-red-600 hover:bg-red-700 text-white rounded-full"      , onClick: () => setShowDeleteModal(true), __self: this, __source: {fileName: _jsxFileName, lineNumber: 213}}, "Request Account Deletion"

          )
        )
      )

      /* Deletion Dialog */
      , showDeleteModal && (
        React.createElement(Dialog, { open: showDeleteModal, onOpenChange: setShowDeleteModal, __self: this, __source: {fileName: _jsxFileName, lineNumber: 221}}
          , React.createElement(DialogContent, { className: "max-w-[340px]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 222}}
            , React.createElement(DialogHeader, { className: "text-center", __self: this, __source: {fileName: _jsxFileName, lineNumber: 223}}
              , React.createElement(DialogTitle, { className: "text-lg font-bold text-foreground flex items-center justify-center gap-2"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 224}}
                , React.createElement(AlertTriangle, { className: "h-5 w-5 text-red-600"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 225}} ), " Are you absolutely sure?"
              )
              , React.createElement(DialogDescription, { className: "text-xs mt-1 text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 227}}, "This will delete your customer account and revoke all unlocked vouchers."

              )
            )
            , React.createElement('div', { className: "space-y-3 py-3" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 231}}
              , React.createElement(Label, { htmlFor: "confirmPhone", className: "text-xs text-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 232}}, "To confirm, enter your 10-digit phone number without prefix (e.g. "
                          , _optionalChain([profile, 'optionalAccess', _13 => _13.phone, 'access', _14 => _14.replace, 'call', _15 => _15("+91", ""), 'access', _16 => _16.trim, 'call', _17 => _17()]), "):"
              )
              , React.createElement(Input, {
                id: "confirmPhone",
                type: "tel",
                placeholder: "Confirm phone number"  ,
                value: deleteConfirmPhone,
                onChange: (e) => setDeleteConfirmPhone(e.target.value.replace(/\D/g, "")),
                required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 235}}
              )
            )
            , React.createElement(DialogFooter, { className: "flex gap-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 244}}
              , React.createElement(Button, { variant: "outline", className: "flex-1 rounded-full", onClick: () => setShowDeleteModal(false), __self: this, __source: {fileName: _jsxFileName, lineNumber: 245}}, "Cancel"

              )
              , React.createElement(Button, { variant: "destructive", className: "flex-1 bg-red-600 hover:bg-red-700 text-white rounded-full"   , onClick: handleDeleteAccount, disabled: deleteLoading, __self: this, __source: {fileName: _jsxFileName, lineNumber: 248}}
                , deleteLoading ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 249}} ) : "Delete Forever"
              )
            )
          )
        )
      )
    )
  );
}

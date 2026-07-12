"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Bell, MessageSquare, Send, Calendar, CheckCircle2, Megaphone } from "lucide-react";
import { formatDate } from "@/lib/utils";
import BusinessBottomNav from "@/components/BusinessBottomNav";

export default function BusinessCustomerNotifications() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const businessId = user?.businessId;

  // Form states
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [type, setType] = useState("General");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch sent campaigns history
  const { data: campaigns = [], isLoading: campaignsLoading, refetch } = useQuery({
    queryKey: ["sentCampaigns", businessId],
    queryFn: () => api.get("/notifications/sent-campaigns").then((res) => res.data),
    enabled: !!businessId,
  });

  // Send Notification Mutation
  const sendMutation = useMutation({
    mutationFn: (newNotification) => api.post("/notifications/send", newNotification),
    onSuccess: () => {
      queryClient.invalidateQueries(["sentCampaigns", businessId]);
      setSuccessMessage("Notification sent successfully to all your customers!");
      setTitle("");
      setMessage("");
      setBannerUrl("");
      setType("General");
      setTimeout(() => setSuccessMessage(""), 5000);
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Failed to send notification.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    sendMutation.mutate({
      title,
      message,
      bannerUrl: bannerUrl.trim() || undefined,
      type,
    });
  };

  const getIcon = (type) => {
    switch (type) {
      case "Offer":
        return "🏷️";
      case "Coupon":
        return "🎟️";
      case "Reward":
        return "🎁";
      case "Announcement":
        return "📢";
      default:
        return "💬";
    }
  };

  return (
    React.createElement('div', { className: "flex-1 min-h-screen bg-slate-50/50 pb-20 md:pb-10" },
      React.createElement('div', { className: "max-w-4xl mx-auto p-4 md:p-6 space-y-6" },
        /* Header */
        React.createElement('div', { className: "flex flex-col gap-1.5" },
          React.createElement('div', { className: "flex items-center gap-2" },
            React.createElement('div', { className: "h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary" },
              React.createElement(Bell, { className: "h-5 w-5" })
            ),
            React.createElement('h1', { className: "text-xl font-bold text-slate-800" }, "Customer Notifications")
          ),
          React.createElement('p', { className: "text-xs text-muted-foreground" }, "Create and send alerts directly to all registered customers of your business.")
        ),

        successMessage && React.createElement('div', { className: "bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center gap-2.5 text-xs font-semibold animate-fade-in" },
          React.createElement(CheckCircle2, { className: "h-5 w-5 text-emerald-600 shrink-0" }),
          React.createElement('span', null, successMessage)
        ),

        /* Form and list container */
        React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-12 gap-6" },
          /* Creation form */
          React.createElement('div', { className: "md:col-span-5" },
            React.createElement(Card, { className: "border border-slate-100 shadow-sm rounded-3xl overflow-hidden" },
              React.createElement(CardHeader, { className: "pb-4 border-b border-slate-100 bg-white" },
                React.createElement(CardTitle, { className: "text-sm font-bold text-slate-800" }, "New Notification"),
                React.createElement(CardDescription, { className: "text-[11px]" }, "Broadcast message to all of your loyalty customers.")
              ),
              React.createElement(CardContent, { className: "p-5 bg-white" },
                React.createElement('form', { onSubmit: handleSubmit, className: "space-y-4" },
                  React.createElement('div', { className: "space-y-1.5" },
                    React.createElement(Label, { htmlFor: "notif-title", className: "text-xs font-semibold text-slate-700" }, "Notification Title"),
                    React.createElement(Input, {
                      id: "notif-title",
                      placeholder: "e.g. Free Coffee this Weekend!",
                      value: title,
                      onChange: (e) => setTitle(e.target.value),
                      maxLength: 100,
                      required: true,
                      className: "h-10 text-xs rounded-xl border-slate-200 focus-visible:ring-primary"
                    })
                  ),

                  React.createElement('div', { className: "space-y-1.5" },
                    React.createElement(Label, { htmlFor: "notif-type", className: "text-xs font-semibold text-slate-700" }, "Notification Type"),
                    React.createElement('select', {
                      id: "notif-type",
                      value: type,
                      onChange: (e) => setType(e.target.value),
                      className: "flex h-10 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed"
                    },
                      React.createElement('option', { value: "General" }, "General 💬"),
                      React.createElement('option', { value: "Offer" }, "Offer 🏷️"),
                      React.createElement('option', { value: "Coupon" }, "Coupon 🎟️"),
                      React.createElement('option', { value: "Reward" }, "Reward 🎁"),
                      React.createElement('option', { value: "Announcement" }, "Announcement 📢")
                    )
                  ),

                  React.createElement('div', { className: "space-y-1.5" },
                    React.createElement(Label, { htmlFor: "notif-message", className: "text-xs font-semibold text-slate-700" }, "Message"),
                    React.createElement('textarea', {
                      id: "notif-message",
                      placeholder: "Write details here... e.g. Drop by our branch between 2 PM and 5 PM on Sunday to get a free hot drink on us!",
                      value: message,
                      onChange: (e) => setMessage(e.target.value),
                      maxLength: 500,
                      required: true,
                      rows: 4,
                      className: "flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                    })
                  ),

                  React.createElement('div', { className: "space-y-1.5" },
                    React.createElement(Label, { htmlFor: "notif-banner", className: "text-xs font-semibold text-slate-700" }, "Optional Banner Image URL"),
                    React.createElement(Input, {
                      id: "notif-banner",
                      placeholder: "https://example.com/banner.jpg",
                      value: bannerUrl,
                      onChange: (e) => setBannerUrl(e.target.value),
                      type: "url",
                      className: "h-10 text-xs rounded-xl border-slate-200 focus-visible:ring-primary"
                    })
                  ),

                  React.createElement(Button, {
                    type: "submit",
                    disabled: sendMutation.isPending || !title.trim() || !message.trim(),
                    className: "w-full text-xs font-bold h-11 bg-primary text-white hover:bg-primary/95 shadow-sm rounded-xl transition-all flex items-center justify-center gap-1.5 mt-2"
                  },
                    sendMutation.isPending ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin" }) : React.createElement(Send, { className: "h-3.5 w-3.5" }),
                    sendMutation.isPending ? "Sending Broadcast..." : "Send Notification"
                  )
                )
              )
            )
          ),

          /* Sent campaigns list */
          React.createElement('div', { className: "md:col-span-7 space-y-4" },
            React.createElement('h2', { className: "text-sm font-bold text-slate-800 px-1" }, "Sent Campaigns History"),
            campaignsLoading ? (
              React.createElement('div', { className: "flex flex-col items-center justify-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm" },
                React.createElement(Loader2, { className: "h-7 w-7 animate-spin text-primary" }),
                React.createElement('span', { className: "text-xs text-muted-foreground mt-3" }, "Loading campaigns...")
              )
            ) : campaigns.length === 0 ? (
              React.createElement('div', { className: "text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm p-6" },
                React.createElement('div', { className: "h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4" },
                  React.createElement(MessageSquare, { className: "h-5 w-5" })
                ),
                React.createElement('h3', { className: "text-xs font-bold text-slate-700" }, "No notifications sent yet"),
                React.createElement('p', { className: "text-[11px] text-muted-foreground mt-1 max-w-xs mx-auto" }, "Your sent broadcasts and customer announcements will appear in this campaign history log.")
              )
            ) : (
              React.createElement('div', { className: "space-y-3" },
                campaigns.map((camp) => (
                  React.createElement(Card, { key: camp.campaignId, className: "border border-slate-100 hover:border-slate-200/80 shadow-sm rounded-2xl overflow-hidden transition-all bg-white" },
                    React.createElement(CardContent, { className: "p-4 space-y-3" },
                      React.createElement('div', { className: "flex justify-between items-start gap-2" },
                        React.createElement('div', { className: "space-y-1" },
                          React.createElement('div', { className: "flex items-center gap-1.5" },
                            React.createElement('span', { className: "text-sm font-bold text-slate-800" }, camp.title),
                            React.createElement('span', { className: "text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-medium" },
                              getIcon(camp.type), " ", camp.type
                            )
                          ),
                          React.createElement('div', { className: "flex items-center gap-1 text-[10px] text-muted-foreground" },
                            React.createElement(Calendar, { className: "h-3 w-3 shrink-0" }),
                            React.createElement('span', null, formatDate(camp.sentDate))
                          )
                        )
                      ),
                      React.createElement('div', { className: "grid grid-cols-2 gap-4 border-t border-slate-100 pt-3 text-center" },
                        React.createElement('div', { className: "bg-slate-50/50 rounded-xl p-2" },
                          React.createElement('p', { className: "text-[10px] font-bold text-slate-500 uppercase tracking-wider" }, "Total Recipients"),
                          React.createElement('p', { className: "text-base font-extrabold text-slate-800 mt-0.5" }, camp.totalRecipients)
                        ),
                        React.createElement('div', { className: "bg-emerald-50/40 rounded-xl p-2" },
                          React.createElement('p', { className: "text-[10px] font-bold text-emerald-700 uppercase tracking-wider" }, "Delivered Count"),
                          React.createElement('p', { className: "text-base font-extrabold text-emerald-800 mt-0.5" }, camp.deliveredCount)
                        )
                      )
                    )
                  )
                ))
              )
            )
          )
        )
      ),
      React.createElement(BusinessBottomNav, null)
    )
  );
}

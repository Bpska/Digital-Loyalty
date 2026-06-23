import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Calendar, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function SuperSupport() {
  const { data: messagesData, isLoading } = useQuery({
    queryKey: ["superSupportMessages"],
    queryFn: () => api.get("/admin/support-messages").then((res) => res.data),
  });

  const messages = messagesData || [];

  if (isLoading) {
    return React.createElement('div', { className: "space-y-4 animate-pulse" },
      React.createElement('div', { className: "h-8 w-48 rounded bg-muted" }),
      React.createElement('div', { className: "space-y-3" },
        React.createElement('div', { className: "h-28 w-full rounded-xl bg-muted" }),
        React.createElement('div', { className: "h-28 w-full rounded-xl bg-muted" })
      )
    );
  }

  return React.createElement('div', { className: "space-y-8 animate-fade-in" },
    React.createElement('div', null,
      React.createElement('h1', { className: "text-3xl font-extrabold text-foreground tracking-tight" }, "Customer Support Messages"),
      React.createElement('p', { className: "text-xs text-muted-foreground mt-1" }, "Review issues, requests, and feedback submitted by registered customer accounts.")
    ),

    React.createElement('div', { className: "space-y-4" },
      messages.length === 0 ? React.createElement('div', { className: "text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed text-slate-500 text-sm" },
        "No support messages received yet."
      ) : messages.map((msg) => {
        const senderName = msg.metadata?.senderName || "Unknown User";
        const senderPhone = msg.metadata?.senderPhone || "N/A";
        const senderEmail = msg.metadata?.senderEmail || "N/A";
        const messageBody = msg.body || "";

        return React.createElement(Card, { key: msg.id, className: "glass", glass: true },
          React.createElement(CardHeader, { className: "p-5 pb-2" },
            React.createElement('div', { className: "flex flex-col md:flex-row md:items-center justify-between gap-2" },
              React.createElement('div', { className: "flex items-center space-x-2" },
                React.createElement('div', { className: "h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600" },
                  React.createElement(User, { className: "h-4 w-4" })
                ),
                React.createElement('div', null,
                  React.createElement(CardTitle, { className: "text-sm font-bold text-foreground" }, senderName),
                  React.createElement('div', { className: "flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-[10px] text-muted-foreground" },
                    React.createElement('span', { className: "flex items-center gap-1" },
                      React.createElement(Phone, { className: "h-3 w-3" }), senderPhone
                    ),
                    senderEmail !== "N/A" ? React.createElement('span', { className: "flex items-center gap-1" },
                      React.createElement(Mail, { className: "h-3 w-3" }), senderEmail
                    ) : null
                  )
                )
              ),
              React.createElement('div', { className: "text-[10px] text-muted-foreground flex items-center gap-1 shrink-0 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full" },
                React.createElement(Calendar, { className: "h-3 w-3" }), formatDate(msg.createdAt)
              )
            )
          ),
          React.createElement(CardContent, { className: "p-5 pt-2" },
            React.createElement('p', { className: "text-xs text-slate-700 bg-slate-50/70 p-3 rounded-lg border border-slate-100/50 leading-relaxed font-medium" },
              messageBody
            )
          )
        );
      })
    )
  );
}

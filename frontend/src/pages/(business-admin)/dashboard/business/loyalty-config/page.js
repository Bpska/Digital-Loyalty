import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2, CheckCircle2, Coffee, Stamp, Gift, Zap,
  ArrowRight, IndianRupee, Star, Shield, Clock, Info,
  Sparkles, Settings, AlertCircle
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StampDot({ filled }) {
  return React.createElement(
    "div",
    {
      className: `h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all ${
        filled
          ? "bg-gradient-to-tr from-[#FF6A00]/90 to-[#800020]/90 border-[#FF6A00] text-white shadow-md shadow-[#FF6A00]/20"
          : "bg-white border-dashed border-slate-300 text-slate-300"
      }`,
    },
    React.createElement(Stamp, {
      className: filled ? "h-4 w-4 fill-white text-white stroke-none" : "h-4 w-4 opacity-30",
    })
  );
}

// ─── Flow Step Badge ──────────────────────────────────────────────────────────
function FlowStep({ icon: Icon, label, color, isLast }) {
  return React.createElement(
    "div",
    { className: "flex items-center gap-2" },
    React.createElement(
      "div",
      { className: `flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold ${color}` },
      React.createElement(Icon, { className: "h-3.5 w-3.5 shrink-0" }),
      label
    ),
    !isLast &&
      React.createElement(ArrowRight, { className: "h-3.5 w-3.5 text-muted-foreground shrink-0" })
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BusinessLoyaltyConfigPage() {
  const { user } = useAuthStore();
  const businessId = user?.businessId;
  const queryClient = useQueryClient();

  const [saved, setSaved] = useState(false);
  const [stampCost, setStampCost] = useState("500");
  const [isEditing, setIsEditing] = useState(false);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    programName: "",
    requiredStamps: "7",
    rewardName: "",
    validityDays: "30",
    maxDailyStamps: "1",
    bonusThresholdAmount: "500",
    pointsPerRupeeAboveThreshold: "0.1",
  });

  // Simulation state
  const [simAmount, setSimAmount] = useState(250);

  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["loyaltySettings", businessId],
    queryFn: () => api.get(`/loyalty-approval/settings/${businessId}`).then((r) => r.data),
    enabled: !!businessId && businessId !== "null" && businessId !== "undefined",
  });

  const isConfigured = !!(settings && settings.programName && settings.programName !== "Coffee Rewards");

  React.useEffect(() => {
    if (settings) {
      setSettingsForm({
        programName: settings.programName || "",
        requiredStamps: String(settings.requiredStamps ?? 7),
        rewardName: settings.rewardName || "",
        validityDays: String(settings.validityDays ?? 30),
        maxDailyStamps: String(settings.maxDailyStamps ?? 1),
        bonusThresholdAmount: String(settings.bonusThresholdAmount ?? 500),
        pointsPerRupeeAboveThreshold: String(settings.pointsPerRupeeAboveThreshold ?? 0.1),
      });
      const ppr = settings.pointsPerRupee || 0.1;
      const pps = settings.pointsPerStamp ?? 50;
      setStampCost(String(Math.round(pps / ppr)));

      // Auto-set editing mode to false if already configured
      const isConfig = !!(settings.programName && settings.programName !== "Coffee Rewards");
      setIsEditing(!isConfig);
    }
  }, [settings]);

  const saveSettingsMutation = useMutation({
    mutationFn: (data) => api.post(`/loyalty-approval/settings/${businessId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyaltySettings", businessId] });
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
      setIsEditing(false);
    },
    onError: (err) => alert(err.message || "Failed to save settings"),
  });

  function handleSaveSettings(e) {
    e.preventDefault();
    const rs = parseInt(settingsForm.requiredStamps, 10);
    const vd = parseInt(settingsForm.validityDays, 10);
    const mds = parseInt(settingsForm.maxDailyStamps, 10);
    const sc = parseFloat(stampCost);
    const bta = parseFloat(settingsForm.bonusThresholdAmount);
    const prt = parseFloat(settingsForm.pointsPerRupeeAboveThreshold);

    if (!settingsForm.programName.trim()) { alert("Program name is required"); return; }
    if (isNaN(rs) || rs <= 0) { alert("Required stamps must be a positive integer"); return; }
    if (!settingsForm.rewardName.trim()) { alert("Reward name is required"); return; }
    if (isNaN(vd) || vd <= 0) { alert("Validity must be a positive integer"); return; }
    if (isNaN(mds) || mds <= 0) { alert("Maximum Daily Stamp must be a positive integer"); return; }
    if (isNaN(sc) || sc <= 0) { alert("Stamp cost must be a positive number"); return; }
    if (isNaN(bta) || bta < 0) { alert("Bonus threshold must be a non-negative number"); return; }
    if (isNaN(prt) || prt < 0) { alert("Bonus points rate must be a non-negative number"); return; }

    const ppr = settings?.pointsPerRupee || 0.1;

    saveSettingsMutation.mutate({
      programName: settingsForm.programName.trim(),
      requiredStamps: rs,
      rewardName: settingsForm.rewardName.trim(),
      validityDays: vd,
      maxDailyStamps: mds,
      pointsPerStamp: Math.round(sc * ppr),
      bonusThresholdAmount: bta,
      pointsPerRupeeAboveThreshold: prt,
    });
  }

  // Live calculation using global rates from settings response and current stampCost state
  const ppr = settings?.pointsPerRupee || 0.1;
  const currentStampCostInput = parseFloat(stampCost) || 500;
  const pps = Math.max(1, Math.round(currentStampCostInput * ppr));
  const reqStamps = parseInt(settingsForm.requiredStamps, 10) || 7;

  const simPointsEarned = Math.floor(simAmount * ppr);
  let simStampsFromPurchase = Math.floor(simPointsEarned / pps);
  const maxStamps = settingsForm.maxDailyStamps ? parseInt(settingsForm.maxDailyStamps, 10) : 1;
  if (simStampsFromPurchase > maxStamps) {
    simStampsFromPurchase = maxStamps;
  }
  const simRupeePerStamp = Math.ceil(pps / ppr);
  const simTotalSpendForReward = simRupeePerStamp * reqStamps;

  if (isLoadingSettings) {
    return React.createElement(
      "div",
      { className: "flex min-h-[400px] items-center justify-center" },
      React.createElement(Loader2, { className: "h-8 w-8 animate-spin text-primary" })
    );
  }

  return React.createElement(
    "div",
    { className: "space-y-8 max-w-3xl" },

    // ── Page Header ───────────────────────────────────────────────────────────
    React.createElement(
      "div",
      { className: "flex items-start justify-between gap-4" },
      React.createElement(
        "div",
        null,
        React.createElement(
          "h1",
          { className: "text-2xl font-bold text-foreground flex items-center gap-2" },
          React.createElement(Coffee, { className: "h-6 w-6 text-primary" }),
          "Loyalty Program Setup"
        ),
        React.createElement(
          "p",
          { className: "text-sm text-muted-foreground mt-1" },
          "Configure your stamp-based loyalty program. Customers earn stamps automatically when you approve their purchases."
        )
      ),
      // Status badge
      isConfigured
        ? React.createElement(
            "div",
            { className: "flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap" },
            React.createElement("span", { className: "h-2 w-2 rounded-full bg-emerald-500 animate-pulse inline-block" }),
            "Program Active"
          )
        : React.createElement(
            "div",
            { className: "flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap" },
            React.createElement(AlertCircle, { className: "h-3.5 w-3.5" }),
            "Not Configured"
          )
    ),

    // ── How It Works Flow ─────────────────────────────────────────────────────
    React.createElement(
      "div",
      { className: "rounded-xl border border-border/60 bg-gradient-to-r from-slate-50 to-blue-50/30 p-4" },
      React.createElement(
        "p",
        { className: "text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3" },
        "Customer Journey"
      ),
      React.createElement(
        "div",
        { className: "flex flex-wrap gap-2 items-center" },
        React.createElement(FlowStep, {
          icon: Star,
          label: "Customer Scans QR",
          color: "bg-blue-50 border-blue-200 text-blue-700",
        }),
        React.createElement(FlowStep, {
          icon: IndianRupee,
          label: "You Enter Purchase Amount",
          color: "bg-orange-50 border-orange-200 text-orange-700",
        }),
        React.createElement(FlowStep, {
          icon: Zap,
          label: "Points Auto-Calculated",
          color: "bg-violet-50 border-violet-200 text-violet-700",
        }),
        React.createElement(FlowStep, {
          icon: Stamp,
          label: "Stamps Auto-Awarded",
          color: "bg-amber-50 border-amber-200 text-amber-700",
        }),
        React.createElement(FlowStep, {
          icon: Gift,
          label: `Customer Earns "${settingsForm.rewardName || "Reward"}"`,
          color: "bg-emerald-50 border-emerald-200 text-emerald-700",
          isLast: true,
        })
      )
    ),

    // ── Two-column layout: Form + Live Preview ─────────────────────────────────
    React.createElement(
      "div",
      { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 items-start" },

      // Left: Settings Form or Active Program details card
      isConfigured && !isEditing
        ? React.createElement(
            Card,
            { className: "border border-emerald-100 bg-gradient-to-br from-emerald-50/10 to-white shadow-md relative overflow-hidden" },
            React.createElement("div", { className: "absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" }),
            React.createElement(
              CardHeader,
              { className: "pb-4 border-b border-slate-100" },
              React.createElement(
                "div",
                { className: "flex items-center justify-between" },
                React.createElement(
                  "div",
                  null,
                  React.createElement(
                    CardTitle,
                    { className: "text-lg font-black text-slate-800 flex items-center gap-2" },
                    React.createElement(Sparkles, { className: "h-5 w-5 text-emerald-600" }),
                    settings?.programName || "Active Program"
                  ),
                  React.createElement(CardDescription, null, "Currently running stamp and points rules")
                ),
                React.createElement(
                  Button,
                  {
                    size: "sm",
                    variant: "outline",
                    onClick: () => setIsEditing(true),
                    className: "border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold"
                  },
                  "Edit Settings"
                )
              )
            ),
            React.createElement(
              CardContent,
              { className: "p-6 grid grid-cols-2 gap-4 text-xs" },

              // Detail 1: Reward Name
              React.createElement(
                "div",
                { className: "bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 space-y-1" },
                React.createElement("span", { className: "text-slate-400 block uppercase tracking-wider text-[9px] font-bold" }, "Linked Reward Voucher"),
                React.createElement(
                  "span",
                  { className: "text-slate-800 font-extrabold text-sm flex items-center gap-1.5" },
                  React.createElement(Gift, { className: "h-4 w-4 text-primary shrink-0" }),
                  settings?.rewardName
                )
              ),

              // Detail 2: Stamp Cost
              React.createElement(
                "div",
                { className: "bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 space-y-1" },
                React.createElement("span", { className: "text-slate-400 block uppercase tracking-wider text-[9px] font-bold" }, "Stamp Earning Cost"),
                React.createElement(
                  "span",
                  { className: "text-slate-800 font-extrabold text-sm flex items-center gap-1.5" },
                  React.createElement(IndianRupee, { className: "h-4 w-4 text-emerald-600 shrink-0" }),
                  `₹${Math.round((settings?.pointsPerStamp ?? 50) / (settings?.pointsPerRupee ?? 0.1))} Spent`
                )
              ),

              // Detail 3: Stamps needed
              React.createElement(
                "div",
                { className: "bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 space-y-1" },
                React.createElement("span", { className: "text-slate-400 block uppercase tracking-wider text-[9px] font-bold" }, "Required Stamps"),
                React.createElement(
                  "span",
                  { className: "text-slate-800 font-extrabold text-sm flex items-center gap-1.5" },
                  React.createElement(Stamp, { className: "h-4 w-4 text-amber-500 shrink-0" }),
                  `${settings?.requiredStamps} Stamps`
                )
              ),

              // Detail 4: Validity
              React.createElement(
                "div",
                { className: "bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 space-y-1" },
                React.createElement("span", { className: "text-slate-400 block uppercase tracking-wider text-[9px] font-bold" }, "Stamp Expiry"),
                React.createElement(
                  "span",
                  { className: "text-slate-800 font-extrabold text-sm flex items-center gap-1.5" },
                  React.createElement(Clock, { className: "h-4 w-4 text-blue-500 shrink-0" }),
                  `${settings?.validityDays} Days Validity`
                )
              ),

              // Detail 5: Daily Limit
              React.createElement(
                "div",
                { className: "bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 space-y-1 col-span-2" },
                React.createElement("span", { className: "text-slate-400 block uppercase tracking-wider text-[9px] font-bold" }, "Daily Earn Limits"),
                React.createElement(
                  "span",
                  { className: "text-slate-700 font-semibold flex items-center gap-1.5" },
                  React.createElement(Shield, { className: "h-4 w-4 text-violet-500 shrink-0" }),
                  `Maximum ${settings?.maxDailyStamps ?? 1} stamp(s) per customer per day`
                )
              )
            )
          )
        : React.createElement(
            Card,
            { className: "border border-border/70 shadow-sm" },
            React.createElement(
              CardHeader,
              { className: "pb-3" },
              React.createElement(
                "div",
                { className: "flex justify-between items-center" },
                React.createElement(
                  CardTitle,
                  { className: "flex items-center gap-2 text-base text-foreground font-bold" },
                  React.createElement(Settings, { className: "h-4.5 w-4.5 text-primary" }),
                  "Program Configuration"
                ),
                isConfigured && React.createElement(
                  Button,
                  {
                    type: "button",
                    variant: "ghost",
                    size: "sm",
                    onClick: () => setIsEditing(false),
                    className: "h-8 text-xs font-bold text-muted-foreground hover:text-foreground"
                  },
                  "Cancel"
                )
              ),
              React.createElement(CardDescription, null, "Set up your stamp program. Point conversion rates are managed by the platform.")
            ),
            React.createElement(
              CardContent,
              null,
          React.createElement(
            "form",
            { onSubmit: handleSaveSettings, className: "space-y-4" },

            // Program Name
            React.createElement(
              "div",
              { className: "space-y-1.5" },
              React.createElement(
                Label,
                { htmlFor: "prog-name" },
                "Program Name ",
                React.createElement("span", { className: "text-destructive" }, "*")
              ),
              React.createElement(Input, {
                id: "prog-name",
                placeholder: "e.g. Coffee Rewards, Brews Club",
                value: settingsForm.programName,
                onChange: (e) => setSettingsForm((f) => ({ ...f, programName: e.target.value })),
                className: "border-border",
              }),
              React.createElement(
                "p",
                { className: "text-[10px] text-muted-foreground" },
                "Shown on the customer's loyalty card"
              )
            ),

            // Reward Name
            React.createElement(
              "div",
              { className: "space-y-1.5" },
              React.createElement(
                Label,
                { htmlFor: "reward-name" },
                "Reward Name ",
                React.createElement("span", { className: "text-destructive" }, "*")
              ),
              React.createElement(Input, {
                id: "reward-name",
                placeholder: "e.g. Free Coffee, Free Dessert",
                value: settingsForm.rewardName,
                onChange: (e) => setSettingsForm((f) => ({ ...f, rewardName: e.target.value })),
                className: "border-border",
              }),
              React.createElement(
                "p",
                { className: "text-[10px] text-muted-foreground" },
                "What customers earn after collecting enough stamps"
              )
            ),

            // Cost of 1 Stamp (₹)
            React.createElement(
              "div",
              { className: "space-y-1.5" },
              React.createElement(
                Label,
                { htmlFor: "stamp-cost" },
                "Purchase Amount Required for 1 Stamp (₹) ",
                React.createElement("span", { className: "text-destructive" }, "*")
              ),
              React.createElement(Input, {
                id: "stamp-cost",
                type: "number",
                min: "1",
                placeholder: "e.g. 250 or 500",
                value: stampCost,
                onChange: (e) => setStampCost(e.target.value),
                className: "border-border",
              }),
              React.createElement(
                "p",
                { className: "text-[10px] text-muted-foreground" },
                "The spend threshold required for a customer to automatically earn 1 Stamp."
              )
            ),

            // Required Stamps + Validity (row)
            React.createElement(
              "div",
              { className: "grid grid-cols-2 gap-3" },
              React.createElement(
                "div",
                { className: "space-y-1.5" },
                React.createElement(
                  Label,
                  { htmlFor: "req-stamps" },
                  "Stamps Needed"
                ),
                React.createElement(Input, {
                  id: "req-stamps",
                  type: "number",
                  placeholder: "e.g. 7",
                  min: "1",
                  max: "50",
                  value: settingsForm.requiredStamps,
                  onChange: (e) => setSettingsForm((f) => ({ ...f, requiredStamps: e.target.value })),
                  className: "border-border",
                }),
                React.createElement(
                  "p",
                  { className: "text-[10px] text-muted-foreground" },
                  "Stamps to unlock reward"
                )
              ),
              React.createElement(
                "div",
                { className: "space-y-1.5" },
                React.createElement(Label, { htmlFor: "validity-days" }, "Validity (Days)"),
                React.createElement(Input, {
                  id: "validity-days",
                  type: "number",
                  placeholder: "e.g. 30",
                  min: "1",
                  value: settingsForm.validityDays,
                  onChange: (e) => setSettingsForm((f) => ({ ...f, validityDays: e.target.value })),
                  className: "border-border",
                }),
                React.createElement(
                  "p",
                  { className: "text-[10px] text-muted-foreground" },
                  "Days stamps stay active"
                )
              )
            ),

            // Max Daily Stamps
            React.createElement(
              "div",
              { className: "space-y-1.5" },
              React.createElement(Label, { htmlFor: "max-daily-stamps" }, "Max Stamps Per Day"),
              React.createElement(Input, {
                id: "max-daily-stamps",
                type: "number",
                placeholder: "e.g. 1",
                min: "1",
                value: settingsForm.maxDailyStamps,
                onChange: (e) => setSettingsForm((f) => ({ ...f, maxDailyStamps: e.target.value })),
                className: "border-border",
              }),
              React.createElement(
                "p",
                { className: "text-[10px] text-muted-foreground" },
                "Limits one stamp card per customer per day"
              )
            ),



            // Conversion rates info (read-only — controlled by Super Admin)
            React.createElement(
              "div",
              {
                className:
                  "flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs text-slate-600",
              },
              React.createElement(Shield, { className: "h-3.5 w-3.5 mt-0.5 shrink-0 text-slate-500" }),
              React.createElement(
                "span",
                null,
                React.createElement("strong", null, "Conversion rates are platform-controlled: "),
                `${ppr} pts/₹ · ${pps} pts = 1 Stamp. Contact Super Admin to change.`
              )
            ),

            // Save Button
            React.createElement(
              "div",
              { className: "flex items-center gap-3 pt-1" },
              React.createElement(
                Button,
                {
                  type: "submit",
                  disabled: saveSettingsMutation.isPending,
                  className: "flex-1 bg-primary text-primary-foreground font-bold h-10 rounded-xl",
                },
                saveSettingsMutation.isPending
                  ? React.createElement(React.Fragment, null,
                      React.createElement(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                      "Saving..."
                    )
                  : saved
                  ? React.createElement(React.Fragment, null,
                      React.createElement(CheckCircle2, { className: "mr-2 h-4 w-4" }),
                      "Saved!"
                    )
                  : React.createElement(React.Fragment, null,
                      React.createElement(Sparkles, { className: "mr-2 h-4 w-4" }),
                      isConfigured ? "Update Program" : "Activate Program"
                    )
              )
            )
          )
        )
      ),

      // Right: Live Preview + Simulator
      React.createElement(
        "div",
        { className: "space-y-4" },

        // Simulator Card
        React.createElement(
          Card,
          { className: "border border-border/70 shadow-sm" },
          React.createElement(
            CardHeader,
            { className: "pb-3" },
            React.createElement(
              CardTitle,
              { className: "flex items-center gap-2 text-base text-foreground font-bold" },
              React.createElement(IndianRupee, { className: "h-4.5 w-4.5 text-emerald-600" }),
              "Purchase Simulator"
            ),
            React.createElement(
              CardDescription,
              null,
              "See how many points & stamps a purchase earns"
            )
          ),
          React.createElement(
            CardContent,
            { className: "space-y-4" },

            // Amount Input
            React.createElement(
              "div",
              { className: "flex items-center gap-2" },
              React.createElement(
                "span",
                { className: "text-sm font-bold text-muted-foreground" },
                "₹"
              ),
              React.createElement(Input, {
                type: "number",
                min: "1",
                value: simAmount,
                onChange: (e) => setSimAmount(parseFloat(e.target.value) || 0),
                className: "border-border text-lg font-bold",
              })
            ),

            // Quick amount buttons
            React.createElement(
              "div",
              { className: "flex flex-wrap gap-2" },
              [50, 100, 200, 300, 500, 1000].map((amt) =>
                React.createElement(
                  "button",
                  {
                    key: amt,
                    type: "button",
                    onClick: () => setSimAmount(amt),
                    className: `text-xs font-bold px-2.5 py-1 rounded-lg border transition-all ${
                      simAmount === amt
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted border-border text-muted-foreground hover:border-primary/50"
                    }`,
                  },
                  `₹${amt}`
                )
              )
            ),

            // Calculation result
            React.createElement(
              "div",
              { className: "rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2.5" },
              React.createElement(
                "div",
                { className: "flex justify-between items-center text-sm" },
                React.createElement("span", { className: "text-slate-600 font-medium" }, "Points Earned:"),
                React.createElement(
                  "span",
                  { className: "font-extrabold text-slate-800" },
                  `+${simPointsEarned} pts`
                )
              ),
              React.createElement(
                "div",
                { className: "flex justify-between items-center text-sm" },
                React.createElement("span", { className: "text-slate-600 font-medium" }, "Stamps Awarded:"),
                React.createElement(
                  "span",
                  {
                    className: `font-extrabold text-lg ${
                      simStampsFromPurchase > 0 ? "text-emerald-600" : "text-slate-500"
                    }`,
                  },
                  simStampsFromPurchase > 0
                    ? `+${simStampsFromPurchase} Stamp${simStampsFromPurchase > 1 ? "s" : ""} 🎉`
                    : "Partial progress"
                )
              ),
              simStampsFromPurchase === 0 &&
                React.createElement(
                  "p",
                  { className: "text-[10px] text-slate-500" },
                  `Needs ₹${simRupeePerStamp} to earn 1 stamp. Points accumulate until threshold.`
                )
            ),

            // Reward summary
            React.createElement(
              "div",
              {
                className:
                  "rounded-xl border border-border bg-gradient-to-r from-amber-50 to-orange-50 p-3 space-y-1",
              },
              React.createElement(
                "p",
                { className: "text-[10px] font-black text-amber-700 uppercase tracking-wider" },
                "Reward Summary"
              ),
              React.createElement(
                "p",
                { className: "text-xs font-semibold text-slate-700" },
                `Collect ${reqStamps} stamps → Earn "${settingsForm.rewardName || "Reward"}"`
              ),
              React.createElement(
                "p",
                { className: "text-[11px] text-slate-500" },
                `Approx. ₹${simTotalSpendForReward.toLocaleString("en-IN")} total spend to unlock`
              )
            )
          )
        ),

        // Customer Card Preview
        React.createElement(
          Card,
          { className: "border border-border/70 shadow-sm overflow-hidden" },
          React.createElement(
            CardHeader,
            { className: "pb-2 bg-slate-50/50 border-b border-border" },
            React.createElement(
              "div",
              { className: "flex items-center gap-2" },
              React.createElement(
                "div",
                {
                  className:
                    "h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-indigo-100 flex items-center justify-center font-bold text-primary border border-border text-xs",
                },
                (user?.name || "B")[0]
              ),
              React.createElement(
                "div",
                null,
                React.createElement(
                  "p",
                  { className: "text-xs font-bold text-foreground" },
                  settingsForm.programName || "Your Business"
                ),
                React.createElement(
                  "div",
                  { className: "flex items-center gap-1" },
                  React.createElement(
                    "span",
                    {
                      className:
                        "text-[9px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full uppercase",
                    },
                    "● Active"
                  ),
                  React.createElement(
                    "span",
                    {
                      className:
                        "text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full border border-border",
                    },
                    "Stamp Program"
                  )
                )
              )
            )
          ),
          React.createElement(
            CardContent,
            { className: "p-4 space-y-3" },

            // Program header
            React.createElement(
              "div",
              { className: "flex items-center justify-between" },
              React.createElement(
                "div",
                { className: "flex items-center gap-1.5" },
                React.createElement(Coffee, { className: "h-4 w-4 text-[#800020]" }),
                React.createElement(
                  "span",
                  { className: "text-sm font-extrabold text-[#800020]" },
                  settingsForm.programName || "Program Name"
                )
              ),
              React.createElement(
                "span",
                {
                  className:
                    "text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border font-medium flex items-center gap-1",
                },
                React.createElement(Gift, { className: "h-2.5 w-2.5" }),
                settingsForm.rewardName || "Reward"
              )
            ),

            // Stamps preview (first 7 or reqStamps)
            React.createElement(
              "div",
              { className: "space-y-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100" },
              React.createElement(
                "div",
                { className: "flex justify-between items-center text-xs" },
                React.createElement(
                  "span",
                  { className: "text-slate-600 font-medium" },
                  "Stamps: ",
                  React.createElement("strong", { className: "text-primary" }, "3"),
                  " / ",
                  reqStamps
                ),
                React.createElement(
                  "span",
                  { className: "text-[10px] text-muted-foreground flex items-center gap-1" },
                  React.createElement(Clock, { className: "h-3 w-3" }),
                  `${settingsForm.validityDays} days validity`
                )
              ),
              React.createElement(
                "div",
                { className: "flex flex-wrap gap-1.5" },
                Array.from({ length: Math.min(reqStamps, 12) }).map((_, i) =>
                  React.createElement(StampDot, { key: i, filled: i < 3 })
                ),
                reqStamps > 12 &&
                  React.createElement(
                    "div",
                    { className: "text-[10px] text-muted-foreground self-center pl-1" },
                    `+${reqStamps - 12} more`
                  )
              )
            ),

            // Points preview
            React.createElement(
              "div",
              { className: "space-y-1.5 text-xs font-semibold text-slate-700 mt-2" },
              React.createElement(
                "div",
                { className: "flex justify-between items-center" },
                React.createElement("span", { className: "text-muted-foreground" }, "Total Points Earned:"),
                React.createElement("span", { className: "text-slate-800 font-bold" }, "230 pts")
              ),
              React.createElement(
                "div",
                { className: "flex justify-between items-center bg-amber-50/40 px-2 py-0.5 rounded border border-amber-100/50" },
                React.createElement("span", { className: "text-slate-500 font-semibold flex items-center gap-1" }, "Extra Points Balance:"),
                React.createElement("span", { className: "font-black text-amber-600" }, "45 pts")
              )
            ),

            // Redeem button
            React.createElement(
              "div",
              {
                className:
                  "w-full rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-xs font-bold py-2.5 text-center",
              },
              `Collect ${reqStamps - 3} more stamps to redeem`
            ),

            React.createElement(
              "div",
              { className: "text-center" },
              React.createElement(
                "p",
                { className: "text-[10px] text-muted-foreground italic" },
                "↑ Customer dashboard preview"
              )
            )
          )
        )
      )
    ),

    // ── Success Banner ───────────────────────────────────────────────────────
    saved &&
      React.createElement(
        "div",
        {
          className:
            "flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 font-medium",
        },
        React.createElement(CheckCircle2, { className: "h-5 w-5 text-emerald-600 shrink-0" }),
        React.createElement(
          "div",
          null,
          React.createElement("strong", null, "Program saved successfully! "),
          "Customers can now start earning stamps when you approve their purchases in the Loyalty Approvals section."
        )
      )
  );
}

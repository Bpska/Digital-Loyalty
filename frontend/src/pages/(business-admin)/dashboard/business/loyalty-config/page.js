import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Star, ChevronUp, ChevronDown, Award, Info, Settings } from "lucide-react";

const PRESET_LEVELS = [
  { name: "Bronze", description: "Entry-level visit", points: 1, color: "#CD7F32" },
  { name: "Silver", description: "Regular customer", points: 2, color: "#A8A9AD" },
  { name: "Gold", description: "Loyal customer", points: 5, color: "#FFD700" },
  { name: "Platinum", description: "VIP customer", points: 10, color: "#E5E4E2" },
];

function getLevelColor(name) {
  const n = name?.toLowerCase();
  if (n?.includes("bronze")) return "#CD7F32";
  if (n?.includes("silver")) return "#A8A9AD";
  if (n?.includes("gold")) return "#FFD700";
  if (n?.includes("platinum")) return "#E5E4E2";
  return "#6366f1";
}

export default function BusinessLoyaltyConfigPage() {
  const { user } = useAuthStore();
  const businessId = user?.businessId;
  const queryClient = useQueryClient();

  const [showDialog, setShowDialog] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", points: "", sortOrder: "0" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    programName: "",
    pointsPerRupee: "0.1",
    pointsPerStamp: "50",
    requiredStamps: "7",
    rewardName: "",
    validityDays: "30",
  });

  const { data: levels = [], isLoading } = useQuery({
    queryKey: ["loyaltyLevels", businessId],
    queryFn: () => api.get(`/loyalty-approval/levels/${businessId}`).then(r => r.data),
    enabled: !!businessId && businessId !== "null" && businessId !== "undefined",
  });

  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["loyaltySettings", businessId],
    queryFn: () => api.get(`/loyalty-approval/settings/${businessId}`).then(r => r.data),
    enabled: !!businessId && businessId !== "null" && businessId !== "undefined",
  });

  React.useEffect(() => {
    if (settings) {
      setSettingsForm({
        programName: settings.programName || "Coffee Rewards",
        pointsPerRupee: String(settings.pointsPerRupee ?? 0.1),
        pointsPerStamp: String(settings.pointsPerStamp ?? 50),
        requiredStamps: String(settings.requiredStamps ?? 7),
        rewardName: settings.rewardName || "Free Coffee",
        validityDays: String(settings.validityDays ?? 30),
      });
    }
  }, [settings]);

  const createMutation = useMutation({
    mutationFn: (data) => api.post("/loyalty-approval/levels", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyaltyLevels", businessId] });
      closeDialog();
    },
    onError: (err) => setError(err.message || "Failed to save level"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.patch(`/loyalty-approval/levels/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyaltyLevels", businessId] });
      closeDialog();
    },
    onError: (err) => setError(err.message || "Failed to update level"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/loyalty-approval/levels/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyaltyLevels", businessId] });
      setDeleteConfirm(null);
    },
    onError: (err) => alert(err.message || "Failed to delete level"),
  });

  const reorderMutation = useMutation({
    mutationFn: ({ id, sortOrder }) => api.patch(`/loyalty-approval/levels/${id}`, { sortOrder }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["loyaltyLevels", businessId] }),
  });

  const saveSettingsMutation = useMutation({
    mutationFn: (data) => api.post(`/loyalty-approval/settings/${businessId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyaltySettings", businessId] });
      alert("Settings saved successfully!");
    },
    onError: (err) => alert(err.message || "Failed to save settings"),
  });

  function openCreate() {
    setEditingLevel(null);
    setForm({ name: "", description: "", points: "", sortOrder: String(levels.length) });
    setError(null);
    setShowDialog(true);
  }

  function openEdit(level) {
    setEditingLevel(level);
    setForm({
      name: level.name,
      description: level.description || "",
      points: String(level.points),
      sortOrder: String(level.sortOrder),
    });
    setError(null);
    setShowDialog(true);
  }

  function closeDialog() {
    setShowDialog(false);
    setEditingLevel(null);
    setError(null);
  }

  async function handleSave(e) {
    e.preventDefault();
    setError(null);
    const pts = parseInt(form.points, 10);
    if (!form.name.trim()) { setError("Level name is required"); return; }
    if (isNaN(pts) || pts < 1) { setError("Points must be at least 1"); return; }

    const payload = {
      businessId,
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      points: pts,
      sortOrder: parseInt(form.sortOrder, 10) || 0,
    };

    if (editingLevel) {
      updateMutation.mutate({ id: editingLevel.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  function handleSaveSettings(e) {
    e.preventDefault();
    const ppr = parseFloat(settingsForm.pointsPerRupee);
    const pps = parseInt(settingsForm.pointsPerStamp, 10);
    const rs = parseInt(settingsForm.requiredStamps, 10);
    const vd = parseInt(settingsForm.validityDays, 10);

    if (!settingsForm.programName.trim()) { alert("Program name is required"); return; }
    if (isNaN(ppr) || ppr <= 0) { alert("Points per ₹ must be a positive number"); return; }
    if (isNaN(pps) || pps <= 0) { alert("Points per stamp must be a positive integer"); return; }
    if (isNaN(rs) || rs <= 0) { alert("Required stamps must be a positive integer"); return; }
    if (!settingsForm.rewardName.trim()) { alert("Reward name is required"); return; }
    if (isNaN(vd) || vd <= 0) { alert("Validity must be a positive integer"); return; }

    saveSettingsMutation.mutate({
      programName: settingsForm.programName.trim(),
      pointsPerRupee: ppr,
      pointsPerStamp: pps,
      requiredStamps: rs,
      rewardName: settingsForm.rewardName.trim(),
      validityDays: vd,
    });
  }

  async function applyPreset(preset, idx) {
    createMutation.mutate({
      businessId,
      name: preset.name,
      description: preset.description,
      points: preset.points,
      sortOrder: idx,
    });
  }

  function moveLevel(level, direction) {
    const sorted = [...levels].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex(l => l.id === level.id);
    const target = direction === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= sorted.length) return;

    const targetLevel = sorted[target];
    reorderMutation.mutate({ id: level.id, sortOrder: targetLevel.sortOrder });
    reorderMutation.mutate({ id: targetLevel.id, sortOrder: level.sortOrder });
  }

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    React.createElement("div", { className: "space-y-6 max-w-2xl" },

      /* Header */
      React.createElement("div", { className: "flex items-center justify-between" },
        React.createElement("div", null,
          React.createElement("h1", { className: "text-2xl font-bold text-foreground" }, "Loyalty Configuration"),
          React.createElement("p", { className: "text-sm text-muted-foreground mt-0.5" },
            "Configure your hybrid points-to-stamps settings or define custom levels."
          )
        ),
        React.createElement(Button, {
          className: "bg-primary text-primary-foreground hover:bg-primary/90",
          onClick: openCreate,
          disabled: isMutating,
        },
          React.createElement(Plus, { className: "mr-2 h-4 w-4" }), "Add Level"
        )
      ),

      /* Info Banner */
      React.createElement("div", { className: "flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800" },
        React.createElement(Info, { className: "h-4 w-4 mt-0.5 shrink-0 text-blue-600" }),
        React.createElement("div", null,
          React.createElement("p", { className: "font-semibold" }, "How this works"),
          React.createElement("p", { className: "text-xs mt-0.5 text-blue-700" },
            "When a customer scans your QR code, a loyalty request is created. You can approve it using the hybrid program where points and stamps are automatically calculated based on purchase values, or award custom points based on levels."
          )
        )
      ),

      /* Loyalty Program Settings Card */
      React.createElement(Card, { className: "border border-border/70 shadow-sm" },
        React.createElement(CardHeader, null,
          React.createElement(CardTitle, { className: "flex items-center gap-2 text-foreground font-bold" },
            React.createElement(Settings, { className: "h-5 w-5 text-primary" }), "Loyalty Program Settings"
          ),
          React.createElement(CardDescription, null,
            "Configure the Point conversion, Stamp conversion, and Rewards for your customers."
          )
        ),
        React.createElement(CardContent, null,
          React.createElement("form", { onSubmit: handleSaveSettings, className: "space-y-4" },
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
              React.createElement("div", { className: "space-y-1.5" },
                React.createElement(Label, { htmlFor: "prog-name" }, "Program Name"),
                React.createElement(Input, {
                  id: "prog-name",
                  placeholder: "e.g. Coffee Rewards",
                  value: settingsForm.programName,
                  onChange: (e) => setSettingsForm(f => ({ ...f, programName: e.target.value })),
                })
              ),
              React.createElement("div", { className: "space-y-1.5" },
                React.createElement(Label, { htmlFor: "reward-name" }, "Reward Name"),
                React.createElement(Input, {
                  id: "reward-name",
                  placeholder: "e.g. Free Coffee",
                  value: settingsForm.rewardName,
                  onChange: (e) => setSettingsForm(f => ({ ...f, rewardName: e.target.value })),
                })
              ),
              React.createElement("div", { className: "space-y-1.5" },
                React.createElement(Label, { htmlFor: "pts-per-rupee" }, "Points Per ₹"),
                React.createElement(Input, {
                  id: "pts-per-rupee",
                  type: "number",
                  step: "any",
                  placeholder: "e.g. 0.1 for ₹10 = 1 Point",
                  value: settingsForm.pointsPerRupee,
                  onChange: (e) => setSettingsForm(f => ({ ...f, pointsPerRupee: e.target.value })),
                })
              ),
              React.createElement("div", { className: "space-y-1.5" },
                React.createElement(Label, { htmlFor: "pts-per-stamp" }, "Points Per Stamp"),
                React.createElement(Input, {
                  id: "pts-per-stamp",
                  type: "number",
                  placeholder: "e.g. 50",
                  value: settingsForm.pointsPerStamp,
                  onChange: (e) => setSettingsForm(f => ({ ...f, pointsPerStamp: e.target.value })),
                })
              ),
              React.createElement("div", { className: "space-y-1.5" },
                React.createElement(Label, { htmlFor: "req-stamps" }, "Required Stamps for Reward"),
                React.createElement(Input, {
                  id: "req-stamps",
                  type: "number",
                  placeholder: "e.g. 7",
                  value: settingsForm.requiredStamps,
                  onChange: (e) => setSettingsForm(f => ({ ...f, requiredStamps: e.target.value })),
                })
              ),
              React.createElement("div", { className: "space-y-1.5" },
                React.createElement(Label, { htmlFor: "validity-days" }, "Reward Validity (Days)"),
                React.createElement(Input, {
                  id: "validity-days",
                  type: "number",
                  placeholder: "e.g. 30",
                  value: settingsForm.validityDays,
                  onChange: (e) => setSettingsForm(f => ({ ...f, validityDays: e.target.value })),
                })
              )
            ),
            React.createElement("div", { className: "flex justify-end pt-2" },
              React.createElement(Button, {
                type: "submit",
                disabled: saveSettingsMutation.isPending,
                className: "bg-primary text-primary-foreground font-bold"
              },
                saveSettingsMutation.isPending ? React.createElement(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
                "Save Program Settings"
              )
            )
          )
        )
      ),

      /* Custom Levels Header */
      React.createElement("div", { className: "border-t border-border pt-6" },
        React.createElement("h2", { className: "text-lg font-bold text-foreground" }, "Custom Loyalty Tiers")
      ),

      /* Quick-Start Presets (shown only when empty) */
      levels.length === 0 && !isLoading && (
        React.createElement(Card, { className: "border-dashed border-2 border-border/60" },
          React.createElement(CardHeader, { className: "pb-2" },
            React.createElement(CardTitle, { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider" }, "Quick Start — Add Preset Levels")
          ),
          React.createElement(CardContent, null,
            React.createElement("p", { className: "text-xs text-muted-foreground mb-4" },
              "No levels configured yet. Add presets with one click or create your own above."
            ),
            React.createElement("div", { className: "grid grid-cols-2 gap-3" },
              PRESET_LEVELS.map((preset, idx) =>
                React.createElement("button", {
                  key: preset.name,
                  className: "flex items-center gap-3 rounded-xl border border-border bg-card hover:bg-muted/50 p-3 text-left transition-colors text-sm",
                  onClick: () => applyPreset(preset, idx),
                  disabled: isMutating,
                },
                  React.createElement("div", {
                    className: "h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0",
                    style: { backgroundColor: preset.color }
                  },
                    React.createElement(Star, { className: "h-4 w-4" })
                  ),
                  React.createElement("div", null,
                    React.createElement("p", { className: "font-bold text-foreground" }, preset.name),
                    React.createElement("p", { className: "text-[11px] text-muted-foreground" }, `+${preset.points} point${preset.points !== 1 ? "s" : ""}`)
                  )
                )
              )
            )
          )
        )
      ),

      /* Loading */
      isLoading && (
        React.createElement("div", { className: "flex items-center justify-center py-12" },
          React.createElement(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" })
        )
      ),

      /* Levels List */
      !isLoading && levels.length > 0 && (
        React.createElement("div", { className: "space-y-3" },
          React.createElement("p", { className: "text-xs text-muted-foreground font-semibold uppercase tracking-wider" },
            `${levels.length} Level${levels.length !== 1 ? "s" : ""} Configured`
          ),
          [...levels]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((level, idx, arr) =>
              React.createElement(Card, { key: level.id, className: "border border-border/70 hover:border-border transition-colors" },
                React.createElement(CardContent, { className: "flex items-center gap-4 p-4" },

                  /* Color dot */
                  React.createElement("div", {
                    className: "h-10 w-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm",
                    style: { backgroundColor: getLevelColor(level.name) }
                  },
                    React.createElement(Award, { className: "h-5 w-5" })
                  ),

                  /* Info */
                  React.createElement("div", { className: "flex-1 min-w-0" },
                    React.createElement("p", { className: "font-bold text-foreground text-sm" }, level.name),
                    level.description && (
                      React.createElement("p", { className: "text-xs text-muted-foreground truncate" }, level.description)
                    ),
                    React.createElement("div", { className: "mt-1" },
                      React.createElement("span", { className: "inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary" },
                        `+${level.points} pt${level.points !== 1 ? "s" : ""}`
                      )
                    )
                  ),

                  /* Reorder */
                  React.createElement("div", { className: "flex flex-col gap-0.5" },
                    React.createElement("button", {
                      className: "h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30",
                      onClick: () => moveLevel(level, "up"),
                      disabled: idx === 0,
                    }, React.createElement(ChevronUp, { className: "h-4 w-4" })),
                    React.createElement("button", {
                      className: "h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30",
                      onClick: () => moveLevel(level, "down"),
                      disabled: idx === arr.length - 1,
                    }, React.createElement(ChevronDown, { className: "h-4 w-4" }))
                  ),

                  /* Actions */
                  React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement(Button, {
                      variant: "outline", size: "sm",
                      className: "h-8 w-8 p-0",
                      onClick: () => openEdit(level),
                    }, React.createElement(Pencil, { className: "h-3.5 w-3.5" })),
                    React.createElement(Button, {
                      variant: "outline", size: "sm",
                      className: "h-8 w-8 p-0 text-destructive border-destructive/30 hover:bg-destructive/10",
                      onClick: () => setDeleteConfirm(level),
                    }, React.createElement(Trash2, { className: "h-3.5 w-3.5" }))
                  )
                )
              )
            )
        )
      ),

      /* Create / Edit Dialog */
      React.createElement(Dialog, { open: showDialog, onOpenChange: (open) => !open && closeDialog() },
        React.createElement(DialogContent, { className: "sm:max-w-[420px]" },
          React.createElement(DialogHeader, null,
            React.createElement(DialogTitle, null, editingLevel ? "Edit Loyalty Level" : "Create Loyalty Level"),
            React.createElement(DialogDescription, null,
              "Define the level name, description, and how many points customers earn."
            )
          ),
          React.createElement("form", { onSubmit: handleSave, className: "space-y-4 pt-2" },
            React.createElement("div", { className: "space-y-1.5" },
              React.createElement(Label, { htmlFor: "lvl-name" }, "Level Name *"),
              React.createElement(Input, {
                id: "lvl-name",
                placeholder: "e.g. Gold, Silver, VIP",
                value: form.name,
                onChange: (e) => setForm(f => ({ ...f, name: e.target.value })),
                maxLength: 50,
              })
            ),
            React.createElement("div", { className: "space-y-1.5" },
              React.createElement(Label, { htmlFor: "lvl-desc" }, "Description"),
              React.createElement(Input, {
                id: "lvl-desc",
                placeholder: "e.g. Loyal customer, Regular buyer",
                value: form.description,
                onChange: (e) => setForm(f => ({ ...f, description: e.target.value })),
                maxLength: 200,
              })
            ),
            React.createElement("div", { className: "space-y-1.5" },
              React.createElement(Label, { htmlFor: "lvl-points" }, "Points Awarded *"),
              React.createElement(Input, {
                id: "lvl-points",
                type: "number",
                min: "1",
                max: "10000",
                placeholder: "e.g. 5",
                value: form.points,
                onChange: (e) => setForm(f => ({ ...f, points: e.target.value })),
              })
            ),
            error && (
              React.createElement("p", { className: "text-xs text-destructive font-medium" }, error)
            ),
            React.createElement(DialogFooter, { className: "pt-2" },
              React.createElement(Button, { type: "button", variant: "outline", onClick: closeDialog, disabled: isMutating }, "Cancel"),
              React.createElement(Button, { type: "submit", disabled: isMutating },
                isMutating ? React.createElement(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
                editingLevel ? "Save Changes" : "Create Level"
              )
            )
          )
        )
      ),

      /* Delete Confirm Dialog */
      React.createElement(Dialog, { open: !!deleteConfirm, onOpenChange: (open) => !open && setDeleteConfirm(null) },
        React.createElement(DialogContent, { className: "sm:max-w-[380px]" },
          React.createElement(DialogHeader, null,
            React.createElement(DialogTitle, null, "Delete Loyalty Level"),
            React.createElement(DialogDescription, null,
              `Are you sure you want to delete "${deleteConfirm?.name}"? This cannot be undone.`
            )
          ),
          React.createElement(DialogFooter, { className: "pt-4" },
            React.createElement(Button, { variant: "outline", onClick: () => setDeleteConfirm(null) }, "Cancel"),
            React.createElement(Button, {
              className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
              onClick: () => deleteMutation.mutate(deleteConfirm.id),
              disabled: deleteMutation.isPending,
            },
              deleteMutation.isPending ? React.createElement(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
              "Delete"
            )
          )
        )
      )
    )
  );
}

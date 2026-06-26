import { useNavigate } from "react-router-dom";
const _jsxFileName = "src\\pages\\(business-admin)\\dashboard\\business\\loyalty\\page.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }"use client";

import React, { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings, Plus, Star, ToggleLeft, ToggleRight, Loader2, Award, Zap, } from "lucide-react";





















export default function LoyaltyPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const businessId = _optionalChain([user, 'optionalAccess', _ => _.businessId]);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Form states
  const [type, setType] = useState("VISIT_BASED");
  const [threshold, setThreshold] = useState("");
  const [pointsPerVisit, setPointsPerVisit] = useState("10");
  const [pointsPerSpendUnit, setPointsPerSpendUnit] = useState("1");
  const [resetMode, setResetMode] = useState("FULL_RESET");
  const [rewardId, setRewardId] = useState("");

  // 1. Fetch loyalty programs
  const { data: programs = [], isLoading: programsLoading } = useQuery({
    queryKey: ["businessLoyalty", businessId],
    queryFn: () => api.get(`/loyalty/business/${businessId}`).then((res) => res.data),
    enabled: !!businessId && businessId !== "null" && businessId !== "undefined",
  });

  // 2. Fetch rewards for selector
  const { data: rewards = [], isLoading: rewardsLoading } = useQuery({
    queryKey: ["businessRewards", businessId],
    queryFn: () => api.get(`/rewards/business/${businessId}`).then((res) => res.data),
    enabled: !!businessId && businessId !== "null" && businessId !== "undefined",
  });

  const activeRewards = rewards.filter((r) => r.isActive);

  // 3. Create loyalty program mutation
  const createMutation = useMutation({
    mutationFn: (data) => api.post("/loyalty", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessLoyalty", businessId] });
      setShowAddModal(false);
      resetForm();
    },
    onError: (err) => {
      setErrorMsg(err.message || "Failed to save loyalty program.");
    }
  });

  // 3.5. Update loyalty program mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.patch(`/loyalty/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessLoyalty", businessId] });
      setShowEditModal(false);
      resetForm();
    },
    onError: (err) => {
      setErrorMsg(err.message || "Failed to update loyalty program.");
    }
  });

  // 4. Toggle loyalty program active / inactive
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => api.patch(`/loyalty/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessLoyalty", businessId] });
    }
  });

  // 5. Delete loyalty program mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/loyalty/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessLoyalty", businessId] });
    },
    onError: (err) => {
      setErrorMsg(err.message || "Failed to delete loyalty rule.");
    }
  });

  const handleCreateProgram = (e) => {
    e.preventDefault();
    setErrorMsg(null);

    // --- Client-side validation ---
    const parsedThreshold = parseInt(threshold);
    if (!threshold || isNaN(parsedThreshold) || parsedThreshold <= 0) {
      setErrorMsg("Please enter a valid target number (e.g. 10 visits or 500 points).");
      return;
    }

    if (!rewardId) {
      setErrorMsg("Please select a Reward Voucher to link with this loyalty rule.");
      return;
    }

    let parsedPointsPerVisit = undefined;
    let parsedPointsPerSpendUnit = undefined;
    if (type === "POINTS_BASED") {
      parsedPointsPerVisit = parseInt(pointsPerVisit);
      if (isNaN(parsedPointsPerVisit) || parsedPointsPerVisit <= 0) {
        setErrorMsg("Please enter a valid points-per-visit value (e.g. 10).");
        return;
      }
    } else if (type === "SPEND_BASED") {
      parsedPointsPerSpendUnit = parseFloat(pointsPerSpendUnit);
      if (isNaN(parsedPointsPerSpendUnit) || parsedPointsPerSpendUnit <= 0) {
        setErrorMsg("Please enter a valid points-per-spend-unit value (e.g. 1).");
        return;
      }
    }

    createMutation.mutate({
      businessId,
      type,
      threshold: parsedThreshold,
      pointsPerVisit: parsedPointsPerVisit,
      pointsPerSpendUnit: parsedPointsPerSpendUnit,
      resetMode,
      rewardId,
    });
  };

  const handleEditProgram = (e) => {
    e.preventDefault();
    if (!selectedProgram) return;
    setErrorMsg(null);

    const parsedThreshold = parseInt(threshold);
    if (!threshold || isNaN(parsedThreshold) || parsedThreshold <= 0) {
      setErrorMsg("Please enter a valid target number.");
      return;
    }

    if (!rewardId) {
      setErrorMsg("Please select a Reward Voucher.");
      return;
    }

    let parsedPointsPerVisit = undefined;
    let parsedPointsPerSpendUnit = undefined;
    if (type === "POINTS_BASED") {
      parsedPointsPerVisit = parseInt(pointsPerVisit);
      if (isNaN(parsedPointsPerVisit) || parsedPointsPerVisit <= 0) {
        setErrorMsg("Please enter a valid points-per-visit value.");
        return;
      }
    } else if (type === "SPEND_BASED") {
      parsedPointsPerSpendUnit = parseFloat(pointsPerSpendUnit);
      if (isNaN(parsedPointsPerSpendUnit) || parsedPointsPerSpendUnit <= 0) {
        setErrorMsg("Please enter a valid points-per-spend-unit value.");
        return;
      }
    }

    updateMutation.mutate({
      id: selectedProgram.id,
      data: {
        businessId,
        type,
        threshold: parsedThreshold,
        pointsPerVisit: parsedPointsPerVisit,
        pointsPerSpendUnit: parsedPointsPerSpendUnit,
        resetMode,
        rewardId,
      }
    });
  };

  const handleOpenEdit = (program) => {
    setSelectedProgram(program);
    setType(program.type);
    setThreshold(program.threshold.toString());
    setPointsPerVisit(program.pointsPerVisit ? program.pointsPerVisit.toString() : "10");
    setPointsPerSpendUnit(program.pointsPerSpendUnit ? program.pointsPerSpendUnit.toString() : "1");
    setResetMode(program.resetMode);
    setRewardId(program.rewardId);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setThreshold("");
    setPointsPerVisit("10");
    setPointsPerSpendUnit("1");
    setResetMode("FULL_RESET");
    setRewardId("");
    setSelectedProgram(null);
    setErrorMsg(null);
  };

  const loading = programsLoading || rewardsLoading;

  if (loading) {
    return (
      React.createElement('div', { className: "space-y-4 animate-pulse" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 116}}
        , React.createElement('div', { className: "h-10 w-48 rounded bg-slate-100"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 117}} )
        , React.createElement('div', { className: "h-36 w-full rounded-xl bg-slate-100"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 118}} )
        , React.createElement('div', { className: "h-36 w-full rounded-xl bg-slate-100"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 119}} )
      )
    );
  }

  return (
    React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 125}}
      /* Header */
      , React.createElement('div', { className: "flex items-center justify-between"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 127}}
        , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 128}}
          , React.createElement('h1', { className: "text-3xl font-extrabold text-foreground tracking-tight"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 129}}, "Loyalty Rules" )
          , React.createElement('p', { className: "text-xs text-muted-foreground mt-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 130}}, "Setup visit-based stamp cards or points-based reward multipliers"

          )
        )
        , React.createElement(Button, { onClick: () => setShowAddModal(true), className: "bg-primary hover:bg-primary/90 text-primary-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 134}}
          , React.createElement(Plus, { className: "mr-2 h-4 w-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 135}} ), " Create Rule"
        )
      )

      /* Rules list */
      , React.createElement('div', { className: "grid grid-cols-1 gap-6"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 140}}
        , programs.length === 0 ? (
          React.createElement(Card, { className: "border-dashed border-border bg-slate-50/50 py-12 text-center"    , glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 142}}
            , React.createElement(CardContent, { className: "flex flex-col items-center justify-center space-y-3"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 143}}
              , React.createElement(Settings, { className: "h-10 w-10 text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 144}} )
              , React.createElement('p', { className: "text-sm text-muted-foreground font-medium"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 145}}, "No loyalty rules configured yet"    )
              , React.createElement('p', { className: "text-xs text-muted-foreground max-w-sm"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 146}}, "Create a stamp-card or points program rules so users can start checking in at branches!"

              )
              , React.createElement(Button, { size: "sm", onClick: () => setShowAddModal(true), className: "mt-2 text-primary-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 149}}, "Setup Loyalty Rule"

              )
            )
          )
        ) : (
          React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 155}}
            , programs.map((program) => {
              const isVisit = program.type === "VISIT_BASED";
              return (
                React.createElement(Card, { key: program.id, className: `glass ${
                  !program.isActive && "opacity-60"
                }`, glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 159}}
                  , React.createElement(CardHeader, { className: "p-6 pb-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 162}}
                    , React.createElement(CardTitle, { className: "text-base font-bold text-foreground flex items-center gap-2"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 163}}
                      , isVisit ? React.createElement(Star, { className: "h-5 w-5 text-amber-500"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 164}} ) : React.createElement(Zap, { className: "h-5 w-5 text-primary"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 164}} )
                      , isVisit ? "Visit Stamp Card" : program.type === "SPEND_BASED" ? "Spend-Based Points Program" : "Points Accrual Program"
                      , React.createElement('span', { className: `text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ml-auto border ${
                        program.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-600 border-slate-200"
                      }`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 166}}
                        , program.isActive ? "Active" : "Archived"
                      )
                    )
                    , React.createElement(CardDescription, { className: "text-xs mt-1 text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 172}}, "Rule ID: "
                        , program.id
                    )
                  )
                  , React.createElement(CardContent, { className: "p-6 space-y-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 176}}
                    /* Stats rows */
                    , React.createElement('div', { className: "grid grid-cols-2 gap-4 text-xs"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 178}}
                      , React.createElement('div', { className: "bg-slate-50 p-3 rounded-lg border border-border space-y-0.5"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 180}}
                        , React.createElement('span', { className: "text-muted-foreground block uppercase tracking-wider text-[9px]"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 181}}, "Requirement")
                        , React.createElement('span', { className: "text-foreground font-extrabold text-sm"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 182}}
                          , isVisit ? `${program.threshold} Visits` : `${program.threshold} Points`
                        )
                      )
                      , React.createElement('div', { className: "bg-slate-50 p-3 rounded-lg border border-border space-y-0.5"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 185}}
                        , React.createElement('span', { className: "text-muted-foreground block uppercase tracking-wider text-[9px]"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 186}}, "Linked Reward" )
                        , React.createElement('span', { className: "text-foreground font-extrabold truncate block"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 187}}
                          , program.reward.title
                        )
                      )
                    )
 
                    , React.createElement('div', { className: "grid grid-cols-2 gap-4 text-[11px] text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 193}}
                      , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 194}}
                        , React.createElement('span', { className: "block", __self: this, __source: {fileName: _jsxFileName, lineNumber: 195}}, "Reset Policy:" )
                        , React.createElement('strong', { className: "text-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 196}}, program.resetMode)
                      )
                      , !isVisit && (
                        React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 199}}
                          , React.createElement('span', { className: "block", __self: this, __source: {fileName: _jsxFileName, lineNumber: 200}}, "Accrual Rate:" )
                          , React.createElement('strong', { className: "text-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 201}}
                            , program.type === "SPEND_BASED"
                              ? `${program.pointsPerSpendUnit} pt${program.pointsPerSpendUnit !== 1 ? 's' : ''} / ₹ spent`
                              : `+${program.pointsPerVisit} pts / visit`
                          )
                        )
                      )
                    )

                    , React.createElement('div', { className: "pt-2 border-t border-border flex justify-between items-center gap-2 w-full"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 207}}
                      , React.createElement(Button, { 
                        variant: "ghost", 
                        size: "sm", 
                        className: "text-xs text-muted-foreground hover:text-foreground"  ,
                        onClick: () => handleOpenEdit(program), __self: this, __source: {fileName: _jsxFileName, lineNumber: 208}}
                        , "Configure Details"
                      )
                      , program.isActive ? (
                        React.createElement(Button, { 
                          variant: "ghost", 
                          size: "sm", 
                          className: "text-xs text-muted-foreground hover:text-foreground"  ,
                          onClick: () => toggleActiveMutation.mutate({ id: program.id, isActive: false }),
                          disabled: toggleActiveMutation.isPending, __self: this, __source: {fileName: _jsxFileName, lineNumber: 208}}

                          , React.createElement(ToggleRight, { className: "mr-1.5 h-4.5 w-4.5 text-primary"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 215}} ), " Deactivate"
                        )
                      ) : (
                        React.createElement(Button, { 
                          variant: "ghost", 
                          size: "sm", 
                          className: "text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"  ,
                          onClick: () => toggleActiveMutation.mutate({ id: program.id, isActive: true }),
                          disabled: toggleActiveMutation.isPending, __self: this, __source: {fileName: _jsxFileName, lineNumber: 208}}

                          , React.createElement(ToggleLeft, { className: "mr-1.5 h-4.5 w-4.5 text-muted-foreground"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 215}} ), " Activate"
                        )
                      )
                      , React.createElement(Button, { 
                        variant: "ghost", 
                        size: "sm", 
                        className: "text-xs text-destructive hover:text-destructive hover:bg-destructive/10"  ,
                        onClick: () => {
                          if (window.confirm("Are you sure you want to permanently delete this loyalty rule?")) {
                            deleteMutation.mutate(program.id);
                          }
                        },
                        disabled: deleteMutation.isPending, __self: this, __source: {fileName: _jsxFileName, lineNumber: 208}}
                        , "Delete"
                      )
                    )
                  )
                )
              );
            })
          )
        )
      )

      /* Add Program Modal */
      , showAddModal && (
        React.createElement(Dialog, { open: showAddModal, onOpenChange: (open) => !open && setShowAddModal(false), __self: this, __source: {fileName: _jsxFileName, lineNumber: 229}}
          , React.createElement(DialogContent, { className: "max-w-[420px]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 230}}
            , React.createElement(DialogHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 231}}
              , React.createElement(DialogTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 232}}, "Configure Loyalty Rule"  )
              , React.createElement(DialogDescription, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 233}}, "Create visit thresholds or points goals. Creating an active rule will auto-archive the previous rule of the same type."

              )
            )

            , errorMsg && (
              React.createElement('div', { className: "bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-xs text-destructive text-center"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 239}}
                , errorMsg
              )
            )

            , activeRewards.length === 0 ? (
              React.createElement('div', { className: "space-y-4 py-4 text-center"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 245}}
                , React.createElement('div', { className: "bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-800 flex flex-col items-center justify-center gap-2"           , __self: this, __source: {fileName: _jsxFileName, lineNumber: 246}}
                  , React.createElement(Award, { className: "h-7 w-7 text-amber-500"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 247}} )
                  , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 248}}, "No active rewards found! You must create at least one Reward Voucher in your business catalog before setting up a loyalty rule."                     )
                )
                , React.createElement(Button, { className: "w-full bg-primary" , onClick: () => navigate("/dashboard/business/rewards"), __self: this, __source: {fileName: _jsxFileName, lineNumber: 250}}, "Create a Reward"

                )
              )
            ) : (
              React.createElement('form', { onSubmit: handleCreateProgram, className: "space-y-4 py-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 255}}
                , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 256}}
                  , React.createElement(Label, { htmlFor: "program-type", __self: this, __source: {fileName: _jsxFileName, lineNumber: 257}}, "Rule Type" )
                  , React.createElement(Select, { onValueChange: (val) => setType(val), defaultValue: type, __self: this, __source: {fileName: _jsxFileName, lineNumber: 258}}
                    , React.createElement(SelectTrigger, { className: "w-full bg-background border-border"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 259}}
                      , React.createElement(SelectValue, { placeholder: "Select type" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 260}} )
                    )
                    , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 262}}
                      , React.createElement(SelectItem, { value: "VISIT_BASED", __self: this, __source: {fileName: _jsxFileName, lineNumber: 263}}, "Visit Stamp Card (Stamp grids)"    )
                      , React.createElement(SelectItem, { value: "POINTS_BASED", __self: this, __source: {fileName: _jsxFileName, lineNumber: 264}}, "Points Goal Card (Progress bar)"    )
                      , React.createElement(SelectItem, { value: "SPEND_BASED", __self: this, __source: {fileName: _jsxFileName, lineNumber: 265}}, "Spend-Based Points (Progress bar)"  )
                    )
                  )
                )

                , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 269}}
                  , React.createElement(Label, { htmlFor: "program-thresh", __self: this, __source: {fileName: _jsxFileName, lineNumber: 270}}
                    , type === "VISIT_BASED" ? "Target Visits Required" : "Target Points Goal"
                  )
                  , React.createElement(Input, { 
                    id: "program-thresh", 
                    type: "number",
                    placeholder: type === "VISIT_BASED" ? "e.g. 10 visits" : "e.g. 500 points", 
                    value: threshold,
                    onChange: (e) => setThreshold(e.target.value),
                    required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 273}} 
                  )
                )
 
                , type === "POINTS_BASED" && (
                  React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 284}}
                    , React.createElement(Label, { htmlFor: "program-ppv", __self: this, __source: {fileName: _jsxFileName, lineNumber: 285}}, "Points Awarded Per Visit"   )
                    , React.createElement(Input, { 
                      id: "program-ppv", 
                      type: "number",
                      placeholder: "e.g. 10 points"  , 
                      value: pointsPerVisit,
                      onChange: (e) => setPointsPerVisit(e.target.value),
                      required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 286}} 
                    )
                  )
                )

                , type === "SPEND_BASED" && (
                  React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 284}}
                    , React.createElement(Label, { htmlFor: "program-ppsu", __self: this, __source: {fileName: _jsxFileName, lineNumber: 285}}, "Points Awarded Per ₹ Spent"   )
                    , React.createElement(Input, { 
                      id: "program-ppsu", 
                      type: "number",
                      step: "any",
                      placeholder: "e.g. 1 or 0.1"  , 
                      value: pointsPerSpendUnit,
                      onChange: (e) => setPointsPerSpendUnit(e.target.value),
                      required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 286}} 
                    )
                  )
                )

                , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 297}}
                  , React.createElement(Label, { htmlFor: "program-reset", __self: this, __source: {fileName: _jsxFileName, lineNumber: 298}}, "Reset Policy on Reward Unlock"    )
                  , React.createElement(Select, { onValueChange: (val) => setResetMode(val), defaultValue: resetMode, __self: this, __source: {fileName: _jsxFileName, lineNumber: 299}}
                    , React.createElement(SelectTrigger, { className: "w-full bg-background border-border"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 300}}
                      , React.createElement(SelectValue, { placeholder: "Select reset mode"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 301}} )
                    )
                    , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 303}}
                      , React.createElement(SelectItem, { value: "FULL_RESET", __self: this, __source: {fileName: _jsxFileName, lineNumber: 304}}, "Reset Counter completely to 0"    )
                      , React.createElement(SelectItem, { value: "CARRY_REMAINDER", __self: this, __source: {fileName: _jsxFileName, lineNumber: 305}}, "Carry Over Remainder surplus"   )
                    )
                  )
                )

                , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 310}}
                  , React.createElement(Label, { htmlFor: "program-reward", __self: this, __source: {fileName: _jsxFileName, lineNumber: 311}}, "Linked Reward Gift Voucher"   )
                  , React.createElement(Select, { onValueChange: setRewardId, defaultValue: rewardId, __self: this, __source: {fileName: _jsxFileName, lineNumber: 312}}
                    , React.createElement(SelectTrigger, { className: "w-full bg-background border-border"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 313}}
                      , React.createElement(SelectValue, { placeholder: "Select Reward Voucher"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 314}} )
                    )
                    , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 316}}
                      , activeRewards.map((reward) => (
                        React.createElement(SelectItem, { key: reward.id, value: reward.id, __self: this, __source: {fileName: _jsxFileName, lineNumber: 318}}
                          , reward.title
                        )
                      ))
                    )
                  )
                )

                , React.createElement(DialogFooter, { className: "pt-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 326}}
                  , React.createElement(Button, { type: "button", variant: "outline", onClick: () => setShowAddModal(false), __self: this, __source: {fileName: _jsxFileName, lineNumber: 327}}, "Cancel"

                  )
                  , React.createElement(Button, { type: "submit", className: "bg-primary", disabled: createMutation.isPending, __self: this, __source: {fileName: _jsxFileName, lineNumber: 330}}
                    , createMutation.isPending ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 331}} ) : "Deploy Rule"
                  )
                )
              )
            )
          )
        )
      )
      /* Edit Program Modal */
      , showEditModal && (
        React.createElement(Dialog, { open: showEditModal, onOpenChange: (open) => !open && setShowEditModal(false), __self: this, __source: {fileName: _jsxFileName, lineNumber: 229}}
          , React.createElement(DialogContent, { className: "max-w-[420px]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 230}}
            , React.createElement(DialogHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 231}}
              , React.createElement(DialogTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 232}}, "Configure Loyalty Rule"  )
              , React.createElement(DialogDescription, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 233}}, "Modify target requirements, Linked Reward Voucher, or reset policies."
              )
            )

            , errorMsg && (
              React.createElement('div', { className: "bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-xs text-destructive text-center"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 239}}
                , errorMsg
              )
            )

            , React.createElement('form', { onSubmit: handleEditProgram, className: "space-y-4 py-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 255}}
                , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 256}}
                  , React.createElement(Label, { htmlFor: "edit-program-type", __self: this, __source: {fileName: _jsxFileName, lineNumber: 257}}, "Rule Type" )
                  , React.createElement(Select, { onValueChange: (val) => setType(val), defaultValue: type, value: type, __self: this, __source: {fileName: _jsxFileName, lineNumber: 258}}
                    , React.createElement(SelectTrigger, { className: "w-full bg-background border-border"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 259}}
                      , React.createElement(SelectValue, { placeholder: "Select type" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 260}} )
                    )
                    , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 262}}
                      , React.createElement(SelectItem, { value: "VISIT_BASED", __self: this, __source: {fileName: _jsxFileName, lineNumber: 263}}, "Visit Stamp Card (Stamp grids)"    )
                      , React.createElement(SelectItem, { value: "POINTS_BASED", __self: this, __source: {fileName: _jsxFileName, lineNumber: 264}}, "Points Goal Card (Progress bar)"    )
                      , React.createElement(SelectItem, { value: "SPEND_BASED", __self: this, __source: {fileName: _jsxFileName, lineNumber: 265}}, "Spend-Based Points (Progress bar)"  )
                    )
                  )
                )

                , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 269}}
                  , React.createElement(Label, { htmlFor: "edit-program-thresh", __self: this, __source: {fileName: _jsxFileName, lineNumber: 270}}
                    , type === "VISIT_BASED" ? "Target Visits Required" : "Target Points Goal"
                  )
                  , React.createElement(Input, { 
                    id: "edit-program-thresh", 
                    type: "number",
                    placeholder: type === "VISIT_BASED" ? "e.g. 10 visits" : "e.g. 500 points", 
                    value: threshold,
                    onChange: (e) => setThreshold(e.target.value),
                    required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 273}} 
                  )
                )
 
                , type === "POINTS_BASED" && (
                  React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 284}}
                    , React.createElement(Label, { htmlFor: "edit-program-ppv", __self: this, __source: {fileName: _jsxFileName, lineNumber: 285}}, "Points Awarded Per Visit"   )
                    , React.createElement(Input, { 
                      id: "edit-program-ppv", 
                      type: "number",
                      placeholder: "e.g. 10 points"  , 
                      value: pointsPerVisit,
                      onChange: (e) => setPointsPerVisit(e.target.value),
                      required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 286}} 
                    )
                  )
                )

                , type === "SPEND_BASED" && (
                  React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 284}}
                    , React.createElement(Label, { htmlFor: "edit-program-ppsu", __self: this, __source: {fileName: _jsxFileName, lineNumber: 285}}, "Points Awarded Per ₹ Spent"   )
                    , React.createElement(Input, { 
                      id: "edit-program-ppsu", 
                      type: "number",
                      step: "any",
                      placeholder: "e.g. 1 or 0.1"  , 
                      value: pointsPerSpendUnit,
                      onChange: (e) => setPointsPerSpendUnit(e.target.value),
                      required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 286}} 
                    )
                  )
                )

                , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 297}}
                  , React.createElement(Label, { htmlFor: "edit-program-reset", __self: this, __source: {fileName: _jsxFileName, lineNumber: 298}}, "Reset Policy on Reward Unlock"    )
                  , React.createElement(Select, { onValueChange: (val) => setResetMode(val), defaultValue: resetMode, value: resetMode, __self: this, __source: {fileName: _jsxFileName, lineNumber: 299}}
                    , React.createElement(SelectTrigger, { className: "w-full bg-background border-border"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 300}}
                      , React.createElement(SelectValue, { placeholder: "Select reset mode"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 301}} )
                    )
                    , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 303}}
                      , React.createElement(SelectItem, { value: "FULL_RESET", __self: this, __source: {fileName: _jsxFileName, lineNumber: 304}}, "Reset Counter completely to 0"    )
                      , React.createElement(SelectItem, { value: "CARRY_REMAINDER", __self: this, __source: {fileName: _jsxFileName, lineNumber: 305}}, "Carry Over Remainder surplus"   )
                    )
                  )
                )

                , React.createElement('div', { className: "space-y-1.5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 310}}
                  , React.createElement(Label, { htmlFor: "edit-program-reward", __self: this, __source: {fileName: _jsxFileName, lineNumber: 311}}, "Linked Reward Gift Voucher"   )
                  , React.createElement(Select, { onValueChange: setRewardId, defaultValue: rewardId, value: rewardId, __self: this, __source: {fileName: _jsxFileName, lineNumber: 312}}
                    , React.createElement(SelectTrigger, { className: "w-full bg-background border-border"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 313}}
                      , React.createElement(SelectValue, { placeholder: "Select Reward Voucher"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 314}} )
                    )
                    , React.createElement(SelectContent, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 316}}
                      , rewards.map((reward) => (
                        React.createElement(SelectItem, { key: reward.id, value: reward.id, __self: this, __source: {fileName: _jsxFileName, lineNumber: 318}}
                          , reward.title
                        )
                      ))
                    )
                  )
                )

                , React.createElement(DialogFooter, { className: "pt-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 326}}
                  , React.createElement(Button, { type: "button", variant: "outline", onClick: () => setShowEditModal(false), __self: this, __source: {fileName: _jsxFileName, lineNumber: 327}}, "Cancel"
                  )
                  , React.createElement(Button, { type: "submit", className: "bg-primary", disabled: updateMutation.isPending, __self: this, __source: {fileName: _jsxFileName, lineNumber: 330}}
                    , updateMutation.isPending ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 331}} ) : "Save Changes"
                  )
                )
              )
          )
        )
      )
    )
  );
}

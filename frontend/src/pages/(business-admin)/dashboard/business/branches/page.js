const _jsxFileName = "src\\pages\\(business-admin)\\dashboard\\business\\branches\\page.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } "use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, QrCode, Plus, Download, Loader2, ToggleLeft, ToggleRight, } from "lucide-react";
import BranchMap from "@/components/BranchMap";
















export default function BranchesPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const businessId = _optionalChain([user, 'optionalAccess', _ => _.businessId]);
  const { getPosition, loading: geoLoading } = useGeolocation();

  // Dialog states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBranchCreatedModal, setShowBranchCreatedModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedQrImage, setSelectedQrImage] = useState(null);
  const [selectedQrPayload, setSelectedQrPayload] = useState(null);

  // Form states
  const [editingBranchId, setEditingBranchId] = useState(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radiusMeters, setRadiusMeters] = useState("100");
  const [errorMsg, setErrorMsg] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // 1. Fetch branches list
  const { data: branches = [], isLoading } = useQuery({
    queryKey: ["businessBranches", businessId],
    queryFn: () => api.get(`/branches/business/${businessId}`).then((res) => res.data),
    enabled: !!businessId && businessId !== "null" && businessId !== "undefined",
  });

  // 2. Create branch mutation
  const createMutation = useMutation({
    mutationFn: (data) => api.post(`/branches/business/${businessId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessBranches", businessId] });
      queryClient.invalidateQueries({ queryKey: ["businessProfile", businessId] });
      setShowAddModal(false);
      resetForm();
      setShowBranchCreatedModal(true);
    },
    onError: (err) => {
      setErrorMsg(err.message || "Failed to create branch. Check plan limits.");
    }
  });

  // 3. Toggle active/inactive mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.patch(`/branches/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessBranches", businessId] });
    }
  });

  // Delete branch mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/branches/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessBranches", businessId] });
      queryClient.invalidateQueries({ queryKey: ["businessProfile", businessId] });
    },
    onError: (err) => {
      setErrorMsg(err.message || "Failed to delete branch.");
    }
  });

  // 4. QR Token regeneration is disabled for permanent QR codes.

  // 5. Fetch branch QR image
  const handleShowQr = async (branch) => {
    setSelectedBranch(branch);
    setShowQrModal(true);
    setSelectedQrImage(null);
    setSelectedQrPayload(null);
    try {
      const response = await api.get(`/branches/${branch.id}/qr?format=base64`);
      setSelectedQrImage(response.data.qrImage);
      setSelectedQrPayload(response.data.payload);
    } catch (err) {
      console.error("Failed to load QR image:", err);
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      const coords = await getPosition();
      setLatitude(coords.latitude.toString());
      setLongitude(coords.longitude.toString());
    } catch (err) {
      console.error("GPS fetch error:", err);
    }
  };

  const handleCreateBranch = (e) => {
    e.preventDefault();
    setErrorMsg(null);
    createMutation.mutate({
      name,
      address,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radiusMeters: parseInt(radiusMeters),
    });
  };

  const handleAddBranchClick = () => {
    alert("You cannot create a new branch. Your plan is limited to a single branch.");
  };

  const handleDownloadQr = () => {
    if (!selectedQrImage || !selectedBranch) return;
    const link = document.createElement("a");
    link.href = selectedQrImage;
    link.download = `QR-${selectedBranch.name.replace(/\s+/g, "_")}.png`;
    link.click();
  };

  const handleDownloadPdf = async () => {
    if (!selectedBranch) return;
    setPdfLoading(true);
    try {
      const response = await api.get(`/branches/${selectedBranch.id}/qr?format=pdf`, {
        responseType: "blob",
      });
      const blob = response instanceof Blob ? response : new Blob([response], { type: "application/pdf" });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Poster-${selectedBranch.name.replace(/\s+/g, "_")}.pdf`;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Failed to download PDF:", err);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleOpenEditModal = (branch) => {
    setName(branch.name);
    setAddress(branch.address || "");
    setLatitude(branch.latitude.toString());
    setLongitude(branch.longitude.toString());
    setRadiusMeters(branch.radiusMeters.toString());
    setEditingBranchId(branch.id);
    setErrorMsg(null);
    setShowEditModal(true);
  };

  const handleEditBranch = (e) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!editingBranchId) return;
    updateMutation.mutate({
      id: editingBranchId,
      data: {
        name,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radiusMeters: parseInt(radiusMeters),
      }
    }, {
      onSuccess: () => {
        setShowEditModal(false);
        resetForm();
      },
      onError: (err) => {
        setErrorMsg(err.message || "Failed to update branch.");
      }
    });
  };

  const resetForm = () => {
    setName("");
    setAddress("");
    setLatitude("");
    setLongitude("");
    setRadiusMeters("100");
    setEditingBranchId(null);
    setErrorMsg(null);
  };

  if (isLoading) {
    return (
      React.createElement('div', { className: "space-y-4 animate-pulse", __self: this, __source: { fileName: _jsxFileName, lineNumber: 195 } }
        , React.createElement('div', { className: "h-10 w-48 rounded bg-slate-100", __self: this, __source: { fileName: _jsxFileName, lineNumber: 196 } })
        , React.createElement('div', { className: "h-32 w-full rounded-xl bg-slate-100", __self: this, __source: { fileName: _jsxFileName, lineNumber: 197 } })
        , React.createElement('div', { className: "h-32 w-full rounded-xl bg-slate-100", __self: this, __source: { fileName: _jsxFileName, lineNumber: 198 } })
      )
    );
  }

  return (
    React.createElement('div', { className: "space-y-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 204 } }
      /* Header */
      , React.createElement('div', { className: "flex items-center justify-between", __self: this, __source: { fileName: _jsxFileName, lineNumber: 206 } }
        , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 207 } }
          , React.createElement('h1', { className: "text-3xl font-extrabold text-foreground tracking-tight", __self: this, __source: { fileName: _jsxFileName, lineNumber: 208 } }, "Branches")
          , React.createElement('p', { className: "text-xs text-muted-foreground mt-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 209 } }, "Setup physical store outlets and print static check-in QR codes"

          )
        )
        , React.createElement(Button, { onClick: handleAddBranchClick, className: "bg-primary hover:bg-primary/90 text-primary-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 213 } }
          , React.createElement(Plus, { className: "mr-2 h-4 w-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 214 } }), " Add Branch"
        )
      )

      /* Branches Table List */
      , React.createElement('div', { className: "grid grid-cols-1 gap-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 219 } }
        , branches.length === 0 ? (
          React.createElement(Card, { className: "border-dashed border-border bg-slate-50/50 py-12 text-center", glass: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 221 } }
            , React.createElement(CardContent, { className: "flex flex-col items-center justify-center space-y-3", __self: this, __source: { fileName: _jsxFileName, lineNumber: 222 } }
              , React.createElement(MapPin, { className: "h-10 w-10 text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 223 } })
              , React.createElement('p', { className: "text-sm text-muted-foreground font-medium", __self: this, __source: { fileName: _jsxFileName, lineNumber: 224 } }, "No branches set up yet")
              , React.createElement('p', { className: "text-xs text-muted-foreground max-w-sm", __self: this, __source: { fileName: _jsxFileName, lineNumber: 225 } }, "Add your first physical outlet to generate the counter check-in QR code!"

              )
              , React.createElement(Button, { size: "sm", onClick: handleAddBranchClick, className: "mt-2 text-primary-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 228 } }, "Create Outlet"

              )
            )
          )
        ) : branches.length === 1 ? (
          React.createElement('div', { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" }
            /* Left column - main outlet details */
            , React.createElement('div', { className: "lg:col-span-2 space-y-6" }
              , React.createElement(Card, { className: "glass overflow-hidden border border-border shadow-lg relative bg-gradient-to-tr from-white to-amber-50/5", glass: true }
                , React.createElement('div', { className: "absolute top-0 right-0 w-32 h-32 bg-[#FF6A00]/5 rounded-full blur-2xl pointer-events-none" })
                , React.createElement(CardHeader, { className: "p-8 pb-4" }
                  , React.createElement('div', { className: "flex flex-wrap items-start justify-between gap-4 w-full" }
                    , React.createElement('div', { className: "space-y-1" }
                      , React.createElement('span', { className: "text-[10px] font-black text-[#FF6A00] uppercase tracking-widest block" }, "Primary Location")
                      , React.createElement(CardTitle, { className: "text-2xl font-black text-foreground flex items-center gap-2.5" }
                        , branches[0].name
                        , React.createElement('span', {
                            className: `text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                              branches[0].isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`
                          }
                          , branches[0].isActive ? "Active" : "Inactive"
                        )
                      )
                      , React.createElement('p', { className: "text-xs text-muted-foreground flex items-center gap-1.5 pt-1.5" }
                        , React.createElement(MapPin, { className: "h-3.5 w-3.5 text-primary shrink-0" })
                        , branches[0].address || "No address configured"
                      )
                    )
                    , React.createElement(Button, {
                        variant: "outline",
                        size: "sm",
                        className: "rounded-full border-primary/20 text-primary hover:bg-primary/5 font-semibold text-xs",
                        onClick: () => handleOpenEditModal(branches[0])
                      }
                      , "Edit Settings"
                    )
                  )
                )

                , React.createElement(CardContent, { className: "p-8 pt-2 space-y-6" }
                  , React.createElement('div', { className: "border-t border-border/60 my-4" })
                  
                  /* Stats widgets */
                  , React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" }
                    , React.createElement('div', { className: "bg-slate-50/80 border border-slate-100 rounded-xl p-4 text-center flex flex-col justify-center items-center space-y-1" }
                      , React.createElement('span', { className: "text-[10px] text-muted-foreground font-black uppercase tracking-wider block" }, "GPS Geofence")
                      , React.createElement('span', { className: "text-base font-extrabold text-foreground" }, branches[0].radiusMeters, "m Radius")
                    )
                    , React.createElement('div', { className: "bg-slate-50/80 border border-slate-100 rounded-xl p-4 text-center flex flex-col justify-center items-center space-y-1" }
                      , React.createElement('span', { className: "text-[10px] text-muted-foreground font-black uppercase tracking-wider block" }, "Total Check-ins")
                      , React.createElement('span', { className: "text-base font-extrabold text-foreground" }, branches[0]._count?.checkIns || 0)
                    )
                  )

                  , React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50/50 border border-slate-100 rounded-xl p-4" }
                    , React.createElement('div', { className: "flex justify-between items-center" }
                      , React.createElement('span', { className: "text-muted-foreground" }, "Latitude:")
                      , React.createElement('span', { className: "font-mono font-bold text-foreground" }, branches[0].latitude.toFixed(6))
                    )
                    , React.createElement('div', { className: "flex justify-between items-center" }
                      , React.createElement('span', { className: "text-muted-foreground" }, "Longitude:")
                      , React.createElement('span', { className: "font-mono font-bold text-foreground" }, branches[0].longitude.toFixed(6))
                    )
                  )

                  /* Status toggles */
                  , React.createElement('div', { className: "flex items-center justify-between bg-primary/5 border border-primary/10 rounded-xl p-4 text-xs" }
                    , React.createElement('div', null
                      , React.createElement('span', { className: "font-bold text-foreground block" }, branches[0].isActive ? "Outlet Active & Accepting Scans" : "Outlet Inactive")
                      , React.createElement('span', { className: "text-muted-foreground text-[10px]" }, branches[0].isActive ? "Customers can scan and claim stamps within GPS radius." : "All geolocated check-in scans are temporarily disabled for this outlet.")
                    )
                    , React.createElement(Button, {
                        size: "sm",
                        className: `text-xs font-bold ${branches[0].isActive ? "bg-primary text-white hover:bg-primary/95" : "bg-slate-100 text-slate-800"}`,
                        onClick: () => updateMutation.mutate({ id: branches[0].id, data: { isActive: !branches[0].isActive } })
                      }
                      , branches[0].isActive ? "Disable Scan" : "Enable Scan"
                    )
                  )

                  /* Subtle secondary action footer for Delete settings */
                  , React.createElement('div', { className: "flex justify-start gap-3 border-t border-dashed border-border/50 pt-4" }
                    , React.createElement(Button, {
                        variant: "ghost",
                        className: "h-6 px-2 text-[9px] text-muted-foreground hover:text-foreground hover:bg-slate-100 rounded-md font-medium",
                        onClick: () => setShowDeleteModal(true)
                      }
                      , "Delete Outlet"
                    )
                  )
                )
              )
            )

            /* Right Column - Permanent Counter Display and QR Poster Generator */
            , React.createElement('div', { className: "space-y-6" }
              , React.createElement(Card, { className: "glass border border-border/80 shadow-md flex flex-col justify-between h-full", glass: true }
                , React.createElement(CardHeader, { className: "p-6 text-center border-b border-border/60" }
                  , React.createElement(CardTitle, { className: "text-base font-bold" }, "Scan Standee Poster")
                  , React.createElement(CardDescription, { className: "text-xs mt-1" }, "Permanent Check-in QR for counter")
                )
                , React.createElement(CardContent, { className: "p-6 flex flex-col items-center justify-center space-y-5" }
                  , React.createElement('div', { className: "bg-white p-4 rounded-2xl border border-zinc-100 shadow-md relative group transition-transform duration-300 hover:scale-105" }
                    , selectedBranch?.id === branches[0].id && selectedQrImage ? (
                      React.createElement('div', { className: "relative flex items-center justify-center bg-white" }
                        , React.createElement('img', { src: selectedQrImage, alt: "Branch QR Code", className: "h-44 w-44 rounded-xl" })
                        , React.createElement('div', { className: "absolute w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md border border-[#FF6A00]/25" }
                          , React.createElement('span', { className: "text-xs font-black tracking-tight bg-gradient-to-tr from-[#FF6A00] to-[#800020] bg-clip-text text-transparent" }, "LS")
                        )
                      )
                    ) : (
                      React.createElement('div', { className: "h-44 w-44 flex flex-col items-center justify-center gap-2" }
                        , React.createElement(Button, { size: "sm", variant: "outline", onClick: () => handleShowQr(branches[0]) }, "Generate QR Code")
                        , React.createElement('p', { className: "text-[9px] text-muted-foreground" }, "Click to load QR Image")
                      )
                    )
                  )

                  , React.createElement('p', { className: "text-[10px] text-muted-foreground text-center leading-relaxed" }
                    , "Download the high-quality PNG or printable PDF standee poster. Place it at billing counters, salon mirrors, or dining tables."
                  )

                  , selectedBranch?.id === branches[0].id && selectedQrPayload && (
                    React.createElement('div', { className: "w-full text-center bg-slate-50 border border-slate-100 rounded-lg p-2.5 space-y-1.5" }
                      , React.createElement('span', { className: "text-[9px] font-black text-muted-foreground uppercase tracking-widest block" }, "Digital Copy Link:")
                      , React.createElement('a', { href: selectedQrPayload, target: "_blank", rel: "noreferrer", className: "text-[9px] text-primary hover:underline break-all block font-mono select-all" }, selectedQrPayload)
                    )
                  )
                )

                , React.createElement('div', { className: "p-6 pt-0 border-t border-border/40 mt-auto" }
                  , React.createElement('div', { className: "flex gap-2 pt-4" }
                    , React.createElement(Button, {
                        variant: "outline",
                        className: "flex-1 text-xs font-semibold",
                        onClick: handleDownloadPdf,
                        disabled: pdfLoading || selectedBranch?.id !== branches[0].id || !selectedQrImage
                      }
                      , pdfLoading ? React.createElement(Loader2, { className: "mr-1.5 h-3.5 w-3.5 animate-spin" }) : React.createElement(Download, { className: "mr-1.5 h-3.5 w-3.5" })
                      , "Download PDF"
                    )
                    , React.createElement(Button, {
                        className: "flex-1 text-xs font-bold bg-primary text-white hover:bg-primary/95",
                        onClick: handleDownloadQr,
                        disabled: selectedBranch?.id !== branches[0].id || !selectedQrImage
                      }
                      , React.createElement(Download, { className: "mr-1.5 h-3.5 w-3.5" })
                      , "Download PNG"
                    )
                  )
                )
              )
            )
          )
        ) : (
          React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 234 } }
            , branches.map((branch) => (
              React.createElement(Card, { key: branch.id, className: "glass", glass: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 236 } }
                , React.createElement(CardHeader, { className: "p-6 pb-2 flex flex-row items-start justify-between space-y-0", __self: this, __source: { fileName: _jsxFileName, lineNumber: 237 } }
                  , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 238 } }
                    , React.createElement(CardTitle, { className: "text-lg font-bold text-foreground flex items-center gap-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 239 } }
                      , branch.name
                      , React.createElement('span', {
                        className: `text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${branch.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-600 border-slate-200"
                          }`, __self: this, __source: { fileName: _jsxFileName, lineNumber: 241 }
                      }
                        , branch.isActive ? "Active" : "Inactive"
                      )
                    )
                    , React.createElement(CardDescription, { className: "text-xs mt-1 text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 247 } }
                      , branch.address || "No address configured"
                    )
                  )
                  , React.createElement('div', { className: "flex items-center gap-2" }
                    , React.createElement(Button, {
                        variant: "outline",
                        size: "sm",
                        className: "h-8 px-3 rounded-full text-xs font-semibold text-primary border-primary/20 hover:bg-primary/5",
                        onClick: () => handleOpenEditModal(branch)
                      }, "Edit")
                    , React.createElement(Button, {
                      variant: "outline",
                      size: "icon",
                      className: "h-8 w-8 border-border text-muted-foreground hover:text-foreground",
                      onClick: () => handleShowQr(branch), __self: this, __source: { fileName: _jsxFileName, lineNumber: 251 }
                    }
                      , React.createElement(QrCode, { className: "h-4 w-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 257 } })
                    )
                  )
                )

                , React.createElement(CardContent, { className: "p-6 space-y-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 261 } }
                  /* GPS metadata row */
                  , React.createElement('div', { className: "grid grid-cols-3 gap-2 text-center py-2.5 bg-slate-50 rounded-lg border border-border text-[11px]", __self: this, __source: { fileName: _jsxFileName, lineNumber: 263 } }
                    , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 264 } }
                      , React.createElement('span', { className: "text-muted-foreground block", __self: this, __source: { fileName: _jsxFileName, lineNumber: 265 } }, "Radius")
                      , React.createElement('span', { className: "text-foreground font-semibold", __self: this, __source: { fileName: _jsxFileName, lineNumber: 266 } }, branch.radiusMeters, "m")
                    )
                    , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 268 } }
                      , React.createElement('span', { className: "text-muted-foreground block", __self: this, __source: { fileName: _jsxFileName, lineNumber: 269 } }, "Latitude")
                      , React.createElement('span', { className: "text-foreground font-mono", __self: this, __source: { fileName: _jsxFileName, lineNumber: 270 } }, branch.latitude.toFixed(4))
                    )
                    , React.createElement('div', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 272 } }
                      , React.createElement('span', { className: "text-muted-foreground block", __self: this, __source: { fileName: _jsxFileName, lineNumber: 273 } }, "Longitude")
                      , React.createElement('span', { className: "text-foreground font-mono", __self: this, __source: { fileName: _jsxFileName, lineNumber: 274 } }, branch.longitude.toFixed(4))
                    )
                  )

                  /* Summary counts */
                  , React.createElement('div', { className: "flex justify-between items-center text-xs text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 279 } }
                    , React.createElement('span', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 280 } }, "Lifetime Check-ins: ", React.createElement('strong', { className: "text-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 280 } }, branch._count.checkIns))
                  )

                  /* Settings toggle */
                  , React.createElement('div', { className: "flex pt-2 border-t border-border justify-between items-center w-full" }
                    , React.createElement('div', { className: "flex gap-2" }
                      , React.createElement(Button, {
                        variant: "ghost",
                        className: "h-6 px-1.5 text-[9px] text-muted-foreground hover:text-foreground hover:bg-slate-100 rounded-md font-medium",
                        onClick: () => setShowDeleteModal(true)
                      }
                        , "Delete"
                      )
                    )
                    , React.createElement(Button, {
                      variant: "ghost",
                      size: "sm",
                      className: "text-xs font-semibold text-primary hover:text-primary/85",
                      onClick: () => updateMutation.mutate({ id: branch.id, data: { isActive: !branch.isActive } })
                    }
                      , branch.isActive ? "Disable" : "Enable"
                    )
                  )
                )
              )
            ))
          )
        )
      )

      /* Add Branch Modal */
      , showAddModal && (
        React.createElement(Dialog, { open: showAddModal, onOpenChange: (open) => !open && setShowAddModal(false), __self: this, __source: { fileName: _jsxFileName, lineNumber: 316 } }
          , React.createElement(DialogContent, { className: "max-w-[420px]", __self: this, __source: { fileName: _jsxFileName, lineNumber: 317 } }
            , React.createElement(DialogHeader, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 318 } }
              , React.createElement(DialogTitle, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 319 } }, "Add Physical Branch")
              , React.createElement(DialogDescription, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 320 } }, "Configure GPS bounds and generate counter check-in QR codes."

              )
            )

            , errorMsg && (
              React.createElement('div', { className: "bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-xs text-destructive text-center", __self: this, __source: { fileName: _jsxFileName, lineNumber: 326 } }
                , errorMsg
              )
            )

            , React.createElement('form', { onSubmit: handleCreateBranch, className: "space-y-4 py-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 331 } }
              , React.createElement('div', { className: "space-y-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 332 } }
                , React.createElement(Label, { htmlFor: "branch-name", __self: this, __source: { fileName: _jsxFileName, lineNumber: 333 } }, "Branch Name")
                , React.createElement(Input, {
                  id: "branch-name",
                  placeholder: "e.g. Patia Square Outlet",
                  value: name,
                  onChange: (e) => setName(e.target.value),
                  required: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 334 }
                }
                )
              )

              , React.createElement('div', { className: "space-y-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 343 } }
                , React.createElement(Label, { htmlFor: "branch-addr", __self: this, __source: { fileName: _jsxFileName, lineNumber: 344 } }, "Address")
                , React.createElement(Input, {
                  id: "branch-addr",
                  placeholder: "e.g. DLF Cybercity, Patia",
                  value: address,
                  onChange: (e) => setAddress(e.target.value), __self: this, __source: { fileName: _jsxFileName, lineNumber: 345 }
                }
                )
              )

              , React.createElement('div', { className: "grid grid-cols-2 gap-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 353 } }
                , React.createElement('div', { className: "space-y-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 354 } }
                  , React.createElement(Label, { htmlFor: "branch-lat", __self: this, __source: { fileName: _jsxFileName, lineNumber: 355 } }, "Latitude")
                  , React.createElement(Input, {
                    id: "branch-lat",
                    placeholder: "e.g. 20.3541",
                    value: latitude,
                    onChange: (e) => setLatitude(e.target.value),
                    required: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 356 }
                  }
                  )
                )
                , React.createElement('div', { className: "space-y-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 364 } }
                  , React.createElement(Label, { htmlFor: "branch-lng", __self: this, __source: { fileName: _jsxFileName, lineNumber: 365 } }, "Longitude")
                  , React.createElement(Input, {
                    id: "branch-lng",
                    placeholder: "e.g. 85.8159",
                    value: longitude,
                    onChange: (e) => setLongitude(e.target.value),
                    required: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 366 }
                  }
                  )
                )
              )

              , React.createElement(BranchMap, {
                  lat: latitude,
                  lng: longitude,
                  radius: radiusMeters,
                  onChange: (lat, lng) => {
                    setLatitude(lat.toString());
                    setLongitude(lng.toString());
                  }
                })

              , React.createElement('div', { className: "flex gap-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 376 } }
                , React.createElement(Button, {
                  type: "button",
                  variant: "outline",
                  className: "w-full text-xs",
                  onClick: handleUseCurrentLocation,
                  disabled: geoLoading, __self: this, __source: { fileName: _jsxFileName, lineNumber: 377 }
                }

                  , geoLoading ? React.createElement(Loader2, { className: "mr-1.5 h-3.5 w-3.5 animate-spin", __self: this, __source: { fileName: _jsxFileName, lineNumber: 384 } }) : React.createElement(MapPin, { className: "mr-1.5 h-3.5 w-3.5 text-primary", __self: this, __source: { fileName: _jsxFileName, lineNumber: 384 } }), "Use My Current GPS location"

                )
              )

              , React.createElement('div', { className: "space-y-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 389 } }
                , React.createElement(Label, { htmlFor: "branch-rad", __self: this, __source: { fileName: _jsxFileName, lineNumber: 390 } }, "GPS Radius (meters)")
                , React.createElement('select', {
                  id: "branch-rad",
                  className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-foreground dark:bg-background",
                  value: radiusMeters,
                  onChange: (e) => setRadiusMeters(e.target.value),
                  required: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 391 }
                },
                  React.createElement('option', { value: "50" }, "50 meters"),
                  React.createElement('option', { value: "100" }, "100 meters"),
                  React.createElement('option', { value: "150" }, "150 meters"),
                  React.createElement('option', { value: "200" }, "200 meters")
                )
              )

              , React.createElement(DialogFooter, { className: "pt-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 403 } }
                , React.createElement(Button, { type: "button", variant: "outline", onClick: () => setShowAddModal(false), __self: this, __source: { fileName: _jsxFileName, lineNumber: 404 } }, "Cancel"

                )
                , React.createElement(Button, { type: "submit", className: "bg-primary", disabled: createMutation.isPending, __self: this, __source: { fileName: _jsxFileName, lineNumber: 407 } }
                  , createMutation.isPending ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin", __self: this, __source: { fileName: _jsxFileName, lineNumber: 408 } }) : "Save Outlet"
                )
              )
            )
          )
        )
      )

      /* QR Viewer Modal */
      , showQrModal && selectedBranch && (
        React.createElement(Dialog, { open: showQrModal, onOpenChange: (open) => !open && setShowQrModal(false), __self: this, __source: { fileName: _jsxFileName, lineNumber: 418 } }
          , React.createElement(DialogContent, { className: "max-w-[340px]", __self: this, __source: { fileName: _jsxFileName, lineNumber: 419 } }
            , React.createElement(DialogHeader, { className: "text-center", __self: this, __source: { fileName: _jsxFileName, lineNumber: 420 } }
              , React.createElement(DialogTitle, { className: "text-lg font-bold", __self: this, __source: { fileName: _jsxFileName, lineNumber: 421 } }, selectedBranch.name)
              , React.createElement(DialogDescription, { className: "text-xs", __self: this, __source: { fileName: _jsxFileName, lineNumber: 422 } }, "Permanent Counter Check-in QR Code"

              )
            )

            , React.createElement('div', { className: "flex flex-col items-center justify-center p-4 space-y-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 427 } }
              , React.createElement('div', { className: "rounded-xl bg-white p-3 border border-white/10 shadow-2xl", __self: this, __source: { fileName: _jsxFileName, lineNumber: 428 } }
                , selectedQrImage ? (
                  React.createElement('div', { className: "relative flex items-center justify-center bg-white" }
                    , React.createElement('img', { src: selectedQrImage, alt: "Branch QR Code", className: "h-48 w-48 rounded-xl" })
                    , React.createElement('div', { className: "absolute w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md border border-[#FF6A00]/25" }
                      , React.createElement('span', { className: "text-sm font-black tracking-tight bg-gradient-to-tr from-[#FF6A00] to-[#800020] bg-clip-text text-transparent" }, "LS")
                    )
                  )
                ) : (
                  React.createElement('div', { className: "h-48 w-48 flex items-center justify-center" }
                    , React.createElement(Loader2, { className: "h-8 w-8 animate-spin text-zinc-500" })
                  )
                )
              )
              , React.createElement('p', { className: "text-[10px] text-zinc-500 text-center max-w-xs", __self: this, __source: { fileName: _jsxFileName, lineNumber: 437 } }, "Stick this permanent QR code inside your shop (Reception Desk, Cafe Table, Salon Entrance, etc.). Customers scan this to verify their location and check in."

              )
              , selectedQrPayload && (
                React.createElement('div', { className: "w-full space-y-1 text-center bg-slate-50 border border-border/60 rounded-lg p-2.5" },
                  React.createElement('span', { className: "text-[9px] font-bold text-muted-foreground uppercase tracking-wider block" }, "Testing QR Link (Copy & Paste):"),
                  React.createElement('a', { href: selectedQrPayload, target: "_blank", rel: "noreferrer", className: "text-[10px] text-primary hover:underline break-all block font-mono select-all" }, selectedQrPayload)
                )
              )
            )

            , React.createElement(DialogFooter, { className: "flex gap-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 442 } }
              , React.createElement(Button, {
                variant: "outline",
                className: "flex-1 text-xs",
                onClick: handleDownloadPdf,
                disabled: pdfLoading || !selectedQrImage, __self: this, __source: { fileName: _jsxFileName, lineNumber: 443 }
              }

                , pdfLoading ? React.createElement(Loader2, { className: "mr-1.5 h-3.5 w-3.5 animate-spin", __self: this, __source: { fileName: _jsxFileName, lineNumber: 449 } }) : React.createElement(Download, { className: "mr-1.5 h-3.5 w-3.5", __self: this, __source: { fileName: _jsxFileName, lineNumber: 449 } }), "Download PDF"

              )
              , React.createElement(Button, {
                className: "flex-1 text-xs bg-primary",
                onClick: handleDownloadQr,
                disabled: !selectedQrImage, __self: this, __source: { fileName: _jsxFileName, lineNumber: 452 }
              }

                , React.createElement(Download, { className: "mr-1.5 h-3.5 w-3.5", __self: this, __source: { fileName: _jsxFileName, lineNumber: 457 } }), " Download PNG"
              )
            )
          )
        )
      )

      /* Edit Branch Modal */
      , showEditModal && (
        React.createElement(Dialog, { open: showEditModal, onOpenChange: (open) => !open && setShowEditModal(false), __self: this, __source: { fileName: _jsxFileName, lineNumber: 466 } }
          , React.createElement(DialogContent, { className: "max-w-[420px]", __self: this, __source: { fileName: _jsxFileName, lineNumber: 467 } }
            , React.createElement(DialogHeader, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 468 } }
              , React.createElement(DialogTitle, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 469 } }, "Edit Outlet Details")
              , React.createElement(DialogDescription, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 470 } }, "Update GPS boundaries and branch information for check-ins."

              )
            )

            , errorMsg && (
              React.createElement('div', { className: "bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-xs text-destructive text-center", __self: this, __source: { fileName: _jsxFileName, lineNumber: 476 } }
                , errorMsg
              )
            )

            , React.createElement('form', { onSubmit: handleEditBranch, className: "space-y-4 py-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 481 } }
              , React.createElement('div', { className: "space-y-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 482 } }
                , React.createElement(Label, { htmlFor: "edit-branch-name", __self: this, __source: { fileName: _jsxFileName, lineNumber: 483 } }, "Branch Name")
                , React.createElement(Input, {
                  id: "edit-branch-name",
                  placeholder: "e.g. Patia Square Outlet",
                  value: name,
                  onChange: (e) => setName(e.target.value),
                  required: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 484 }
                }
                )
              )

              , React.createElement('div', { className: "space-y-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 493 } }
                , React.createElement(Label, { htmlFor: "edit-branch-addr", __self: this, __source: { fileName: _jsxFileName, lineNumber: 494 } }, "Address")
                , React.createElement(Input, {
                  id: "edit-branch-addr",
                  placeholder: "e.g. DLF Cybercity, Patia",
                  value: address,
                  onChange: (e) => setAddress(e.target.value), __self: this, __source: { fileName: _jsxFileName, lineNumber: 495 }
                }
                )
              )

              , React.createElement('div', { className: "grid grid-cols-2 gap-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 503 } }
                , React.createElement('div', { className: "space-y-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 504 } }
                  , React.createElement(Label, { htmlFor: "edit-branch-lat", __self: this, __source: { fileName: _jsxFileName, lineNumber: 505 } }, "Latitude")
                  , React.createElement(Input, {
                    id: "edit-branch-lat",
                    placeholder: "e.g. 20.3541",
                    value: latitude,
                    onChange: (e) => setLatitude(e.target.value),
                    required: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 506 }
                  }
                  )
                )
                , React.createElement('div', { className: "space-y-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 514 } }
                  , React.createElement(Label, { htmlFor: "edit-branch-lng", __self: this, __source: { fileName: _jsxFileName, lineNumber: 515 } }, "Longitude")
                  , React.createElement(Input, {
                    id: "edit-branch-lng",
                    placeholder: "e.g. 85.8159",
                    value: longitude,
                    onChange: (e) => setLongitude(e.target.value),
                    required: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 516 }
                  }
                  )
                )
              )

              , React.createElement(BranchMap, {
                  lat: latitude,
                  lng: longitude,
                  radius: radiusMeters,
                  onChange: (lat, lng) => {
                    setLatitude(lat.toString());
                    setLongitude(lng.toString());
                  }
                })

              , React.createElement('div', { className: "flex gap-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 526 } }
                , React.createElement(Button, {
                  type: "button",
                  variant: "outline",
                  className: "w-full text-xs",
                  onClick: handleUseCurrentLocation,
                  disabled: geoLoading, __self: this, __source: { fileName: _jsxFileName, lineNumber: 527 }
                }

                  , geoLoading ? React.createElement(Loader2, { className: "mr-1.5 h-3.5 w-3.5 animate-spin", __self: this, __source: { fileName: _jsxFileName, lineNumber: 534 } }) : React.createElement(MapPin, { className: "mr-1.5 h-3.5 w-3.5 text-primary", __self: this, __source: { fileName: _jsxFileName, lineNumber: 534 } }), "Use My Current GPS location"

                )
              )

              , React.createElement('div', { className: "space-y-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 539 } }
                , React.createElement(Label, { htmlFor: "edit-branch-rad", __self: this, __source: { fileName: _jsxFileName, lineNumber: 540 } }, "GPS Radius (meters)")
                , React.createElement('select', {
                  id: "edit-branch-rad",
                  className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-foreground dark:bg-background",
                  value: radiusMeters,
                  onChange: (e) => setRadiusMeters(e.target.value),
                  required: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 541 }
                },
                  React.createElement('option', { value: "50" }, "50 meters"),
                  React.createElement('option', { value: "100" }, "100 meters"),
                  React.createElement('option', { value: "150" }, "150 meters"),
                  React.createElement('option', { value: "200" }, "200 meters")
                )
              )

              , React.createElement(DialogFooter, { className: "pt-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 553 } }
                , React.createElement(Button, { type: "button", variant: "outline", onClick: () => setShowEditModal(false), __self: this, __source: { fileName: _jsxFileName, lineNumber: 554 } }, "Cancel"

                )
                , React.createElement(Button, { type: "submit", className: "bg-primary", disabled: updateMutation.isPending, __self: this, __source: { fileName: _jsxFileName, lineNumber: 557 } }
                  , updateMutation.isPending ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin", __self: this, __source: { fileName: _jsxFileName, lineNumber: 558 } }) : "Save Changes"
                )
              )
            )
          )
        )
      )

      /* Delete Support Alert Modal */
      , showDeleteModal && (
        React.createElement(Dialog, { open: showDeleteModal, onOpenChange: (open) => !open && setShowDeleteModal(false) }
          , React.createElement(DialogContent, { className: "max-w-[400px] p-6 text-slate-800 bg-white border border-border rounded-2xl" }
            , React.createElement(DialogHeader, { className: "space-y-3" }
              , React.createElement(DialogTitle, { className: "text-lg font-bold text-red-600 flex items-center gap-2" }, "⚠️ Delete Outlet Request")
              , React.createElement(DialogDescription, { className: "text-xs text-muted-foreground leading-relaxed" }
                , "To protect active customer stamp cards, streak configurations, and location audit trails, deleting an outlet requires support verification."
              )
            )
            , React.createElement('div', { className: "bg-red-50 border border-red-100 rounded-xl p-4 text-xs text-red-950 space-y-2 leading-relaxed" }
              , React.createElement('p', null, "Deleting physical outlets disrupts active consumer checking streaks. To safely proceed with deletion and database archival, please connect directly with our support help desk.")
            )
            , React.createElement(DialogFooter, { className: "flex flex-col sm:flex-row gap-2 pt-2" }
              , React.createElement(Button, { type: "button", variant: "outline", className: "flex-1 text-xs", onClick: () => setShowDeleteModal(false) }, "Close")
              , React.createElement('a', { 
                  href: "https://wa.me/919692919917?text=Hi%20ScanLoyal%20Support%2C%20I%20want%20to%20safely%20delete%20one%20of%20my%20storefront%20outlets.", 
                  target: "_blank", 
                  rel: "noopener noreferrer", 
                  className: "flex-1" 
                }
                , React.createElement(Button, { type: "button", className: "w-full text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center gap-1.5" }
                  , "Contact Support"
                )
              )
            )
          )
        )
      )
      /* Branch Created Success + Support Modal */
      , showBranchCreatedModal && (
        React.createElement(Dialog, { open: showBranchCreatedModal, onOpenChange: (open) => !open && setShowBranchCreatedModal(false) }
          , React.createElement(DialogContent, { className: "max-w-[400px] p-0 overflow-hidden rounded-2xl border border-emerald-100 bg-white" }
            /* Green success header */
            , React.createElement('div', { className: "bg-gradient-to-tr from-emerald-500 to-teal-500 px-7 pt-8 pb-6 text-center relative" }
              , React.createElement('div', { className: "w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg" }
                , React.createElement('span', { className: "text-2xl" }, "🏪")
              )
              , React.createElement('h2', { className: "text-white font-black text-xl" }, "Branch Created!")
              , React.createElement('p', { className: "text-emerald-100 text-xs mt-1.5 leading-relaxed" }
                , "Your new storefront outlet is live and ready to generate the counter check-in QR code."
              )
            )
            /* Support banner */
            , React.createElement('div', { className: "p-6 space-y-5" }
              , React.createElement('div', { className: "bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2" }
                , React.createElement('p', { className: "text-xs font-black text-amber-900 flex items-center gap-1.5" }
                  , "💡 Need Help Setting Up?"
                )
                , React.createElement('p', { className: "text-[11px] text-amber-900/80 leading-relaxed" }
                  , "Our onboarding team is available to help you set up your GPS geofence, download and print your standee poster, and configure your loyalty program."
                )
              )
              , React.createElement('a', {
                  href: "https://wa.me/919692919917?text=Hi%20ScanLoyal%20Support%2C%20I%20just%20created%20a%20new%20branch%20and%20need%20help%20with%20setup!",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "block"
                }
                , React.createElement(Button, { className: "w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm flex items-center justify-center gap-2 h-11 rounded-xl" }
                  , React.createElement('svg', { viewBox: "0 0 24 24", className: "h-5 w-5 fill-current shrink-0" }
                    , React.createElement('path', { d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" })
                  )
                  , "Chat with Customer Care"
                )
              )
              , React.createElement(Button, { type: "button", variant: "ghost", className: "w-full text-xs text-muted-foreground", onClick: () => setShowBranchCreatedModal(false) }, "Close, I'll set up later")
            )
          )
        )
      )
    )
  );
}



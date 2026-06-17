const _jsxFileName = "src\\pages\\(business-admin)\\dashboard\\business\\branches\\page.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }"use client";

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
















export default function BranchesPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const businessId = _optionalChain([user, 'optionalAccess', _ => _.businessId]);
  const { getPosition, loading: geoLoading } = useGeolocation();

  // Dialog states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedQrImage, setSelectedQrImage] = useState(null);
  const [selectedQrPayload, setSelectedQrPayload] = useState(null);

  // Form states
  const [editingBranchId, setEditingBranchId] = useState(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radiusMeters, setRadiusMeters] = useState("50");
  const [errorMsg, setErrorMsg] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // 1. Fetch branches list
  const { data: branches = [], isLoading } = useQuery({
    queryKey: ["businessBranches", businessId],
    queryFn: () => api.get(`/branches/business/${businessId}`).then((res) => res.data),
    enabled: !!businessId,
  });

  // 2. Create branch mutation
  const createMutation = useMutation({
    mutationFn: (data) => api.post(`/branches/business/${businessId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessBranches", businessId] });
      queryClient.invalidateQueries({ queryKey: ["businessProfile", businessId] });
      setShowAddModal(false);
      resetForm();
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
      }) ;
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
    setRadiusMeters("50");
    setEditingBranchId(null);
    setErrorMsg(null);
  };

  if (isLoading) {
    return (
      React.createElement('div', { className: "space-y-4 animate-pulse" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 195}}
        , React.createElement('div', { className: "h-10 w-48 rounded bg-slate-100"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 196}} )
        , React.createElement('div', { className: "h-32 w-full rounded-xl bg-slate-100"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 197}} )
        , React.createElement('div', { className: "h-32 w-full rounded-xl bg-slate-100"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 198}} )
      )
    );
  }

  return (
    React.createElement('div', { className: "space-y-6", __self: this, __source: {fileName: _jsxFileName, lineNumber: 204}}
      /* Header */
      , React.createElement('div', { className: "flex items-center justify-between"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 206}}
        , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 207}}
          , React.createElement('h1', { className: "text-3xl font-extrabold text-foreground tracking-tight"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 208}}, "Branches")
          , React.createElement('p', { className: "text-xs text-muted-foreground mt-1"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 209}}, "Setup physical store outlets and print static check-in QR codes"

          )
        )
        , React.createElement(Button, { onClick: () => setShowAddModal(true), className: "bg-primary hover:bg-primary/90 text-primary-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 213}}
          , React.createElement(Plus, { className: "mr-2 h-4 w-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 214}} ), " Add Branch"
        )
      )

      /* Branches Table List */
      , React.createElement('div', { className: "grid grid-cols-1 gap-6"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 219}}
        , branches.length === 0 ? (
          React.createElement(Card, { className: "border-dashed border-border bg-slate-50/50 py-12 text-center"    , glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 221}}
            , React.createElement(CardContent, { className: "flex flex-col items-center justify-center space-y-3"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 222}}
              , React.createElement(MapPin, { className: "h-10 w-10 text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 223}} )
              , React.createElement('p', { className: "text-sm text-muted-foreground font-medium"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 224}}, "No branches set up yet"    )
              , React.createElement('p', { className: "text-xs text-muted-foreground max-w-sm"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 225}}, "Add your first physical outlet to generate the counter check-in QR code!"

              )
              , React.createElement(Button, { size: "sm", onClick: () => setShowAddModal(true), className: "mt-2 text-primary-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 228}}, "Create Outlet"

              )
            )
          )
        ) : (
          React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 234}}
            , branches.map((branch) => (
              React.createElement(Card, { key: branch.id, className: "glass", glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 236}}
                , React.createElement(CardHeader, { className: "p-6 pb-2 flex flex-row items-start justify-between space-y-0"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 237}}
                  , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 238}}
                    , React.createElement(CardTitle, { className: "text-lg font-bold text-foreground flex items-center gap-2"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 239}}
                      , branch.name
                      , React.createElement('span', { className: `text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        branch.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-600 border-slate-200"
                      }`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 241}}
                        , branch.isActive ? "Active" : "Inactive"
                      )
                    )
                    , React.createElement(CardDescription, { className: "text-xs mt-1 text-muted-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 247}}
                      , branch.address || "No address configured"
                    )
                  )
                  , React.createElement(Button, { 
                    variant: "outline", 
                    size: "icon", 
                    className: "h-10 w-10 border-border text-muted-foreground hover:text-foreground"    ,
                    onClick: () => handleShowQr(branch), __self: this, __source: {fileName: _jsxFileName, lineNumber: 251}}

                    , React.createElement(QrCode, { className: "h-5 w-5" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 257}} )
                  )
                )

                , React.createElement(CardContent, { className: "p-6 space-y-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 261}}
                  /* GPS metadata row */
                  , React.createElement('div', { className: "grid grid-cols-3 gap-2 text-center py-2.5 bg-slate-50 rounded-lg border border-border text-[11px]"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 263}}
                    , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 264}}
                      , React.createElement('span', { className: "text-muted-foreground block" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 265}}, "Radius")
                      , React.createElement('span', { className: "text-foreground font-semibold" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 266}}, branch.radiusMeters, "m")
                    )
                    , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 268}}
                      , React.createElement('span', { className: "text-muted-foreground block" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 269}}, "Latitude")
                      , React.createElement('span', { className: "text-foreground font-mono" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 270}}, branch.latitude.toFixed(4))
                    )
                    , React.createElement('div', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 272}}
                      , React.createElement('span', { className: "text-muted-foreground block" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 273}}, "Longitude")
                      , React.createElement('span', { className: "text-foreground font-mono" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 274}}, branch.longitude.toFixed(4))
                    )
                  )

                  /* Summary counts */
                  , React.createElement('div', { className: "flex justify-between items-center text-xs text-muted-foreground"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 279}}
                    , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 280}}, "Lifetime Check-ins: "  , React.createElement('strong', { className: "text-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 280}}, branch._count.checkIns))
                    , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 281}}, "Staff Enrolled: "  , React.createElement('strong', { className: "text-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 281}}, branch._count.staff))
                  )

                  /* Settings toggle */
                  , React.createElement('div', { className: "flex gap-2 pt-2 border-t border-border justify-between w-full"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 285}}
                    , React.createElement(Button, { 
                      variant: "ghost", 
                      size: "sm", 
                      className: "text-xs text-muted-foreground hover:text-foreground"  ,
                      onClick: () => handleOpenEditModal(branch), __self: this, __source: {fileName: _jsxFileName, lineNumber: 286}}
, "Edit Details"

                    )
                    , React.createElement(Button, { 
                      variant: "ghost", 
                      size: "sm", 
                      className: "text-xs text-muted-foreground hover:text-foreground"  ,
                      onClick: () => updateMutation.mutate({ id: branch.id, data: { isActive: !branch.isActive } }), __self: this, __source: {fileName: _jsxFileName, lineNumber: 294}}

                      , branch.isActive ? (
                        React.createElement(React.Fragment, null, React.createElement(ToggleRight, { className: "mr-1.5 h-4.5 w-4.5 text-primary"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 301}} ), " Disable" )
                      ) : (
                        React.createElement(React.Fragment, null, React.createElement(ToggleLeft, { className: "mr-1.5 h-4.5 w-4.5 text-muted-foreground"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 303}} ), " Enable" )
                      )
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
        React.createElement(Dialog, { open: showAddModal, onOpenChange: (open) => !open && setShowAddModal(false), __self: this, __source: {fileName: _jsxFileName, lineNumber: 316}}
          , React.createElement(DialogContent, { className: "max-w-[420px]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 317}}
            , React.createElement(DialogHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 318}}
              , React.createElement(DialogTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 319}}, "Add Physical Branch"  )
              , React.createElement(DialogDescription, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 320}}, "Configure GPS bounds and generate counter check-in QR codes."

              )
            )

            , errorMsg && (
              React.createElement('div', { className: "bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-xs text-destructive text-center"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 326}}
                , errorMsg
              )
            )

            , React.createElement('form', { onSubmit: handleCreateBranch, className: "space-y-4 py-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 331}}
              , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 332}}
                , React.createElement(Label, { htmlFor: "branch-name", __self: this, __source: {fileName: _jsxFileName, lineNumber: 333}}, "Branch Name" )
                , React.createElement(Input, { 
                  id: "branch-name", 
                  placeholder: "e.g. Patia Square Outlet"   , 
                  value: name,
                  onChange: (e) => setName(e.target.value),
                  required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 334}} 
                )
              )

              , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 343}}
                , React.createElement(Label, { htmlFor: "branch-addr", __self: this, __source: {fileName: _jsxFileName, lineNumber: 344}}, "Address")
                , React.createElement(Input, { 
                  id: "branch-addr", 
                  placeholder: "e.g. DLF Cybercity, Patia"   , 
                  value: address,
                  onChange: (e) => setAddress(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 345}}
                )
              )

              , React.createElement('div', { className: "grid grid-cols-2 gap-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 353}}
                , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 354}}
                  , React.createElement(Label, { htmlFor: "branch-lat", __self: this, __source: {fileName: _jsxFileName, lineNumber: 355}}, "Latitude")
                  , React.createElement(Input, { 
                    id: "branch-lat", 
                    placeholder: "e.g. 20.3541" , 
                    value: latitude,
                    onChange: (e) => setLatitude(e.target.value),
                    required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 356}} 
                  )
                )
                , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 364}}
                  , React.createElement(Label, { htmlFor: "branch-lng", __self: this, __source: {fileName: _jsxFileName, lineNumber: 365}}, "Longitude")
                  , React.createElement(Input, { 
                    id: "branch-lng", 
                    placeholder: "e.g. 85.8159" , 
                    value: longitude,
                    onChange: (e) => setLongitude(e.target.value),
                    required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 366}} 
                  )
                )
              )

              , React.createElement('div', { className: "flex gap-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 376}}
                , React.createElement(Button, { 
                  type: "button", 
                  variant: "outline", 
                  className: "w-full text-xs" ,
                  onClick: handleUseCurrentLocation,
                  disabled: geoLoading, __self: this, __source: {fileName: _jsxFileName, lineNumber: 377}}

                  , geoLoading ? React.createElement(Loader2, { className: "mr-1.5 h-3.5 w-3.5 animate-spin"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 384}} ) : React.createElement(MapPin, { className: "mr-1.5 h-3.5 w-3.5 text-primary"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 384}} ), "Use My Current GPS location"

                )
              )

              , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 389}}
                , React.createElement(Label, { htmlFor: "branch-rad", __self: this, __source: {fileName: _jsxFileName, lineNumber: 390}}, "GPS Radius (meters)"  )
                , React.createElement(Input, { 
                  id: "branch-rad", 
                  type: "number", 
                  placeholder: "e.g. 50" , 
                  value: radiusMeters,
                  onChange: (e) => setRadiusMeters(e.target.value),
                  min: "10",
                  max: "1000",
                  required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 391}} 
                )
              )

              , React.createElement(DialogFooter, { className: "pt-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 403}}
                , React.createElement(Button, { type: "button", variant: "outline", onClick: () => setShowAddModal(false), __self: this, __source: {fileName: _jsxFileName, lineNumber: 404}}, "Cancel"

                )
                , React.createElement(Button, { type: "submit", className: "bg-primary", disabled: createMutation.isPending, __self: this, __source: {fileName: _jsxFileName, lineNumber: 407}}
                  , createMutation.isPending ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 408}} ) : "Save Outlet"
                )
              )
            )
          )
        )
      )

      /* QR Viewer Modal */
      , showQrModal && selectedBranch && (
        React.createElement(Dialog, { open: showQrModal, onOpenChange: (open) => !open && setShowQrModal(false), __self: this, __source: {fileName: _jsxFileName, lineNumber: 418}}
          , React.createElement(DialogContent, { className: "max-w-[340px]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 419}}
            , React.createElement(DialogHeader, { className: "text-center", __self: this, __source: {fileName: _jsxFileName, lineNumber: 420}}
              , React.createElement(DialogTitle, { className: "text-lg font-bold" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 421}}, selectedBranch.name)
              , React.createElement(DialogDescription, { className: "text-xs", __self: this, __source: {fileName: _jsxFileName, lineNumber: 422}}, "Permanent Counter Check-in QR Code"

              )
            )

            , React.createElement('div', { className: "flex flex-col items-center justify-center p-4 space-y-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 427}}
              , React.createElement('div', { className: "rounded-xl bg-white p-3 border border-white/10 shadow-2xl"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 428}}
                , selectedQrImage ? (
                  React.createElement('img', { src: selectedQrImage, alt: "Branch QR Code"  , className: "h-48 w-48" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 430}} )
                ) : (
                  React.createElement('div', { className: "h-48 w-48 flex items-center justify-center"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 432}}
                    , React.createElement(Loader2, { className: "h-8 w-8 animate-spin text-zinc-500"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 433}} )
                  )
                )
              )
              , React.createElement('p', { className: "text-[10px] text-zinc-500 text-center max-w-xs"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 437}}, "Stick this permanent QR code inside your shop (Reception Desk, Cafe Table, Salon Entrance, etc.). Customers scan this to verify their location and check in."

              )
              , selectedQrPayload && (
                React.createElement('div', { className: "w-full space-y-1 text-center bg-slate-50 border border-border/60 rounded-lg p-2.5" },
                  React.createElement('span', { className: "text-[9px] font-bold text-muted-foreground uppercase tracking-wider block" }, "Testing QR Link (Copy & Paste):"),
                  React.createElement('a', { href: selectedQrPayload, target: "_blank", rel: "noreferrer", className: "text-[10px] text-primary hover:underline break-all block font-mono select-all" }, selectedQrPayload)
                )
              )
            )

            , React.createElement(DialogFooter, { className: "flex gap-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 442}}
              , React.createElement(Button, { 
                variant: "outline", 
                className: "flex-1 text-xs" ,
                onClick: handleDownloadPdf,
                disabled: pdfLoading || !selectedQrImage, __self: this, __source: {fileName: _jsxFileName, lineNumber: 443}}

                , pdfLoading ? React.createElement(Loader2, { className: "mr-1.5 h-3.5 w-3.5 animate-spin"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 449}} ) : React.createElement(Download, { className: "mr-1.5 h-3.5 w-3.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 449}} ), "Download PDF"

              )
              , React.createElement(Button, { 
                className: "flex-1 text-xs bg-primary"  ,
                onClick: handleDownloadQr,
                disabled: !selectedQrImage, __self: this, __source: {fileName: _jsxFileName, lineNumber: 452}}

                , React.createElement(Download, { className: "mr-1.5 h-3.5 w-3.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 457}} ), " Download PNG"
              )
            )
          )
        )
      )

      /* Edit Branch Modal */
      , showEditModal && (
        React.createElement(Dialog, { open: showEditModal, onOpenChange: (open) => !open && setShowEditModal(false), __self: this, __source: {fileName: _jsxFileName, lineNumber: 466}}
          , React.createElement(DialogContent, { className: "max-w-[420px]", __self: this, __source: {fileName: _jsxFileName, lineNumber: 467}}
            , React.createElement(DialogHeader, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 468}}
              , React.createElement(DialogTitle, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 469}}, "Edit Outlet Details"  )
              , React.createElement(DialogDescription, {__self: this, __source: {fileName: _jsxFileName, lineNumber: 470}}, "Update GPS boundaries and branch information for check-ins."

              )
            )

            , errorMsg && (
              React.createElement('div', { className: "bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-xs text-destructive text-center"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 476}}
                , errorMsg
              )
            )

            , React.createElement('form', { onSubmit: handleEditBranch, className: "space-y-4 py-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 481}}
              , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 482}}
                , React.createElement(Label, { htmlFor: "edit-branch-name", __self: this, __source: {fileName: _jsxFileName, lineNumber: 483}}, "Branch Name" )
                , React.createElement(Input, { 
                  id: "edit-branch-name", 
                  placeholder: "e.g. Patia Square Outlet"   , 
                  value: name,
                  onChange: (e) => setName(e.target.value),
                  required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 484}} 
                )
              )

              , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 493}}
                , React.createElement(Label, { htmlFor: "edit-branch-addr", __self: this, __source: {fileName: _jsxFileName, lineNumber: 494}}, "Address")
                , React.createElement(Input, { 
                  id: "edit-branch-addr", 
                  placeholder: "e.g. DLF Cybercity, Patia"   , 
                  value: address,
                  onChange: (e) => setAddress(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 495}}
                )
              )

              , React.createElement('div', { className: "grid grid-cols-2 gap-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 503}}
                , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 504}}
                  , React.createElement(Label, { htmlFor: "edit-branch-lat", __self: this, __source: {fileName: _jsxFileName, lineNumber: 505}}, "Latitude")
                  , React.createElement(Input, { 
                    id: "edit-branch-lat", 
                    placeholder: "e.g. 20.3541" , 
                    value: latitude,
                    onChange: (e) => setLatitude(e.target.value),
                    required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 506}} 
                  )
                )
                , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 514}}
                  , React.createElement(Label, { htmlFor: "edit-branch-lng", __self: this, __source: {fileName: _jsxFileName, lineNumber: 515}}, "Longitude")
                  , React.createElement(Input, { 
                    id: "edit-branch-lng", 
                    placeholder: "e.g. 85.8159" , 
                    value: longitude,
                    onChange: (e) => setLongitude(e.target.value),
                    required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 516}} 
                  )
                )
              )

              , React.createElement('div', { className: "flex gap-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 526}}
                , React.createElement(Button, { 
                  type: "button", 
                  variant: "outline", 
                  className: "w-full text-xs" ,
                  onClick: handleUseCurrentLocation,
                  disabled: geoLoading, __self: this, __source: {fileName: _jsxFileName, lineNumber: 527}}

                  , geoLoading ? React.createElement(Loader2, { className: "mr-1.5 h-3.5 w-3.5 animate-spin"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 534}} ) : React.createElement(MapPin, { className: "mr-1.5 h-3.5 w-3.5 text-primary"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 534}} ), "Use My Current GPS location"

                )
              )

              , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 539}}
                , React.createElement(Label, { htmlFor: "edit-branch-rad", __self: this, __source: {fileName: _jsxFileName, lineNumber: 540}}, "GPS Radius (meters)"  )
                , React.createElement(Input, { 
                  id: "edit-branch-rad", 
                  type: "number", 
                  placeholder: "e.g. 50" , 
                  value: radiusMeters,
                  onChange: (e) => setRadiusMeters(e.target.value),
                  min: "10",
                  max: "1000",
                  required: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 541}} 
                )
              )

              , React.createElement(DialogFooter, { className: "pt-2", __self: this, __source: {fileName: _jsxFileName, lineNumber: 553}}
                , React.createElement(Button, { type: "button", variant: "outline", onClick: () => setShowEditModal(false), __self: this, __source: {fileName: _jsxFileName, lineNumber: 554}}, "Cancel"

                )
                , React.createElement(Button, { type: "submit", className: "bg-primary", disabled: updateMutation.isPending, __self: this, __source: {fileName: _jsxFileName, lineNumber: 557}}
                  , updateMutation.isPending ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 558}} ) : "Save Changes"
                )
              )
            )
          )
        )
      )
    )
  );
}

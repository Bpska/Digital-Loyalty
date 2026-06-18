import { useNavigate, useSearchParams } from "react-router-dom";
const _jsxFileName = "src\\pages\\(customer)\\checkin\\page.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { QrCode, Camera, Upload, AlertTriangle, CheckCircle, Loader2, Award, Sparkles, MapPin } from "lucide-react";

export default function CheckinPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { getPosition, loading: geoLoading, error: geoError, progress: geoProgress, readings: geoReadings } = useGeolocation();
  const [debugData, setDebugData] = useState(null);

  const [scanResult, setScanResult] = useState(null);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Checkin Result details
  const [checkInDetails, setCheckInDetails] = useState





(null);

  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  const paramBusinessId = searchParams.get("businessId");
  const paramBranchId = searchParams.get("branchId");
  const paramToken = searchParams.get("token");

  // Automated check-in on query params load
  useEffect(() => {
    if (paramBusinessId && paramBranchId && paramToken) {
      handleQrDecoded(paramToken);
    }
  }, [paramBusinessId, paramBranchId, paramToken]);

  // Stop scanner when unmounting
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  // Handle scanner start/stop lifecycle based on scanning status
  useEffect(() => {
    let isMounted = true;
    let qrScanner = null;

    if (status === "scanning") {
      const initScanner = async () => {
        try {
          const { Html5Qrcode } = await import("html5-qrcode");
          if (!isMounted) return;

          const scannerId = "reader";
          qrScanner = new Html5Qrcode(scannerId);
          html5QrCodeRef.current = qrScanner;

          await qrScanner.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              if (isMounted) {
                handleQrDecoded(decodedText);
              }
            },
            (errorMessage) => {
              // ignore scan errors
            }
          );
        } catch (err) {
          console.error("Failed to start camera scanner:", err);
          if (isMounted) {
            setStatus("idle");
            setErrorMsg("Camera access denied or unavailable. You can upload an image of the QR code instead.");
          }
        }
      };

      // Slight delay to ensure DOM element is mounted
      const timer = setTimeout(initScanner, 100);
      return () => {
        clearTimeout(timer);
        isMounted = false;
        if (qrScanner && qrScanner.isScanning) {
          qrScanner.stop().catch((err) => console.error("Error stopping scanner on cleanup:", err));
        }
      };
    }
  }, [status]);

  const startScanner = async () => {
    setErrorMsg(null);
    setStatus("scanning");
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
    }
    setStatus("idle");
  };

  const handleFileChange = async (e) => {
    const file = _optionalChain([e, 'access', _ => _.target, 'access', _2 => _2.files, 'optionalAccess', _3 => _3[0]]);
    if (!file) return;

    setStatus("submitting");
    setErrorMsg(null);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode("reader-hidden");
      
      const decodedText = await html5QrCode.scanFile(file, true);
      handleQrDecoded(decodedText);
    } catch (err) {
      console.error("Failed to parse QR from file:", err);
      setStatus("idle");
      setErrorMsg("Could not find a valid QR code in the uploaded image. Please try again.");
    }
  };

  const handleQrDecoded = async (decodedText) => {
    await stopScanner();
    setScanResult(decodedText);
    setStatus("checking-gps");

    let parsedToken = decodedText;

    if (decodedText.startsWith("http://") || decodedText.startsWith("https://")) {
      try {
        const url = new URL(decodedText);
        const tokenParam = url.searchParams.get("token");
        if (tokenParam) {
          parsedToken = tokenParam;
        }
      } catch (e) {
        // Fallback
      }
    } else {
      try {
        // Check if it is our custom JSON payload { branchId, token, issuedAt }
        const payload = JSON.parse(decodedText);
        if (payload && payload.token) {
          parsedToken = payload.token;
        }
      } catch (e) {
        // Plain token fallback
      }
    }

    try {
      setDebugData(null); // Reset debug details on retry
      // 1. Get high accuracy GPS location
      const coords = await getPosition();

      // 2. Submit check-in to backend
      setStatus("submitting");
      
      // Get or create device fingerprint
      let deviceId = localStorage.getItem("deviceId");
      if (!deviceId) {
        if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
          deviceId = window.crypto.randomUUID();
        } else {
          // Fallback UUID v4 generator for non-secure HTTP contexts
          deviceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        }
        localStorage.setItem("deviceId", deviceId);
      }

      const response = await api.post("/checkins", {
        qrToken: parsedToken,
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        deviceId,
      });

      if (response.success && response.data) {
        setCheckInDetails(response.data);
        if (response.data.debug) {
          setDebugData(response.data.debug);
        }
        setStatus("success");
        // Invalidate all customer data queries so dashboard/history refresh immediately
        queryClient.invalidateQueries({ queryKey: ["customerDashboard"] });
        queryClient.invalidateQueries({ queryKey: ["checkinHistory"] });
        queryClient.invalidateQueries({ queryKey: ["rewardsHistory"] });
      } else {
        throw new Error(response.message || "Failed to complete check-in.");
      }
    } catch (err) {
      console.error("Check-in failed:", err);
      setStatus("error");
      
      const backendErrorMsg = err.response?.data?.message || err.message;
      if (err.response?.data?.debug) {
        setDebugData(err.response.data.debug);
      }

      setErrorMsg(
        backendErrorMsg || 
        "Location verification failed. Please make sure you are at the physical branch center and location permissions are granted."
      );
    }
  };

  return (
    React.createElement('div', { className: "space-y-6 max-w-sm mx-auto"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 179}}
      /* Hidden element for file scanning - keeps it in DOM with size but invisible off-screen to avoid canvas bugs */
      , React.createElement('div', { 
          id: "reader-hidden", 
          style: { position: 'absolute', left: '-9999px', top: '-9999px', width: '1px', height: '1px', overflow: 'hidden' },
          __self: this, 
          __source: {fileName: _jsxFileName, lineNumber: 181}
        })

      /* Success View */
      , status === "success" && checkInDetails && (
        React.createElement(Card, { className: "border-emerald-100 bg-emerald-50/20 text-center p-6 animate-fade-in"    , glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 185}}
          , React.createElement(CardContent, { className: "flex flex-col items-center justify-center space-y-4 pt-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 186}}
            , React.createElement('div', { className: "h-16 w-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 187}}
              , React.createElement(CheckCircle, { className: "h-10 w-10" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 188}} )
            )

            , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 191}}
              , React.createElement(CardTitle, { className: "text-xl font-bold text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 192}}, "Check-in Verified! 📍"  )
              , React.createElement(CardDescription, { className: "text-sm text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 193}}, "GPS check-in verified successfully."

              )
            )

            , React.createElement('div', { className: "w-full bg-slate-50 rounded-xl p-4 border border-border/50 space-y-2"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 198}}
              , React.createElement('div', { className: "flex justify-between items-center text-sm"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 199}}
                , React.createElement('span', { className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 200}}, "Points Added:" )
                , React.createElement('span', { className: "font-bold text-primary" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 201}}, "+", checkInDetails.pointsEarned, " Points" )
              )
              , React.createElement('div', { className: "flex justify-between items-center text-sm"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 203}}
                , React.createElement('span', { className: "text-muted-foreground", __self: this, __source: {fileName: _jsxFileName, lineNumber: 204}}, "Stamps Streak:" )
                , React.createElement('span', { className: "font-semibold text-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 205}}, checkInDetails.visitStreak, " Visits" )
              )
              , React.createElement('div', { className: "flex justify-between items-center text-xs text-muted-foreground pt-2 border-t border-border"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 207}}
                , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 208}}, "Total Balance:" )
                , React.createElement('span', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 209}}, checkInDetails.totalPoints, " points" )
              )
            )

            , checkInDetails.newlyUnlockedReward && (
              React.createElement('div', { className: "w-full rounded-xl bg-gradient-to-tr from-indigo-50/40 to-primary/5 border border-primary/20 p-4 space-y-2 text-left"         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 214}}
                , React.createElement('div', { className: "flex items-center space-x-2 text-primary font-bold text-xs uppercase tracking-wider"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 215}}
                  , React.createElement(Award, { className: "h-4 w-4" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 216}} ), " Reward Unlocked!"
                )
                , React.createElement('h4', { className: "text-sm font-extrabold text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 218}}
                  , checkInDetails.newlyUnlockedReward.title
                )
                , React.createElement('p', { className: "text-[11px] text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 221}}, "Code: "
                   , React.createElement('code', { className: "font-mono text-foreground bg-slate-100 px-1 py-0.5 rounded"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 222}}, checkInDetails.newlyUnlockedReward.redemptionCode.toUpperCase())
                )
                , React.createElement('p', { className: "text-[10px] text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 224}}, "This voucher is saved in your wallet. Show it to staff anytime to claim it."

                )
              )
            )

            , React.createElement(Button, {
              className: "w-full bg-primary text-primary-foreground hover:bg-primary/90"   ,
              onClick: () => navigate("/dashboard"), __self: this, __source: {fileName: _jsxFileName, lineNumber: 230}}
, "Go to Dashboard"

            )
          )
        )
      )

      /* Error View */
      , status === "error" && (
        React.createElement(Card, { className: "border-red-100 bg-red-50/20 p-6 animate-fade-in"   , glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 242}}
          , React.createElement(CardContent, { className: "flex flex-col items-center justify-center space-y-4 pt-4 text-center"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 243}}
            , React.createElement('div', { className: "h-16 w-16 rounded-full bg-red-100 text-red-700 flex items-center justify-center"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 244}}
              , React.createElement(AlertTriangle, { className: "h-10 w-10" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 245}} )
            )

            , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 248}}
              , React.createElement(CardTitle, { className: "text-lg font-bold text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 249}}, "Check-in Failed" )
              , React.createElement(CardDescription, { className: "text-xs text-muted-foreground max-w-xs"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 250}}
                , errorMsg
              )
            )

            , React.createElement('div', { className: "flex gap-2 w-full"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 255}}
              , React.createElement(Button, { variant: "outline", className: "flex-1", onClick: () => setStatus("idle"), __self: this, __source: {fileName: _jsxFileName, lineNumber: 256}}, "Cancel"
              )
              , scanResult ? (
                  React.createElement(Button, { className: "flex-1 bg-primary text-primary-foreground hover:bg-primary/90"   , onClick: () => handleQrDecoded(scanResult), __self: this, __source: {fileName: _jsxFileName, lineNumber: 259}}, "Retry Location" )
                ) : (
                  React.createElement(Button, { className: "flex-1 bg-primary text-primary-foreground hover:bg-primary/90"   , onClick: startScanner, __self: this, __source: {fileName: _jsxFileName, lineNumber: 259}}, "Try Scanner again" )
                )
            )
          )
        )
      )

      /* Geolocation Loading View */
      , status === "checking-gps" && (
        React.createElement(Card, { className: "p-6 text-center glass animate-pulse"  , glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 269}}
          , React.createElement(CardContent, { className: "flex flex-col items-center justify-center space-y-4 pt-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 270}}
            , React.createElement('div', { className: "relative", __self: this, __source: {fileName: _jsxFileName, lineNumber: 271}}
              , React.createElement(MapPin, { className: "h-12 w-12 text-primary animate-bounce"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 272}} )
              , React.createElement(Loader2, { className: "absolute -bottom-1 -right-1 h-5 w-5 animate-spin text-muted-foreground"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 273}} )
            )
            , React.createElement('div', { className: "space-y-2 w-full", __self: this, __source: {fileName: _jsxFileName, lineNumber: 275}}
              , React.createElement(CardTitle, { className: "text-base font-bold text-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 276}}, "Verifying Location..." )
              , React.createElement(CardDescription, { className: "text-xs font-semibold text-primary max-w-xs mx-auto animate-pulse"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 277}}
                , geoProgress || "Retrieving highly accurate GPS coordinates..."
              )
              , geoReadings && geoReadings.length > 0 && (
                React.createElement('div', { className: "mt-4 text-[10px] text-muted-foreground space-y-1 bg-slate-50 border border-slate-100 rounded-lg p-2 max-w-xs mx-auto text-left" },
                  geoReadings.map((r, idx) => 
                    React.createElement('div', { key: idx, className: "flex justify-between font-mono" },
                      React.createElement('span', null, `Reading ${idx + 1}:`),
                      React.createElement('span', { className: "font-semibold text-[#BD4F2A]" }, `Accuracy ${Math.round(r.accuracy)}m`)
                    )
                  )
                )
              )
            )
          )
        )
      )

      /* Submitting View */
      , status === "submitting" && (
        React.createElement(Card, { className: "p-6 text-center glass"  , glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 287}}
          , React.createElement(CardContent, { className: "flex flex-col items-center justify-center space-y-4 pt-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 288}}
            , React.createElement(Loader2, { className: "h-12 w-12 animate-spin text-primary"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 289}} )
            , React.createElement('div', { className: "space-y-1", __self: this, __source: {fileName: _jsxFileName, lineNumber: 290}}
              , React.createElement(CardTitle, { className: "text-base text-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 291}}, "Processing Check-in..." )
              , React.createElement(CardDescription, { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 292}}, "Connecting to backend validation engine..."

              )
            )
          )
        )
      )

      /* Idle / Scanning View */
      , (status === "idle" || status === "scanning") && (
        React.createElement('div', { className: "space-y-4", __self: this, __source: {fileName: _jsxFileName, lineNumber: 302}}
          , React.createElement('div', { className: "space-y-1 text-center" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 303}}
            , React.createElement('h2', { className: "text-xl font-extrabold text-foreground"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 304}}, "QR Code Check-in"  )
            , React.createElement('p', { className: "text-xs text-muted-foreground" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 305}}, "Scan the physical QR code at the counter to verify your visit and earn loyalty stamps."

            )
          )

          , React.createElement(Card, { className: "glass overflow-hidden" , glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 310}}
            , React.createElement(CardContent, { className: "p-4 flex flex-col items-center justify-center space-y-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 311}}
              /* Scanner Screen Box */
              , React.createElement('div', { className: "relative h-64 w-full overflow-hidden rounded-lg bg-slate-50 border border-border flex items-center justify-center"          , __self: this, __source: {fileName: _jsxFileName, lineNumber: 313}}
                , status === "scanning" ? (
                  React.createElement(React.Fragment, null
                    , React.createElement('div', { id: "reader", className: "absolute inset-0 w-full h-full"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 316}} )
                    /* Glowing scanning laser line */
                    , React.createElement('div', { className: "absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-scan-laser pointer-events-none"            , __self: this, __source: {fileName: _jsxFileName, lineNumber: 318}} )
                  )
                ) : (
                  React.createElement('div', { className: "flex flex-col items-center justify-center space-y-2 text-muted-foreground"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 321}}
                    , React.createElement(QrCode, { className: "h-12 w-12" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 322}} )
                    , React.createElement('span', { className: "text-xs", __self: this, __source: {fileName: _jsxFileName, lineNumber: 323}}, "Scanner is offline"  )
                  )
                )
              )

              , errorMsg && (
                React.createElement('div', { className: "w-full text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-lg text-center"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 329}}
                  , errorMsg
                )
              )

              , status === "idle" ? (
                React.createElement(Button, { className: "w-full bg-primary text-primary-foreground hover:bg-primary/90"   , onClick: startScanner, __self: this, __source: {fileName: _jsxFileName, lineNumber: 335}}
                  , React.createElement(Camera, { className: "mr-2 h-4 w-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 336}} ), " Open Camera Scanner"
                )
              ) : (
                React.createElement(Button, { variant: "outline", className: "w-full", onClick: stopScanner, __self: this, __source: {fileName: _jsxFileName, lineNumber: 339}}, "Close Camera"

                )
              )

              , React.createElement('div', { className: "relative flex py-2 items-center w-full"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 344}}
                , React.createElement('div', { className: "flex-grow border-t border-border"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 345}})
                , React.createElement('span', { className: "flex-shrink mx-4 text-[10px] text-muted-foreground uppercase tracking-widest"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 346}}, "Or")
                , React.createElement('div', { className: "flex-grow border-t border-border"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 347}})
              )

              , React.createElement('div', { className: "w-full", __self: this, __source: {fileName: _jsxFileName, lineNumber: 350}}
                , React.createElement(Label, { htmlFor: "qr-file", className: "w-full", __self: this, __source: {fileName: _jsxFileName, lineNumber: 351}}
                  , React.createElement('div', { className: "flex items-center justify-center w-full h-11 px-4 border border-dashed border-border bg-slate-50/50 cursor-pointer hover:bg-slate-50/90 transition-colors rounded-lg"             , __self: this, __source: {fileName: _jsxFileName, lineNumber: 352}}
                    , React.createElement(Upload, { className: "mr-2 h-4 w-4 text-muted-foreground"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 353}} )
                    , React.createElement('span', { className: "text-xs text-muted-foreground font-medium"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 354}}, "Upload QR Code Image"   )
                  )
                )
                , React.createElement('input', {
                  id: "qr-file",
                  type: "file",
                  accept: "image/*",
                  onChange: handleFileChange,
                  className: "hidden", __self: this, __source: {fileName: _jsxFileName, lineNumber: 357}}
                )
              )
            )
          )

          , React.createElement(Card, { className: "bg-slate-50/40 border-border/50" , glass: true, __self: this, __source: {fileName: _jsxFileName, lineNumber: 368}}
            , React.createElement(CardHeader, { className: "p-4 pb-2" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 369}}
              , React.createElement(CardTitle, { className: "text-xs font-bold text-muted-foreground flex items-center"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 370}}
                , React.createElement(Sparkles, { className: "mr-2 h-3.5 w-3.5 text-primary"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 371}} ), " GPS Verification Rules"
              )
            )
            , React.createElement(CardContent, { className: "p-4 pt-0 text-[11px] text-muted-foreground space-y-1"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 374}}
              , React.createElement('p', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 375}}, "• You must be within the business outlet's accepted radius (default 100 meters) to check in."               )
              , React.createElement('p', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 376}}, "• Only 1 valid check-in is allowed per business per day."          )
              , React.createElement('p', {__self: this, __source: {fileName: _jsxFileName, lineNumber: 377}}, "• Device location spoofing or impossible travel patterns will trigger suspicious logs."           )
            )
          )
          
          /* Debug Panel (Dev Mode Only) */
          , import.meta.env.DEV && debugData && (
            React.createElement(Card, { className: "border-amber-200 bg-amber-50/20 p-4 mt-6 text-xs text-amber-900 font-mono space-y-2 border shadow-sm rounded-xl text-left" },
              React.createElement('div', { className: "font-bold border-b border-amber-200 pb-1 flex justify-between items-center text-[10px] uppercase tracking-wider text-amber-800" },
                React.createElement('span', null, "GPS Debug Panel"),
                React.createElement('span', { className: "bg-amber-100 px-1 py-0.5 rounded text-[9px]" }, "DEV MODE")
              ),
              React.createElement('div', { className: "grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1" },
                React.createElement('div', null,
                  React.createElement('span', { className: "text-muted-foreground block text-[9px]" }, "BUSINESS LAT"),
                  React.createElement('span', { className: "font-semibold" }, debugData.businessLatitude?.toFixed(6) || "N/A")
                ),
                React.createElement('div', null,
                  React.createElement('span', { className: "text-muted-foreground block text-[9px]" }, "BUSINESS LNG"),
                  React.createElement('span', { className: "font-semibold" }, debugData.businessLongitude?.toFixed(6) || "N/A")
                ),
                React.createElement('div', null,
                  React.createElement('span', { className: "text-muted-foreground block text-[9px]" }, "USER LAT"),
                  React.createElement('span', { className: "font-semibold" }, debugData.userLatitude?.toFixed(6) || "N/A")
                ),
                React.createElement('div', null,
                  React.createElement('span', { className: "text-muted-foreground block text-[9px]" }, "USER LNG"),
                  React.createElement('span', { className: "font-semibold" }, debugData.userLongitude?.toFixed(6) || "N/A")
                ),
                React.createElement('div', null,
                  React.createElement('span', { className: "text-muted-foreground block text-[9px]" }, "GPS ACCURACY"),
                  React.createElement('span', { className: "font-semibold" }, debugData.accuracy ? `${Math.round(debugData.accuracy)}m` : "N/A")
                ),
                React.createElement('div', null,
                  React.createElement('span', { className: "text-muted-foreground block text-[9px]" }, "CALCULATED DISTANCE"),
                  React.createElement('span', { className: "font-semibold" }, debugData.distance !== null ? `${Math.round(debugData.distance)}m` : "N/A")
                ),
                React.createElement('div', null,
                  React.createElement('span', { className: "text-muted-foreground block text-[9px]" }, "ALLOWED RADIUS"),
                  React.createElement('span', { className: "font-semibold" }, debugData.radius ? `${debugData.radius}m` : "N/A")
                ),
                React.createElement('div', null,
                  React.createElement('span', { className: "text-muted-foreground block text-[9px]" }, "VALIDATION STATUS"),
                  React.createElement('span', { 
                    className: `font-bold uppercase ${debugData.status === 'VALID' ? 'text-emerald-700' : 'text-rose-700'}` 
                  }, debugData.status)
                )
              )
            )
          )
        )
      )
    )
  );
}

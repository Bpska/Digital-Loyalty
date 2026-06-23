import { useNavigate, useSearchParams } from "react-router-dom";
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { api, getImageUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { QrCode, Camera, Upload, AlertTriangle, CheckCircle, Loader2, Award, Sparkles } from "lucide-react";

export default function CheckinPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const [scanResult, setScanResult] = useState(null);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState(null);
  const [checkInDetails, setCheckInDetails] = useState(null);
  const [loyaltyRequestSent, setLoyaltyRequestSent] = useState(false);

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
            (_errorMessage) => {
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
    const file = e?.target?.files?.[0];
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
    setStatus("submitting");

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
        const payload = JSON.parse(decodedText);
        if (payload && payload.token) {
          parsedToken = payload.token;
        }
      } catch (e) {
        // Plain token fallback
      }
    }

    try {
      // Get or create device fingerprint
      let deviceId = localStorage.getItem("deviceId");
      if (!deviceId) {
        if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
          deviceId = window.crypto.randomUUID();
        } else {
          deviceId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });
        }
        localStorage.setItem("deviceId", deviceId);
      }

      // Submit check-in — no GPS required
      const response = await api.post("/checkins", {
        qrToken: parsedToken,
        deviceId,
      });

      if (response.success && response.data) {
        const data = response.data;
        setCheckInDetails(data);
        setStatus("success");
        queryClient.invalidateQueries({ queryKey: ["customerDashboard"] });
        queryClient.invalidateQueries({ queryKey: ["checkinHistory"] });
        queryClient.invalidateQueries({ queryKey: ["rewardsHistory"] });

        // Auto-submit loyalty approval request (non-blocking)
        const businessId = data.checkIn?.businessId;
        if (businessId) {
          try {
            const reqRes = await api.post("/loyalty-approval/request", {
              businessId,
              checkInId: data.checkIn?.id,
            });
            if (reqRes.data?.sent) {
              setLoyaltyRequestSent(true);
              queryClient.invalidateQueries({ queryKey: ["loyaltyHistory"] });
            }
          } catch (_) {
            // Silently ignore — loyalty approval request is best-effort
          }
        }
      } else {
        throw new Error(response.message || "Failed to complete check-in.");
      }
    } catch (err) {
      console.error("Check-in failed:", err);
      setStatus("error");
      const backendErrorMsg = err.response?.data?.message || err.message;
      setErrorMsg(backendErrorMsg || "Check-in failed. Please try again.");
    }
  };

  return (
    React.createElement('div', { className: "space-y-6 max-w-sm mx-auto" },

      /* Hidden element for file scanning */
      React.createElement('div', {
        id: "reader-hidden",
        style: { position: 'absolute', left: '-9999px', top: '-9999px', width: '1px', height: '1px', overflow: 'hidden' },
      }),

      /* ── Success View ── */
      status === "success" && checkInDetails && (
        React.createElement(Card, { className: "border-emerald-100 bg-emerald-50/20 text-center p-6 animate-fade-in", glass: true },
          React.createElement(CardContent, { className: "flex flex-col items-center justify-center space-y-4 pt-4" },
            /* Business Branding Header */
            React.createElement('div', { className: "flex flex-col items-center space-y-2 pb-2" },
              checkInDetails.businessLogo ? React.createElement('img', {
                src: getImageUrl(checkInDetails.businessLogo),
                alt: checkInDetails.businessName || "Business Logo",
                className: "h-16 w-16 rounded-full object-cover border-2 border-emerald-500/20 shadow-md"
              }) : React.createElement('div', {
                className: "h-16 w-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-50 border-2 border-emerald-500/20 flex items-center justify-center font-bold text-emerald-700 shadow-md text-xl"
              }, (checkInDetails.businessName?.[0] || "B")),
              React.createElement('h3', { className: "text-sm font-black text-foreground" }, checkInDetails.businessName)
            ),

            React.createElement('div', { className: "h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center" },
              React.createElement(CheckCircle, { className: "h-6 w-6" })
            ),

            React.createElement('div', { className: "space-y-1" },
              React.createElement(CardTitle, { className: "text-xl font-bold text-foreground" },
                checkInDetails.pointsEarned > 0 ? "Check-in Successful! 🎉" : "Visit Recorded ✅"
              ),
              React.createElement(CardDescription, { className: "text-sm text-muted-foreground" }, 
                checkInDetails.pointsEarned > 0 
                  ? "Your loyalty points have been added." 
                  : loyaltyRequestSent
                    ? "Your loyalty request has been sent to the business."
                    : "No active loyalty program is running at this business right now."
              )
            ),

            checkInDetails.pointsEarned > 0 && React.createElement('div', { className: "w-full bg-slate-50 rounded-xl p-4 border border-border/50 space-y-2" },
              React.createElement('div', { className: "flex justify-between items-center text-sm" },
                React.createElement('span', { className: "text-muted-foreground" }, "Points Added:"),
                React.createElement('span', { className: "font-bold text-primary" }, "+", checkInDetails.pointsEarned, " Points")
              ),
              React.createElement('div', { className: "flex justify-between items-center text-sm" },
                React.createElement('span', { className: "text-muted-foreground" }, "Stamps Streak:"),
                React.createElement('span', { className: "font-semibold text-foreground" }, checkInDetails.visitStreak, " Visits")
              ),
              React.createElement('div', { className: "flex justify-between items-center text-xs text-muted-foreground pt-2 border-t border-border" },
                React.createElement('span', null, "Total Visits Recorded:"),
                React.createElement('span', null, checkInDetails.totalVisits, " visits")
              )
            ),

            checkInDetails.newlyUnlockedReward && (
              React.createElement('div', { className: "w-full rounded-xl bg-gradient-to-tr from-indigo-50/40 to-primary/5 border border-primary/20 p-4 space-y-2 text-left" },
                React.createElement('div', { className: "flex items-center space-x-2 text-primary font-bold text-xs uppercase tracking-wider" },
                  React.createElement(Award, { className: "h-4 w-4" }), " Reward Unlocked!"
                ),
                React.createElement('h4', { className: "text-sm font-extrabold text-foreground" },
                  checkInDetails.newlyUnlockedReward.title
                ),
                React.createElement('p', { className: "text-[11px] text-muted-foreground" }, "Code: ",
                  React.createElement('code', { className: "font-mono text-foreground bg-slate-100 px-1 py-0.5 rounded" },
                    checkInDetails.newlyUnlockedReward.redemptionCode.toUpperCase()
                  )
                ),
                React.createElement('p', { className: "text-[10px] text-muted-foreground" },
                  "This voucher is saved in your wallet. Show it to staff anytime to claim it."
                )
              )
            ),

            /* Loyalty Request Sent Banner */
            loyaltyRequestSent && checkInDetails.pointsEarned === 0 && React.createElement('div', {
              className: "w-full rounded-xl bg-blue-50 border border-blue-200 p-4 flex items-start gap-3"
            },
              React.createElement('div', { className: "h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0" },
                React.createElement(Award, { className: "h-4 w-4 text-blue-700" })
              ),
              React.createElement('div', { className: "text-left" },
                React.createElement('p', { className: "font-bold text-sm text-blue-900" }, "Loyalty Request Sent!"),
                React.createElement('p', { className: "text-xs text-blue-700 mt-0.5" },
                  "The business owner will review your visit and award you loyalty points shortly."
                )
              )
            ),

            React.createElement(Button, {
              variant: "outline",
              className: "w-full rounded-full border-primary text-primary hover:bg-primary/10",
              onClick: () => navigate(`/review?businessId=${checkInDetails.checkIn?.businessId}`),
            }, "⭐ Rate Your Experience"),

            React.createElement(Button, {
              className: "w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full",
              onClick: () => navigate("/dashboard"),
            }, "Go to Dashboard")
          )
        )
      ),

      /* ── Error View ── */
      status === "error" && (
        React.createElement(Card, { className: "border-red-100 bg-red-50/20 p-6 animate-fade-in", glass: true },
          React.createElement(CardContent, { className: "flex flex-col items-center justify-center space-y-4 pt-4 text-center" },
            React.createElement('div', { className: "h-16 w-16 rounded-full bg-red-100 text-red-700 flex items-center justify-center" },
              React.createElement(AlertTriangle, { className: "h-10 w-10" })
            ),
            React.createElement('div', { className: "space-y-1" },
              React.createElement(CardTitle, { className: "text-lg font-bold text-foreground" }, "Check-in Failed"),
              React.createElement(CardDescription, { className: "text-xs text-muted-foreground max-w-xs" }, errorMsg)
            ),
            React.createElement('div', { className: "flex gap-2 w-full" },
              React.createElement(Button, { variant: "outline", className: "flex-1 rounded-full", onClick: () => setStatus("idle") }, "Cancel"),
              React.createElement(Button, {
                className: "flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full",
                onClick: () => scanResult ? handleQrDecoded(scanResult) : startScanner(),
              }, scanResult ? "Try Again" : "Scan Again")
            )
          )
        )
      ),

      /* ── Submitting View ── */
      status === "submitting" && (
        React.createElement(Card, { className: "p-6 text-center glass", glass: true },
          React.createElement(CardContent, { className: "flex flex-col items-center justify-center space-y-4 pt-4" },
            React.createElement(Loader2, { className: "h-12 w-12 animate-spin text-primary" }),
            React.createElement('div', { className: "space-y-1" },
              React.createElement(CardTitle, { className: "text-base text-foreground" }, "Processing Check-in..."),
              React.createElement(CardDescription, { className: "text-xs text-muted-foreground" }, "Awarding your loyalty points...")
            )
          )
        )
      ),

      /* ── Idle / Scanning View ── */
      (status === "idle" || status === "scanning") && (
        React.createElement('div', { className: "space-y-4" },
          React.createElement('div', { className: "space-y-1 text-center" },
            React.createElement('h2', { className: "text-xl font-extrabold text-foreground" }, "QR Code Check-in"),
            React.createElement('p', { className: "text-xs text-muted-foreground" },
              "Scan the QR code at the counter to earn loyalty points instantly."
            )
          ),

          React.createElement(Card, { className: "glass overflow-hidden", glass: true },
            React.createElement(CardContent, { className: "p-4 flex flex-col items-center justify-center space-y-4" },

              /* Scanner Screen Box */
              React.createElement('div', { className: "relative h-64 w-full overflow-hidden rounded-lg bg-slate-50 border border-border flex items-center justify-center" },
                status === "scanning" ? (
                  React.createElement(React.Fragment, null,
                    React.createElement('div', { id: "reader", className: "absolute inset-0 w-full h-full" }),
                    React.createElement('div', { className: "absolute inset-0 flex items-center justify-center pointer-events-none z-10" },
                      React.createElement('div', { className: "w-48 h-48 rounded-2xl shadow-[0_0_0_9999px_rgba(7,18,42,0.65)] border border-white/20 relative overflow-hidden flex items-center justify-center" }
                        , React.createElement('div', { className: "absolute top-0 left-0 w-6 h-6 border-t-[4px] border-l-[4px] border-[#10B981] rounded-tl-lg" })
                        , React.createElement('div', { className: "absolute top-0 right-0 w-6 h-6 border-t-[4px] border-r-[4px] border-[#10B981] rounded-tr-lg" })
                        , React.createElement('div', { className: "absolute bottom-0 left-0 w-6 h-6 border-b-[4px] border-l-[4px] border-[#10B981] rounded-bl-lg" })
                        , React.createElement('div', { className: "absolute bottom-0 right-0 w-6 h-6 border-b-[4px] border-r-[4px] border-[#10B981] rounded-br-lg" })
                        , React.createElement('div', { className: "absolute left-1 right-1 h-[3px] bg-emerald-400 shadow-[0_0_12px_#34d399] animate-scan-laser pointer-events-none" })
                        , React.createElement('div', { className: "absolute inset-0 bg-[linear-gradient(rgba(52,211,153,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,0.04)_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" })
                      )
                    )
                  )
                ) : (
                  React.createElement('div', { className: "flex flex-col items-center justify-center space-y-2 text-muted-foreground" },
                    React.createElement(QrCode, { className: "h-12 w-12" }),
                    React.createElement('span', { className: "text-xs" }, "Scanner is offline")
                  )
                )
              ),

              errorMsg && (
                React.createElement('div', { className: "w-full text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-lg text-center" },
                  errorMsg
                )
              ),

              status === "idle" ? (
                React.createElement(Button, { className: "w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full", onClick: startScanner },
                  React.createElement(Camera, { className: "mr-2 h-4 w-4" }), " Open Camera Scanner"
                )
              ) : (
                React.createElement(Button, { variant: "outline", className: "w-full rounded-full", onClick: stopScanner }, "Close Camera")
              ),

              React.createElement('div', { className: "relative flex py-2 items-center w-full" },
                React.createElement('div', { className: "flex-grow border-t border-border" }),
                React.createElement('span', { className: "flex-shrink mx-4 text-[10px] text-muted-foreground uppercase tracking-widest" }, "Or"),
                React.createElement('div', { className: "flex-grow border-t border-border" })
              ),

              React.createElement('div', { className: "w-full" },
                React.createElement(Label, { htmlFor: "qr-file", className: "w-full" },
                  React.createElement('div', { className: "flex items-center justify-center w-full h-11 px-4 border border-dashed border-border bg-slate-50/50 cursor-pointer hover:bg-slate-50/90 transition-colors rounded-lg" },
                    React.createElement(Upload, { className: "mr-2 h-4 w-4 text-muted-foreground" }),
                    React.createElement('span', { className: "text-xs text-muted-foreground font-medium" }, "Upload QR Code Image")
                  )
                ),
                React.createElement('input', {
                  id: "qr-file",
                  type: "file",
                  accept: "image/*",
                  onChange: handleFileChange,
                  className: "hidden",
                })
              )
            )
          ),

          /* How it works info card */
          React.createElement(Card, { className: "bg-slate-50/40 border-border/50", glass: true },
            React.createElement(CardHeader, { className: "p-4 pb-2" },
              React.createElement(CardTitle, { className: "text-xs font-bold text-muted-foreground flex items-center" },
                React.createElement(Sparkles, { className: "mr-2 h-3.5 w-3.5 text-primary" }), " How Check-in Works"
              )
            ),
            React.createElement(CardContent, { className: "p-4 pt-0 text-[11px] text-muted-foreground space-y-1" },
              React.createElement('p', null, "• Scan the QR code at the business counter to earn loyalty points."),
              React.createElement('p', null, "• Only 1 check-in is allowed per business per day."),
              React.createElement('p', null, "• Points are added instantly — no waiting required.")
            )
          )
        )
      )
    )
  );
}

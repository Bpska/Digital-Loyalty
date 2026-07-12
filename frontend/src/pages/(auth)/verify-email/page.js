import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Mail, Loader2, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmailOtp, resendEmailOtp, loading, error, clearError } = useAuthStore();

  const userId = location.state?.userId;
  const email = location.state?.email;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [resendStatus, setResendStatus] = useState(null); // 'success', 'error', or null
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  // Redirect if no userId
  useEffect(() => {
    if (!userId) {
      navigate("/login", { replace: true });
    }
  }, [userId, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Clear errors on mount
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Allow only digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only keep the last digit
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Clear previous input and focus it
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs[index - 1].current.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pastedData)) return; // Ensure exactly 6 digits

    const digits = pastedData.split("");
    setOtp(digits);
    inputRefs[5].current.focus();
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    clearError();
    const otpCode = otp.join("");
    if (otpCode.length < 6) return;

    const success = await verifyEmailOtp(userId, otpCode);
    if (success) {
      setVerificationSuccess(true);
      setTimeout(() => {
        // Redirect based on role
        const currentUser = useAuthStore.getState().user;
        if (currentUser?.role === "SUPER_ADMIN") {
          navigate("/dashboard/super");
        } else if (currentUser?.role === "BUSINESS_ADMIN") {
          navigate("/dashboard/business");
        } else {
          navigate("/dashboard");
        }
      }, 1500);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    clearError();
    setResendStatus(null);

    const success = await resendEmailOtp(userId);
    if (success) {
      setResendStatus("success");
      setTimer(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs[0].current.focus();
    } else {
      setResendStatus("error");
    }
  };

  // Check if OTP is fully entered
  const isOtpComplete = otp.every((digit) => digit !== "");

  const _jsxFileName = "src\\pages\\(auth)\\verify-email\\page.jsx";

  return React.createElement("div", { className: "relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1 } },
    /* Header Brand */
    React.createElement("div", { className: "mb-8 flex flex-col items-center text-center animate-fade-in" },
      React.createElement("img", { src: "/new.png", alt: "LogiSaar Logo", className: "h-11 w-auto object-contain mb-3" }),
      React.createElement("h1", { className: "text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl" }, "ScanLoyal"),
      React.createElement("p", { className: "mt-2 text-sm text-muted-foreground max-w-sm" }, "Digital Loyalty Voucher Platform")
    ),

    React.createElement(Card, { className: "w-full max-w-[440px] glass animate-fade-in", glass: true },
      React.createElement(CardHeader, { className: "space-y-1 pb-4" },
        React.createElement(CardTitle, { className: "text-2xl text-center font-bold" }, "Verify Your Email"),
        React.createElement(CardDescription, { className: "text-center text-muted-foreground text-sm mt-1" },
          "We sent a 6-digit verification code to your email address:",
          React.createElement("div", { className: "font-semibold text-foreground mt-1 break-all" }, email || "your registered email")
        )
      ),

      React.createElement(CardContent, { className: "space-y-6" },
        verificationSuccess ? (
          React.createElement("div", { className: "flex flex-col items-center justify-center space-y-3 py-6 text-center animate-scale-up" },
            React.createElement(CheckCircle2, { className: "h-16 w-16 text-emerald-500 animate-bounce" }),
            React.createElement("h3", { className: "text-lg font-bold text-foreground" }, "Email Verified Successfully"),
            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Redirecting you to dashboard...")
          )
        ) : (
          React.createElement("form", { onSubmit: handleVerify, className: "space-y-6" },
            // Error messages
            error && React.createElement("div", { className: "rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive text-center" }, error),
            
            // Resend success/error messages
            resendStatus === "success" && React.createElement("div", { className: "rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-600 text-center" }, "A new OTP verification code has been sent to your email."),
            resendStatus === "error" && React.createElement("div", { className: "rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive text-center" }, "Failed to resend OTP. Please try again."),

            // OTP Input group
            React.createElement("div", { className: "flex justify-center gap-2 sm:gap-3 py-2", onPaste: handlePaste },
              otp.map((digit, index) => 
                React.createElement("input", {
                  key: index,
                  ref: inputRefs[index],
                  type: "text",
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  maxLength: 1,
                  value: digit,
                  onChange: (e) => handleChange(index, e.target.value),
                  onKeyDown: (e) => handleKeyDown(index, e),
                  className: "w-11 h-12 text-center text-xl font-bold bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-800",
                  disabled: loading
                })
              )
            ),

            React.createElement(Button, {
              type: "submit",
              className: "w-full py-6 font-semibold bg-primary hover:bg-primary/95 text-white",
              disabled: loading || !isOtpComplete
            },
              loading ? (
                React.createElement("div", { className: "flex items-center justify-center gap-2" },
                  React.createElement(Loader2, { className: "h-4 w-4 animate-spin" }),
                  "Verifying OTP..."
                )
              ) : "Verify Email"
            )
          )
        )
      ),

      !verificationSuccess && React.createElement(CardFooter, { className: "flex flex-col items-center space-y-4 border-t border-border pt-6 pb-6 text-center" },
        React.createElement("div", { className: "text-xs text-muted-foreground flex items-center gap-1.5" },
          "Didn't receive the code?",
          timer > 0 ? (
            React.createElement("span", { className: "font-semibold text-foreground" }, `Resend in ${timer}s`)
          ) : (
            React.createElement("button", {
              type: "button",
              onClick: handleResend,
              className: "text-primary hover:underline font-semibold flex items-center gap-1",
              disabled: loading
            },
              React.createElement(RefreshCw, { className: "h-3 w-3" }),
              "Resend Code"
            )
          )
        ),
        React.createElement("button", {
          type: "button",
          onClick: () => navigate("/login"),
          className: "text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
        },
          React.createElement(ArrowLeft, { className: "h-3 w-3" }),
          "Back to Sign In"
        )
      )
    )
  );
}

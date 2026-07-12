import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, ArrowLeft, RefreshCw, CheckCircle2, Eye, EyeOff } from "lucide-react";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { sendForgotPasswordOtp, resetPassword, loading, error, clearError } = useAuthStore();

  const [step, setStep] = useState(1); // 1: Send OTP, 2: Reset Password, 3: Success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(0);
  const [resendStatus, setResendStatus] = useState(null);
  
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  // Countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Clear error on load or step change
  useEffect(() => {
    clearError();
  }, [step, clearError]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return;

    const success = await sendForgotPasswordOtp(email);
    if (success) {
      setStep(2);
      setTimer(60);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setResendStatus(null);
    const success = await sendForgotPasswordOtp(email);
    if (success) {
      setResendStatus("success");
      setTimer(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs[0].current.focus();
    } else {
      setResendStatus("error");
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
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

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pastedData)) return;

    const digits = pastedData.split("");
    setOtp(digits);
    inputRefs[5].current.focus();
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearError();

    const otpCode = otp.join("");
    if (otpCode.length < 6) return;
    if (!newPassword || newPassword.length < 8) return;
    if (newPassword !== confirmPassword) {
      useAuthStore.setState({ error: "Passwords do not match" });
      return;
    }

    const success = await resetPassword(email, otpCode, newPassword);
    if (success) {
      setStep(3);
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== "");
  const _jsxFileName = "src\\pages\\(auth)\\forgot-password\\page.jsx";

  return React.createElement("div", { className: "relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12", __self: this, __source: { fileName: _jsxFileName, lineNumber: 1 } },
    /* Header Brand */
    React.createElement("div", { className: "mb-8 flex flex-col items-center text-center animate-fade-in" },
      React.createElement("img", { src: "/new.png", alt: "LogiSaar Logo", className: "h-11 w-auto object-contain mb-3" }),
      React.createElement("h1", { className: "text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl" }, "ScanLoyal"),
      React.createElement("p", { className: "mt-2 text-sm text-muted-foreground max-w-sm" }, "Digital Loyalty Voucher Platform")
    ),

    React.createElement(Card, { className: "w-full max-w-[440px] glass animate-fade-in", glass: true },
      React.createElement(CardHeader, { className: "space-y-1 pb-4" },
        React.createElement(CardTitle, { className: "text-2xl text-center font-bold" }, 
          step === 1 ? "Reset Password" : step === 2 ? "Verify OTP" : "Success!"
        ),
        React.createElement(CardDescription, { className: "text-center text-muted-foreground text-sm mt-1" },
          step === 1 ? "Enter your email address and we'll send you a 6-digit verification code." :
          step === 2 ? `We sent a verification code to ${email}` :
          "Your password has been successfully reset."
        )
      ),

      React.createElement(CardContent, { className: "space-y-4" },
        error && React.createElement("div", { className: "rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive text-center" }, error),

        step === 1 && React.createElement("form", { onSubmit: handleSendOtp, className: "space-y-4" },
          React.createElement("div", { className: "space-y-2" },
            React.createElement(Label, { htmlFor: "email" }, "Email Address"),
            React.createElement("div", { className: "relative" },
              React.createElement(Mail, { className: "absolute inset-y-0 left-3 h-5 w-5 top-1/2 -translate-y-1/2 text-zinc-500" }),
              React.createElement(Input, {
                id: "email",
                type: "email",
                placeholder: "ananya@gmail.com",
                value: email,
                onChange: (e) => setEmail(e.target.value),
                className: "pl-10",
                required: true,
                disabled: loading
              })
            )
          ),
          React.createElement(Button, { type: "submit", className: "w-full mt-2", disabled: loading || !email },
            loading ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin mr-2" }) : null,
            "Send Code"
          )
        ),

        step === 2 && React.createElement("form", { onSubmit: handleResetPassword, className: "space-y-4" },
          resendStatus === "success" && React.createElement("div", { className: "rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-600 text-center" }, "A new verification code has been sent to your email."),
          resendStatus === "error" && React.createElement("div", { className: "rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive text-center" }, "Failed to resend code. Please try again."),

          // OTP inputs
          React.createElement("div", { className: "space-y-2" },
            React.createElement(Label, null, "Enter 6-Digit Code"),
            React.createElement("div", { className: "flex justify-center gap-2 py-1", onPaste: handleOtpPaste },
              otp.map((digit, index) => 
                React.createElement("input", {
                  key: index,
                  ref: inputRefs[index],
                  type: "text",
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  maxLength: 1,
                  value: digit,
                  onChange: (e) => handleOtpChange(index, e.target.value),
                  onKeyDown: (e) => handleOtpKeyDown(index, e),
                  className: "w-11 h-12 text-center text-xl font-bold bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-slate-800",
                  disabled: loading
                })
              )
            )
          ),

          // New Password field
          React.createElement("div", { className: "space-y-2" },
            React.createElement(Label, { htmlFor: "new-password" }, "New Password"),
            React.createElement("div", { className: "relative" },
              React.createElement(Lock, { className: "absolute inset-y-0 left-3 h-5 w-5 top-1/2 -translate-y-1/2 text-zinc-500" }),
              React.createElement(Input, {
                id: "new-password",
                type: showPassword ? "text" : "password",
                placeholder: "••••••••",
                value: newPassword,
                onChange: (e) => setNewPassword(e.target.value),
                className: "pl-10 pr-10",
                required: true,
                minLength: 8,
                disabled: loading
              }),
              React.createElement("button", {
                type: "button",
                onClick: () => setShowPassword(!showPassword),
                className: "absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-300"
              },
                showPassword ? React.createElement(EyeOff, { className: "h-4 w-4" }) : React.createElement(Eye, { className: "h-4 w-4" })
              )
            ),
            newPassword.length > 0 && newPassword.length < 8 && React.createElement("p", { className: "text-xs text-destructive mt-1" }, "Password must be at least 8 characters")
          ),

          // Confirm Password field
          React.createElement("div", { className: "space-y-2" },
            React.createElement(Label, { htmlFor: "confirm-password" }, "Confirm New Password"),
            React.createElement("div", { className: "relative" },
              React.createElement(Lock, { className: "absolute inset-y-0 left-3 h-5 w-5 top-1/2 -translate-y-1/2 text-zinc-500" }),
              React.createElement(Input, {
                id: "confirm-password",
                type: showPassword ? "text" : "password",
                placeholder: "••••••••",
                value: confirmPassword,
                onChange: (e) => setConfirmPassword(e.target.value),
                className: "pl-10 pr-10",
                required: true,
                disabled: loading
              })
            ),
            confirmPassword.length > 0 && newPassword !== confirmPassword && React.createElement("p", { className: "text-xs text-destructive mt-1" }, "Passwords do not match")
          ),

          React.createElement(Button, {
            type: "submit",
            className: "w-full mt-2 bg-primary hover:bg-primary/95 text-white",
            disabled: loading || !isOtpComplete || newPassword.length < 8 || newPassword !== confirmPassword
          },
            loading ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin mr-2" }) : null,
            "Reset Password"
          )
        ),

        step === 3 && React.createElement("div", { className: "flex flex-col items-center justify-center space-y-4 py-4 text-center animate-scale-up" },
          React.createElement(CheckCircle2, { className: "h-16 w-16 text-emerald-500 animate-bounce" }),
          React.createElement("h3", { className: "text-lg font-bold text-foreground" }, "Password Reset Successfully"),
          React.createElement("p", { className: "text-xs text-muted-foreground max-w-[280px]" }, "You can now log in to your account with your new password."),
          React.createElement(Button, { className: "w-full mt-2", onClick: () => navigate("/login") }, "Go to Sign In")
        )
      ),

      step !== 3 && React.createElement(CardFooter, { className: "flex flex-col items-center space-y-4 border-t border-border pt-6 pb-6 text-center" },
        step === 2 && React.createElement("div", { className: "text-xs text-muted-foreground flex items-center gap-1.5" },
          "Didn't receive the code?",
          timer > 0 ? (
            React.createElement("span", { className: "font-semibold text-foreground" }, `Resend in ${timer}s`)
          ) : (
            React.createElement("button", {
              type: "button",
              onClick: handleResendOtp,
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
          onClick: () => {
            if (step === 2) {
              setStep(1);
            } else {
              navigate("/login");
            }
          },
          className: "text-xs text-zinc-500 hover:text-zinc-700 flex items-center gap-1.5 transition-colors"
        },
          React.createElement(ArrowLeft, { className: "h-3 w-3" }),
          step === 2 ? "Back to Email Input" : "Back to Sign In"
        )
      )
    )
  );
}

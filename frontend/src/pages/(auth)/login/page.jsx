import { useNavigate, Link, useLocation } from "react-router-dom";
const _jsxFileName = "src\\pages\\(auth)\\login\\page.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } "use client";

import React, { useState, useEffect } from "react";

import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, Lock, Eye, EyeOff, Loader2, Mail, User, Phone, Store, MapPin, ChevronDown, Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, error, loginWithPassword, registerCustomer, registerBusiness, loginWithGoogle, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [businessName, setBusinessName] = useState("");

  const [businessAddress, setBusinessAddress] = useState("");
  const [category, setCategory] = useState("Cafe");
  const [customCategory, setCustomCategory] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");
  const [successMsg, setSuccessMsg] = useState(null);
  const [showForgotDialog, setShowForgotDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("customer");

  const [pendingUserId, setPendingUserId] = useState(null);
  const [pendingEmail, setPendingEmail] = useState(null);

  const handleResendVerification = async () => {
    if (!pendingUserId) return;
    clearError();
    await useAuthStore.getState().sendEmailOtp(pendingUserId);
    navigate("/verify-email", { state: { userId: pendingUserId, email: pendingEmail } });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("signup") === "true") {
      setIsSignUp(true);
      setActiveTab("business");
    }
  }, [location]);

  // Google Login states
  const [googleInitialized, setGoogleInitialized] = useState(false);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [googleIdToken, setGoogleIdToken] = useState("");
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleName, setGoogleName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState(null);

  const handleGoogleCredential = async (response) => {
    const idToken = response.credential;
    setGoogleIdToken(idToken);
    setGoogleLoading(true);
    setGoogleError(null);
    clearError();

    try {
      const res = await loginWithGoogle(idToken);
      if (res && typeof res === "object" && res.newUser) {
        setGoogleEmail(res.email);
        setGoogleName(res.name || "");
        setShowPhoneDialog(true);
      }
    } catch (e) {
      setGoogleError(e.message || "Failed to authenticate with Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (!regPhone || regPhone.length < 10) return;
    setGoogleLoading(true);
    setGoogleError(null);

    try {
      const res = await loginWithGoogle(googleIdToken, regPhone);
      if (res === true) {
        setShowPhoneDialog(false);
      }
    } catch (e) {
      setGoogleError(e.message || "Failed to complete Google registration");
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    let interval;

    const initGoogle = () => {
      if (_optionalChain([(window), 'access', _ => _.google, 'optionalAccess', _2 => _2.accounts, 'optionalAccess', _3 => _3.id])) {
        clearInterval(interval);
        (window).google.accounts.id.initialize({
          client_id: "1040233021904-bjmc7dg467e60lfachphp39id4urbcgj.apps.googleusercontent.com",
          callback: handleGoogleCredential,
        });
        setGoogleInitialized(true);
      }
    };

    interval = setInterval(initGoogle, 300);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (googleInitialized && activeTab === "customer" && _optionalChain([(window), 'access', _4 => _4.google, 'optionalAccess', _5 => _5.accounts, 'optionalAccess', _6 => _6.id])) {
      setTimeout(() => {
        const btnContainer = document.getElementById("google-signin-btn");
        if (btnContainer) {
          (window).google.accounts.id.renderButton(btnContainer, {
            theme: "outline",
            size: "large",
            width: btnContainer.clientWidth || 340,
          });
        }
      }, 150);
    }
  }, [activeTab, googleInitialized]);

  // Handle back button navigation to redirect to landing page
  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname);
    const handlePopState = () => {
      navigate("/", { replace: true });
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === "SUPER_ADMIN") {
        navigate("/dashboard/super");
      } else if (user.role === "BUSINESS_ADMIN") {
        navigate("/dashboard/business");
      } else {
        if (typeof window !== "undefined") {
          const pending = sessionStorage.getItem("pendingCheckin");
          if (pending) {
            try {
              const { businessId, branchId, token } = JSON.parse(pending);
              sessionStorage.removeItem("pendingCheckin");
              navigate(`/checkin?businessId=${businessId}&branchId=${branchId}&token=${token}`);
              return;
            } catch (e) {
              // Ignore
            }
          }
        }
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setPendingUserId(null);
    setPendingEmail(null);
    if (isSignUp) {
      if (!name || !email || !phone || !password) return;
      if (password.length < 8) return;
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      const res = await registerCustomer(name, email, formattedPhone, password);
      if (res && res.requiresVerification) {
        navigate("/verify-email", { state: { userId: res.userId, email: res.email } });
      }
    } else {
      if (!email || !password) return;
      const res = await loginWithPassword(email, password);
      if (res && res.requiresVerification) {
        navigate("/verify-email", { state: { userId: res.userId, email: res.email } });
      } else if (res && res.emailNotVerified) {
        setPendingUserId(res.userId);
        setPendingEmail(res.email);
      }
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    clearError();
    setPendingUserId(null);
    setPendingEmail(null);
    if (isSignUp) {
      if (!name || !email || !phone || !password || !businessName) return;
      if (password.length < 8) return;
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      const finalCategory = category === "Other" ? (customCategory || "Other") : category;
      const res = await registerBusiness(name, email, formattedPhone, password, businessName, businessAddress, finalCategory, bookingUrl || null);
      if (res && res.requiresVerification) {
        navigate("/verify-email", { state: { userId: res.userId, email: res.email } });
      } else if (res && !useAuthStore.getState().user) {
        setSuccessMsg("Your registration was successful! Please check your email for the verification code.");
      }
    } else {
      if (!email || !password) return;
      const res = await loginWithPassword(email, password);
      if (res && res.requiresVerification) {
        navigate("/verify-email", { state: { userId: res.userId, email: res.email } });
      } else if (res && res.emailNotVerified) {
        setPendingUserId(res.userId);
        setPendingEmail(res.email);
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-tr from-[#FFF7ED] via-white to-[#FFF7ED] flex flex-col items-center justify-center p-4">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] aspect-square rounded-full bg-gradient-to-br from-orange-200/40 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] aspect-square rounded-full bg-gradient-to-tl from-orange-200/30 to-transparent blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-[420px] z-10 flex flex-col items-center space-y-6">

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2 select-none">
          <div className="h-14 w-14 rounded-2xl bg-white shadow-xl shadow-orange-500/10 flex items-center justify-center border border-white/50 animate-fade-in hover:scale-105 transition-transform duration-300">
            <img src="/new.png" alt="LogiSaar Logo" className="h-8 w-auto object-contain" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 mt-2">
            Scan<span className="text-[#FF6A00]">Loyal</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-xs leading-relaxed">
            Elevating customer retention with smart digital loyalty cards
          </p>
        </div>

        {successMsg ? (
          <Card className="w-full bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden animate-scale-up">
            <CardHeader className="space-y-2 pt-8 pb-4 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-2">
                <Sparkles size={24} />
              </div>
              <CardTitle className="text-xl font-bold text-slate-900">Registration Successful</CardTitle>
              <CardDescription className="text-xs text-slate-500">Your registration request has been submitted</CardDescription>
            </CardHeader>
            <CardContent className="px-6 py-4 text-center">
              <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
                {successMsg}
              </p>
            </CardContent>
            <CardFooter className="p-6 border-t border-slate-100 flex justify-center">
              <Button
                onClick={() => { setSuccessMsg(null); setIsSignUp(false); }}
                className="w-full bg-[#FF6A00] hover:bg-[#EA5A00] text-white font-bold h-11 rounded-xl shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all"
              >
                Back to Sign In
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="w-full bg-white/75 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl overflow-hidden animate-scale-up">
            <CardHeader className="space-y-1.5 pt-8 pb-4 text-center">
              <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 font-medium">
                {isSignUp ? "Sign up to start earning rewards" : "Sign in to access your dashboard"}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 py-4 space-y-4">
              {error && (
                <div className="rounded-2xl bg-red-50 border border-red-100 p-3 text-xs text-red-600 text-center flex flex-col items-center gap-1.5 font-semibold">
                  <span>{error}</span>
                  {error.includes("verify your email") && pendingUserId && (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      className="text-xs font-bold text-[#FF6A00] hover:underline"
                    >
                      Resend Verification Email
                    </button>
                  )}
                </div>
              )}

              {/* Segmented Controller Switch */}
              <div className="relative p-1 bg-slate-100 rounded-2xl flex items-center justify-between w-full h-11 select-none">
                <div
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-md border border-slate-100/50 transition-all duration-300 ease-out ${activeTab === "business" ? "translate-x-[calc(100%+8px)]" : "translate-x-0"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => { setActiveTab("customer"); clearError(); setEmail(""); setPassword(""); setPhone(""); setName(""); setBusinessName(""); setBusinessAddress(""); setIsSignUp(false); }}
                  className={`w-1/2 z-10 text-xs font-bold text-center transition-colors duration-200 ${activeTab === "customer" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab("business"); clearError(); setEmail(""); setPassword(""); setPhone(""); setName(""); setBusinessName(""); setBusinessAddress(""); setIsSignUp(false); }}
                  className={`w-1/2 z-10 text-xs font-bold text-center transition-colors duration-200 ${activeTab === "business" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Business Admin
                </button>
              </div>

              {/* Customer View */}
              {activeTab === "customer" && (
                <form onSubmit={handleCustomerSubmit} className="space-y-3.5">
                  {isSignUp && (
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-700 ml-1">Full Name</Label>
                      <div className="relative group">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#FF6A00] transition-colors" />
                        <Input
                          type="text"
                          placeholder="Ananya Mishra"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10 h-11 rounded-xl border-slate-200 bg-white/50 focus-visible:ring-1 focus-visible:ring-[#FF6A00]/30 focus-visible:border-[#FF6A00] transition-all text-slate-800 text-xs font-semibold placeholder:text-slate-400 placeholder:font-medium"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700 ml-1">Email Address</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#FF6A00] transition-colors" />
                      <Input
                        type="email"
                        placeholder="ananya@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11 rounded-xl border-slate-200 bg-white/50 focus-visible:ring-1 focus-visible:ring-[#FF6A00]/30 focus-visible:border-[#FF6A00] transition-all text-slate-800 text-xs font-semibold placeholder:text-slate-400 placeholder:font-medium"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {isSignUp && (
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-700 ml-1">Phone Number</Label>
                      <div className="relative flex rounded-xl border border-slate-200 overflow-hidden focus-within:border-[#FF6A00] focus-within:ring-1 focus-within:ring-[#FF6A00]/30 transition-all bg-white/50">
                        <span className="flex items-center gap-1 pl-3.5 pr-2 bg-slate-50 border-r border-slate-200 text-xs font-bold text-slate-500 select-none whitespace-nowrap">
                          <Phone size={13} />
                          +91
                        </span>
                        <input
                          type="tel"
                          placeholder="99370 XXXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          className="flex-1 min-w-0 px-3 py-2.5 text-xs text-slate-800 font-semibold placeholder:text-slate-400 placeholder:font-medium bg-transparent focus:outline-none"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700 ml-1">Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#FF6A00] transition-colors" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`pl-10 pr-10 h-11 rounded-xl border-slate-200 bg-white/50 focus-visible:ring-1 focus-visible:ring-[#FF6A00]/30 focus-visible:border-[#FF6A00] transition-all text-slate-800 text-xs font-semibold placeholder:text-slate-400 placeholder:font-medium ${isSignUp && password.length > 0 && password.length < 8 ? "border-red-400 focus-visible:ring-red-400/30 focus-visible:border-red-400" : ""
                          }`}
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {!isSignUp && (
                      <div className="flex justify-end pt-0.5">
                        <button
                          type="button"
                          onClick={() => navigate("/forgot-password")}
                          className="text-[10px] text-[#FF6A00] hover:underline font-bold"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    )}
                    {isSignUp && password.length > 0 && password.length < 8 && (
                      <p className="text-[10px] text-red-500 font-medium mt-1">Password must be at least 8 characters</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-2 bg-[#FF6A00] hover:bg-[#EA5A00] text-white font-bold h-11 rounded-xl shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all"
                    disabled={loading || (isSignUp && (!name || !email || !phone || !password || password.length < 8))}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Working...</span>
                      </div>
                    ) : (
                      isSignUp ? "Sign Up" : "Sign In"
                    )}
                  </Button>

                  <div className="text-center text-xs text-slate-500 pt-1">
                    {isSignUp ? "Already have an account?" : "New to the platform?"}{" "}
                    <button
                      type="button"
                      onClick={() => { clearError(); setIsSignUp(!isSignUp); }}
                      className="text-[#FF6A00] hover:underline font-bold"
                    >
                      {isSignUp ? "Sign In" : "Sign Up"}
                    </button>
                  </div>

                  {googleError && (
                    <div className="rounded-xl bg-red-50 border border-red-100 p-2.5 text-[10px] text-red-600 text-center font-semibold">
                      {googleError}
                    </div>
                  )}

                  <div className="relative flex py-2 items-center w-full select-none">
                    <div className="flex-grow border-t border-slate-100" />
                    <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Or</span>
                    <div className="flex-grow border-t border-slate-100" />
                  </div>

                  <div className="w-full flex flex-col items-center justify-center">
                    {googleLoading ? (
                      <div className="flex items-center space-x-2 py-2 text-xs text-slate-500 font-bold select-none">
                        <Loader2 className="h-4 w-4 animate-spin text-[#FF6A00]" />
                        <span>Verifying Google session...</span>
                      </div>
                    ) : (
                      <div id="google-signin-btn" className="w-full min-h-[44px] flex justify-center" />
                    )}
                  </div>
                </form>
              )}

              {/* Business / Staff View */}
              {activeTab === "business" && (
                <form onSubmit={handlePasswordLogin} className="space-y-3.5">
                  {isSignUp && (
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-700 ml-1">Full Name</Label>
                      <div className="relative group">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#FF6A00] transition-colors" />
                        <Input
                          type="text"
                          placeholder="Ramesh Pattnaik"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10 h-11 rounded-xl border-slate-200 bg-white/50 focus-visible:ring-1 focus-visible:ring-[#FF6A00]/30 focus-visible:border-[#FF6A00] transition-all text-slate-800 text-xs font-semibold placeholder:text-slate-400 placeholder:font-medium"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700 ml-1">Email Address</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#FF6A00] transition-colors" />
                      <Input
                        type="email"
                        placeholder="ramesh@brewsbypattnaik.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11 rounded-xl border-slate-200 bg-white/50 focus-visible:ring-1 focus-visible:ring-[#FF6A00]/30 focus-visible:border-[#FF6A00] transition-all text-slate-800 text-xs font-semibold placeholder:text-slate-400 placeholder:font-medium"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {isSignUp && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-700 ml-1">Phone Number</Label>
                        <div className="relative flex rounded-xl border border-slate-200 overflow-hidden focus-within:border-[#FF6A00] focus-within:ring-1 focus-within:ring-[#FF6A00]/30 transition-all bg-white/50">
                          <span className="flex items-center gap-1 pl-3.5 pr-2 bg-slate-50 border-r border-slate-200 text-xs font-bold text-slate-500 select-none whitespace-nowrap">
                            <Phone size={13} />
                            +91
                          </span>
                          <input
                            type="tel"
                            placeholder="99370 XXXXX"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                            className="flex-1 min-w-0 px-3 py-2.5 text-xs text-slate-800 font-semibold placeholder:text-slate-400 placeholder:font-medium bg-transparent focus:outline-none"
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-700 ml-1">Business / Company Name</Label>
                        <div className="relative group">
                          <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#FF6A00] transition-colors" />
                          <Input
                            type="text"
                            placeholder="Brews by Pattnaik"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className="pl-10 h-11 rounded-xl border-slate-200 bg-white/50 focus-visible:ring-1 focus-visible:ring-[#FF6A00]/30 focus-visible:border-[#FF6A00] transition-all text-slate-800 text-xs font-semibold placeholder:text-slate-400 placeholder:font-medium"
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-700 ml-1">Business Address (Optional)</Label>
                        <div className="relative group">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#FF6A00] transition-colors" />
                          <Input
                            type="text"
                            placeholder="MG Road, Bhubaneswar, Odisha"
                            value={businessAddress}
                            onChange={(e) => setBusinessAddress(e.target.value)}
                            className="pl-10 h-11 rounded-xl border-slate-200 bg-white/50 focus-visible:ring-1 focus-visible:ring-[#FF6A00]/30 focus-visible:border-[#FF6A00] transition-all text-slate-800 text-xs font-semibold placeholder:text-slate-400 placeholder:font-medium"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-700 ml-1">Business Category</Label>
                        <div className="relative group">
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full h-11 border border-slate-200 rounded-xl bg-white/50 px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#FF6A00]/30 focus:border-[#FF6A00] text-slate-800 appearance-none transition-all"
                            disabled={loading}
                          >
                            <option value="Cafe">Café</option>
                            <option value="Restaurant">Restaurant</option>
                            <option value="Salon">Salon</option>
                            <option value="Retail">Retail</option>
                            <option value="Bakery">Bakery</option>
                            <option value="Hotels">Hotels</option>
                            <option value="Other">Other</option>
                          </select>
                          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {category === "Other" && (
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-slate-700 ml-1">Enter Business Type</Label>
                          <Input
                            type="text"
                            placeholder="e.g. Gym, Pet Store, etc."
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            className="h-11 rounded-xl border-slate-200 bg-white/50 focus-visible:ring-1 focus-visible:ring-[#FF6A00]/30 focus-visible:border-[#FF6A00] transition-all text-slate-800 text-xs font-semibold placeholder:text-slate-400 placeholder:font-medium"
                            required
                            disabled={loading}
                          />
                        </div>
                      )}

                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-700 ml-1">Booking/Website Link</Label>
                        <Input
                          type="url"
                          placeholder="e.g. https://mybusinesslink.com"
                          value={bookingUrl}
                          onChange={(e) => setBookingUrl(e.target.value)}
                          className="h-11 rounded-xl border-slate-200 bg-white/50 focus-visible:ring-1 focus-visible:ring-[#FF6A00]/30 focus-visible:border-[#FF6A00] transition-all text-slate-800 text-xs font-semibold placeholder:text-slate-400 placeholder:font-medium"
                          disabled={loading}
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700 ml-1">Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#FF6A00] transition-colors" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`pl-10 pr-10 h-11 rounded-xl border-slate-200 bg-white/50 focus-visible:ring-1 focus-visible:ring-[#FF6A00]/30 focus-visible:border-[#FF6A00] transition-all text-slate-800 text-xs font-semibold placeholder:text-slate-400 placeholder:font-medium ${isSignUp && password.length > 0 && password.length < 8 ? "border-red-400 focus-visible:ring-red-400/30 focus-visible:border-red-400" : ""
                          }`}
                        minLength={8}
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {!isSignUp && (
                      <div className="flex justify-end pt-0.5">
                        <button
                          type="button"
                          onClick={() => navigate("/forgot-password")}
                          className="text-[10px] text-[#FF6A00] hover:underline font-bold"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    )}
                    {isSignUp && password.length > 0 && password.length < 8 && (
                      <p className="text-[10px] text-red-500 font-medium mt-1">Password must be at least 8 characters</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-2 bg-[#FF6A00] hover:bg-[#EA5A00] text-white font-bold h-11 rounded-xl shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all"
                    disabled={loading || !email || !password || (isSignUp && (!name || !phone || !businessName || password.length < 8))}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{isSignUp ? "Submitting..." : "Logging in..."}</span>
                      </div>
                    ) : (
                      isSignUp ? "Submit Registration Request" : "Secure Sign In"
                    )}
                  </Button>

                  <div className="text-center text-xs text-slate-500 pt-1">
                    {isSignUp ? "Already have a business account? " : "Want to register your business? "}
                    {isSignUp ? (
                      <button
                        type="button"
                        onClick={() => { clearError(); setIsSignUp(false); }}
                        className="text-[#FF6A00] hover:underline font-bold"
                      >
                        Sign In
                      </button>
                    ) : (
                      <Link
                        to="/register-business"
                        className="text-[#FF6A00] hover:underline font-bold"
                      >
                        Register Business →
                      </Link>
                    )}
                  </div>
                </form>
              )}
            </CardContent>

            <CardFooter className="flex flex-col text-center space-y-2 pt-2 pb-6 select-none">
              <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400 font-bold tracking-wide">
                <Link to="/privacy-policy" className="hover:text-[#FF6A00] transition-colors">Privacy Policy</Link>
                <span>•</span>
                <Link to="/terms-of-service" className="hover:text-[#FF6A00] transition-colors">Terms of Service</Link>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>

      {/* Google Phone Dialog */}
      {showPhoneDialog && (
        <Dialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
          <DialogContent className="max-w-[400px] bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-6">
            <DialogHeader className="space-y-1.5 text-center">
              <DialogTitle className="text-xl font-bold text-slate-900">Complete Google Registration</DialogTitle>
              <DialogDescription className="text-xs text-slate-500">Please provide your phone number to complete your loyalty profile.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePhoneSubmit} className="space-y-4 py-2">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700 ml-1">Phone Number</Label>
                <div className="relative flex rounded-xl border border-slate-200 overflow-hidden focus-within:border-[#FF6A00] focus-within:ring-1 focus-within:ring-[#FF6A00]/30 transition-all bg-white/50">
                  <span className="flex items-center gap-1 pl-3.5 pr-2 bg-slate-50 border-r border-slate-200 text-xs font-bold text-slate-500 select-none whitespace-nowrap">
                    <Phone size={13} />
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="99370 XXXXX"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="flex-1 min-w-0 px-3 py-2.5 text-xs text-slate-800 font-semibold placeholder:text-slate-400 placeholder:font-medium bg-transparent focus:outline-none"
                    required
                  />
                </div>
              </div>
              <DialogFooter className="pt-2 gap-2 flex-col sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPhoneDialog(false)}
                  className="rounded-xl border-slate-200 text-slate-500 hover:bg-slate-50 font-bold text-xs h-10 w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#FF6A00] hover:bg-[#EA5A00] text-white font-bold h-10 rounded-xl shadow-lg shadow-orange-500/10 w-full sm:w-auto"
                  disabled={googleLoading}
                >
                  {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Complete Registration"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Forgot Dialog */}
      {showForgotDialog && (
        <Dialog open={showForgotDialog} onOpenChange={setShowForgotDialog}>
          <DialogContent className="max-w-[360px] bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-6">
            <DialogHeader className="text-center space-y-1.5">
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center justify-center gap-2">
                <Lock className="h-5 w-5 text-[#FF6A00]" />
                <span>Reset Password</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 leading-relaxed pt-2">
                To reset your password, please contact our support team at <strong className="text-slate-900">contact@logisaar.in</strong> or reach out to your administrator.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-4">
              <Button className="w-full bg-[#FF6A00] hover:bg-[#EA5A00] text-white font-bold h-10 rounded-xl" onClick={() => setShowForgotDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

import { useNavigate, Link } from "react-router-dom";
const _jsxFileName = "src\\pages\\(auth)\\login\\page.tsx"; function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } "use client";

import React, { useState, useEffect } from "react";

import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, Lock, Eye, EyeOff, Loader2, Mail, User } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function LoginPage() {
  const navigate = useNavigate();
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

  // Active tab state
  const [activeTab, setActiveTab] = useState("customer");

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
      } else if (res && typeof res === "object" && res.newUser) {
        // Still requires info? Should not happen since phone is provided
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
          client_id: "240748277924-ds46b01veci1o7k23e7s9hkiuf3khes4.apps.googleusercontent.com",
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
    if (isSignUp) {
      if (!name || !email || !phone || !password) return;
      if (password.length < 8) return;
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      await registerCustomer(name, email, formattedPhone, password);
    } else {
      if (!email || !password) return;
      await loginWithPassword(email, password);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    clearError();
    if (isSignUp) {
      if (!name || !email || !phone || !password || !businessName) return;
      if (password.length < 8) {
        // Surface client-side validation before hitting the server
        return;
      }
      // Prepend +91 so backend phone schema always gets E.164 format
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      const finalCategory = category === "Other" ? (customCategory || "Other") : category;
      const success = await registerBusiness(name, email, formattedPhone, password, businessName, businessAddress, finalCategory, category === "Hotels" ? bookingUrl : null);
      if (success && !useAuthStore.getState().user) {
        setSuccessMsg("Your registration request was submitted! Once the Super Admin reviews and approves your account, you will be able to sign in.");
      }
    } else {
      if (!email || !password) return;
      await loginWithPassword(email, password);
    }
  };

  return (
    React.createElement('div', { className: "relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12", __self: this, __source: { fileName: _jsxFileName, lineNumber: 169 } }

      /* Brand Header */
      , React.createElement('div', { className: "mb-8 flex flex-col items-center text-center animate-fade-in", __self: this, __source: { fileName: _jsxFileName, lineNumber: 172 } }
        , React.createElement('img', { src: "/new.png", alt: "LogiSaar Logo", className: "h-11 w-auto object-contain mb-3" })
        , React.createElement('h1', { className: "text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl", __self: this, __source: { fileName: _jsxFileName, lineNumber: 176 } }, "ScanLoyal"

        )
        , React.createElement('p', { className: "mt-2 text-sm text-muted-foreground max-w-sm", __self: this, __source: { fileName: _jsxFileName, lineNumber: 179 } }, "Digital Loyalty Voucher Platform — Elevating customer retention in India"

        )
      )

      , successMsg ? (
        React.createElement(Card, { className: "w-full max-w-[420px] glass animate-fade-in", glass: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 185 } }
          , React.createElement(CardHeader, { className: "space-y-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 186 } }
            , React.createElement(CardTitle, { className: "text-2xl text-center flex items-center justify-center gap-2 text-emerald-600", __self: this, __source: { fileName: _jsxFileName, lineNumber: 187 } }
              , React.createElement(Sparkles, { className: "h-6 w-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 188 } }), " Request Submitted"
            )
            , React.createElement(CardDescription, { className: "text-center text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 190 } }, "Your business registration is pending approval."

            )
          )
          , React.createElement(CardContent, { className: "space-y-4 text-center pb-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 194 } }
            , React.createElement('p', { className: "text-sm text-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 195 } }
              , successMsg
            )
          )
          , React.createElement(CardFooter, { className: "flex justify-center border-t border-border pt-6 pb-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 199 } }
            , React.createElement(Button, { onClick: () => { setSuccessMsg(null); setIsSignUp(false); }, className: "w-full", __self: this, __source: { fileName: _jsxFileName, lineNumber: 200 } }, "Back to Sign In"

            )
          )
        )
      ) : (
        React.createElement(Card, { className: "w-full max-w-[420px] glass animate-fade-in", glass: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 206 } }
          , React.createElement(CardHeader, { className: "space-y-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 207 } }
            , React.createElement(CardTitle, { className: "text-2xl text-center", __self: this, __source: { fileName: _jsxFileName, lineNumber: 208 } }
              , isSignUp ? "Create an Account" : "Welcome Back"
            )
            , React.createElement(CardDescription, { className: "text-center text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 211 } }
              , isSignUp ? "Sign up to start earning rewards" : "Sign in to access your dashboard"
            )
          )
          , React.createElement(CardContent, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 215 } }
            , error && (
              React.createElement('div', { className: "mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive text-center", __self: this, __source: { fileName: _jsxFileName, lineNumber: 217 } }
                , error
              )
            )

            , React.createElement(Tabs, { defaultValue: "customer", className: "w-full", onValueChange: (val) => { setActiveTab(val); clearError(); setEmail(""); setPassword(""); setPhone(""); setName(""); setBusinessName(""); setBusinessAddress(""); setIsSignUp(false); }, __self: this, __source: { fileName: _jsxFileName, lineNumber: 222 } }
              , React.createElement(TabsList, { className: "grid w-full grid-cols-2 mb-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 223 } }
                , React.createElement(TabsTrigger, { value: "customer", __self: this, __source: { fileName: _jsxFileName, lineNumber: 224 } }, "Customer")
                , React.createElement(TabsTrigger, { value: "business", __self: this, __source: { fileName: _jsxFileName, lineNumber: 225 } }, "Business Admin")
              )

              /* Customer (Email / Password / Sign Up) */
              , React.createElement(TabsContent, { value: "customer", __self: this, __source: { fileName: _jsxFileName, lineNumber: 229 } }
                , React.createElement('form', { onSubmit: handleCustomerSubmit, className: "space-y-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 230 } }
                  , isSignUp && (
                    React.createElement('div', { className: "space-y-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 232 } }
                      , React.createElement(Label, { htmlFor: "name", __self: this, __source: { fileName: _jsxFileName, lineNumber: 233 } }, "Full Name")
                      , React.createElement('div', { className: "relative", __self: this, __source: { fileName: _jsxFileName, lineNumber: 234 } }
                        , React.createElement(User, { className: "absolute inset-y-0 left-3 h-5 w-5 top-1/2 -translate-y-1/2 text-zinc-500", __self: this, __source: { fileName: _jsxFileName, lineNumber: 235 } })
                        , React.createElement(Input, {
                          id: "name",
                          type: "text",
                          placeholder: "Ananya Mishra",
                          value: name,
                          onChange: (e) => setName(e.target.value),
                          className: "pl-10",
                          required: true,
                          disabled: loading, __self: this, __source: { fileName: _jsxFileName, lineNumber: 236 }
                        }
                        )
                      )
                    )
                  )

                  , React.createElement('div', { className: "space-y-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 250 } }
                    , React.createElement(Label, { htmlFor: "email", __self: this, __source: { fileName: _jsxFileName, lineNumber: 251 } }, "Email Address")
                    , React.createElement('div', { className: "relative", __self: this, __source: { fileName: _jsxFileName, lineNumber: 252 } }
                      , React.createElement(Mail, { className: "absolute inset-y-0 left-3 h-5 w-5 top-1/2 -translate-y-1/2 text-zinc-500", __self: this, __source: { fileName: _jsxFileName, lineNumber: 253 } })
                      , React.createElement(Input, {
                        id: "email",
                        type: "email",
                        placeholder: "ananya@gmail.com",
                        value: email,
                        onChange: (e) => setEmail(e.target.value),
                        className: "pl-10",
                        required: true,
                        disabled: loading, __self: this, __source: { fileName: _jsxFileName, lineNumber: 254 }
                      }
                      )
                    )
                  )

                  , isSignUp && (
                    React.createElement('div', { className: "space-y-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 268 } }
                      , React.createElement(Label, { htmlFor: "phone", __self: this, __source: { fileName: _jsxFileName, lineNumber: 269 } }, "Phone Number")
                      , React.createElement('div', { className: "relative", __self: this, __source: { fileName: _jsxFileName, lineNumber: 270 } }
                        , React.createElement('span', { className: "absolute inset-y-0 left-3 flex items-center text-zinc-500 text-sm", __self: this, __source: { fileName: _jsxFileName, lineNumber: 271 } }, "+91"

                        )
                        , React.createElement(Input, {
                          id: "phone",
                          type: "tel",
                          placeholder: "99370 XXXXX",
                          value: phone,
                          onChange: (e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)),
                          className: "pl-12",
                          required: true,
                          disabled: loading, __self: this, __source: { fileName: _jsxFileName, lineNumber: 274 }
                        }
                        )
                      )
                    )
                  ), React.createElement('div', { className: "space-y-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 288 } }
                    , React.createElement(Label, { htmlFor: "password", __self: this, __source: { fileName: _jsxFileName, lineNumber: 289 } }, "Password")
                    , React.createElement('div', { className: "relative", __self: this, __source: { fileName: _jsxFileName, lineNumber: 290 } }
                      , React.createElement(Lock, { className: "absolute inset-y-0 left-3 h-5 w-5 top-1/2 -translate-y-1/2 text-zinc-500", __self: this, __source: { fileName: _jsxFileName, lineNumber: 291 } })
                      , React.createElement(Input, {
                        id: "password",
                        type: showPassword ? "text" : "password",
                        placeholder: "••••••••",
                        value: password,
                        onChange: (e) => setPassword(e.target.value),
                        className: "pl-10 pr-10 " + (isSignUp && password.length > 0 && password.length < 8 ? "border-destructive focus-visible:ring-destructive" : ""),
                        required: true,
                        disabled: loading, __self: this, __source: { fileName: _jsxFileName, lineNumber: 292 }
                      }
                      )
                      , React.createElement('button', {
                        type: "button",
                        onClick: () => setShowPassword(!showPassword),
                        className: "absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-300", __self: this, __source: { fileName: _jsxFileName, lineNumber: 302 }
                      }

                        , showPassword ? React.createElement(EyeOff, { className: "h-4 w-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 307 } }) : React.createElement(Eye, { className: "h-4 w-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 307 } })
                      )
                    )
                    , !isSignUp && (
                      React.createElement('div', { className: "flex justify-end mt-1" }
                        , React.createElement('button', {
                          type: "button",
                          onClick: () => setShowForgotDialog(true),
                          className: "text-[11px] text-primary hover:underline font-semibold"
                        }, "Forgot Password?")
                      )
                    )
                    , isSignUp && password.length > 0 && password.length < 8 && React.createElement('p', { className: "text-xs text-destructive mt-1" }, "Password must be at least 8 characters")
                    , isSignUp && password.length === 0 && React.createElement('p', { className: "text-xs text-muted-foreground mt-1" }, "Minimum 8 characters required")
                  )

                , React.createElement(Button, { type: "submit", className: "w-full mt-4", disabled: loading || (isSignUp && (!name || !email || !phone || !password || password.length < 8)), __self: this, __source: { fileName: _jsxFileName, lineNumber: 312 } }
                  , loading ? (
                    React.createElement(React.Fragment, null
                      , React.createElement(Loader2, { className: "mr-2 h-4 w-4 animate-spin", __self: this, __source: { fileName: _jsxFileName, lineNumber: 315 } }), " Working..."
                    )
                  ) : (
                    isSignUp ? "Sign Up" : "Sign In"
                  )
                )

                , React.createElement('div', { className: "text-center text-xs text-zinc-500 mt-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 322 } }
                  , isSignUp ? "Already have an account?" : "New to the platform?", " "
                  , React.createElement('button', {
                    type: "button",
                    onClick: () => { clearError(); setIsSignUp(!isSignUp); },
                    className: "text-primary hover:underline font-semibold", __self: this, __source: { fileName: _jsxFileName, lineNumber: 324 }
                  }

                    , isSignUp ? "Sign In" : "Sign Up"
                  )
                )

                , googleError && (
                  React.createElement('div', { className: "mt-3 rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive text-center", __self: this, __source: { fileName: _jsxFileName, lineNumber: 334 } }
                    , googleError
                  )
                )

                , React.createElement('div', { className: "relative flex py-2 items-center w-full", __self: this, __source: { fileName: _jsxFileName, lineNumber: 339 } }
                  , React.createElement('div', { className: "flex-grow border-t border-border", __self: this, __source: { fileName: _jsxFileName, lineNumber: 340 } })
                  , React.createElement('span', { className: "flex-shrink mx-3 text-[10px] text-muted-foreground uppercase tracking-widest", __self: this, __source: { fileName: _jsxFileName, lineNumber: 341 } }, "Or")
                  , React.createElement('div', { className: "flex-grow border-t border-border", __self: this, __source: { fileName: _jsxFileName, lineNumber: 342 } })
                )

                , React.createElement('div', { className: "w-full flex flex-col items-center justify-center space-y-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 345 } }
                  , googleLoading ? (
                    React.createElement('div', { className: "flex items-center space-x-2 py-2 text-xs text-muted-foreground", __self: this, __source: { fileName: _jsxFileName, lineNumber: 347 } }
                      , React.createElement(Loader2, { className: "h-4 w-4 animate-spin text-primary", __self: this, __source: { fileName: _jsxFileName, lineNumber: 348 } })
                      , React.createElement('span', { __self: this, __source: { fileName: _jsxFileName, lineNumber: 349 } }, "Verifying Google session...")
                    )
                  ) : (
                    React.createElement('div', { id: "google-signin-btn", className: "w-full min-h-[44px] flex justify-center", __self: this, __source: { fileName: _jsxFileName, lineNumber: 352 } })
                  )
                )
              )
            )

            /* Business / Staff (Email / Password based) */
            , React.createElement(TabsContent, { value: "business", __self: this, __source: { fileName: _jsxFileName, lineNumber: 359 } }
              , React.createElement('form', { onSubmit: handlePasswordLogin, className: "space-y-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 360 } }
                , isSignUp && (
                  React.createElement('div', { className: "space-y-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 362 } }
                    , React.createElement(Label, { htmlFor: "biz-name", __self: this, __source: { fileName: _jsxFileName, lineNumber: 363 } }, "Full Name")
                    , React.createElement('div', { className: "relative", __self: this, __source: { fileName: _jsxFileName, lineNumber: 364 } }
                      , React.createElement(User, { className: "absolute inset-y-0 left-3 h-5 w-5 top-1/2 -translate-y-1/2 text-zinc-500", __self: this, __source: { fileName: _jsxFileName, lineNumber: 365 } })
                      , React.createElement(Input, {
                        id: "biz-name",
                        type: "text",
                        placeholder: "Ramesh Pattnaik",
                        value: name,
                        onChange: (e) => setName(e.target.value),
                        className: "pl-10",
                        required: true,
                        disabled: loading, __self: this, __source: { fileName: _jsxFileName, lineNumber: 366 }
                      }
                      )
                    )
                  )
                )

                , React.createElement('div', { className: "space-y-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 380 } }
                  , React.createElement(Label, { htmlFor: "biz-email", __self: this, __source: { fileName: _jsxFileName, lineNumber: 381 } }, "Email Address")
                  , React.createElement('div', { className: "relative", __self: this, __source: { fileName: _jsxFileName, lineNumber: 382 } }
                    , React.createElement(Mail, { className: "absolute inset-y-0 left-3 h-5 w-5 top-1/2 -translate-y-1/2 text-zinc-500", __self: this, __source: { fileName: _jsxFileName, lineNumber: 383 } })
                    , React.createElement(Input, {
                      id: "biz-email",
                      type: "email",
                      placeholder: "ramesh@brewsbypattnaik.com",
                      value: email,
                      onChange: (e) => setEmail(e.target.value),
                      className: "pl-10",
                      required: true,
                      disabled: loading, __self: this, __source: { fileName: _jsxFileName, lineNumber: 384 }
                    }
                    )
                  )
                )

                , isSignUp && React.createElement(React.Fragment, null
                    , React.createElement('div', { className: "space-y-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 399 } }
                      , React.createElement(Label, { htmlFor: "biz-phone", __self: this, __source: { fileName: _jsxFileName, lineNumber: 400 } }, "Phone Number")
                      , React.createElement('div', { className: "relative", __self: this, __source: { fileName: _jsxFileName, lineNumber: 401 } }
                        , React.createElement('span', { className: "absolute inset-y-0 left-3 flex items-center text-zinc-500 text-sm", __self: this, __source: { fileName: _jsxFileName, lineNumber: 402 } }, "+91"

                        )
                        , React.createElement(Input, {
                          id: "biz-phone",
                          type: "tel",
                          placeholder: "99370 XXXXX",
                          value: phone,
                          onChange: (e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)),
                          className: "pl-12",
                          required: true,
                          disabled: loading, __self: this, __source: { fileName: _jsxFileName, lineNumber: 405 }
                        }
                        )
                      )
                    )

                    , React.createElement('div', { className: "space-y-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 418 } }
                      , React.createElement(Label, { htmlFor: "biz-company", __self: this, __source: { fileName: _jsxFileName, lineNumber: 419 } }, "Business / Company Name")
                      , React.createElement('div', { className: "relative", __self: this, __source: { fileName: _jsxFileName, lineNumber: 420 } }
                        , React.createElement(Sparkles, { className: "absolute inset-y-0 left-3 h-5 w-5 top-1/2 -translate-y-1/2 text-zinc-500", __self: this, __source: { fileName: _jsxFileName, lineNumber: 421 } })
                        , React.createElement(Input, {
                          id: "biz-company",
                          type: "text",
                          placeholder: "Brews by Pattnaik",
                          value: businessName,
                          onChange: (e) => setBusinessName(e.target.value),
                          className: "pl-10",
                          required: true,
                          disabled: loading, __self: this, __source: { fileName: _jsxFileName, lineNumber: 422 }
                        }
                        )
                      )
                    )

                    , React.createElement('div', { className: "space-y-2", __self: this, __source: { fileName: _jsxFileName } }
                      , React.createElement(Label, { htmlFor: "biz-address", __self: this, __source: { fileName: _jsxFileName } }, "Business Address (Optional)")
                      , React.createElement(Input, {
                        id: "biz-address",
                        type: "text",
                        placeholder: "MG Road, Bhubaneswar, Odisha",
                        value: businessAddress,
                        onChange: (e) => setBusinessAddress(e.target.value),
                        disabled: loading, __self: this, __source: { fileName: _jsxFileName }
                      })
                    )
                    , React.createElement('div', { className: "space-y-2", __self: this, __source: { fileName: _jsxFileName } }
                      , React.createElement(Label, { htmlFor: "biz-category", __self: this, __source: { fileName: _jsxFileName } }, "Business Category")
                      , React.createElement('select', {
                          id: "biz-category",
                          value: category,
                          onChange: (e) => setCategory(e.target.value),
                          className: "w-full h-10 border border-zinc-200 rounded-md bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-slate-800",
                          disabled: loading, __self: this, __source: { fileName: _jsxFileName }
                        },
                          React.createElement('option', { value: "Cafe" }, "Café"),
                          React.createElement('option', { value: "Restaurant" }, "Restaurant"),
                          React.createElement('option', { value: "Salon" }, "Salon"),
                          React.createElement('option', { value: "Retail" }, "Retail"),
                          React.createElement('option', { value: "Bakery" }, "Bakery"),
                          React.createElement('option', { value: "Hotels" }, "Hotels"),
                          React.createElement('option', { value: "Other" }, "Other")
                        )
                    )
                    , category === "Other" && React.createElement('div', { className: "space-y-2", __self: this }, React.createElement(Label, { htmlFor: "biz-custom-category" }, "Enter Business Type"), React.createElement(Input, { id: "biz-custom-category", type: "text", placeholder: "e.g. Gym, Pet Store, etc.", value: customCategory, onChange: (e) => setCustomCategory(e.target.value), required: true, disabled: loading }))
                    , category === "Hotels" && React.createElement('div', { className: "space-y-2", __self: this, __source: { fileName: _jsxFileName } }
                      , React.createElement(Label, { htmlFor: "biz-booking-url", __self: this, __source: { fileName: _jsxFileName } }, "Booking Website URL")
                      , React.createElement(Input, {
                          id: "biz-booking-url",
                          type: "url",
                          placeholder: "e.g. https://myhotelbooking.com",
                          value: bookingUrl,
                          onChange: (e) => setBookingUrl(e.target.value),
                          required: true,
                          disabled: loading, __self: this, __source: { fileName: _jsxFileName }
                        })
                    )
                  )
                  , React.createElement('div', { className: "space-y-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 449 } }
                    , React.createElement(Label, { htmlFor: "biz-password", __self: this, __source: { fileName: _jsxFileName, lineNumber: 450 } }, "Password")
                    , React.createElement('div', { className: "relative", __self: this, __source: { fileName: _jsxFileName, lineNumber: 451 } }
                      , React.createElement(Lock, { className: "absolute inset-y-0 left-3 h-5 w-5 top-1/2 -translate-y-1/2 text-zinc-500", __self: this, __source: { fileName: _jsxFileName, lineNumber: 452 } })
                      , React.createElement(Input, {
                        id: "biz-password",
                        type: showPassword ? "text" : "password",
                        placeholder: "Min. 8 characters",
                        value: password,
                        onChange: (e) => setPassword(e.target.value),
                        className: `pl-10 pr-10 ${isSignUp && password.length > 0 && password.length < 8 ? 'border-destructive focus-visible:ring-destructive' : ''}`,
                        minLength: 8,
                        required: true,
                        disabled: loading, __self: this, __source: { fileName: _jsxFileName, lineNumber: 453 }
                      }
                      )
                      , React.createElement('button', {
                        type: "button",
                        onClick: () => setShowPassword(!showPassword),
                        className: "absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-300", __self: this, __source: { fileName: _jsxFileName, lineNumber: 463 }
                      }

                        , showPassword ? React.createElement(EyeOff, { className: "h-4 w-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 468 } }) : React.createElement(Eye, { className: "h-4 w-4", __self: this, __source: { fileName: _jsxFileName, lineNumber: 468 } })
                      )
                    )
                    , !isSignUp && (
                      React.createElement('div', { className: "flex justify-end mt-1" }
                        , React.createElement('button', {
                          type: "button",
                          onClick: () => setShowForgotDialog(true),
                          className: "text-[11px] text-primary hover:underline font-semibold"
                        }, "Forgot Password?")
                      )
                    )
                    , isSignUp && password.length > 0 && password.length < 8 && React.createElement('p', { className: "text-xs text-destructive mt-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 472 } }, "Password must be at least 8 characters")
                    , isSignUp && password.length === 0 && React.createElement('p', { className: "text-xs text-muted-foreground mt-1", __self: this, __source: { fileName: _jsxFileName, lineNumber: 473 } }, "Minimum 8 characters required")
                  )

                , React.createElement(Button, { type: "submit", className: "w-full mt-4", disabled: loading || !email || !password || (isSignUp && (!name || !phone || !businessName || password.length < 8)), __self: this, __source: { fileName: _jsxFileName, lineNumber: 473 } }
                  , loading ? (
                    React.createElement(React.Fragment, null
                      , React.createElement(Loader2, { className: "mr-2 h-4 w-4 animate-spin", __self: this, __source: { fileName: _jsxFileName, lineNumber: 476 } }), " ", isSignUp ? "Submitting..." : "Logging in..."
                    )
                  ) : (
                    isSignUp ? "Submit Registration Request" : "Secure Sign In"
                  )
                )

                , React.createElement('div', { className: "text-center text-xs text-zinc-500 mt-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 483 } }
                  , isSignUp ? "Already have a business account?" : "Want to register your business?", " "
                  , React.createElement('button', {
                    type: "button",
                    onClick: () => { clearError(); setIsSignUp(!isSignUp); },
                    className: "text-primary hover:underline font-semibold", __self: this, __source: { fileName: _jsxFileName, lineNumber: 485 }
                  }

                    , isSignUp ? "Sign In" : "Register Business"
                  )
                )
              )
            )
           , React.createElement(CardFooter, { className: "flex flex-col text-center space-y-2 pb-6", __self: this, __source: { fileName: _jsxFileName, lineNumber: 497 } }
          , React.createElement('div', { className: "flex items-center justify-center gap-3 text-[11px] text-muted-foreground pb-2" }
            , React.createElement(Link, { to: "/privacy-policy", className: "hover:text-[#FF6A00] hover:underline" }, "Privacy Policy")
            , React.createElement('span', null, "•")
            , React.createElement(Link, { to: "/terms-of-service", className: "hover:text-[#FF6A00] hover:underline" }, "Terms of Service")
          )
        )          )
        )
      )
    )
      , showPhoneDialog && (
        React.createElement(Dialog, { open: showPhoneDialog, onOpenChange: setShowPhoneDialog, __self: this, __source: { fileName: _jsxFileName, lineNumber: 510 } }
          , React.createElement(DialogContent, { className: "max-w-[400px]", __self: this, __source: { fileName: _jsxFileName, lineNumber: 511 } }
            , React.createElement(DialogHeader, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 512 } }
              , React.createElement(DialogTitle, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 513 } }, "Complete Google Registration")
              , React.createElement(DialogDescription, { __self: this, __source: { fileName: _jsxFileName, lineNumber: 514 } }, "Please provide your phone number to complete your loyalty profile."

              )
            )
            , React.createElement('form', { onSubmit: handlePhoneSubmit, className: "space-y-4 py-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 518 } }
              , React.createElement('div', { className: "space-y-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 519 } }
                , React.createElement(Label, { htmlFor: "reg-phone", __self: this, __source: { fileName: _jsxFileName, lineNumber: 520 } }, "Phone Number")
                , React.createElement('div', { className: "relative", __self: this, __source: { fileName: _jsxFileName, lineNumber: 521 } }
                  , React.createElement('span', { className: "absolute inset-y-0 left-3 flex items-center text-zinc-500 text-sm", __self: this, __source: { fileName: _jsxFileName, lineNumber: 522 } }, "+91"

                  )
                  , React.createElement(Input, {
                    id: "reg-phone",
                    type: "tel",
                    placeholder: "99370 XXXXX",
                    value: regPhone,
                    onChange: (e) => setRegPhone(e.target.value.replace(/\D/g, "").slice(0, 10)),
                    className: "pl-12",
                    required: true, __self: this, __source: { fileName: _jsxFileName, lineNumber: 525 }
                  }
                  )
                )
              )
              , React.createElement(DialogFooter, { className: "pt-2", __self: this, __source: { fileName: _jsxFileName, lineNumber: 536 } }
                , React.createElement(Button, { type: "button", variant: "outline", onClick: () => setShowPhoneDialog(false), __self: this, __source: { fileName: _jsxFileName, lineNumber: 537 } }, "Cancel"

                )
                , React.createElement(Button, { type: "submit", className: "bg-primary", disabled: googleLoading, __self: this, __source: { fileName: _jsxFileName, lineNumber: 540 } }
                  , googleLoading ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin", __self: this, __source: { fileName: _jsxFileName, lineNumber: 541 } }) : "Complete Registration"
                )
              )
            )
          )
        )
      )
      , showForgotDialog && (
        React.createElement(Dialog, { open: showForgotDialog, onOpenChange: setShowForgotDialog }
          , React.createElement(DialogContent, { className: "max-w-[360px]" }
            , React.createElement(DialogHeader, { className: "text-center" }
              , React.createElement(DialogTitle, { className: "text-lg font-bold text-foreground flex items-center justify-center gap-2" }
                , React.createElement(Lock, { className: "h-5 w-5 text-primary" }), "Reset Password"
              )
              , React.createElement(DialogDescription, { className: "text-xs mt-2 text-muted-foreground leading-relaxed" }
                , "To reset your password, please contact our support team at "
                , React.createElement("strong", { className: "text-foreground" }, "contact@logisaar.in")
                , " or reach out to your administrator."
              )
            )
            , React.createElement(DialogFooter, { className: "pt-4" }
              , React.createElement(Button, { className: "w-full", onClick: () => setShowForgotDialog(false) }, "Close")
            )
          )
        )
      )
    )
  );
}

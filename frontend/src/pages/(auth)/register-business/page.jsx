import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Rocket,
  User,
  Phone,
  Mail,
  Store,
  MapPin,
  ChevronDown,
  Lock,
  Eye,
  EyeOff,
  Coffee,
  Utensils,
  Building2,
  Scissors,
  Dumbbell,
  ShoppingCart,
  ShoppingBag,
  MoreHorizontal,
  Crosshair,
  Bell,
  TrendingUp,
  Users,
  QrCode,
  Tablet,
  Check,
  Loader2,
  Sparkles
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

// ── Business category definitions ──────────────────────────────
const CATEGORIES = [
  { id: "Cafe",        label: "Café",       Icon: Coffee,       iconBg: "bg-orange-100/80",   iconColor: "text-orange-500" },
  { id: "Restaurant",  label: "Restaurant", Icon: Utensils,     iconBg: "bg-green-100/80",    iconColor: "text-green-500"  },
  { id: "Hotel",       label: "Hotel",      Icon: Building2,    iconBg: "bg-violet-100/80",   iconColor: "text-violet-500" },
  { id: "Salon",       label: "Salon",      Icon: Scissors,     iconBg: "bg-pink-100/80",     iconColor: "text-pink-500"   },
  { id: "Gym",         label: "Gym",        Icon: Dumbbell,     iconBg: "bg-blue-100/80",     iconColor: "text-blue-500"   },
  { id: "Grocery",     label: "Grocery",    Icon: ShoppingCart, iconBg: "bg-emerald-100/80",  iconColor: "text-emerald-500"},
  { id: "Boutique",    label: "Boutique",   Icon: ShoppingBag,  iconBg: "bg-pink-100/80",     iconColor: "text-pink-400"   },
  { id: "Other",       label: "Other",      Icon: MoreHorizontal,iconBg:"bg-gray-100/80",     iconColor: "text-gray-500"   },
];

// ── Password strength helper ───────────────────────────────────
function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8)           score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[0-9]/.test(pw))         score++;
  if (/[^A-Za-z0-9]/.test(pw))  score++;
  const levels = [
    { label: "",         color: "" },
    { label: "Weak",     color: "bg-red-400"    },
    { label: "Fair",     color: "bg-yellow-400" },
    { label: "Good",     color: "bg-blue-400"   },
    { label: "Strong",   color: "bg-green-500"  },
  ];
  return { score, ...levels[score] };
}

// ── Storefront illustration (inline SVG) ──────────────────────
function StorefrontIllustration() {
  return (
    <div className="relative w-24 h-24 flex-shrink-0 animate-fade-in filter drop-shadow-md">
      <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Store body */}
        <rect x="16" y="38" width="48" height="40" rx="3" fill="#FFF7ED" stroke="#F97316" strokeWidth="1.5"/>
        {/* Awning */}
        <path d="M12 38 Q20 30 28 38 Q36 30 44 38 Q52 30 60 38 Q68 30 68 38" stroke="#F97316" strokeWidth="2" fill="none"/>
        <rect x="12" y="36" width="56" height="6" rx="2" fill="#F97316" fillOpacity="0.15"/>
        {/* Door */}
        <rect x="30" y="56" width="16" height="22" rx="2" fill="#FFEDD5" stroke="#F97316" strokeWidth="1"/>
        {/* Windows */}
        <rect x="18" y="44" width="10" height="8" rx="1.5" fill="#BFDBFE"/>
        <rect x="52" y="44" width="10" height="8" rx="1.5" fill="#BFDBFE"/>
        {/* Roof sign */}
        <rect x="22" y="26" width="32" height="10" rx="5" fill="#F97316"/>
        <text x="38" y="34" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">OPEN</text>
        {/* Phone mockup */}
        <rect x="62" y="48" width="22" height="34" rx="4" fill="white" stroke="#E2E8F0" strokeWidth="1.5"/>
        <rect x="64" y="52" width="18" height="26" rx="2" fill="#FFF7ED"/>
        {/* Trophy icon in phone */}
        <path d="M70 62 h8 M71 59 v3 M77 59 v3 M71 59 q-2 0 -2 -2 v-2 h10 v2 q0 2 -2 2 z" stroke="#F97316" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M74 64 v2 M72 66 h4" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Stars */}
        <text x="8"  y="22" fill="#FCD34D" fontSize="8">✦</text>
        <text x="78" y="18" fill="#F97316" fontSize="6">✦</text>
        <text x="82" y="44" fill="#FCD34D" fontSize="5">✦</text>
      </svg>
    </div>
  );
}

// ── Step header ────────────────────────────────────────────────
function StepHeader({ number, title, subtext }) {
  return (
    <div className="flex items-start gap-3 mb-4 select-none">
      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#FF8A00] to-[#FF6A00] text-white text-xs font-black flex items-center justify-center shadow-lg shadow-orange-500/20">
        {number}
      </span>
      <div>
        <p className="font-extrabold text-slate-800 text-[14px] leading-tight">{title}</p>
        <p className="text-slate-500 text-[11px] font-medium mt-0.5">{subtext}</p>
      </div>
    </div>
  );
}

// ── Input field wrapper ────────────────────────────────────────
function FormField({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-[11px] font-bold text-slate-700 ml-1">{label}</label>
      {children}
      {error && <p className="text-[10px] text-red-500 font-semibold mt-0.5 ml-1">{error}</p>}
    </div>
  );
}

// ── Input with leading icon ───────────────────────────────────
function IconInput({ icon: Icon, trailingIcon, trailingAction, className = "", inputClassName = "", ...props }) {
  return (
    <div className={`relative flex items-center w-full group ${className}`}>
      <span className="absolute left-3.5 text-slate-400 group-focus-within:text-[#FF6A00] transition-colors">
        <Icon size={15} />
      </span>
      <input
        className={`w-full rounded-xl border border-slate-200 bg-white/50 pl-10 pr-${trailingIcon ? "10" : "3.5"} py-2.5 text-xs text-slate-800 font-semibold placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00]/30 transition-all ${inputClassName}`}
        {...props}
      />
      {trailingIcon && (
        <button
          type="button"
          onClick={trailingAction}
          className="absolute right-3.5 text-slate-400 hover:text-[#FF6A00] transition-colors"
          tabIndex={-1}
        >
          {trailingIcon}
        </button>
      )}
    </div>
  );
}

export default function RegisterBusinessPage() {
  const navigate = useNavigate();
  const { registerBusiness, loading, error: storeError, clearError } = useAuthStore();

  // ── Form state ────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState("");
  const [name,             setName]             = useState("");
  const [phone,            setPhone]            = useState("");
  const [email,            setEmail]            = useState("");
  const [businessName,     setBusinessName]     = useState("");
  const [address,          setAddress]          = useState("");
  const [categoryOverride, setCategoryOverride] = useState("");
  const [password,         setPassword]         = useState("");
  const [confirmPassword,  setConfirmPassword]  = useState("");
  const [referralCode,     setReferralCode]     = useState("");
  const [showPw,           setShowPw]           = useState(false);
  const [showConfirmPw,    setShowConfirmPw]    = useState(false);
  const [locating,         setLocating]         = useState(false);
  const [errors,           setErrors]           = useState({});
  const [submitAttempted,  setSubmitAttempted]  = useState(false);

  // Auto-populate category field when Step 1 selection changes
  useEffect(() => {
    if (selectedCategory) {
      setCategoryOverride(selectedCategory);
    }
  }, [selectedCategory]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  // ── Geolocation ──────────────────────────────────────────
  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          setAddress(data.display_name || `${latitude}, ${longitude}`);
        } catch {
          setAddress(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        }
        setLocating(false);
      },
      () => setLocating(false)
    );
  }, []);

  // ── Validation ──────────────────────────────────────────
  const validate = useCallback(() => {
    const errs = {};
    if (!selectedCategory)            errs.category      = "Please select a business type";
    if (!name.trim() || name.length < 2) errs.name      = "Full name must be at least 2 characters";
    if (!/^\d{10}$/.test(phone.replace(/\s/g, "")))
                                      errs.phone         = "Enter a valid 10-digit mobile number";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                                      errs.email         = "Enter a valid email address";
    if (!businessName.trim() || businessName.length < 2)
                                      errs.businessName  = "Business name must be at least 2 characters";
    if (password.length < 8)          errs.password      = "Password must be at least 8 characters";
    if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match";
    return errs;
  }, [selectedCategory, name, phone, email, businessName, password, confirmPassword]);

  const isValid = Object.keys(validate()).length === 0;
  const pwStrength = getPasswordStrength(password);

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const fullPhone = `+91${phone.replace(/\s/g, "")}`;
    const finalCategory = categoryOverride || selectedCategory;

    const result = await registerBusiness(
      name.trim(),
      email.trim(),
      fullPhone,
      password,
      businessName.trim(),
      address.trim() || undefined,
      finalCategory || undefined,
      undefined,
      referralCode.trim() || undefined
    );

    if (result === true) {
      navigate("/dashboard/business", { replace: true });
    } else if (result && result.requiresVerification) {
      navigate("/verify-email", {
        state: { userId: result.userId, email: result.email },
      });
    }
  };

  // Re-validate when submit attempted
  useEffect(() => {
    if (submitAttempted) {
      setErrors(validate());
    }
  }, [name, phone, email, businessName, password, confirmPassword, selectedCategory, submitAttempted, validate]);

  const selectedCat = CATEGORIES.find((c) => c.id === selectedCategory);
  const displayCategory = categoryOverride
    ? (CATEGORIES.find((c) => c.id === categoryOverride)?.label || categoryOverride)
    : "";

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-tr from-[#FFF7ED] via-white to-[#FFF7ED] flex flex-col font-sans">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] aspect-square rounded-full bg-gradient-to-br from-orange-200/40 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] aspect-square rounded-full bg-gradient-to-tl from-orange-200/30 to-transparent blur-3xl pointer-events-none" />

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            to="/login"
            className="w-9 h-9 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#FF6A00] transition-colors active:scale-95 duration-200"
          >
            <ArrowLeft size={16} />
          </Link>

          <div className="text-center select-none">
            <span className="text-base font-black tracking-tight text-slate-900">
              Scan<span className="text-[#FF6A00]">Loyal</span>
            </span>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Business Portal</p>
          </div>

          <div className="w-9" />
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-md w-full mx-auto px-4 pb-12 z-10 flex-1 flex flex-col">
        
        {/* ── Hero Info Section ── */}
        <div className="pt-6 pb-5 flex items-start justify-between gap-4 select-none">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">
              Grow Your Business<br />
              With <span className="text-[#FF6A00]">Loyalty Rewards</span>
            </h1>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed font-medium">
              Turn first-time visitors into brand loyalists. Collect reviews, trigger alerts, and run coupons instantly.
            </p>
            <div className="mt-3.5 inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1">
              <CheckCircle2 size={12} className="text-emerald-500" />
              <span className="text-emerald-600 text-[10px] font-bold tracking-wide">Setup takes less than 2 minutes</span>
            </div>
          </div>
          <StorefrontIllustration />
        </div>

        {/* ── Steps Card ── */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="bg-white/75 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden divide-y divide-slate-100">
            
            {/* STEP 1: Business Category */}
            <div className="p-5">
              <StepHeader
                number={1}
                title="Business Type"
                subtext="Select what best describes your storefront"
              />

              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map(({ id, label, Icon, iconBg, iconColor }) => {
                  const isSelected = selectedCategory === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedCategory(id)}
                      className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border p-2 pt-3.5 transition-all select-none duration-200 active:scale-95 ${
                        isSelected
                          ? "border-[#FF6A00] bg-orange-50/50 shadow-md shadow-orange-500/5"
                          : "border-slate-100 bg-white/50 hover:border-orange-200"
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#FF6A00] flex items-center justify-center shadow-md">
                          <Check size={10} className="text-white" strokeWidth={3} />
                        </span>
                      )}
                      <span className={`w-8.5 h-8.5 w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
                        <Icon size={16} className={iconColor} />
                      </span>
                      <span className="text-[10px] font-bold text-slate-800 text-center leading-tight">{label}</span>
                    </button>
                  );
                })}
              </div>
              {errors.category && submitAttempted && (
                <p className="text-[10px] text-red-500 font-semibold mt-2.5 ml-1">{errors.category}</p>
              )}
            </div>

            {/* STEP 2: Owner Personal Info */}
            <div className="p-5 space-y-3.5">
              <StepHeader
                number={2}
                title="Your Information"
                subtext="Enter the account owner's details"
              />

              <div className="grid grid-cols-2 gap-3.5">
                <FormField label="Full Name" error={errors.name}>
                  <IconInput
                    icon={User}
                    type="text"
                    placeholder="Ananya Mishra"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    inputClassName={errors.name ? "border-red-400" : ""}
                  />
                </FormField>

                <FormField label="Mobile Number" error={errors.phone}>
                  <div className={`flex rounded-xl border overflow-hidden ${errors.phone ? "border-red-400" : "border-slate-200"} focus-within:border-[#FF6A00] focus-within:ring-1 focus-within:ring-[#FF6A00]/30 transition-all bg-white/50`}>
                    <span className="flex items-center gap-1 pl-3 pr-1.5 bg-slate-50 border-r border-slate-200 text-[10px] font-bold text-slate-500 select-none whitespace-nowrap">
                      <Phone size={12} />
                      +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="99370 XXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      className="flex-1 min-w-0 px-2 py-2.5 text-xs text-slate-800 font-semibold placeholder:text-slate-400 bg-transparent focus:outline-none"
                      autoComplete="tel"
                    />
                  </div>
                </FormField>
              </div>

              <FormField label="Email Address" error={errors.email}>
                <IconInput
                  icon={Mail}
                  type="email"
                  placeholder="ananya@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  inputClassName={errors.email ? "border-red-400" : ""}
                />
              </FormField>
            </div>

            {/* STEP 3: Business details */}
            <div className="p-5 space-y-3.5">
              <StepHeader
                number={3}
                title="Business Information"
                subtext="Add your store branding and location details"
              />

              <div className="grid grid-cols-2 gap-3.5">
                <FormField label="Business Name" error={errors.businessName}>
                  <IconInput
                    icon={Store}
                    type="text"
                    placeholder="Brews by Pattnaik"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    inputClassName={errors.businessName ? "border-red-400" : ""}
                  />
                </FormField>

                <FormField label="Business Address">
                  <IconInput
                    icon={MapPin}
                    type="text"
                    placeholder="MG Road, Bhubaneswar"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    trailingIcon={
                      locating
                        ? <Loader2 size={13} className="animate-spin text-[#FF6A00]" />
                        : <Crosshair size={13} />
                    }
                    trailingAction={handleLocate}
                  />
                </FormField>
              </div>

              <FormField label="Business Category">
                <div className="relative group">
                  {selectedCat ? (
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2">
                      <selectedCat.Icon size={15} className={selectedCat.iconColor} />
                    </span>
                  ) : (
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Store size={15} />
                    </span>
                  )}
                  <select
                    value={categoryOverride}
                    onChange={(e) => setCategoryOverride(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white/50 pl-10 pr-8 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00]/30 transition-all appearance-none"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </FormField>
            </div>

            {/* STEP 4: Credentials */}
            <div className="p-5 space-y-3.5">
              <StepHeader
                number={4}
                title="Create Account Password"
                subtext="Choose a secure password to sign in"
              />

              <div className="grid grid-cols-2 gap-3.5">
                <FormField label="Password" error={errors.password}>
                  <IconInput
                    icon={Lock}
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    trailingIcon={showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    trailingAction={() => setShowPw((v) => !v)}
                    inputClassName={errors.password ? "border-red-400" : ""}
                  />
                </FormField>

                <FormField label="Confirm Password" error={errors.confirmPassword}>
                  <IconInput
                    icon={Lock}
                    type={showConfirmPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    trailingIcon={showConfirmPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    trailingAction={() => setShowConfirmPw((v) => !v)}
                    inputClassName={errors.confirmPassword ? "border-red-400" : ""}
                  />
                </FormField>
              </div>

              {password.length > 0 && (
                <div className="space-y-1.5 select-none pt-1">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= pwStrength.score ? pwStrength.color : "bg-slate-100"
                        }`}
                      />
                    ))}
                  </div>
                  {pwStrength.label && (
                    <p className="text-[10px] text-slate-500 font-semibold">
                      Strength:{" "}
                      <span className={`font-bold ${
                        pwStrength.score === 4 ? "text-emerald-500"
                        : pwStrength.score === 3 ? "text-blue-500"
                        : pwStrength.score === 2 ? "text-amber-500"
                        : "text-red-500"
                      }`}>{pwStrength.label}</span>
                    </p>
                  )}
                </div>
              )}

              <div className="pt-3.5 border-t border-slate-100">
                <FormField label="Referral Code (Optional)">
                  <IconInput
                    icon={Users}
                    type="text"
                    placeholder="e.g. SLR-KARAN-1234"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    inputClassName="border-slate-200"
                  />
                </FormField>
              </div>
            </div>

            {storeError && (
              <div className="mx-5 my-4 p-3 rounded-2xl bg-red-50 border border-red-100">
                <p className="text-[10px] text-red-600 font-semibold text-center">{storeError}</p>
              </div>
            )}
          </div>

          {/* CTA Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 px-6 font-bold text-white text-xs shadow-lg transition-all duration-200 active:scale-[0.98] ${
              loading
                ? "bg-[#FF6A00]/70 cursor-not-allowed"
                : "bg-[#FF6A00] hover:bg-[#EA5A00] shadow-orange-500/10"
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Creating Account…</span>
              </>
            ) : (
              <>
                <Rocket size={15} />
                <span>Create My Business Account</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info & Links */}
        <div className="text-center mt-6 space-y-2 select-none">
          <p className="text-xs text-slate-500 font-semibold">
            Already using ScanLoyal?{" "}
            <Link
              to="/login"
              className="font-bold text-[#FF6A00] hover:underline"
            >
              Sign In
            </Link>
          </p>
          <p className="text-[10px] text-slate-400 font-bold tracking-wider">
            GSTIN: 21AAGCL8672A1ZR
          </p>
        </div>

      </div>
    </div>
  );
}

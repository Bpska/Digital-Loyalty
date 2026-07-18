import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { ShieldCheck, UserPlus } from "lucide-react";

export default function CreatorAuth() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(true);

  // Registration States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  // Platform toggle states
  const [showInstagram, setShowInstagram] = useState(true);
  const [showFacebook, setShowFacebook] = useState(false);
  const [showLinkedIn, setShowLinkedIn] = useState(false);
  const [showYouTube, setShowYouTube] = useState(false);

  const [location, setLocation] = useState("");
  const [agreed, setAgreed] = useState(false);

  // OTP State
  const [showOtp, setShowOtp] = useState(false);
  const [otpVal, setOtpVal] = useState("");
  const [otpEmail, setOtpEmail] = useState("");

  // Pending Status State
  const [isPending, setIsPending] = useState(false);
  const [creatorName, setCreatorName] = useState("");

  // Common UI State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!agreed) {
      setErrorMsg("You must agree to the Terms & Conditions");
      return;
    }
    if (!showInstagram && !showFacebook && !showLinkedIn && !showYouTube) {
      setErrorMsg("Please select at least one social media platform and provide its profile link.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/creators/register", {
        name,
        email,
        password,
        phone,
        instagramUrl: showInstagram ? instagramUrl : "",
        facebookUrl: showFacebook ? facebookUrl : "",
        linkedinUrl: showLinkedIn ? linkedinUrl : "",
        youtubeUrl: showYouTube ? youtubeUrl : "",
        location,
        city: "",
        state: "",
        country: "",
      });
      setOtpEmail(email);
      setShowOtp(true);
    } catch (err) {
      setErrorMsg(err.message || "Failed to register creator");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      await api.post("/creators/verify-otp", {
        email: otpEmail,
        otp: otpVal,
      });
      setIsPending(true);
      setShowOtp(false);
    } catch (err) {
      setErrorMsg(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await api.post("/creators/login", { email, password });
      if (res.data.requiresVerification) {
        setOtpEmail(res.data.email);
        setShowOtp(true);
        setIsRegister(false);
      } else if (res.data.status === "PENDING" || res.data.status === "REJECTED") {
        setCreatorName(res.data.name || "");
        setIsPending(true);
      } else if (res.data.token) {
        localStorage.setItem("creatorToken", res.data.token);
        localStorage.setItem("creatorName", res.data.name);
        navigate("/dashboard/creator");
      }
    } catch (err) {
      setErrorMsg(err.message || "Login failed. Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Shared header (matches landing page exactly)
  const PageHeader = () => (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2.5 shrink-0">
          <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center font-bold text-white text-sm">SL</div>
          <span className="text-lg font-bold text-[#0F172A] tracking-tight hidden sm:block">Scanloyal</span>
        </Link>

        {/* Center Tag */}
        <div className="text-center select-none">
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest leading-none">Creator Partner Program</p>
        </div>

        {/* Right: Toggle */}
        <button
          onClick={() => setIsRegister(!isRegister)}
          className="text-xs font-bold text-[#64748B] hover:text-[#0F172A] transition-colors shrink-0"
        >
          {isRegister ? "Sign In" : "Apply Now"}
        </button>
      </div>
    </header>
  );

  // ── Pending Screen ──
  if (isPending) {
    return (
      <div className="min-h-screen bg-white text-[#2B201A] font-sans">
        <PageHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] p-4">
          <div className="bg-white/75 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#F97316]/10 flex items-center justify-center mx-auto">
              <ShieldCheck className="h-8 w-8 text-[#F97316]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#0F172A]">Application Submitted!</h2>
              <p className="text-sm text-[#64748B] mt-2 leading-relaxed">
                Thank you <strong className="text-[#0F172A]">{creatorName || "Partner"}</strong>! Your partner program application is successfully submitted and is currently{" "}
                <strong className="text-[#F97316]">Waiting For Admin Approval</strong>. We will notify you via email once approved.
              </p>
            </div>
            <button
              className="w-full bg-[#F97316] hover:bg-[#EA580C] active:scale-[0.98] text-white font-bold py-3 rounded-full text-sm transition-all shadow-md shadow-[#F97316]/20"
              onClick={() => { setIsPending(false); setIsRegister(false); }}
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── OTP Screen ──
  if (showOtp) {
    return (
      <div className="min-h-screen bg-white text-[#2B201A] font-sans">
        <PageHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] p-4">
          <div className="bg-white/75 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-black text-[#0F172A]">Verify Your Email</h2>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Enter the 6-digit OTP code sent to <strong className="text-[#0F172A]">{otpEmail}</strong> to activate your creator partner account.
              </p>
            </div>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {errorMsg && (
                <div className="bg-red-50 text-red-500 text-xs p-3 rounded-xl border border-red-200 text-center font-semibold">
                  {errorMsg}
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#64748B] ml-1">6-Digit Verification Code</label>
                <input
                  type="text"
                  placeholder="e.g. 123456"
                  value={otpVal}
                  maxLength={6}
                  onChange={(e) => setOtpVal(e.target.value)}
                  className="w-full text-center font-black text-lg rounded-xl border border-slate-200 bg-white/60 px-3.5 py-3 text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#F97316] hover:bg-[#EA580C] active:scale-[0.98] text-white font-bold py-3 rounded-full text-sm transition-all shadow-md shadow-[#F97316]/20"
              >
                {loading ? "Verifying..." : "Verify OTP & Submit Application"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Register / Login Screen ──
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-white text-[#2B201A] font-sans">
      {/* Subtle background blobs */}
      <div className="pointer-events-none fixed top-[-15%] left-[-10%] w-[55%] aspect-square rounded-full bg-[#F97316]/8 blur-3xl" />
      <div className="pointer-events-none fixed bottom-[-15%] right-[-10%] w-[55%] aspect-square rounded-full bg-[#F97316]/6 blur-3xl" />

      <PageHeader />

      {/* Hero badge */}
      <div className="relative z-10 pt-8 pb-2 text-center px-4">
        <span className="inline-flex items-center gap-1.5 bg-[#F97316]/10 text-[#F97316] text-[10px] font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
          <UserPlus size={11} />
          Affiliate Partner Program
        </span>
        <h1 className="mt-3 text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
          Earn <span className="text-[#F97316]">10% Commission</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">Refer businesses to Scanloyal and get paid for every conversion.</p>
      </div>

      {/* Card */}
      <div className="relative z-10 max-w-md w-full mx-auto px-4 pb-14 mt-4">
        {/* Tab Switcher */}
        <div className="flex rounded-2xl bg-slate-100 p-1 mb-4">
          <button
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              isRegister
                ? "bg-white text-[#0F172A] shadow-sm"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            Apply Now
          </button>
          <button
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              !isRegister
                ? "bg-white text-[#0F172A] shadow-sm"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            Sign In
          </button>
        </div>

        <div className="bg-white/75 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-5 sm:p-6">
          {errorMsg && (
            <div className="bg-red-50 text-red-500 text-xs p-3 rounded-xl border border-red-200 text-center font-semibold mb-4">
              {errorMsg}
            </div>
          )}

          {/* ── Registration Form ── */}
          {isRegister ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#64748B] ml-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="Karan Dev"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white/60 px-3.5 py-2.5 text-xs text-[#0F172A] font-semibold placeholder:text-slate-400 focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 transition-all"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#64748B] ml-1">Email Address *</label>
                <input
                  type="email"
                  placeholder="karan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white/60 px-3.5 py-2.5 text-xs text-[#0F172A] font-semibold placeholder:text-slate-400 focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#64748B] ml-1">Password *</label>
                <input
                  type="password"
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white/60 px-3.5 py-2.5 text-xs text-[#0F172A] font-semibold placeholder:text-slate-400 focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 transition-all"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#64748B] ml-1">Mobile Number *</label>
                <input
                  type="text"
                  placeholder="+919876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white/60 px-3.5 py-2.5 text-xs text-[#0F172A] font-semibold placeholder:text-slate-400 focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 transition-all"
                  required
                />
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#64748B] ml-1">Location / Address *</label>
                <input
                  type="text"
                  placeholder="Building 2A, KIIT Rd"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white/60 px-3.5 py-2.5 text-xs text-[#0F172A] font-semibold placeholder:text-slate-400 focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 transition-all"
                  required
                />
              </div>

              {/* Social Media Section */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <p className="text-[11px] font-bold text-[#64748B] ml-1">Social Media Profiles</p>

                {/* Platform Toggles */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "chk-insta", label: "Instagram", val: showInstagram, set: setShowInstagram },
                    { id: "chk-fb",    label: "Facebook",  val: showFacebook,  set: setShowFacebook  },
                    { id: "chk-li",    label: "LinkedIn",  val: showLinkedIn,  set: setShowLinkedIn  },
                    { id: "chk-yt",    label: "YouTube",   val: showYouTube,   set: setShowYouTube   },
                  ].map(({ id, label, val, set }) => (
                    <label
                      key={id}
                      htmlFor={id}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all select-none ${
                        val
                          ? "border-[#F97316]/50 bg-[#F97316]/5 text-[#0F172A]"
                          : "border-slate-200 bg-slate-50 text-[#64748B]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        id={id}
                        checked={val}
                        onChange={(e) => set(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-[#F97316] focus:ring-[#F97316] bg-white cursor-pointer accent-[#F97316]"
                      />
                      <span className="text-[10px] font-bold">{label}</span>
                    </label>
                  ))}
                </div>

                {/* Conditional URL Inputs */}
                <div className="space-y-2.5">
                  {showInstagram && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#64748B] ml-1">Instagram Profile Link *</label>
                      <input
                        type="url"
                        placeholder="https://instagram.com/yourhandle"
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white/60 px-3.5 py-2.5 text-xs text-[#0F172A] font-semibold placeholder:text-slate-400 focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 transition-all"
                        required
                      />
                    </div>
                  )}
                  {showFacebook && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#64748B] ml-1">Facebook Profile Link *</label>
                      <input
                        type="url"
                        placeholder="https://facebook.com/yourprofile"
                        value={facebookUrl}
                        onChange={(e) => setFacebookUrl(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white/60 px-3.5 py-2.5 text-xs text-[#0F172A] font-semibold placeholder:text-slate-400 focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 transition-all"
                        required
                      />
                    </div>
                  )}
                  {showLinkedIn && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#64748B] ml-1">LinkedIn Profile Link *</label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/yourprofile"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white/60 px-3.5 py-2.5 text-xs text-[#0F172A] font-semibold placeholder:text-slate-400 focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 transition-all"
                        required
                      />
                    </div>
                  )}
                  {showYouTube && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#64748B] ml-1">YouTube Channel Link *</label>
                      <input
                        type="url"
                        placeholder="https://youtube.com/@yourchannel"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white/60 px-3.5 py-2.5 text-xs text-[#0F172A] font-semibold placeholder:text-slate-400 focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 transition-all"
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Terms checkbox */}
              <label htmlFor="agreed-chk" className="flex items-start gap-2.5 py-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="agreed-chk"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#F97316] focus:ring-[#F97316] bg-white cursor-pointer accent-[#F97316] shrink-0"
                />
                <span className="text-[11px] text-[#64748B] leading-snug">
                  I agree to the Creator Partner Program{" "}
                  <span className="text-[#F97316] font-bold">Terms &amp; Conditions</span>
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#F97316] hover:bg-[#EA580C] active:scale-[0.98] text-white font-extrabold py-3.5 rounded-full text-sm transition-all shadow-md shadow-[#F97316]/20"
              >
                {loading ? "Submitting Application..." : "Submit Application →"}
              </button>

              <p className="text-center text-xs text-[#64748B] pt-0.5">
                Already registered?{" "}
                <button type="button" className="text-[#F97316] font-bold hover:underline" onClick={() => setIsRegister(false)}>
                  Sign In
                </button>
              </p>
            </form>
          ) : (
            /* ── Login Form ── */
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#64748B] ml-1">Email Address</label>
                <input
                  type="email"
                  placeholder="karan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white/60 px-3.5 py-2.5 text-xs text-[#0F172A] font-semibold placeholder:text-slate-400 focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 transition-all"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#64748B] ml-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white/60 px-3.5 py-2.5 text-xs text-[#0F172A] font-semibold placeholder:text-slate-400 focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#F97316] hover:bg-[#EA580C] active:scale-[0.98] text-white font-extrabold py-3.5 rounded-full text-sm transition-all shadow-md shadow-[#F97316]/20"
              >
                {loading ? "Signing In..." : "Sign In to Dashboard →"}
              </button>

              <p className="text-center text-xs text-[#64748B] pt-0.5">
                Become a Partner?{" "}
                <button type="button" className="text-[#F97316] font-bold hover:underline" onClick={() => setIsRegister(true)}>
                  Apply Now
                </button>
              </p>
            </form>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-center text-[10px] text-[#64748B] mt-5 px-4">
          By applying, you agree to Scanloyal's{" "}
          <Link to="/partner-program" className="text-[#F97316] font-semibold hover:underline">
            Partner Program Terms
          </Link>
        </p>
      </div>
    </div>
  );
}

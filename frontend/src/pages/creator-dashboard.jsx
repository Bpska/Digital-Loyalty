import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users, DollarSign, TrendingUp, Wallet, LogOut, Code,
  CheckCircle2, ChevronRight, LayoutDashboard
} from "lucide-react";

const TABS = [
  { id: "dashboard",   label: "Overview",    Icon: LayoutDashboard },
  { id: "referrals",   label: "Referrals",   Icon: Users           },
  { id: "earnings",    label: "Earnings",    Icon: DollarSign      },
  { id: "withdrawals", label: "Withdraw",    Icon: Wallet          },
];

/* ────────────────────────────────────────────
   Status badge helper
──────────────────────────────────────────── */
function Badge({ status }) {
  const green = status === "ACTIVE" || status === "APPROVED" || status === "PAID";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[9px] border ${
      green
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        : "bg-orange-500/10 text-orange-400 border-orange-500/20"
    }`}>
      {status}
    </span>
  );
}

/* ────────────────────────────────────────────
   Main Component
──────────────────────────────────────────── */
export default function CreatorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);

  // Withdrawal States
  const [wAmount, setWAmount] = useState("");
  const [wMethod, setWMethod] = useState("UPI");
  const [upiId, setUpiId] = useState("");
  const [accName, setAccName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accNum, setAccNum] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [branch, setBranch] = useState("");

  const creatorName = localStorage.getItem("creatorName") || "Partner";

  const fetchDashboardData = async () => {
    try {
      const res = await api.get("/creators/dashboard", {
        headers: { Authorization: `Bearer ${localStorage.getItem("creatorToken")}` },
      });
      setDbData(res.data);
    } catch (err) {
      console.error(err);
      navigate("/partner-program");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("creatorToken");
    if (!token) { navigate("/partner-program"); return; }
    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("creatorToken");
    localStorage.removeItem("creatorName");
    navigate("/partner-program");
  };

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
    setSubmittingWithdrawal(true);
    try {
      await api.post(
        "/creators/withdrawals",
        {
          amount: wAmount,
          method: wMethod,
          upiId: wMethod === "UPI" ? upiId : null,
          accountHolderName: wMethod === "BANK" ? accName : null,
          bankName: wMethod === "BANK" ? bankName : null,
          accountNumber: wMethod === "BANK" ? accNum : null,
          ifscCode: wMethod === "BANK" ? ifsc : null,
          branchName: wMethod === "BANK" ? branch : null,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("creatorToken")}` } }
      );
      alert("Withdrawal request submitted successfully!");
      setWAmount(""); setUpiId(""); setAccName(""); setBankName(""); setAccNum(""); setIfsc(""); setBranch("");
      fetchDashboardData();
    } catch (err) {
      alert(err.message || "Failed to submit withdrawal request");
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  /* ── Loading Screen ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <div className="text-white text-sm font-semibold animate-pulse">Loading Creator Console...</div>
      </div>
    );
  }

  const {
    referralCode,
    totalReferrals = 0,
    activeReferralsCount = 0,
    totalEarnings = 0,
    availableBalance = 0,
    referrals = [],
    commissions = [],
    withdrawals = [],
  } = dbData || {};

  /* ── Stat Card ── */
  const StatCard = ({ label, value, Icon, color = "text-white" }) => (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{label}</span>
        <Icon className="h-4 w-4 text-slate-500 shrink-0" />
      </div>
      <div className={`text-2xl font-black ${color}`}>{value}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans flex flex-col md:flex-row">

      {/* ══════════════════════════════════════
          DESKTOP SIDEBAR (hidden on mobile)
      ══════════════════════════════════════ */}
      <aside className="hidden md:flex md:flex-col w-64 bg-slate-900 border-r border-slate-800 h-screen sticky top-0 shrink-0 z-30">
        {/* Brand */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">C</div>
          <span className="font-extrabold text-sm tracking-tight text-white">Creator Console</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {TABS.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active ? "bg-orange-500 text-white shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label === "Overview" ? "Dashboard" : label === "Withdraw" ? "Withdrawal Requests" : label === "Earnings" ? "Commission Earnings" : "Referred Businesses"}</span>
              </button>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
              {creatorName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{creatorName}</p>
              <p className="text-[10px] text-slate-500">Affiliate Partner</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════
          MOBILE TOP BAR (hidden on desktop)
      ══════════════════════════════════════ */}
      <header className="md:hidden sticky top-0 z-40 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 h-14 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">C</div>
          <span className="font-extrabold text-sm tracking-tight text-white">Creator Console</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs">
            {creatorName.charAt(0).toUpperCase()}
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition-colors p-1">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════ */}
      <main className="flex-1 px-4 py-5 md:px-8 md:py-8 pb-24 md:pb-8 max-w-5xl w-full mx-auto space-y-5">

        {/* Header: Welcome + Referral Code */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <div>
            <h1 className="text-base sm:text-lg font-black text-white leading-tight">Welcome back, {creatorName}! 👋</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Track referred businesses, calculate payouts, and claim commissions.</p>
          </div>
          <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 px-3.5 py-2 rounded-xl">
            <Code className="h-4 w-4 text-orange-500 shrink-0" />
            <div>
              <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">My Referral Code</span>
              <span className="text-xs font-mono font-black text-orange-500 tracking-wider select-all">{referralCode || "PENDING"}</span>
            </div>
          </div>
        </div>

        {/* ── DASHBOARD TAB ── */}
        {activeTab === "dashboard" && (
          <div className="space-y-5">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Total Referrals"    value={totalReferrals}                Icon={Users}          />
              <StatCard label="Active Businesses"  value={activeReferralsCount}          Icon={CheckCircle2}   color="text-emerald-400" />
              <StatCard label="Total Earnings"     value={`₹${totalEarnings.toFixed(2)}`}  Icon={DollarSign}  color="text-orange-400" />
              <StatCard label="Available Balance"  value={`₹${availableBalance.toFixed(2)}`} Icon={Wallet}     color="text-emerald-400" />
            </div>

            {/* Recent Referrals */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800">
                <span className="text-xs font-extrabold text-white">Recent Referrals</span>
                <button onClick={() => setActiveTab("referrals")} className="text-[10px] text-orange-400 font-bold hover:underline">View All</button>
              </div>
              <div className="divide-y divide-slate-800/60">
                {referrals.slice(0, 3).map((ref) => (
                  <div key={ref.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-xs font-bold text-white">{ref.business.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{ref.business.category || "General"}</p>
                    </div>
                    <Badge status={ref.business.status} />
                  </div>
                ))}
                {referrals.length === 0 && (
                  <p className="text-center text-xs text-slate-500 py-8">No referred businesses yet.</p>
                )}
              </div>
            </div>

            {/* Recent Earnings */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800">
                <span className="text-xs font-extrabold text-white">Recent Earnings</span>
                <button onClick={() => setActiveTab("earnings")} className="text-[10px] text-orange-400 font-bold hover:underline">View All</button>
              </div>
              <div className="divide-y divide-slate-800/60">
                {commissions.slice(0, 3).map((comm) => (
                  <div key={comm.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-xs font-bold text-white">Referral Commission</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{new Date(comm.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-orange-400">₹{parseFloat(comm.amount.toString()).toFixed(2)}</p>
                      <Badge status={comm.status} />
                    </div>
                  </div>
                ))}
                {commissions.length === 0 && (
                  <p className="text-center text-xs text-slate-500 py-8">No commission earnings yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── REFERRALS TAB ── */}
        {activeTab === "referrals" && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-4 border-b border-slate-800">
              <p className="text-sm font-extrabold text-white">All Referred Businesses</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Businesses that registered using your referral code</p>
            </div>

            {referrals.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-12">No referred businesses yet.</p>
            ) : (
              <>
                {/* Mobile card list (hidden on md+) */}
                <div className="divide-y divide-slate-800/60 md:hidden">
                  {referrals.map((ref) => {
                    const cMatch = commissions.find(c => c.businessId === ref.businessId);
                    return (
                      <div key={ref.id} className="px-4 py-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white">{ref.business.name}</p>
                          <Badge status={ref.business.status} />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>{ref.business.category || "General"}</span>
                          <span>{new Date(ref.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[10px] font-black text-orange-400">
                          Commission: {cMatch ? `₹${parseFloat(cMatch.amount.toString()).toFixed(2)}` : "₹0.00 (Pending)"}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop table (hidden on mobile) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-500 font-extrabold">
                        <th className="px-5 py-3">Business Name</th>
                        <th className="px-5 py-3">Category</th>
                        <th className="px-5 py-3">Registered</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Commission</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referrals.map((ref) => {
                        const cMatch = commissions.find(c => c.businessId === ref.businessId);
                        return (
                          <tr key={ref.id} className="border-b border-slate-800/50 hover:bg-slate-900/30">
                            <td className="px-5 py-3 font-bold text-white">{ref.business.name}</td>
                            <td className="px-5 py-3">{ref.business.category || "—"}</td>
                            <td className="px-5 py-3">{new Date(ref.createdAt).toLocaleDateString()}</td>
                            <td className="px-5 py-3"><Badge status={ref.business.status} /></td>
                            <td className="px-5 py-3 font-black text-orange-400">
                              {cMatch ? `₹${parseFloat(cMatch.amount.toString()).toFixed(2)}` : "₹0.00 (Pending)"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── EARNINGS TAB ── */}
        {activeTab === "earnings" && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-4 border-b border-slate-800">
              <p className="text-sm font-extrabold text-white">Affiliate Commission Log</p>
              <p className="text-[10px] text-slate-400 mt-0.5">10% commission on every ₹999 business subscription</p>
            </div>

            {commissions.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-12">No commission logs recorded.</p>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="divide-y divide-slate-800/60 md:hidden">
                  {commissions.map((comm) => (
                    <div key={comm.id} className="px-4 py-3.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-black text-orange-400">₹{parseFloat(comm.amount.toString()).toFixed(2)}</p>
                        <Badge status={comm.status} />
                      </div>
                      <p className="text-[10px] text-slate-400">10% Sub Conversion · {new Date(comm.createdAt).toLocaleDateString()}</p>
                      <p className="text-[9px] font-mono text-slate-600 truncate">{comm.id}</p>
                    </div>
                  ))}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-500 font-extrabold">
                        <th className="px-5 py-3">Commission ID</th>
                        <th className="px-5 py-3">Amount</th>
                        <th className="px-5 py-3">Type</th>
                        <th className="px-5 py-3">Earned Date</th>
                        <th className="px-5 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissions.map((comm) => (
                        <tr key={comm.id} className="border-b border-slate-800/50 hover:bg-slate-900/30">
                          <td className="px-5 py-3 font-mono text-[10px] text-slate-400">{comm.id}</td>
                          <td className="px-5 py-3 font-black text-orange-400">₹{parseFloat(comm.amount.toString()).toFixed(2)}</td>
                          <td className="px-5 py-3">10% Sub Conversion</td>
                          <td className="px-5 py-3">{new Date(comm.createdAt).toLocaleDateString()}</td>
                          <td className="px-5 py-3"><Badge status={comm.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── WITHDRAWALS TAB ── */}
        {activeTab === "withdrawals" && (
          <div className="space-y-5">
            {/* Withdrawal History */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="px-4 py-4 border-b border-slate-800">
                <p className="text-sm font-extrabold text-white">Withdrawal History</p>
              </div>

              {withdrawals.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-10">No withdrawal history found.</p>
              ) : (
                <>
                  {/* Mobile cards */}
                  <div className="divide-y divide-slate-800/60 md:hidden">
                    {withdrawals.map((w) => (
                      <div key={w.id} className="px-4 py-3.5 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-black text-orange-400">₹{parseFloat(w.amount.toString()).toFixed(2)}</p>
                          <Badge status={w.status} />
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {w.method} · {w.method === "UPI" ? w.upiId : `${w.bankName} - ${w.accountNumber}`}
                        </p>
                        <p className="text-[9px] font-mono text-slate-600 truncate">{w.id}</p>
                      </div>
                    ))}
                  </div>

                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-xs text-left text-slate-300">
                      <thead>
                        <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-500 font-extrabold">
                          <th className="px-5 py-3">Request ID</th>
                          <th className="px-5 py-3">Amount</th>
                          <th className="px-5 py-3">Method</th>
                          <th className="px-5 py-3">Details</th>
                          <th className="px-5 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {withdrawals.map((w) => (
                          <tr key={w.id} className="border-b border-slate-800/50 hover:bg-slate-900/30">
                            <td className="px-5 py-3 font-mono text-[10px] text-slate-400">{w.id}</td>
                            <td className="px-5 py-3 font-black text-orange-400">₹{parseFloat(w.amount.toString()).toFixed(2)}</td>
                            <td className="px-5 py-3">{w.method}</td>
                            <td className="px-5 py-3 text-[10px] text-slate-400 truncate max-w-[160px]">
                              {w.method === "UPI" ? w.upiId : `${w.bankName} - ${w.accountNumber}`}
                            </td>
                            <td className="px-5 py-3"><Badge status={w.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Payout Request Form */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5">
              <div className="mb-4">
                <p className="text-sm font-extrabold text-white">Request Payout</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Available Balance: <span className="text-orange-400 font-bold">₹{availableBalance.toFixed(2)}</span></p>
              </div>
              <form onSubmit={handleWithdrawalSubmit} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300 font-semibold">Amount (₹)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 500"
                    value={wAmount}
                    onChange={(e) => setWAmount(e.target.value)}
                    className="text-xs bg-slate-800 border-slate-700 text-white rounded-xl"
                    min={1}
                    max={availableBalance}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300 font-semibold">Payment Method</Label>
                  <select
                    value={wMethod}
                    onChange={(e) => setWMethod(e.target.value)}
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 outline-none focus:border-orange-500"
                  >
                    <option value="UPI">UPI</option>
                    <option value="BANK">Bank Transfer</option>
                  </select>
                </div>

                {wMethod === "UPI" ? (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300 font-semibold">UPI ID</Label>
                    <Input
                      type="text"
                      placeholder="e.g. name@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="text-xs bg-slate-800 border-slate-700 text-white rounded-xl"
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    {[
                      { label: "Account Holder Name", val: accName, set: setAccName, placeholder: "Full Name" },
                      { label: "Bank Name",           val: bankName, set: setBankName, placeholder: "SBI, HDFC etc." },
                      { label: "Account Number",      val: accNum,  set: setAccNum,  placeholder: "1234567890" },
                      { label: "IFSC Code",           val: ifsc,    set: setIfsc,    placeholder: "SBIN0001234" },
                      { label: "Branch Name",         val: branch,  set: setBranch,  placeholder: "Main Branch" },
                    ].map(({ label, val, set, placeholder }) => (
                      <div key={label} className="space-y-1.5">
                        <Label className="text-xs text-slate-400 font-semibold">{label}</Label>
                        <Input
                          type="text"
                          placeholder={placeholder}
                          value={val}
                          onChange={(e) => set(e.target.value)}
                          className="text-xs bg-slate-800 border-slate-700 text-white rounded-xl"
                          required
                        />
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingWithdrawal || availableBalance <= 0}
                  className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-full text-xs transition-all shadow-md shadow-orange-500/20"
                >
                  {submittingWithdrawal ? "Submitting..." : "Submit Withdrawal Request"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* ══════════════════════════════════════
          MOBILE BOTTOM TAB BAR (hidden on md+)
      ══════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 flex">
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${
                active ? "text-orange-400" : "text-slate-500"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="text-[9px] font-bold leading-none">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

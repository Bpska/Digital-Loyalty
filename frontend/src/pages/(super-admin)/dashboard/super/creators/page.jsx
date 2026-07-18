import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users, CheckCircle2, XCircle, Clock, ExternalLink, ShieldCheck, Mail, MapPin, Calendar
} from "lucide-react";

export default function SuperAdminCreators() {
  const [creators, setCreators] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState("applications");

  const fetchData = async () => {
    setLoading(true);
    try {
      const appRes = await api.get("/creators/admin/applications");
      setCreators(appRes.data || []);
      const withRes = await api.get("/creators/admin/withdrawals");
      setWithdrawals(withRes.data || []);
    } catch (err) {
      console.error("Failed to load partner program admin data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this applicant?`)) return;
    try {
      await api.post(`/creators/admin/applications/${id}/status`, { status });
      alert(`Applicant successfully ${status.toLowerCase()}!`);
      fetchData();
    } catch (err) {
      alert(err.message || "Failed to update status");
    }
  };

  const handleUpdateWithdrawal = async (id, status) => {
    if (!window.confirm(`Are you sure you want to mark this request as ${status.toLowerCase()}?`)) return;
    try {
      await api.post(`/creators/admin/withdrawals/${id}/status`, { status });
      alert(`Withdrawal request successfully ${status.toLowerCase()}!`);
      fetchData();
    } catch (err) {
      alert(err.message || "Failed to update withdrawal status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-slate-400 font-bold animate-pulse text-xs">Loading Partner Program Manager...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Selectors */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveSubTab("applications")}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeSubTab === "applications" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Creator Applications ({creators.filter(c => c.status === "PENDING").length})
        </button>
        <button
          onClick={() => setActiveSubTab("withdrawals")}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeSubTab === "withdrawals" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Creator Withdrawals ({withdrawals.filter(w => w.status === "PENDING").length})
        </button>
        <button
          onClick={() => setActiveSubTab("all-creators")}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeSubTab === "all-creators" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          All Approved Creators ({creators.filter(c => c.status === "APPROVED").length})
        </button>
      </div>

      {/* Applications Panel */}
      {activeSubTab === "applications" && (
        <Card className="border-border bg-card">
          <CardHeader className="p-6 border-b border-border">
            <CardTitle className="text-sm font-extrabold text-foreground">Creator Applicants</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Review social profiles and approve creator referral code generation applications.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border text-[10px] uppercase text-muted-foreground font-extrabold pb-3">
                    <th className="pb-3">Applicant Name</th>
                    <th className="pb-3">Contact</th>
                    <th className="pb-3">Social Profiles</th>
                    <th className="pb-3">Location</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {creators.filter(c => c.status === "PENDING").map((c) => (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-muted/10">
                      <td className="py-3 font-bold text-foreground">{c.name}</td>
                      <td className="py-3">
                        <p className="font-semibold">{c.email}</p>
                        <p className="text-muted-foreground text-[10px] mt-0.5">{c.phone}</p>
                      </td>
                      <td className="py-3 space-x-2">
                        {c.profile?.instagramUrl && (
                          <a href={c.profile.instagramUrl} target="_blank" rel="noopener noreferrer" className="bg-[#6D5DD3]/10 text-[#6D5DD3] px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-0.5">
                            Insta <ExternalLink className="h-2 w-2" />
                          </a>
                        )}
                        {c.profile?.facebookUrl && (
                          <a href={c.profile.facebookUrl} target="_blank" rel="noopener noreferrer" className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-0.5">
                            FB <ExternalLink className="h-2 w-2" />
                          </a>
                        )}
                      </td>
                      <td className="py-3">
                        <p className="font-semibold">{c.profile?.city}, {c.profile?.state}</p>
                        <p className="text-muted-foreground text-[10px] mt-0.5">{c.profile?.country}</p>
                      </td>
                      <td className="py-3">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 space-x-2">
                        <Button size="xs" onClick={() => handleUpdateStatus(c.id, "APPROVED")} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-full px-3 py-1">
                          Approve
                        </Button>
                        <Button size="xs" variant="destructive" onClick={() => handleUpdateStatus(c.id, "REJECTED")} className="text-[10px] rounded-full px-3 py-1">
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {creators.filter(c => c.status === "PENDING").length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-10">No pending partner applications found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Withdrawals Panel */}
      {activeSubTab === "withdrawals" && (
        <Card className="border-border bg-card">
          <CardHeader className="p-6 border-b border-border">
            <CardTitle className="text-sm font-extrabold text-foreground">Creator Withdrawal Requests</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Approve payout commission requests and mark them as paid after bank / UPI transfers.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border text-[10px] uppercase text-muted-foreground font-extrabold pb-3">
                    <th className="pb-3">Creator</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Method</th>
                    <th className="pb-3">Payout Details</th>
                    <th className="pb-3">Request Date</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.filter(w => w.status === "PENDING").map((w) => (
                    <tr key={w.id} className="border-b border-border/50 hover:bg-muted/10">
                      <td className="py-3 font-bold text-foreground">{w.creator?.name}</td>
                      <td className="py-3 font-black text-orange-500">₹{parseFloat(w.amount.toString()).toFixed(2)}</td>
                      <td className="py-3 font-semibold">{w.method}</td>
                      <td className="py-3">
                        {w.method === "UPI" ? (
                          <code className="bg-slate-100 text-[#0F172A] px-2 py-1 rounded text-[10px] select-all font-mono font-bold">{w.upiId}</code>
                        ) : (
                          <div className="space-y-0.5 text-[10px] text-muted-foreground font-semibold">
                            <p className="text-foreground">Name: {w.accountHolderName}</p>
                            <p>Bank: {w.bankName} ({w.branchName})</p>
                            <p>A/C: {w.accountNumber}</p>
                            <p>IFSC: {w.ifscCode}</p>
                          </div>
                        )}
                      </td>
                      <td className="py-3">{new Date(w.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 space-x-2">
                        <Button size="xs" onClick={() => handleUpdateWithdrawal(w.id, "PAID")} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-full px-3 py-1">
                          Mark Paid
                        </Button>
                        <Button size="xs" variant="destructive" onClick={() => handleUpdateWithdrawal(w.id, "REJECTED")} className="text-[10px] rounded-full px-3 py-1">
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {withdrawals.filter(w => w.status === "PENDING").length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-10">No pending withdrawal requests found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approved Creators List */}
      {activeSubTab === "all-creators" && (
        <Card className="border-border bg-card">
          <CardHeader className="p-6 border-b border-border">
            <CardTitle className="text-sm font-extrabold text-foreground">Approved Creators Directory</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">List of active creators registered with referral codes in the affiliate system.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border text-[10px] uppercase text-muted-foreground font-extrabold pb-3">
                    <th className="pb-3">Creator Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Phone</th>
                    <th className="pb-3">Referral Code</th>
                    <th className="pb-3">Signup Date</th>
                  </tr>
                </thead>
                <tbody>
                  {creators.filter(c => c.status === "APPROVED").map((c) => (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-muted/10">
                      <td className="py-3 font-bold text-foreground">{c.name}</td>
                      <td className="py-3 font-medium">{c.email}</td>
                      <td className="py-3">{c.phone}</td>
                      <td className="py-3 font-mono font-black text-orange-500">{c.referralCode?.code || "—"}</td>
                      <td className="py-3">{new Date(c.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {creators.filter(c => c.status === "APPROVED").length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-10">No approved creators found in the directory.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

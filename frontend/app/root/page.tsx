"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";
import {
  Shield, Users, MapPin, Eye, EyeOff, Lock, RefreshCw, ChevronDown, ChevronUp,
  X, Check, AlertTriangle, Activity, UserX, Radio, KeyRound
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://drishti-walb.onrender.com";

type ChildDetail = {
  id: string; name: string; email?: string; child_code: string;
  parent_id?: string; parent_name?: string;
  lat?: number; lon?: number; is_sharing?: number;
  location_updated_at?: string; created_at?: string;
};
type ParentDetail = {
  id: string; name: string; email?: string; linked_children: string[];
  children_detail: ChildDetail[]; created_at?: string;
};
type Stats = {
  total_parents: number; total_children: number;
  linked_children: number; unlinked_children: number; actively_sharing: number;
};

export default function RootPage() {
  const [token, setToken] = useState<string | null>(null);
  const [pw, setPw] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [stats, setStats] = useState<Stats | null>(null);
  const [parents, setParents] = useState<ParentDetail[]>([]);
  const [children, setChildren] = useState<ChildDetail[]>([]);
  const [expandedParent, setExpandedParent] = useState<string | null>(null);
  const [expandedChild, setExpandedChild] = useState<string | null>(null);
  const [tab, setTab] = useState<"parents" | "children">("parents");

  // Password change
  const [pwModal, setPwModal] = useState<{ type: string; id: string; name: string } | null>(null);
  const [newPw, setNewPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);

  const headers = { "x-root-token": token || "" };

  // ── Login ──────────────────────────────────────────────────────────
  const handleLogin = async () => {
    setLoginLoading(true); setLoginError("");
    try {
      const res = await fetch(`${API}/root/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();
      if (data.success) { setToken(data.token); sessionStorage.setItem("root_token", data.token); }
      else setLoginError("Wrong password");
    } catch { setLoginError("Connection error"); }
    finally { setLoginLoading(false); }
  };

  useEffect(() => {
    const t = sessionStorage.getItem("root_token");
    if (t) setToken(t);
  }, []);

  // ── Fetch data ─────────────────────────────────────────────────────
  const fetchAll = async () => {
    if (!token) return;
    const h = { "x-root-token": token };
    const [s, p, c] = await Promise.all([
      fetch(`${API}/root/overview`, { headers: h }).then(r => r.json()),
      fetch(`${API}/root/parents`, { headers: h }).then(r => r.json()),
      fetch(`${API}/root/children`, { headers: h }).then(r => r.json()),
    ]);
    setStats(s); setParents(p.parents || []); setChildren(c.children || []);
  };

  useEffect(() => { if (token) fetchAll(); }, [token]);

  // ── Change password ────────────────────────────────────────────────
  const handleChangePw = async () => {
    if (!pwModal || !newPw) return; setPwMsg("");
    try {
      const res = await fetch(`${API}/root/change-password`, {
        method: "POST", headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ user_type: pwModal.type, user_id: pwModal.id, new_password: newPw }),
      });
      const d = await res.json();
      setPwMsg(d.success ? "✓ Password updated" : d.detail || "Failed");
      if (d.success) setTimeout(() => { setPwModal(null); setNewPw(""); setPwMsg(""); }, 1500);
    } catch { setPwMsg("Connection error"); }
  };

  const logout = () => { setToken(null); sessionStorage.removeItem("root_token"); };

  // ── LOGIN SCREEN ───────────────────────────────────────────────────
  if (!token) {
    return (
      <>
        <div className="fixed inset-0 z-0 bg-zinc-950">
          <DottedGlowBackground className="opacity-30" colorDarkVar="--color-zinc-500" glowColorDarkVar="--color-red-500" speedMin={0.2} speedMax={0.6} />
        </div>
        <main className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <Card className="w-full max-w-sm bg-zinc-950/70 backdrop-blur-xl border-red-900/40 shadow-2xl">
            <CardHeader className="text-center pt-8 pb-2">
              <div className="w-14 h-14 mx-auto rounded-full border border-red-800 bg-red-950/30 flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-red-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Root Access</CardTitle>
              <p className="text-zinc-500 text-sm mt-1">Administrative control panel</p>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4 mt-4">
                <Input className="h-12 bg-zinc-900/50 border-zinc-800 text-white" placeholder="Root password" type="password"
                  value={pw} onChange={(e) => setPw(e.target.value)} required autoFocus />
                {loginError && <p className="text-red-400 text-sm text-center">{loginError}</p>}
                <Button disabled={loginLoading} type="submit" className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest">
                  {loginLoading ? "Verifying…" : "Authenticate"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  // ── ADMIN DASHBOARD ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 h-14 bg-zinc-950/90 backdrop-blur-md border-b border-red-900/30">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-red-500" />
          <span className="font-black text-lg tracking-widest uppercase">Drishti <span className="text-red-500">Root</span></span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchAll} className="border-zinc-800 text-zinc-400 hover:text-white gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> <span className="hidden sm:inline text-xs">Refresh</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={logout} className="text-red-400 hover:text-red-300 text-xs">Logout</Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "Parents", val: stats.total_parents, icon: <Users className="w-4 h-4" />, color: "text-blue-400" },
              { label: "Children", val: stats.total_children, icon: <Users className="w-4 h-4" />, color: "text-emerald-400" },
              { label: "Linked", val: stats.linked_children, icon: <Check className="w-4 h-4" />, color: "text-green-400" },
              { label: "Unlinked", val: stats.unlinked_children, icon: <UserX className="w-4 h-4" />, color: "text-amber-400" },
              { label: "Sharing", val: stats.actively_sharing, icon: <Radio className="w-4 h-4" />, color: "text-red-400" },
            ].map(s => (
              <div key={s.label} className="border border-zinc-800 rounded-xl p-3 bg-zinc-900/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={s.color}>{s.icon}</span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{s.label}</span>
                </div>
                <p className="text-2xl font-bold text-white">{s.val}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tab Switch */}
        <div className="flex gap-2 border-b border-zinc-800 pb-2">
          {(["parents", "children"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-widest rounded-t-lg transition-colors ${tab === t ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Parents List */}
        {tab === "parents" && (
          <div className="space-y-3">
            {parents.length === 0 && <p className="text-zinc-500 text-center py-8">No parents registered.</p>}
            {parents.map(p => {
              const open = expandedParent === p.id;
              return (
                <div key={p.id} className="border border-zinc-800 rounded-xl bg-zinc-900/20 overflow-hidden">
                  <button onClick={() => setExpandedParent(open ? null : p.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-colors text-left">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-blue-950/40 border border-blue-900/40 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-bold truncate">{p.name || "Unnamed"}</p>
                        <p className="text-zinc-500 text-xs truncate">{p.email || "No email"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-zinc-500 text-xs">{p.children_detail.length} child{p.children_detail.length !== 1 ? "ren" : ""}</span>
                      {open ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                    </div>
                  </button>
                  {open && (
                    <div className="border-t border-zinc-800 p-4 space-y-3 bg-zinc-950/40">
                      <div className="flex flex-wrap gap-4 text-xs text-zinc-400">
                        <span>ID: <code className="text-zinc-300">{p.id.slice(0, 12)}…</code></span>
                        <span>Created: {p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}</span>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => { setPwModal({ type: "parent", id: p.id, name: p.name || "Parent" }); setNewPw(""); setPwMsg(""); }}
                        className="border-zinc-700 text-zinc-300 gap-1.5 h-8 text-xs"><KeyRound className="w-3 h-3" /> Change Password</Button>

                      {p.children_detail.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Linked Children</p>
                          {p.children_detail.map(c => (
                            <div key={c.id} className="border border-zinc-800 rounded-lg p-3 bg-zinc-900/30 flex flex-col sm:flex-row sm:items-center gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm truncate">{c.name || "Unnamed"}</p>
                                <p className="text-zinc-500 text-[11px]">Code: {c.child_code} · {c.email || "No email"}</p>
                              </div>
                              {c.lat != null && c.lon != null ? (
                                <div className="flex items-center gap-1.5 text-emerald-400 text-xs shrink-0">
                                  <MapPin className="w-3 h-3" />
                                  <span>{c.lat.toFixed(4)}, {c.lon.toFixed(4)}</span>
                                  {c.is_sharing ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> : null}
                                </div>
                              ) : <span className="text-zinc-600 text-xs">No location</span>}
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-zinc-600 text-xs">No children linked yet.</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Children List */}
        {tab === "children" && (
          <div className="space-y-3">
            {children.length === 0 && <p className="text-zinc-500 text-center py-8">No children registered.</p>}
            {children.map(c => {
              const open = expandedChild === c.id;
              const isSharing = c.is_sharing === 1;
              return (
                <div key={c.id} className="border border-zinc-800 rounded-xl bg-zinc-900/20 overflow-hidden">
                  <button onClick={() => setExpandedChild(open ? null : c.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-colors text-left">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${isSharing ? "bg-emerald-950/40 border-emerald-900/40" : "bg-zinc-900/40 border-zinc-800"}`}>
                        <Activity className={`w-4 h-4 ${isSharing ? "text-emerald-400" : "text-zinc-500"}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-bold truncate">{c.name || "Unnamed"}</p>
                        <p className="text-zinc-500 text-xs">Code: {c.child_code} · {c.parent_name ? `→ ${c.parent_name}` : "Unlinked"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isSharing && <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900 text-emerald-400 font-bold">LIVE</span>}
                      {open ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                    </div>
                  </button>
                  {open && (
                    <div className="border-t border-zinc-800 p-4 space-y-3 bg-zinc-950/40">
                      <div className="flex flex-wrap gap-4 text-xs text-zinc-400">
                        <span>ID: <code className="text-zinc-300">{c.id.slice(0, 12)}…</code></span>
                        <span>Email: {c.email || "—"}</span>
                        <span>Created: {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</span>
                        <span>Parent: {c.parent_name || "None"}</span>
                      </div>

                      {/* Location */}
                      <div className="border border-zinc-800 rounded-lg p-3 bg-zinc-900/30">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">Location</p>
                        {c.lat != null && c.lon != null ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-emerald-400" />
                              <span className="text-white text-sm font-mono">{c.lat.toFixed(5)}, {c.lon.toFixed(5)}</span>
                              {isSharing && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                            </div>
                            {c.location_updated_at && <p className="text-zinc-500 text-xs">Updated: {new Date(c.location_updated_at).toLocaleString()}</p>}
                          </div>
                        ) : <p className="text-zinc-600 text-xs">No location recorded.</p>}
                      </div>

                      <Button size="sm" variant="outline" onClick={() => { setPwModal({ type: "child", id: c.id, name: c.name || "Child" }); setNewPw(""); setPwMsg(""); }}
                        className="border-zinc-700 text-zinc-300 gap-1.5 h-8 text-xs"><KeyRound className="w-3 h-3" /> Change Password</Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Password Change Modal */}
      {pwModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">Change Password</h3>
              <button onClick={() => setPwModal(null)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-zinc-400 text-sm mb-4">Set new password for <strong className="text-white">{pwModal.name}</strong> ({pwModal.type})</p>
            <div className="relative mb-4">
              <Input className="h-12 bg-zinc-900/50 border-zinc-800 text-white pr-10" placeholder="New password"
                type={showNewPw ? "text" : "password"} value={newPw} onChange={(e) => setNewPw(e.target.value)} />
              <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {pwMsg && <p className={`text-sm mb-3 text-center ${pwMsg.startsWith("✓") ? "text-emerald-400" : "text-red-400"}`}>{pwMsg}</p>}
            <Button onClick={handleChangePw} disabled={!newPw} className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest">
              Update Password
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

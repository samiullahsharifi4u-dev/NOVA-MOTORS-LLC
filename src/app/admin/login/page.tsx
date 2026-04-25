"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Car, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("nova-admin-token");
    if (token) router.replace("/admin/dashboard");
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("nova-admin-token", data.token);
        localStorage.setItem("nova-admin-user", JSON.stringify(data.user));
        router.push("/admin/dashboard");
      } else if (res.status === 401) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("Server error. Please restart the dev server and try again.");
      }
    } catch {
      setError("Connection error. Is the dev server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0073bb] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#0073bb]/30">
            <Car size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Nova Motors LLC</h1>
          <p className="text-gray-400 text-sm mt-1">Dealer Management System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-[#212121] mb-1">Sign in</h2>
          <p className="text-sm text-[#757575] mb-6">Access your dealer portal</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-5">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#212121] mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="you@novamotors.com"
                  className="w-full pl-9 pr-4 py-3 border border-[#e0e0e0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb] focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#212121] mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]" />
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Your password"
                  className="w-full pl-9 pr-10 py-3 border border-[#e0e0e0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757575] hover:text-[#212121]"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0073bb] hover:bg-[#005a94] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 space-y-1">
            <p className="font-medium text-gray-700">Demo credentials:</p>
            <p>Owner: admin@novamotors.com / novamotors2024</p>
            <p>Sales: james@novamotors.com / sales2024</p>
          </div>

          <p className="text-center text-xs text-[#757575] mt-4">
            <a href="/" className="hover:text-[#0073bb] transition-colors">← Back to website</a>
          </p>
        </div>
      </div>
    </div>
  );
}

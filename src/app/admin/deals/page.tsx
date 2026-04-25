"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlusCircle, Search, Eye, Pencil, Trash2, AlertTriangle, X } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Deal } from "@/lib/types";

function fmt(p: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p);
}

function token() {
  return typeof window !== "undefined" ? localStorage.getItem("nova-admin-token") || "" : "";
}

const statusColor: Record<string, string> = {
  closed: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  negotiating: "bg-blue-100 text-blue-700",
  lead: "bg-slate-100 text-slate-600",
  lost: "bg-red-100 text-red-600",
};

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/deals", { headers: { "x-admin-token": token() } })
      .then((r) => r.json())
      .then((d) => setDeals(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = deals.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.dealNumber.toLowerCase().includes(q) || d.carSnapshot.toLowerCase().includes(q) || d.salesperson.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await fetch(`/api/deals/${deleteId}`, { method: "DELETE", headers: { "x-admin-token": token() } });
    setDeleting(false);
    setDeleteId(null);
    load();
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Deals & Sales</h1>
            <p className="text-slate-500 text-sm mt-0.5">{deals.length} total deals</p>
          </div>
          <Link
            href="/admin/deals/new"
            className="flex items-center gap-2 bg-[#0073bb] hover:bg-[#005a94] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <PlusCircle size={16} />
            New Deal
          </Link>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {(["closed", "pending", "negotiating", "lead"] as const).map((s) => {
            const count = deals.filter((d) => d.status === s).length;
            const revenue = deals.filter((d) => d.status === s).reduce((sum, d) => sum + d.salePrice, 0);
            return (
              <div key={s} className="bg-white rounded-xl border border-slate-200 p-4">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColor[s]}`}>{s}</span>
                <p className="text-2xl font-extrabold text-slate-900 mt-2">{count}</p>
                {s === "closed" && <p className="text-xs text-slate-500">{fmt(revenue)} revenue</p>}
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search deals, cars, salesperson..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]"
          >
            <option value="all">All Statuses</option>
            <option value="lead">Lead</option>
            <option value="negotiating">Negotiating</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Deal #</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Vehicle</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Sale Price</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Financing</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Salesperson</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={8} className="text-center py-10">
                    <div className="w-6 h-6 border-2 border-[#0073bb] border-t-transparent rounded-full animate-spin mx-auto" />
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10 text-slate-400">No deals found.</td></tr>
                ) : filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs font-semibold text-slate-700">{d.dealNumber}</td>
                    <td className="px-5 py-3 font-medium text-slate-900">{d.carSnapshot}</td>
                    <td className="px-5 py-3 font-bold text-[#0073bb]">{fmt(d.salePrice)}</td>
                    <td className="px-5 py-3 text-slate-600 capitalize">{d.financing.type}</td>
                    <td className="px-5 py-3 text-slate-600">{d.salesperson}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColor[d.status]}`}>{d.status}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{d.createdAt.slice(0, 10)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/deals/${d.id}`} className="p-1.5 text-slate-400 hover:text-[#0073bb] hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye size={15} />
                        </Link>
                        <Link href={`/admin/deals/${d.id}/edit`} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                          <Pencil size={15} />
                        </Link>
                        <button onClick={() => setDeleteId(d.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <h3 className="font-bold text-slate-900">Delete Deal</h3>
              <button onClick={() => setDeleteId(null)} className="ml-auto text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-6">This action cannot be undone. The deal record will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold disabled:opacity-70">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

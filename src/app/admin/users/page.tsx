"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Pencil, Trash2, AlertTriangle, X, UserCog, Shield } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { User } from "@/lib/types";

function token() {
  return typeof window !== "undefined" ? localStorage.getItem("nova-admin-token") || "" : "";
}

const roleColor: Record<string, string> = {
  owner: "bg-purple-100 text-purple-700",
  manager: "bg-blue-100 text-blue-700",
  sales: "bg-green-100 text-green-700",
  finance: "bg-amber-100 text-amber-700",
};

const roleAccess: Record<string, string> = {
  owner: "Full access — all modules",
  manager: "All modules except Users & Settings",
  sales: "Inventory, Deals, Appointments, Customers",
  finance: "Finance, Reports",
};

export default function UsersPage() {
  const [users, setUsers] = useState<Omit<User, "password">[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Omit<User, "password"> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const emptyForm = { fullName: "", email: "", password: "", role: "sales" as User["role"], status: "active" as User["status"], avatarUrl: "" };
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    setLoading(true);
    fetch("/api/users", { headers: { "x-admin-token": token() } })
      .then((r) => r.json())
      .then((d) => setUsers(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (u: Omit<User, "password">) => {
    setEditing(u);
    setForm({ fullName: u.fullName, email: u.email, password: "", role: u.role, status: u.status, avatarUrl: u.avatarUrl });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = editing ? { ...form, ...(form.password ? {} : { password: undefined }) } : form;
    const url = editing ? `/api/users/${editing.id}` : "/api/users";
    await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json", "x-admin-token": token() }, body: JSON.stringify(payload) });
    setSaving(false);
    setShowForm(false);
    load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await fetch(`/api/users/${deleteId}`, { method: "DELETE", headers: { "x-admin-token": token() } });
    setDeleting(false);
    setDeleteId(null);
    load();
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
            <p className="text-slate-500 text-sm mt-0.5">{users.length} staff accounts</p>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 bg-[#0073bb] hover:bg-[#005a94] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
            <PlusCircle size={16} /> Add User
          </button>
        </div>

        {/* Role access legend */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {Object.entries(roleAccess).map(([role, desc]) => (
            <div key={role} className="bg-white rounded-xl border border-slate-200 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={14} className="text-slate-400" />
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${roleColor[role]}`}>{role}</span>
              </div>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
          ))}
        </div>

        {/* Users table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Login</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="py-10 text-center"><div className="w-6 h-6 border-2 border-[#0073bb] border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={5} className="py-10 text-center text-slate-400">No users found.</td></tr>
                ) : users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${roleColor[u.role]?.replace("text-", "bg-").replace("100", "500") || "bg-slate-400"}`}>
                          {u.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{u.fullName}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${roleColor[u.role]}`}>{u.role}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>{u.status}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : "Never"}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(u)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"><Pencil size={15} /></button>
                        <button onClick={() => setDeleteId(u.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2"><UserCog size={18} /> {editing ? "Edit User" : "New User"}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{editing ? "New Password (leave blank to keep)" : "Password *"}</label>
                <input type="password" required={!editing} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role *</label>
                  <select required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as User["role"] })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]">
                    <option value="owner">Owner</option>
                    <option value="manager">Manager</option>
                    <option value="sales">Sales</option>
                    <option value="finance">Finance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as User["status"] })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[#0073bb] text-white rounded-lg text-sm font-semibold disabled:opacity-70">
                  {saving ? "Saving..." : editing ? "Save Changes" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center"><AlertTriangle size={20} className="text-red-600" /></div>
              <h3 className="font-bold text-slate-900">Delete User</h3>
              <button onClick={() => setDeleteId(null)} className="ml-auto text-slate-400"><X size={18} /></button>
            </div>
            <p className="text-sm text-slate-600 mb-6">This user account will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold disabled:opacity-70">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

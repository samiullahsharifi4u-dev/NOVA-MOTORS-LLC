"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Search, Pencil, Trash2, AlertTriangle, X, CalendarDays, Clock, User } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Appointment } from "@/lib/types";

function token() {
  return typeof window !== "undefined" ? localStorage.getItem("nova-admin-token") || "" : "";
}

const statusColor: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-slate-100 text-slate-600",
  cancelled: "bg-red-100 text-red-600",
  "no-show": "bg-orange-100 text-orange-600",
};

const typeLabel: Record<string, string> = {
  "test-drive": "Test Drive",
  "purchase-inquiry": "Purchase Inquiry",
  financing: "Financing",
  service: "Service",
  other: "Other",
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const emptyForm = () => ({
    customerName: "", email: "", phone: "", type: "test-drive" as Appointment["type"],
    carId: "", carInterest: "", date: "", time: "10:00 AM",
    status: "scheduled" as Appointment["status"], notes: "", assignedStaff: "",
  });
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    setLoading(true);
    fetch("/api/appointments", { headers: { "x-admin-token": token() } })
      .then((r) => r.json())
      .then((d) => setAppointments(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = appointments.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.customerName.toLowerCase().includes(q) || a.carInterest.toLowerCase().includes(q) || a.assignedStaff.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openNew = () => { setEditing(null); setForm(emptyForm()); setShowForm(true); };
  const openEdit = (a: Appointment) => {
    setEditing(a);
    setForm({ customerName: a.customerName, email: a.email, phone: a.phone, type: a.type, carId: a.carId, carInterest: a.carInterest, date: a.date, time: a.time, status: a.status, notes: a.notes, assignedStaff: a.assignedStaff });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = editing ? `/api/appointments/${editing.id}` : "/api/appointments";
    const method = editing ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json", "x-admin-token": token() }, body: JSON.stringify(form) });
    setSaving(false);
    setShowForm(false);
    load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await fetch(`/api/appointments/${deleteId}`, { method: "DELETE", headers: { "x-admin-token": token() } });
    setDeleting(false);
    setDeleteId(null);
    load();
  };

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = appointments.filter((a) => a.date >= today && (a.status === "scheduled" || a.status === "confirmed")).length;
  const todayCount = appointments.filter((a) => a.date === today).length;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
            <p className="text-slate-500 text-sm mt-0.5">{upcoming} upcoming · {todayCount} today</p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-[#0073bb] hover:bg-[#005a94] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <PlusCircle size={16} />
            New Appointment
          </button>
        </div>

        {/* Status summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {["scheduled", "confirmed", "completed", "cancelled", "no-show"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
              className={`bg-white rounded-xl border p-3 text-left transition-all ${statusFilter === s ? "border-[#0073bb] ring-2 ring-[#0073bb]/20" : "border-slate-200"}`}
            >
              <p className="text-lg font-bold text-slate-900">{appointments.filter((a) => a.status === s).length}</p>
              <p className="text-xs text-slate-500 capitalize mt-0.5">{s}</p>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer, vehicle, staff..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]"
            />
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#0073bb] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((a) => (
              <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <CalendarDays size={18} className="text-[#0073bb]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-900">{a.customerName}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[a.status]}`}>{a.status}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">{typeLabel[a.type] || a.type}</span>
                  </div>
                  <p className="text-sm text-slate-600 truncate mt-0.5">{a.carInterest || "No vehicle specified"}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><CalendarDays size={11} /> {a.date}</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> {a.time}</span>
                    <span className="flex items-center gap-1"><User size={11} /> {a.assignedStaff || "Unassigned"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEdit(a)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => setDeleteId(a.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-400">No appointments found.</div>
            )}
          </div>
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-4">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">{editing ? "Edit Appointment" : "New Appointment"}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name *</label>
                  <input required value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Type *</label>
                  <select required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Appointment["type"] })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]">
                    <option value="test-drive">Test Drive</option>
                    <option value="purchase-inquiry">Purchase Inquiry</option>
                    <option value="financing">Financing</option>
                    <option value="service">Service</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Appointment["status"] })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]">
                    <option value="scheduled">Scheduled</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no-show">No Show</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Interest</label>
                  <input value={form.carInterest} onChange={(e) => setForm({ ...form, carInterest: e.target.value })} placeholder="e.g. 2022 Toyota Camry XSE" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                  <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time</label>
                  <input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="10:00 AM" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Staff</label>
                  <input value={form.assignedStaff} onChange={(e) => setForm({ ...form, assignedStaff: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                  <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb] resize-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[#0073bb] hover:bg-[#005a94] text-white rounded-lg text-sm font-semibold disabled:opacity-70">
                  {saving ? "Saving..." : editing ? "Save Changes" : "Create Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <h3 className="font-bold text-slate-900">Delete Appointment</h3>
              <button onClick={() => setDeleteId(null)} className="ml-auto text-slate-400"><X size={18} /></button>
            </div>
            <p className="text-sm text-slate-600 mb-6">This appointment will be permanently deleted.</p>
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

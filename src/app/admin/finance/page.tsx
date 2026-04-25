"use client";

import { useState, useEffect } from "react";
import { PlusCircle, X, AlertTriangle, Trash2, DollarSign, TrendingUp, TrendingDown, Receipt } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Invoice, Expense, Deal } from "@/lib/types";

function fmt(p: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p);
}

function token() {
  return typeof window !== "undefined" ? localStorage.getItem("nova-admin-token") || "" : "";
}

const EXPENSE_CATEGORIES = [
  "Vehicle Purchase Cost", "Repairs/Prep", "Advertising", "Utilities",
  "Insurance", "Rent/Mortgage", "Salaries", "Office Supplies", "Other",
];

const invoiceStatusColor: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  void: "bg-red-100 text-red-600",
};

export default function FinancePage() {
  const [tab, setTab] = useState<"overview" | "invoices" | "expenses" | "pl">("overview");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const emptyExpense = { date: new Date().toISOString().slice(0, 10), category: "Other" as Expense["category"], description: "", amount: 0, paidBy: "", receiptUrl: "", carId: "" };
  const [expenseForm, setExpenseForm] = useState(emptyExpense);

  const load = () => {
    setLoading(true);
    const h = { "x-admin-token": token() };
    Promise.all([
      fetch("/api/invoices", { headers: h }).then((r) => r.json()),
      fetch("/api/expenses", { headers: h }).then((r) => r.json()),
      fetch("/api/deals", { headers: h }).then((r) => r.json()),
    ]).then(([inv, exp, d]) => {
      setInvoices(Array.isArray(inv) ? inv : []);
      setExpenses(Array.isArray(exp) ? exp : []);
      setDeals(Array.isArray(d) ? d : []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const totalRevenue = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.grandTotal, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const pendingInvoices = invoices.filter((i) => i.status === "sent" || i.status === "draft").reduce((s, i) => s + i.grandTotal, 0);

  const expenseByCategory = EXPENSE_CATEGORIES.map((cat) => ({
    category: cat,
    total: expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter((r) => r.total > 0);

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/expenses", { method: "POST", headers: { "Content-Type": "application/json", "x-admin-token": token() }, body: JSON.stringify(expenseForm) });
    setSaving(false);
    setShowExpenseForm(false);
    setExpenseForm(emptyExpense);
    load();
  };

  const handleDeleteExpense = async () => {
    if (!deleteExpenseId) return;
    setDeleting(true);
    await fetch(`/api/expenses/${deleteExpenseId}`, { method: "DELETE", headers: { "x-admin-token": token() } });
    setDeleting(false);
    setDeleteExpenseId(null);
    load();
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "invoices", label: "Invoices" },
    { id: "expenses", label: "Expenses" },
    { id: "pl", label: "P&L" },
  ] as const;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Finance & Accounting</h1>
            <p className="text-slate-500 text-sm mt-0.5">Revenue, expenses, and invoices</p>
          </div>
          {tab === "expenses" && (
            <button onClick={() => setShowExpenseForm(true)} className="flex items-center gap-2 bg-[#0073bb] hover:bg-[#005a94] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
              <PlusCircle size={16} /> Add Expense
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6 w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? "bg-[#0073bb] text-white" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: DollarSign, label: "Total Revenue", value: fmt(totalRevenue), sub: "paid invoices", color: "bg-green-50 text-green-600", border: "border-green-100" },
                { icon: TrendingDown, label: "Total Expenses", value: fmt(totalExpenses), sub: `${expenses.length} entries`, color: "bg-red-50 text-red-600", border: "border-red-100" },
                { icon: TrendingUp, label: "Net Profit", value: fmt(netProfit), sub: netProfit >= 0 ? "in profit" : "at a loss", color: netProfit >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600", border: netProfit >= 0 ? "border-emerald-100" : "border-rose-100" },
                { icon: Receipt, label: "Pending", value: fmt(pendingInvoices), sub: "outstanding invoices", color: "bg-amber-50 text-amber-600", border: "border-amber-100" },
              ].map(({ icon: Icon, label, value, sub, color, border }) => (
                <div key={label} className={`bg-white rounded-xl border ${border} p-5`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}><Icon size={18} /></div>
                  <p className="text-xl font-extrabold text-slate-900">{loading ? "—" : value}</p>
                  <p className="text-xs font-medium text-slate-600 mt-0.5">{label}</p>
                  <p className="text-xs text-slate-400">{sub}</p>
                </div>
              ))}
            </div>

            {/* Recent invoices */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 font-bold text-slate-900">Recent Invoices</div>
              <div className="divide-y divide-slate-100">
                {invoices.slice(0, 5).map((inv) => (
                  <div key={inv.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{inv.invoiceNumber}</p>
                      <p className="text-xs text-slate-500">{inv.customerName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${invoiceStatusColor[inv.status]}`}>{inv.status}</span>
                      <span className="font-bold text-sm text-slate-900">{fmt(inv.grandTotal)}</span>
                    </div>
                  </div>
                ))}
                {!loading && invoices.length === 0 && <p className="text-center text-slate-400 text-sm py-8">No invoices yet.</p>}
              </div>
            </div>
          </div>
        )}

        {/* Invoices */}
        {tab === "invoices" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Invoice</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Subtotal</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tax</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={7} className="py-10 text-center"><div className="w-6 h-6 border-2 border-[#0073bb] border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                  ) : invoices.length === 0 ? (
                    <tr><td colSpan={7} className="py-10 text-center text-slate-400">No invoices yet.</td></tr>
                  ) : invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-mono text-xs font-semibold text-slate-700">{inv.invoiceNumber}</td>
                      <td className="px-5 py-3 font-medium text-slate-900">{inv.customerName}</td>
                      <td className="px-5 py-3 text-slate-600">{fmt(inv.subtotal)}</td>
                      <td className="px-5 py-3 text-slate-600">{fmt(inv.taxAmount)}</td>
                      <td className="px-5 py-3 font-bold text-slate-900">{fmt(inv.grandTotal)}</td>
                      <td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${invoiceStatusColor[inv.status]}`}>{inv.status}</span></td>
                      <td className="px-5 py-3 text-slate-400 text-xs">{inv.dueDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Expenses */}
        {tab === "expenses" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Paid By</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={6} className="py-10 text-center"><div className="w-6 h-6 border-2 border-[#0073bb] border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                  ) : expenses.length === 0 ? (
                    <tr><td colSpan={6} className="py-10 text-center text-slate-400">No expenses recorded.</td></tr>
                  ) : expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 text-slate-400 text-xs">{exp.date}</td>
                      <td className="px-5 py-3 text-slate-600 text-xs">{exp.category}</td>
                      <td className="px-5 py-3 text-slate-900">{exp.description}</td>
                      <td className="px-5 py-3 font-bold text-red-600">{fmt(exp.amount)}</td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{exp.paidBy}</td>
                      <td className="px-5 py-3">
                        <button onClick={() => setDeleteExpenseId(exp.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {!loading && expenses.length > 0 && (
                  <tfoot>
                    <tr className="border-t border-slate-200 bg-slate-50">
                      <td colSpan={3} className="px-5 py-3 font-semibold text-slate-700 text-sm">Total Expenses</td>
                      <td className="px-5 py-3 font-extrabold text-red-600 text-sm">{fmt(totalExpenses)}</td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}

        {/* P&L */}
        {tab === "pl" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Profit & Loss Summary</h3>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="font-medium text-slate-700">Gross Revenue (Paid Invoices)</span>
                  <span className="font-bold text-green-600">{fmt(totalRevenue)}</span>
                </div>
                {expenseByCategory.map((row) => (
                  <div key={row.category} className="flex justify-between py-1 text-sm">
                    <span className="text-slate-600">{row.category}</span>
                    <span className="text-red-500">({fmt(row.total)})</span>
                  </div>
                ))}
                <div className="flex justify-between py-3 border-t-2 border-slate-200 mt-2">
                  <span className="font-bold text-slate-900">Net Profit / Loss</span>
                  <span className={`font-extrabold text-lg ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {fmt(netProfit)}
                  </span>
                </div>
                <div className="flex justify-between py-1 text-sm text-slate-500">
                  <span>Profit Margin</span>
                  <span>{totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0.0"}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900 mb-4">Deals Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Closed Deals</span>
                  <span className="font-semibold">{deals.filter((d) => d.status === "closed").length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Deal Revenue</span>
                  <span className="font-semibold text-green-600">{fmt(deals.filter((d) => d.status === "closed").reduce((s, d) => s + d.salePrice, 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">F&I Products Revenue</span>
                  <span className="font-semibold text-green-600">
                    {fmt(deals.reduce((s, d) => s + Object.values(d.fiProducts).reduce((ps, p) => ps + p.price, 0), 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Finance Reserve</span>
                  <span className="font-semibold text-green-600">{fmt(deals.reduce((s, d) => s + (d.financing.financeReserve || 0), 0))}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Expense modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Add Expense</h3>
              <button onClick={() => setShowExpenseForm(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                <input required type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                <select required value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as Expense["category"] })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]">
                  {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
                <input required value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount ($) *</label>
                <input required type="number" min="0" step="0.01" value={expenseForm.amount || ""} onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Paid By</label>
                <input value={expenseForm.paidBy} onChange={(e) => setExpenseForm({ ...expenseForm, paidBy: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowExpenseForm(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[#0073bb] text-white rounded-lg text-sm font-semibold disabled:opacity-70">
                  {saving ? "Saving..." : "Add Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteExpenseId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center"><AlertTriangle size={20} className="text-red-600" /></div>
              <h3 className="font-bold text-slate-900">Delete Expense</h3>
              <button onClick={() => setDeleteExpenseId(null)} className="ml-auto text-slate-400"><X size={18} /></button>
            </div>
            <p className="text-sm text-slate-600 mb-6">This expense entry will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteExpenseId(null)} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold">Cancel</button>
              <button onClick={handleDeleteExpense} disabled={deleting} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold disabled:opacity-70">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

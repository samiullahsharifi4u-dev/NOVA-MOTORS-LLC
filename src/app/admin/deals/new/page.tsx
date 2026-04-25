"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { Car, DealStatus, FinancingType } from "@/lib/types";

function token() {
  return typeof window !== "undefined" ? localStorage.getItem("nova-admin-token") || "" : "";
}

export default function NewDealPage() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    customerId: "",
    carId: "",
    carSnapshot: "",
    salePrice: 0,
    status: "lead" as DealStatus,
    salesperson: "",
    notes: "",
    taxRate: 8.25,
    docFee: 499,
    tradeIn: { hasTradeIn: false, year: 0, make: "", model: "", mileage: 0, condition: "Good", value: 0 },
    financing: { type: "financed" as FinancingType, lender: "", loanAmount: 0, downPayment: 0, interestRate: 0, loanTerm: 60, monthlyPayment: 0, financeReserve: 0 },
    fiProducts: {
      extendedWarranty: { included: false, price: 0 },
      gapInsurance: { included: false, price: 0 },
      paintProtection: { included: false, price: 0 },
      tireWheel: { included: false, price: 0 },
    },
    closedAt: null as string | null,
  });

  useEffect(() => {
    fetch("/api/cars?status=active")
      .then((r) => r.json())
      .then((d) => setCars(Array.isArray(d) ? d : []));
  }, []);

  const selectCar = (id: string) => {
    const car = cars.find((c) => c.id === id);
    setForm({ ...form, carId: id, carSnapshot: car ? car.title : "", salePrice: car ? car.price : 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = { ...form, closedAt: form.status === "closed" ? new Date().toISOString() : null };
    const res = await fetch("/api/deals", { method: "POST", headers: { "Content-Type": "application/json", "x-admin-token": token() }, body: JSON.stringify(payload) });
    if (res.ok) {
      router.push("/admin/deals");
    } else {
      setError("Failed to create deal.");
      setSaving(false);
    }
  };

  const f = form.financing;
  const fi = form.fiProducts;
  const fiTotal = Object.values(fi).reduce((s, p) => s + (p.included ? p.price : 0), 0);
  const subtotal = form.salePrice + fiTotal + form.docFee;
  const tax = subtotal * (form.taxRate / 100);
  const grandTotal = subtotal + tax;

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/deals" className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">New Deal</h1>
            <p className="text-slate-500 text-sm">Create a new sales deal</p>
          </div>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehicle & Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4">1. Vehicle & Deal Info</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Vehicle *</label>
                <select required value={form.carId} onChange={(e) => selectCar(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]">
                  <option value="">Select a vehicle...</option>
                  {cars.map((c) => <option key={c.id} value={c.id}>{c.title} — ${c.price.toLocaleString()}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sale Price ($) *</label>
                <input required type="number" min="0" value={form.salePrice || ""} onChange={(e) => setForm({ ...form, salePrice: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as DealStatus })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]">
                  <option value="lead">Lead</option>
                  <option value="negotiating">Negotiating</option>
                  <option value="pending">Pending</option>
                  <option value="closed">Closed</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Salesperson</label>
                <input value={form.salesperson} onChange={(e) => setForm({ ...form, salesperson: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Doc Fee ($)</label>
                <input type="number" min="0" value={form.docFee || ""} onChange={(e) => setForm({ ...form, docFee: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tax Rate (%)</label>
                <input type="number" step="0.01" min="0" value={form.taxRate || ""} onChange={(e) => setForm({ ...form, taxRate: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes</label>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb] resize-none" />
              </div>
            </div>
          </div>

          {/* Trade-In */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-bold text-slate-900">2. Trade-In</h2>
              <label className="flex items-center gap-2 text-sm cursor-pointer ml-auto">
                <input type="checkbox" checked={form.tradeIn.hasTradeIn} onChange={(e) => setForm({ ...form, tradeIn: { ...form.tradeIn, hasTradeIn: e.target.checked } })} className="accent-[#0073bb]" />
                Has Trade-In
              </label>
            </div>
            {form.tradeIn.hasTradeIn && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Year</label>
                  <input type="number" value={form.tradeIn.year || ""} onChange={(e) => setForm({ ...form, tradeIn: { ...form.tradeIn, year: parseInt(e.target.value) || 0 } })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Make</label>
                  <input value={form.tradeIn.make} onChange={(e) => setForm({ ...form, tradeIn: { ...form.tradeIn, make: e.target.value } })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Model</label>
                  <input value={form.tradeIn.model} onChange={(e) => setForm({ ...form, tradeIn: { ...form.tradeIn, model: e.target.value } })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mileage</label>
                  <input type="number" value={form.tradeIn.mileage || ""} onChange={(e) => setForm({ ...form, tradeIn: { ...form.tradeIn, mileage: parseInt(e.target.value) || 0 } })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Condition</label>
                  <select value={form.tradeIn.condition} onChange={(e) => setForm({ ...form, tradeIn: { ...form.tradeIn, condition: e.target.value } })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]">
                    <option>Excellent</option><option>Good</option><option>Fair</option><option>Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Trade-In Value ($)</label>
                  <input type="number" value={form.tradeIn.value || ""} onChange={(e) => setForm({ ...form, tradeIn: { ...form.tradeIn, value: parseFloat(e.target.value) || 0 } })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                </div>
              </div>
            )}
          </div>

          {/* Financing */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4">3. Financing</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Type</label>
                <div className="flex gap-3">
                  {(["financed", "cash", "lease"] as FinancingType[]).map((t) => (
                    <label key={t} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer text-sm font-medium capitalize transition-colors ${f.type === t ? "border-[#0073bb] bg-blue-50 text-[#0073bb]" : "border-slate-200 text-slate-600"}`}>
                      <input type="radio" name="financing-type" value={t} checked={f.type === t} onChange={() => setForm({ ...form, financing: { ...f, type: t } })} className="sr-only" />
                      {t}
                    </label>
                  ))}
                </div>
              </div>
              {f.type !== "cash" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Lender</label>
                    <input value={f.lender} onChange={(e) => setForm({ ...form, financing: { ...f, lender: e.target.value } })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Loan Amount ($)</label>
                    <input type="number" min="0" value={f.loanAmount || ""} onChange={(e) => setForm({ ...form, financing: { ...f, loanAmount: parseFloat(e.target.value) || 0 } })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Down Payment ($)</label>
                    <input type="number" min="0" value={f.downPayment || ""} onChange={(e) => setForm({ ...form, financing: { ...f, downPayment: parseFloat(e.target.value) || 0 } })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Interest Rate (%)</label>
                    <input type="number" step="0.01" min="0" value={f.interestRate || ""} onChange={(e) => setForm({ ...form, financing: { ...f, interestRate: parseFloat(e.target.value) || 0 } })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Loan Term (months)</label>
                    <select value={f.loanTerm} onChange={(e) => setForm({ ...form, financing: { ...f, loanTerm: parseInt(e.target.value) } })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]">
                      {[24, 36, 48, 60, 72, 84].map((m) => <option key={m} value={m}>{m} months</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Monthly Payment ($)</label>
                    <input type="number" step="0.01" min="0" value={f.monthlyPayment || ""} onChange={(e) => setForm({ ...form, financing: { ...f, monthlyPayment: parseFloat(e.target.value) || 0 } })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Finance Reserve ($)</label>
                    <input type="number" min="0" value={f.financeReserve || ""} onChange={(e) => setForm({ ...form, financing: { ...f, financeReserve: parseFloat(e.target.value) || 0 } })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* F&I Products */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4">4. F&I Products</h2>
            <div className="grid grid-cols-2 gap-4">
              {(["extendedWarranty", "gapInsurance", "paintProtection", "tireWheel"] as const).map((key) => {
                const labels: Record<string, string> = { extendedWarranty: "Extended Warranty", gapInsurance: "GAP Insurance", paintProtection: "Paint Protection", tireWheel: "Tire & Wheel" };
                const product = fi[key];
                return (
                  <div key={key} className={`border-2 rounded-xl p-4 transition-colors ${product.included ? "border-[#0073bb] bg-blue-50" : "border-slate-200"}`}>
                    <label className="flex items-center gap-2 cursor-pointer mb-2">
                      <input type="checkbox" checked={product.included} onChange={(e) => setForm({ ...form, fiProducts: { ...fi, [key]: { ...product, included: e.target.checked } } })} className="accent-[#0073bb]" />
                      <span className="font-semibold text-slate-800 text-sm">{labels[key]}</span>
                    </label>
                    {product.included && (
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">Price ($)</label>
                        <input type="number" min="0" value={product.price || ""} onChange={(e) => setForm({ ...form, fiProducts: { ...fi, [key]: { ...product, price: parseFloat(e.target.value) || 0 } } })} className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4">5. Deal Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-600">Vehicle Price</span><span className="font-semibold">${form.salePrice.toLocaleString()}</span></div>
              {Object.entries(fi).filter(([, p]) => p.included).map(([key, p]) => {
                const labels: Record<string, string> = { extendedWarranty: "Extended Warranty", gapInsurance: "GAP Insurance", paintProtection: "Paint Protection", tireWheel: "Tire & Wheel" };
                return <div key={key} className="flex justify-between"><span className="text-slate-500">{labels[key]}</span><span>${p.price.toLocaleString()}</span></div>;
              })}
              <div className="flex justify-between"><span className="text-slate-600">Doc Fee</span><span>${form.docFee.toLocaleString()}</span></div>
              <div className="flex justify-between border-t border-slate-100 pt-2"><span className="text-slate-600">Tax ({form.taxRate}%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between border-t-2 border-slate-200 pt-2 font-bold text-base">
                <span>Grand Total</span>
                <span className="text-[#0073bb]">${grandTotal.toFixed(2)}</span>
              </div>
              {form.tradeIn.hasTradeIn && form.tradeIn.value > 0 && (
                <div className="flex justify-between text-green-600"><span>After Trade-In</span><span className="font-bold">${(grandTotal - (form.tradeIn.value || 0)).toFixed(2)}</span></div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <Link href="/admin/deals" className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 text-center hover:bg-slate-50">
              Cancel
            </Link>
            <button type="submit" disabled={saving || !form.carId} className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#0073bb] hover:bg-[#005a94] text-white rounded-xl text-sm font-semibold disabled:opacity-70 transition-colors">
              <Save size={16} />
              {saving ? "Creating Deal..." : "Create Deal"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

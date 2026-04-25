"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Car, DollarSign, Users, CalendarDays } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Deal, Car as CarType, Appointment, Expense } from "@/lib/types";

function fmt(p: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p);
}

function token() {
  return typeof window !== "undefined" ? localStorage.getItem("nova-admin-token") || "" : "";
}

export default function ReportsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [cars, setCars] = useState<CarType[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const h = { "x-admin-token": token() };
    Promise.all([
      fetch("/api/deals", { headers: h }).then((r) => r.json()),
      fetch("/api/cars?status=all").then((r) => r.json()),
      fetch("/api/appointments", { headers: h }).then((r) => r.json()),
      fetch("/api/expenses", { headers: h }).then((r) => r.json()),
    ]).then(([d, c, a, e]) => {
      setDeals(Array.isArray(d) ? d : []);
      setCars(Array.isArray(c) ? c : []);
      setAppointments(Array.isArray(a) ? a : []);
      setExpenses(Array.isArray(e) ? e : []);
    }).finally(() => setLoading(false));
  }, []);

  const closedDeals = deals.filter((d) => d.status === "closed");
  const totalRevenue = closedDeals.reduce((s, d) => s + d.salePrice, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const avgSalePrice = closedDeals.length > 0 ? totalRevenue / closedDeals.length : 0;

  const financedDeals = closedDeals.filter((d) => d.financing.type === "financed").length;
  const cashDeals = closedDeals.filter((d) => d.financing.type === "cash").length;
  const fiRevenue = deals.reduce((s, d) => s + Object.values(d.fiProducts).reduce((ps, p) => ps + p.price, 0), 0);
  const financeReserve = deals.reduce((s, d) => s + (d.financing.financeReserve || 0), 0);

  const salespersonMap: Record<string, { deals: number; revenue: number }> = {};
  closedDeals.forEach((d) => {
    if (!salespersonMap[d.salesperson]) salespersonMap[d.salesperson] = { deals: 0, revenue: 0 };
    salespersonMap[d.salesperson].deals++;
    salespersonMap[d.salesperson].revenue += d.salePrice;
  });

  const topSalespeople = Object.entries(salespersonMap)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5);

  const makeMap: Record<string, number> = {};
  cars.filter((c) => c.status === "sold").forEach((c) => {
    makeMap[c.make] = (makeMap[c.make] || 0) + 1;
  });
  const topMakes = Object.entries(makeMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const apptTypes: Record<string, number> = {};
  appointments.forEach((a) => { apptTypes[a.type] = (apptTypes[a.type] || 0) + 1; });

  const apptStatuses: Record<string, number> = {};
  appointments.forEach((a) => { apptStatuses[a.status] = (apptStatuses[a.status] || 0) + 1; });

  const conversionRate = appointments.filter((a) => a.status === "completed").length > 0
    ? (closedDeals.length / appointments.filter((a) => a.status === "completed").length * 100).toFixed(1)
    : "0.0";

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-[#0073bb] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm mt-0.5">Business performance overview</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: DollarSign, label: "Total Revenue", value: fmt(totalRevenue), color: "bg-green-50 text-green-600" },
            { icon: TrendingUp, label: "Net Profit", value: fmt(netProfit), color: netProfit >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600" },
            { icon: Car, label: "Avg Sale Price", value: fmt(avgSalePrice), color: "bg-blue-50 text-blue-600" },
            { icon: BarChart3, label: "Conversion Rate", value: `${conversionRate}%`, color: "bg-purple-50 text-purple-600" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}><Icon size={18} /></div>
              <p className="text-xl font-extrabold text-slate-900">{value}</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Sales summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><DollarSign size={16} className="text-[#0073bb]" /> Sales Breakdown</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Closed Deals</span>
                <span className="font-semibold">{closedDeals.length}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Financed</span>
                <span className="font-semibold">{financedDeals}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Cash Sales</span>
                <span className="font-semibold">{cashDeals}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-slate-100">
                <span className="text-slate-600">F&I Revenue</span>
                <span className="font-semibold text-green-600">{fmt(fiRevenue)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Finance Reserve</span>
                <span className="font-semibold text-green-600">{fmt(financeReserve)}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-slate-100">
                <span className="font-medium text-slate-700">Total Expenses</span>
                <span className="font-semibold text-red-500">({fmt(totalExpenses)})</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-slate-200 font-bold">
                <span className="text-slate-900">Net Profit</span>
                <span className={netProfit >= 0 ? "text-green-600" : "text-red-600"}>{fmt(netProfit)}</span>
              </div>
            </div>
          </div>

          {/* Salesperson performance */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Users size={16} className="text-[#0073bb]" /> Salesperson Performance</h3>
            {topSalespeople.length === 0 ? (
              <p className="text-slate-400 text-sm">No closed deals yet.</p>
            ) : (
              <div className="space-y-3">
                {topSalespeople.map(([name, data], i) => (
                  <div key={name} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900 truncate">{name}</span>
                        <span className="text-sm font-bold text-[#0073bb] ml-2">{fmt(data.revenue)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mt-0.5">
                        <span>{data.deals} deal{data.deals !== 1 ? "s" : ""}</span>
                        <span>avg {fmt(data.revenue / data.deals)}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5">
                        <div className="bg-[#0073bb] h-1.5 rounded-full" style={{ width: `${(data.revenue / (topSalespeople[0][1].revenue || 1)) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top makes sold */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Car size={16} className="text-[#0073bb]" /> Top Makes Sold</h3>
            {topMakes.length === 0 ? <p className="text-slate-400 text-sm">No sold vehicles yet.</p> : (
              <div className="space-y-2">
                {topMakes.map(([make, count]) => (
                  <div key={make} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{make}</span>
                    <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full text-xs">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Appointment types */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><CalendarDays size={16} className="text-[#0073bb]" /> Appointment Types</h3>
            <div className="space-y-2">
              {Object.entries(apptTypes).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700 capitalize">{type.replace("-", " ")}</span>
                  <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full text-xs">{count}</span>
                </div>
              ))}
              {Object.keys(apptTypes).length === 0 && <p className="text-slate-400 text-sm">No appointments yet.</p>}
            </div>
          </div>

          {/* Inventory snapshot */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><BarChart3 size={16} className="text-[#0073bb]" /> Inventory Snapshot</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-600">Active</span><span className="font-semibold text-green-600">{cars.filter((c) => c.status === "active").length}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Sold</span><span className="font-semibold text-slate-500">{cars.filter((c) => c.status === "sold").length}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Draft</span><span className="font-semibold text-amber-500">{cars.filter((c) => c.status === "draft").length}</span></div>
              <div className="flex justify-between border-t border-slate-100 pt-2 mt-2">
                <span className="text-slate-600">Total Views</span>
                <span className="font-semibold">{cars.reduce((s, c) => s + (c.views || 0), 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Avg Price</span>
                <span className="font-semibold">{fmt(cars.filter((c) => c.status === "active").reduce((s, c, _, a) => s + c.price / a.length, 0))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

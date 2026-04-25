"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Car,
  TrendingUp,
  PlusCircle,
  Eye,
  CalendarDays,
  ArrowRight,
  DollarSign,
  Handshake,
  Users,
  Clock,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Car as CarType, Deal, Appointment } from "@/lib/types";

function fmt(p: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p);
}

function token() {
  return typeof window !== "undefined" ? localStorage.getItem("nova-admin-token") || "" : "";
}

export default function DashboardPage() {
  const [cars, setCars] = useState<CarType[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const h = { "x-admin-token": token() };
    Promise.all([
      fetch("/api/cars?status=all").then((r) => r.json()),
      fetch("/api/deals", { headers: h }).then((r) => r.json()),
      fetch("/api/appointments", { headers: h }).then((r) => r.json()),
    ])
      .then(([c, d, a]) => {
        setCars(Array.isArray(c) ? c : []);
        setDeals(Array.isArray(d) ? d : []);
        setAppointments(Array.isArray(a) ? a : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeCars = cars.filter((c) => c.status === "active").length;
  const soldCars = cars.filter((c) => c.status === "sold").length;
  const totalViews = cars.reduce((s, c) => s + (c.views || 0), 0);
  const closedDeals = deals.filter((d) => d.status === "closed");
  const pendingDeals = deals.filter((d) => d.status === "pending");
  const totalRevenue = closedDeals.reduce((s, d) => s + d.salePrice, 0);

  const today = new Date().toISOString().slice(0, 10);
  const upcomingAppts = appointments.filter(
    (a) => a.date >= today && (a.status === "scheduled" || a.status === "confirmed")
  );

  const recentCars = [...cars]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const stats = [
    { icon: Car, label: "Active Listings", value: activeCars, sub: `${soldCars} sold`, color: "bg-blue-50 text-blue-600", border: "border-blue-100" },
    { icon: DollarSign, label: "Total Revenue", value: fmt(totalRevenue), sub: `${closedDeals.length} closed deals`, color: "bg-green-50 text-green-600", border: "border-green-100" },
    { icon: Handshake, label: "Pending Deals", value: pendingDeals.length, sub: "awaiting approval", color: "bg-amber-50 text-amber-600", border: "border-amber-100" },
    { icon: CalendarDays, label: "Upcoming Appts", value: upcomingAppts.length, sub: "next 7 days", color: "bg-purple-50 text-purple-600", border: "border-purple-100" },
    { icon: TrendingUp, label: "Total Views", value: totalViews.toLocaleString(), sub: "across inventory", color: "bg-sky-50 text-sky-600", border: "border-sky-100" },
    { icon: Users, label: "Customers", value: "—", sub: "in CRM", color: "bg-rose-50 text-rose-600", border: "border-rose-100" },
  ];

  const dealStatusColor: Record<string, string> = {
    closed: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    negotiating: "bg-blue-100 text-blue-700",
    lead: "bg-slate-100 text-slate-600",
    lost: "bg-red-100 text-red-600",
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <Link
            href="/admin/listings/new"
            className="flex items-center gap-2 bg-[#0073bb] hover:bg-[#005a94] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <PlusCircle size={16} />
            Add Car
          </Link>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {stats.map(({ icon: Icon, label, value, sub, color, border }) => (
            <div key={label} className={`bg-white rounded-xl border ${border} p-4`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                <Icon size={18} />
              </div>
              <p className="text-xl font-extrabold text-slate-900">{loading ? "—" : value}</p>
              <p className="text-xs font-medium text-slate-600 mt-0.5">{label}</p>
              <p className="text-xs text-slate-400">{sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent inventory */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">Recent Inventory</h2>
              <Link href="/admin/listings" className="flex items-center gap-1 text-[#0073bb] text-sm font-medium">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            {loading ? (
              <div className="p-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-[#0073bb] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentCars.map((car) => (
                  <div key={car.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg shrink-0 overflow-hidden">
                      {car.images?.[0] ? (
                        <img src={car.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Car size={16} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900 truncate">{car.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[#0073bb] text-sm font-bold">{fmt(car.price)}</span>
                        <span className="flex items-center gap-0.5 text-xs text-slate-400">
                          <Eye size={10} /> {car.views || 0}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      car.status === "active" ? "bg-green-100 text-green-700" :
                      car.status === "sold" ? "bg-slate-100 text-slate-600" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {car.status}
                    </span>
                  </div>
                ))}
                {recentCars.length === 0 && (
                  <p className="text-center text-slate-400 text-sm py-8">No inventory yet.</p>
                )}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            {/* Upcoming appointments */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-900">Upcoming</h2>
                <Link href="/admin/appointments" className="text-[#0073bb] text-sm font-medium">
                  See all
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {loading ? (
                  <div className="p-4 flex justify-center">
                    <div className="w-5 h-5 border-2 border-[#0073bb] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : upcomingAppts.length === 0 ? (
                  <p className="text-center text-slate-400 text-xs py-6">No upcoming appointments</p>
                ) : upcomingAppts.slice(0, 4).map((a) => (
                  <div key={a.id} className="px-5 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900 truncate">{a.customerName}</p>
                      <span className="text-xs text-slate-400 shrink-0 ml-2">{a.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{a.carInterest || a.type}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock size={10} /> {a.date}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent deals */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-900">Recent Deals</h2>
                <Link href="/admin/deals" className="text-[#0073bb] text-sm font-medium">
                  See all
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {loading ? (
                  <div className="p-4 flex justify-center">
                    <div className="w-5 h-5 border-2 border-[#0073bb] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : deals.length === 0 ? (
                  <p className="text-center text-slate-400 text-xs py-6">No deals yet</p>
                ) : deals.slice(0, 4).map((d) => (
                  <div key={d.id} className="px-5 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900 truncate">{d.dealNumber}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${dealStatusColor[d.status]}`}>
                        {d.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{d.carSnapshot}</p>
                    <p className="text-xs font-semibold text-[#0073bb] mt-0.5">{fmt(d.salePrice)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

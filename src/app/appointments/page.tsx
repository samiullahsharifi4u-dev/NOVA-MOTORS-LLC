"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarDays, CheckCircle, Clock, Phone, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TIMES = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

function AppointmentsContent() {
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    type: "test-drive" as const,
    carInterest: searchParams.get("car") || "",
    date: "",
    time: "10:00 AM",
    notes: "",
    status: "scheduled" as const,
    carId: searchParams.get("carId") || "",
    assignedStaff: "",
  });

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().slice(0, 10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.email || !form.date) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setSubmitted(true);
    } else {
      setError("Something went wrong. Please try again or call us directly.");
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <>
        <Navbar />
        <main className="flex-1">
          <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-600" />
              </div>
              <h1 className="text-3xl font-extrabold text-[#212121] mb-3">Appointment Booked!</h1>
              <p className="text-[#757575] mb-2 text-lg">
                Thank you, <strong>{form.customerName}</strong>! Your appointment has been scheduled for:
              </p>
              <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-2">
                <p className="flex items-center gap-2 text-sm"><CalendarDays size={16} className="text-[#0073bb]" /> <strong>{form.date}</strong></p>
                <p className="flex items-center gap-2 text-sm"><Clock size={16} className="text-[#0073bb]" /> <strong>{form.time}</strong></p>
                {form.carInterest && <p className="flex items-center gap-2 text-sm text-[#757575]">Vehicle: {form.carInterest}</p>}
              </div>
              <p className="text-sm text-[#757575] mb-6">We'll confirm your appointment shortly via email at <strong>{form.email}</strong>.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="/inventory" className="flex-1 bg-[#0073bb] hover:bg-[#005a94] text-white font-semibold py-3 rounded-xl transition-colors text-center">
                  Browse More Cars
                </a>
                <a href="/" className="flex-1 border border-[#e0e0e0] hover:border-[#0073bb] text-[#212121] font-semibold py-3 rounded-xl transition-colors text-center">
                  Back to Home
                </a>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white py-14 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-14 h-14 bg-[#0073bb] rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDays size={26} />
            </div>
            <h1 className="text-4xl font-extrabold mb-3">Book an Appointment</h1>
            <p className="text-white/75 text-lg">Schedule a test drive, ask about financing, or just come say hello.</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-[#e0e0e0] shadow-sm p-8">
              <h2 className="text-xl font-bold text-[#212121] mb-6">Your Information</h2>

              {error && (
                <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-[#212121] mb-1.5">Full Name *</label>
                    <input
                      required
                      value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                      placeholder="Jane Smith"
                      className="w-full px-4 py-3 border border-[#e0e0e0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#212121] mb-1.5">Email *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="jane@email.com"
                      className="w-full px-4 py-3 border border-[#e0e0e0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#212121] mb-1.5">Phone</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      className="w-full px-4 py-3 border border-[#e0e0e0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#212121] mb-1.5">Appointment Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { value: "test-drive", label: "Test Drive" },
                      { value: "purchase-inquiry", label: "Purchase Inquiry" },
                      { value: "financing", label: "Financing" },
                      { value: "other", label: "Other" },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border-2 cursor-pointer text-sm font-medium transition-colors text-center ${
                          form.type === opt.value
                            ? "border-[#0073bb] bg-blue-50 text-[#0073bb]"
                            : "border-[#e0e0e0] text-[#757575] hover:border-[#0073bb]/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={opt.value}
                          checked={form.type === opt.value}
                          onChange={() => setForm({ ...form, type: opt.value as typeof form.type })}
                          className="sr-only"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#212121] mb-1.5">Vehicle Interest</label>
                  <input
                    value={form.carInterest}
                    onChange={(e) => setForm({ ...form, carInterest: e.target.value })}
                    placeholder="e.g. 2022 Toyota Camry, or describe what you're looking for..."
                    className="w-full px-4 py-3 border border-[#e0e0e0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#212121] mb-1.5">Preferred Date *</label>
                    <input
                      required
                      type="date"
                      min={minDateStr}
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-4 py-3 border border-[#e0e0e0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#212121] mb-1.5">Preferred Time</label>
                    <select
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                      className="w-full px-4 py-3 border border-[#e0e0e0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]"
                    >
                      {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#212121] mb-1.5">Additional Notes</label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Any additional information or requests..."
                    className="w-full px-4 py-3 border border-[#e0e0e0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#0073bb] hover:bg-[#005a94] text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-70 text-base flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Scheduling...</>
                  ) : (
                    <><CalendarDays size={18} /> Book Appointment</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar info */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#e0e0e0] p-6">
              <h3 className="font-bold text-[#212121] mb-4">Contact Us Directly</h3>
              <div className="space-y-3">
                <a href="tel:5551234567" className="flex items-center gap-3 text-sm text-[#757575] hover:text-[#0073bb] transition-colors">
                  <div className="w-9 h-9 bg-[#e3f2fd] rounded-lg flex items-center justify-center shrink-0">
                    <Phone size={16} className="text-[#0073bb]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#212121]">(555) 123-4567</p>
                    <p className="text-xs">Call us anytime during business hours</p>
                  </div>
                </a>
                <a href="mailto:info@novamotorsllc.com" className="flex items-center gap-3 text-sm text-[#757575] hover:text-[#0073bb] transition-colors">
                  <div className="w-9 h-9 bg-[#e3f2fd] rounded-lg flex items-center justify-center shrink-0">
                    <Mail size={16} className="text-[#0073bb]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#212121]">info@novamotorsllc.com</p>
                    <p className="text-xs">Email us anytime</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e0e0e0] p-6">
              <h3 className="font-bold text-[#212121] mb-4 flex items-center gap-2"><Clock size={16} className="text-[#0073bb]" /> Business Hours</h3>
              <div className="space-y-2 text-sm">
                {[
                  { day: "Mon – Fri", hours: "9:00 AM – 7:00 PM" },
                  { day: "Saturday", hours: "9:00 AM – 5:00 PM" },
                  { day: "Sunday", hours: "11:00 AM – 4:00 PM" },
                ].map((r) => (
                  <div key={r.day} className="flex justify-between">
                    <span className="text-[#757575]">{r.day}</span>
                    <span className="font-medium text-[#212121]">{r.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0073bb] rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-2">What to Expect</h3>
              <ul className="space-y-1.5 text-sm text-white/90">
                <li className="flex items-start gap-2"><span className="mt-0.5">✓</span> No-pressure environment</li>
                <li className="flex items-start gap-2"><span className="mt-0.5">✓</span> Test drive any vehicle</li>
                <li className="flex items-start gap-2"><span className="mt-0.5">✓</span> On-site financing options</li>
                <li className="flex items-start gap-2"><span className="mt-0.5">✓</span> Trade-in appraisals</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function AppointmentsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0073bb] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AppointmentsContent />
    </Suspense>
  );
}

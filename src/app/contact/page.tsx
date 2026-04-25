"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email";
    if (!form.message.trim()) e.message = "Message is required";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    setSubmitting(false);
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb] transition-colors ${
      errors[field]
        ? "border-red-400 bg-red-50"
        : "border-[#e0e0e0] bg-white"
    }`;

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <div className="bg-[#1a1a2e] text-white py-12 text-center">
          <p className="text-[#60c3ff] text-sm font-semibold uppercase tracking-wider mb-2">
            Get in Touch
          </p>
          <h1 className="text-4xl font-extrabold">Contact Us</h1>
          <p className="text-white/70 mt-2 text-sm">
            We'd love to hear from you. Our team will respond within 24 hours.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl border border-[#e0e0e0] p-8 shadow-sm">
              {submitted ? (
                <div className="text-center py-12">
                  <CheckCircle size={52} className="mx-auto mb-4 text-green-500" />
                  <h3 className="text-xl font-bold text-[#212121] mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-[#757575] text-sm mb-6">
                    Thanks for reaching out, {form.name}. We'll get back to you
                    within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: "", email: "", phone: "", message: "" });
                    }}
                    className="text-[#0073bb] hover:underline text-sm font-medium"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-[#212121] mb-6">
                    Send Us a Message
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div>
                      <label className="block text-sm font-medium text-[#212121] mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        className={inputClass("name")}
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => {
                          setForm({ ...form, name: e.target.value });
                          setErrors({ ...errors, name: "" });
                        }}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#212121] mb-1.5">
                        Email *
                      </label>
                      <input
                        type="email"
                        className={inputClass("email")}
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={(e) => {
                          setForm({ ...form, email: e.target.value });
                          setErrors({ ...errors, email: "" });
                        }}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#212121] mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className={inputClass("phone")}
                        placeholder="(703) 000-0000"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#212121] mb-1.5">
                        Message *
                      </label>
                      <textarea
                        className={`${inputClass("message")} h-36 resize-y`}
                        placeholder="Tell us what you're looking for or how we can help..."
                        value={form.message}
                        onChange={(e) => {
                          setForm({ ...form, message: e.target.value });
                          setErrors({ ...errors, message: "" });
                        }}
                      />
                      {errors.message && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-[#0073bb] hover:bg-[#005a94] text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Info card */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#e0e0e0] p-8 shadow-sm">
                <h2 className="text-xl font-bold text-[#212121] mb-6">
                  Dealership Info
                </h2>
                <div className="space-y-5">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-[#e3f2fd] rounded-full flex items-center justify-center shrink-0">
                      <MapPin size={18} className="text-[#0073bb]" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#212121]">Address</p>
                      <p className="text-[#757575] text-sm">
                        533 Kirtley Rd Unit 1
                        <br />
                        Leon, VA 22725
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-[#e3f2fd] rounded-full flex items-center justify-center shrink-0">
                      <Phone size={18} className="text-[#0073bb]" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#212121]">Phone</p>
                      <a
                        href="tel:+17037958105"
                        className="text-[#0073bb] hover:underline text-sm"
                      >
                        (703) 795-8105
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-[#e3f2fd] rounded-full flex items-center justify-center shrink-0">
                      <Mail size={18} className="text-[#0073bb]" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#212121]">Email</p>
                      <a
                        href="mailto:info@novamotorsllc.com"
                        className="text-[#0073bb] hover:underline text-sm"
                      >
                        info@novamotorsllc.com
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-[#e3f2fd] rounded-full flex items-center justify-center shrink-0">
                      <Clock size={18} className="text-[#0073bb]" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#212121]">Hours</p>
                      <div className="text-[#757575] text-sm space-y-0.5">
                        <p>Monday – Friday: 9:00 AM – 7:00 PM</p>
                        <p>Saturday: 9:00 AM – 5:00 PM</p>
                        <p>Sunday: 11:00 AM – 4:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="bg-white rounded-2xl border border-[#e0e0e0] overflow-hidden shadow-sm">
                <div className="bg-gradient-to-br from-[#e3f2fd] to-[#bbdefb] h-52 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin size={40} className="text-[#0073bb] mx-auto mb-2" />
                    <p className="text-[#0073bb] font-semibold text-sm">
                      533 Kirtley Rd Unit 1, Leon, VA
                    </p>
                    <a
                      href="https://maps.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#757575] hover:text-[#0073bb] mt-1 block"
                    >
                      Open in Google Maps →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

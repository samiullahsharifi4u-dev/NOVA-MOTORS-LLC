"use client";

import { useState } from "react";

export default function CarContactForm({ carTitle }: { carTitle: string }) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="text-center py-6">
        <p className="text-green-600 font-semibold text-sm">✓ Message sent!</p>
        <p className="text-[#757575] text-xs mt-1">We&apos;ll get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="space-y-3"
    >
      <input
        type="text"
        placeholder="Your Name"
        required
        className="w-full px-3 py-2.5 border border-[#e0e0e0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]"
      />
      <input
        type="email"
        placeholder="Email Address"
        required
        className="w-full px-3 py-2.5 border border-[#e0e0e0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]"
      />
      <input
        type="tel"
        placeholder="Phone (optional)"
        className="w-full px-3 py-2.5 border border-[#e0e0e0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]"
      />
      <textarea
        placeholder={`I'm interested in the ${carTitle}...`}
        rows={3}
        className="w-full px-3 py-2.5 border border-[#e0e0e0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb] resize-none"
      />
      <button
        type="submit"
        className="w-full bg-[#1a1a2e] hover:bg-black text-white py-3 rounded-lg font-semibold text-sm transition-colors"
      >
        Send Message
      </button>
    </form>
  );
}

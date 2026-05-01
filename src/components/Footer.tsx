"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Car, Phone, Mail, MapPin, Share2, MessageCircle, Rss } from "lucide-react";
import { SiteSettings } from "@/lib/types";

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "pm" : "am";
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return m === 0 ? `${hour}${period}` : `${hour}:${String(m).padStart(2, "0")}${period}`;
}

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => {});
  }, []);

  const name = settings?.dealershipName ?? "Nova Motors LLC";
  const tagline = settings?.tagline ?? "Quality Pre-Owned Vehicles";
  const logoUrl = settings?.logoUrl ?? "";
  const phone = settings?.contact?.phone ?? "(703) 795-8105";
  const email = settings?.contact?.email ?? "info@novamotorsllc.com";
  const address = settings?.contact
    ? `${settings.contact.address}, ${settings.contact.city}, ${settings.contact.state} ${settings.contact.zip}`
    : "533 Kirtley Rd Unit 1, Leon, VA 22725";
  const telHref = `tel:+1${phone.replace(/\D/g, "")}`;
  const hours = settings?.businessHours ?? [];

  return (
    <footer className="bg-[#1a1a2e] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              {logoUrl ? (
                <img src={logoUrl} alt={name} className="h-9 w-auto max-w-[160px] object-contain" />
              ) : (
                <>
                  <div className="w-8 h-8 bg-[#0073bb] rounded-lg flex items-center justify-center">
                    <Car size={18} className="text-white" />
                  </div>
                  <span className="font-bold text-lg">{name}</span>
                </>
              )}
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">{tagline}</p>
            <div className="flex gap-3">
              <a
                href={settings?.social?.facebook || "#"}
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#0073bb] transition-colors"
                aria-label="Facebook"
              >
                <Share2 size={15} />
              </a>
              <a
                href={settings?.social?.instagram || "#"}
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#0073bb] transition-colors"
                aria-label="Instagram"
              >
                <MessageCircle size={15} />
              </a>
              <a
                href={settings?.social?.twitter || "#"}
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#0073bb] transition-colors"
                aria-label="Twitter"
              >
                <Rss size={15} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/inventory", label: "Inventory" },
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
                { href: "/admin", label: "Owner Login" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Browse By Type */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">Browse By Type</h3>
            <ul className="space-y-2">
              {["Sedans", "SUVs", "Trucks", "Hatchbacks", "Coupes", "Vans"].map((type) => (
                <li key={type}>
                  <Link
                    href={`/inventory?bodyStyle=${type.slice(0, -1)}`}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {type}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex gap-2.5 text-sm text-gray-400">
                <MapPin size={16} className="shrink-0 mt-0.5 text-[#0073bb]" />
                <span>{address}</span>
              </li>
              <li>
                <a href={telHref} className="flex gap-2.5 text-sm text-gray-400 hover:text-white transition-colors">
                  <Phone size={16} className="shrink-0 text-[#0073bb]" />
                  {phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${email}`} className="flex gap-2.5 text-sm text-gray-400 hover:text-white transition-colors">
                  <Mail size={16} className="shrink-0 text-[#0073bb]" />
                  {email}
                </a>
              </li>
            </ul>
            {hours.length > 0 && (
              <div className="mt-4 text-sm text-gray-400">
                <p className="font-medium text-gray-300 mb-1">Hours</p>
                {hours.map((h) => (
                  <p key={h.day}>
                    {h.day.slice(0, 3)}: {h.open ? `${formatTime(h.openTime)} – ${formatTime(h.closeTime)}` : "Closed"}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between gap-3 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} {name}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

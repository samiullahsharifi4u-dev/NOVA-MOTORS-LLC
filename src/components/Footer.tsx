import Link from "next/link";
import { Car, Phone, Mail, MapPin, Share2, MessageCircle, Rss } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1a1a2e] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#0073bb] rounded-lg flex items-center justify-center">
                <Car size={18} className="text-white" />
              </div>
              <span className="font-bold text-lg">
                Nova Motors <span className="text-[#0073bb]">LLC</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Your trusted local dealership for quality pre-owned vehicles.
              Serving the community since 2010.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#0073bb] transition-colors"
                aria-label="Facebook"
              >
                <Share2 size={15} />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#0073bb] transition-colors"
                aria-label="Instagram"
              >
                <MessageCircle size={15} />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#0073bb] transition-colors"
                aria-label="Twitter"
              >
                <Rss size={15} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/inventory", label: "Inventory" },
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
                { href: "/admin", label: "Owner Login" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Inventory */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">
              Browse By Type
            </h3>
            <ul className="space-y-2">
              {["Sedans", "SUVs", "Trucks", "Hatchbacks", "Coupes", "Vans"].map(
                (type) => (
                  <li key={type}>
                    <Link
                      href={`/inventory?bodyStyle=${type.slice(0, -1)}`}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {type}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">
              Contact Info
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-2.5 text-sm text-gray-400">
                <MapPin size={16} className="shrink-0 mt-0.5 text-[#0073bb]" />
                <span>1234 Auto Drive, Motor City, MC 12345</span>
              </li>
              <li>
                <a
                  href="tel:+15551234567"
                  className="flex gap-2.5 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <Phone size={16} className="shrink-0 text-[#0073bb]" />
                  (555) 123-4567
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@novamotorsllc.com"
                  className="flex gap-2.5 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <Mail size={16} className="shrink-0 text-[#0073bb]" />
                  info@novamotorsllc.com
                </a>
              </li>
            </ul>
            <div className="mt-4 text-sm text-gray-400">
              <p className="font-medium text-gray-300 mb-1">Hours</p>
              <p>Mon–Fri: 9am – 7pm</p>
              <p>Sat: 9am – 5pm</p>
              <p>Sun: 11am – 4pm</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between gap-3 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Nova Motors LLC. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

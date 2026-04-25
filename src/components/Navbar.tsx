"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Phone, Menu, X, Car } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const updateCount = () => {
      try {
        const saved = JSON.parse(localStorage.getItem("saved-cars") || "[]");
        setSavedCount(saved.length);
      } catch {
        setSavedCount(0);
      }
    };
    updateCount();
    window.addEventListener("storage", updateCount);
    window.addEventListener("saved-cars-updated", updateCount);
    return () => {
      window.removeEventListener("storage", updateCount);
      window.removeEventListener("saved-cars-updated", updateCount);
    };
  }, []);

  const links = [
    { href: "/", label: "Home" },
    { href: "/inventory", label: "Inventory" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#e0e0e0] h-16 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-[#0073bb] rounded-lg flex items-center justify-center">
            <Car size={18} className="text-white" />
          </div>
          <span className="font-bold text-[#212121] text-lg leading-tight hidden sm:block">
            Nova Motors <span className="text-[#0073bb]">LLC</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(href)
                  ? "text-[#0073bb] bg-[#e3f2fd]"
                  : "text-[#212121] hover:text-[#0073bb] hover:bg-[#f5f5f5]"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <a
            href="tel:+17037958105"
            className="hidden sm:flex items-center gap-1.5 text-sm text-[#757575] hover:text-[#0073bb] transition-colors"
          >
            <Phone size={14} />
            <span className="font-medium">(703) 795-8105</span>
          </a>

          <Link
            href="/inventory"
            className="relative flex items-center gap-1 px-3 py-2 rounded-md border border-[#e0e0e0] hover:border-[#0073bb] hover:text-[#0073bb] transition-colors text-sm font-medium text-[#212121]"
          >
            <Heart size={16} />
            <span className="hidden sm:inline">Saved</span>
            {savedCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#0073bb] text-white text-xs rounded-full flex items-center justify-center font-bold">
                {savedCount}
              </span>
            )}
          </Link>

          {/* Hamburger */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-[#f5f5f5] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[#e0e0e0] px-4 py-3 flex flex-col gap-1 shadow-lg">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive(href)
                  ? "text-[#0073bb] bg-[#e3f2fd]"
                  : "text-[#212121] hover:bg-[#f5f5f5]"
              }`}
            >
              {label}
            </Link>
          ))}
          <a
            href="tel:+17037958105"
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#757575]"
          >
            <Phone size={14} />
            (703) 795-8105
          </a>
        </div>
      )}
    </nav>
  );
}

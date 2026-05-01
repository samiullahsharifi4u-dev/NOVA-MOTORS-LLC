import Link from "next/link";
import { Shield, DollarSign, CreditCard, Star, ArrowRight, Phone, CalendarDays } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CarCard from "@/components/CarCard";
import HeroSlider from "@/components/HeroSlider";
import { readCars } from "@/lib/cars";
import { readSettings } from "@/lib/settings";

function getData() {
  try {
    const settings = readSettings();
    const cars = readCars()
      .filter((c) => c.status === "active")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
    return { settings, cars };
  } catch {
    return { settings: null, cars: [] };
  }
}

export default function HomePage() {
  const { settings, cars } = getData();

  const whyUs = [
    { icon: Shield, title: "Certified Cars", desc: "Every vehicle undergoes a rigorous 150-point inspection before it reaches our lot." },
    { icon: DollarSign, title: "Best Prices", desc: "We price our vehicles competitively so you get the most value for your money." },
    { icon: CreditCard, title: "Easy Financing", desc: "Flexible financing options available for all credit situations. Get pre-approved today." },
    { icon: Star, title: "5-Star Service", desc: "Our award-winning team is dedicated to making your car buying experience exceptional." },
  ];

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero slider */}
        <HeroSlider slides={settings?.slides ?? []} sliderSpeed={settings?.sliderSpeed ?? 5} />

        {/* Stats bar */}
        <section className="bg-[#0073bb] text-white">
          <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { value: "500+", label: "Cars Sold" },
              { value: "14+", label: "Years in Business" },
              { value: "4.9★", label: "Average Rating" },
              { value: "100%", label: "Satisfaction Rate" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl md:text-3xl font-extrabold">{value}</p>
                <p className="text-sm text-white/80 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Inventory */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[#0073bb] text-sm font-semibold uppercase tracking-wider mb-1">Available Now</p>
              <h2 className="text-3xl font-bold text-[#212121]">Featured Inventory</h2>
            </div>
            <Link href="/inventory" className="flex items-center gap-1.5 text-[#0073bb] hover:text-[#005a94] font-semibold text-sm transition-colors">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {cars.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => <CarCard key={car.id} car={car} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-[#757575]">
              <p className="text-lg">No vehicles available at this time.</p>
              <p className="text-sm mt-1">Check back soon for new arrivals!</p>
            </div>
          )}
        </section>

        {/* Why Choose Us */}
        <section className="bg-white border-y border-[#e0e0e0] py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-[#0073bb] text-sm font-semibold uppercase tracking-wider mb-2">Why {settings?.dealershipName ?? "Nova Motors LLC"}</p>
              <h2 className="text-3xl font-bold text-[#212121]">The Nova Difference</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyUs.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="text-center p-6 rounded-xl border border-[#e0e0e0] hover:border-[#0073bb] hover:shadow-md transition-all">
                  <div className="w-14 h-14 bg-[#e3f2fd] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon size={24} className="text-[#0073bb]" />
                  </div>
                  <h3 className="font-bold text-[#212121] mb-2">{title}</h3>
                  <p className="text-sm text-[#757575] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Book Appointment CTA */}
        <section className="bg-slate-50 py-16">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="w-16 h-16 bg-[#e3f2fd] rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDays size={28} className="text-[#0073bb]" />
            </div>
            <h2 className="text-3xl font-bold text-[#212121] mb-3">Book a Test Drive</h2>
            <p className="text-[#757575] mb-8 text-lg">Schedule a time to come in and experience any vehicle first-hand. No pressure, no hassle.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/appointments" className="bg-[#0073bb] hover:bg-[#005a94] text-white font-semibold px-8 py-3.5 rounded-xl transition-colors">
                Schedule Appointment
              </Link>
              <Link href="/inventory" className="bg-white border border-[#e0e0e0] hover:border-[#0073bb] text-[#212121] font-semibold px-8 py-3.5 rounded-xl transition-colors">
                Browse Inventory
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="relative bg-[#1a1a2e] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0073bb]/20 to-transparent" />
          <div className="relative max-w-7xl mx-auto px-4 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Ready to Drive?</h2>
              <p className="text-white/70 max-w-xl">
                Stop by our dealership or give us a call. Our friendly team is ready to help you find the perfect vehicle at the right price.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link href="/inventory" className="bg-[#0073bb] hover:bg-[#005a94] text-white font-semibold px-8 py-3.5 rounded-lg transition-colors text-center">
                Browse Inventory
              </Link>
              <Link href="/contact" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-lg transition-colors flex items-center gap-2 justify-center">
                <Phone size={16} />
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

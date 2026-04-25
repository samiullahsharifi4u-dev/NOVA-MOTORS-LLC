import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Award, Users, Clock, ThumbsUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Nova Motors LLC — your trusted local dealership since 2010.",
};

const team = [
  { name: "Michael Rivera", role: "General Manager", initials: "MR" },
  { name: "Sarah Chen", role: "Sales Director", initials: "SC" },
  { name: "James Mitchell", role: "Finance Manager", initials: "JM" },
  { name: "Ashley Patel", role: "Customer Relations", initials: "AP" },
];

const stats = [
  { icon: Clock, value: "14+", label: "Years in Business" },
  { icon: Award, value: "500+", label: "Cars Sold" },
  { icon: Users, value: "450+", label: "Happy Customers" },
  { icon: ThumbsUp, value: "4.9★", label: "5-Star Reviews" },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero banner */}
        <section className="relative h-72 md:h-96 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <Image
            src="https://images.unsplash.com/photo-1571607388263-1044f9ea01eb?auto=format&fit=crop&w=1600&q=80"
            alt="About Nova Motors"
            fill
            className="object-cover object-center"
          />
          <div className="relative z-20 text-center px-4">
            <p className="text-[#60c3ff] text-sm font-semibold uppercase tracking-widest mb-2">
              Our Story
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white">
              About Nova Motors LLC
            </h1>
          </div>
        </section>

        {/* Our Story */}
        <section className="max-w-4xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold text-[#212121] mb-4">
                Built on Trust, Driven by Passion
              </h2>
              <div className="space-y-4 text-[#757575] leading-relaxed">
                <p>
                  Nova Motors LLC was founded in 2010 with a simple mission: make
                  buying a quality used car a positive, transparent experience. We
                  started with a small lot of 20 vehicles and a big commitment to
                  honesty.
                </p>
                <p>
                  Over the past 14 years, we've grown into one of the region's
                  most trusted dealerships, helping hundreds of families and
                  individuals find the right vehicle at the right price. Our
                  no-pressure approach and rigorous inspection process set us apart.
                </p>
                <p>
                  Every car on our lot has passed a comprehensive 150-point
                  inspection. We believe you deserve full transparency — that's why
                  we provide vehicle history reports on every listing at no extra
                  charge.
                </p>
              </div>
              <Link
                href="/inventory"
                className="inline-block mt-6 bg-[#0073bb] hover:bg-[#005a94] text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Browse Our Inventory
              </Link>
            </div>
            <div className="relative h-72 md:h-80 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=800&q=80"
                alt="Dealership showroom"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="bg-[#0073bb] py-12">
          <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-white">
                <Icon size={28} className="mx-auto mb-2 opacity-80" />
                <p className="text-3xl font-extrabold">{value}</p>
                <p className="text-sm text-white/80 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <p className="text-[#0073bb] text-sm font-semibold uppercase tracking-wider mb-2">
              The People Behind Nova Motors
            </p>
            <h2 className="text-2xl font-bold text-[#212121]">Meet Our Team</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map(({ name, role, initials }) => (
              <div
                key={name}
                className="bg-white rounded-xl border border-[#e0e0e0] p-6 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#0073bb] to-[#005a94] rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white text-xl font-bold">{initials}</span>
                </div>
                <h3 className="font-bold text-[#212121] text-sm">{name}</h3>
                <p className="text-xs text-[#757575] mt-1">{role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="bg-white border-t border-[#e0e0e0] py-16">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-[#212121]">Our Values</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Transparency",
                  desc: "No hidden fees, no surprises. We provide full vehicle history and clear pricing on every car.",
                },
                {
                  title: "Quality",
                  desc: "Every vehicle undergoes our 150-point inspection process before joining our inventory.",
                },
                {
                  title: "Community",
                  desc: "We're locally owned and operated, proud to serve our neighbors and contribute to our community.",
                },
              ].map(({ title, desc }) => (
                <div key={title} className="text-center">
                  <h3 className="text-lg font-bold text-[#212121] mb-3">{title}</h3>
                  <p className="text-[#757575] text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

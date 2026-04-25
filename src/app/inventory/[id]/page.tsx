import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Gauge,
  Fuel,
  Settings,
  Palette,
  Hash,
  Package,
  Phone,
  CalendarDays,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageGallery from "@/components/ImageGallery";
import CarCard from "@/components/CarCard";
import CarContactForm from "@/components/CarContactForm";
import VehicleVerification from "@/components/VehicleVerification";
import { getCarById, readCars, updateCar } from "@/lib/cars";
import { Car } from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const car = getCarById(id);
  if (!car) return { title: "Car Not Found" };
  return {
    title: car.title,
    description: car.description.slice(0, 155),
  };
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatMileage(mileage: number) {
  return new Intl.NumberFormat("en-US").format(mileage) + " mi";
}

const dealColors: Record<string, string> = {
  great: "bg-[#2e7d32] text-white",
  good: "bg-[#388e3c] text-white",
  fair: "bg-[#f9a825] text-[#212121]",
  high: "bg-[#c62828] text-white",
};
const dealLabels: Record<string, string> = {
  great: "Great Deal",
  good: "Good Deal",
  fair: "Fair Deal",
  high: "High Price",
};

export default async function CarDetailPage({ params }: Props) {
  const { id } = await params;
  const car = getCarById(id);

  if (!car) notFound();

  // Increment views directly via data layer
  updateCar(id, { views: (car.views || 0) + 1 });

  // Similar cars
  const allCars = readCars();
  const similar = allCars
    .filter(
      (c) =>
        c.id !== car.id &&
        c.status === "active" &&
        (c.make === car.make || c.bodyStyle === car.bodyStyle)
    )
    .slice(0, 3);

  const specs = [
    { icon: Gauge, label: "Mileage", value: formatMileage(car.mileage) },
    { icon: Settings, label: "Transmission", value: car.transmission },
    { icon: Fuel, label: "Fuel Type", value: car.fuelType },
    { icon: Package, label: "Engine", value: car.engine || "N/A" },
    { icon: Palette, label: "Exterior", value: car.exteriorColor || "N/A" },
    { icon: Palette, label: "Interior", value: car.interiorColor || "N/A" },
  ];

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-[#e0e0e0]">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-1.5 text-sm text-[#757575]">
            <Link href="/" className="hover:text-[#0073bb]">Home</Link>
            <ChevronRight size={14} />
            <Link href="/inventory" className="hover:text-[#0073bb]">Inventory</Link>
            <ChevronRight size={14} />
            <span className="text-[#212121] font-medium truncate">{car.title}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-[1fr_380px] gap-8">
            {/* Left column */}
            <div>
              {/* Gallery */}
              <ImageGallery images={car.images} />

              {/* Description */}
              <div className="mt-8 bg-white rounded-xl border border-[#e0e0e0] p-6">
                <h2 className="font-bold text-[#212121] text-lg mb-3">
                  About This Vehicle
                </h2>
                <p className="text-[#757575] text-sm leading-relaxed">
                  {car.description}
                </p>
              </div>

              {/* Features */}
              {car.features.length > 0 && (
                <div className="mt-6 bg-white rounded-xl border border-[#e0e0e0] p-6">
                  <h2 className="font-bold text-[#212121] text-lg mb-4">
                    Features & Options
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {car.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-[#212121]">
                        <CheckCircle2 size={16} className="text-[#0073bb] shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NHTSA Verified Vehicle Data */}
              {car.vin && car.vin.length === 17 && (
                <div className="mt-6">
                  <VehicleVerification vin={car.vin} />
                </div>
              )}
            </div>

            {/* Right column — sticky */}
            <div>
              <div className="sticky top-20 space-y-4">
                {/* Price card */}
                <div className="bg-white rounded-xl border border-[#e0e0e0] p-6">
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${dealColors[car.dealRating]}`}
                    >
                      {dealLabels[car.dealRating]}
                    </span>
                    {car.status === "sold" && (
                      <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded">SOLD</span>
                    )}
                  </div>
                  <h1 className="text-xl font-bold text-[#212121] mt-2 leading-snug">
                    {car.title}
                  </h1>
                  <p className="text-3xl font-extrabold text-[#212121] mt-2">
                    {formatPrice(car.price)}
                  </p>

                  {/* Key specs */}
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {specs.map(({ icon: Icon, label, value }) => (
                      <div key={label} className="bg-[#f5f5f5] rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-[#757575] mb-1">
                          <Icon size={13} />
                          <span className="text-xs">{label}</span>
                        </div>
                        <p className="text-sm font-semibold text-[#212121]">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* VIN & Stock */}
                  <div className="mt-4 pt-4 border-t border-[#e0e0e0] grid grid-cols-2 gap-3 text-xs text-[#757575]">
                    {car.vin && (
                      <div>
                        <div className="flex items-center gap-1 mb-0.5">
                          <Hash size={11} /> VIN
                        </div>
                        <p className="font-mono font-semibold text-[#212121] text-xs break-all">
                          {car.vin}
                        </p>
                      </div>
                    )}
                    {car.stockNumber && (
                      <div>
                        <div className="flex items-center gap-1 mb-0.5">
                          <Package size={11} /> Stock #
                        </div>
                        <p className="font-semibold text-[#212121]">{car.stockNumber}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 flex flex-col gap-2">
                    <Link
                      href={`/appointments?carId=${car.id}&car=${encodeURIComponent(car.title)}`}
                      className="flex items-center justify-center gap-2 w-full bg-[#0073bb] hover:bg-[#005a94] text-white font-semibold py-3.5 rounded-lg transition-colors"
                    >
                      <CalendarDays size={16} />
                      Book Test Drive
                    </Link>
                    <a
                      href="#contact-form"
                      className="flex items-center justify-center gap-2 w-full border border-[#0073bb] text-[#0073bb] hover:bg-[#0073bb] hover:text-white font-semibold py-3 rounded-lg transition-colors text-sm"
                    >
                      <Phone size={15} />
                      Contact About This Car
                    </a>
                  </div>
                </div>

                {/* Contact mini form */}
                <div
                  id="contact-form"
                  className="bg-white rounded-xl border border-[#e0e0e0] p-6"
                >
                  <h3 className="font-bold text-[#212121] mb-4">
                    Inquire About This Vehicle
                  </h3>
                  <CarContactForm carTitle={car.title} />
                </div>
              </div>
            </div>
          </div>

          {/* Similar Cars */}
          {similar.length > 0 && (
            <section className="mt-14">
              <h2 className="text-2xl font-bold text-[#212121] mb-6">
                Similar Vehicles
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {similar.map((c: Car) => (
                  <CarCard key={c.id} car={c} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

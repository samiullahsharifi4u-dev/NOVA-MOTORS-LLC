"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Fuel,
  Settings,
} from "lucide-react";
import { Car, DealRating } from "@/lib/types";

const dealBadge: Record<DealRating, { label: string; classes: string }> = {
  great: {
    label: "Great Deal",
    classes: "bg-[#2e7d32] text-white",
  },
  good: {
    label: "Good Deal",
    classes: "bg-[#388e3c] text-white",
  },
  fair: {
    label: "Fair Deal",
    classes: "bg-[#f9a825] text-[#212121]",
  },
  high: {
    label: "High Price",
    classes: "bg-[#c62828] text-white",
  },
};

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

export default function CarCard({ car }: { car: Car }) {
  const [imgIndex, setImgIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedCars: string[] = JSON.parse(
        localStorage.getItem("saved-cars") || "[]"
      );
      setSaved(savedCars.includes(car.id));
    } catch {
      setSaved(false);
    }
  }, [car.id]);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const savedCars: string[] = JSON.parse(
        localStorage.getItem("saved-cars") || "[]"
      );
      const updated = savedCars.includes(car.id)
        ? savedCars.filter((id) => id !== car.id)
        : [...savedCars, car.id];
      localStorage.setItem("saved-cars", JSON.stringify(updated));
      setSaved(!saved);
      window.dispatchEvent(new Event("saved-cars-updated"));
    } catch {}
  };

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    setImgIndex((i) => (i === 0 ? car.images.length - 1 : i - 1));
    setImageLoaded(false);
  };

  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    setImgIndex((i) => (i === car.images.length - 1 ? 0 : i + 1));
    setImageLoaded(false);
  };

  const badge = dealBadge[car.dealRating];
  const images = car.images.length > 0 ? car.images : ["/placeholder-car.jpg"];

  return (
    <div className="bg-white rounded-lg border border-[#e0e0e0] overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
      {/* Image carousel */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <Image
          src={images[imgIndex]}
          alt={car.title}
          fill
          className={`object-cover transition-all duration-500 group-hover:scale-105 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}

        {/* Deal badge */}
        <span
          className={`absolute top-2.5 left-2.5 text-xs font-bold px-2 py-1 rounded z-10 ${badge.classes}`}
        >
          {badge.label}
        </span>

        {/* Save button */}
        <button
          onClick={toggleSave}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 transition-transform"
          aria-label={saved ? "Remove from saved" : "Save car"}
        >
          <Heart
            size={16}
            className={saved ? "text-red-500 fill-red-500" : "text-gray-600"}
          />
        </button>

        {/* Arrows — show only if multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              aria-label="Previous image"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              aria-label="Next image"
            >
              <ChevronRight size={16} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.preventDefault();
                    setImgIndex(i);
                    setImageLoaded(false);
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === imgIndex ? "bg-white scale-125" : "bg-white/60"
                  }`}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Image count */}
        {images.length > 1 && (
          <span className="absolute bottom-2 right-2.5 text-xs text-white bg-black/50 px-1.5 py-0.5 rounded z-10">
            {imgIndex + 1}/{images.length}
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-[#212121] text-lg leading-tight mb-1">
          {car.title}
        </h3>

        <div className="flex items-center gap-3 text-xs text-[#757575] mb-3">
          <span className="flex items-center gap-1">
            <Gauge size={12} />
            {formatMileage(car.mileage)}
          </span>
          <span className="flex items-center gap-1">
            <Settings size={12} />
            {car.transmission}
          </span>
          <span className="flex items-center gap-1">
            <Fuel size={12} />
            {car.fuelType}
          </span>
        </div>

        <div className="mt-auto">
          <p className="text-2xl font-extrabold text-[#212121] mb-3">
            {formatPrice(car.price)}
          </p>

          <Link
            href={`/inventory/${car.id}`}
            className="block w-full text-center bg-[#0073bb] hover:bg-[#005a94] text-white font-semibold py-2.5 rounded-md transition-colors text-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

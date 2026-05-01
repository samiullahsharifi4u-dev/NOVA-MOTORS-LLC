"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HeroSlide } from "@/lib/types";

export default function HeroSlider({ slides, sliderSpeed = 5 }: { slides: HeroSlide[]; sliderSpeed?: number }) {
  const active = slides.filter((s) => s.active);
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const go = useCallback((idx: number) => {
    if (transitioning || active.length <= 1) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(idx);
      setTransitioning(false);
    }, 300);
  }, [transitioning, active.length]);

  const next = useCallback(() => go((current + 1) % active.length), [go, current, active.length]);
  const prev = useCallback(() => go((current - 1 + active.length) % active.length), [go, current, active.length]);

  useEffect(() => {
    if (active.length <= 1) return;
    const id = setInterval(next, sliderSpeed * 1000);
    return () => clearInterval(id);
  }, [next, active.length, sliderSpeed]);

  if (active.length === 0) {
    return (
      <div className="relative h-[520px] bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center">
        <div className="text-center text-white px-4">
          <h1 className="text-5xl font-extrabold mb-4">Find Your Perfect Car</h1>
          <p className="text-xl text-slate-300 mb-8">Browse our premium selection of certified pre-owned vehicles.</p>
          <Link href="/inventory" className="inline-flex items-center gap-2 bg-[#0073bb] hover:bg-[#005a94] text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors">
            Browse Inventory
          </Link>
        </div>
      </div>
    );
  }

  const slide = active[current];

  return (
    <div className="relative h-[520px] md:h-[600px] overflow-hidden bg-slate-900 select-none">
      {/* Background images — crossfade via absolute stacking */}
      {active.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-500"
          style={{ opacity: i === current && !transitioning ? 1 : i === current && transitioning ? 0 : 0 }}
        >
          {s.imageUrl && (
            <img src={s.imageUrl} alt={s.headline} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className={`relative z-10 h-full flex items-center transition-all duration-500 ${transitioning ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-10 w-full">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
              {slide.headline}
            </h1>
            {slide.subheadline && (
              <p className="text-lg md:text-xl text-white/85 mb-8 leading-relaxed">
                {slide.subheadline}
              </p>
            )}
            {slide.buttonText && slide.buttonLink && (
              <Link
                href={slide.buttonLink}
                className="inline-flex items-center gap-2 bg-[#0073bb] hover:bg-[#005a94] text-white px-8 py-4 rounded-xl font-bold text-base md:text-lg transition-colors shadow-lg shadow-[#0073bb]/30"
              >
                {slide.buttonText}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {active.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/15 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/15 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight size={22} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {active.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={`rounded-full transition-all ${i === current ? "w-6 h-2.5 bg-white" : "w-2.5 h-2.5 bg-white/50 hover:bg-white/75"}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

export default function ImageGallery({ images }: { images: string[] }) {
  const [mainIndex, setMainIndex] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (images.length === 0) return null;

  const openLightbox = (i: number) => setLightbox(i);
  const closeLightbox = () => setLightbox(null);

  const lightboxPrev = () =>
    setLightbox((i) => (i === null ? 0 : i === 0 ? images.length - 1 : i - 1));
  const lightboxNext = () =>
    setLightbox((i) => (i === null ? 0 : i === images.length - 1 ? 0 : i + 1));

  return (
    <>
      {/* Main gallery */}
      <div>
        {/* Main image */}
        <div
          className="relative aspect-[16/9] rounded-xl overflow-hidden bg-gray-100 cursor-zoom-in group mb-3"
          onClick={() => openLightbox(mainIndex)}
        >
          <Image
            src={images[mainIndex]}
            alt={`Car image ${mainIndex + 1}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 55vw"
            priority
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <ZoomIn
              size={32}
              className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
            />
          </div>
          <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
            {mainIndex + 1} / {images.length}
          </span>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setMainIndex(i)}
                className={`relative shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  i === mainIndex
                    ? "border-[#0073bb] shadow-md"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
                aria-label={`View image ${i + 1}`}
              >
                <Image
                  src={src}
                  alt={`Thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="lightbox-backdrop fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white z-10 p-2"
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >
            <X size={28} />
          </button>

          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10 p-2 bg-white/10 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              lightboxPrev();
            }}
            aria-label="Previous"
          >
            <ChevronLeft size={28} />
          </button>

          <div
            className="relative max-w-5xl max-h-[85vh] w-full h-full mx-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightbox]}
              alt={`Car image ${lightbox + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10 p-2 bg-white/10 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              lightboxNext();
            }}
            aria-label="Next"
          >
            <ChevronRight size={28} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox(i);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === lightbox ? "bg-white scale-125" : "bg-white/40"
                }`}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>

          <span className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {lightbox + 1} / {images.length}
          </span>
        </div>
      )}
    </>
  );
}

"use client";

import { useRef, useEffect } from "react";

interface Props {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  formatLabel?: (v: number) => string;
}

export default function DualRangeSlider({
  min,
  max,
  value,
  onChange,
  formatLabel,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  const toPercent = (v: number) => ((v - min) / (max - min)) * 100;

  useEffect(() => {
    if (trackRef.current) {
      const left = toPercent(value[0]);
      const right = toPercent(value[1]);
      trackRef.current.style.left = `${left}%`;
      trackRef.current.style.right = `${100 - right}%`;
    }
  }, [value, min, max]);

  const label = formatLabel || ((v: number) => String(v));

  return (
    <div className="px-1">
      <div className="relative h-10 flex items-center">
        {/* Track background */}
        <div className="absolute w-full h-1.5 bg-gray-200 rounded-full" />
        {/* Active track */}
        <div
          ref={trackRef}
          className="absolute h-1.5 bg-[#0073bb] rounded-full"
        />

        {/* Min thumb */}
        <input
          type="range"
          min={min}
          max={max}
          value={value[0]}
          onChange={(e) => {
            const v = Math.min(Number(e.target.value), value[1] - 1);
            onChange([v, value[1]]);
          }}
          className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer"
          style={{ zIndex: value[0] > max - (max - min) / 2 ? 5 : 3 }}
        />

        {/* Max thumb */}
        <input
          type="range"
          min={min}
          max={max}
          value={value[1]}
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), value[0] + 1);
            onChange([value[0], v]);
          }}
          className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer"
          style={{ zIndex: 4 }}
        />
      </div>

      <div className="flex justify-between text-xs text-[#757575] mt-1">
        <span>{label(value[0])}</span>
        <span>{label(value[1])}</span>
      </div>
    </div>
  );
}

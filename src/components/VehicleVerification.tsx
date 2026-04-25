"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Loader2, AlertTriangle } from "lucide-react";

interface VINData {
  make: string;
  model: string;
  year: string;
  trim: string;
  bodyStyle: string;
  engine: string;
  fuelType: string;
  transmission: string;
  plantCountry: string;
  driveType: string;
  doors: string;
}

interface Props {
  vin: string;
}

export default function VehicleVerification({ vin }: Props) {
  const [data, setData] = useState<VINData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!vin || vin.length < 17) {
      setLoading(false);
      return;
    }

    fetch(`/api/vin/${vin}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
        } else {
          setData(d);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Could not reach NHTSA API.");
        setLoading(false);
      });
  }, [vin]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#e0e0e0] p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-[#212121] text-lg">Verified Vehicle Data</h2>
          <span className="text-xs text-[#757575] bg-gray-100 px-2 py-1 rounded-full">
            NHTSA Database
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-[#757575] py-2">
          <Loader2 size={16} className="animate-spin text-[#0073bb]" />
          <span className="text-sm">Fetching verified data from NHTSA...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-[#e0e0e0] p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-[#212121] text-lg">Verified Vehicle Data</h2>
        </div>
        <div className="flex items-start gap-2.5 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const fields: { label: string; value: string }[] = [
    { label: "Make", value: data.make },
    { label: "Model", value: data.model },
    { label: "Year", value: data.year },
    { label: "Engine", value: data.engine },
    { label: "Fuel Type", value: data.fuelType },
    { label: "Transmission", value: data.transmission },
    { label: "Body Style", value: data.bodyStyle },
    { label: "Drive Type", value: data.driveType },
    { label: "Doors", value: data.doors },
    { label: "Plant Country", value: data.plantCountry },
  ].filter((f) => f.value && f.value !== "Not Applicable");

  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#e0e0e0]">
        <div>
          <h2 className="font-bold text-[#212121] text-lg">Verified Vehicle Data</h2>
          <p className="text-xs text-[#757575] mt-0.5">
            Sourced live from the U.S. NHTSA database
          </p>
        </div>
        <span className="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-3 py-2 rounded-full border border-green-200 shrink-0">
          <ShieldCheck size={14} />
          NHTSA Verified
        </span>
      </div>

      {/* Data grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {fields.map(({ label, value }) => (
          <div key={label} className="bg-[#f5f5f5] rounded-lg px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#757575] mb-1">
              {label}
            </p>
            <p className="text-sm font-semibold text-[#212121] leading-snug">{value}</p>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-[#757575] mt-4 leading-relaxed">
        VIN <span className="font-mono font-semibold">{vin}</span> verified against the National
        Highway Traffic Safety Administration vehicle database. Data reflects manufacturer
        specifications at the time of production.
      </p>
    </div>
  );
}

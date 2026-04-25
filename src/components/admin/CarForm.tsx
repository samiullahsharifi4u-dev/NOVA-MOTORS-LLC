"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ScanSearch, CheckCircle2, AlertCircle } from "lucide-react";
import { Car, DealRating, CarStatus } from "@/lib/types";
import ImageUploader from "./ImageUploader";
import { useToast } from "@/components/Toast";

interface VINDecodeResult {
  make: string;
  model: string;
  year: string;
  trim: string;
  bodyStyle: string;
  engine: string;
  fuelType: string;
  transmission: string;
  plantCountry: string;
}

type FormData = Omit<Car, "id" | "createdAt" | "updatedAt" | "views">;

const defaultForm: FormData = {
  title: "",
  year: new Date().getFullYear(),
  make: "",
  model: "",
  trim: "",
  bodyStyle: "Sedan",
  price: 0,
  mileage: 0,
  transmission: "Automatic",
  fuelType: "Gas",
  engine: "",
  exteriorColor: "",
  interiorColor: "",
  vin: "",
  stockNumber: "",
  description: "",
  features: [],
  images: [],
  status: "active",
  dealRating: "good",
};

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);

interface Props {
  car?: Car;
  adminToken: string;
}

export default function CarForm({ car, adminToken }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState<FormData>(
    car
      ? {
          title: car.title,
          year: car.year,
          make: car.make,
          model: car.model,
          trim: car.trim,
          bodyStyle: car.bodyStyle,
          price: car.price,
          mileage: car.mileage,
          transmission: car.transmission,
          fuelType: car.fuelType,
          engine: car.engine,
          exteriorColor: car.exteriorColor,
          interiorColor: car.interiorColor,
          vin: car.vin,
          stockNumber: car.stockNumber,
          description: car.description,
          features: car.features,
          images: car.images,
          status: car.status,
          dealRating: car.dealRating,
        }
      : defaultForm
  );
  const [saving, setSaving] = useState(false);
  const [featuresText, setFeaturesText] = useState(
    (car?.features || []).join("\n")
  );
  const [decoding, setDecoding] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [vinStatus, setVinStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const decodeVin = async () => {
    if (form.vin.length !== 17) return;
    setDecoding(true);
    setVinStatus(null);

    try {
      const res = await fetch(`/api/vin/${form.vin}`);
      const data: VINDecodeResult & { error?: string } = await res.json();

      if (!res.ok || data.error) {
        setVinStatus({ type: "error", message: data.error || "VIN not found." });
        return;
      }

      // Map NHTSA body style to our dropdown values
      const validBodyStyles = ["Sedan", "SUV", "Truck", "Hatchback", "Coupe", "Van", "Wagon", "Convertible"];
      const bodyStyle = validBodyStyles.find((s) => s === data.bodyStyle) || form.bodyStyle;

      const validTransmissions = ["Automatic", "Manual", "CVT", "Semi-Automatic"];
      const transmission = validTransmissions.find((t) => t === data.transmission) || form.transmission;

      const validFuels = ["Gas", "Hybrid", "Electric", "Diesel", "Plug-in Hybrid"];
      const fuelType = validFuels.find((f) => f === data.fuelType) || form.fuelType;

      setForm((f) => ({
        ...f,
        make: data.make || f.make,
        model: data.model || f.model,
        year: data.year ? parseInt(data.year) : f.year,
        trim: data.trim || f.trim,
        bodyStyle,
        engine: data.engine || f.engine,
        transmission,
        fuelType,
      }));

      setVinStatus({
        type: "success",
        message: `Decoded: ${data.year} ${data.make} ${data.model}${data.plantCountry ? ` — Made in ${data.plantCountry}` : ""}`,
      });
    } catch {
      setVinStatus({ type: "error", message: "Failed to connect to NHTSA API." });
    } finally {
      setDecoding(false);
    }
  };

  const generateDescription = async () => {
    if (!form.make || !form.model) {
      showToast("Please fill in at least Make and Model first.", "error");
      return;
    }
    setGeneratingDesc(true);
    try {
      const res = await fetch("/api/generate-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({
          year: form.year,
          make: form.make,
          model: form.model,
          trim: form.trim,
          bodyStyle: form.bodyStyle,
          price: form.price,
          mileage: form.mileage,
          transmission: form.transmission,
          fuelType: form.fuelType,
          engine: form.engine,
          exteriorColor: form.exteriorColor,
          interiorColor: form.interiorColor,
          dealRating: form.dealRating,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      set("description", data.description);
      showToast("Description generated!", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate description.";
      showToast(msg, "error");
    } finally {
      setGeneratingDesc(false);
    }
  };

  // Auto-generate title
  useEffect(() => {
    if (form.year && form.make && form.model) {
      const t = `${form.year} ${form.make} ${form.model}${form.trim ? " " + form.trim : ""}`;
      setForm((f) => ({ ...f, title: t }));
    }
  }, [form.year, form.make, form.model, form.trim]);

  const set = (field: keyof FormData, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (status: CarStatus) => {
    if (!form.make || !form.model || !form.price) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      features: featuresText
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean),
      status,
    };

    try {
      const url = car ? `/api/cars/${car.id}` : "/api/cars";
      const method = car ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Save failed");

      showToast(car ? "Car updated successfully!" : "Car listed successfully!", "success");
      router.push("/admin/listings");
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 border border-[#e0e0e0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb] focus:border-transparent bg-white";
  const labelClass = "block text-sm font-medium text-[#212121] mb-1.5";

  return (
    <div className="space-y-8">
      {/* Basic Info */}
      <section className="bg-white rounded-xl border border-[#e0e0e0] p-6">
        <h2 className="text-base font-semibold text-[#212121] mb-5 pb-3 border-b border-[#e0e0e0]">
          Vehicle Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Year */}
          <div>
            <label className={labelClass}>Year *</label>
            <select
              className={inputClass}
              value={form.year}
              onChange={(e) => set("year", Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Make */}
          <div>
            <label className={labelClass}>Make *</label>
            <input
              type="text"
              className={inputClass}
              placeholder="e.g. Toyota"
              value={form.make}
              onChange={(e) => set("make", e.target.value)}
            />
          </div>

          {/* Model */}
          <div>
            <label className={labelClass}>Model *</label>
            <input
              type="text"
              className={inputClass}
              placeholder="e.g. Camry"
              value={form.model}
              onChange={(e) => set("model", e.target.value)}
            />
          </div>

          {/* Trim */}
          <div>
            <label className={labelClass}>Trim</label>
            <input
              type="text"
              className={inputClass}
              placeholder="e.g. XSE"
              value={form.trim}
              onChange={(e) => set("trim", e.target.value)}
            />
          </div>

          {/* Body Style */}
          <div>
            <label className={labelClass}>Body Style</label>
            <select
              className={inputClass}
              value={form.bodyStyle}
              onChange={(e) => set("bodyStyle", e.target.value)}
            >
              {["Sedan", "SUV", "Truck", "Hatchback", "Coupe", "Van", "Wagon", "Convertible"].map(
                (s) => <option key={s} value={s}>{s}</option>
              )}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className={labelClass}>Price ($) *</label>
            <input
              type="number"
              className={inputClass}
              placeholder="e.g. 25000"
              value={form.price || ""}
              onChange={(e) => set("price", Number(e.target.value))}
              min={0}
            />
          </div>

          {/* Mileage */}
          <div>
            <label className={labelClass}>Mileage</label>
            <input
              type="number"
              className={inputClass}
              placeholder="e.g. 35000"
              value={form.mileage || ""}
              onChange={(e) => set("mileage", Number(e.target.value))}
              min={0}
            />
          </div>

          {/* Transmission */}
          <div>
            <label className={labelClass}>Transmission</label>
            <select
              className={inputClass}
              value={form.transmission}
              onChange={(e) => set("transmission", e.target.value)}
            >
              {["Automatic", "Manual", "CVT", "Semi-Automatic"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Fuel Type */}
          <div>
            <label className={labelClass}>Fuel Type</label>
            <select
              className={inputClass}
              value={form.fuelType}
              onChange={(e) => set("fuelType", e.target.value)}
            >
              {["Gas", "Hybrid", "Electric", "Diesel", "Plug-in Hybrid"].map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Engine */}
          <div>
            <label className={labelClass}>Engine</label>
            <input
              type="text"
              className={inputClass}
              placeholder="e.g. 2.5L 4-Cylinder"
              value={form.engine}
              onChange={(e) => set("engine", e.target.value)}
            />
          </div>

          {/* Exterior Color */}
          <div>
            <label className={labelClass}>Exterior Color</label>
            <input
              type="text"
              className={inputClass}
              placeholder="e.g. Pearl White"
              value={form.exteriorColor}
              onChange={(e) => set("exteriorColor", e.target.value)}
            />
          </div>

          {/* Interior Color */}
          <div>
            <label className={labelClass}>Interior Color</label>
            <input
              type="text"
              className={inputClass}
              placeholder="e.g. Black Leather"
              value={form.interiorColor}
              onChange={(e) => set("interiorColor", e.target.value)}
            />
          </div>

          {/* VIN */}
          <div className="sm:col-span-2">
            <label className={labelClass}>
              VIN
              <span className="font-normal text-[#757575] ml-1 text-xs">
                (17 characters — no I, O, or Q)
              </span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className={`${inputClass} flex-1 font-mono tracking-wider`}
                placeholder="e.g. 1HGBH41JXMN109186"
                value={form.vin}
                onChange={(e) => {
                  set("vin", e.target.value.toUpperCase().replace(/[IOQ]/g, ""));
                  setVinStatus(null);
                }}
                maxLength={17}
              />
              <button
                type="button"
                onClick={decodeVin}
                disabled={form.vin.length !== 17 || decoding}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#0073bb] hover:bg-[#005a94] text-white text-sm font-semibold rounded-lg disabled:opacity-40 transition-colors whitespace-nowrap shrink-0"
              >
                {decoding ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Decoding…
                  </>
                ) : (
                  <>
                    <ScanSearch size={14} />
                    Decode VIN
                  </>
                )}
              </button>
            </div>

            {/* VIN character counter */}
            <div className="flex items-center justify-between mt-1">
              {vinStatus ? (
                <p
                  className={`text-xs flex items-center gap-1.5 ${
                    vinStatus.type === "success"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {vinStatus.type === "success" ? (
                    <CheckCircle2 size={13} />
                  ) : (
                    <AlertCircle size={13} />
                  )}
                  {vinStatus.message}
                </p>
              ) : (
                <span />
              )}
              <span
                className={`text-xs ml-auto ${
                  form.vin.length === 17
                    ? "text-green-600 font-semibold"
                    : "text-[#757575]"
                }`}
              >
                {form.vin.length}/17
              </span>
            </div>
          </div>

          {/* Stock Number */}
          <div>
            <label className={labelClass}>Stock Number</label>
            <input
              type="text"
              className={inputClass}
              placeholder="e.g. NM-2024-001"
              value={form.stockNumber}
              onChange={(e) => set("stockNumber", e.target.value)}
            />
          </div>

          {/* Deal Rating */}
          <div>
            <label className={labelClass}>Deal Rating</label>
            <select
              className={inputClass}
              value={form.dealRating}
              onChange={(e) => set("dealRating", e.target.value as DealRating)}
            >
              <option value="great">Great Deal</option>
              <option value="good">Good Deal</option>
              <option value="fair">Fair Deal</option>
              <option value="high">High Price</option>
            </select>
          </div>
        </div>

        {/* Title (auto-generated) */}
        <div className="mt-4">
          <label className={labelClass}>Listing Title (auto-generated)</label>
          <input
            type="text"
            className={inputClass}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>
      </section>

      {/* Description & Features */}
      <section className="bg-white rounded-xl border border-[#e0e0e0] p-6">
        <h2 className="text-base font-semibold text-[#212121] mb-5 pb-3 border-b border-[#e0e0e0]">
          Description & Features
        </h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-[#212121]">Description</label>
              <button
                type="button"
                onClick={generateDescription}
                disabled={generatingDesc}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white disabled:opacity-60 transition-all shadow-sm"
              >
                {generatingDesc ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>✨ Generate Description</>
                )}
              </button>
            </div>
            <textarea
              className={`${inputClass} h-36 resize-y`}
              placeholder="Describe the vehicle — condition, highlights, history..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>
              Features{" "}
              <span className="font-normal text-[#757575]">
                (one per line)
              </span>
            </label>
            <textarea
              className={`${inputClass} h-36 resize-y`}
              placeholder={`Sunroof\nHeated Seats\nApple CarPlay\nBlind Spot Monitor`}
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Images */}
      <section className="bg-white rounded-xl border border-[#e0e0e0] p-6">
        <h2 className="text-base font-semibold text-[#212121] mb-1 pb-3 border-b border-[#e0e0e0]">
          Photos
        </h2>
        <p className="text-sm text-[#757575] mb-4">
          Upload up to 10 photos. The first image will be the main listing photo.
          Drag to reorder.
        </p>
        <ImageUploader
          images={form.images}
          onChange={(imgs) => set("images", imgs)}
          adminToken={adminToken}
        />
      </section>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end pb-8">
        <button
          type="button"
          onClick={() => router.push("/admin/listings")}
          className="px-6 py-2.5 rounded-lg border border-[#e0e0e0] text-sm font-medium text-[#757575] hover:bg-[#f5f5f5] transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => handleSubmit("draft")}
          className="px-6 py-2.5 rounded-lg border border-[#0073bb] text-[#0073bb] text-sm font-medium hover:bg-[#e3f2fd] transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save as Draft"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => handleSubmit("active")}
          className="px-6 py-2.5 rounded-lg bg-[#0073bb] hover:bg-[#005a94] text-white text-sm font-semibold transition-colors disabled:opacity-50"
        >
          {saving ? "Publishing..." : "Publish Listing"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { Save, Plus, Trash2, Settings, Upload, GripVertical } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { SiteSettings, HeroSlide, BusinessHours } from "@/lib/types";

function token() {
  return typeof window !== "undefined" ? localStorage.getItem("nova-admin-token") || "" : "";
}

const INPUT = "w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]";
const INPUT_SM = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]";

export default function SettingsPage() {
  const [tab, setTab] = useState<"general" | "branding" | "contact" | "hours" | "slides" | "seo">("general");
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Upload states
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingSlide, setUploadingSlide] = useState<number | null>(null);

  // Drag-to-reorder state
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // File input refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const slideInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-token": token() },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const set = (updates: Partial<SiteSettings>) =>
    setSettings((s) => (s ? { ...s, ...updates } : s));
  const setContact = (updates: Partial<SiteSettings["contact"]>) =>
    setSettings((s) => (s ? { ...s, contact: { ...s.contact, ...updates } } : s));
  const setSocial = (updates: Partial<SiteSettings["social"]>) =>
    setSettings((s) => (s ? { ...s, social: { ...s.social, ...updates } } : s));
  const setSeo = (updates: Partial<SiteSettings["seo"]>) =>
    setSettings((s) => (s ? { ...s, seo: { ...s.seo, ...updates } } : s));

  const updateHours = (i: number, updates: Partial<BusinessHours>) => {
    if (!settings) return;
    const hours = [...settings.businessHours];
    hours[i] = { ...hours[i], ...updates };
    set({ businessHours: hours });
  };

  const updateSlide = (i: number, updates: Partial<HeroSlide>) => {
    if (!settings) return;
    const slides = [...settings.slides];
    slides[i] = { ...slides[i], ...updates };
    set({ slides });
  };

  const addSlide = () => {
    if (!settings || settings.slides.length >= 5) return;
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      imageUrl: "",
      headline: "New Slide",
      subheadline: "",
      buttonText: "Learn More",
      buttonLink: "/inventory",
      active: true,
    };
    set({ slides: [...settings.slides, newSlide] });
  };

  const removeSlide = (i: number) => {
    if (!settings) return;
    set({ slides: settings.slides.filter((_, idx) => idx !== i) });
  };

  // Upload helpers
  async function uploadFile(file: File, folder: string): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const r = await fetch("/api/upload", {
      method: "POST",
      headers: { "x-admin-token": token() },
      body: fd,
    });
    const d = await r.json();
    return d.url || null;
  }

  const uploadLogo = async (file: File) => {
    setUploadingLogo(true);
    try {
      const url = await uploadFile(file, "logo");
      if (url) set({ logoUrl: url });
    } finally {
      setUploadingLogo(false);
    }
  };

  const uploadFavicon = async (file: File) => {
    setUploadingFavicon(true);
    try {
      const url = await uploadFile(file, "favicon");
      if (url) set({ faviconUrl: url });
    } finally {
      setUploadingFavicon(false);
    }
  };

  const uploadSlideImage = async (slideIdx: number, file: File) => {
    setUploadingSlide(slideIdx);
    try {
      const url = await uploadFile(file, "slides");
      if (url) updateSlide(slideIdx, { imageUrl: url });
    } finally {
      setUploadingSlide(null);
    }
  };

  // Drag-to-reorder handlers
  const handleDragStart = (e: React.DragEvent, i: number) => {
    setDragIdx(i);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIdx(i);
  };
  const handleDrop = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i || !settings) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }
    const slides = [...settings.slides];
    const [dragged] = slides.splice(dragIdx, 1);
    slides.splice(i, 0, dragged);
    set({ slides });
    setDragIdx(null);
    setDragOverIdx(null);
  };
  const handleDragEnd = () => {
    setDragIdx(null);
    setDragOverIdx(null);
  };

  const tabs = [
    { id: "general", label: "General" },
    { id: "branding", label: "Branding" },
    { id: "contact", label: "Contact" },
    { id: "hours", label: "Hours" },
    { id: "slides", label: "Hero Slides" },
    { id: "seo", label: "SEO" },
  ] as const;

  if (loading || !settings) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-[#0073bb] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Settings size={22} /> Website Settings
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Changes apply site-wide instantly after saving</p>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-70 ${saved ? "bg-green-600 text-white" : "bg-[#0073bb] hover:bg-[#005a94] text-white"}`}
          >
            <Save size={16} />
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? "bg-[#0073bb] text-white" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">

          {/* ── General ── */}
          {tab === "general" && (
            <>
              <h3 className="font-bold text-slate-900 text-lg">General Settings</h3>
              <div className="grid gap-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Primary Color</label>
                    <div className="flex gap-2">
                      <input type="color" value={settings.primaryColor} onChange={(e) => set({ primaryColor: e.target.value })} className="h-10 w-14 rounded-lg border border-slate-200 cursor-pointer p-1" />
                      <input value={settings.primaryColor} onChange={(e) => set({ primaryColor: e.target.value })} className={`flex-1 ${INPUT} font-mono`} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Secondary Color</label>
                    <div className="flex gap-2">
                      <input type="color" value={settings.secondaryColor} onChange={(e) => set({ secondaryColor: e.target.value })} className="h-10 w-14 rounded-lg border border-slate-200 cursor-pointer p-1" />
                      <input value={settings.secondaryColor} onChange={(e) => set({ secondaryColor: e.target.value })} className={`flex-1 ${INPUT} font-mono`} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Social Media</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["facebook", "instagram", "twitter", "youtube", "tiktok"] as const).map((s) => (
                      <div key={s}>
                        <label className="block text-xs font-medium text-slate-500 mb-1 capitalize">{s}</label>
                        <input value={settings.social[s]} onChange={(e) => setSocial({ [s]: e.target.value })} placeholder={`https://${s}.com/...`} className={INPUT_SM} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Branding ── */}
          {tab === "branding" && (
            <>
              <h3 className="font-bold text-slate-900 text-lg">Branding</h3>
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Company Name *</label>
                  <input value={settings.dealershipName} onChange={(e) => set({ dealershipName: e.target.value })} className={INPUT} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tagline</label>
                  <input value={settings.tagline} onChange={(e) => set({ tagline: e.target.value })} className={INPUT} placeholder="e.g. Quality Pre-Owned Vehicles" />
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Logo</label>
                  {settings.logoUrl && (
                    <div className="mb-3 p-3 border border-slate-200 rounded-lg bg-slate-50 inline-block">
                      <img src={settings.logoUrl} alt="Logo preview" className="h-14 max-w-[200px] object-contain" />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      ref={logoInputRef}
                      className="hidden"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])}
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                    >
                      {uploadingLogo
                        ? <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                        : <Upload size={15} />}
                      {uploadingLogo ? "Uploading..." : settings.logoUrl ? "Replace Logo" : "Upload Logo"}
                    </button>
                    {settings.logoUrl && (
                      <button type="button" onClick={() => set({ logoUrl: "" })} className="text-sm text-red-500 hover:text-red-700 transition-colors">
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">PNG or WebP recommended. Max 5 MB. Shown in navbar and footer.</p>
                </div>

                {/* Favicon Upload */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Favicon</label>
                  {settings.faviconUrl && (
                    <div className="mb-3 p-2 border border-slate-200 rounded-lg bg-slate-50 inline-block">
                      <img src={settings.faviconUrl} alt="Favicon preview" className="h-8 w-8 object-contain" />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      ref={faviconInputRef}
                      className="hidden"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) => e.target.files?.[0] && uploadFavicon(e.target.files[0])}
                    />
                    <button
                      type="button"
                      onClick={() => faviconInputRef.current?.click()}
                      disabled={uploadingFavicon}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                    >
                      {uploadingFavicon
                        ? <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                        : <Upload size={15} />}
                      {uploadingFavicon ? "Uploading..." : settings.faviconUrl ? "Replace Favicon" : "Upload Favicon"}
                    </button>
                    {settings.faviconUrl && (
                      <button type="button" onClick={() => set({ faviconUrl: "" })} className="text-sm text-red-500 hover:text-red-700 transition-colors">
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">ICO, PNG, or WebP. 32×32 px recommended. Max 5 MB.</p>
                </div>
              </div>
            </>
          )}

          {/* ── Contact ── */}
          {tab === "contact" && (
            <>
              <h3 className="font-bold text-slate-900 text-lg">Contact Information</h3>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
                  <input value={settings.contact.phone} onChange={(e) => setContact({ phone: e.target.value })} className={INPUT} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                  <input type="email" value={settings.contact.email} onChange={(e) => setContact({ email: e.target.value })} className={INPUT} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Street Address</label>
                  <input value={settings.contact.address} onChange={(e) => setContact({ address: e.target.value })} className={INPUT} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">City</label>
                  <input value={settings.contact.city} onChange={(e) => setContact({ city: e.target.value })} className={INPUT} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">State</label>
                    <input value={settings.contact.state} onChange={(e) => setContact({ state: e.target.value })} className={INPUT} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">ZIP</label>
                    <input value={settings.contact.zip} onChange={(e) => setContact({ zip: e.target.value })} className={INPUT} />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Google Maps URL</label>
                  <input value={settings.contact.googleMapsUrl} onChange={(e) => setContact({ googleMapsUrl: e.target.value })} placeholder="https://maps.google.com/..." className={INPUT} />
                </div>
              </div>
            </>
          )}

          {/* ── Hours ── */}
          {tab === "hours" && (
            <>
              <h3 className="font-bold text-slate-900 text-lg">Business Hours</h3>
              <div className="space-y-3">
                {settings.businessHours.map((h, i) => (
                  <div key={h.day} className="flex items-center gap-4 py-2 border-b border-slate-100 last:border-0">
                    <div className="w-28 shrink-0">
                      <span className="font-medium text-slate-800 text-sm">{h.day}</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={h.open} onChange={(e) => updateHours(i, { open: e.target.checked })} className="w-4 h-4 accent-[#0073bb]" />
                      <span className="text-sm text-slate-600">{h.open ? "Open" : "Closed"}</span>
                    </label>
                    {h.open && (
                      <>
                        <input type="time" value={h.openTime} onChange={(e) => updateHours(i, { openTime: e.target.value })} className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                        <span className="text-slate-400 text-sm">to</span>
                        <input type="time" value={h.closeTime} onChange={(e) => updateHours(i, { closeTime: e.target.value })} className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Hero Slides ── */}
          {tab === "slides" && (
            <>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="font-bold text-slate-900 text-lg">Hero Slides</h3>
                <div className="flex items-center gap-4">
                  {/* Slider Speed */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">Slide Speed</label>
                    <select
                      value={settings.sliderSpeed ?? 5}
                      onChange={(e) => set({ sliderSpeed: Number(e.target.value) })}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb] bg-white"
                    >
                      {[2, 3, 4, 5, 6, 7, 8, 10].map((s) => (
                        <option key={s} value={s}>{s}s</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={addSlide}
                    disabled={settings.slides.length >= 5}
                    className="flex items-center gap-1.5 text-sm font-semibold text-[#0073bb] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus size={16} />
                    Add Slide {settings.slides.length >= 5 ? "(max 5)" : `(${settings.slides.length}/5)`}
                  </button>
                </div>
              </div>

              {settings.slides.length > 1 && (
                <p className="text-xs text-slate-400">Drag the <span className="font-medium">⠿</span> handle to reorder slides.</p>
              )}

              <div className="space-y-3">
                {settings.slides.map((slide, i) => (
                  <div
                    key={slide.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, i)}
                    onDragOver={(e) => handleDragOver(e, i)}
                    onDrop={(e) => handleDrop(e, i)}
                    onDragEnd={handleDragEnd}
                    className={`border rounded-xl p-4 space-y-3 transition-all ${
                      dragOverIdx === i && dragIdx !== i
                        ? "border-[#0073bb] bg-blue-50/50"
                        : dragIdx === i
                        ? "border-slate-300 opacity-50"
                        : "border-slate-200"
                    }`}
                  >
                    {/* Slide header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500">
                          <GripVertical size={18} />
                        </div>
                        <span className="font-semibold text-slate-700 text-sm">Slide {i + 1}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" checked={slide.active} onChange={(e) => updateSlide(i, { active: e.target.checked })} className="accent-[#0073bb]" />
                          Active
                        </label>
                        <button onClick={() => removeSlide(i)} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Image area */}
                    <div>
                      {slide.imageUrl && (
                        <img src={slide.imageUrl} alt="" className="w-full h-36 object-cover rounded-lg mb-2" />
                      )}
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          ref={(el) => { slideInputRefs.current[i] = el; }}
                          className="hidden"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={(e) => e.target.files?.[0] && uploadSlideImage(i, e.target.files[0])}
                        />
                        <button
                          type="button"
                          onClick={() => slideInputRefs.current[i]?.click()}
                          disabled={uploadingSlide === i}
                          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-60"
                        >
                          {uploadingSlide === i
                            ? <div className="w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                            : <Upload size={13} />}
                          {uploadingSlide === i ? "Uploading..." : slide.imageUrl ? "Replace Image" : "Upload Image"}
                        </button>
                        <div className="flex-1">
                          <input
                            value={slide.imageUrl}
                            onChange={(e) => updateSlide(i, { imageUrl: e.target.value })}
                            placeholder="or paste image URL..."
                            className={INPUT_SM}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Text fields */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Headline</label>
                        <input value={slide.headline} onChange={(e) => updateSlide(i, { headline: e.target.value })} className={INPUT_SM} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Subheadline</label>
                        <input value={slide.subheadline} onChange={(e) => updateSlide(i, { subheadline: e.target.value })} className={INPUT_SM} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Button Text</label>
                        <input value={slide.buttonText} onChange={(e) => updateSlide(i, { buttonText: e.target.value })} className={INPUT_SM} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Button Link</label>
                        <input value={slide.buttonLink} onChange={(e) => updateSlide(i, { buttonLink: e.target.value })} className={INPUT_SM} />
                      </div>
                    </div>
                  </div>
                ))}
                {settings.slides.length === 0 && (
                  <p className="text-center text-slate-400 text-sm py-6">No slides. Click "Add Slide" to create one.</p>
                )}
              </div>
            </>
          )}

          {/* ── SEO ── */}
          {tab === "seo" && (
            <>
              <h3 className="font-bold text-slate-900 text-lg">SEO & Analytics</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Meta Title</label>
                  <input value={settings.seo.metaTitle} onChange={(e) => setSeo({ metaTitle: e.target.value })} className={INPUT} />
                  <p className="text-xs text-slate-400 mt-1">{settings.seo.metaTitle.length}/60 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Meta Description</label>
                  <textarea rows={3} value={settings.seo.metaDescription} onChange={(e) => setSeo({ metaDescription: e.target.value })} className={`${INPUT} resize-none`} />
                  <p className="text-xs text-slate-400 mt-1">{settings.seo.metaDescription.length}/160 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Google Analytics ID</label>
                  <input value={settings.seo.googleAnalyticsId} onChange={(e) => setSeo({ googleAnalyticsId: e.target.value })} placeholder="G-XXXXXXXXXX" className={INPUT} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Save button bottom */}
        <div className="flex justify-end mt-4">
          <button
            onClick={save}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-70 ${saved ? "bg-green-600 text-white" : "bg-[#0073bb] hover:bg-[#005a94] text-white"}`}
          >
            <Save size={16} />
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

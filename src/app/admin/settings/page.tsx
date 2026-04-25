"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Settings } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { SiteSettings, HeroSlide, BusinessHours } from "@/lib/types";

function token() {
  return typeof window !== "undefined" ? localStorage.getItem("nova-admin-token") || "" : "";
}

export default function SettingsPage() {
  const [tab, setTab] = useState<"general" | "contact" | "hours" | "slides" | "seo">("general");
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json", "x-admin-token": token() }, body: JSON.stringify(settings) });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const set = (updates: Partial<SiteSettings>) => setSettings((s) => s ? { ...s, ...updates } : s);
  const setContact = (updates: Partial<SiteSettings["contact"]>) => setSettings((s) => s ? { ...s, contact: { ...s.contact, ...updates } } : s);
  const setSocial = (updates: Partial<SiteSettings["social"]>) => setSettings((s) => s ? { ...s, social: { ...s.social, ...updates } } : s);
  const setSeo = (updates: Partial<SiteSettings["seo"]>) => setSettings((s) => s ? { ...s, seo: { ...s.seo, ...updates } } : s);

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
    if (!settings) return;
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`, imageUrl: "", headline: "New Slide", subheadline: "",
      buttonText: "Learn More", buttonLink: "/inventory", active: true,
    };
    set({ slides: [...settings.slides, newSlide] });
  };

  const removeSlide = (i: number) => {
    if (!settings) return;
    set({ slides: settings.slides.filter((_, idx) => idx !== i) });
  };

  const tabs = [
    { id: "general", label: "General" },
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
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Settings size={22} /> Website Settings</h1>
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
          {/* General */}
          {tab === "general" && (
            <>
              <h3 className="font-bold text-slate-900 text-lg">General Settings</h3>
              <div className="grid gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Dealership Name *</label>
                  <input value={settings.dealershipName} onChange={(e) => set({ dealershipName: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tagline</label>
                  <input value={settings.tagline} onChange={(e) => set({ tagline: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Primary Color</label>
                    <div className="flex gap-2">
                      <input type="color" value={settings.primaryColor} onChange={(e) => set({ primaryColor: e.target.value })} className="h-10 w-14 rounded-lg border border-slate-200 cursor-pointer p-1" />
                      <input value={settings.primaryColor} onChange={(e) => set({ primaryColor: e.target.value })} className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb] font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Secondary Color</label>
                    <div className="flex gap-2">
                      <input type="color" value={settings.secondaryColor} onChange={(e) => set({ secondaryColor: e.target.value })} className="h-10 w-14 rounded-lg border border-slate-200 cursor-pointer p-1" />
                      <input value={settings.secondaryColor} onChange={(e) => set({ secondaryColor: e.target.value })} className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb] font-mono" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Logo URL</label>
                  <input value={settings.logoUrl} onChange={(e) => set({ logoUrl: e.target.value })} placeholder="https://..." className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Social Media</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["facebook", "instagram", "twitter", "youtube", "tiktok"] as const).map((s) => (
                      <div key={s}>
                        <label className="block text-xs font-medium text-slate-500 mb-1 capitalize">{s}</label>
                        <input value={settings.social[s]} onChange={(e) => setSocial({ [s]: e.target.value })} placeholder={`https://${s}.com/...`} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Contact */}
          {tab === "contact" && (
            <>
              <h3 className="font-bold text-slate-900 text-lg">Contact Information</h3>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
                  <input value={settings.contact.phone} onChange={(e) => setContact({ phone: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                  <input type="email" value={settings.contact.email} onChange={(e) => setContact({ email: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Street Address</label>
                  <input value={settings.contact.address} onChange={(e) => setContact({ address: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">City</label>
                  <input value={settings.contact.city} onChange={(e) => setContact({ city: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">State</label>
                    <input value={settings.contact.state} onChange={(e) => setContact({ state: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">ZIP</label>
                    <input value={settings.contact.zip} onChange={(e) => setContact({ zip: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Google Maps URL</label>
                  <input value={settings.contact.googleMapsUrl} onChange={(e) => setContact({ googleMapsUrl: e.target.value })} placeholder="https://maps.google.com/..." className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                </div>
              </div>
            </>
          )}

          {/* Hours */}
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

          {/* Slides */}
          {tab === "slides" && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-lg">Hero Slides</h3>
                <button onClick={addSlide} className="flex items-center gap-1.5 text-sm font-semibold text-[#0073bb] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                  <Plus size={16} /> Add Slide
                </button>
              </div>
              <div className="space-y-4">
                {settings.slides.map((slide, i) => (
                  <div key={slide.id} className="border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700 text-sm">Slide {i + 1}</span>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" checked={slide.active} onChange={(e) => updateSlide(i, { active: e.target.checked })} className="accent-[#0073bb]" />
                          Active
                        </label>
                        <button onClick={() => removeSlide(i)} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {slide.imageUrl && (
                      <img src={slide.imageUrl} alt="" className="w-full h-32 object-cover rounded-lg" />
                    )}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Image URL</label>
                      <input value={slide.imageUrl} onChange={(e) => updateSlide(i, { imageUrl: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Headline</label>
                        <input value={slide.headline} onChange={(e) => updateSlide(i, { headline: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Subheadline</label>
                        <input value={slide.subheadline} onChange={(e) => updateSlide(i, { subheadline: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Button Text</label>
                        <input value={slide.buttonText} onChange={(e) => updateSlide(i, { buttonText: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Button Link</label>
                        <input value={slide.buttonLink} onChange={(e) => updateSlide(i, { buttonLink: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
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

          {/* SEO */}
          {tab === "seo" && (
            <>
              <h3 className="font-bold text-slate-900 text-lg">SEO & Analytics</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Meta Title</label>
                  <input value={settings.seo.metaTitle} onChange={(e) => setSeo({ metaTitle: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
                  <p className="text-xs text-slate-400 mt-1">{settings.seo.metaTitle.length}/60 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Meta Description</label>
                  <textarea rows={3} value={settings.seo.metaDescription} onChange={(e) => setSeo({ metaDescription: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb] resize-none" />
                  <p className="text-xs text-slate-400 mt-1">{settings.seo.metaDescription.length}/160 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Google Analytics ID</label>
                  <input value={settings.seo.googleAnalyticsId} onChange={(e) => setSeo({ googleAnalyticsId: e.target.value })} placeholder="G-XXXXXXXXXX" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb]" />
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

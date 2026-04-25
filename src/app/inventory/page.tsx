"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  SlidersHorizontal,
  X,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ArrowUp,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CarCard from "@/components/CarCard";
import CarCardSkeleton from "@/components/CarCardSkeleton";
import DualRangeSlider from "@/components/DualRangeSlider";
import { Car } from "@/lib/types";

const ITEMS_PER_PAGE = 9;

const BODY_STYLES = ["Sedan", "SUV", "Truck", "Hatchback", "Coupe", "Van"];
const TRANSMISSIONS = ["Automatic", "Manual", "CVT"];
const FUEL_TYPES = ["Gas", "Hybrid", "Electric", "Diesel"];
const MILEAGE_RANGES = [
  { label: "Under 30k", value: "under30" },
  { label: "30k – 60k", value: "30to60" },
  { label: "60k – 100k", value: "60to100" },
  { label: "100k+", value: "over100" },
];

function formatPrice(p: number) {
  return "$" + new Intl.NumberFormat("en-US").format(p);
}

function matchesMileage(mileage: number, range: string) {
  if (!range) return true;
  if (range === "under30") return mileage < 30000;
  if (range === "30to60") return mileage >= 30000 && mileage < 60000;
  if (range === "60to100") return mileage >= 60000 && mileage < 100000;
  if (range === "over100") return mileage >= 100000;
  return true;
}

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Collapsible({ title, children, defaultOpen = true }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#e0e0e0] pb-4 mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-sm font-semibold text-[#212121] py-1 mb-3"
      >
        {title}
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && children}
    </div>
  );
}

function InventoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [allCars, setAllCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [showBackTop, setShowBackTop] = useState(false);

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedMakes, setSelectedMakes] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState<[number, number]>([2000, new Date().getFullYear()]);
  const [mileageRange, setMileageRange] = useState("");
  const [selectedBodyStyles, setSelectedBodyStyles] = useState<string[]>(() => {
    const v = searchParams.get("bodyStyle");
    return v ? [v] : [];
  });
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>([]);
  const [selectedFuels, setSelectedFuels] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetch("/api/cars")
      .then((r) => r.json())
      .then((data) => {
        setAllCars(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const allMakes = useMemo(
    () => [...new Set(allCars.map((c) => c.make))].sort(),
    [allCars]
  );
  const allModels = useMemo(
    () =>
      [...new Set(allCars.filter((c) => !selectedMakes.length || selectedMakes.includes(c.make)).map((c) => c.model))].sort(),
    [allCars, selectedMakes]
  );

  const toggleItem = (arr: string[], setArr: (a: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
    setPage(1);
  };

  const clearAll = useCallback(() => {
    setSearch("");
    setPriceRange([0, 100000]);
    setSelectedMakes([]);
    setSelectedModels([]);
    setYearRange([2000, new Date().getFullYear()]);
    setMileageRange("");
    setSelectedBodyStyles([]);
    setSelectedTransmissions([]);
    setSelectedFuels([]);
    setSortBy("newest");
    setPage(1);
  }, []);

  const filtered = useMemo(() => {
    let cars = allCars.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !c.title.toLowerCase().includes(q) &&
          !c.make.toLowerCase().includes(q) &&
          !c.model.toLowerCase().includes(q)
        )
          return false;
      }
      if (c.price < priceRange[0] || c.price > priceRange[1]) return false;
      if (selectedMakes.length && !selectedMakes.includes(c.make)) return false;
      if (selectedModels.length && !selectedModels.includes(c.model)) return false;
      if (c.year < yearRange[0] || c.year > yearRange[1]) return false;
      if (mileageRange && !matchesMileage(c.mileage, mileageRange)) return false;
      if (selectedBodyStyles.length && !selectedBodyStyles.includes(c.bodyStyle)) return false;
      if (selectedTransmissions.length && !selectedTransmissions.includes(c.transmission)) return false;
      if (selectedFuels.length && !selectedFuels.includes(c.fuelType)) return false;
      return true;
    });

    cars.sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "mileage-asc") return a.mileage - b.mileage;
      if (sortBy === "year-desc") return b.year - a.year;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return cars;
  }, [
    allCars, search, priceRange, selectedMakes, selectedModels, yearRange,
    mileageRange, selectedBodyStyles, selectedTransmissions, selectedFuels, sortBy,
  ]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const activeChips = [
    ...selectedMakes.map((v) => ({ label: v, clear: () => toggleItem(selectedMakes, setSelectedMakes, v) })),
    ...selectedModels.map((v) => ({ label: v, clear: () => toggleItem(selectedModels, setSelectedModels, v) })),
    ...selectedBodyStyles.map((v) => ({ label: v, clear: () => toggleItem(selectedBodyStyles, setSelectedBodyStyles, v) })),
    ...selectedTransmissions.map((v) => ({ label: v, clear: () => toggleItem(selectedTransmissions, setSelectedTransmissions, v) })),
    ...selectedFuels.map((v) => ({ label: v, clear: () => toggleItem(selectedFuels, setSelectedFuels, v) })),
    ...(mileageRange ? [{ label: MILEAGE_RANGES.find((r) => r.value === mileageRange)?.label || mileageRange, clear: () => setMileageRange("") }] : []),
  ];

  const FilterPanel = () => (
    <div className="space-y-0">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-[#212121]">Filters</h2>
        {activeChips.length > 0 && (
          <button onClick={clearAll} className="flex items-center gap-1 text-xs text-[#0073bb] hover:underline">
            <RotateCcw size={12} /> Clear All
          </button>
        )}
      </div>

      <Collapsible title="Price Range">
        <DualRangeSlider
          min={0}
          max={100000}
          value={priceRange}
          onChange={(v) => { setPriceRange(v); setPage(1); }}
          formatLabel={(v) => formatPrice(v)}
        />
        <div className="flex gap-2 mt-3">
          <input
            type="number"
            className="w-1/2 px-2 py-1.5 text-xs border border-[#e0e0e0] rounded-md"
            placeholder="Min $"
            value={priceRange[0] || ""}
            onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
          />
          <input
            type="number"
            className="w-1/2 px-2 py-1.5 text-xs border border-[#e0e0e0] rounded-md"
            placeholder="Max $"
            value={priceRange[1] || ""}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 100000])}
          />
        </div>
      </Collapsible>

      <Collapsible title="Year">
        <DualRangeSlider
          min={1990}
          max={new Date().getFullYear()}
          value={yearRange}
          onChange={(v) => { setYearRange(v); setPage(1); }}
          formatLabel={(v) => String(v)}
        />
      </Collapsible>

      <Collapsible title="Make">
        <div className="max-h-40 overflow-y-auto space-y-1.5">
          {allMakes.map((make) => (
            <label key={make} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedMakes.includes(make)}
                onChange={() => toggleItem(selectedMakes, setSelectedMakes, make)}
                className="accent-[#0073bb] w-4 h-4"
              />
              <span className="text-sm text-[#212121] group-hover:text-[#0073bb]">{make}</span>
            </label>
          ))}
        </div>
      </Collapsible>

      <Collapsible title="Model" defaultOpen={false}>
        <div className="max-h-40 overflow-y-auto space-y-1.5">
          {allModels.map((model) => (
            <label key={model} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedModels.includes(model)}
                onChange={() => toggleItem(selectedModels, setSelectedModels, model)}
                className="accent-[#0073bb] w-4 h-4"
              />
              <span className="text-sm text-[#212121] group-hover:text-[#0073bb]">{model}</span>
            </label>
          ))}
        </div>
      </Collapsible>

      <Collapsible title="Mileage" defaultOpen={false}>
        <div className="space-y-1.5">
          {MILEAGE_RANGES.map((r) => (
            <label key={r.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="mileage"
                checked={mileageRange === r.value}
                onChange={() => { setMileageRange(r.value); setPage(1); }}
                className="accent-[#0073bb] w-4 h-4"
              />
              <span className="text-sm text-[#212121] group-hover:text-[#0073bb]">{r.label}</span>
            </label>
          ))}
          {mileageRange && (
            <button onClick={() => setMileageRange("")} className="text-xs text-[#757575] hover:text-[#0073bb] mt-1">
              Clear
            </button>
          )}
        </div>
      </Collapsible>

      <Collapsible title="Body Style" defaultOpen={false}>
        <div className="space-y-1.5">
          {BODY_STYLES.map((s) => (
            <label key={s} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedBodyStyles.includes(s)}
                onChange={() => toggleItem(selectedBodyStyles, setSelectedBodyStyles, s)}
                className="accent-[#0073bb] w-4 h-4"
              />
              <span className="text-sm text-[#212121] group-hover:text-[#0073bb]">{s}</span>
            </label>
          ))}
        </div>
      </Collapsible>

      <Collapsible title="Transmission" defaultOpen={false}>
        <div className="space-y-1.5">
          {TRANSMISSIONS.map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedTransmissions.includes(t)}
                onChange={() => toggleItem(selectedTransmissions, setSelectedTransmissions, t)}
                className="accent-[#0073bb] w-4 h-4"
              />
              <span className="text-sm text-[#212121] group-hover:text-[#0073bb]">{t}</span>
            </label>
          ))}
        </div>
      </Collapsible>

      <Collapsible title="Fuel Type" defaultOpen={false}>
        <div className="space-y-1.5">
          {FUEL_TYPES.map((f) => (
            <label key={f} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedFuels.includes(f)}
                onChange={() => toggleItem(selectedFuels, setSelectedFuels, f)}
                className="accent-[#0073bb] w-4 h-4"
              />
              <span className="text-sm text-[#212121] group-hover:text-[#0073bb]">{f}</span>
            </label>
          ))}
        </div>
      </Collapsible>
    </div>
  );

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Page header */}
        <div className="bg-[#1a1a2e] text-white py-10 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-extrabold mb-2">Vehicle Inventory</h1>
            <p className="text-white/70 text-sm">
              Browse our full selection of quality pre-owned vehicles
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
          {/* Sidebar — desktop */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-white rounded-xl border border-[#e0e0e0] p-5 sticky top-20">
              <FilterPanel />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Search bar */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search make, model, or keyword..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full px-4 py-3 border border-[#e0e0e0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0073bb] bg-white"
              />
            </div>

            {/* Active filter chips */}
            {activeChips.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {activeChips.map(({ label, clear }, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 bg-[#e3f2fd] text-[#0073bb] text-xs font-medium px-3 py-1.5 rounded-full"
                  >
                    {label}
                    <button onClick={clear} aria-label="Remove filter">
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearAll}
                  className="text-xs text-[#757575] hover:text-[#c62828] px-2 py-1.5"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Results header */}
            <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
              <div className="flex items-center gap-3">
                <button
                  className="lg:hidden flex items-center gap-2 px-3 py-2 border border-[#e0e0e0] rounded-lg text-sm font-medium bg-white hover:border-[#0073bb] transition-colors"
                  onClick={() => setDrawerOpen(true)}
                >
                  <SlidersHorizontal size={16} />
                  Filters
                  {activeChips.length > 0 && (
                    <span className="bg-[#0073bb] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {activeChips.length}
                    </span>
                  )}
                </button>
                <span className="text-sm text-[#757575]">
                  <strong className="text-[#212121]">{filtered.length}</strong> vehicles
                </span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  className="px-3 py-2 border border-[#e0e0e0] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0073bb]"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="mileage-asc">Mileage: Low to High</option>
                  <option value="year-desc">Year: Newest</option>
                </select>
                <div className="flex border border-[#e0e0e0] rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${viewMode === "grid" ? "bg-[#0073bb] text-white" : "bg-white text-[#757575] hover:bg-[#f5f5f5]"}`}
                    aria-label="Grid view"
                  >
                    <Grid3X3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${viewMode === "list" ? "bg-[#0073bb] text-white" : "bg-white text-[#757575] hover:bg-[#f5f5f5]"}`}
                    aria-label="List view"
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Car grid */}
            {loading ? (
              <div className={`grid gap-5 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <CarCardSkeleton key={i} />
                ))}
              </div>
            ) : paginated.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-[#e0e0e0]">
                <p className="text-2xl mb-2">🚗</p>
                <p className="font-semibold text-[#212121]">No vehicles found</p>
                <p className="text-sm text-[#757575] mt-1">Try adjusting your filters</p>
                <button
                  onClick={clearAll}
                  className="mt-4 text-[#0073bb] hover:underline text-sm font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-5 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                {paginated.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-[#e0e0e0] disabled:opacity-40 hover:border-[#0073bb] transition-colors bg-white"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPage(p); window.scrollTo(0, 0); }}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors border ${
                      p === page
                        ? "bg-[#0073bb] text-white border-[#0073bb]"
                        : "bg-white text-[#212121] border-[#e0e0e0] hover:border-[#0073bb]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); }}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-[#e0e0e0] disabled:opacity-40 hover:border-[#0073bb] transition-colors bg-white"
                  aria-label="Next page"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile filter drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setDrawerOpen(false)}
            />
            <div className="relative ml-auto w-80 max-w-full h-full bg-white shadow-2xl overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-[#e0e0e0] px-5 py-4 flex items-center justify-between z-10">
                <span className="font-bold text-[#212121]">Filters</span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 rounded-md hover:bg-[#f5f5f5]"
                  aria-label="Close filters"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-5">
                <FilterPanel />
              </div>
              <div className="sticky bottom-0 bg-white border-t border-[#e0e0e0] px-5 py-4">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-full bg-[#0073bb] text-white py-3 rounded-lg font-semibold text-sm"
                >
                  Show {filtered.length} Results
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Back to top */}
        {showBackTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-40 w-10 h-10 bg-[#0073bb] hover:bg-[#005a94] text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
            aria-label="Back to top"
          >
            <ArrowUp size={18} />
          </button>
        )}
      </main>
      <Footer />
    </>
  );
}

export default function InventoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
          <div className="w-8 h-8 border-4 border-[#0073bb] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <InventoryContent />
    </Suspense>
  );
}

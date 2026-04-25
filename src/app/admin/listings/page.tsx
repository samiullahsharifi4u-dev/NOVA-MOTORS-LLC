"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  PlusCircle,
  Pencil,
  Trash2,
  Eye,
  Search,
  AlertTriangle,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/components/Toast";
import { Car } from "@/lib/types";

function formatPrice(p: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(p);
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  sold: "bg-gray-100 text-gray-600",
  draft: "bg-yellow-100 text-yellow-700",
};

export default function ListingsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const fetchCars = () => {
    setLoading(true);
    fetch("/api/cars?status=all")
      .then((r) => r.json())
      .then((data) => {
        setCars(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchCars(); }, []);

  const filtered = cars.filter((c) =>
    !search ||
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.make.toLowerCase().includes(search.toLowerCase()) ||
    c.stockNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const token = localStorage.getItem("nova-admin-token") || "";

    try {
      const res = await fetch(`/api/cars/${deleteId}`, {
        method: "DELETE",
        headers: { "x-admin-token": token },
      });

      if (res.ok) {
        showToast("Listing deleted successfully.", "success");
        setCars((prev) => prev.filter((c) => c.id !== deleteId));
      } else {
        showToast("Failed to delete listing.", "error");
      }
    } catch {
      showToast("Error deleting listing.", "error");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#212121]">All Listings</h1>
            <p className="text-[#757575] text-sm mt-0.5">
              {cars.length} total vehicles
            </p>
          </div>
          <Link
            href="/admin/listings/new"
            className="flex items-center gap-2 bg-[#0073bb] hover:bg-[#005a94] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <PlusCircle size={16} />
            Add New Car
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#757575]" />
          <input
            type="text"
            placeholder="Search by title, make, or stock number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#e0e0e0] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0073bb]"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-[#e0e0e0] overflow-hidden">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-6 h-6 border-2 border-[#0073bb] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-[#757575]">
              {search ? "No results match your search." : (
                <>
                  No listings yet.{" "}
                  <Link href="/admin/listings/new" className="text-[#0073bb] hover:underline">
                    Add your first car →
                  </Link>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#e0e0e0] bg-[#f5f5f5] text-left">
                      <th className="px-4 py-3 font-semibold text-[#757575] text-xs uppercase tracking-wider">Vehicle</th>
                      <th className="px-4 py-3 font-semibold text-[#757575] text-xs uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3 font-semibold text-[#757575] text-xs uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 font-semibold text-[#757575] text-xs uppercase tracking-wider">Views</th>
                      <th className="px-4 py-3 font-semibold text-[#757575] text-xs uppercase tracking-wider">Added</th>
                      <th className="px-4 py-3 font-semibold text-[#757575] text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e0e0e0]">
                    {filtered.map((car) => (
                      <tr key={car.id} className="hover:bg-[#f9f9f9] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                              {car.images[0] ? (
                                <Image
                                  src={car.images[0]}
                                  alt={car.title}
                                  width={56}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                                  No img
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-[#212121] text-sm">{car.title}</p>
                              <p className="text-[#757575] text-xs">{car.stockNumber || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#0073bb]">
                          {formatPrice(car.price)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[car.status]}`}>
                            {car.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#757575]">
                          <div className="flex items-center gap-1">
                            <Eye size={12} />
                            {car.views || 0}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#757575] text-xs">
                          {new Date(car.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/inventory/${car.id}`}
                              target="_blank"
                              className="p-1.5 text-[#757575] hover:text-[#0073bb] hover:bg-[#e3f2fd] rounded-md transition-colors"
                              title="View on site"
                            >
                              <Eye size={15} />
                            </Link>
                            <Link
                              href={`/admin/listings/${car.id}/edit`}
                              className="p-1.5 text-[#757575] hover:text-[#0073bb] hover:bg-[#e3f2fd] rounded-md transition-colors"
                              title="Edit"
                            >
                              <Pencil size={15} />
                            </Link>
                            <button
                              onClick={() => setDeleteId(car.id)}
                              className="p-1.5 text-[#757575] hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-[#e0e0e0]">
                {filtered.map((car) => (
                  <div key={car.id} className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {car.images[0] ? (
                          <Image
                            src={car.images[0]}
                            alt={car.title}
                            width={64}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#212121] truncate">{car.title}</p>
                        <p className="text-[#0073bb] font-bold text-sm">{formatPrice(car.price)}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${statusColors[car.status]}`}>
                        {car.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/inventory/${car.id}`} target="_blank" className="flex-1 text-center py-2 border border-[#e0e0e0] rounded-lg text-xs text-[#757575]">View</Link>
                      <Link href={`/admin/listings/${car.id}/edit`} className="flex-1 text-center py-2 border border-[#0073bb] rounded-lg text-xs text-[#0073bb]">Edit</Link>
                      <button onClick={() => setDeleteId(car.id)} className="flex-1 py-2 border border-red-300 rounded-lg text-xs text-red-500">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full slide-up">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-[#212121] text-center mb-2">
              Delete Listing?
            </h3>
            <p className="text-[#757575] text-sm text-center mb-6">
              This action cannot be undone. The listing will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 py-2.5 border border-[#e0e0e0] rounded-lg text-sm font-medium text-[#757575] hover:bg-[#f5f5f5]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold disabled:opacity-70 transition-colors"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

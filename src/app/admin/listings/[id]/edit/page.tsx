"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import CarForm from "@/components/admin/CarForm";
import { ToastProvider } from "@/components/Toast";
import { Car } from "@/lib/types";

export default function EditListingPage() {
  const params = useParams();
  const id = params.id as string;
  const [car, setCar] = useState<Car | null>(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setToken(localStorage.getItem("nova-admin-token") || "");
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/cars/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setCar(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Car not found.");
        setLoading(false);
      });
  }, [id]);

  return (
    <ToastProvider>
      <AdminLayout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#212121]">Edit Listing</h1>
            <p className="text-[#757575] text-sm mt-0.5">
              Update the details for this vehicle listing.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-[#0073bb] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-6 text-center">
              {error}
            </div>
          ) : car && token ? (
            <CarForm car={car} adminToken={token} />
          ) : null}
        </div>
      </AdminLayout>
    </ToastProvider>
  );
}

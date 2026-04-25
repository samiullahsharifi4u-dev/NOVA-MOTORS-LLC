"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import CarForm from "@/components/admin/CarForm";
import { ToastProvider } from "@/components/Toast";

export default function NewListingPage() {
  const [token, setToken] = useState("");

  useEffect(() => {
    setToken(localStorage.getItem("nova-admin-token") || "");
  }, []);

  return (
    <ToastProvider>
      <AdminLayout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#212121]">Add New Car</h1>
            <p className="text-[#757575] text-sm mt-0.5">
              Fill in the details below to create a new listing.
            </p>
          </div>
          {token && <CarForm adminToken={token} />}
        </div>
      </AdminLayout>
    </ToastProvider>
  );
}

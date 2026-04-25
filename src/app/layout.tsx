import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: {
    default: "Nova Motors LLC — Quality Pre-Owned Vehicles",
    template: "%s | Nova Motors LLC",
  },
  description:
    "Nova Motors LLC offers a premium selection of quality pre-owned vehicles. Browse our inventory, find your perfect car, and drive away happy.",
  keywords: ["car dealership", "used cars", "pre-owned vehicles", "Nova Motors"],
  openGraph: {
    title: "Nova Motors LLC",
    description: "Quality Pre-Owned Vehicles",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

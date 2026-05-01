import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { readSettings } from "@/lib/settings";

export function generateMetadata(): Metadata {
  let settings = null;
  try {
    settings = readSettings();
  } catch {}

  const name = settings?.dealershipName ?? "Nova Motors LLC";
  const metaTitle = settings?.seo?.metaTitle || `${name} — Quality Pre-Owned Vehicles`;
  const metaDescription = settings?.seo?.metaDescription || `${name} offers a premium selection of quality pre-owned vehicles. Browse our inventory, find your perfect car, and drive away happy.`;
  const faviconUrl = settings?.faviconUrl || "/favicon.ico";

  return {
    title: {
      default: metaTitle,
      template: `%s | ${name}`,
    },
    description: metaDescription,
    keywords: ["car dealership", "used cars", "pre-owned vehicles", name],
    icons: {
      icon: faviconUrl,
    },
    openGraph: {
      title: name,
      description: metaDescription,
      type: "website",
    },
  };
}

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

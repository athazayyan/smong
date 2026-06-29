import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Baloo_2, Nunito_Sans } from "next/font/google";
import { PwaRegister } from "@/components/layout/PwaRegister";
import "./globals.css";

const baloo2 = Baloo_2({
  variable: "--font-baloo-2",
  subsets: ["latin"],
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MitigaKids - Belajar Hari Ini, Siaga Esok Hari",
  description: "Platform Pembelajaran Mitigasi Bencana Berbasis Sekolah",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MitigaKids",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${baloo2.variable} ${nunitoSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans text-ink-900 bg-cream-50" suppressHydrationWarning>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}

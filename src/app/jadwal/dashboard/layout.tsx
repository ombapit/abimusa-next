import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Masjid Abi Musa Al-Asy&apos;ari",
  description: "Jadwal Sholat Masjid Abi Musa Al-Asy&apos;ari",
  icons: "/images/favicon.ico"
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >        
        {children}    
      </body>
    </html>
  );
}

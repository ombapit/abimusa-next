import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Masjid Abi Musa Al-Asy'ari",
  description: "Jadwal Sholat Masjid Abi Musa Al-Asy'ari",
  icons: "/images/favicon.ico"
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

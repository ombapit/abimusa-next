import type { Metadata } from "next";
import "@/app/globals.css";
import { Navbar } from "@/components/navbar";
import ScrollToTop from "../ScrollToTop";

export const metadata: Metadata = {
  title: "Masjid Abi Musa Al-Asy'ari",
  description: "Website Informasi Masjid Abi Musa Al-Asy'ari",
  icons: "/images/favicon.ico"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet"></link>
      </head>
      <body
        className={`font-inter antialiased`}
      >
        <div className="min-h-screen bg-gray-100">
          {/* Navbar */}
          <Navbar/>            

          <ScrollToTop />
          {children}
        </div>        
      </body>
    </html>
  );
}

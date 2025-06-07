"use client";

import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import Link from 'next/link';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState<string | null>(null);
  const [subSubmenuOpen, setSubSubmenuOpen] = useState<string | null>(null);

  const handleMouseEnter = (menu: string) => {
    setSubmenuOpen(menu);
    setSubSubmenuOpen(null);
    clearTimeout(window.submenuTimeout);
  };
  
  const handleMouseLeave = () => {
    window.submenuTimeout = setTimeout(() => {
      setSubmenuOpen(null);
      setSubSubmenuOpen(null);
    }, 200);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full p-4 flex justify-between items-center bg-white/60 backdrop-blur-lg shadow-lg text-black z-50 border border-white/10">
        <h1 className="text-xl font-bold">Masjid Abi Musa Al-Asy&apos;ari</h1>
        <button className="md:hidden cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <ul className="md:flex gap-8 hidden mr-48">
          <li><Link href="/" className="hover:underline">Home</Link></li>
          {/* Submenu Donatur */}
          <li className="relative group" onMouseEnter={() => handleMouseEnter("donatur")} onMouseLeave={handleMouseLeave}>
            <button className="flex items-center gap-1">Donatur <ChevronDown size={16} /></button>
            <ul className={`absolute left-0 top-full bg-white/30 backdrop-blur-lg shadow-lg rounded-lg mt-2 p-2 text-black ${submenuOpen === "donatur" ? "block" : "hidden"}`}>
              <li><Link href="/donatur/donatur-ramadhan" className="block px-4 py-2 hover:bg-gray-200 rounded">Donatur Ramadhan</Link></li>
            </ul>
          </li>
          {/* Submenu Keuangan */}
          <li className="relative group" onMouseEnter={() => handleMouseEnter("keuangan")} onMouseLeave={handleMouseLeave}>
            <button className="flex items-center gap-1">Keuangan <ChevronDown size={16} /></button>
            <ul className={`absolute left-0 top-full bg-white/30 backdrop-blur-lg shadow-lg rounded-lg mt-2 p-2 text-black ${submenuOpen === "keuangan" ? "block" : "hidden"}`}>
              <li><Link href="/keuangan/pengeluaran-ramadhan" className="block px-4 py-2 hover:bg-gray-200 rounded">Pengeluaran Ramadhan</Link></li>
            </ul>
          </li>
          {/* Submenu Jadwal dengan 2 Level */}
          <li className="relative group" onMouseEnter={() => handleMouseEnter("jadwal")} onMouseLeave={handleMouseLeave}>
            <button className="flex items-center gap-1">Jadwal <ChevronDown size={16} /></button>
            <ul className={`absolute left-0 top-full bg-white/30 backdrop-blur-lg shadow-lg rounded-lg mt-2 p-2 text-black ${submenuOpen === "jadwal" ? "block" : "hidden"}`}>
              <li><Link href="/jadwal/dashboard" className="block px-4 py-2 hover:bg-gray-200 rounded">Dashboard</Link></li>
              <li><Link href="/jadwal/jadwal-imsakiyah" className="block px-4 py-2 hover:bg-gray-200 rounded">Jadwal Imsakiyah Ramadhan</Link></li>
              <li className="relative group" onMouseEnter={() => setSubSubmenuOpen("takjil")} onMouseLeave={() => setSubSubmenuOpen(null)}>
                <button className="flex items-center gap-1 px-4 py-2 hover:bg-gray-200 rounded">Jadwal Takjil <ChevronDown size={12} /></button>
                <ul className={`absolute left-full top-0 bg-white/30 backdrop-blur-lg shadow-lg rounded-lg mt-2 p-2 text-black ${subSubmenuOpen === "takjil" ? "block" : "hidden"}`}>
                  <li><Link href="/jadwal/jadwal-takjil" className="block px-4 py-2 hover:bg-gray-200 rounded">Bulanan</Link></li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <ul className="md:hidden fixed top-14 left-0 w-full bg-white/30 backdrop-blur-lg text-black p-4 space-y-3 shadow-lg rounded-b-lg z-50">
          <li>
            <Link onClick={() => setMenuOpen(!menuOpen)} href="/" className="block">Home</Link>
          </li>
          <li>
            <button className="flex justify-between w-full" onClick={() => setSubmenuOpen(submenuOpen === "donatur" ? null : "donatur")}>Donatur <ChevronDown size={16} /></button>
            {submenuOpen === "donatur" && (
              <ul className="pl-4 mt-2 space-y-2 text-black">
                <li><Link onClick={() => setMenuOpen(!menuOpen)} href="/donatur/donatur-ramadhan" className="block">Donatur Ramadhan</Link></li>
              </ul>
            )}
          </li>
          <li>
            <button className="flex justify-between w-full" onClick={() => setSubmenuOpen(submenuOpen === "keuangan" ? null : "keuangan")}>Keuangan <ChevronDown size={16} /></button>
            {submenuOpen === "keuangan" && (
              <ul className="pl-4 mt-2 space-y-2 text-black">
                <li><Link onClick={() => setMenuOpen(!menuOpen)} href="/keuangan/pengeluaran-ramadhan" className="block">Pengeluaran Ramadhan</Link></li>
              </ul>
            )}
          </li>
          <li>
            <button className="flex justify-between w-full" onClick={() => setSubmenuOpen(submenuOpen === "jadwal" ? null : "jadwal")}>Jadwal <ChevronDown size={16} /></button>
            {submenuOpen === "jadwal" && (
              <ul className="pl-4 mt-2 space-y-2 text-black">                
                <li><Link onClick={() => setMenuOpen(!menuOpen)} href="/jadwal/jadwal-imsakiyah" className="block">Jadwal Imsakiyah Ramadhan</Link></li>
                <li>
                  <button className="flex justify-between w-full pl-4" onClick={() => setSubSubmenuOpen(subSubmenuOpen === "takjil" ? null : "takjil")}>Jadwal Takjil <ChevronDown size={12} /></button>
                  {subSubmenuOpen === "takjil" && (
                    <ul className="pl-6 mt-2 space-y-2 text-black">
                      <li><Link onClick={() => setMenuOpen(!menuOpen)} href="/jadwal/jadwal-takjil" className="block">Bulanan</Link></li>
                    </ul>
                  )}
                </li>
              </ul>
            )}
          </li>
        </ul>
      )}
    </>
  );
}

export { Navbar };

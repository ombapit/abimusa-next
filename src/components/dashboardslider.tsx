"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// List gambar slider
const images = [
  "/images/masjid1.jpg",
  "/images/masjid2.jpg",
] as const;

// Efek transisi dengan tipe yang lebih ketat
const effects = {
  fade: { opacity: 0 },
  slide: { x: "100%", opacity: 0 },
  scale: { scale: 0.5, opacity: 0 },
} as const;

// Tipe untuk effect yang valid
type EffectType = keyof typeof effects;

// Props interface
interface DashboardSliderProps {
  effect?: EffectType;
}

export default function DashboardSlider({ effect = "slide" }: DashboardSliderProps) {
  const [index, setIndex] = useState(0);

  // Auto slide setiap 5 detik
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Gambar slider */}
      <motion.img
        key={index}
        src={images[index]}
        alt="Slider Image"
        initial={effects[effect]} // ✅ Tidak error karena `effect` sudah dikontrol
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={effects[effect]}
        transition={{ duration: 0.8 }}
        className="object-cover absolute h-full w-full"
      />
    </div>
  );
}
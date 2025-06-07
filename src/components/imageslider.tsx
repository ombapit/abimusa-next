'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const images = [
  '/images/slide1.jpg',
  '/images/slide2.jpg',
];

const ImageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false); // State untuk pause/resume auto-slide

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Auto-slide logic
  useEffect(() => {
    if (isPaused) return; // Jangan jalankan interval jika slider di-pause

    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Ganti slide setiap 3 detik

    return () => clearInterval(interval); // Membersihkan interval saat komponen di-unmount
  }, [currentIndex, isPaused]);

  return (
    <div className="relative w-full h-[300px] md:h-[500px] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)} // Pause saat hover
      onMouseLeave={() => setIsPaused(false)} // Resume saat tidak hover
    >
      <div className="flex items-center justify-center h-full">
        {/* Gambar Blur Kiri (Hanya tampil di desktop) */}
        <motion.img
          key={`left-${currentIndex}`}
          src={images[currentIndex > 0 ? currentIndex - 1 : images.length - 1]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden md:block absolute left-0 w-1/3 h-full object-cover blur-sm"
        />

        {/* Gambar Utama (Tengah) */}
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute w-full md:w-2/3 h-full object-center z-10"
          />
        </AnimatePresence>

        {/* Gambar Blur Kanan (Hanya tampil di desktop) */}
        <motion.img
          key={`right-${currentIndex}`}
          src={images[currentIndex < images.length - 1 ? currentIndex + 1 : 0]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden md:block absolute right-0 w-1/3 h-full object-cover blur-sm"
        />
      </div>

      {/* Tombol Previous */}
      <button
        onClick={prevSlide}
        className="absolute hidden md:block left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition cursor-pointer"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Tombol Next */}
      <button
        onClick={nextSlide}
        className="absolute hidden md:block right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition cursor-pointer"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default ImageSlider;
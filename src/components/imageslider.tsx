'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const images = [
  '/images/slide1.jpg',
];

const ImageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused] = useState(false); // State untuk pause/resume auto-slide

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
    <div className="relative w-full h-56 md:h-screen overflow-hidden"
      // onMouseEnter={() => setIsPaused(true)} // Pause saat hover
      // onMouseLeave={() => setIsPaused(false)} // Resume saat tidak hover
    >
      <div className="flex items-center justify-center h-full">        
        {/* Gambar Utama (Tengah) */}
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute w-full h-full object-fill md:object-cover z-10"
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-black/20 z-20"></div>

        <div className="row align-items-center z-50">
          <div className="hero hidden md:block">     
            <h1>Masjid Abi Musa Al Asy&apos;ari</h1>
            <p>Bukit Cendana RT 006/09</p>
          </div>
        </div>
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
'use client'
import Image from "next/image";
import { useEffect, useState } from "react";

export default function JadwalImsakiyah() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }
  return (
    <div className="flex justify-center items-center min-h-screen md:mt-15">
      <Image 
        src="/images/jadwal_ramadan.jpg" 
        alt="Jadwal Imsakiyah Ramadhan"
        width={800} // Sesuaikan ukuran
        height={600}
        className="rounded-lg shadow-lg"
      />
    </div>
  );
}

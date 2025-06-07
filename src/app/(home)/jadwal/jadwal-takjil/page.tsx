'use client'
import { useEffect, useState } from "react";

export default function JadwalTakjil() {
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
    <div className="flex justify-center items-center min-h-screen p-4">
      <iframe 
        src="/files/takjil.pdf"
        className="w-full h-[80vh] border rounded-lg shadow-lg"
      />
    </div>
  );
}

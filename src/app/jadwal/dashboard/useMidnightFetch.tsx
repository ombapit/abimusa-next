import { useEffect } from "react";

interface MidnightFetchProps {
  fetchPrayerTimes: () => void;
  updateTanggal: () => void;
}

export default function useMidnightFetch({ fetchPrayerTimes, updateTanggal }: MidnightFetchProps) {
  useEffect(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); // Set ke 00:00 keesokan harinya

    const timeUntilMidnight = midnight.getTime() - now.getTime();

    // Jalankan pertama kali saat 12 malam tiba
    const timeout = setTimeout(() => {
      fetchPrayerTimes();
      updateTanggal();

      // Setelah pertama kali, jalankan setiap 24 jam
      const interval = setInterval(() => {
        fetchPrayerTimes();
        updateTanggal();
      }, 24 * 60 * 60 * 1000);

      return () => clearInterval(interval);
    }, timeUntilMidnight);

    // Cleanup saat komponen unmount
    return () => {
      clearTimeout(timeout);
    };
  }, [fetchPrayerTimes, updateTanggal]);
}

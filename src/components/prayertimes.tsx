'use client'

import { useEffect, useState } from "react";
import { Card } from "./ui/card"

// Define interfaces
interface PrayerTime {
  [key: string]: string;
}

interface ApiResponse {
  data: {
    jadwal: {
      imsak: string;
      subuh: string;
      dzuhur: string;
      ashar: string;
      maghrib: string;
      isya: string;
      tanggal: string;
    }
  }
}

const PrayerTimes = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime>({});
  const [date, setDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {        
        setIsLoading(true);

        const now = new Date();
        const formattedDate = now.getFullYear() + '/' + 
                     String(now.getMonth() + 1).padStart(2, '0') + '/' + 
                     String(now.getDate()).padStart(2, '0');
        const response = await fetch(`https://api.myquran.com/v2/sholat/jadwal/1204/${formattedDate}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: ApiResponse = await response.json();
        const times = data.data.jadwal;
        
        setPrayerTimes({
          Imsyak: times.imsak,
          Subuh: times.subuh,
          Dzuhur: times.dzuhur,
          Ashar: times.ashar,
          Maghrib: times.maghrib,
          Isya: times.isya,
        });
        
        setDate(times.tanggal);
      } catch (error) {
        console.error('Error fetching prayer times:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrayerTimes();
  }, []);

  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }
  
  return (
    <div className="p-4">
      <h2 className="text-center text-xl font-bold mb-4">
        <p>Jadwal Sholat Kabupaten Bogor</p>
        <p>{date}</p>
      </h2>
      <div className="w-full px-4 flex justify-center">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 max-w-screen-md w-full">
          {Object.entries(prayerTimes).map(([prayer, time]: [string, string]) => (
            <Card key={prayer} className="flex flex-col gap-2 border p-4 bg-white shadow rounded text-center">
              <h3 className="font-semibold">{prayer}</h3>
              <p className="text-lg font-bold">{time}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PrayerTimes;

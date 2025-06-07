'use client'
import Clock from 'react-clock';
import '@/styles/clock.css';
import DashboardSlider from "@/components/dashboardslider";
import { ReactNode, useEffect, useState } from "react";
import { FaCloud, FaCloudSun, FaMoon, FaRegClock, FaRegMoon, FaSun } from "react-icons/fa";
import useMidnightFetch from "./useMidnightFetch";

// Define interfaces
interface PrayerTime {
  name: string;
  time: string;
  icon: ReactNode;
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

export default function Dashboard() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState(new Date());
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  
  const [tanggal, setTanggal] = useState('');
  const [countdown, setCountdown] = useState("");
  const [nextPrayer, setNextPrayer] = useState("");

  const updateTanggal = () => {
    setTanggal(generateIslamicDate())
  }

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
      
      setPrayerTimes([
        { name: "Imsyak", time: times.imsak, icon: <FaRegMoon /> },
        { name: "Subuh", time: times.subuh, icon: <FaRegMoon /> },
        { name: "Dzuhur", time: times.dzuhur, icon: <FaSun /> },
        { name: "Ashar", time: times.ashar, icon: <FaCloudSun /> },
        { name: "Maghrib", time: times.maghrib, icon: <FaCloud /> },
        { name: "Isya", time: times.isya, icon: <FaMoon /> },          
      ]);
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // reload waktu sholat jam 12 malam
  useMidnightFetch({fetchPrayerTimes, updateTanggal});

  // untuk jam
  useEffect(() => {
    const interval = setInterval(() => setValue(new Date()), 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);
  
  useEffect(() => {
    document.documentElement.requestFullscreen();
    setLoading(false);        
    
    fetchPrayerTimes();
    updateTanggal();
  }, []); 

  // Update currentIndex setelah prayerTimes tersedia
  useEffect(() => {
    if (prayerTimes.length === 0) return;
    const updateActiveIndex = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes(); // Total menit saat ini

      let activeIndex = null;
      for (let i = 0; i < prayerTimes.length; i++) {
        const [hour, minute] = prayerTimes[i].time.split(":").map(Number);
        const prayerMinutes = hour * 60 + minute;

        if (currentMinutes >= prayerMinutes) {
          activeIndex = i;
        } else {
          break;
        }
      }

      setCurrentIndex(activeIndex);
    };

    updateActiveIndex(); // Jalankan sekali saat mount

    const interval = setInterval(updateActiveIndex, 1000 * 30); // Update setiap 30 detik

    return () => clearInterval(interval); // Cleanup interval saat unmount
  }, [prayerTimes]);

  // cari waktu sholat berikutnya
  useEffect(() => {
    if (prayerTimes.length === 0) return;
    function updateCountdown() {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes(); // Waktu saat ini dalam menit
      
      // Cari waktu sholat berikutnya
      const next = prayerTimes.find(pt => {
        const [h, m] = pt.time.split(":").map(Number);
        return h * 60 + m > currentTime;
      }) || prayerTimes[0]; // Jika tidak ada, ambil sholat pertama (besok)

      setNextPrayer(next.name);

      // Hitung selisih waktu dalam detik
      const [h, m] = next.time.split(":").map(Number);
      const targetTime = new Date();
      targetTime.setHours(h, m, 0, 0);

      if (targetTime < now) targetTime.setDate(targetTime.getDate() + 1);

      const diffSeconds = Math.floor((targetTime.getTime() - now.getTime()) / 1000);

      // Update countdown
      setCountdown(formatTime(diffSeconds));
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000); // Update setiap detik
    return () => clearInterval(interval);
  }, [prayerTimes]);

  function formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  if (loading) {
    return (
      <div className="w-screen h-screen flex">
        <p>Loading...</p>
      </div>
    );
  }

  function generateIslamicDate() {
    const now = new Date();
  
    // Format tanggal Masehi
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
    const masehiDate = now.toLocaleDateString('id-ID', options);
  
    // Konversi ke Hijriyah (menggunakan Intl.DateTimeFormat)
    const hijriDate = new Intl.DateTimeFormat('id-ID-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(now);
  
    return `${masehiDate} / ${hijriDate}`;
  }
  
  return (
    <div className="w-screen h-screen flex">
      {/* Kolom Kiri: Waktu Sholat */}
      <div className="w-1/4 bg-gradient-to-b flex flex-col justify-center items-center relative">
        
        {/* Background Atas */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-green-700"></div>
        
        {/* Background Bawah */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-yellow-900"></div>

        <div className="flex flex-col justify-center items-center bg-gradient-to-b from-blue-900 to-blue-400 text-white p-6 w-full h-full shadow-xl rounded-r-3xl relative">        
          <ul className="text-2xl space-y-6 w-full text-center flex flex-col justify-center h-full">
            {prayerTimes.map((prayer, index) => (
              <li
                key={index}
                className={`p-2 rounded-lg transition-all duration-300 shadow-lg flex items-center bg-opacity-50 ${
                  index === currentIndex ? "bg-yellow-400 text-black font-bold scale-105" : "bg-white text-blue-900"
                }`}
              >
                {/* Icon tetap di kiri */}
                <span className="text-6xl mr-4">{prayer.icon}</span>

                {/* Nama dan Jam dalam 2 baris */}
                <div className="flex flex-col text-left">
                  <span className="text-3xl">{prayer.name}</span>
                  <span className="text-4xl font-semibold">{prayer.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Kolom Kanan: Header, Slider, Running Text */}
      <div className="w-3/4 flex flex-col bg-gray-100">
        {/* Header dengan Logo */}
        <header className="h-35 text-white flex flex-col">
          <div className="flex bg-green-700 items-center justify-end h-25">
            <div>
              <h1 className="text-4xl font-bold" onClick={toggleFullScreen}>
                <span className="text-yellow-400">Masjid</span> Abi Musa Al-Asy&apos;ari
              </h1>
              <p className="text-1xl">Citra Indah Cluster Bukit Cendana, Kec. Jonggol Kab. Bogor 16830</p>
            </div>
            <img src="/images/favicon.ico" alt="Logo Masjid" className="h-35 ml-4 order-2" />
          </div>
          <div className="flex items-center justify-end p-5 h-10 bg-gradient-to-r from-blue-900 to-blue-400 text-xl">
            {tanggal}
          </div>
        </header>


        {/* Image Slider */}
        <div className="flex-1 flex items-center justify-center relative">
          <div className="absolute top-2/6 left-0 transform -translate-x-3/6 z-10">
            <Clock 
              value={value} 
              size={180}
              hourHandWidth={8}
              minuteHandWidth={8}
              secondHandWidth={5}
              renderNumbers={true}
            />
          </div>
          <DashboardSlider effect="fade"/>
          <div className="absolute bottom-5 right-10 rounded-lg bg-white shadow-lg text-blue-900 text-3xl">
            <div className="flex justify-center items-center">
              <div className="h-full w-full flex items-center justify-center bg-blue-700 p-1 rounded-l-lg">
                <FaRegClock color="white" className="w-12 h-12" />
              </div>            
              <div className="p-2">
                <span className="mr-2">{nextPrayer}</span><span className="font-bold">-{countdown}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Running Text */}
        <footer className="h-14 bg-yellow-900 text-white font-bold flex items-center px-4 overflow-hidden text-2xl">
          <div className="w-full h-full relative flex">
            <div 
              className="animate-marquee flex whitespace-nowrap" 
              style={{ animationDuration: `25s` }}
            >
              <span className="flex items-center">
                Mohon jaga kebersihan masjid<span className="m-5 text-xl">•</span>
              </span>
              <span className="flex items-center">
                Matikan HP atau ubah ke mode silent sebelum sholat<span className="m-5 text-xl">•</span>
              </span>
              <span className="flex items-center">
                Infaq dan sedekah bisa disalurkan melalui kotak amal
              </span>

            </div>
          </div>
        </footer>

        <style jsx>{`
          @keyframes marquee {
            from { transform: translateX(100%); }
            to { transform: translateX(-100%); }
          }
          .animate-marquee {
            display: flex;
            white-space: nowrap;
            animation: marquee linear infinite;
            min-width: 170%;
          }
        `}</style>
      </div>
    </div>
  );
}
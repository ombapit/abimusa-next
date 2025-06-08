import ListBerita from '@/components/berita/listBerita';
import Footer from '@/components/footer';
import ImageSlider from '@/components/imageslider';
import PrayerTimes from '@/components/prayertimes';

export default function Home() {
  return (
    <>
    {/* Image Slider */}
    <ImageSlider/>

    {/* Prayer Times */}
    <PrayerTimes/>    
    
    <ListBerita/>

    <Footer/>
    </>
  );
}

"use client";

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react'; // Pastikan Anda sudah install lucide-react

export default function LandingPage() {
  // Ref untuk menunjuk ke section "Fitur-Fitur Kami"
  const featuresRef = useRef<HTMLElement>(null);

  // Fungsi untuk melakukan scroll dengan halus
  const handleScrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-white text-gray-800">
      
      {/* 1. Hero Section */}
      <section className="text-center py-20 px-4">
        <div className="container mx-auto">
          <h1 className="text-[#3D74EA] md:text-6xl font-bold mb-4 max-w-4xl mx-auto">
            Kelola kontrak lebih rapi, efisien, dan aman.
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Dari drafting hingga perpanjangan, jawah serahkan pada IContract. Memudahkan tim legal dan bisnis mengelola kontrak tanpa repot. Lebih cepat, lebih presisi, dan didukung AI Cerdas.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="lg" className="text-[#3D74EA] hover:text-blue-700 rounded-xl" onClick={handleScrollToFeatures}>
              Pelajari lebih lanjut
            </Button>
            <Link href="/login" passHref>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                Coba sekarang
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Section "Kelola Kontrak Anda" */}
      <section ref={featuresRef} className="py-20 px-4 text-center">
        <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Kelola kontrak-kontrak Anda</h2>
            {/* Placeholder untuk gambar besar di bawah judul */}
            <div className="relative w-full max-w-4xl h- md:h-96 mx-auto mt-12 mb-4 flex items-center justify-center">
                <Image 
                  src="/images/Paper Scattered.png"
                  alt="Ilustrasi Tumpukan Kontrak"
                  fill
                  className="object-contain"
                />
            </div>
        </div>
      </section>

      {/* 3. Section "Fitur-Fitur Kami" */}
      <section className="pb-20 px-4 text-center">
        <div className="container mx-auto">
            <p className="text-gray-600 text-4xl font-bold">dengan</p>
            <h2 className="text-[#3D74EA] text-3xl md:text-6xl font-bold mt-12 mb-12">Fitur-Fitur Kami</h2>
            <div className="grid md:grid-cols-3 gap-8">
              
              {/* Fitur Card: Buat Kontrak */}
              <div className="p-6">
                <div className="relative h-60 w-full mb-4flex items-center justify-center">
                    <Image src="/images/Group 27.png" alt="AI Legal Review" fill className="object-contain" />
                </div>
              </div>

              {/* Fitur Card: Lifecycle Kontrak */}
              <div className="p-6">
                <div className="relative h-60 w-full mb-4flex items-center justify-center">
                    <Image src="/images/Group 28.png" alt="AI Legal Review" fill className="object-contain" />
                </div>
              </div>

              {/* Fitur Card: AI Legal Review */}
              <div className="p-6">
                <div className="relative h-60 w-full mb-4flex items-center justify-center">
                    <Image src="/images/Group 29.png" alt="AI Legal Review" fill className="object-contain" />
                </div>
              </div>
            </div>
        </div>
      </section>

       {/* 4. Section Galeri/Manfaat */}
       <section className="pb-20 px-4 text-center">
          <div className="container mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-12">untuk pengelolaan kontrak yang lebih rapi!</h2>
              <div className="relative w-full max-w-4xl h-64 md:h-96 mx-auto my-12 flex items-center justify-center">
                <Image 
                  src="/images/image 6.png"
                  alt="Ilustrasi Tumpukan Kontrak"
                  fill
                  className="object-contain"
                />
            </div>
          </div>
      </section>

      {/* 5. Final Call to Action */}
      <section className="pb-20 px-4 text-center">
          <div className="container mx-auto">
              <Link href="/login" passHref>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                      Coba sekarang
                      <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
              </Link>
          </div>
      </section>

    </div>
  );
}

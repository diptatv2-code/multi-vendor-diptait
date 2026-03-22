'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    title: 'Mega Sale — Up to 70% OFF',
    subtitle: 'Best deals on Electronics, Fashion, Beauty & more',
    cta: 'Shop Now',
    href: '/products',
    bg: 'from-[#F57224] to-[#ff9a5c]',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=500&fit=crop',
  },
  {
    title: 'New Arrivals — Latest Trends',
    subtitle: '80+ products from top Bangladesh vendors',
    cta: 'Explore Now',
    href: '/products?sort=newest',
    bg: 'from-[#6C3CE1] to-[#9b6cf7]',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=500&fit=crop',
  },
  {
    title: 'Free Delivery on ৳2,000+',
    subtitle: 'Cash on Delivery available all over Bangladesh',
    cta: 'Start Shopping',
    href: '/products',
    bg: 'from-[#00b894] to-[#55efc4]',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=500&fit=crop',
  },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <div className="relative rounded-2xl overflow-hidden min-h-[300px] md:min-h-[380px]">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image src={slide.image} alt="" fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 66vw"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} unoptimized />
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.bg} opacity-70`} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center h-full p-8 md:p-14 text-white min-h-[300px] md:min-h-[380px]">
        <p className="text-xs md:text-sm font-semibold uppercase tracking-widest opacity-80 mb-3">Limited Time Offer</p>
        <h2 className="text-3xl md:text-5xl font-extrabold mb-3 leading-tight max-w-lg">{slide.title}</h2>
        <p className="text-base md:text-lg text-white/80 mb-6 max-w-md">{slide.subtitle}</p>
        <Link href={slide.href} className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-7 py-3 rounded-xl hover:bg-gray-100 transition-colors w-fit text-sm md:text-base shadow-lg">
          {slide.cta} <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Arrows */}
      <button onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40 transition-colors">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={() => setCurrent((c) => (c + 1) % slides.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40 transition-colors">
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? 'bg-white w-8' : 'bg-white/40'}`} />
        ))}
      </div>
    </div>
  );
}

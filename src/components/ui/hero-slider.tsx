'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    label: 'Save up to ৳5,000',
    title: 'Laptop Savings',
    subtitle: 'Performance Meets Design',
    cta: 'Shop Electronics',
    href: '/products?category=electronics',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=500&fit=crop',
  },
  {
    label: 'New Collection',
    title: 'Fashion Collection',
    subtitle: 'Comfortable, Confident Fit',
    cta: 'Shop Fashion',
    href: '/products?category=fashion',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=500&fit=crop',
  },
  {
    label: 'Small Kitchen Appliances',
    title: 'Home Appliances',
    subtitle: 'On Sale — Free Delivery on ৳2,000+',
    cta: 'Shop Home',
    href: '/products?category=home-kitchen',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=500&fit=crop',
  },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <div className="relative rounded-xl overflow-hidden bg-[#F5F5F7] dark:bg-[#1A1A1A]">
      <div className="flex items-center min-h-[280px] md:min-h-[400px]">
        {/* Text */}
        <div className="relative z-10 w-full md:w-1/2 p-8 md:p-14">
          <p className="text-xs md:text-sm font-medium text-[#F57224] uppercase tracking-wider mb-2">{slide.label}</p>
          <h2 className="text-3xl md:text-5xl font-bold text-[#1D1D1F] dark:text-white leading-tight mb-2">{slide.title}</h2>
          <p className="text-base md:text-lg text-[#86868B] mb-6">{slide.subtitle}</p>
          <Link href={slide.href}
            className="inline-flex items-center gap-2 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] font-medium px-6 py-3 rounded-full text-sm hover:bg-[#333] dark:hover:bg-[#E8E8E8] transition-colors">
            {slide.cta} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {/* Image */}
        <div className="hidden md:block w-1/2 h-full absolute right-0 top-0 bottom-0">
          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#F5F5F7] dark:from-[#1A1A1A] via-[#F5F5F7]/50 dark:via-[#1A1A1A]/50 to-transparent" />
        </div>
      </div>

      {/* Navigation */}
      <button onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 dark:bg-[#222]/80 flex items-center justify-center hover:bg-white dark:hover:bg-[#333] transition-colors shadow-sm">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={() => setCurrent((c) => (c + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 dark:bg-[#222]/80 flex items-center justify-center hover:bg-white dark:hover:bg-[#333] transition-colors shadow-sm">
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${i === current ? 'w-6 bg-[#1D1D1F] dark:bg-white' : 'w-1.5 bg-[#1D1D1F]/20 dark:bg-white/30'}`} />
        ))}
      </div>
    </div>
  );
}

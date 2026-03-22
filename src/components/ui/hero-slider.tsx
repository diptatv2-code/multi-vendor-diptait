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
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=400&fit=crop',
    bg: '#E8ECF0',
  },
  {
    label: 'New Collection',
    title: 'Fashion Collection',
    subtitle: 'Comfortable, Confident Fit',
    cta: 'Shop Fashion',
    href: '/products?category=fashion',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=400&fit=crop',
    bg: '#F0E8E3',
  },
  {
    label: 'Small Kitchen Appliances',
    title: 'Home Appliances',
    subtitle: 'On Sale — Free Delivery on ৳2,000+',
    cta: 'Shop Home',
    href: '/products?category=home-kitchen',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop',
    bg: '#E3EDE8',
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
    <div className="relative rounded-xl overflow-hidden" style={{ backgroundColor: slide.bg }}>
      {/* Mobile: stacked layout. Desktop: side-by-side */}
      <div className="flex flex-col md:flex-row items-center min-h-[260px] md:min-h-[400px]">

        {/* Text — always visible */}
        <div className="relative z-10 w-full md:w-1/2 p-6 md:p-14 order-2 md:order-1">
          <p className="text-xs font-semibold text-[#F57224] uppercase tracking-wider mb-1">{slide.label}</p>
          <h2 className="text-2xl md:text-5xl font-bold text-[#1D1D1F] leading-tight mb-1 md:mb-2">{slide.title}</h2>
          <p className="text-sm md:text-lg text-[#86868B] mb-4 md:mb-6">{slide.subtitle}</p>
          <Link href={slide.href}
            className="inline-flex items-center gap-2 bg-[#1D1D1F] text-white font-medium px-5 py-2.5 md:px-6 md:py-3 rounded-full text-sm hover:bg-[#333] transition-colors">
            {slide.cta} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Image — visible on ALL screens */}
        <div className="w-full md:w-1/2 h-40 md:h-full md:absolute md:right-0 md:top-0 md:bottom-0 order-1 md:order-2">
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
            loading="eager"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          {/* Fade on desktop only */}
          <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[var(--slide-bg)] via-[var(--slide-bg)]/40 to-transparent"
            style={{ '--slide-bg': slide.bg } as React.CSSProperties} />
        </div>
      </div>

      {/* Arrows */}
      <button onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center hover:bg-white shadow-sm">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button onClick={() => setCurrent((c) => (c + 1) % slides.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center hover:bg-white shadow-sm">
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${i === current ? 'w-5 bg-[#1D1D1F]' : 'w-1.5 bg-[#1D1D1F]/20'}`} />
        ))}
      </div>
    </div>
  );
}

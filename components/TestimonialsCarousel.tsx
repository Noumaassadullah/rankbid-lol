'use client';

import { useState, useEffect } from 'react';

interface Testimonial {
  name: string;
  handle: string;
  text: string;
}

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
}

export default function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div className="min-h-[300px] flex flex-col justify-center p-8 border border-gray-200 bg-white rounded-lg shadow-sm">
        <div className="mb-6">
          <p className="text-lg text-[#1F2937] leading-relaxed mb-6 italic">"{currentTestimonial.text}"</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0F3460]/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-[#0F3460]">
                {currentTestimonial.name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-semibold text-sm text-[#1F2937]">{currentTestimonial.name}</p>
              <p className="text-xs text-[#1F2937]/60">{currentTestimonial.handle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={goToPrevious}
          className="p-2 border border-gray-300 rounded-lg hover:bg-[#0F3460] hover:text-white hover:border-[#0F3460] text-[#1F2937] transition-all"
          aria-label="Previous testimonial"
        >
          ←
        </button>

        {/* Dots Indicator */}
        <div className="flex gap-2">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex
                  ? 'bg-[#0F3460] w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to testimonial ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={goToNext}
          className="p-2 border border-gray-300 rounded-lg hover:bg-[#0F3460] hover:text-white hover:border-[#0F3460] text-[#1F2937] transition-all"
          aria-label="Next testimonial"
        >
          →
        </button>
      </div>

      {/* Counter */}
      <div className="text-center mt-4 text-xs text-[#1F2937]/60">
        {currentIndex + 1} of {testimonials.length}
      </div>
    </div>
  );
}

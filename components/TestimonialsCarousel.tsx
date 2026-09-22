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
  const itemsPerSlide = 3;
  const totalSlides = Math.ceil(testimonials.length / itemsPerSlide);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 6000); // Change every 6 seconds

    return () => clearInterval(interval);
  }, [totalSlides]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const visibleTestimonials = testimonials.slice(
    currentIndex * itemsPerSlide,
    (currentIndex + 1) * itemsPerSlide
  );

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div className="overflow-hidden">
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-500"
        >
          {visibleTestimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="p-6 border border-gray-200 bg-white rounded-lg shadow-sm hover:shadow-md hover:border-[#0F3460]/20 transition-all duration-200"
            >
              <p className="text-sm text-[#1F2937] leading-relaxed mb-4 italic">
                "{testimonial.text}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <div className="w-10 h-10 rounded-full bg-[#0F3460]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-[#0F3460]">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-[#1F2937]">{testimonial.name}</p>
                  <p className="text-xs text-[#1F2937]/60">{testimonial.handle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={goToPrevious}
          className="p-2 border border-gray-300 rounded-lg hover:bg-[#0F3460] hover:text-white hover:border-[#0F3460] text-[#1F2937] transition-all"
          aria-label="Previous testimonials"
        >
          ←
        </button>

        {/* Dots Indicator */}
        <div className="flex gap-2">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex
                  ? 'bg-[#0F3460] w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={goToNext}
          className="p-2 border border-gray-300 rounded-lg hover:bg-[#0F3460] hover:text-white hover:border-[#0F3460] text-[#1F2937] transition-all"
          aria-label="Next testimonials"
        >
          →
        </button>
      </div>

      {/* Counter */}
      <div className="text-center mt-4 text-xs text-[#1F2937]/60">
        Slide {currentIndex + 1} of {totalSlides}
      </div>
    </div>
  );
}

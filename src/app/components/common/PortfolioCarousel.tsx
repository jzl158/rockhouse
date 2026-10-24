"use client";
import { useEffect, useState } from "react";

type PortfolioItem = {
  image: string;
  title: string;
  category: string;
  categoryColor: string;
};

interface PortfolioCarouselProps {
  items: PortfolioItem[];
}

export default function PortfolioCarousel({ items }: PortfolioCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance every 2.5 seconds, pause when there are no items
  useEffect(() => {
    if (!items || items.length === 0) return;
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    }, 2500);
    return () => clearInterval(id);
  }, [items]);

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative mt-8 w-full aspect-[21/9]">
      {items.map((item, index) => (
        <div
          key={index}
          className="absolute top-0 left-0 w-full h-full transition-opacity duration-500"
          style={{
            opacity: index === currentIndex ? 1 : 0,
          }}
        >
          {/* Image Container */}
          <div className="relative w-full h-full bg-gray-100">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover object-center"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <i className="fas fa-search-plus text-white text-3xl"></i>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <button
        onClick={prevImage}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-[#F7D566] hover:opacity-90 focus:outline-none"
        aria-label="Previous image"
      >
        <span className="text-lg">←</span>
      </button>
      <button
        onClick={nextImage}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-[#F7D566] hover:opacity-90 focus:outline-none"
        aria-label="Next image"
      >
        <span className="text-lg">→</span>
      </button>
    </div>
  );
}

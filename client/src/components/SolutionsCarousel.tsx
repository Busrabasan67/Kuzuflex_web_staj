import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface Solution {
  id: number;
  slug: string;
  title: string;
  description: string;
  imageUrl?: string;
  order: number;
}

interface SolutionsCarouselProps {
  solutions: Solution[];
}

const SolutionsCarousel: React.FC<SolutionsCarouselProps> = ({ solutions }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-scroll effect
  useEffect(() => {
    if (isPaused || isHovered) return;

    intervalRef.current = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % solutions.length);
    }, 5000); // 5 seconds interval for better UX

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, isHovered, solutions.length]);

  // Scroll to active card
  useEffect(() => {
    if (carouselRef.current) {
      const card = carouselRef.current.children[activeIndex] as HTMLElement;
      if (card) {
        const containerWidth = carouselRef.current.clientWidth;
        const cardWidth = card.offsetWidth;
        const cardLeft = card.offsetLeft;
        const scrollPosition = cardLeft - (containerWidth / 2) + (cardWidth / 2);
        
        carouselRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [activeIndex]);

  const handleCardClick = (index: number) => {
    setActiveIndex(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 8000); // Longer pause after click
  };

  const handleCardHover = (index: number) => {
    setIsHovered(true);
    setIsPaused(true);
    setActiveIndex(index);
  };

  const handleCardLeave = () => {
    setIsHovered(false);
    setTimeout(() => setIsPaused(false), 2000);
  };

  const handleExploreClick = (solution: Solution) => {
    navigate(`/solutions/${solution.slug}`);
  };

  if (!solutions || solutions.length === 0) {
    return null;
  }

  return (
    <section className="py-20 overflow-hidden bg-gradient-to-b from-gray-50 to-white relative">
      {/* Top Section Divider */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-700/30 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
              {t('pages.home.solutions.title')}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('pages.home.solutions.subtitle')}
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Carousel */}
          <div 
            ref={carouselRef}
            className="flex gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-8"
            style={{ 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {solutions.map((solution, index) => {
              const isActive = index === activeIndex;
              const distance = Math.abs(index - activeIndex);
              const scale = 1 - (distance * 0.1); // More gradual scaling
              const opacity = 1 - (distance * 0.3); // Gradual opacity change
              const zIndex = solutions.length - distance; // Better z-index handling

              return (
                <div
                  key={solution.id}
                  className={`relative flex-shrink-0 snap-center transition-all duration-700 ease-[cubic-bezier(0.33,1,0.68,1)] ${
                    isActive ? 'cursor-default' : 'cursor-pointer'
                  }`}
                  style={{
                    width: isActive ? '28rem' : '24rem',
                    height: isActive ? '28rem' : '24rem',
                    transform: `scale(${scale})`,
                    opacity: opacity,
                    zIndex: zIndex
                  }}
                  onClick={() => handleCardClick(index)}
                  onMouseEnter={() => handleCardHover(index)}
                  onMouseLeave={handleCardLeave}
                >
                  {/* Card */}
                  <div className={`w-full h-full relative rounded-3xl overflow-hidden ${
                    isActive ? 'shadow-2xl' : 'shadow-lg hover:shadow-xl'
                  }`}>
                    {/* Background Image */}
                    <div className="w-full h-full relative">
                      {solution.imageUrl ? (
                        <img
                          src={solution.imageUrl.startsWith('http') ? solution.imageUrl : `http://localhost:5000${solution.imageUrl}`}
                          alt={solution.title}
                          className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                          <span className="text-white text-6xl font-bold">{solution.title.charAt(0)}</span>
                        </div>
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-1000 ease-out"></div>
                    </div>

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                      <div className={`transition-all duration-700 ease-[cubic-bezier(0.33,1,0.68,1)] ${
                        isActive ? 'translate-y-0' : 'translate-y-4'
                      }`}>
                        <h3 className={`font-bold mb-3 transition-all duration-700 ${
                          isActive ? 'text-2xl' : 'text-xl'
                        }`}>
                          {solution.title}
                        </h3>
                        <p className={`mb-6 transition-all duration-700 ${
                          isActive ? 'text-base opacity-90' : 'text-sm opacity-70'
                        }`}>
                          {solution.description || t('pages.home.solutions.defaultDescription')}
                        </p>
                        
                        {/* CTA Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExploreClick(solution);
                          }}
                                                     className={`bg-white text-blue-700 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                             isActive 
                               ? 'opacity-100 hover:bg-blue-50 hover:scale-105' 
                               : 'opacity-0 translate-y-2'
                           }`}
                        >
                          {t('pages.home.solutions.exploreButton')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows - Centered */}
          <div className="flex justify-center items-center mt-10 space-x-8">
                         {/* Left Arrow */}
             <button
               onClick={() => {
                 const newIndex = activeIndex === 0 ? solutions.length - 1 : activeIndex - 1;
                 setActiveIndex(newIndex);
                 setIsPaused(true);
                 setTimeout(() => setIsPaused(false), 3000);
               }}
               className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white hover:scale-110 flex items-center justify-center text-blue-700 hover:text-blue-800 border border-gray-200"
               aria-label="Previous solution"
             >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

                         {/* Right Arrow */}
             <button
               onClick={() => {
                 const newIndex = (activeIndex + 1) % solutions.length;
                 setActiveIndex(newIndex);
                 setIsPaused(true);
                 setTimeout(() => setIsPaused(false), 3000);
               }}
               className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white hover:scale-110 flex items-center justify-center text-blue-700 hover:text-blue-800 border border-gray-200"
               aria-label="Next solution"
             >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>




      </div>

      {/* Bottom Section Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-700/30 to-transparent"></div>
    </section>
  );
};

export default SolutionsCarousel;
// client/src/components/HeroSection.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
      {/* Background */}
      <div className="absolute inset-0">
        {/* Video */}
        {!videoError && (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
            onLoadStart={() => setVideoLoaded(false)}
            onCanPlay={() => setVideoLoaded(true)}
            onError={() => setVideoError(true)}
            onLoadedData={() => setVideoLoaded(true)}
          >
            <source src="http://localhost:5000/uploads/Videos/hero-video.mp4" type="video/mp4" />
          </video>
        )}

        {/* Fallback gradient */}
        {(videoError || !videoLoaded) && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900"></div>
        )}

        {/* Loading indicator */}
        {!videoLoaded && !videoError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/50 backdrop-blur-sm">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4" />
            <p className="text-lg font-semibold">{t('pages.home.hero.loading')}</p>
          </div>
        )}

        {/* Video error message */}
        {videoError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4 bg-black/50 backdrop-blur-sm">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.66 1.73-2.5L13.73 4c-.77-.83-1.96-.83-2.73 0L3.34 16.5c-.77.84.19 2.5 1.73 2.5z" />
              </svg>
            </div>
            <p className="text-lg font-semibold">{t('pages.home.hero.error')}</p>
            <p className="text-sm text-blue-200">{t('pages.home.hero.fallback')}</p>
          </div>
        )}

        {/* Overlay - Minimal for text readability only */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-black/10" />
      </div>

      {/* Content - Okuma.com tarzı */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                        <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-blue-200 via-blue-100 to-white bg-clip-text text-transparent drop-shadow-2xl animate-fade-in">
          KUZUFLEX
        </h1>

        <p className="text-2xl md:text-3xl font-light mb-6 text-white drop-shadow-lg animate-fade-in-delay-1">
          {t('pages.home.hero.tagline')}
        </p>

        <p className="text-lg md:text-xl text-blue-100 mb-12 leading-relaxed drop-shadow-md max-w-4xl mx-auto animate-fade-in-delay-2">
          {t('pages.home.hero.description')}
        </p>

        {/* Buttons - Okuma.com tarzı */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button 
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            className="bg-blue-700 text-white px-10 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:bg-blue-800"
          >
            {t('pages.home.hero.discoverButton')}
          </button>
          <button 
            onClick={() => window.location.href = '/contact'}
            className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-10 py-4 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
          >
            {t('pages.home.hero.contactButton')}
          </button>
        </div>
      </div>

      {/* Scroll indicator - Okuma.com tarzı */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
        <div className="w-6 h-10 border-2 border-blue-200/60 rounded-full flex justify-center bg-blue-950/20 backdrop-blur-sm hover:bg-blue-950/40 transition-colors duration-300">
          <div className="w-1 h-3 bg-blue-200 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

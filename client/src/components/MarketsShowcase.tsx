// client/src/components/MarketsShowcase.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface Market {
  id: number;
  slug: string;
  title: string;
  description: string;
  imageUrl?: string;
  order: number;
}

interface MarketsShowcaseProps {
  markets: Market[];
}

const MarketsShowcase: React.FC<MarketsShowcaseProps> = ({ markets }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  // Dil değişimini dinle
  useEffect(() => {
    // Dil değiştiğinde component yeniden render olacak
  }, [i18n.language]);

  const handleMarketClick = (market: Market) => {
    navigate(`/markets/${market.slug}`);
  };



  if (!markets || markets.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-br from-okuma-gray-50 to-okuma-50">
      <div className="max-w-7xl mx-auto px-6">
                 {/* Enhanced Section Header - Okuma.com tarzı */}
         <div className="text-center mb-20">
           {/* Removed building icon */}
           <h2 className="text-5xl md:text-6xl font-bold text-okuma-gray-900 mb-6">
             <span className="bg-gradient-to-r from-okuma-600 via-okuma-500 to-okuma-700 bg-clip-text text-transparent">
               {t('markets.title', 'MARKETS')}
             </span>
           </h2>
           <p className="text-xl text-okuma-gray-600 max-w-3xl mx-auto leading-relaxed">
             {t('markets.subtitle', 'Discover our innovative solutions across diverse markets and applications')}
           </p>
           <div className="flex items-center justify-center mt-8">
             <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-okuma-400 to-transparent"></div>
             <div className="w-3 h-3 bg-okuma-500 rounded-full mx-4"></div>
             <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-okuma-400 to-transparent"></div>
           </div>
         </div>

                 {/* Markets Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center mx-auto">
           {/* Title Card - KUZUFLEX MARKETS - Okuma.com tarzı */}
           <div className="bg-white shadow-okuma-lg rounded-2xl flex flex-col items-center justify-center text-center w-full max-w-sm h-80 border border-okuma-gray-100">
             <h3 className="text-okuma-gray-500 text-sm font-medium mb-2">KUZUFLEX</h3>
             <h2 className="text-3xl font-bold text-okuma-600">
               {i18n.language === 'tr' ? 'PAZARLAR' : 
                i18n.language === 'fr' ? 'MARCHÉS' : 
                i18n.language === 'de' ? 'MÄRKTE' : 'MARKETS'}
             </h2>
           </div>
           
           {/* Market Cards - Okuma.com tarzı */}
           {markets.slice(0, 5).map((market, index) => (
             <div
               key={market.id}
               className="group relative bg-white shadow-okuma hover:shadow-okuma-lg transition-all duration-500 transform hover:-translate-y-2 overflow-hidden cursor-pointer w-full max-w-sm rounded-2xl h-80 border border-okuma-gray-100"
               onClick={() => handleMarketClick(market)}
             >
               {/* Image Container - Fixed Height */}
               <div className="relative h-64 w-full overflow-hidden">
                 {market.imageUrl ? (
                   <img
                     src={market.imageUrl.startsWith('http') ? market.imageUrl : `http://localhost:5000/${market.imageUrl.startsWith('/') ? market.imageUrl.slice(1) : market.imageUrl}`}
                     alt={market.title}
                     className="w-full h-[300px] object-cover transition-transform duration-300 group-hover:scale-110"
                     onError={(e) => {
                       console.log('❌ Resim yüklenemedi:', market.imageUrl);
                       const target = e.target as HTMLImageElement;
                       target.style.display = 'none';
                       target.nextElementSibling?.classList.remove('hidden');
                     }}
                     onLoad={() => {
                       console.log('✅ Resim başarıyla yüklendi:', market.imageUrl);
                     }}
                   />
                 ) : null}
                 
                 {/* Fallback Gradient Background - Okuma.com tarzı */}
                 <div className={`w-full h-full bg-gradient-to-br from-okuma-600 via-okuma-500 to-okuma-700 flex items-center justify-center ${market.imageUrl ? 'hidden' : ''}`}>
                   <div className="text-center text-white">
                     <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 mx-auto backdrop-blur-sm">
                       <span className="text-2xl font-bold">{market.title.charAt(0)}</span>
                     </div>
                     <p className="text-sm font-medium opacity-90">{market.title}</p>
                   </div>
                 </div>
                 
                 {/* Hover Overlay with Description - Okuma.com tarzı */}
                 <div className="absolute inset-0 bg-okuma-950 bg-opacity-80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white p-6">
                   <p className="text-sm text-center font-medium">
                     {market.description || t('markets.defaultDescription', 'Innovative solutions for this market')}
                   </p>
                 </div>
                 
                 {/* Order Badge - Removed */}
                 
                 {/* Top Left Corner Accent - Okuma.com tarzı */}
                 <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-okuma-500/20 to-transparent"></div>
               </div>

               {/* Title Below Card - Outside the card - Okuma.com tarzı */}
               <div className="mt-4 text-center">
                 <div className="flex items-center justify-center text-okuma-600 font-semibold">
                   <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                   </svg>
                   {market.title}
                 </div>
               </div>

               {/* Enhanced Hover Effect Border - Okuma.com tarzı */}
               <div className="absolute inset-0 border-2 border-transparent group-hover:border-okuma-500/60 transition-all duration-500 shadow-[0_0_30px_rgba(99,102,241,0.3)] group-hover:shadow-[0_0_40px_rgba(99,102,241,0.4)]"></div>
             </div>
           ))}
         </div>

                 {/* View All Button - Okuma.com tarzı */}
         <div className="text-center mt-12">
           <button className="bg-okuma-600 text-white px-10 py-4 text-lg font-semibold rounded-xl shadow-okuma-lg hover:shadow-okuma transition-all duration-300 transform hover:scale-105 hover:bg-okuma-700">
             {t('markets.viewAll', 'View All Markets')}
           </button>
         </div>
      </div>
    </section>
  );
};

export default MarketsShowcase;

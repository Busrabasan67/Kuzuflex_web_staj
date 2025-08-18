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
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative">
        {/* Top Section Divider */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-700/30 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-6">
                
         <div className="text-center mb-20">
           
                     <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 bg-clip-text text-transparent">
               {t('pages.home.markets.title')}
             </span>
           </h2>
           <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
             {t('pages.home.markets.subtitle')}
           </p>
           <div className="flex items-center justify-center mt-8">
             <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-okuma-400 to-transparent"></div>
             <div className="w-3 h-3 bg-blue-600 rounded-full mx-4"></div>
             <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-okuma-400 to-transparent"></div>
           </div>
         </div>

                 {/* Markets Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center mx-auto">
           
           <div className="bg-white shadow-okuma-lg rounded-2xl flex flex-col items-center justify-center text-center w-full max-w-sm h-80 border border-okuma-gray-100">
                         <h3 className="text-gray-500 text-sm font-medium mb-2">KUZUFLEX</h3>
            <h2 className="text-3xl font-bold text-blue-700">
               {t('pages.home.markets.titleCard')}
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
                       console.log('', t('common.imageLoadError'), ':', market.imageUrl);
                       const target = e.target as HTMLImageElement;
                       target.style.display = 'none';
                       target.nextElementSibling?.classList.remove('hidden');
                     }}
                     onLoad={() => {
                       console.log(' Resim başarıyla yüklendi:', market.imageUrl);
                     }}
                   />
                 ) : null}
                 
                 
                 <div className={`w-full h-full bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 flex items-center justify-center ${market.imageUrl ? 'hidden' : ''}`}>
                   <div className="text-center text-white">
                     <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 mx-auto backdrop-blur-sm">
                       <span className="text-2xl font-bold">{market.title.charAt(0)}</span>
                     </div>
                     <p className="text-sm font-medium opacity-90">{market.title}</p>
                   </div>
                 </div>
                 
                 
                 <div className="absolute inset-0 bg-blue-950 bg-opacity-80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white p-6">
                   <p className="text-sm text-center font-medium">
                     {market.description || t('pages.home.markets.defaultDescription')}
                   </p>
                 </div>
                 
                
                 <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-blue-600/20 to-transparent"></div>
               </div>

               <div className="mt-4 text-center">
                 <div className="flex items-center justify-center text-blue-700 font-semibold">
                   <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                   </svg>
                   {market.title}
                 </div>
               </div>

               <div className="absolute inset-0 border-2 border-transparent group-hover:border-okuma-500/60 transition-all duration-500 shadow-[0_0_30px_rgba(99,102,241,0.3)] group-hover:shadow-[0_0_40px_rgba(99,102,241,0.4)]"></div>
             </div>
           ))}
         </div>

                 



      </div>

      {/* Bottom Section Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-700/30 to-transparent"></div>
    </section>
  );
};

export default MarketsShowcase;

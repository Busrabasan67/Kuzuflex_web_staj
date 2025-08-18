import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ExternalLink, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface MarketContent {
  id: number;
  type: string;
  name: string;
  targetUrl: string;
  order: number;
}

interface MarketDetail {
  id: number;
  slug: string;
  name: string;
  description: string;
  imageUrl?: string;
  isActive: boolean;
  contents: MarketContent[];
}

const MarketDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [market, setMarket] = useState<MarketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        setLoading(true);
        console.log(' Market verileri getiriliyor:', { slug, language: i18n.language });
        const response = await fetch(`http://localhost:5000/api/markets/${slug}?language=${i18n.language}`);
        
        if (!response.ok) {
          throw new Error('Market not found');
        }
        
        const data = await response.json();
        console.log(' Market verileri alındı:', data);
        console.log(' Market içerikleri:', data.contents);
        
        setMarket(data);
      } catch (err) {
        console.error('Market verileri alınamadı:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchMarket();
    }
  }, [slug, i18n.language]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">{t('loading.marketInfo')}</p>
        </div>
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-4 text-center">
          <div className="text-red-500 mb-6">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('error.title')}</h1>
          <p className="text-gray-600 mb-6">{error || t('error.marketNotFound')}</p>
          <Link 
            to="/" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {t('navbar.home')}
          </Link>
        </div>
      </div>
    );
  }

     // Group contents by type
   const mainContents = market.contents;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section - Modern Temiz Tasarım */}
      <section className="relative h-96 bg-gradient-to-r from-blue-600 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{market.name}</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-300 mx-auto rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Market Information Section */}
      <section className="py-20 bg-white text-gray-800 relative">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 opacity-3">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Market Information - Modern - LEFT */}
            <div className="space-y-8">
              {/* Main Title */}
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {market.name}
                  </span>
                </h2>
                
                {market.description && (
                  <p className="text-xl text-gray-600 leading-relaxed border-l-4 border-blue-500 pl-4 mb-8">
                    {market.description}
                  </p>
                )}
              </div>

              {/* Action Buttons - Integrated with Market Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mainContents.map((content) => (
                  <div key={content.id} className="w-full">
                    {content.type === 'product' ? (
                      <button 
                        onClick={() => navigate(content.targetUrl)}
                        className="w-full group/btn relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1"
                      >
                        <span className="relative z-10 flex items-center justify-center">
                          <span>{content.name || t(`market.buttons.${content.type}`)}</span>
                          <ChevronRight className="h-4 w-4 ml-2 transform group-hover/btn:translate-x-1 transition-transform duration-300" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                      </button>
                    ) : content.type === 'certificate' ? (
                      <a 
                        href={content.targetUrl}
                        className="w-full group/btn relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 inline-block text-center"
                        target="_self"
                        rel="noopener noreferrer"
                      >
                        <span className="relative z-10 flex items-center justify-center">
                          <span>{content.name || t('market.buttons.certificates')}</span>
                          <ChevronRight className="h-4 w-4 ml-2 transform group-hover/btn:translate-x-1 transition-transform duration-300" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                      </a>
                    ) : content.type === 'contact' ? (
                      <a 
                        href={content.targetUrl}
                        className="w-full group/btn relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 inline-block text-center"
                        target="_self"
                        rel="noopener noreferrer"
                      >
                        <span className="relative z-10 flex items-center justify-center">
                          <span>{content.name || t('market.buttons.contactUs')}</span>
                          <ChevronRight className="h-4 w-4 ml-2 transform group-hover/btn:translate-x-1 transition-transform duration-300" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                      </a>
                    ) : (
                      <a 
                        href={content.targetUrl}
                        className="w-full group/btn relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 inline-block text-center"
                        target="_self"
                        rel="noopener noreferrer"
                      >
                        <span className="relative z-10 flex items-center justify-center">
                          <span>{content.name || t(`market.buttons.${content.type}`)}</span>
                          <ChevronRight className="h-4 w-4 ml-2 transform group-hover/btn:translate-x-1 transition-transform duration-300" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Market Image - Modern Card - RIGHT */}
            {market.imageUrl && (
              <div className="relative group">
                <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl p-2">
                  <img
                    src={`http://localhost:5000${market.imageUrl}`}
                    alt={market.name}
                    className="w-full h-96 object-cover rounded-xl transition-all duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>



      

      {/* No Contents Message */}
      {market.contents.length === 0 && (
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 max-w-2xl mx-auto text-center">
            <div className="text-gray-400 mb-6">
              <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('market.noContents')}</h3>
            <p className="text-gray-600 mb-6">{t('market.noContentsDesc')}</p>
            <Link 
              to="/" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              {t('navbar.home')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketDetail; 
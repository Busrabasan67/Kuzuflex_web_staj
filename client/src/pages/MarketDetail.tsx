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
        console.log('🔍 Market verileri getiriliyor:', { slug, language: i18n.language });
        const response = await fetch(`http://localhost:5000/api/markets/${slug}?language=${i18n.language}`);
        
        if (!response.ok) {
          throw new Error('Market not found');
        }
        
        const data = await response.json();
        console.log('📦 Market verileri alındı:', data);
        console.log('📦 Market içerikleri:', data.contents);
        setMarket(data);
      } catch (err) {
        console.error('❌ Market verileri alınamadı:', err);
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
      {/* Hero Section with Enhanced Design */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white min-h-screen">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20"></div>
        </div>
        
        <div className="container mx-auto px-4 py-16 lg:py-32 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Content */}
            <div className="lg:w-1/2 space-y-10">
              <Link 
                to="/" 
                className="inline-flex items-center text-blue-200 hover:text-white transition-all duration-300 group bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5 mr-3 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">{t('navbar.home')}</span>
              </Link>
              
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-blue-200">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span>Market Solutions</span>
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                  {market.name}
                </h1>
                
                {/* Enhanced Bullet Points */}
                <div className="space-y-6 pt-4">
                  {market.description && market.description.split('.').filter(sentence => sentence.trim().length > 0).map((sentence, index) => (
                    <div key={index} className="group flex items-start space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <div className="flex-shrink-0 mt-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300"></div>
                      </div>
                      <p className="text-blue-100 text-lg leading-relaxed font-medium">{sentence.trim() + '.'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Enhanced Image */}
            <div className="lg:w-1/2 relative">
              {market.imageUrl ? (
                <div className="relative group">
                  {/* Glow Effect */}
                  <div className="absolute -inset-6 bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-purple-500/30 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                  
                  {/* Image Container */}
                  <div className="relative z-10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-2 border border-white/20">
                    <img 
                      src={`http://localhost:5000${market.imageUrl}`}
                      alt={market.name}
                      className="w-full h-auto max-h-[600px] rounded-2xl object-cover shadow-2xl transform group-hover:scale-[1.03] transition-all duration-700"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-2xl"></div>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full opacity-80 animate-bounce"></div>
                  <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-60 animate-pulse"></div>
                </div>
              ) : (
                <div className="w-full h-[600px] rounded-3xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl">
                  <div className="text-center">
                    <svg className="w-32 h-32 text-white/60 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2H3a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-white/60 text-lg font-medium">Market Image</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Contents Section - Asymmetric Design */}
      <div className="relative py-16 lg:py-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Asymmetric Header */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
              <div className="lg:col-span-2">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full px-6 py-2 mb-6">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-800 text-sm font-semibold">{t('market.mainContents')}</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Our Solutions for <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{market.name}</span>
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Discover our comprehensive range of products and solutions tailored specifically for your needs
                </p>
              </div>
              <div className="lg:col-span-1 flex items-center justify-center">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {mainContents.length}
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full animate-bounce"></div>
                  <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-purple-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            
            {/* Staggered Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mainContents.map((content, index) => (
                <div 
                  key={content.id}
                  className={`group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2 ${
                    index % 2 === 0 ? 'lg:translate-y-8' : ''
                  }`}
                  style={{
                    animationDelay: `${index * 200}ms`
                  }}
                >
                  {/* 3D Background Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  
                  {/* Floating Decorative Elements */}
                  <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                  
                  {/* Content Container */}
                  <div className="relative z-10 p-8 h-full flex flex-col">
                    {/* Type Badge with 3D Effect */}
                    <div className="flex items-center justify-between mb-6">
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ${
                        content.type === 'product' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-500/25' :
                        content.type === 'certificate' ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-500/25' :
                        'bg-gradient-to-r from-purple-500 to-fuchsia-600 shadow-purple-500/25'
                      } text-white`}>
                        {content.type}
                      </span>
                      <span className="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full font-medium">#{content.order}</span>
                    </div>
                    
                    {/* Title with Gradient Effect */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex-grow group-hover:text-blue-600 transition-colors duration-500 leading-tight">
                      {content.name || (content.type === 'certificate' ? t('market.buttons.certificates') : t(`market.buttons.${content.type}`))}
                    </h3>
                    
                    {/* Enhanced Button */}
                    <div className="mt-auto">
                      {content.type === 'product' ? (
                        <button 
                          onClick={() => navigate(content.targetUrl)}
                          className="w-full inline-flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-blue-500/25 transform group-hover:scale-[1.05] group-hover:-translate-y-1"
                        >
                          <span>{t('market.viewDetails')}</span>
                          <ChevronRight className="h-5 w-5 ml-2 transform group-hover:translate-x-2 transition-transform duration-500" />
                        </button>
                      ) : (
                        <a 
                          href={content.targetUrl}
                          className="w-full inline-flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-blue-500/25 transform group-hover:scale-[1.05] group-hover:-translate-y-1"
                          target="_self"
                          rel="noopener noreferrer"
                        >
                          <span>{t('market.viewDetails')}</span>
                          <ChevronRight className="h-5 w-5 ml-2 transform group-hover:translate-x-2 transition-transform duration-500" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      

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
// client/src/pages/Home.tsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import HeroSection from '../components/HeroSection';
import MarketsShowcase from '../components/MarketsShowcase';
import SolutionsCarousel from '../components/SolutionsCarousel';
import ProductGroupsShowcase from '../components/ProductGroupsShowcase';
import ContactSection from '../components/ContactSection';


interface HomeData {
  markets: any[];
  solutions: any[];
  productGroups: any[];
  featuredProducts: any[];
}

const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/home?lang=${i18n.language}`);
        
        if (!response.ok) {
          throw new Error('Ana sayfa verileri yüklenemedi');
        }
        
        const data = await response.json();
        console.log(t('pages.home.loading'), ':', data);
        console.log(t('pages.home.markets.title'), ':', data.markets);
        if (data.markets && data.markets.length > 0) {
          console.log(t('pages.home.markets.title'), ':', data.markets[0]);
          console.log( t('pages.home.markets.title'), ' imageUrl:', data.markets[0].imageUrl);
        }
        setHomeData(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : t('error.generalError'));
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [i18n.language, t]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-500">{t('pages.home.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{t('error.title', 'Hata')}</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section - Zero spacing */}
      <div className="m-0 p-0">
        <HeroSection />
      </div>

      {/* Product Groups Showcase - Ürünler */}
      {homeData?.productGroups && homeData.productGroups.length > 0 && (
        <div className="relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 to-teal-600/5"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.03'%3E%3Cpath d='M40 40c0 22.091-17.909 40-40 40s-40-17.909-40-40 17.909-40 40-40 40 17.909 40 40zm0-40c0-22.091-17.909-40-40-40s-40 17.909-40 40 17.909 40 40 40 40-17.909 40-40z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
          <div className="relative z-10">
            <ProductGroupsShowcase productGroups={homeData.productGroups} />
          </div>
        </div>
      )}

      {/* Solutions Carousel - Solutions */}
      {homeData?.solutions && homeData.solutions.length > 0 && (
        <div className="relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23a855f7' fill-opacity='0.03'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20s-20-8.954-20-20 8.954-20 20-20 20 8.954 20 20zm0-20c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
          <div className="relative z-10">
            <SolutionsCarousel solutions={homeData.solutions} />
          </div>
        </div>
      )}

            {/* Markets Showcase - Markets */}
      {homeData?.markets && homeData.markets.length > 0 && (
        <div className="relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-600/5"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230ea5e9' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
          <div className="relative z-10">
            <MarketsShowcase markets={homeData.markets} />
          </div>
        </div>
      )}

      {/* Contact Section - İletişim */}
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/5 to-red-600/5"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.03'%3E%3Cpath d='M50 50c0 27.614-22.386 50-50 50s-50-22.386-50-50 22.386-50 50-50 50 22.386 50 50zm0-50c0-27.614-22.386-50-50-50s-50 22.386-50 50 22.386 50 50 50 50-22.386 50-50z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        <div className="relative z-10">
          <ContactSection />
        </div>
      </div>


    </div>
  );
};

export default Home;
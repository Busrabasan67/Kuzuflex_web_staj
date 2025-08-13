import React, { useContext, useEffect, useState } from "react";
import kuzuflexLogo from "../assets/kuzuflex-logo.webp";
import { Youtube, Linkedin, Instagram, ArrowRight } from "lucide-react";
import { ThemeContext } from "../theme/ThemeContext";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

// Dinamik ürün grupları için tip
interface ProductGroupFooter {
  id: number;
  name: string;
  slug: string;
}

// Markets için tip
interface MarketFooter {
  id: number;
  slug: string;
  name: string;
  order: number;
  isActive: boolean;
}

// Solutions için tip
interface SolutionFooter {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
}

const Footer = () => {
  const { t, i18n } = useTranslation();
  const { darkMode } = useContext(ThemeContext);
  const [productGroups, setProductGroups] = useState<ProductGroupFooter[]>([]);
  const [markets, setMarkets] = useState<MarketFooter[]>([]);
  const [solutions, setSolutions] = useState<SolutionFooter[]>([]);

  const quickLinks = [
    { key: "home", label: t('navbar.home'), to: "/" },
    { key: "products", label: t('navbar.products'), to: "/Products" },
    { key: "aboutus", label: t('navbar.about'), to: "/hakkimizda" },
            { key: "contact", label: t('navbar.contact'), to: "/contact" },
  ];

  // Market verilerini yükleme fonksiyonu
  const fetchMarketData = () => {
    fetch(`http://localhost:5000/api/markets?language=${i18n.language}`)
      .then((res) => res.json())
      .then((data) => {
        // Sadece gerekli alanları al ve sadece aktif marketleri filtrele
        const marketsData = data
          .filter((m: any) => m.isActive) // Sadece aktif marketleri al
          .map((m: any) => ({ 
            id: m.id, 
            slug: m.slug, 
            name: m.name, 
            order: m.order,
            isActive: m.isActive
          }));
        setMarkets(marketsData);
      })
      .catch((err) => console.error("Footer markets alınamadı:", err));
  };

  // Çözüm verilerini yükleme fonksiyonu
  const fetchSolutionData = () => {
    fetch(`http://localhost:5000/api/solutions?lang=${i18n.language}`)
      .then((res) => res.json())
      .then((data) => {
        console.log('Footer Solutions API Response:', data); // Debug log
        const solutionsData = data.map((s: any) => ({
          id: s.id,
          name: s.title || 'Çözüm', // API'den gelen title alanını kullan
          slug: s.slug || `solution-${s.id}`,
          isActive: true // API'de isActive alanı yok, varsayılan olarak true
        }));
        console.log('Footer Solutions Processed:', solutionsData); // Debug log
        setSolutions(solutionsData);
      })
      .catch((err) => console.error("Footer çözümler alınamadı:", err));
  };

  useEffect(() => {
    // API'den ürün gruplarını çek
    fetch(`http://localhost:5000/api/product-groups?lang=${i18n.language}`)
      .then((res) => res.json())
      .then((data) => {
        // API'den gelen veri yapısına göre name ve slug alanlarını doğru şekilde al
        const groups = data.map((g: any) => ({ 
          id: g.id, 
          name: g.translation?.name || g.name || 'Ürün Grubu',
          slug: g.slug || `group-${g.id}`
        }));
        setProductGroups(groups);
      })
      .catch((err) => console.error("Footer ürün grupları alınamadı:", err));

    // Market verilerini yükle
    fetchMarketData();
    // Çözüm verilerini yükle
    fetchSolutionData();
  }, [i18n.language, t]); // t dependency'si eklendi çünkü t değiştiğinde de yeniden yükle

  return (
    <footer className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"} pt-12 pb-6 transition-colors duration-300`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-6 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <img src={kuzuflexLogo} alt="Kuzuflex Logo" className="w-32 h-auto" />
            </div>
            <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-sm mb-4`}>
              {t('footer.companyDescription')}
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.youtube.com/@kuzuflexmetal3924" 
                className={`${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"} transition-colors duration-200`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a 
                href="https://tr.linkedin.com/company/kuzuflex-metal-sanayi-ve-tic.-a.s." 
                className={`${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"} transition-colors duration-200`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="https://www.instagram.com/kuzuflexmetal/" 
                className={`${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"} transition-colors duration-200`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              {quickLinks.map((item) => (
                <li key={item.key}>
                  <Link 
                    to={item.to} 
                    className={`${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"} transition-colors duration-200 inline-flex items-center text-sm`}
                  >
                    <ArrowRight className="h-3 w-3 mr-1" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Products - Dinamik */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3">{t('footer.ourProducts')}</h3>
            {productGroups.length > 0 ? (
              <ul className="space-y-2">
                {productGroups.map((group) => (
                  <li key={group.id}>
                    <Link 
                      to={`/products/${group.slug}`}
                      className={`${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"} transition-colors duration-200 inline-flex items-center text-sm`}
                    >
                      <ArrowRight className="h-3 w-3 mr-1" />
                      {group.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500">
                <p>Ürün grupları yükleniyor...</p>
              </div>
            )}
          </div>
          {/* Solutions */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3">{t('navbar.solutions')}</h3>
            {solutions.length > 0 ? (
              <ul className="space-y-2">
                {solutions.map((solution) => (
                  <li key={solution.id}>
                    <Link 
                      to={`/solutions/${solution.slug}`}
                      className={`${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"} transition-colors duration-200 inline-flex items-center text-sm`}
                    >
                      <ArrowRight className="h-3 w-3 mr-1" />
                      {solution.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500">
                <p>Çözümler yükleniyor...</p>
                {/* Fallback statik liste */}
                <ul className="space-y-1 mt-2">
                  <li>
                    <Link 
                      to="/solutions/welding"
                      className={`${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"} transition-colors duration-200 inline-flex items-center text-xs`}
                    >
                      <ArrowRight className="h-2 w-2 mr-1" />
                      Welding
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/solutions/pipe-bending"
                      className={`${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"} transition-colors duration-200 inline-flex items-center text-xs`}
                    >
                      <ArrowRight className="h-2 w-2 mr-1" />
                      Pipe Bending
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/solutions/machining"
                      className={`${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"} transition-colors duration-200 inline-flex items-center text-xs`}
                    >
                      <ArrowRight className="h-2 w-2 mr-1" />
                      Machining
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
          {/* Certificates */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3">{t('navbar.qmDocuments')}</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/qm-documents"
                  className={`${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"} transition-colors duration-200 inline-flex items-center text-sm`}
                >
                  <ArrowRight className="h-3 w-3 mr-1" />
                  QM Documents & Certificates
                </Link>
              </li>
            </ul>
          </div>
          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3">{t('footer.contactInfo')}</h3>
            <div className="space-y-2">
              <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-sm`}>
                {t('common.phone')}
              </p>
              <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-sm`}>
                {t('common.email')}
              </p>
            </div>
          </div>
          {/* Markets */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3">{t('footer.markets')}</h3>
            <ul className="space-y-2">
              {markets.map((market) => (
                <li key={market.id}>
                  <Link 
                    to={`/markets/${market.slug}`}
                    className={`${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"} transition-colors duration-200 inline-flex items-center text-sm`}
                  >
                    <ArrowRight className="h-3 w-3 mr-1" />
                    {market.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Contact Information Section */}
        <div className="border-t border-gray-300 pt-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className={`${darkMode ? "text-blue-400" : "text-blue-600"} font-semibold text-lg`}>
                  +90 850 800 22 22
                </p>
                <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-sm`}>
                  kuzu@kuzuflex.com
                </p>
              </div>
            </div>
            
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send us a message
            </button>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-300 pt-6 text-center">
          <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-sm`}>
            © 2024 Kuzuflex. {t('footer.allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

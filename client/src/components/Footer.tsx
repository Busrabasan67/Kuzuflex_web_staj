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
}

// Markets için tip
interface MarketFooter {
  id: number;
  slug: string;
  name: string;
  order: number;
  isActive: boolean;
}

const Footer = () => {
  const { t, i18n } = useTranslation();
  const { darkMode } = useContext(ThemeContext);
  const [productGroups, setProductGroups] = useState<ProductGroupFooter[]>([]);
  const [markets, setMarkets] = useState<MarketFooter[]>([]);

  const quickLinks = [
    { key: "home", label: t('navbar.home'), to: "/" },
    { key: "products", label: t('navbar.products'), to: "/Products" },
    { key: "aboutus", label: t('navbar.about'), to: "/hakkimizda" },
    { key: "contact", label: t('navbar.contact'), to: "/iletisim" },
  ];

  useEffect(() => {
    // API'den ürün gruplarını çek
    fetch(`http://localhost:5000/api/product-groups?lang=${i18n.language}`)
      .then((res) => res.json())
      .then((data) => {
        // Sadece id ve name al
        const groups = data.map((g: any) => ({ id: g.id, name: g.name }));
        setProductGroups(groups);
      })
      .catch((err) => console.error("Footer ürün grupları alınamadı:", err));

    // API'den markets'leri çek
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
  }, [i18n.language]);

  return (
    <footer className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"} pt-12 pb-6 transition-colors duration-300`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
            <ul className="space-y-2">
              {productGroups.map((group) => (
                <li key={group.id}>
                  <Link 
                    to={`/Products/${group.id}`}
                    className={`${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"} transition-colors duration-200 inline-flex items-center text-sm`}
                  >
                    <ArrowRight className="h-3 w-3 mr-1" />
                    {group.name}
                  </Link>
                </li>
              ))}
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

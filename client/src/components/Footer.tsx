import React, { useContext, useEffect, useState } from "react";
import kuzuflexLogo from "../assets/kuzuflex-logo.webp";
import { Youtube, Linkedin, Instagram, ArrowRight } from "lucide-react";
import { ThemeContext } from "../theme/ThemeContext"; // Context’i İçe Aktar
import { Link } from "react-router-dom";

const quickLinks = [
  { key: "home", label: "Home", to: "/" },
  { key: "products", label: "Products", to: "/Products" },
  { key: "aboutus", label: "About Us", to: "/hakkimizda" },
  { key: "industries", label: "Industries", to: "/endustriler" },
  { key: "contact", label: "Contact", to: "/iletisim" },
];

// Dinamik ürün grupları için tip
interface ProductGroupFooter {
  id: number;
  name: string;
}

const Footer = () => {
  const { darkMode } = useContext(ThemeContext);
  const [productGroups, setProductGroups] = useState<ProductGroupFooter[]>([]);

  useEffect(() => {
    // API'den ürün gruplarını çek
    fetch("http://localhost:5000/api/product-groups?lang=tr")
      .then((res) => res.json())
      .then((data) => {
        // Sadece id ve name al
        const groups = data.map((g: any) => ({ id: g.id, name: g.name }));
        setProductGroups(groups);
      })
      .catch((err) => console.error("Footer ürün grupları alınamadı:", err));
  }, []);

  return (
    <footer className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"} pt-12 pb-6 transition-colors duration-300`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <img src={kuzuflexLogo} alt="Kuzuflex Logo" className="w-32 h-auto" />
            </div>
            <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-sm mb-4`}>
              Esnek metal hortumda lider marka. Kalite, güven ve inovasyonun adresi.
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
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3">Quick Links</h3>
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
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3">Our Products</h3>
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
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3">Contact Us</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold text-white mb-1">Turkey</p>
                <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>Tel: +90 850 800 22 22</p>
                <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>kuzu@kuzuflex.com</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Germany</p>
                <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>Tel: +49 (0) 4152 889 256</p>
                <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>Mobil: +49 (0) 152 288 30 946</p>
                <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>deutschland@kuzuflex.com</p>
              </div>
            </div>
          </div>
        </div>
        <div className={`pt-6 border-t text-center md:flex md:justify-between md:items-center ${darkMode ? "border-gray-700" : "border-gray-300"}`}>
          <p className={`${darkMode ? "text-gray-500" : "text-gray-600"} text-sm mb-4 md:mb-0`}>
            &copy; {new Date().getFullYear()} KUZUFLEX METAL HOSE. All rights reserved.
          </p>
          <div className="flex justify-center space-x-6">
            <a href="#" className={`${darkMode ? "text-gray-500 hover:text-gray-400" : "text-gray-600 hover:text-gray-800"} transition-colors duration-200 text-sm`}>
              Privacy Policy
            </a>
            <a href="#" className={`${darkMode ? "text-gray-500 hover:text-gray-400" : "text-gray-600 hover:text-gray-800"} transition-colors duration-200 text-sm`}>
              Terms of Service
            </a>
            <a href="#" className={`${darkMode ? "text-gray-500 hover:text-gray-400" : "text-gray-600 hover:text-gray-800"} transition-colors duration-200 text-sm`}>
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

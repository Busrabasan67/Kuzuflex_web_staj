import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Phone, Mail } from "lucide-react";
import KuzuflexLogo from "../assets/kuzuflex-logo.webp";
import LanguageSwitcher from "./LanguageSwithcer";

interface MenuItem {
  title: string;
  path?: string;
  submenu?: MenuItem[]; // recursive tanım: submenu varsa o da bir MenuItem olabilir
  key?: string;
}

interface SubCategory {
  id: number;
  slug: string; // Ürün slug'ı
  title: string; //  Alt ürünler Product → ProductTranslation → title
}

interface ProductGroup {
  id: number; // Grup ID'si
  slug: string; // SEO dostu URL slug'ı
  translation: {
    language: string; // Dil kodu
    name: string; // Grup adı (çeviri)
    description: string; // Grup açıklaması (çeviri)
  } | null; // Çeviri olmayabilir
  subcategories?: SubCategory[]; // Alt ürünler
  imageUrl?: string; // Grup görseli
  standard?: string; // Grup standardı
}

interface Solution {
  id: number;
  slug: string;
  title: string;
  imageUrl: string;
}

const Navbar = ({ isAdminLoggedIn }: { isAdminLoggedIn?: boolean }) => {
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openSubDropdown, setOpenSubDropdown] = useState<string | null>(null);
  const [language, setLanguage] = useState(i18n.language || "en");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);




  const location = useLocation();
  const navigate = useNavigate();
  const navbarRef = useRef<HTMLDivElement>(null);

  // Dil değişikliğini dinle
  useEffect(() => {
    setLanguage(i18n.language);
  }, [i18n.language]);

  useEffect(() => {
    document.addEventListener("mousedown", (e) => {
      if (navbarRef.current && !navbarRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    });
    return () => document.removeEventListener("mousedown", () => {});
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]); //  Menu'nun her değiştiğinde açılıp kapatılacak



  const toggleDropdown = (title: string) => {
    // Sadece alt menüsü olan item'lar için dropdown açılsın
    const menuItem = menuItems.find(item => item.title === title);
    if (menuItem && menuItem.submenu && menuItem.submenu.length > 0) {
      setOpenDropdown(openDropdown === title ? null : title);
    }
  };

  //  Ürün gruplarını ve solution'ları API'den al
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ürün gruplarını fetch et (üst grup verileri)
        const productRes = await fetch(`http://localhost:5000/api/product-groups?lang=${language}`);
        const productData: ProductGroup[] = await productRes.json();

        // Solution'ları fetch et
        const solutionRes = await fetch(`http://localhost:5000/api/solutions?lang=${language}`);
        const solutionData: Solution[] = await solutionRes.json();

        // Ürünler menüsünü oluştur
        // Menüde grup adı olarak çeviri üzerinden göster
        const dynamicProductsMenu: MenuItem = {
          title: t('navbar.products'),
          submenu: productData.map((group) => ({
            title: group.translation?.name || '', // Çeviri üzerinden grup adı
            path: `/products/${group.slug}`, // Slug bazlı URL
            key: `group-${group.id}`,
            submenu: group.subcategories?.map((sub) => ({
              title: sub.title, // Alt ürün adı
              path: `/products/${group.slug}/${sub.slug}`, // Slug bazlı URL
              key: `sub-${group.id}-${sub.id}`,
            })),
          })),
        };

        // Solution menüsünü oluştur
        const solutionsMenu: MenuItem = {
          title: t('navbar.solutions'),
          submenu: solutionData.map((solution) => ({
            title: solution.title, // "Kaynak"
            path: `/solutions/${solution.slug}`, // "/solutions/welding"
            key: `solution-${solution.id}`, // "solution-8"
          })),
        };

        const staticMenus: MenuItem[] = [
          { 
            title: t('navbar.home'), 
            path: "/",
            submenu: [] // Empty submenu to ensure consistent styling
          },
          {
            title: t('navbar.about'), 
            path: "/about-us"
          },
          {
            title: t('navbar.contact'), 
            path: "/contact"
          },
        ];

        setMenuItems([...staticMenus, dynamicProductsMenu, solutionsMenu, {
          title: t('navbar.documents'), 
          path: "/qm-documents"
        }]);
      } catch (err) {
        console.error(" Veriler alınamadı:", err);
      }
    };

    fetchData();
  }, [language, t]);

  return (
    <nav
      ref={navbarRef}
      className="sticky top-0 z-50 m-0 p-0 transition-all duration-300 shadow-okuma bg-white text-okuma-gray-900 border-b border-okuma-gray-200"
    >
      {/* Üst bilgi - Okuma.com tarzı */}
      <div className="bg-okuma-950 text-white text-xs py-2 px-4 flex justify-between items-center">
        <div className="font-medium">{t('navbar.professionalSolutions', 'Professional Industrial Solutions')}</div>
        <div className="flex items-center space-x-4">
          <a 
            href={`tel:${t('common.phone', '+90 850 800 22 22')}`}
            className="hover:text-okuma-300 transition-colors flex items-center gap-1"
          >
            <Phone className="h-3 w-3" />
            {t('common.phone', '+90 850 800 22 22')}
          </a>
          <a 
            href={`mailto:${t('common.email', 'kuzu@kuzuflex.com')}`}
            className="hover:text-okuma-300 transition-colors flex items-center gap-1"
          >
            <Mail className="h-3 w-3" />
            {t('common.email', 'kuzu@kuzuflex.com')}
          </a>
        </div>
      </div>

      {/* Ana Menü - Okuma.com tarzı */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-2">
            <img src={KuzuflexLogo} alt="Kuzuflex Logo" className="h-10 w-auto" />
          </Link>

          {/* Menü - Okuma.com tarzı */}
          <div className="hidden lg:flex space-x-1">
            {menuItems.map((item) => (
              <div key={item.title} className="relative group">
                {/* Ana Menü */}
                {item.path && (!item.submenu || item.submenu.length === 0) ? (
                  <Link
                    to={item.path}
                                    className={`px-4 py-3 font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center ${
                  location.pathname === item.path ? "text-blue-700 bg-blue-100 font-semibold" : ""
                }`}
                  >
                    {item.title}
                  </Link>
                ) : (
                  <div 
                    className="relative"
                    onMouseEnter={() => {
                      if (item.submenu && item.submenu.length > 0) {
                        setOpenDropdown(item.title);
                      }
                    }}
                    onMouseLeave={(e) => {
                      // Eğer dropdown'a geçiyorsak ana menü item'ından çıkmış sayılmamalıyız
                      const relatedTarget = e.relatedTarget as HTMLElement;
                      if (relatedTarget && relatedTarget.closest('.dropdown-container')) {
                        return; // Dropdown'a geçiyorsak kapatma
                      }
                      setOpenDropdown(null);
                    }}
                  >
                    <button 
                      onClick={() => toggleDropdown(item.title)} 
                      className="px-4 py-3 font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center"
                    >
                      {item.title}
                      {item.submenu && item.submenu.length > 0 && (
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}

                {/* Alt Kategoriler - Okuma.com tarzı */}
                {item.submenu && item.submenu.length > 0 && (
                  <div 
                    className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 min-w-[250px] rounded-xl shadow-okuma-lg border border-okuma-gray-100 z-50 transition-all duration-300 ease-in-out bg-white text-okuma-gray-900 ${
                      openDropdown === item.title 
                        ? "opacity-100 visible translate-y-0" 
                        : "opacity-0 invisible -translate-y-2 pointer-events-none"
                    }`}
                    onMouseEnter={() => {
                      // Dropdown'a girince açık tut
                      setOpenDropdown(item.title);
                    }}
                    onMouseLeave={() => {
                      // Dropdown'dan çıkınca kapat
                      setOpenDropdown(null);
                    }}
                  >
                    {item.submenu.map((sub) => (
                      <div
                        key={sub.key || sub.title}
                        className="relative group"
                        onMouseEnter={() => {
                          // Alt alt menüye girince açık tut
                          setOpenSubDropdown(sub.title);
                        }}
                        onMouseLeave={() => {
                          // Alt alt menüden çıkarken biraz gecikme ekleyelim
                          setTimeout(() => {
                            if (openSubDropdown === sub.title) {
                              setOpenSubDropdown(null);
                            }
                          }, 100);
                        }}
                      >
                        {sub.path ? (
                          <Link to={sub.path} className="block px-4 py-3 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg mx-2">
                            {sub.title}
                          </Link>
                        ) : (
                          <span className="block px-4 py-3 text-okuma-gray-500 mx-2">{sub.title}</span>
                        )}

                        {/* ALT ALT MENÜ - Okuma.com tarzı */}
                        {sub.submenu && sub.submenu.length > 0 && (
                          <div 
                            className={`absolute left-full top-0 mt-0 ml-2 min-w-[200px] rounded-xl shadow-okuma-lg border border-okuma-gray-100 z-50 transition-all duration-300 ease-in-out bg-white text-okuma-gray-900 ${
                              openSubDropdown === sub.title 
                                ? "opacity-100 visible translate-x-0" 
                                : "opacity-0 invisible -translate-y-2 pointer-events-none"
                            }`}
                            onMouseEnter={() => {
                              // Alt alt menü container'ına girince açık tut
                              setOpenSubDropdown(sub.title);
                            }}
                            onMouseLeave={() => {
                              // Alt alt menü container'ından çıkınca kapat
                              setOpenSubDropdown(null);
                            }}
                          >
                            {sub.submenu.map((subItem) =>
                              subItem.path ? (
                                <Link key={subItem.key || subItem.title} to={subItem.path} className="block px-4 py-3 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg mx-2">
                                  {subItem.title}
                                </Link>
                              ) : (
                                <span key={subItem.key || subItem.title} className="block px-4 py-3 text-okuma-gray-500 mx-2">
                                  {subItem.title}
                                </span>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Aksiyonlar - Okuma.com tarzı */}
          <div className="flex items-center gap-4">
            {/* LanguageSwitcher Component'i */}
            <LanguageSwitcher />
            
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200">☰</button>
          </div>
        </div>



        {/* Mobil Menü - Okuma.com tarzı */}
        {menuOpen && (
          <div className="lg:hidden border-t border-okuma-gray-200 bg-white text-okuma-gray-900">
            <div className="px-6 py-4 space-y-2">
              {menuItems.map((item) => (
                <div key={item.title}>
                  {/* Ana Menü Item */}
                  {item.path && (!item.submenu || item.submenu.length === 0) ? (
                    <Link
                      to={item.path}
                      onClick={() => setMenuOpen(false)}
                      className={`block px-4 py-3 font-medium rounded-lg transition-all duration-200 ${
                        location.pathname === item.path 
                                          ? "text-blue-700 bg-blue-100 font-semibold"
                : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                      }`}
                    >
                      {item.title}
                    </Link>
                  ) : (
                    <div>
                      <button 
                        onClick={() => toggleDropdown(item.title)} 
                        className="w-full text-left px-4 py-3 font-semibold text-gray-900 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center justify-between bg-blue-50 border border-gray-200"
                      >
                        <span className="text-base font-bold">{item.title}</span>
                        {item.submenu && item.submenu.length > 0 && (
                          <svg 
                            className={`w-5 h-5 transition-transform duration-200 ${
                              openDropdown === item.title ? 'rotate-180' : ''
                            }`} 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth={2} 
                            viewBox="0 0 24 24"
                          >
                            <path d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </button>
                      
                      {/* Alt Menü - Aşağıya doğru açılır */}
                      {item.submenu && item.submenu.length > 0 && openDropdown === item.title && (
                        <div className="ml-4 mt-2 space-y-1">
                          {item.submenu.map((sub) => (
                            <div key={sub.key || sub.title}>
                              {sub.path ? (
                                <Link
                                  to={sub.path}
                                  onClick={() => setMenuOpen(false)}
                                  className="block px-4 py-3 text-gray-700 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-all duration-200 font-medium"
                                >
                                  {sub.title}
                                </Link>
                              ) : (
                                <span className="block px-4 py-3 text-okuma-gray-600 font-medium">{sub.title}</span>
                              )}
                              
                              {/* Alt Alt Menü - Daha da içeride */}
                              {sub.submenu && sub.submenu.length > 0 && (
                                <div className="ml-4 mt-2 space-y-1">
                                  {sub.submenu.map((subItem) => (
                                    <div key={subItem.key || subItem.title}>
                                      {subItem.path ? (
                                        <Link
                                          to={subItem.path}
                                          onClick={() => setMenuOpen(false)}
                                          className="block px-4 py-2 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 text-sm"
                                        >
                                          {subItem.title}
                                        </Link>
                                      ) : (
                                        <span className="block px-4 py-2 text-okuma-gray-500 text-sm">{subItem.title}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

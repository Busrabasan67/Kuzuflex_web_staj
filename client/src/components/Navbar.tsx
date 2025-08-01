import { useState, useEffect, useRef, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiSearch, FiMoon, FiSun, FiGlobe, FiChevronDown } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import KuzuflexLogo from "../assets/kuzuflex-logo.webp";
import { ThemeContext } from "../theme/ThemeContext";
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
  title: string; // 🟡 Alt ürünler Product → ProductTranslation → title
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [language, setLanguage] = useState(i18n.language || "en");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const location = useLocation();
  const navigate = useNavigate();
  const navbarRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Dil değişikliğini dinle
  useEffect(() => {
    setLanguage(i18n.language);
  }, [i18n.language]);

  useEffect(() => {
    document.addEventListener("mousedown", (e) => {
      if (navbarRef.current && !navbarRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
        setSearchOpen(false);
      }
    });
    return () => document.removeEventListener("mousedown", () => {});
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/arama?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  const toggleDropdown = (title: string) => {
    setOpenDropdown(openDropdown === title ? null : title);
  };

  // 🟢 Ürün gruplarını ve solution'ları API'den al
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
          { title: t('navbar.home'), path: "/" },
          {
            title: t('navbar.corporate'),
            submenu: [
              { title: t('navbar.about'), path: "/hakkimizda" },
              { title: t('navbar.documents'), path: "/belgeler" },
            ],
          },
          {
            title: t('navbar.services'),
            submenu: [
              { title: t('navbar.manufacturing'), path: "/hizmetler/imalat" },
              { title: t('navbar.quality'), path: "/hizmetler/kalite" },
            ],
          },
        ];

        setMenuItems([...staticMenus, dynamicProductsMenu, solutionsMenu]);
      } catch (err) {
        console.error("❌ Veriler alınamadı:", err);
      }
    };

    fetchData();
  }, [language, t]);

  return (
    <nav
      ref={navbarRef}
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-black border-b border-gray-200"
      }`}
    >
      {/* Üst bilgi */}
      <div className="bg-black text-white text-xs py-1 px-4 flex justify-between items-center">
        <div>{t('navbar.professionalSolutions')}</div>
        <div className="flex items-center space-x-4">
          <span>{t('common.phone')}</span>
          <span>{t('common.email')}</span>
        </div>
      </div>

      {/* Ana Menü */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-2">
            <img src={KuzuflexLogo} alt="Kuzuflex Logo" className="h-10 w-auto" />
          </Link>

          {/* Menü */}
          <div className="hidden lg:flex space-x-3">
            {menuItems.map((item) => (
              <div key={item.title} className="relative group">
                {/* Ana Menü */}
                {item.path ? (
                  <Link
                    to={item.path}
                    className={`px-4 py-3 font-medium hover:underline ${location.pathname === item.path && "font-bold"}`}
                  >
                    {item.title}
                  </Link>
                ) : (
                  <button onClick={() => toggleDropdown(item.title)} className="px-4 py-3 font-medium flex items-center">
                    {item.title}
                    {item.submenu && item.submenu.length > 0 && (
                      <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                )}

                {/* Alt Kategoriler */}
                {item.submenu && openDropdown === item.title && (
                  <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 min-w-[250px] rounded-lg shadow-lg z-50 ${
                    darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
                  }`}>
                    {item.submenu.map((sub) => (
                      <div
                        key={sub.key || sub.title}
                        className="relative group"
                        onMouseEnter={() => setOpenSubDropdown(sub.title)}
                        onMouseLeave={() => setOpenSubDropdown(null)}
                      >
                        {sub.path ? (
                          <Link to={sub.path} className="block px-4 py-2 hover:bg-opacity-20">
                            {sub.title}
                          </Link>
                        ) : (
                          <span className="block px-4 py-2 text-gray-500">{sub.title}</span>
                        )}

                        {/* ALT ALT MENÜ */}
                        {sub.submenu && openSubDropdown === sub.title && (
                          <div className={`absolute left-full top-0 mt-0 ml-2 min-w-[200px] rounded-md shadow-md z-50 ${
                            darkMode ? "bg-gray-700 text-white" : "bg-white text-black"
                          }`}>
                            {sub.submenu.map((subItem) =>
                              subItem.path ? (
                                <Link key={subItem.key || subItem.title} to={subItem.path} className="block px-4 py-2 hover:underline">
                                  {subItem.title}
                                </Link>
                              ) : (
                                <span key={subItem.key || subItem.title} className="block px-4 py-2 text-gray-500">
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

          {/* Aksiyonlar */}
          <div className="flex items-center gap-3">
            <button onClick={() => setSearchOpen(!searchOpen)}><FiSearch /></button>
            <button onClick={() => setDarkMode(!darkMode)}>{darkMode ? <FiSun /> : <FiMoon />}</button>
            
            {/* LanguageSwitcher Component'i */}
            <LanguageSwitcher />
            
            <Link to={isAdminLoggedIn ? "/admin" : "/admin-login"} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
              {t('navbar.adminPanel')}
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden">☰</button>
          </div>
        </div>

        {/* Arama Kutusu */}
        {searchOpen && (
          <form onSubmit={handleSearch} className="mt-2">
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 rounded-md border shadow-sm"
              placeholder={t('navbar.searchPlaceholder')}
            />
          </form>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

import React, { useState, useEffect } from "react";
// import SolutionExtraContentAdder from "../components/SolutionExtraContentAdder";
import SolutionManagement from "../components/SolutionManagement";
import ExtraContentManagement from "../components/ExtraContentManagement";
import AdminProductGroups from "./AdminProductGroups";
import AdminProducts from "../components/AdminProducts";
import QMDocumentsManagement from "../components/QMDocumentsManagement";
import AboutPageManager from "../components/AboutPageManager";
import EmailSettings from "../components/EmailSettings";
import kuzuflexLogo from "../assets/kuzuflex-logo.webp";

import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import MarketsManagement from "../components/MarketsManagement";
import { 
  FiHome, 
  FiPackage, 
  FiGrid, 
  FiFileText,
  FiTool,
  FiEdit3,
  FiAward,
  FiGlobe,
  FiMail,
  FiUser
} from "react-icons/fi";

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");  // admin panelinin başlangıçta hangi taba açılacağını belirler.
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar açık/kapalı durumu 
  const [showUserMenu, setShowUserMenu] = useState(false); // Kullanıcı menüsü açık/kapalı
  const [userInfo, setUserInfo] = useState<{ username: string; email: string } | null>(null);
  const { isAuthenticated, token, logout } = useAuth();
  const navigate = useNavigate();

  // Güvenlik kontrolü ve kullanıcı bilgilerini alma
  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate("/admin-login", { replace: true });
      return;
    }

    // Token validasyonu ve kullanıcı bilgilerini alma
    const validateTokenAndGetUserInfo = async () => {
      try {
        const response = await fetch('/api/auth/validate-token', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          localStorage.removeItem('adminToken');
          navigate("/admin-login", { replace: true });
          return;
        }

        // Kullanıcı bilgilerini al
        const userResponse = await fetch('/api/auth/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          // API response'unda admin objesi içinde username ve email var
          if (userData.admin) {
            setUserInfo({
              username: userData.admin.username,
              email: userData.admin.email
            });
          }
        }
      } catch (error) {
        localStorage.removeItem('adminToken');
        navigate("/admin-login", { replace: true });
      }
    };

    validateTokenAndGetUserInfo();

    // History manipulation koruması
    const handlePopState = (event: PopStateEvent) => {
      // Geri/ileri tuşlarına basıldığında token kontrolü
      validateTokenAndGetUserInfo();
      
      // Eğer admin paneline erişmeye çalışılıyorsa engelle
      if (!isAuthenticated || !token) {
        event.preventDefault();
        window.history.pushState(null, '', '/admin-login');
        navigate("/admin-login", { replace: true });
      }
    };

    // Beforeunload event
    const handleBeforeUnload = () => {
      // Sayfa kapatılmadan önce token'ı temizle
      localStorage.removeItem('adminToken');
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Component unmount olduğunda event listener'ları temizle
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAuthenticated, token, navigate]);



  // Kullanıcı menüsünün dışarı tıklandığında kapanması
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  // Eğer authenticate değilse loading göster
  if (!isAuthenticated || !token) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Güvenlik kontrolü yapılıyor...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", name: "Ana Sayfa", icon: FiHome },
    { id: "markets", name: "Pazar Yönetimi", icon: FiGlobe },
    { id: "product-groups", name: "Ürün Kategorileri", icon: FiPackage },
    { id: "products", name: "Ürün Yönetimi", icon: FiGrid },
    { id: "solutions", name: "Çözüm Yönetimi", icon: FiTool },
    { id: "solution-extra-content", name: "Çözüm İçerik Ekle", icon: FiEdit3 },
    { id: "qm-documents", name: "Belgeler ve Sertifikalar", icon: FiAward },
    { id: "about", name: "Hakkımızda Sayfası", icon: FiFileText },
    { id: "email-settings", name: "Email Ayarları", icon: FiMail },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Admin Ana Sayfa</h2>
            <p className="mb-6">Hoş geldiniz! Buradan sitenizi yönetebilirsiniz.</p>
          </div>
        );

      case "markets":
        return <MarketsManagement />;
      case "products":
        return <AdminProducts />;
      case "product-groups":
        return <AdminProductGroups />;
      case "solutions":
        return <SolutionManagement />;
      case "solution-extra-content":
        return <ExtraContentManagement />;
      case "qm-documents":
        return <QMDocumentsManagement />;
      case "about":
        return <AboutPageManager />;
      case "email-settings":
        return <EmailSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Tab Menüsü - Mavi Renk */}
      <div className={`${
        sidebarOpen ? 'w-64' : 'w-16'
      } bg-gradient-to-b from-blue-900 to-blue-800 text-white shadow-xl transition-all duration-300 overflow-hidden flex flex-col min-h-screen`}>
        <div className={`${sidebarOpen ? 'p-4' : 'p-3'} border-b border-blue-700 flex-shrink-0`}>
                      <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
              <div className={`flex items-center ${sidebarOpen ? 'space-x-3' : ''}`}>
                <div className={`flex items-center justify-center ${sidebarOpen ? 'p-1' : 'p-2'}`}>
                  <img 
                    src={kuzuflexLogo} 
                    alt="Kuzuflex Logo" 
                    className={`${sidebarOpen ? 'h-8' : 'h-8'} w-auto object-contain transition-all duration-300 filter brightness-0 invert`}
                  />
                </div>
              </div>
            
            {/* Toggle Button - Sidebar içinde */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`${sidebarOpen ? '' : 'mt-1'} p-2 rounded-lg hover:bg-white/10 transition-all duration-200`}
              title={sidebarOpen ? 'Sidebar\'ı daralt' : 'Sidebar\'ı genişlet'}
            >
              {sidebarOpen ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        <div className={`${sidebarOpen ? 'p-3' : 'p-2'} flex-1 overflow-y-auto sidebar-scrollbar`}>
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center ${
                    sidebarOpen ? 'px-3 py-2.5' : 'px-2 py-2.5 justify-center'
                  } text-left rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-white/20 text-white shadow-md"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }`}
                  title={sidebarOpen ? '' : tab.name}
                >
                  <Icon className={`${sidebarOpen ? 'mr-3' : ''} text-lg ${!sidebarOpen ? 'hover:scale-110 transition-transform' : ''}`} />
                  {sidebarOpen && <span className="font-medium text-sm">{tab.name}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Kullanıcı Profil Kısmı - Sidebar'ın En Altında - Fixed */}
        <div className="border-t border-blue-700 flex-shrink-0 bg-blue-800/50">
          {sidebarOpen && (
            <div className="px-3 pt-2 pb-1">
              <div className="text-xs text-blue-300 font-medium uppercase tracking-wide">
                Kullanıcı
              </div>
            </div>
          )}
          <div className={`${sidebarOpen ? 'p-3' : 'p-2'}`}>
            <div className="relative user-menu-container">
              {/* Kullanıcı Profil Butonu */}
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`w-full flex items-center ${
                  sidebarOpen ? 'px-3 py-3' : 'px-2 py-3 justify-center'
                } text-left rounded-lg transition-all duration-200 text-blue-100 hover:bg-white/10 hover:text-white group`}
                title={sidebarOpen ? '' : 'Kullanıcı Menüsü'}
              >
                <div className="bg-white/10 p-2 rounded-lg group-hover:bg-white/20 transition-colors">
                  <FiUser className="text-lg" />
                </div>
                {sidebarOpen && (
                  <div className="ml-3 flex-1 text-left">
                    <div className="font-medium text-sm text-white">
                      {userInfo ? userInfo.username : (
                        <div className="animate-pulse bg-white/20 h-4 w-20 rounded"></div>
                      )}
                    </div>
                    <div className="text-xs text-blue-200 truncate">
                      {userInfo ? userInfo.email : (
                        <div className="animate-pulse bg-white/20 h-3 w-32 rounded mt-1"></div>
                      )}
                    </div>
                  </div>
                )}
                {sidebarOpen && userInfo && (
                  <div className={`ml-2 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                )}
                {/* Sidebar kapalıyken dropdown indicator */}
                {!sidebarOpen && (
                  <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-200 rounded-full transition-all duration-200 ${showUserMenu ? 'bg-white' : ''}`}></div>
                )}
              </button>

              {/* Kullanıcı Menüsü Dropdown */}
              {showUserMenu && (
                <div className={`absolute bottom-full mb-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden ${
                  sidebarOpen ? 'w-full left-0 right-0' : 'w-48 -right-2'
                }`}>
                  <div className="py-2">
                    {/* Profil Ayarları */}
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FiUser className="mr-3 text-gray-500" />
                      <span className="text-sm font-medium">Profil Ayarları</span>
                    </button>
                    
                    {/* Ayırıcı */}
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    {/* Çıkış Yap */}
                    <button
                      onClick={() => {
                        logout();
                        navigate('/admin-login');
                      }}
                      className="w-full flex items-center px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="mr-3 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="text-sm font-medium">Çıkış Yap</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

                     {/* Tab İçeriği */}
        <div className="flex-1 bg-white transition-all duration-300 overflow-auto">
          <div className={`transition-all duration-300 h-full ${
            sidebarOpen ? 'px-4 py-2' : 'px-3 py-2'
          }`}>
            {renderTabContent()}
          </div>
        </div>
    </div>
  );
};

export default AdminPanel;

import React, { useState, useEffect } from "react";
// import SolutionExtraContentAdder from "../components/SolutionExtraContentAdder";
import SolutionManagement from "../components/SolutionManagement";
import ExtraContentManagement from "../components/ExtraContentManagement";
import AdminProductGroups from "./AdminProductGroups";
import AdminProducts from "../components/AdminProducts";
import QMDocumentsManagement from "../components/QMDocumentsManagement";
import AboutPageManager from "../components/AboutPageManager";
import ChangePasswordForm from "../components/ChangePasswordForm";
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
  FiLock
} from "react-icons/fi";

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");  // admin panelinin başlangıçta hangi taba açılacağını belirler.
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar açık/kapalı durumu 
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  // Güvenlik kontrolü
  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate("/admin-login", { replace: true });
      return;
    }

    // Token validasyonu
    const validateToken = async () => {
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
      } catch (error) {
        localStorage.removeItem('adminToken');
        navigate("/admin-login", { replace: true });
      }
    };

    validateToken();

    // History manipulation koruması
    const handlePopState = (event: PopStateEvent) => {
      // Geri/ileri tuşlarına basıldığında token kontrolü
      validateToken();
      
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
    { id: "qm-documents", name: "Kalite Belgeleri", icon: FiAward },
    { id: "about", name: "Hakkımızda Sayfası", icon: FiFileText },
    { id: "change-password", name: "Şifre Güncelle", icon: FiLock },
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
      case "change-password":
        return (
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Şifre Güncelle</h2>
              <p className="text-gray-600 text-lg">Hesap güvenliğiniz için şifrenizi güncelleyin</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sol Panel - Güvenlik İpuçları ve Hesap Bilgileri */}
              <div className="lg:col-span-1 space-y-6">
                {/* Güvenlik İpuçları */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FiAward className="text-blue-600 text-xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-blue-900">Güvenlik İpuçları</h3>
                  </div>
                  <div className="space-y-3 text-sm text-blue-800">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Şifrenizi kimseyle paylaşmayın</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Farklı hesaplar için farklı şifreler kullanın</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Şifrenizi düzenli olarak güncelleyin</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>İki faktörlü doğrulama kullanın</span>
                    </div>
                  </div>
                </div>

                {/* Hesap Bilgileri */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <FiHome className="text-green-600 text-xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Hesap Bilgileri</h3>
                  </div>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Son Giriş:</span>
                      <span className="font-medium">Bugün, 14:30</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Son Şifre Değişikliği:</span>
                      <span className="font-medium">2 hafta önce</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hesap Durumu:</span>
                      <span className="text-green-600 font-medium">Aktif</span>
                    </div>
                  </div>
                </div>

                {/* Hızlı Eylemler */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <FiTool className="text-purple-600 text-xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Hızlı Eylemler</h3>
                  </div>
                  <div className="space-y-3">
                    <button className="w-full px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200">
                      Oturum Geçmişini Görüntüle
                    </button>
                    <button className="w-full px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200">
                      Güvenlik Ayarları
                    </button>
                    <button className="w-full px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200">
                      İki Faktörlü Doğrulama
                    </button>
                  </div>
                </div>
              </div>

              {/* Orta Panel - Ana Form */}
              <div className="lg:col-span-2">
                <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-lg">
                      <FiLock className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Şifre Güncelle</h3>
                      <p className="text-gray-500">Hesap güvenliğiniz için güçlü bir şifre belirleyin</p>
                    </div>
                  </div>
                  
                  <ChangePasswordForm />
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full">
      {/* Tab Menüsü - Mavi Renk */}
      <div className={`${
        sidebarOpen ? 'w-64' : 'w-16'
      } bg-gradient-to-b from-blue-900 to-blue-800 text-white shadow-xl transition-all duration-300 overflow-hidden`}>
        <div className={`${sidebarOpen ? 'p-4' : 'p-2'} border-b border-blue-700`}>
          <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 p-2 rounded-lg">
                <span className="text-xl">📦</span>
              </div>
              {sidebarOpen && (
                <div>
                  <h2 className="text-lg font-bold">Kuzuflex</h2>
                  <p className="text-blue-200 text-xs">Admin Panel</p>
                </div>
              )}
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
        
        <div className={`${sidebarOpen ? 'p-3' : 'p-2'}`}>
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
      </div>

             {/* Tab İçeriği */}
       <div className="flex-1 bg-white transition-all duration-300 overflow-auto">
         <div className={`transition-all duration-300 ${
           sidebarOpen ? 'px-4 py-2' : 'px-3 py-2'
         }`}>
           {renderTabContent()}
         </div>
       </div>
    </div>
  );
};

export default AdminPanel;

import React, { useState } from "react";
import SolutionExtraContentAdder from "../components/SolutionExtraContentAdder";
import SolutionManagement from "../components/SolutionManagement";
import ExtraContentManagement from "../components/ExtraContentManagement";
import AdminProductGroups from "./AdminProductGroups";
import AdminProducts from "../components/AdminProducts";
import QMDocumentsManagement from "../components/QMDocumentsManagement";
import MarketsManagement from "../components/MarketsManagement";
import { 
  FiHome, 
  FiPackage, 
  FiGrid, 
  FiSettings, 
  FiUsers,
  FiTrendingUp,
  FiFileText,
  FiTool,
  FiEdit3,
  FiAward,
  FiGlobe
} from "react-icons/fi";

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");  // admin panelinin başlangıçta hangi taba açılacağını belirler.
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar açık/kapalı durumu 

  const tabs = [
    { id: "dashboard", name: "Dashboard", icon: FiHome },
    { id: "markets", name: "Markets", icon: FiGlobe },
    { id: "product-groups", name: "Üst Kategoriler", icon: FiPackage },
    { id: "products", name: "Alt Ürünler", icon: FiGrid },
    { id: "solutions", name: "Çözümler", icon: FiTool },
    { id: "solution-extra-content", name: "Solution İçerik Ekle", icon: FiEdit3 },
    { id: "qm-documents", name: "QM Documents & Certificates", icon: FiAward },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
            <p>Hoş geldiniz! Buradan sitenizi yönetebilirsiniz.</p>
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
      <div className={`flex-1 bg-white transition-all duration-300 ${
        sidebarOpen ? 'ml-0' : 'ml-0'
      }`}>
        <div className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-0' : 'ml-0'
        }`}>
          <div className={`transition-all duration-300 ${
            sidebarOpen ? 'px-6' : 'px-4'
          }`}>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

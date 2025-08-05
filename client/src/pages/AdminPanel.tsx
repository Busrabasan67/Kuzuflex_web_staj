import React, { useState } from "react";
import SolutionExtraContentAdder from "../components/SolutionExtraContentAdder";
import SolutionManagement from "../components/SolutionManagement";
import ExtraContentManagement from "../components/ExtraContentManagement";
import AdminProductGroups from "./AdminProductGroups";
import AdminProducts from "../components/AdminProducts";
import QMDocumentsManagement from "../components/QMDocumentsManagement";
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
  FiAward
} from "react-icons/fi";

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");  // admin panelinin başlangıçta hangi taba açılacağını belirler. 

  const tabs = [
    { id: "dashboard", name: "Dashboard", icon: FiHome },
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
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
            <p>Hoş geldiniz! Buradan sitenizi yönetebilirsiniz.</p>
          </div>
        );
      case "products":
        return (
          <div className="p-6">
            <AdminProducts />
          </div>
        );
      case "product-groups":
        return (
          <div className="p-6">
            <AdminProductGroups />
          </div>
        );
      case "solutions":
        return (
          <div className="p-6">
            <SolutionManagement />
          </div>
        );
      case "solution-extra-content":
        return (
          <div className="p-6">
            <ExtraContentManagement />
          </div>
        );
      case "qm-documents":
        return (
          <div className="p-6">
            <QMDocumentsManagement />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full">
      {/* Tab Menüsü - Mavi Renk */}
      <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white shadow-xl">
        <div className="p-6 border-b border-blue-700">
          <div className="flex items-center space-x-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <span className="text-xl">📦</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">Kuzuflex</h2>
              <p className="text-blue-200 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <nav className="space-y-2">
                         {tabs.map((tab) => {
               const Icon = tab.icon;
               return (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                     activeTab === tab.id
                       ? "bg-white/20 text-white shadow-lg"
                       : "text-blue-100 hover:bg-white/10 hover:text-white"
                   }`}
                 >
                   <Icon className="mr-3 text-lg" />
                   <span className="font-medium">{tab.name}</span>
                 </button>
               );
             })}
          </nav>
        </div>
      </div>

      {/* Tab İçeriği */}
      <div className="flex-1 bg-white">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminPanel;

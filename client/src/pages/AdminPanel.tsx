import React, { useState } from "react";
import SolutionExtraContentAdder from "../components/SolutionExtraContentAdder";

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs = [
    { id: "dashboard", name: "Dashboard", icon: "📊" },
    { id: "products", name: "Ürünler", icon: "📦" },
    { id: "product-groups", name: "Ürün Grupları", icon: "📁" },
    { id: "solutions", name: "Çözümler", icon: "🔧" },
    { id: "solution-extra-content", name: "Solution İçerik Ekle", icon: "✏️" },
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
            <h2 className="text-2xl font-bold mb-4">Ürün Yönetimi</h2>
            <p>Ürün yönetimi sayfası burada olacak.</p>
          </div>
        );
      case "product-groups":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Ürün Grupları</h2>
            <p>Ürün grupları yönetimi sayfası burada olacak.</p>
          </div>
        );
      case "solutions":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Çözümler</h2>
            <p>Çözümler yönetimi sayfası burada olacak.</p>
          </div>
        );
      case "solution-extra-content":
        return (
          <div className="p-6">
            <SolutionExtraContentAdder />
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
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-white/20 text-white shadow-lg"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="mr-3 text-lg">{tab.icon}</span>
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
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

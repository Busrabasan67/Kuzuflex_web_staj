import React from 'react';
import { FiPackage, FiGrid, FiFileText, FiUsers, FiSettings, FiBarChart, FiTrendingUp, FiShield } from 'react-icons/fi';

const AdminPanel = () => {
  const quickActions = [
    {
      title: "Ürün Yönetimi",
      description: "Ürünleri ekle, düzenle ve yönet",
      icon: FiPackage,
      color: "bg-blue-500",
      path: "/admin/products"
    },
    {
      title: "Kategori Yönetimi",
      description: "Kategorileri organize et",
      icon: FiGrid,
      color: "bg-green-500",
      path: "/admin/categories"
    },
    {
      title: "Katalog Yönetimi",
      description: "PDF katalogları yönet",
      icon: FiFileText,
      color: "bg-yellow-500",
      path: "/admin/catalogs"
    },
    {
      title: "Kullanıcı Yönetimi",
      description: "Kullanıcı hesaplarını yönet",
      icon: FiUsers,
      color: "bg-purple-500",
      path: "/admin/users"
    },
    {
      title: "Sistem Ayarları",
      description: "Sistem konfigürasyonları",
      icon: FiSettings,
      color: "bg-gray-500",
      path: "/admin/settings"
    },
    {
      title: "Analitik",
      description: "Detaylı raporlar ve analizler",
      icon: FiBarChart,
      color: "bg-indigo-500",
      path: "/admin/analytics"
    }
  ];

  const stats = [
    { label: "Toplam Ürün", value: "1,234", color: "text-blue-600" },
    { label: "Aktif Kategoriler", value: "45", color: "text-green-600" },
    { label: "Toplam Katalog", value: "12", color: "text-purple-600" },
    { label: "Aktif Kullanıcılar", value: "156", color: "text-orange-600" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Paneli</h1>
              <p className="text-gray-600 mt-1">Kuzuflex Yönetim Sistemi</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FiShield className="w-4 h-4" />
                <span>Admin</span>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`${stat.color.replace('text-', 'bg-')} p-3 rounded-lg bg-opacity-10`}>
                  <div className={`w-6 h-6 ${stat.color}`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ana İçerik */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Hızlı Erişim</h2>
            <FiTrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <div key={index} className="group cursor-pointer">
                  <div className={`${action.color} p-6 rounded-lg text-white transition-all duration-200 group-hover:shadow-lg group-hover:scale-105`}>
                    <div className="flex items-center justify-between mb-4">
                      <IconComponent className="w-8 h-8" />
                      <div className="w-2 h-2 bg-white rounded-full opacity-50"></div>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                    <p className="text-white text-sm opacity-90">{action.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alt Bilgi Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sistem Durumu</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Veritabanı</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">Aktif</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Servisi</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">Aktif</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Dosya Sistemi</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">Aktif</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Aktiviteler</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Yeni ürün eklendi</p>
                  <p className="text-xs text-gray-500">2 dakika önce</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Kategori güncellendi</p>
                  <p className="text-xs text-gray-500">15 dakika önce</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Katalog yüklendi</p>
                  <p className="text-xs text-gray-500">1 saat önce</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

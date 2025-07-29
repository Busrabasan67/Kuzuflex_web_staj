import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiPackage, FiGrid, FiFileText, FiUsers, FiSettings, FiBarChart, FiLogOut, FiMenu, FiX } from "react-icons/fi";

const AdminSidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const menu = [
    { 
      label: "Dashboard", 
      path: "/admin", 
      icon: FiHome,
      description: "Ana sayfa"
    },
    { 
      label: "Ürünler", 
      path: "/admin/products", 
      icon: FiPackage,
      description: "Ürün yönetimi"
    },
    { 
      label: "Kategoriler", 
      path: "/admin/categories", 
      icon: FiGrid,
      description: "Kategori yönetimi"
    },
    { 
      label: "Kataloglar", 
      path: "/admin/catalogs", 
      icon: FiFileText,
      description: "PDF katalogları"
    },
    { 
      label: "Kullanıcılar", 
      path: "/admin/users", 
      icon: FiUsers,
      description: "Kullanıcı yönetimi"
    },
    { 
      label: "Analitik", 
      path: "/admin/analytics", 
      icon: FiBarChart,
      description: "Raporlar ve analizler"
    },
    { 
      label: "Ayarlar", 
      path: "/admin/settings", 
      icon: FiSettings,
      description: "Sistem ayarları"
    }
  ];

  return (
    <div className={`bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-64'
    } min-h-screen shadow-xl relative`}>
      
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white text-blue-900 p-2 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200"
      >
        {isCollapsed ? <FiMenu className="w-4 h-4" /> : <FiX className="w-4 h-4" />}
      </button>

      {/* Logo Section */}
      <div className="p-6 border-b border-blue-700">
        <div className="flex items-center space-x-3">
          <div className="bg-white/10 p-2 rounded-lg">
            <FiPackage className="w-6 h-6" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-xl font-bold">Kuzuflex</h2>
              <p className="text-blue-200 text-xs">Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2">
        {menu.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-white/20 text-white shadow-lg' 
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className={`p-2 rounded-lg transition-colors duration-200 ${
                isActive ? 'bg-white/20' : 'group-hover:bg-white/10'
              }`}>
                <IconComponent className="w-5 h-5" />
              </div>
              {!isCollapsed && (
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {item.description}
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">A</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <div className="text-sm font-medium">Admin User</div>
              <div className="text-xs text-blue-300">admin@kuzuflex.com</div>
            </div>
          )}
          <button className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200">
            <FiLogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Collapsed Tooltips */}
      {isCollapsed && (
        <div className="absolute left-full top-0 ml-2 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200">
          <div className="text-sm font-medium">Dashboard</div>
          <div className="text-xs text-gray-300">Ana sayfa</div>
        </div>
      )}
    </div>
  );
};

export default AdminSidebar;

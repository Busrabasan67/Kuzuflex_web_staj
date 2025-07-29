// client/src/components/LogoutButton.tsx
import React from "react";
import { FiLogOut, FiUser } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const LogoutButton: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout(); // AuthContext içindeki logout fonksiyonunu çalıştırır
  };

  return (
    <div className="flex items-center space-x-3">
      {/* User Info */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <FiUser className="w-4 h-4 text-blue-600" />
        </div>
        <div className="hidden sm:block">
          <div className="font-medium text-gray-900">Admin</div>
          <div className="text-xs text-gray-500">admin@kuzuflex.com</div>
        </div>
      </div>
      
      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <FiLogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Çıkış Yap</span>
      </button>
    </div>
  );
};

export default LogoutButton;

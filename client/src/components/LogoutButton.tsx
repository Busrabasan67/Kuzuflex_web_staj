// client/src/components/LogoutButton.tsx
import React from "react";
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const LogoutButton: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout(); // AuthContext içindeki logout fonksiyonunu çalıştırır
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
    >
      <FiLogOut className="w-4 h-4" />
      <span>Çıkış Yap</span>
    </button>
  );
};

export default LogoutButton;

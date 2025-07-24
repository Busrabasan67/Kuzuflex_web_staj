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
      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
    >
      <FiLogOut />
      Çıkış Yap
    </button>
  );
};

export default LogoutButton;

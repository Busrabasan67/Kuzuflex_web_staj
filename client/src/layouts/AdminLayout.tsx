import React from "react";
import Sidebar from "../components/AdminSidebar"; // Aşağıda yazacağız
import LogoutButton from "../components/LogoutButton";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6 bg-gray-100">
        <div className="flex justify-end mb-4">
          <LogoutButton />
        </div>
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;

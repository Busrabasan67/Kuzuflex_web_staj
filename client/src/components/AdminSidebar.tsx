import React from "react";
import { Link, useLocation } from "react-router-dom";

const AdminSidebar = () => {
  const location = useLocation(); // şu anki yolu alır

  const menu = [
    { label: "Dashboard", path: "/admin" },
    { label: "Ürünler", path: "/admin/products" },
    { label: "Siparişler", path: "/admin/orders" },
    { label: "Kullanıcılar", path: "/admin/users" },
    // Genişletilebilir...
  ];

  return (
    <div className="w-64 bg-blue-900 text-white p-6 space-y-4 shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
      {menu.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`block px-4 py-2 rounded hover:bg-blue-700 transition ${
            location.pathname === item.path ? "bg-blue-700" : ""
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
};

export default AdminSidebar;

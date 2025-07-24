import React from 'react';

const AdminPanel= () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Paneli</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-lg p-4 shadow">
          <h2 className="text-xl font-semibold mb-2">Ürün Yönetimi</h2>
          <button className="bg-blue-500 text-white px-4 py-2 rounded">Ürünleri Yönet</button>
        </div>
        <div className="border rounded-lg p-4 shadow">
          <h2 className="text-xl font-semibold mb-2">Kategori Yönetimi</h2>
          <button className="bg-green-500 text-white px-4 py-2 rounded">Kategorileri Yönet</button>
        </div>
        <div className="border rounded-lg p-4 shadow">
          <h2 className="text-xl font-semibold mb-2">Katalog Yönetimi</h2>
          <button className="bg-yellow-500 text-white px-4 py-2 rounded">Katalogları Yönet</button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

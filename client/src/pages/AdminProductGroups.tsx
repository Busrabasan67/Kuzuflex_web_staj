import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const API_BASE = "http://localhost:5000";

interface ProductGroup {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  standard: string;
  translations: any[];
  productCount: number;
}

const AdminProductGroups = () => {
  const { t } = useTranslation();
  const [groups, setGroups] = useState<ProductGroup[]>([]); // üst kategori verilerini tutar. ProductGroup[] → ProductGroup tipinde nesnelerden oluşan bir dizi başlangıçta boş dizi.
  const [loading, setLoading] = useState(true); //verilerin yüklenip yüklenmediğini kontrol eder.
  const [error, setError] = useState<string | null>(null); // hata olup olmadığını kontrol eder.

  useEffect(() => { // sayfa yüklendiğinde verileri alır. sayfa ilk açıldığında fetchGroups fonksiyonu çağrılır ve API'dan veriler alınır.
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/product-groups/admin`); // API'den /api/product-groups/admin endpoint'ine istek gönderir.
      
      if (!response.ok) {
        throw new Error('Veriler alınamadı');
      }
      
      const data = await response.json(); // API'den gelen verileri JSON formatına çevirir.
      setGroups(data); // gelen JSON verileri setGroups fonksiyonu ile üst kategori verileri olarak tutulur. 
      setError(null); // hata yoksa hata mesajı null olarak tutulur.
    } catch (err) {
      console.error('❌ Grup verileri alınamadı:', err); // hata mesajı console'a yazdırılır.
      setError('Veriler yüklenirken hata oluştu'); // hata mesajı setError fonksiyonu ile hata mesajı olarak tutulur.
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-5"></div>
          <p className="text-lg text-gray-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-5">😕</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Hata</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Üst Kategori Yönetimi
        </h1>
        <p className="text-gray-600">
          Ürün gruplarını görüntüleyin, düzenleyin ve yönetin
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            + Yeni Kategori Ekle
          </button>
          <button 
            onClick={fetchGroups}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            🔄 Yenile
          </button>
        </div>
        <div className="text-sm text-gray-500">
          Toplam: {groups.length} kategori
        </div>
      </div>

      {/* Groups Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto max-w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  ID
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Görsel
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                  İsim
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                  Açıklama
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Standart
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Alt Ürün
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Çeviri
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {groups.map((group) => (
                <tr key={group.id} className="hover:bg-gray-50">
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{group.id}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    {group.imageUrl ? (
                      <img
                        src={`${API_BASE}/${group.imageUrl.startsWith('/') ? group.imageUrl.slice(1) : group.imageUrl}`}
                        alt={group.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No</span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="max-w-xs truncate" title={group.name}>
                      {group.name}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    <div className="max-w-xs truncate" title={group.description || '-'}>
                      {group.description || '-'}
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="max-w-xs truncate" title={group.standard || '-'}>
                      {group.standard || '-'}
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {group.productCount}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {group.translations.length}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button className="bg-blue-500 hover:bg-blue-600 text-white transition-colors px-3 py-1.5 rounded-md text-xs font-medium shadow-sm">
                        Düzenle
                      </button>
                      <button className="bg-red-500 hover:bg-red-600 text-white transition-colors px-3 py-1.5 rounded-md text-xs font-medium shadow-sm">
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {groups.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz kategori yok</h3>
            <p className="text-gray-500">İlk kategoriyi ekleyerek başlayın</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductGroups; 
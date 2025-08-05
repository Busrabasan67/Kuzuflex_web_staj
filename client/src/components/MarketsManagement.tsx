import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiEye, 
  FiEyeOff,
  FiImage,
  FiGlobe,
  FiSettings
} from "react-icons/fi";
import AddMarketModal from "./AddMarketModal";

interface Market {
  id: number;
  slug: string;
  name: string;
  description: string;
  imageUrl?: string;
  order: number;
  isActive: boolean;
  hasProducts: boolean;
  hasSolutions: boolean;
  hasCertificates: boolean;
  contents: MarketContent[];
}

interface MarketContent {
  id: number;
  type: string;
  level: string;
  name: string;
  targetUrl: string;
  order: number;
}

const MarketsManagement: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchMarkets();
  }, [i18n.language]);

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/markets?language=${i18n.language}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch markets');
      }
      
      const data = await response.json();
      setMarkets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMarket = async (id: number) => {
    if (!window.confirm('Bu market\'i silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/markets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete market');
      }

      // Silinen market'i listeden kaldır
      setMarkets(markets.filter(market => market.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`http://localhost:5000/api/markets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !currentStatus
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update market');
      }

      // Market'i güncelle
      setMarkets(markets.map(market => 
        market.id === id ? { ...market, isActive: !currentStatus } : market
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Markets Yönetimi</h2>
          <p className="text-gray-600 mt-1">Market kategorilerini yönetin ve düzenleyin</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <FiPlus className="mr-2" />
          Yeni Market Ekle
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiGlobe className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Market</p>
              <p className="text-2xl font-bold text-gray-900">{markets.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiEye className="text-green-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktif Market</p>
              <p className="text-2xl font-bold text-gray-900">{markets.filter(m => m.isActive).length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiSettings className="text-purple-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ürünlü Market</p>
              <p className="text-2xl font-bold text-gray-900">{markets.filter(m => m.hasProducts).length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FiSettings className="text-orange-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Çözümlü Market</p>
              <p className="text-2xl font-bold text-gray-900">{markets.filter(m => m.hasSolutions).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Markets Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Market Listesi</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Market
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sıra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İçerikler
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {markets.map((market) => (
                <tr key={market.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {market.imageUrl ? (
                          <img 
                            className="h-10 w-10 rounded-lg object-cover" 
                            src={`http://localhost:5000${market.imageUrl}`}
                            alt={market.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                            <FiImage className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{market.name}</div>
                        <div className="text-sm text-gray-500">{market.description?.substring(0, 50)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {market.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {market.order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(market.id, market.isActive)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        market.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {market.isActive ? (
                        <>
                          <FiEye className="mr-1" />
                          Aktif
                        </>
                      ) : (
                        <>
                          <FiEyeOff className="mr-1" />
                          Pasif
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex space-x-2">
                      {market.hasProducts && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Ürünler
                        </span>
                      )}
                      {market.hasSolutions && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Çözümler
                        </span>
                      )}
                      {market.hasCertificates && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Sertifikalar
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteMarket(market.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {markets.length === 0 && (
          <div className="text-center py-12">
            <FiGlobe className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz market yok</h3>
            <p className="mt-1 text-sm text-gray-500">İlk market'i ekleyerek başlayın.</p>
          </div>
        )}
      </div>

      {/* Add Market Modal */}
      <AddMarketModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onMarketAdded={() => {
          setIsAddModalOpen(false);
          fetchMarkets(); // Listeyi yenile
        }}
      />
    </div>
  );
};

export default MarketsManagement; 
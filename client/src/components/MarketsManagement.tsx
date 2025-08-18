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
import EditMarketModal from "./EditMarketModal";
import DeleteMarketModal from "./DeleteMarketModal";

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
  const { t } = useTranslation();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingMarketId, setEditingMarketId] = useState<number | null>(null);
  const [deletingMarket, setDeletingMarket] = useState<Market | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Toast states
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  }>({ show: false, type: 'info', message: '' });

  useEffect(() => {
    fetchMarkets();
  }, []); // Sadece component mount olduğunda çalışsın

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      const url = `http://localhost:5000/api/markets?language=tr&admin=true`; // Admin panelinde sabit Türkçe kullan
      console.log(' Market verileri getiriliyor:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch markets');
      }
      
      const data = await response.json();
      console.log(' API\'den gelen market verileri:', data);
      console.log(' Market sayısı:', data.length);
      
      if (data.length > 0) {
        console.log(' İlk market örneği:', {
          id: data[0].id,
          name: data[0].name,
          isActive: data[0].isActive,
          slug: data[0].slug,
          contents: data[0].contents
        });
      }
      
      setMarkets(data);
    } catch (err) {
      console.error(' Market verileri alınırken hata:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type: 'info', message: '' });
    }, 4000);
  };

  const handleDeleteMarket = (market: Market) => {
    setDeletingMarket(market);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingMarket) return;

    try {
      setIsDeleting(true);
      console.log(' Market silme isteği gönderiliyor, ID:', deletingMarket.id);
      
      const response = await fetch(`http://localhost:5000/api/markets/${deletingMarket.id}`, {
        method: 'DELETE',
      });

      console.log(' Response status:', response.status);
      console.log(' Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete market');
      }

      console.log(' Market başarıyla silindi');
      
      // Toast bildirimi
      showToast("success", `${deletingMarket.name} market'i başarıyla silindi.`);
      
      // Market verilerini yeniden yükle
      await fetchMarkets();
      
      // Modal'ı kapat
      setIsDeleteModalOpen(false);
      setDeletingMarket(null);
    } catch (err) {
      console.error(' Market silme hatası:', err);
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      setError(errorMessage);
      showToast("error", `Market silinirken hata oluştu: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeletingMarket(null);
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      console.log(' Market durumu değiştiriliyor:', { id, currentStatus, newStatus: !currentStatus });
      
      // FormData ile sadece isActive değerini gönder
      const formData = new FormData();
      formData.append('isActive', (!currentStatus).toString());
      
      const response = await fetch(`http://localhost:5000/api/markets/${id}`, {
        method: 'PUT',
        body: formData, // Content-Type header'ı otomatik olarak multipart/form-data olacak
      });

      console.log(' Response status:', response.status);
      console.log(' Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error(' API Error:', errorData);
        throw new Error(errorData.message || 'Failed to update market');
      }

      const result = await response.json();
      console.log(' Market güncellendi:', result);

      // Market verilerini yeniden yükle (Footer'da da güncellensin)
      await fetchMarkets();
      
      // Toast bildirimi
      showToast("success", `Market başarıyla ${!currentStatus ? 'aktif' : 'pasif'} hale getirildi.`);
    } catch (err) {
      console.error(' Toggle hatası:', err);
      const errorMessage = err instanceof Error ? err.message : 'Update failed';
      setError(errorMessage);
      showToast("error", `Market durumu güncellenirken hata oluştu: ${errorMessage}`);
    }
  };

  const handleEditMarket = (marketId: number) => {
    setEditingMarketId(marketId);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = async () => {
    setIsEditModalOpen(false);
    setEditingMarketId(null);
    await fetchMarkets(); // Listeyi yenile
    showToast("success", "Market başarıyla güncellendi.");
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setEditingMarketId(null);
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
                    <div className="flex flex-wrap gap-1">
                      {/* Gerçek içerikleri göster */}
                      {market.contents && market.contents.length > 0 ? (
                        market.contents.slice(0, 3).map((content, index) => (
                          <span 
                            key={content.id} 
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            title={content.name}
                          >
                            {content.name || content.type}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs">İçerik yok</span>
                      )}
                      
                      {/* Toplam içerik sayısını göster */}
                      {market.contents && market.contents.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          +{market.contents.length - 3} daha
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditMarket(market.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteMarket(market)}
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
        onMarketAdded={async () => {
          setIsAddModalOpen(false);
          await fetchMarkets(); // Listeyi yenile
          showToast("success", "Yeni market başarıyla eklendi.");
        }}
      />

      {/* Edit Market Modal */}
      <EditMarketModal
        isOpen={isEditModalOpen}
        marketId={editingMarketId}
        onClose={handleEditClose}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Market Modal */}
      <DeleteMarketModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        market={deletingMarket}
        isLoading={isDeleting}
      />

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`rounded-lg shadow-lg p-4 max-w-sm transform transition-all duration-300 ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : toast.type === 'error' 
              ? 'bg-red-500 text-white' 
              : 'bg-blue-500 text-white'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {toast.type === 'success' ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : toast.type === 'error' ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setToast({ show: false, type: 'info', message: '' })}
                  className="inline-flex text-white hover:text-gray-200 focus:outline-none"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketsManagement; 
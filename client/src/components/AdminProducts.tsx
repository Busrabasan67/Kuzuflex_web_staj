import React, { useEffect, useState } from 'react';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import CatalogManagementModal from './CatalogManagementModal';

const API_BASE = "http://localhost:5000";

// Alt ürün (Product) tipini tanımlar
interface Product {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  standard: string;
  groupId: number | null;
  groupName: string;
  hasCatalog?: boolean;
  catalogCount?: number;
  createdAt: string; // Oluşturulma tarihi
  updatedAt: string; // Güncellenme tarihi
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showOnlyWithCatalog, setShowOnlyWithCatalog] = useState(false);

  // Katalog yönetimi için state'ler ekle
const [showCatalogModal, setShowCatalogModal] = useState(false);
const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

// Toast states
const [toast, setToast] = useState<{
  show: boolean;
  type: 'success' | 'error' | 'info';
  message: string;
}>({ show: false, type: 'info', message: '' });

// Katalog modal'ını aç
const handleCatalogClick = (productId: number) => {
  setSelectedProductId(productId);
  setShowCatalogModal(true);
};


  // Sayfa yüklendiğinde ve filtre değiştiğinde ürünleri getirir
  useEffect(() => {
    fetchProducts();
  }, [showOnlyWithCatalog]);

  // API'dan alt ürünleri çeker
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const url = showOnlyWithCatalog 
        ? `${API_BASE}/api/products/all?hasCatalog=true`
        : `${API_BASE}/api/products/all`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Veriler alınamadı');
      }
      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error('❌ Ürün verileri alınamadı:', err);
      setError('Veriler yüklenirken hata oluştu');
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

  // Modal başarılı olduğunda ürünleri yeniden yükle
  const handleAddSuccess = () => {
    fetchProducts();
    showToast('success', 'Ürün başarıyla eklendi!');
  };

  // Düzenleme modal'ını aç
  const handleEditClick = (productId: number) => {
    setEditingProductId(productId);
    setShowEditModal(true);
  };

  // Düzenleme başarılı olduğunda ürünleri yeniden yükle
  const handleEditSuccess = () => {
    fetchProducts();
    showToast('success', 'Ürün başarıyla güncellendi!');
  };

  // Düzenleme modal'ını kapat
  const handleEditClose = () => {
    setShowEditModal(false);
    setEditingProductId(null);
  };

  // Silme dialog'unu aç
  const handleDeleteClick = (product: Product) => {
    setDeletingProduct(product);
    setShowDeleteDialog(true);
  };

  // Silme işlemini gerçekleştir
  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;

    try {
      setDeleteLoading(true);
      const response = await fetch(`${API_BASE}/api/products/${deletingProduct.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ürün silinemedi');
      }

      // Başarılı silme sonrası listeyi yenile
      await fetchProducts();
      showToast('success', 'Ürün başarıyla silindi!');
      setShowDeleteDialog(false);
      setDeletingProduct(null);
      
    } catch (err) {
      console.error('❌ Ürün silme hatası:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ürün silinirken hata oluştu';
      showToast('error', errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Silme dialog'unu kapat
  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setDeletingProduct(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Hata</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Alt Ürünler</h2>
          <p className="text-sm sm:text-base text-gray-600">Tüm alt ürünleri görüntüleyin ve yönetin</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          {/* Katalog Filtresi */}
          <button
            onClick={() => setShowOnlyWithCatalog(!showOnlyWithCatalog)}
            className={`px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 text-sm sm:text-base ${
              showOnlyWithCatalog 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{showOnlyWithCatalog ? 'Tüm Ürünler' : 'Sadece Katalogu Olanlar'}</span>
          </button>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 text-sm sm:text-base"
          >
            <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Yeni Ürün Ekle</span>
          </button>
        </div>
      </div>

      {/* Ürün Listesi */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">
            Toplam {products.length} ürün
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16 sm:w-20">
                  Görsel
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 sm:w-40 lg:w-48">
                  Başlık
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 sm:w-40 lg:w-48">
                  Açıklama
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 sm:w-32">
                  Üst Kategori
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 sm:w-28">
                  Standart
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 sm:w-32">
                  Katalog
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28 sm:w-36">
                  TARIH
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 sm:w-40">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    {product.imageUrl ? (
                      <img
                        src={`${API_BASE}${product.imageUrl.startsWith('/') ? product.imageUrl : `/${product.imageUrl}`}`}
                        alt={product.title}
                        className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg object-cover"
                        onLoad={() => console.log('✅ Admin panel resim yüklendi:', product.title)}
                        onError={(e) => {
                          console.log('❌ Admin panel resim yüklenemedi:', product.title, product.imageUrl);
                          // Resim yüklenemezse placeholder göster
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`h-8 w-8 sm:h-12 sm:w-12 bg-gray-200 rounded-lg flex items-center justify-center ${product.imageUrl ? 'hidden' : ''}`}>
                      <svg className="h-4 w-4 sm:h-6 sm:w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 max-w-24 sm:max-w-32 lg:max-w-48 truncate" title={product.title}>
                      {product.title}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-24 sm:max-w-32 lg:max-w-48 truncate" title={product.description}>
                      {product.description}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {product.groupName}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="max-w-16 sm:max-w-20 lg:max-w-28 truncate" title={product.standard || '-'}>
                      {product.standard || '-'}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    {product.hasCatalog ? (
                      <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="hidden sm:inline">{product.catalogCount || 0} katalog</span>
                        <span className="sm:hidden">{product.catalogCount || 0}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <span className="hidden sm:inline">Katalog yok</span>
                        <span className="sm:hidden">-</span>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">Oluşturulma:</span>
                        <span className="text-xs">{product.createdAt ? new Date(product.createdAt).toLocaleDateString('tr-TR') : '-'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">Güncelleme:</span>
                        <span className={`text-xs ${product.updatedAt !== product.createdAt ? 'text-blue-600 font-medium' : ''}`}>
                          {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('tr-TR') : '-'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                      <button
                        onClick={() => handleEditClick(product.id)}
                        className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="hidden sm:inline">Düzenle</span>
                        <span className="sm:hidden">✏️</span>
                      </button>
                      
                      <button
                        onClick={() => handleCatalogClick(product.id)}
                        className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="hidden sm:inline">Kataloglar</span>
                        <span className="sm:hidden">📚</span>
                      </button>
                      
                      <button
                        onClick={() => handleDeleteClick(product)}
                        className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="hidden sm:inline">Sil</span>
                        <span className="sm:hidden">🗑️</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={showEditModal}
        productId={editingProductId}
        onClose={handleEditClose}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && deletingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Alt Ürünü Sil</h3>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  "<span className="font-semibold">{deletingProduct.title}</span>" alt ürününü silmek istediğinizden emin misiniz?
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Bu işlem geri alınamaz ve ürünün tüm çevirileri silinecektir.
                </p>
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  disabled={deleteLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Siliniyor...</span>
                    </div>
                  ) : (
                    'Evet, Sil'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Management Modal */}
      <CatalogManagementModal
        isOpen={showCatalogModal}
        productId={selectedProductId}
        onClose={() => {
          setShowCatalogModal(false);
          setSelectedProductId(null);
        }}
        onSuccess={() => {
          fetchProducts(); // Ürünleri yeniden yükle
        }}
        showToast={showToast}
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

export default AdminProducts; 
import React, { useState, useEffect } from 'react';
import ErrorModal from './ErrorModal';

const API_BASE = "http://localhost:5000";

interface Catalog {
  id: number;
  filePath: string;
  name: string;
  translations: Array<{
    language: string;
    name: string;
  }>;
}

interface CatalogManagementModalProps {
  isOpen: boolean;
  productId: number | null;
  onClose: () => void;
  onSuccess: () => void;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

const CatalogManagementModal: React.FC<CatalogManagementModalProps> = ({
  isOpen,
  productId,
  onClose,
  onSuccess,
  showToast
}) => {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false); // Yeni state
  const [editingCatalog, setEditingCatalog] = useState<Catalog | null>(null); // Yeni state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [translations, setTranslations] = useState([
    { language: 'tr', name: '' },
    { language: 'en', name: '' },
    { language: 'de', name: '' },
    { language: 'fr', name: '' }
  ]);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

  // Silme modal'ı için state'ler
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCatalog, setDeletingCatalog] = useState<Catalog | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast states


  // Katalogları getir
  const fetchCatalogs = async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/catalogs/product/${productId}`);
      if (!response.ok) throw new Error('Kataloglar alınamadı');
      const data = await response.json();
      setCatalogs(data);
    } catch (error) {
      console.error('Katalog getirme hatası:', error);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    if (isOpen && productId) {
      fetchCatalogs();
    }
  }, [isOpen, productId]);

  // Katalog düzenleme modal'ını aç
  const handleEditCatalog = (catalog: Catalog) => {
    setEditingCatalog(catalog);
    setTranslations(catalog.translations || [
      { language: 'tr', name: '' },
      { language: 'en', name: '' },
      { language: 'de', name: '' },
      { language: 'fr', name: '' }
    ]);
    setShowEditForm(true);
  };

  // Katalog güncelle
  const handleUpdateCatalog = async () => {
    if (!editingCatalog) {
      setErrorModal({ isOpen: true, message: 'Düzenlenecek katalog bulunamadı' });
      return;
    }

    // PDF format kontrolü (sadece yeni dosya seçildiyse)
    if (selectedFile && selectedFile.type !== "application/pdf") {
      setErrorModal({ 
        isOpen: true, 
        message: "Lütfen sadece PDF dosyası seçin. Seçtiğiniz dosya: " + selectedFile.name 
      });
      return;
    }

    // TÜM DİLLER ZORUNLU
    const emptyLangs = translations.filter(t => t.name.trim() === '').map(t => t.language.toUpperCase());
    if (emptyLangs.length > 0) {
      setErrorModal({
        isOpen: true,
        message: `Aşağıdaki dillerde katalog adı zorunludur: ${emptyLangs.join(', ')}`
      });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      
      // Eğer yeni dosya seçildiyse ekle
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      
      formData.append('translations', JSON.stringify(translations));

      const response = await fetch(`${API_BASE}/api/catalogs/${editingCatalog.id}`, {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Backend error:', errorData); // Debug için
        throw new Error(errorData.message || 'Katalog güncellenemedi');
      }

      // Form'u sıfırla
      setSelectedFile(null);
      setTranslations([
        { language: 'tr', name: '' },
        { language: 'en', name: '' },
        { language: 'de', name: '' },
        { language: 'fr', name: '' }
      ]);
      setShowEditForm(false);
      setEditingCatalog(null);

      // Katalogları yeniden yükle
      await fetchCatalogs();
      showToast('success', 'Katalog başarıyla güncellendi!');
      onSuccess();
    } catch (error) {
      console.error('Katalog güncelleme hatası:', error);
      const errorMessage = error instanceof Error ? error.message : 'Katalog güncellenirken hata oluştu';
      showToast('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Düzenleme modal'ını kapat
  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditingCatalog(null);
    setSelectedFile(null);
    setTranslations([
      { language: 'tr', name: '' },
      { language: 'en', name: '' },
      { language: 'de', name: '' },
      { language: 'fr', name: '' }
    ]);
  };

  // Katalog ekle
  const handleAddCatalog = async () => {
    // Validasyon kontrolleri
    if (!productId) {
      setErrorModal({ isOpen: true, message: 'Ürün ID bulunamadı' });
      return;
    }

    if (!selectedFile) {
      setErrorModal({ isOpen: true, message: 'Lütfen bir PDF dosyası seçin' });
      return;
    }

    // PDF format kontrolü
    if (selectedFile.type !== "application/pdf") {
      setErrorModal({ 
        isOpen: true, 
        message: "Lütfen sadece PDF dosyası seçin. Seçtiğiniz dosya: " + selectedFile.name 
      });
      return;
    }

    // TÜM DİLLER ZORUNLU
    const emptyLangs = translations.filter(t => t.name.trim() === '').map(t => t.language.toUpperCase());
    if (emptyLangs.length > 0) {
      setErrorModal({
        isOpen: true,
        message: `Aşağıdaki dillerde katalog adı zorunludur: ${emptyLangs.join(', ')}`
      });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('translations', JSON.stringify(translations));

      const response = await fetch(`${API_BASE}/api/catalogs/product/${productId}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Backend error:', errorData); // Debug için
        throw new Error(errorData.message || 'Katalog eklenemedi');
      }

      // Form'u sıfırla
      setSelectedFile(null);
      setTranslations([
        { language: 'tr', name: '' },
        { language: 'en', name: '' },
        { language: 'de', name: '' },
        { language: 'fr', name: '' }
      ]);
      setShowAddForm(false);

      // Katalogları yeniden yükle
      await fetchCatalogs();
      showToast('success', 'Katalog başarıyla eklendi!');
      onSuccess();
    } catch (error) {
      console.error('Katalog ekleme hatası:', error);
      const errorMessage = error instanceof Error ? error.message : 'Katalog eklenirken hata oluştu';
      showToast('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Katalog silme modal'ını aç
  const handleDeleteClick = (catalog: Catalog) => {
    setDeletingCatalog(catalog);
    setShowDeleteModal(true);
  };

  // Katalog silme işlemini gerçekleştir
  const handleDeleteConfirm = async () => {
    if (!deletingCatalog) return;

    try {
      setDeleteLoading(true);
      const response = await fetch(`${API_BASE}/api/catalogs/${deletingCatalog.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Katalog silinemedi');

      await fetchCatalogs();
      showToast('success', 'Katalog başarıyla silindi!');
      onSuccess();
      setShowDeleteModal(false);
      setDeletingCatalog(null);
    } catch (error) {
      console.error('Katalog silme hatası:', error);
      const errorMessage = error instanceof Error ? error.message : 'Katalog silinirken hata oluştu';
      showToast('error', errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Silme modal'ını kapat
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeletingCatalog(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {console.log('ErrorModal state:', errorModal)} {/* Debug için */}
      <ErrorModal 
        isOpen={errorModal.isOpen} 
        message={errorModal.message} 
        onClose={() => setErrorModal({ isOpen: false, message: '' })} 
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingCatalog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Katalogu Sil</h3>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">{deletingCatalog.name}</p>
                    <p className="text-sm text-gray-500">{deletingCatalog.filePath}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  "<span className="font-semibold">{deletingCatalog.name}</span>" katalogunu silmek istediğinizden emin misiniz?
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Bu işlem geri alınamaz ve katalog dosyası kalıcı olarak silinecektir.
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
      
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Katalog Yönetimi</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          {/* Katalog Ekleme Butonu */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Yeni Katalog Ekle</span>
            </button>
          </div>

          {/* Katalog Ekleme Formu */}
          {showAddForm && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h4 className="text-md font-medium mb-4">Yeni Katalog</h4>
              
              {/* PDF Dosyası Seçimi */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PDF Dosyası <span className="text-red-500">*</span>
                </label>
                                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Dosya formatını kontrol et
                        if (file.type !== "application/pdf") {
                          setErrorModal({ 
                            isOpen: true, 
                            message: "Lütfen sadece PDF dosyası seçin. Seçtiğiniz dosya: " + file.name 
                          });
                          e.target.value = ""; // Input'u temizle
                          setSelectedFile(null);
                          return;
                        }
                        setSelectedFile(file);
                      } else {
                        setSelectedFile(null);
                      }
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
              </div>

              {/* Çeviri Alanları */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {translations.map((translation, index) => (
                  <div key={translation.language}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {translation.language.toUpperCase()} Adı
                    </label>
                    <input
                      type="text"
                      value={translation.name}
                      onChange={(e) => {
                        const newTranslations = [...translations];
                        newTranslations[index].name = e.target.value;
                        setTranslations(newTranslations);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`${translation.language.toUpperCase()} katalog adı`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                                 <button
                   onClick={handleAddCatalog}
                   disabled={loading}
                   className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                 >
                   {loading ? 'Ekleniyor...' : 'Katalog Ekle'}
                 </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
                >
                  İptal
                </button>
              </div>
            </div>
          )}

          {/* Katalog Düzenleme Formu */}
          {showEditForm && editingCatalog && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h4 className="text-md font-medium mb-4">Katalog Düzenle</h4>
              
                             {/* PDF Dosyası Seçimi (Opsiyonel - Düzenleme) */}
               <div className="mb-4">
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   PDF Dosyası <span className="text-gray-400">(Opsiyonel)</span>
                 </label>
                 <div className="mb-2">
                   <p className="text-sm text-gray-600 mb-2">
                     Mevcut dosya: <span className="font-medium">{editingCatalog?.filePath}</span>
                   </p>
                 </div>
                 <input
                   type="file"
                   accept=".pdf"
                   onChange={(e) => {
                     const file = e.target.files?.[0];
                     if (file) {
                       // Dosya formatını kontrol et
                       if (file.type !== "application/pdf") {
                         setErrorModal({ 
                           isOpen: true, 
                           message: "Lütfen sadece PDF dosyası seçin. Seçtiğiniz dosya: " + file.name 
                         });
                         e.target.value = ""; // Input'u temizle
                         setSelectedFile(null);
                         return;
                       }
                       setSelectedFile(file);
                     } else {
                       setSelectedFile(null);
                     }
                   }}
                   className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                 />
                 <p className="text-xs text-gray-500 mt-1">
                   Yeni PDF dosyası seçmezseniz mevcut dosya korunacaktır
                 </p>
               </div>

              {/* Çeviri Alanları */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {translations.map((translation, index) => (
                  <div key={translation.language}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {translation.language.toUpperCase()} Adı
                    </label>
                    <input
                      type="text"
                      value={translation.name}
                      onChange={(e) => {
                        const newTranslations = [...translations];
                        newTranslations[index].name = e.target.value;
                        setTranslations(newTranslations);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`${translation.language.toUpperCase()} katalog adı`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                                                   <button
                    onClick={handleUpdateCatalog}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                  >
                    {loading ? 'Güncelleniyor...' : 'Katalog Güncelle'}
                  </button>
                <button
                  onClick={handleCancelEdit}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
                >
                  İptal
                </button>
              </div>
            </div>
          )}

          {/* Katalog Listesi */}
          <div>
            <h4 className="text-md font-medium mb-4">Mevcut Kataloglar</h4>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : catalogs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Henüz katalog eklenmemiş</p>
            ) : (
              <div className="space-y-3">
                {catalogs.map((catalog) => (
                  <div key={catalog.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="font-medium">{catalog.name}</p>
                        <p className="text-sm text-gray-500">{catalog.filePath}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={`${API_BASE}/${catalog.filePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        İndir
                      </a>
                      <button
                        onClick={() => handleEditCatalog(catalog)}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDeleteClick(catalog)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
                 </div>
       </div>
     </div>
     </>
   );
 };

export default CatalogManagementModal; 
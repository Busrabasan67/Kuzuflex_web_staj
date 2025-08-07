import React, { useState, useEffect } from 'react';

const API_BASE = "http://localhost:5000";

// 4 desteklenen dil kodu
const LANGUAGES = [
  { code: 'tr', label: 'Türkçe' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
];

// Üst kategori tipi
interface ProductGroup {
  id: number;
  name: string;
  description: string;
}

// Ürün tipi
interface ProductData {
  id: number;
  slug: string; // SEO dostu URL slug'ı
  imageUrl: string;
  standard: string;
  groupId: number | null;
  groupName: string;
  translations: {
    language: string;
    title: string;
    description: string;
  }[];
}

interface EditProductModalProps {
  isOpen: boolean;
  productId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ isOpen, productId, onClose, onSuccess }) => {
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state'leri
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    slug: '', // SEO dostu URL slug'ı
    standard: '',
    groupId: '',
  });
  const [translations, setTranslations] = useState(
    LANGUAGES.map(l => ({ language: l.code, title: '', description: '' }))
  );

  // Modal açıldığında verileri getir
  useEffect(() => {
    if (isOpen && productId) {
      fetchGroups();
      fetchProductData();
    }
  }, [isOpen, productId]);

  // Üst kategorileri getir
  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/product-groups`);
      if (!response.ok) {
        throw new Error('Üst kategoriler alınamadı');
      }
      const data = await response.json();
      const dropdownGroups = data.map((group: any) => ({
        id: group.id,
        name: group.translation?.name || group.translations?.[0]?.name || "İsimsiz Grup",
        description: group.translation?.description || group.translations?.[0]?.description || "",
      }));
      setGroups(dropdownGroups);
    } catch (err) {
      console.error(' Üst kategori verileri alınamadı:', err);
      setError('Üst kategoriler yüklenirken hata oluştu');
    }
  };

  // Ürün verilerini getir
  const fetchProductData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/products/${productId}`);
      if (!response.ok) {
        throw new Error('Ürün verileri alınamadı');
      }
      const data = await response.json();
      setProductData(data);
      
      // Form state'lerini doldur
      setForm({
        slug: data.slug || '',
        standard: data.standard || '',
        groupId: data.groupId?.toString() || '',
      });
      
      // Çevirileri doldur
      const updatedTranslations = LANGUAGES.map(lang => {
        const translation = data.translations.find((t: any) => t.language === lang.code);
        return {
          language: lang.code,
          title: translation?.title || '',
          description: translation?.description || ''
        };
      });
      setTranslations(updatedTranslations);
      
      setError(null);
    } catch (err) {
      console.error(' Ürün verileri alınamadı:', err);
      setError('Ürün verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Form değişikliklerini handle et
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Çeviri alanları değişikliklerini handle et
  const handleTranslationChange = (idx: number, field: 'title' | 'description', value: string) => {
    setTranslations(prev => prev.map((tr, i) => i === idx ? { ...tr, [field]: value } : tr));
    
    // İngilizce başlık değiştiğinde otomatik slug oluştur
    if (field === 'title' && idx === 1) { // İngilizce (ikinci dil)
      const englishTitle = value;
      const autoSlug = englishTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      setForm(prev => ({ ...prev, slug: autoSlug }));
    }
  };

  // Dosya seçimi
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Form gönderimi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.groupId) {
      setError('Lütfen bir üst kategori seçin');
      return;
    }

    // Çeviri validasyonu
    const hasValidTranslations = translations.some(tr => tr.title.trim() && tr.description.trim());
    if (!hasValidTranslations) {
      setError('En az bir dilde başlık ve açıklama girmelisiniz');
      return;
    }

    // Resim validasyonu - mevcut resim yoksa ve yeni resim seçilmemişse hata ver
    if (!productData?.imageUrl && !selectedFile) {
      setError('Ürün resmi zorunludur. Lütfen bir resim seçin.');
      return;
    }

    try {
      setSubmitLoading(true);
      setError(null);

      // FormData ile tek endpoint'te güncelle (resim dahil)
      const formData = new FormData();
      formData.append('slug', form.slug);
      formData.append('imageUrl', productData?.imageUrl || ''); // Mevcut resim URL'si
      formData.append('standard', form.standard || '');
      formData.append('groupId', form.groupId);
      formData.append('translations', JSON.stringify(translations));
      
      // Yeni resim seçilmişse ekle
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const response = await fetch(`${API_BASE}/api/products/${productId}`, {
        method: 'PUT',
        body: formData, // Content-Type header'ı otomatik olarak multipart/form-data olacak
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Alt ürün güncellenemedi');
      }

      console.log(' Product başarıyla güncellendi');
      onSuccess();
      handleClose();
      
    } catch (err) {
      console.error(' Alt ürün güncelleme hatası:', err);
      setError(err instanceof Error ? err.message : 'Alt ürün güncellenirken hata oluştu');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Modal'ı kapat ve formu sıfırla
  const handleClose = () => {
    // Memory cleanup için URL.createObjectURL'den oluşan URL'leri temizle
    if (selectedFile) {
      URL.revokeObjectURL(URL.createObjectURL(selectedFile));
    }
    
    setForm({ slug: '', standard: '', groupId: '' });
    setTranslations(LANGUAGES.map(l => ({ language: l.code, title: '', description: '' })));
    setSelectedFile(null);
    setProductData(null);
    setError(null);
    onClose();
  };

  if (!isOpen || !productId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Alt Ürün Düzenle</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Hata mesajı */}
            {error && (
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
            )}

            {/* Üst Kategori Seçimi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Üst Kategori <span className="text-red-500">*</span>
              </label>
              <select
                name="groupId"
                value={form.groupId}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Üst kategori seçin</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug (URL) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleFormChange}
                placeholder="paslanmaz-celik-hortumlar"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">SEO dostu URL kısmı (zorunlu) - İngilizce başlığa göre otomatik oluşturulur</p>
            </div>

            {/* Mevcut Resim ve Yeni Resim Yükleme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ürün Resmi
              </label>
              
              {/* Mevcut resim */}
              {productData?.imageUrl && !selectedFile && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">Mevcut resim:</p>
                  <img
                    src={`${API_BASE}${productData.imageUrl.startsWith('/') ? productData.imageUrl : `/${productData.imageUrl}`}`}
                    alt="Mevcut ürün resmi"
                    className="h-24 w-24 rounded-lg object-cover border border-gray-200"
                    onError={(e) => {
                      console.log(' Edit modal resim yüklenemedi:', productData.imageUrl);
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log(' Edit modal resim yüklendi:', productData.imageUrl);
                    }}
                  />
                </div>
              )}
              
              {/* Yeni seçilen resim ön izleme */}
              {selectedFile && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">Yeni resim ön izleme:</p>
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Yeni ürün resmi ön izleme"
                    className="h-24 w-24 rounded-lg object-cover border border-gray-200"
                  />
                </div>
              )}
              
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {selectedFile && (
                <p className="mt-1 text-sm text-green-600">
                  Yeni dosya seçildi: {selectedFile.name}
                </p>
              )}
              {!selectedFile && productData?.imageUrl && (
                <p className="mt-1 text-sm text-gray-500">
                  Yeni resim seçmezseniz mevcut resim korunur
                </p>
              )}
            </div>

            {/* Standart */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Standart (Opsiyonel)
              </label>
              <input
                type="text"
                name="standard"
                value={form.standard}
                onChange={handleFormChange}
                placeholder="Örn: EN ISO 10380"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Çeviriler */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Çeviriler</h3>
              <div className="space-y-4">
                {translations.map((translation, idx) => (
                  <div key={translation.language} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      {LANGUAGES.find(l => l.code === translation.language)?.label}
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Başlık <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={translation.title}
                          onChange={(e) => handleTranslationChange(idx, 'title', e.target.value)}
                          placeholder="Ürün başlığı"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Açıklama <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={translation.description}
                          onChange={(e) => handleTranslationChange(idx, 'description', e.target.value)}
                          placeholder="Ürün açıklaması"
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Butonlar */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Güncelleniyor...</span>
                  </div>
                ) : (
                  'Alt Ürün Güncelle'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditProductModal;
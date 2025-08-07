import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const API_BASE = "http://localhost:5000";

// 4 desteklenen dil kodu
const LANGUAGES = [
  { code: 'tr', label: 'Türkçe' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
];

// Market tipi
interface MarketData {
  id: number;
  slug: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
  hasProducts: boolean;
  hasSolutions: boolean;
  hasCertificates: boolean;
  translations: {
    language: string;
    name: string;
    description: string;
  }[];
}

interface EditMarketModalProps {
  isOpen: boolean;
  marketId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditMarketModal: React.FC<EditMarketModalProps> = ({ isOpen, marketId, onClose, onSuccess }) => {
  const { i18n } = useTranslation();
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state'leri
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    slug: '',
    order: 1,
    hasProducts: true,
    hasSolutions: true,
    hasCertificates: true,
  });
  const [translations, setTranslations] = useState(
    LANGUAGES.map(l => ({ language: l.code, name: '', description: '' }))
  );

  // İçerik seçim state'leri
  const [availableProductGroups, setAvailableProductGroups] = useState<any[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [availableSolutions, setAvailableSolutions] = useState<any[]>([]);
  const [selectedProductGroups, setSelectedProductGroups] = useState<number[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [selectedSolutions, setSelectedSolutions] = useState<number[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);

  // Debug için state değişikliklerini izle
  useEffect(() => {
    console.log('🔄 selectedProductGroups değişti:', selectedProductGroups);
  }, [selectedProductGroups]);

  useEffect(() => {
    console.log('🔄 selectedProducts değişti:', selectedProducts);
  }, [selectedProducts]);

  useEffect(() => {
    console.log('🔄 selectedSolutions değişti:', selectedSolutions);
  }, [selectedSolutions]);

  // Modal açıldığında verileri getir
  useEffect(() => {
    if (isOpen && marketId) {
      fetchMarketData();
    }
  }, [isOpen, marketId]);

  // Market verileri yüklendiğinde içerikleri getir
  useEffect(() => {
    if (marketData && isOpen) {
      console.log('🔄 Market verileri yüklendi, içerikler getiriliyor...');
      fetchMarketContents();
    }
  }, [marketData, isOpen]);

  // Market verilerini getir
  const fetchMarketData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching market data for ID:', marketId);
      console.log('🔍 API URL:', `${API_BASE}/api/markets/id/${marketId}`);
      
      const response = await fetch(`${API_BASE}/api/markets/id/${marketId}`);
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error('Market verileri alınamadı');
      }
      const data = await response.json();
      setMarketData(data);
      
      // Form state'lerini doldur
      setForm({
        slug: data.slug || '',
        order: data.order || 1,
        hasProducts: data.hasProducts ?? true,
        hasSolutions: data.hasSolutions ?? true,
        hasCertificates: data.hasCertificates ?? true,
      });
      
      console.log('📦 Market form verileri yüklendi:', {
        slug: data.slug,
        order: data.order,
        isActive: data.isActive,
        hasProducts: data.hasProducts,
        hasSolutions: data.hasSolutions,
        hasCertificates: data.hasCertificates
      });
      
      // Çevirileri doldur
      const updatedTranslations = LANGUAGES.map(lang => {
        const translation = data.translations.find((t: any) => t.language === lang.code);
        return {
          language: lang.code,
          name: translation?.name || '',
          description: translation?.description || ''
        };
      });
      setTranslations(updatedTranslations);
      
      setError(null);
    } catch (err) {
      console.error('❌ Market verileri alınamadı:', err);
      setError('Market verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Market içeriklerini getir
  const fetchMarketContents = async () => {
    try {
      setLoadingContent(true);
      console.log('🔍 Fetching market contents for ID:', marketId);
      
      const response = await fetch(`${API_BASE}/api/markets/${marketId}/contents`);
      if (!response.ok) {
        throw new Error('Market içerikleri alınamadı');
      }
      
      const contents = await response.json();
      console.log('📦 Market contents:', contents);
      
      // Seçili ürün grupları ve ürünleri belirle
      const selectedGroups: number[] = [];
      const selectedProducts: number[] = [];
      const selectedSolutions: number[] = [];
      
      contents.forEach((content: any) => {
        console.log('🔍 İçerik işleniyor:', content);
        
        if (content.productGroupId) {
          console.log('✅ Ürün grubu eklendi:', content.productGroupId);
          selectedGroups.push(content.productGroupId);
        }
        if (content.productId) {
          console.log('✅ Ürün eklendi:', content.productId);
          selectedProducts.push(content.productId);
        }
        if (content.type === 'solution') {
          // Artık solutionId alanı var, URL'den çıkarmaya gerek yok
          if (content.solutionId) {
            console.log('✅ Çözüm eklendi (solutionId):', content.solutionId);
            selectedSolutions.push(content.solutionId);
          } else {
            // Fallback: URL'den çıkar (eski veriler için)
            const solutionId = extractSolutionIdFromUrl(content.targetUrl);
            if (solutionId) {
              console.log('✅ Çözüm eklendi (URL\'den):', solutionId);
              selectedSolutions.push(solutionId);
            }
          }
        }
      });
      
      console.log('✅ Seçili içerikler:', {
        productGroups: selectedGroups,
        products: selectedProducts,
        solutions: selectedSolutions
      });
      
      // State'leri güncelle
      setSelectedProductGroups(selectedGroups);
      setSelectedProducts(selectedProducts);
      setSelectedSolutions(selectedSolutions);
      console.log(' State\'ler güncellendi:', {
        productGroups: selectedGroups,
        products: selectedProducts,
        solutions: selectedSolutions
      });
      
      // Market özelliklerini içeriklere göre güncelle
      const hasProductGroups = selectedGroups.length > 0;
      const hasProducts = selectedProducts.length > 0;
      const hasSolutions = selectedSolutions.length > 0;
      
      console.log(' Market özellikleri güncelleniyor:', {
        hasProductGroups,
        hasProducts,
        hasSolutions,
        hasCertificates: true // Sertifikalar her zaman true
      });
      
      // Form state'ini güncelle
      setForm(prev => ({
        ...prev,
        hasProducts: hasProductGroups || hasProducts,
        hasSolutions: hasSolutions,
        hasCertificates: true // Sertifikalar her zaman true
      }));
      
    } catch (err) {
      console.error('❌ Market içerikleri alınamadı:', err);
      // Hata durumunda boş array'ler kullan
      setSelectedProductGroups([]);
      setSelectedProducts([]);
      setSelectedSolutions([]);
    } finally {
      setLoadingContent(false);
    }
  };

  // URL'den solution ID'sini çıkar
  const extractSolutionIdFromUrl = (url: string): number | null => {
    const match = url.match(/\/solutions\/(\d+)/);
    return match ? parseInt(match[1]) : null;
  };

  // Mevcut ürün gruplarını getir
  const fetchAvailableProductGroups = async () => {
    try {
      console.log('🔍 Ürün grupları getiriliyor...');
      const response = await fetch(`${API_BASE}/api/product-groups?language=${i18n.language}`);
      console.log('📤 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Ürün grupları alındı:', data.length, 'grup');
        console.log('📦 İlk grup örneği:', data[0]);
        setAvailableProductGroups(data);
      } else {
        console.error('❌ Ürün grupları alınamadı, status:', response.status);
      }
    } catch (err) {
      console.error('❌ Ürün grupları alınamadı:', err);
    }
  };

  // Mevcut ürünleri getir
  const fetchAvailableProducts = async () => {
    try {
      console.log('🔍 Ürünler getiriliyor...');
      const response = await fetch(`${API_BASE}/api/products/all?language=${i18n.language}`);
      console.log('📤 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Ürünler alındı:', data.length, 'ürün');
        console.log('📦 İlk ürün örneği:', data[0]);
        setAvailableProducts(data);
      } else {
        console.error('❌ Ürünler alınamadı, status:', response.status);
      }
    } catch (err) {
      console.error('❌ Ürünler alınamadı:', err);
    }
  };

  // Mevcut çözümleri getir
  const fetchAvailableSolutions = async () => {
    try {
      console.log('🔍 Çözümler getiriliyor...');
      const response = await fetch(`${API_BASE}/api/solutions?language=${i18n.language}`);
      console.log('📤 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Çözümler alındı:', data.length, 'çözüm');
        console.log('📦 İlk çözüm örneği:', data[0]);
        setAvailableSolutions(data);
      } else {
        console.error('❌ Çözümler alınamadı, status:', response.status);
      }
    } catch (err) {
      console.error('❌ Çözümler alınamadı:', err);
    }
  };

  // Modal açıldığında mevcut içerikleri de getir
  useEffect(() => {
    if (isOpen) {
      fetchAvailableProductGroups();
      fetchAvailableProducts();
      fetchAvailableSolutions();
    }
  }, [isOpen, i18n.language]);

  // Form değişikliklerini handle et
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Çeviri alanları değişikliklerini handle et
  const handleTranslationChange = (idx: number, field: 'name' | 'description', value: string) => {
    setTranslations(prev => prev.map((tr, i) => i === idx ? { ...tr, [field]: value } : tr));
  };

  // Dosya seçimi
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Checkbox handler'ları
  const handleProductGroupChange = (groupId: number, checked: boolean) => {
    console.log('🔄 Ürün grubu değişti:', groupId, checked);
    if (checked) {
      setSelectedProductGroups(prev => {
        const newState = [...prev, groupId];
        console.log('✅ Yeni ürün grupları:', newState);
        return newState;
      });
    } else {
      setSelectedProductGroups(prev => {
        const newState = prev.filter(id => id !== groupId);
        console.log('❌ Kalan ürün grupları:', newState);
        return newState;
      });
    }
  };

  const handleProductChange = (productId: number, checked: boolean) => {
    console.log('🔄 Ürün değişti:', productId, checked);
    if (checked) {
      setSelectedProducts(prev => {
        const newState = [...prev, productId];
        console.log('✅ Yeni ürünler:', newState);
        return newState;
      });
    } else {
      setSelectedProducts(prev => {
        const newState = prev.filter(id => id !== productId);
        console.log('❌ Kalan ürünler:', newState);
        return newState;
      });
    }
  };

  const handleSolutionChange = (solutionId: number, checked: boolean) => {
    console.log('🔄 Solution değişti:', solutionId, checked);
    if (checked) {
      setSelectedSolutions(prev => {
        const newState = [...prev, solutionId];
        console.log('✅ Yeni solutions:', newState);
        return newState;
      });
    } else {
      setSelectedSolutions(prev => {
        const newState = prev.filter(id => id !== solutionId);
        console.log('❌ Kalan solutions:', newState);
        return newState;
      });
    }
  };

  // Form gönderimi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Slug validasyonu
    if (!form.slug.trim()) {
      setError('Slug alanı zorunludur!');
      // Hata mesajını görmek için sayfayı yukarı scroll et
      setTimeout(() => {
        const modal = document.querySelector('.bg-white.rounded-lg');
        if (modal) {
          modal.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
      return;
    }

    // Resim validasyonu - mevcut resim varsa veya yeni resim seçilmişse
    if (!marketData?.imageUrl && !selectedFile) {
      setError('Market görseli zorunludur!');
      // Hata mesajını görmek için sayfayı yukarı scroll et
      setTimeout(() => {
        const modal = document.querySelector('.bg-white.rounded-lg');
        if (modal) {
          modal.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
      return;
    }

    // Çeviri validasyonu
    const hasValidTranslations = translations.some(tr => tr.name.trim() && tr.description.trim());
    if (!hasValidTranslations) {
      setError('En az bir dilde başlık ve açıklama girmelisiniz');
      // Hata mesajını görmek için sayfayı yukarı scroll et
      setTimeout(() => {
        const modal = document.querySelector('.bg-white.rounded-lg');
        if (modal) {
          modal.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
      return;
    }

    // Ürünler seçiliyse en az bir ürün grubu veya alt ürün seçilmeli
    if (form.hasProducts && selectedProductGroups.length === 0 && selectedProducts.length === 0) {
      setError('Ürünler seçiliyse en az bir ürün grubu veya alt ürün seçmelisiniz!');
      // Hata mesajını görmek için sayfayı yukarı scroll et
      setTimeout(() => {
        const modal = document.querySelector('.bg-white.rounded-lg');
        if (modal) {
          modal.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
      return;
    }

    // Çözümler seçiliyse en az bir çözüm seçilmeli
    if (form.hasSolutions && selectedSolutions.length === 0) {
      setError('Çözümler seçiliyse en az bir çözüm seçmelisiniz!');
      // Hata mesajını görmek için sayfayı yukarı scroll et
      setTimeout(() => {
        const modal = document.querySelector('.bg-white.rounded-lg');
        if (modal) {
          modal.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
      return;
    }

    try {
      setSubmitLoading(true);
      setError(null);

      // FormData ile market güncelle (resim dahil)
      const formData = new FormData();
      formData.append('slug', form.slug);
      formData.append('order', form.order.toString());
      formData.append('isActive', marketData?.isActive?.toString() || 'true'); // isActive değerini ekle
      formData.append('hasProducts', form.hasProducts.toString());
      formData.append('hasSolutions', form.hasSolutions.toString());
      formData.append('hasCertificates', form.hasCertificates.toString());
      formData.append('translations', JSON.stringify(translations.filter(t => t.name.trim() !== '' || t.description.trim() !== '')));
      formData.append('selectedProductGroups', JSON.stringify(selectedProductGroups));
      formData.append('selectedProducts', JSON.stringify(selectedProducts));
      formData.append('selectedSolutions', JSON.stringify(selectedSolutions));
      
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const response = await fetch(`${API_BASE}/api/markets/${marketId}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Market güncellenemedi');
      }

      console.log('✅ Market başarıyla güncellendi');

      // Başarılı
      console.log('✅ Market başarıyla güncellendi');
      onSuccess();
      handleClose();
      
    } catch (err) {
      console.error('❌ Market güncelleme hatası:', err);
      setError(err instanceof Error ? err.message : 'Market güncellenirken hata oluştu');
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
    
    setForm({ slug: '', order: 1, hasProducts: true, hasSolutions: true, hasCertificates: true });
    setTranslations(LANGUAGES.map(l => ({ language: l.code, name: '', description: '' })));
    setSelectedFile(null);
    setMarketData(null);
    setError(null);
    onClose();
  };

  if (!isOpen || !marketId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Market Düzenle</h2>
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
                placeholder="gas-applications"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">SEO dostu URL kısmı (zorunlu)</p>
            </div>

            {/* Sıra */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sıra <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="order"
                value={form.order}
                onChange={handleFormChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Footer'da görünme sırası</p>
            </div>

            {/* Market Özellikleri ve İçerik Seçimi - Yan Yana */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Market Özellikleri */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Market Özellikleri
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="hasProducts"
                      checked={form.hasProducts}
                      onChange={(e) => {
                        handleFormChange(e);
                        // Ürünler kapatılırsa seçili ürün grupları ve alt ürünleri temizle
                        if (!e.target.checked) {
                          setSelectedProductGroups([]);
                          setSelectedProducts([]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Ürünler</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="hasSolutions"
                      checked={form.hasSolutions}
                      onChange={(e) => {
                        handleFormChange(e);
                        // Çözümler kapatılırsa seçili çözümleri temizle
                        if (!e.target.checked) {
                          setSelectedSolutions([]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Çözümler</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="hasCertificates"
                      checked={form.hasCertificates}
                      onChange={handleFormChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Sertifikalar</span>
                  </label>
                </div>
              </div>

              {/* İçerik Seçimleri */}
              {(form.hasProducts || form.hasSolutions) && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">İçerik Seçimleri (Opsiyonel)</h3>
                  
                  {/* Ürün Grupları */}
                  {form.hasProducts && (
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-gray-700 mb-3">Ürün Grupları (Üst Ürünler)</h4>
                      {loadingContent ? (
                        <div className="text-sm text-gray-500">Yükleniyor...</div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                          {availableProductGroups.map((group) => {
                            const isChecked = selectedProductGroups.includes(group.id);
                            return (
                              <label key={`group-${group.id}-${isChecked}`} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => handleProductGroupChange(group.id, e.target.checked)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">
                                  {group.translation?.name || group.name || 'İsimsiz'}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Alt Ürünler */}
                  {form.hasProducts && (
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-gray-700 mb-3">Alt Ürünler</h4>
                      {loadingContent ? (
                        <div className="text-sm text-gray-500">Yükleniyor...</div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                          {availableProducts.map((product) => {
                            const isChecked = selectedProducts.includes(product.id);
                            return (
                              <label key={`product-${product.id}-${isChecked}`} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => handleProductChange(product.id, e.target.checked)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">
                                  {product.title || product.groupName || 'İsimsiz'}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Çözümler */}
                  {form.hasSolutions && (
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-gray-700 mb-3">Çözümler</h4>
                      {loadingContent ? (
                        <div className="text-sm text-gray-500">Yükleniyor...</div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                          {availableSolutions.map((solution) => {
                            const isChecked = selectedSolutions.includes(solution.id);
                            return (
                              <label key={`solution-${solution.id}-${isChecked}`} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => handleSolutionChange(solution.id, e.target.checked)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{solution.title || 'İsimsiz'}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sertifikalar Bilgisi */}
                  {form.hasCertificates && (
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-gray-700 mb-3">Sertifikalar</h4>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-700">
                          Sertifikalar otomatik olarak eklenir ve tüm marketlerde görünür.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mevcut Resim ve Yeni Resim Yükleme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Market Resmi <span className="text-red-500">*</span>
              </label>
              
              {/* Mevcut resim */}
              {marketData?.imageUrl && !selectedFile && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">Mevcut resim:</p>
                  <img
                    src={`${API_BASE}${marketData.imageUrl.startsWith('/') ? marketData.imageUrl : `/${marketData.imageUrl}`}`}
                    alt="Mevcut market resmi"
                    className="h-24 w-24 rounded-lg object-cover border border-gray-200"
                    onError={(e) => {
                      console.log('❌ Edit modal resim yüklenemedi:', marketData.imageUrl);
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('✅ Edit modal resim yüklendi:', marketData.imageUrl);
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
                    alt="Yeni market resmi ön izleme"
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
              {!selectedFile && marketData?.imageUrl && (
                <p className="mt-1 text-sm text-gray-500">
                  Yeni resim seçmezseniz mevcut resim korunur
                </p>
              )}
            </div>

            {/* Çeviriler */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Çeviriler <span className="text-red-500">*</span></h3>
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
                          value={translation.name}
                          onChange={(e) => handleTranslationChange(idx, 'name', e.target.value)}
                          placeholder="Market başlığı"
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
                          placeholder="Market açıklaması"
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
                  'Market Güncelle'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditMarketModal; 
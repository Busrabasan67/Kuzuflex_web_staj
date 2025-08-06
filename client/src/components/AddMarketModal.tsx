import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Upload, Check, ChevronDown, ChevronUp, Globe, Package, Settings, Award, Users, FileText, Image as ImageIcon } from 'lucide-react';

interface AddMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMarketAdded: () => void;
}

interface Translation {
  language: string;
  name: string;
  description: string;
}

interface ProductGroup {
  id: number;
  slug: string;
  translation: {
    name: string;
    description: string;
  };
  subcategories: Product[];
}

interface Product {
  id: number;
  slug: string;
  title: string;
  description: string;
}

interface Solution {
  id: number;
  slug: string;
  title: string;
}

const API_BASE = 'http://localhost:5000';

const AddMarketModal: React.FC<AddMarketModalProps> = ({ isOpen, onClose, onMarketAdded }) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Form state
  const [form, setForm] = useState({
    slug: '',
    order: 1,
    hasProducts: false,
    hasSolutions: false,
    hasCertificates: true,
  });

  // Translations state
  const [translations, setTranslations] = useState<Translation[]>([
    { language: 'tr', name: '', description: '' },
    { language: 'en', name: '', description: '' },
    { language: 'fr', name: '', description: '' },
    { language: 'de', name: '', description: '' }
  ]);

  // Seçim state'leri
  const [availableProductGroups, setAvailableProductGroups] = useState<ProductGroup[]>([]);
  const [availableSolutions, setAvailableSolutions] = useState<Solution[]>([]);
  const [selectedProductGroups, setSelectedProductGroups] = useState<number[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [selectedSolutions, setSelectedSolutions] = useState<number[]>([]);
  const [showProductGroups, setShowProductGroups] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);

  // Mevcut ürün grupları ve çözümleri yükle
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productGroupsResponse = await fetch(`${API_BASE}/api/product-groups?lang=tr`);
        if (productGroupsResponse.ok) {
          const productGroups = await productGroupsResponse.json();
          setAvailableProductGroups(productGroups);
        }

        const solutionsResponse = await fetch(`${API_BASE}/api/solutions?lang=tr`);
        if (solutionsResponse.ok) {
          const solutions = await solutionsResponse.json();
          setAvailableSolutions(solutions);
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Turkish name'den otomatik slug oluştur
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Translation değişikliklerini handle et
  const handleTranslationChange = (index: number, field: keyof Translation, value: string) => {
    const newTranslations = [...translations];
    newTranslations[index] = { ...newTranslations[index], [field]: value };
    setTranslations(newTranslations);
  };

  // Dosya seçimi
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Ürün grubu seçimi
  const handleProductGroupToggle = (groupId: number) => {
    setSelectedProductGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Alt ürün seçimi
  const handleProductToggle = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Çözüm seçimi
  const handleSolutionToggle = (solutionId: number) => {
    setSelectedSolutions(prev => 
      prev.includes(solutionId) 
        ? prev.filter(id => id !== solutionId)
        : [...prev, solutionId]
    );
  };

  // Form gönderimi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Slug validasyonu
    if (!form.slug.trim()) {
      setError("Slug alanı zorunludur!");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      // Önce market'i oluştur (resim olmadan)
      const marketData = {
        slug: form.slug.trim(),
        imageUrl: '', // Başlangıçta boş
        order: parseInt(form.order.toString()),
        hasProducts: form.hasProducts,
        hasSolutions: form.hasSolutions,
        hasCertificates: form.hasCertificates,
        translations: translations.filter(t => t.name.trim() !== '' || t.description.trim() !== ''),
        selectedProductGroups: selectedProductGroups,
        selectedProducts: selectedProducts,
        selectedSolutions: selectedSolutions
      };

      const response = await fetch(`${API_BASE}/api/markets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(marketData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Market oluşturulamadı');
      }

      const result = await response.json();
      console.log('✅ Market başarıyla oluşturuldu:', result);

      // Eğer resim seçilmişse, market oluşturulduktan sonra resmi yükle
      if (selectedFile && result.id) {
        const formData = new FormData();
        formData.append('image', selectedFile);

        const uploadResponse = await fetch(`${API_BASE}/api/upload/image/market/${result.id}`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          console.warn('⚠️ Resim yüklenemedi, market oluşturuldu ama resim olmadan');
        } else {
          const uploadResult = await uploadResponse.json();
          console.log('✅ Resim başarıyla yüklendi:', uploadResult);

          // Market'in imageUrl alanını güncelle
          const updateResponse = await fetch(`${API_BASE}/api/markets/${result.id}/image`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageUrl: uploadResult.url
            }),
          });

          if (updateResponse.ok) {
            console.log('✅ Market imageUrl güncellendi');
          } else {
            console.warn('⚠️ Market imageUrl güncellenemedi');
          }
        }
      }

      // Form'u sıfırla
      setForm({
        slug: '',
        order: 1,
        hasProducts: false,
        hasSolutions: false,
        hasCertificates: true,
      });
      setTranslations([
        { language: 'tr', name: '', description: '' },
        { language: 'en', name: '', description: '' },
        { language: 'fr', name: '', description: '' },
        { language: 'de', name: '', description: '' }
      ]);
      setSelectedFile(null);
      setSelectedProductGroups([]);
      setSelectedProducts([]);
      setSelectedSolutions([]);
      setShowProductGroups(false);
      setShowProducts(false);
      setShowSolutions(false);

      onMarketAdded();
      onClose();
    } catch (error) {
      console.error('❌ Market oluşturma hatası:', error);
      setError(error instanceof Error ? error.message : 'Bilinmeyen hata');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Yeni Market Ekle</h2>
                <p className="text-sm text-gray-600">Market kategorisi oluşturun</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Temel Bilgiler */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
              <h3 className="text-lg font-medium text-gray-900">Temel Bilgiler</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="gaz-uygulamalari"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">SEO dostu URL kısmı (zorunlu)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sıralama
                </label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Market Görseli
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="market-image"
                  />
                  <label htmlFor="market-image" className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors">
                    <ImageIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {selectedFile ? selectedFile.name : 'Resim seçin'}
                    </span>
                  </label>
                </div>
              </div>
              <div>
                {/* Boş alan - gelecekte başka bir alan eklenebilir */}
              </div>
            </div>
          </div>

          {/* Market Özellikleri */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-1 h-6 bg-green-500 rounded-full"></div>
              <h3 className="text-lg font-medium text-gray-900">Market Özellikleri</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={form.hasProducts}
                  onChange={(e) => setForm(prev => ({ ...prev, hasProducts: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">Ürünler</div>
                  <div className="text-sm text-gray-600">Ürün grupları ve alt ürünler</div>
                </div>
              </label>
              
              <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={form.hasSolutions}
                  onChange={(e) => setForm(prev => ({ ...prev, hasSolutions: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">Çözümler</div>
                  <div className="text-sm text-gray-600">Teknik çözümler</div>
                </div>
              </label>
              
              <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={form.hasCertificates}
                  onChange={(e) => setForm(prev => ({ ...prev, hasCertificates: e.target.checked }))}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">Sertifikalar</div>
                  <div className="text-sm text-gray-600">Kalite belgeleri</div>
                </div>
              </label>
            </div>
          </div>

          {/* İçerik Seçimi */}
          {(form.hasProducts || form.hasSolutions) && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                <h3 className="text-lg font-medium text-gray-900">İçerik Seçimi</h3>
              </div>

              {/* Ürün Grupları */}
              {form.hasProducts && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium text-gray-900">Üst Ürünler (Ürün Grupları)</h4>
                      <span className="text-sm text-gray-500">({selectedProductGroups.length} seçili)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowProductGroups(!showProductGroups)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      {showProductGroups ? 'Gizle' : 'Göster'}
                    </button>
                  </div>
                  
                  {showProductGroups && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                      {availableProductGroups.map((group) => (
                        <label key={group.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-blue-50 cursor-pointer transition-colors border border-gray-200">
                          <input
                            type="checkbox"
                            checked={selectedProductGroups.includes(group.id)}
                            onChange={() => handleProductGroupToggle(group.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{group.translation?.name}</div>
                            <div className="text-xs text-gray-500">{group.slug}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Alt Ürünler */}
              {form.hasProducts && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-green-600" />
                      <h4 className="font-medium text-gray-900">Alt Ürünler</h4>
                      <span className="text-sm text-gray-500">({selectedProducts.length} seçili)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowProducts(!showProducts)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      {showProducts ? 'Gizle' : 'Göster'}
                    </button>
                  </div>
                  
                  {showProducts && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                      {availableProductGroups.flatMap(group => 
                        group.subcategories?.map(product => (
                          <label key={product.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-green-50 cursor-pointer transition-colors border border-gray-200">
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(product.id)}
                              onChange={() => handleProductToggle(product.id)}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{product.title}</div>
                              <div className="text-xs text-gray-500">{product.slug}</div>
                            </div>
                          </label>
                        )) || []
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Çözümler */}
              {form.hasSolutions && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Settings className="h-5 w-5 text-purple-600" />
                      <h4 className="font-medium text-gray-900">Çözümler</h4>
                      <span className="text-sm text-gray-500">({selectedSolutions.length} seçili)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSolutions(!showSolutions)}
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      {showSolutions ? 'Gizle' : 'Göster'}
                    </button>
                  </div>
                  
                  {showSolutions && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                      {availableSolutions.map((solution) => (
                        <label key={solution.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-purple-50 cursor-pointer transition-colors border border-gray-200">
                          <input
                            type="checkbox"
                            checked={selectedSolutions.includes(solution.id)}
                            onChange={() => handleSolutionToggle(solution.id)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{solution.title}</div>
                            <div className="text-xs text-gray-500">{solution.slug}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Çeviriler */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
              <h3 className="text-lg font-medium text-gray-900">Çoklu Dil Desteği</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {translations.map((translation, index) => (
                <div key={translation.language} className="space-y-3 p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600 uppercase">{translation.language}</span>
                    </div>
                    <h4 className="font-medium text-gray-900 capitalize">{translation.language}</h4>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Market adı"
                      value={translation.name}
                      onChange={(e) => handleTranslationChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <textarea
                      placeholder="Market açıklaması"
                      value={translation.description}
                      onChange={(e) => handleTranslationChange(index, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hata Mesajı */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Butonlar */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Ekleniyor...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Market Ekle</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMarketModal; 
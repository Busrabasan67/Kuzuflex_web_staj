import React, { useState, useEffect } from 'react';

interface Translation {
  language: string;
  title: string;
  subtitle: string;
  description: string;
}

interface SolutionFormProps {
  onSubmit: (data: {
    slug: string;
    imageUrl: string;
    hasExtraContent: boolean;
    translations: Translation[];
  }) => void;
  onCancel: () => void;
  loading?: boolean;
  initialData?: any;
}

const SolutionForm: React.FC<SolutionFormProps> = ({ 
  onSubmit, 
  onCancel, 
  loading = false,
  initialData = null 
}) => {
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [hasExtraContent, setHasExtraContent] = useState(initialData?.hasExtraContent || false);
  const [showExtraContentForm, setShowExtraContentForm] = useState(false);
  
  // Çoklu dil desteği - Tüm diller zorunlu
  const [translations, setTranslations] = useState<Translation[]>(
    initialData?.translations || [
      { language: 'tr', title: '', subtitle: '', description: '' },
      { language: 'en', title: '', subtitle: '', description: '' },
      { language: 'de', title: '', subtitle: '', description: '' },
      { language: 'fr', title: '', subtitle: '', description: '' }
    ]
  );

  const [imageUploading, setImageUploading] = useState(false);

  // initialData değiştiğinde form alanlarını güncelle
  useEffect(() => {
    if (initialData) {
      setSlug(initialData.slug || '');
      setImageUrl(initialData.imageUrl || '');
      setHasExtraContent(initialData.hasExtraContent || false);
      
      // Translation'ları güncelle
      if (initialData.translations && Array.isArray(initialData.translations)) {
        setTranslations(initialData.translations);
      }
    }
  }, [initialData]);

  // Dil adlarını getir
  const getLanguageName = (code: string) => {
    const names: { [key: string]: string } = {
      'tr': 'Türkçe 🇹🇷',
      'en': 'English 🇺🇸',
      'de': 'Deutsch 🇩🇪',
      'fr': 'Français 🇫🇷'
    };
    return names[code] || code;
  };

  // Resim yükleme
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:5000/api/upload/image/solution/0', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Resim yükleme hatası');
      }

      const result = await response.json();
      setImageUrl(result.url);
    } catch (error) {
      console.error('Resim yükleme hatası:', error);
      alert('Resim yüklenirken hata oluştu');
    } finally {
      setImageUploading(false);
    }
  };

  // Translation güncelleme
  const updateTranslation = (index: number, field: keyof Translation, value: string) => {
    const newTranslations = [...translations];
    newTranslations[index] = {
      ...newTranslations[index],
      [field]: value
    };
    setTranslations(newTranslations);
  };

  // Form gönderme
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasyon
    if (!slug.trim()) {
      alert('Slug zorunludur');
      return;
    }
    
    if (!imageUrl.trim()) {
      alert('Resim zorunludur');
      return;
    }

    // Tüm diller için zorunlu validasyon
    const missingTranslations = translations.filter(t => 
      !t.title.trim() || !t.subtitle.trim() || !t.description.trim()
    );

    if (missingTranslations.length > 0) {
      const missingLanguages = missingTranslations.map(t => getLanguageName(t.language)).join(', ');
      alert(`Aşağıdaki diller için tüm alanlar zorunludur:\n\n${missingLanguages}\n\nLütfen eksik alanları doldurun.`);
      return;
    }

    onSubmit({
      slug: slug.trim(),
      imageUrl: imageUrl.trim(),
      hasExtraContent,
      translations: translations
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4">
        <h2 className="text-xl font-bold">
          {initialData ? '✏️ Solution Düzenle' : '➕ Yeni Solution Ekle'}
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          Tüm diller için içerik girişi zorunludur
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Temel Bilgiler */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Temel Bilgiler
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug (URL) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ornek-solution"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                URL için kullanılacak benzersiz tanımlayıcı (örn: welding, pipe-bending)
              </p>
            </div>

            {/* Resim Yükleme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resim <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={imageUploading}
                />
                {imageUploading && (
                  <div className="absolute inset-0 bg-blue-50 bg-opacity-75 rounded-xl flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                      <span className="text-sm text-blue-600">Yükleniyor...</span>
                    </div>
                  </div>
                )}
              </div>
              {imageUrl && (
                <div className="mt-3">
                  <img 
                    src={`http://localhost:5000${imageUrl}`} 
                    alt="Preview" 
                    className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ekstra İçerik Sorusu */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Ekstra İçerik
          </h3>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={hasExtraContent}
                onChange={(e) => setHasExtraContent(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700">
                Bu solution için ekstra içerik eklemek istiyor musunuz?
              </span>
            </label>
          </div>
          
          {hasExtraContent && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="text-green-500 text-lg">✅</div>
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Ekstra İçerik Aktif
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Solution oluşturulduktan sonra "Solution İçerik Ekle" sekmesinden 
                    ekstra içerik ekleyebilirsiniz.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Çoklu Dil Desteği */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            Çoklu Dil Desteği
            <span className="ml-2 text-sm font-normal text-red-600">(Tüm diller zorunludur)</span>
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {translations.map((translation, index) => (
              <div key={translation.language} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900 text-lg">
                    {getLanguageName(translation.language)}
                  </h4>
                  <div className={`w-3 h-3 rounded-full ${
                    translation.title.trim() && translation.subtitle.trim() && translation.description.trim()
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                  }`}></div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Başlık <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={translation.title}
                      onChange={(e) => updateTranslation(index, 'title', e.target.value)}
                      placeholder={`${getLanguageName(translation.language)} başlık`}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        !translation.title.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alt Başlık <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={translation.subtitle}
                      onChange={(e) => updateTranslation(index, 'subtitle', e.target.value)}
                      placeholder={`${getLanguageName(translation.language)} alt başlık`}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        !translation.subtitle.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Açıklama <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={translation.description}
                      onChange={(e) => updateTranslation(index, 'description', e.target.value)}
                      placeholder={`${getLanguageName(translation.language)} detaylı açıklama`}
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        !translation.description.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Butonlar */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            ❌ İptal
          </button>
          <button
            type="submit"
            disabled={loading || imageUploading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 font-medium"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Kaydediliyor...</span>
              </div>
            ) : (
              <span>{initialData ? '💾 Güncelle' : '✨ Oluştur'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SolutionForm;
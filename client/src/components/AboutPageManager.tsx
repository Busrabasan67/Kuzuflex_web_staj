import React, { useState, useEffect } from 'react';
import AboutPageExtraContentAdder from './AboutPageExtraContentAdder';
import { useTranslation } from 'react-i18next';

interface AboutPageData {
  id: number;
  slug: string;
  heroImageUrl: string;
  translations: {
    id: number;
    language: string;
    title: string;
    subtitle: string;
    bodyHtml: string;
  }[];
  extraContents: {
    id: number;
    language: string;
    title: string;
    content: string;
    type: string;
    order: number;
  }[];
}

const AboutPageManager: React.FC = () => {
  const { t } = useTranslation();
  const [aboutPageData, setAboutPageData] = useState<AboutPageData | null>(null);
  const [showExtraContentAdder, setShowExtraContentAdder] = useState(false);
  const [editingExtraContent, setEditingExtraContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [uploadingHero, setUploadingHero] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    heroImageUrl: '',
    translations: {
      tr: { title: '', subtitle: '', bodyHtml: '' },
      en: { title: '', subtitle: '', bodyHtml: '' },
      de: { title: '', subtitle: '', bodyHtml: '' },
      fr: { title: '', subtitle: '', bodyHtml: '' }
    }
  });

  // İçerikleri dillere göre gruplandır
  const groupContentsByOrder = () => {
    if (!aboutPageData?.extraContents) return [];
    
    const grouped: { [key: number]: { [key: string]: any } } = {};
    
    aboutPageData.extraContents.forEach(content => {
      if (!grouped[content.order]) {
        grouped[content.order] = {};
      }
      grouped[content.order][content.language] = content;
    });
    
    return Object.entries(grouped).map(([order, languages]) => ({
      order: parseInt(order),
      languages
    })).sort((a, b) => a.order - b.order);
  };

  useEffect(() => {
    fetchAboutPageData();
  }, []);

  const fetchAboutPageData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/about-page');
      if (response.ok) {
        const data = await response.json();
        setAboutPageData(data);
        
        // Form verilerini doldur
        if (data) {
          setFormData({
            heroImageUrl: data.heroImageUrl || '',
            translations: {
              tr: { title: '', subtitle: '', bodyHtml: '' },
              en: { title: '', subtitle: '', bodyHtml: '' },
              de: { title: '', subtitle: '', bodyHtml: '' },
              fr: { title: '', subtitle: '', bodyHtml: '' }
            }
          });

          // Mevcut çevirileri form'a yükle
          data.translations?.forEach((translation: any) => {
            setFormData(prev => ({
              ...prev,
              translations: {
                ...prev.translations,
                [translation.language]: {
                  title: translation.title || '',
                  subtitle: translation.subtitle || '',
                  bodyHtml: translation.bodyHtml || ''
                }
              }
            }));
          });
        }
      } else {
        // Hakkımızda sayfası yoksa yeni oluştur
        await createAboutPage();
      }
    } catch (error) {
      console.error('Error fetching about page data:', error);
      setMessage({ type: 'error', text: 'Veri yüklenirken hata oluştu' });
    } finally {
      setLoading(false);
    }
  };

  const createAboutPage = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/about-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: 'contact',
          heroImageUrl: '',
          translations: [
            { language: 'tr', title: 'İletişim', subtitle: 'Kuzuflex ile İletişim', bodyHtml: '<p>Kuzuflex ile iletişime geçin...</p>' },
            { language: 'en', title: 'Contact', subtitle: 'Get in Touch with Kuzuflex', bodyHtml: '<p>Contact Kuzuflex...</p>' },
            { language: 'de', title: 'Kontakt', subtitle: 'Kontaktieren Sie Kuzuflex', bodyHtml: '<p>Kontaktieren Sie Kuzuflex...</p>' },
            { language: 'fr', title: 'Contact', subtitle: 'Contactez Kuzuflex', bodyHtml: '<p>Contactez Kuzuflex...</p>' }
          ]
        }),
      });

      if (response.ok) {
        const newData = await response.json();
        setAboutPageData(newData);
        setMessage({ type: 'success', text: 'Hakkımızda sayfası oluşturuldu' });
      }
    } catch (error) {
      console.error('Error creating about page:', error);
      setMessage({ type: 'error', text: 'Sayfa oluşturulurken hata oluştu' });
    }
  };

  const handleSave = async () => {
    if (!aboutPageData) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`http://localhost:5000/api/about-page/${aboutPageData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          heroImageUrl: formData.heroImageUrl,
          translations: Object.entries(formData.translations).map(([language, data]) => ({
            language,
            title: data.title,
            subtitle: data.subtitle,
            bodyHtml: data.bodyHtml
          }))
        }),
      });

      if (response.ok) {
        await fetchAboutPageData();
        setMessage({ type: 'success', text: 'Değişiklikler kaydedildi!' });
      } else {
        throw new Error('Kaydetme başarısız');
      }
    } catch (error) {
      console.error('Error saving about page:', error);
      setMessage({ type: 'error', text: 'Kaydetme sırasında hata oluştu' });
    } finally {
      setSaving(false);
    }
  };

  const handleExtraContentAdded = () => {
    setShowExtraContentAdder(false);
    setEditingExtraContent(null);
    fetchAboutPageData();
  };

  const handleEditExtraContent = (content: any) => {
    // Aynı order'a sahip tüm dil versiyonlarını bul
    const sameOrderContents = aboutPageData?.extraContents.filter(c => c.order === content.order) || [];
    
    // MultiLanguageData hazırla
    const multiLanguageData: { [key: string]: any } = {};
    sameOrderContents.forEach(c => {
      multiLanguageData[c.language] = {
        title: c.title,
        content: c.content,
        type: c.type
      };
    });
    
    // Düzenlenecek içeriği multiLanguageData ile genişlet
    const editingContentWithMultiData = {
      ...content,
      multiLanguageData,
      order: content.order // Order bilgisini ekle
    };
    
    console.log('Düzenlenecek içerik:', editingContentWithMultiData);
    setEditingExtraContent(editingContentWithMultiData);
    setShowExtraContentAdder(true);
  };

  const handleHeroImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Dosya boyutu 5MB\'dan küçük olmalıdır' });
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Sadece resim dosyaları yüklenebilir' });
      return;
    }

    try {
      setUploadingHero(true);
      setMessage(null);

      const formData = new FormData();
      formData.append('image', file);

            // Önce hero endpoint'i dene, olmazsa mevcut endpoint'i kullan
      let response;
      try {
        response = await fetch('http://localhost:5000/api/about-page/upload-hero', {
          method: 'POST',
          body: formData,
        });
      } catch (error) {
        console.log('Hero endpoint başarısız, mevcut endpoint deneniyor...');
        response = await fetch('http://localhost:5000/api/solution-extra-content/upload', {
          method: 'POST',
          body: formData,
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const imageUrl = result.url || result.path;

      setFormData(prev => ({ ...prev, heroImageUrl: imageUrl }));
      setMessage({ type: 'success', text: 'Hero resim başarıyla yüklendi!' });

    } catch (error) {
      console.error('Hero image upload error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Resim yüklenirken hata oluştu' 
      });
    } finally {
      setUploadingHero(false);
      // Input'u temizle
      event.target.value = '';
    }
  };

  const handleDeleteExtraContent = async (contentId: number) => {
    // Önce hangi order'a ait olduğunu bul
    const contentToDelete = aboutPageData?.extraContents.find(content => content.id === contentId);
    if (!contentToDelete) return;

    const orderToDelete = contentToDelete.order;

    // Aynı order'a sahip tüm dil versiyonlarını bul
    const contentsToDelete = aboutPageData?.extraContents.filter(content => content.order === orderToDelete) || [];
    
    // Hangi dillerin silineceğini göster
    const languagesToDelete = contentsToDelete.map(content => {
      const langNames = { tr: 'Türkçe', en: 'İngilizce', de: 'Almanca', fr: 'Fransızca' };
      return langNames[content.language as keyof typeof langNames] || content.language;
    }).join(', ');

    const confirmMessage = `Bu içeriği ve tüm dil versiyonlarını silmek istediğinizden emin misiniz?\n\nSilinecek diller: ${languagesToDelete}\n\nBu işlem geri alınamaz!`;
    
    if (!confirm(confirmMessage)) return;

    setDeleting(true);
    setMessage(null);

    try {
      // Backend sunucusunun çalışıp çalışmadığını kontrol et
      const healthCheck = await fetch('http://localhost:5000/api/about-page', {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 saniye timeout
      }).catch(() => null);

      if (!healthCheck || !healthCheck.ok) {
        throw new Error('Backend sunucusuna bağlanılamıyor. Lütfen sunucunun çalıştığından emin olun.');
      }

      // Tüm dil versiyonlarını paralel olarak sil
      const deletePromises = contentsToDelete.map(async (content) => {
        try {
          const response = await fetch(`http://localhost:5000/api/about-page-extra-content/${content.id}`, {
            method: 'DELETE',
            signal: AbortSignal.timeout(10000) // 10 saniye timeout
          });
          
          if (!response.ok) {
            throw new Error(`ID ${content.id} silinemedi: ${response.status}`);
          }
          
          return { success: true, id: content.id, language: content.language };
        } catch (error) {
          console.error(`Silme hatası ID ${content.id}:`, error);
          return { success: false, id: content.id, language: content.language, error };
        }
      });

      const results = await Promise.all(deletePromises);
      
      // Sonuçları analiz et
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      if (failed.length === 0) {
        // Tüm silme işlemleri başarılı
        await fetchAboutPageData();
        setMessage({ 
          type: 'success', 
          text: `${successful.length} dil versiyonu (${languagesToDelete}) başarıyla silindi!` 
        });
      } else if (successful.length > 0) {
        // Bazıları başarılı, bazıları başarısız
        await fetchAboutPageData();
        setMessage({ 
          type: 'error', 
          text: `${successful.length} dil versiyonu silindi, ${failed.length} dil versiyonu silinemedi. Lütfen tekrar deneyin.` 
        });
      } else {
        // Hiçbiri başarılı değil
        throw new Error('Tüm silme işlemleri başarısız oldu');
      }
    } catch (error) {
      console.error('Error deleting extra content:', error);
      const errorMessage = error instanceof Error ? error.message : 'Silme sırasında hata oluştu';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">İletişim Sayfası Yönetimi</h1>
        <p className="text-gray-600">Sayfa ana bilgilerini ve ekstra içerikleri yönetin</p>
      </div>

      {/* Ana Sayfa Bilgileri */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ana Sayfa Bilgileri</h2>
        
        {/* Hero Resim */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hero Resim
          </label>
          
          {/* Mevcut Resim */}
          {formData.heroImageUrl && (
            <div className="mb-4">
              <div className="relative inline-block">
                <img 
                  src={formData.heroImageUrl.startsWith('http') ? formData.heroImageUrl : `http://localhost:5000${formData.heroImageUrl}`}
                  alt="Hero Preview" 
                  className="w-64 h-40 object-cover rounded-lg border-2 border-gray-200 shadow-md"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <button
                  onClick={() => setFormData(prev => ({ ...prev, heroImageUrl: '' }))}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                  title="Resmi Kaldır"
                >
                  ×
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <p className="text-xs text-gray-500">Mevcut resim</p>
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {formData.heroImageUrl.startsWith('http') ? 'Harici URL' : 'Yüklenen Resim'}
                </span>
              </div>
            </div>
          )}

          {/* Upload Alanı */}
          <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            uploadingHero 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400'
          }`}>
            <input
              type="file"
              accept="image/*"
              onChange={handleHeroImageUpload}
              className="hidden"
              id="hero-image-upload"
              disabled={uploadingHero}
            />
            <label 
              htmlFor="hero-image-upload" 
              className={`cursor-pointer flex flex-col items-center ${
                uploadingHero ? 'cursor-not-allowed opacity-75' : ''
              }`}
            >
              {uploadingHero ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-2"></div>
                  <span className="text-sm font-medium text-blue-700">
                    Yükleniyor...
                  </span>
                  <span className="text-xs text-blue-500 mt-1">
                    Lütfen bekleyin
                  </span>
                </>
              ) : (
                <>
                  <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    {formData.heroImageUrl ? 'Resmi Değiştir' : 'Resim Yükle'}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PNG, JPG, WEBP (Max: 5MB)
                  </span>
                </>
              )}
            </label>
          </div>

          {/* URL Input (Alternatif) */}
          <div className="mt-4">
            <label className="block text-xs text-gray-600 mb-1">
              Veya URL ile ekle:
            </label>
            <input
              type="text"
              value={formData.heroImageUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, heroImageUrl: e.target.value }))}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

                    {/* Hero Image Bilgileri */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="text-sm font-medium text-blue-800 mb-2">💡 Hero Resim Özellikleri</h5>
            <div className="text-xs text-blue-700 space-y-1">
              <p>• <strong>Önerilen boyut:</strong> 1920x600px (16:5 oranı)</p>
              <p>• <strong>Format:</strong> PNG, JPG, WEBP</p>
              <p>• <strong>Maksimum boyut:</strong> 5MB</p>
              <p>• <strong>Kullanım:</strong> Sayfa üstünde tam genişlik banner</p>
              <p>• <strong>Kayıt yeri:</strong> Pages klasörü (/uploads/Pages/)</p>
            </div>
          </div>
        </div>

        {/* Dil Sekmeleri */}
        <div className="space-y-6">
          {(['tr', 'en', 'de', 'fr'] as const).map((language) => (
            <div key={language} className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <span className="mr-2">
                  {language === 'tr' && '🇹🇷'}
                  {language === 'en' && '🇬🇧'}
                  {language === 'de' && '🇩🇪'}
                  {language === 'fr' && '🇫🇷'}
                </span>
                {language === 'tr' && 'Türkçe'}
                {language === 'en' && 'İngilizce'}
                {language === 'de' && 'Almanca'}
                {language === 'fr' && 'Fransızca'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Başlık
                  </label>
                  <input
                    type="text"
                    value={formData.translations[language].title}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      translations: {
                        ...prev.translations,
                        [language]: { ...prev.translations[language], title: e.target.value }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alt Başlık
                  </label>
                  <input
                    type="text"
                    value={formData.translations[language].subtitle}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      translations: {
                        ...prev.translations,
                        [language]: { ...prev.translations[language], subtitle: e.target.value }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ana İçerik
                </label>
                <div className="border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500">
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className="min-h-[100px] px-3 py-2 outline-none prose prose-sm max-w-none"
                    onInput={(e) => {
                      const content = e.currentTarget.innerHTML;
                      setFormData(prev => ({
                        ...prev,
                        translations: {
                          ...prev.translations,
                          [language]: { ...prev.translations[language], bodyHtml: content }
                        }
                      }));
                    }}
                    dangerouslySetInnerHTML={{
                      __html: formData.translations[language].bodyHtml || ''
                    }}
                  />
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <span>💡 Rich text: Kalın, italik, link ekleyebilirsiniz</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        translations: {
                          ...prev.translations,
                          [language]: { ...prev.translations[language], bodyHtml: '' }
                        }
                      }));
                    }}
                    className="text-red-500 hover:text-red-700 underline"
                  >
                    Temizle
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Kaydet Butonu */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Kaydediliyor...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Kaydet
              </>
            )}
          </button>
        </div>
      </div>

      {/* Ekstra İçerikler */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Ekstra İçerikler</h2>
          <button
            onClick={() => setShowExtraContentAdder(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Yeni İçerik Ekle
          </button>
        </div>

        {/* Mevcut Ekstra İçerikler - Düzenli Liste Formatında */}
        {aboutPageData?.extraContents && aboutPageData.extraContents.length > 0 ? (
          <div className="overflow-hidden">
            {/* Bilgi Kutusu */}
            <div className="bg-blue-50 border border-blue-200 px-4 py-3 mb-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Toplu İşlemler Hakkında</p>
                  <p className="text-blue-700">
                    • <strong>Düzenle:</strong> Herhangi bir dildeki içeriği düzenleyerek tüm dillerdeki versiyonları güncelleyebilirsiniz.<br/>
                    • <strong>Sil:</strong> Bir içeriği sildiğinizde, o içeriğin tüm dil versiyonları (TR, EN, DE, FR) tek seferde silinir.
                  </p>
                </div>
              </div>
            </div>

            {/* Tablo Başlığı */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                <div className="col-span-2">İÇERİK</div>
                <div className="col-span-2">TR</div>
                <div className="col-span-2">EN</div>
                <div className="col-span-2">DE</div>
                <div className="col-span-2">FR</div>
                <div className="col-span-2">TOPLU</div>
              </div>
            </div>

            {/* İçerik Listesi */}
            <div className="divide-y divide-gray-200">
              {groupContentsByOrder().map((group) => (
                <div key={group.order} className="px-4 py-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* İçerik Numarası ve Türü */}
                    <div className="col-span-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          İçerik {group.order + 1}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {group.languages['tr']?.type === 'text' && 'Metin'}
                        {group.languages['tr']?.type === 'table' && 'Tablo'}
                        {group.languages['tr']?.type === 'image' && 'Resim'}
                        {group.languages['tr']?.type === 'mixed' && 'Karışık'}
                        {group.languages['tr']?.type === 'list' && 'Liste'}
                      </div>
                    </div>

                    {/* Türkçe İçerik */}
                    <div className="col-span-2">
                      {group.languages['tr'] ? (
                        <div>
                          <div className="text-sm text-gray-900 font-medium">
                            #{group.languages['tr'].id}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {group.languages['tr'].title.length > 20 
                              ? `${group.languages['tr'].title.substring(0, 20)}...` 
                              : group.languages['tr'].title
                            }
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {group.languages['tr'].content.length > 30 
                              ? `${group.languages['tr'].content.substring(0, 30)}...` 
                              : group.languages['tr'].content
                            }
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">-</div>
                      )}
                    </div>

                    {/* İngilizce İçerik */}
                    <div className="col-span-2">
                      {group.languages['en'] ? (
                        <div>
                          <div className="text-sm text-gray-900 font-medium">
                            #{group.languages['en'].id}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {group.languages['en'].title.length > 20 
                              ? `${group.languages['en'].title.substring(0, 20)}...` 
                              : group.languages['en'].title
                            }
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {group.languages['en'].content.length > 30 
                              ? `${group.languages['en'].content.substring(0, 30)}...` 
                              : group.languages['en'].content
                            }
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">-</div>
                      )}
                    </div>

                    {/* Almanca İçerik */}
                    <div className="col-span-2">
                      {group.languages['de'] ? (
                        <div>
                          <div className="text-sm text-gray-900 font-medium">
                            #{group.languages['de'].id}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {group.languages['de'].title.length > 20 
                              ? `${group.languages['de'].title.substring(0, 20)}...` 
                              : group.languages['de'].title
                            }
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {group.languages['de'].content.length > 30 
                              ? `${group.languages['de'].content.substring(0, 30)}...` 
                              : group.languages['de'].content
                            }
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">-</div>
                      )}
                    </div>

                    {/* Fransızca İçerik */}
                    <div className="col-span-2">
                      {group.languages['fr'] ? (
                        <div>
                          <div className="text-sm text-gray-900 font-medium">
                            #{group.languages['fr'].id}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {group.languages['fr'].title.length > 20 
                              ? `${group.languages['fr'].title.substring(0, 20)}...` 
                              : group.languages['fr'].title
                            }
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {group.languages['fr'].content.length > 30 
                              ? `${group.languages['fr'].content.substring(0, 30)}...` 
                              : group.languages['fr'].content
                            }
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">-</div>
                      )}
                    </div>

                                         {/* Toplu İşlemler */}
                     <div className="col-span-2">
                       <div className="flex space-x-2">
                         <button
                           onClick={() => {
                             // Mevcut olan ilk dili düzenle
                             const availableLanguage = Object.keys(group.languages)[0];
                             if (availableLanguage) {
                               handleEditExtraContent(group.languages[availableLanguage]);
                             }
                           }}
                           className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center"
                           title="Tüm dil versiyonlarını düzenle"
                         >
                           <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                           </svg>
                           Düzenle
                         </button>
                         
                         <div className="flex items-center space-x-1">
                           <button
                             onClick={() => {
                               // Mevcut olan ilk dili sil
                               const availableLanguage = Object.keys(group.languages)[0];
                               if (availableLanguage) {
                                 handleDeleteExtraContent(group.languages[availableLanguage].id);
                               }
                             }}
                             disabled={deleting}
                             className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                             title="Tüm dil versiyonlarını sil"
                           >
                             {deleting ? (
                               <>
                                 <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                 Siliniyor...
                               </>
                             ) : (
                               <>
                                 <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                 </svg>
                                 Sil
                               </>
                             )}
                           </button>
                           
                           {/* Bilgi ikonu */}
                           <div className="relative group">
                             <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                             
                             {/* Tooltip */}
                             <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                               Tüm dil versiyonları tek seferde silinir
                               <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Toplam İçerik Sayısı */}
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Toplam {groupContentsByOrder().length} içerik grubu
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>Henüz ekstra içerik eklenmemiş</p>
            <p className="text-sm">Yeni içerik eklemek için yukarıdaki butonu kullanın</p>
          </div>
        )}
      </div>

      {/* Mesaj */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Ekstra İçerik Ekleme Modal */}
      {showExtraContentAdder && (
        <AboutPageExtraContentAdder
          onContentAdded={handleExtraContentAdded}
          onCancel={() => {
            setShowExtraContentAdder(false);
            setEditingExtraContent(null);
          }}
          editingContent={editingExtraContent}
          currentMaxOrder={aboutPageData?.extraContents ? Math.max(...aboutPageData.extraContents.map(c => c.order)) : 0}
          aboutPageData={aboutPageData}
        />
      )}
    </div>
  );
};

export default AboutPageManager;

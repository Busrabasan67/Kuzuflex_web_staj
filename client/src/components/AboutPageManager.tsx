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
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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
          slug: 'about-us',
          heroImageUrl: '',
          translations: [
            { language: 'tr', title: 'Hakkımızda', subtitle: 'Kuzuflex\'in Hikayesi', bodyHtml: '<p>Kuzuflex hakkında bilgi...</p>' },
            { language: 'en', title: 'About Us', subtitle: 'The Story of Kuzuflex', bodyHtml: '<p>Information about Kuzuflex...</p>' },
            { language: 'de', title: 'Über Uns', subtitle: 'Die Geschichte von Kuzuflex', bodyHtml: '<p>Informationen über Kuzuflex...</p>' },
            { language: 'fr', title: 'À Propos', subtitle: 'L\'Histoire de Kuzuflex', bodyHtml: '<p>Informations sur Kuzuflex...</p>' }
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
    setEditingExtraContent(content);
    setShowExtraContentAdder(true);
  };

  const handleDeleteExtraContent = async (contentId: number) => {
    if (!confirm('Bu içeriği silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/about-page-extra-content/${contentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchAboutPageData();
        setMessage({ type: 'success', text: 'İçerik silindi!' });
      }
    } catch (error) {
      console.error('Error deleting extra content:', error);
      setMessage({ type: 'error', text: 'Silme sırasında hata oluştu' });
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hakkımızda Sayfası Yönetimi</h1>
        <p className="text-gray-600">Sayfa ana bilgilerini ve ekstra içerikleri yönetin</p>
      </div>

      {/* Ana Sayfa Bilgileri */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ana Sayfa Bilgileri</h2>
        
        {/* Hero Resim */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hero Resim URL
          </label>
          <input
            type="text"
            value={formData.heroImageUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, heroImageUrl: e.target.value }))}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {formData.heroImageUrl && (
            <div className="mt-2">
              <img 
                src={formData.heroImageUrl} 
                alt="Hero Preview" 
                className="w-32 h-20 object-cover rounded border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
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
                <textarea
                  value={formData.translations[language].bodyHtml}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    translations: {
                      ...prev.translations,
                      [language]: { ...prev.translations[language], bodyHtml: e.target.value }
                    }
                  }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ana sayfa içeriğini yazın..."
                />
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

        {/* Mevcut Ekstra İçerikler */}
        {aboutPageData?.extraContents && aboutPageData.extraContents.length > 0 ? (
          <div className="space-y-4">
            {aboutPageData.extraContents
              .sort((a, b) => a.order - b.order)
              .map((content) => (
                <div key={content.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          {content.type}
                        </span>
                        <span className="text-sm text-gray-500">
                          {content.language === 'tr' && '🇹🇷 Türkçe'}
                          {content.language === 'en' && '🇬🇧 İngilizce'}
                          {content.language === 'de' && '🇩🇪 Almanca'}
                          {content.language === 'fr' && '🇫🇷 Fransızca'}
                        </span>
                        <span className="text-sm text-gray-500">Sıra: {content.order}</span>
                      </div>
                      <h4 className="font-medium text-gray-900">{content.title}</h4>
                      <div className="text-sm text-gray-600 mt-1">
                        {content.content.length > 100 
                          ? `${content.content.substring(0, 100)}...` 
                          : content.content
                        }
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditExtraContent(content)}
                        className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDeleteExtraContent(content.id)}
                        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
        />
      )}
    </div>
  );
};

export default AboutPageManager;
